#!/bin/bash
# One-shot setup for the VBloom site on an Oracle Linux 8/9 VM (e.g. one created
# by hand in the OCI console). Run as root:
#   curl -fsSL <raw URL of this file> | sudo bash
# Optional: DOMAIN=vbloom.com BRANCH=main before `bash` to override the defaults.
set -euxo pipefail
exec > >(tee -a /var/log/vbloom-setup.log) 2>&1

REPO_URL="${REPO_URL:-https://github.com/ssvenkateshs/vbloom.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-}"

# Firewall: allow the web ports through firewalld.
if systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http --add-service=https
  firewall-cmd --reload
fi

# The 1 GB Micro shape needs swap to build Next.js.
if [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

dnf install -y git curl tar
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

# Caddy (HTTPS reverse proxy) as a single static binary.
case "$(uname -m)" in
  aarch64) ARCH=arm64 ;;
  *) ARCH=amd64 ;;
esac
curl -fsSL -o /usr/local/bin/caddy "https://caddyserver.com/api/download?os=linux&arch=$ARCH"
chmod 755 /usr/local/bin/caddy
restorecon -v /usr/local/bin/caddy 2>/dev/null || true
id caddy >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/caddy --shell /sbin/nologin caddy

if [ -z "$DOMAIN" ]; then
  IP=$(curl -fsS https://api.ipify.org)
  DOMAIN="${IP//./-}.sslip.io"
fi

id vbloom >/dev/null 2>&1 || useradd --system --create-home --home-dir /srv/vbloom vbloom
chmod 755 /srv/vbloom
[ -d /srv/vbloom/app ] || sudo -u vbloom git clone --branch "$BRANCH" "$REPO_URL" /srv/vbloom/app

cat > /usr/local/bin/vbloom-update <<UPDATE
#!/bin/bash
# Pull the latest code, rebuild and restart. Run with sudo.
set -euo pipefail
cd /srv/vbloom/app
sudo -u vbloom git fetch origin $BRANCH
sudo -u vbloom git reset --hard origin/$BRANCH
sudo -u vbloom env NEXT_PUBLIC_SITE_URL=https://$DOMAIN npm ci
sudo -u vbloom env NEXT_PUBLIC_SITE_URL=https://$DOMAIN NEXT_TELEMETRY_DISABLED=1 npm run build
systemctl restart vbloom
UPDATE
chmod +x /usr/local/bin/vbloom-update

cat > /etc/systemd/system/vbloom.service <<UNIT
[Unit]
Description=VBloom website (Next.js)
After=network.target

[Service]
User=vbloom
WorkingDirectory=/srv/vbloom/app
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
ExecStart=/usr/bin/npm start -- --port 3000 --hostname 127.0.0.1
Restart=always

[Install]
WantedBy=multi-user.target
UNIT

mkdir -p /etc/caddy
cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
CADDY

cat > /etc/systemd/system/caddy.service <<UNIT
[Unit]
Description=Caddy web server
After=network-online.target
Wants=network-online.target

[Service]
User=caddy
Group=caddy
ExecStart=/usr/local/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile --force
AmbientCapabilities=CAP_NET_BIND_SERVICE
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable vbloom caddy
/usr/local/bin/vbloom-update
systemctl restart caddy
echo "VBloom is live at https://$DOMAIN"

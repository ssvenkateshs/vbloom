#!/bin/bash
# First-boot setup for the VBloom site: Node, the production build, a systemd
# service and Caddy for HTTPS. Log: /var/log/vbloom-setup.log
set -euxo pipefail
exec > >(tee -a /var/log/vbloom-setup.log) 2>&1

REPO_URL="${repo_url}"
BRANCH="${branch}"
DOMAIN="${domain}"

# Oracle's Ubuntu images reject inbound traffic in iptables except SSH.
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
netfilter-persistent save

# The 1 GB Micro shape needs swap to build Next.js.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

if [ -z "$DOMAIN" ]; then
  IP=$(curl -fsS https://api.ipify.org)
  DOMAIN="$${IP//./-}.sslip.io"
fi

id vbloom >/dev/null 2>&1 || useradd --system --create-home --home-dir /srv/vbloom vbloom
sudo -u vbloom git clone --branch "$BRANCH" "$REPO_URL" /srv/vbloom/app

cat > /etc/vbloom.env <<ENV
REPO_URL=$REPO_URL
BRANCH=$BRANCH
DOMAIN=$DOMAIN
ENV
install -m 755 /srv/vbloom/app/deploy/oci/vbloom-update.sh /usr/local/bin/vbloom-update

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

cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
CADDY

systemctl daemon-reload
systemctl enable vbloom
/usr/local/bin/vbloom-update
systemctl restart caddy
echo "VBloom is live at https://$DOMAIN"

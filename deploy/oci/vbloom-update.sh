#!/bin/bash
# Rebuild the site from the latest code without taking it down: build a fresh
# copy beside the live one, swap the folders, then restart. A failed build
# leaves the live site untouched. Run as root (sudo vbloom-update).
set -euo pipefail

[ -f /etc/vbloom.env ] && . /etc/vbloom.env
REPO_URL="${REPO_URL:-https://github.com/ssvenkateshs/vbloom.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-$(awk 'NR == 1 { print $1 }' /etc/caddy/Caddyfile)}"

root=/srv/vbloom
staging="$root/app.next"

rm -rf "$staging"
sudo -u vbloom git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$staging"
cd "$staging"
sudo -u vbloom env NEXT_PUBLIC_SITE_URL="https://$DOMAIN" npm ci --no-audit --no-fund
sudo -u vbloom env NEXT_PUBLIC_SITE_URL="https://$DOMAIN" NEXT_TELEMETRY_DISABLED=1 npm run build

rm -rf "$root/app.old"
[ -d "$root/app" ] && mv "$root/app" "$root/app.old"
mv "$staging" "$root/app"
systemctl restart vbloom

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null http://127.0.0.1:3000 && break
  sleep 2
done
rm -rf "$root/app.old"
echo "Deployed $(git -C "$root/app" rev-parse --short HEAD) to https://$DOMAIN"

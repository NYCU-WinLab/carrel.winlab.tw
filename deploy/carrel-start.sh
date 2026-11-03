#!/bin/sh
# carrel-deployd (from land) runs this from the release directory on every
# deploy and rollback. It points the Compose stack in /opt/carrel-site at
# the image in VERSION, reports ready once web is healthy, then follows the
# web logs. The unit needs Type=notify and NotifyAccess=all.
set -eu

version=$(cat VERSION)
# The release carries the stack's compose.yaml, so the repo is its source.
if [ -f compose.yaml ]; then
  cp compose.yaml /opt/carrel-site/compose.yaml.new
  mv /opt/carrel-site/compose.yaml.new /opt/carrel-site/compose.yaml
fi
cd /opt/carrel-site

tmp=$(mktemp .env.XXXXXX)
sed "s/^SITE_VERSION=.*/SITE_VERSION=$version/" .env >"$tmp"
chmod 600 "$tmp"
mv "$tmp" .env

# Another stack on the VM may pull at the same moment, and containerd then
# fails a commit now and then; a second try gets it.
for try in 1 2 3; do
  docker compose pull --quiet web && break
  [ "$try" = 3 ] && exit 1
  sleep 2
done
docker compose up -d --wait web
systemd-notify --ready
exec docker compose logs -f --since 1s web

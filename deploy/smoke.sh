#!/usr/bin/env bash
# The image as deployed: serve the page, a real 404, and fill the commit into
# the version corner at run time. ci runs it with the image loaded as
# ghcr.io/nycu-winlab/carrel.winlab.tw:ci.
set -euo pipefail
trap 'docker compose logs' EXIT
# A negated test (! cmd) never trips set -e, so absence is checked here.
absent() { if grep -qiF "$1"; then echo "unexpected $1 in $2" >&2; exit 1; fi; }
# The page is large: grep -q stops early and curl would fail on the closed
# pipe, so each page is fetched once into a variable.
has() { grep -qF "$1" <<<"$2" || { echo "missing $1 in $3" >&2; exit 1; }; }

printf 'SITE_VERSION=ci\n' > .env
docker compose up -d --no-build --wait

page=$(curl -sf localhost:8080/)
for text in Carrel claudeai-nycu-winlab-marketplace carrel-figure 叢集狀態 '>dev<'; do has "$text" "$page" /; done
absent __BUILD_SHA__ / <<<"$page"
test "$(curl -s -o /dev/null -w '%{http_code}' localhost:8080/missing)" = 404
curl -sI localhost:8080/ | absent "server: nginx/" headers

# A release: the corner reads the commit, in the page and in its scripts.
docker compose run --rm -d -e SITE_VERSION=sha-abc1234 -p 127.0.0.1:8081:8080 web >/dev/null
for i in $(seq 1 20); do curl -sf localhost:8081/ >/dev/null && break; sleep 0.5; done
release=$(curl -sf localhost:8081/)
has '>abc1234<' "$release" /
absent __BUILD_SHA__ / <<<"$release"
for js in $(grep -o '/_next/static/[^"]*\.js' <<<"$release" | sort -u); do
  script=$(curl -sf "localhost:8081$js")
  absent __BUILD_SHA__ "$js" <<<"$script"
done
echo "smoke passed"

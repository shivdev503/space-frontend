#!/usr/bin/env bash
# Runs on the EC2 server, called by .github/workflows/deploy.yml.
# Usage: remote-deploy.sh <release-id> <path-to-tarball>
set -euo pipefail

# Non-interactive SSH skips ~/.bashrc, so load nvm (when Node was installed with it) to find node and pm2.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
command -v pm2 >/dev/null || { echo "pm2 not found on PATH ($PATH)" >&2; exit 1; }

APP_DIR=/var/www/spacewallah-web
RELEASE_ID="$1"
TARBALL="$2"
RELEASE="$APP_DIR/releases/$RELEASE_ID"
KEEP=5
PAGE_CACHE=/var/cache/nginx/spacewallah

# Cached pages point at this build's JS files, which the next build no longer serves: empty the
# nginx page cache (deploy/nginx-page-cache.conf) whenever a different build goes live.
purge_page_cache() {
  [ -d "$PAGE_CACHE" ] || return 0
  if sudo -n find "$PAGE_CACHE" -mindepth 1 -delete 2>/dev/null; then
    echo "Emptied page cache"
  else
    echo "WARNING: could not empty $PAGE_CACHE (needs passwordless sudo); cached pages may load old JS for up to 10 minutes" >&2
  fi
}

mkdir -p "$RELEASE"
tar -xzf "$TARBALL" -C "$RELEASE"
rm -f "$TARBALL"

PREVIOUS="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"
ln -sfn "$RELEASE" "$APP_DIR/current"

pm2 startOrReload "$RELEASE/ecosystem.config.cjs" --update-env

# Wait for the new build to answer; roll back to the previous release if it never does.
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    pm2 save >/dev/null
    purge_page_cache
    echo "Live: $RELEASE_ID"
    # Keep the newest releases for quick rollback, delete the rest.
    ls -1dt "$APP_DIR"/releases/* | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    exit 0
  fi
  sleep 2
done

echo "New release did not respond on port 3000." >&2
pm2 logs spacewallah-web --lines 40 --nostream >&2 || true
if [ -n "$PREVIOUS" ] && [ "$PREVIOUS" != "$RELEASE" ]; then
  echo "Rolling back to $PREVIOUS" >&2
  ln -sfn "$PREVIOUS" "$APP_DIR/current"
  pm2 startOrReload "$PREVIOUS/ecosystem.config.cjs" --update-env
  purge_page_cache
fi
exit 1

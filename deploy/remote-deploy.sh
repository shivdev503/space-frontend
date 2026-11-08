#!/usr/bin/env bash
# Runs on the EC2 server, called by .github/workflows/deploy.yml.
# Usage: remote-deploy.sh <release-id> <path-to-tarball>
set -euo pipefail

APP_DIR=/var/www/spacewallah-web
RELEASE_ID="$1"
TARBALL="$2"
RELEASE="$APP_DIR/releases/$RELEASE_ID"
KEEP=5

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
fi
exit 1

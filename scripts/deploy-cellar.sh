#!/usr/bin/env bash
#
# Deploy the static site to Clever Cloud Cellar (S3-compatible object storage).
# Adapted from zats-greenscore/scripts/deploy-cellar.sh.
#
# Why this script exists
# ----------------------
# Astro is a multi-page app: each route is a separate HTML file
# (`timeline/index.html`, `contributors/emmanuel/index.html`, ...). Cellar
# resolves trailing-slash requests natively (`/timeline/` serves
# `timeline/index.html`, verified in production), which covers every internal
# link of this site. Extensionless requests (`/timeline`, typed by hand) do
# NOT resolve, so every generated "<route>/index.html" is also uploaded as an
# extensionless alias key "<route>" served as text/html. All Cellar specifics
# live HERE — the Astro project stays 100% standard.
#
# Usage
# -----
#   ./scripts/deploy-cellar.sh
#
# Locally it uses your ~/.s3cfg (s3cmd --configure). In CI, provide:
#   CELLAR_ADDON_KEY_ID, CELLAR_ADDON_KEY_SECRET  (S3 credentials)
#   CELLAR_BUCKET                                 (defaults to the value below)
#
set -euo pipefail

BUCKET="${CELLAR_BUCKET:-techwatcher.zatsit.fr}"
DIST="dist"
HOST="cellar-c2.services.clever-cloud.com"

# Force path-style addressing: bucket names with dots break virtual-hosted TLS
# (the *.cellar-c2 wildcard cert covers a single label only).
S3CMD_OPTS=(--host="$HOST" --host-bucket="$HOST")
if [[ -n "${CELLAR_ADDON_KEY_ID:-}" ]]; then
  S3CMD_OPTS+=(--access_key="$CELLAR_ADDON_KEY_ID" --secret_key="${CELLAR_ADDON_KEY_SECRET:-}")
fi

echo "==> Building (standard Astro)"
npm run build

# Incremental, zero-downtime publish: additively upload changed objects first,
# refresh the aliases in place, then prune only true orphans at the end. Live
# objects are never deleted-then-recreated, so no request ever 403s mid-deploy.

echo "==> Uploading $DIST/ to s3://$BUCKET/ (additive: new/changed only)"
s3cmd "${S3CMD_OPTS[@]}" sync "$DIST/" "s3://$BUCKET/" \
  --acl-public --no-mime-magic --guess-mime-type

echo "==> Refreshing extensionless aliases so bare links (/timeline, /stats) resolve"
# Cellar resolves "/route/" natively but not "/route". Every sub-route page
# (dist/<route>/index.html) is also uploaded as the extensionless key
# "<route>", served as text/html (overwrite in place, no gap). The root
# (dist/index.html) is left as-is: Cellar already serves it at "/".
aliases=()
while IFS= read -r file; do
  route="${file#"$DIST"/}"        # e.g. timeline/index.html
  key="${route%/index.html}"      # e.g. timeline
  s3cmd "${S3CMD_OPTS[@]}" put "$file" "s3://$BUCKET/$key" \
    --mime-type=text/html --acl-public >/dev/null
  aliases+=("$key")
  echo "    + $key"
done < <(find "$DIST" -mindepth 2 -name index.html)

echo "==> Pruning orphan objects (stale assets / removed pages)"
# Valid keys = every file in dist/ (relative) + the alias keys above. Any remote
# object not in this set is a leftover from a previous build and is deleted.
valid="$(mktemp)"; remote="$(mktemp)"
( cd "$DIST" && find . -type f | sed 's#^\./##' ) > "$valid"
printf '%s\n' "${aliases[@]}" >> "$valid"
sort -u -o "$valid" "$valid"
s3cmd "${S3CMD_OPTS[@]}" ls --recursive "s3://$BUCKET/" \
  | sed -E "s#.*s3://$BUCKET/##" | sort -u > "$remote"
comm -13 "$valid" "$remote" | while IFS= read -r key; do
  [ -z "$key" ] && continue
  echo "    - $key"
  s3cmd "${S3CMD_OPTS[@]}" del "s3://$BUCKET/$key" >/dev/null
done
rm -f "$valid" "$remote"

# Normalize Cache-Control deterministically on ALL current objects via in-place
# metadata edits (s3cmd modify), independent of whether sync re-uploaded them:
# - everything revalidates by default (HTML pages + aliases: their URLs are
#   not hashed and change on each deploy);
# - /_astro/* is then overridden to immutable (Astro fingerprints those names,
#   so the content is safe to cache for a year).
echo "==> Setting Cache-Control headers"
s3cmd "${S3CMD_OPTS[@]}" modify --recursive "s3://$BUCKET/" --acl-public \
  --add-header='Cache-Control: public, max-age=0, must-revalidate' >/dev/null
s3cmd "${S3CMD_OPTS[@]}" modify --recursive "s3://$BUCKET/_astro/" --acl-public \
  --add-header='Cache-Control: public, max-age=31536000, immutable' >/dev/null

echo "==> Done. https://$BUCKET/"

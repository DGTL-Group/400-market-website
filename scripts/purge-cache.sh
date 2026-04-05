#!/usr/bin/env bash
# purge-cache.sh — Clear Next.js build cache on Hostinger after deploy.
# Run on the Hostinger server via SSH from GitHub Actions.
# Usage: ssh user@host 'bash -s' < scripts/purge-cache.sh [site-path]

set -euo pipefail

SITE_PATH="${1:-$HOME/public_html}"
CACHE_DIR="$SITE_PATH/.next/cache"

echo "==> purge-cache: starting"
echo "    site path : $SITE_PATH"
echo "    cache dir : $CACHE_DIR"
echo "    timestamp : $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

# Verify site directory exists
if [ ! -d "$SITE_PATH" ]; then
  echo "ERROR: site path $SITE_PATH does not exist"
  exit 1
fi

# Clear .next/cache if it exists
if [ -d "$CACHE_DIR" ]; then
  SIZE_BEFORE=$(du -sh "$CACHE_DIR" 2>/dev/null | cut -f1 || echo "unknown")
  echo "    cache size: $SIZE_BEFORE"

  rm -rf "$CACHE_DIR"
  echo "==> .next/cache cleared"
else
  echo "==> .next/cache not found (clean deploy, nothing to purge)"
fi

echo "==> purge-cache: done"

#!/usr/bin/env bash
# Idempotent bootstrap for the static Ezhilagam site.
set -euo pipefail

cd "$(dirname "$0")/../.."

required=(
  index.html
  book.html
  voucher.html
  checkin-slip.html
  _redirects
  img/logo.webp
  img/ke-facade.webp
  release.sh
)

for path in "${required[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "missing required file: $path" >&2
    exit 1
  fi
done

chmod +x release.sh .cursor/scripts/install.sh 2>/dev/null || true

echo "static site ready ($(wc -l < index.html) lines in index.html, $(ls img | wc -l) images)"

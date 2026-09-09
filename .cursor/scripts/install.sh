#!/usr/bin/env bash
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
  if [[ ! -f "$path" ]]; then
    echo "missing required file: $path" >&2
    exit 1
  fi
done

chmod +x release.sh

echo "static site assets verified ($(find img -type f | wc -l) images in img/)"

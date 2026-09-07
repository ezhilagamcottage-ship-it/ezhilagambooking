#!/usr/bin/env bash
# Kutralam Ezhilagam — website release.
#
#   ./release.sh minor "one line describing the change"
#   ./release.sh major "one line describing the change"
#
# Bumps VERSION, writes the changelog entry, refreshes BUILD-MANIFEST.txt and
# produces ezhilagam-site-v<N>.zip.
#
# It does NOT upload and does NOT message. Both of those reach the outside
# world and belong in the assistant's hands, where the sender and the link can
# be checked before anything leaves. The two steps that follow are:
#
#   1. Copy the zip into the Drive-synced folder. The folder is
#
#        G:\My Drive\Ezhilagamweb
#
#      on Rakesh's desktop, which Drive for Desktop syncs to the Drive folder
#      id 17VLKE8-0_vk8Cnq2x68bnr43xDSCjPp7, owned by ezhilagamcottage@gmail.com.
#
#        device_commit_files
#          stagedPath  /mnt/user-data/outputs/ezhilagam-site-v<N>.zip
#          devicePath  G:\My Drive\Ezhilagamweb\ezhilagam-site-v<N>.zip
#
#      Drive for Desktop then uploads it, which is NOT instant — allow about a
#      minute. Poll with search_files on parentId = the folder id above until
#      the zip appears, and check fileSize matches the local byte count before
#      trusting the link; a half-synced file returns a link that downloads a
#      truncated zip. Take the FILE viewUrl, never the folder link.
#
#      Newly synced files inherit no sharing — they are private to
#      ezhilagamcottage. If the link has to open for anyone else, that is a
#      separate share and Rakesh has to ask for it.
#
#   2. Send ONE WhatsApp, from rockyjio, to 9840213184:
#        POST { action:"sendTpl", by:"rakesh", phone:"9840213184", text:"..." }
#      by MUST be lowercase "rakesh" — that is the staff name rockyjio is
#      mapped to in ?action=evostatus. "Rakesh" does not match and the send
#      silently falls through to Lakshmi, so the note arrives from the booking
#      number, which is exactly the number a guest replies to. The reply is
#      only {"ok":true,"row":N} — it does NOT name the instance, so there is no
#      "from" field to read. Confirm the sender the only way available: call
#      ?action=evostatus first and check rockyjio still maps to staff "rakesh"
#      and is open. If that mapping ever changes, the send goes out under
#      whichever instance claims the name, silently.
#
#      One message, carrying the version, the one-line changelog AND the Drive
#      file link together. Not two.
set -euo pipefail
cd "$(dirname "$0")"

KIND="${1:-minor}"; LINE="${2:-}"
[ -z "$LINE" ] && { echo "usage: ./release.sh minor|major \"what changed\""; exit 1; }

CUR=$(cat VERSION)
MAJ=${CUR%%.*}; MIN=${CUR##*.}
if [ "$KIND" = "major" ]; then NEW="$((MAJ+1)).0"; else NEW="$MAJ.$((MIN+1))"; fi
echo "$NEW" > VERSION

DATE=$(TZ=Asia/Kolkata date '+%-d %b %Y')
TMP=$(mktemp)
{ head -n 8 CHANGELOG.md
  printf '\n## v%s — %s\n\n%s\n' "$NEW" "$DATE" "$LINE"
  tail -n +9 CHANGELOG.md
} > "$TMP" && mv "$TMP" CHANGELOG.md

ZIP="/mnt/user-data/outputs/ezhilagam-site-v${NEW}.zip"
rm -f /mnt/user-data/outputs/ezhilagam-site-v*.zip
zip -r -q "$ZIP" index.html book.html voucher.html checkin-slip.html \
    _redirects README.txt CHANGELOG.md VERSION BUILD-MANIFEST.txt release.sh img/ -x ".*"

{ echo "KUTRALAM EZHILAGAM — WEBSITE BUILD MANIFEST"
  echo "version: $NEW"
  echo "built:   $(TZ=Asia/Kolkata date '+%Y-%m-%d %H:%M %Z')"
  echo
  echo "files"
  for f in index.html book.html voucher.html checkin-slip.html _redirects \
           README.txt CHANGELOG.md VERSION; do
    printf '  %-20s %8s bytes  sha256 %s\n' "$f" "$(stat -c%s "$f")" \
           "$(sha256sum "$f" | cut -c1-16)"
  done
  printf '  %-20s %8s bytes  (%s files)\n' "img/" "$(du -sb img | cut -f1)" "$(ls img | wc -l)"
  printf '\nbundle\n  %s  %s bytes\n  sha256 %s\n' \
    "ezhilagam-site-v${NEW}.zip" "$(stat -c%s "$ZIP")" "$(sha256sum "$ZIP" | cut -c1-64)"
} > BUILD-MANIFEST.txt

echo "v$NEW  ->  $(du -h "$ZIP" | cut -f1)  $ZIP"
echo
echo "NEXT (both by hand, deliberately):"
echo "  1. commit the zip to  G:\\My Drive\\Ezhilagamweb\\ezhilagam-site-v${NEW}.zip"
echo "     wait for Drive to sync it, check the size matches, take the FILE link"
echo "  2. one message, by:\"rakesh\" (lowercase), to 9840213184:"
echo
echo "     Ezhilagam website v${NEW} - ${LINE} - <drive file link>"

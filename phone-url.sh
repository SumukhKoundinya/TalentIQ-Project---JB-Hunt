#!/usr/bin/env bash
# Print the phone URL + open a QR for TalentIQ LAN access.
set -euo pipefail
PORT="${PORT:-8000}"
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [[ -z "${IP}" ]]; then
  echo "No Wi‑Fi IP found. Connect this Mac to Wi‑Fi (or your phone hotspot) first."
  exit 1
fi
URL="http://${IP}:${PORT}/"
echo ""
echo "On your phone open:"
echo "  ${URL}"
echo ""
echo "If that says unreachable (common on school/work Wi‑Fi):"
echo "  1) On your iPhone: Settings → Personal Hotspot → On"
echo "  2) Connect this Mac to that hotspot"
echo "  3) Run this script again and open the new URL on your phone"
echo ""
# Open a QR code page so the phone can scan it
open "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$URL")"
open "$URL"

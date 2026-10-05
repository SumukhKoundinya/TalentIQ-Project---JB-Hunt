#!/usr/bin/env bash
# Writes phone-ip.json so phone-hotspot.html can show a live URL/QR.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/phone-ip.json"
PORT="${PORT:-8000}"

is_hotspot_ip() {
  local ip="$1"
  # iPhone Personal Hotspot commonly hands out 172.20.10.x
  # Android hotspots often use 192.168.43.x or 192.168.137.x
  case "$ip" in
    172.20.10.*) return 0 ;;
    192.168.43.*) return 0 ;;
    192.168.137.*) return 0 ;;
    192.168.2.*) return 0 ;;
    *) return 1 ;;
  esac
}

prev=""
while true; do
  ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
  hotspot=false
  url=""
  if [[ -n "$ip" ]]; then
    url="http://${ip}:${PORT}/"
    if is_hotspot_ip "$ip"; then hotspot=true; fi
  fi
  printf '{"ip":"%s","url":"%s","hotspot":%s,"ts":%s}\n' \
    "${ip}" "${url}" "${hotspot}" "$(date +%s)" > "$OUT.tmp"
  mv "$OUT.tmp" "$OUT"
  if [[ "$ip" != "$prev" && -n "$ip" ]]; then
    echo "[phone-ip] $ip  hotspot=$hotspot  $url"
    if [[ "$hotspot" == "true" ]]; then
      open "$url" 2>/dev/null || true
      open "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$url")" 2>/dev/null || true
    fi
    prev="$ip"
  fi
  sleep 2
done

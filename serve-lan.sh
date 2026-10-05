#!/usr/bin/env bash
# Serve TalentIQ on the local network so phones can open it.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo "Starting TalentIQ on all interfaces…"
echo "  This Mac:   http://127.0.0.1:${PORT}/"
if [[ -n "${LAN_IP}" ]]; then
  echo "  Your phone: http://${LAN_IP}:${PORT}/"
  echo "  (Same Wi‑Fi as this Mac required)"
fi

if [[ -x .venv-ml/bin/uvicorn ]]; then
  exec .venv-ml/bin/uvicorn ml.server:app --host "${HOST}" --port "${PORT}" --reload
fi

exec python3 -m http.server "${PORT}" --bind "${HOST}"

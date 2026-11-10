#!/bin/sh
# Starts a local web server for mon Petit monde! (http://localhost:8765/)
cd "$(dirname "$0")" || exit 1
[ -f css/base.css ] || { echo "css/js/assets folders missing: extract the whole zip first."; exit 1; }
PORT=8765; echo "Open http://localhost:$PORT/  (Ctrl+C to stop)"
if command -v python3 >/dev/null; then exec python3 -m http.server $PORT; else exec python -m http.server $PORT; fi

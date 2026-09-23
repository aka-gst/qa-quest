#!/bin/bash
# Жми дважды — игра сама откроется в браузере. Закрой это окно, чтобы выйти.
cd "$(dirname "$0")"
PORT=8792
while lsof -i tcp:$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
(python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1) &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null" EXIT
sleep 1
open "http://127.0.0.1:$PORT"
echo "QueQuest открылась в браузере."
echo "Закрой это окно (или нажми Ctrl+C), чтобы остановить игру."
wait $SERVER_PID

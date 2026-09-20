#!/usr/bin/env python3
"""Tiny local launcher for QueQuest.

The game uses ES modules, which browsers intentionally block when index.html is
opened as file://. This launcher serves the current folder on loopback only and
opens the game in the default browser.
"""
from __future__ import annotations

import http.server
import os
import socket
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

class ReuseTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

server = ReuseTCPServer(("127.0.0.1", 0), QuietHandler)
port = server.server_address[1]
url = f"http://127.0.0.1:{port}/"
print(f"QueQuest 16.3 FIRSTPERSON: {url}")
print("Оставь это окно открытым, пока тестируешь игру. Ctrl+C — остановить сервер.")
threading.Timer(0.35, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()

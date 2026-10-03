import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app import create_app
from app.sockets import socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print("================================================================")
    print(">> SMART CAMPUS PRE-ORDERING & MANAGEMENT SYSTEM BACKEND STARTED")
    print(f">> REST API Running on: http://localhost:{port}")
    print(f">> Socket.IO Server Ready on: http://localhost:{port}")
    print("================================================================")
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)

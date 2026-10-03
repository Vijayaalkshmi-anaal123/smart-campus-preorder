from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request

socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')

def emit_to_shop(shop_id, event, data):
    """Emit an event to all clients in a specific shop room."""
    socketio.emit(event, data, room=f"shop_{shop_id}")

def emit_to_user(user_id, event, data):
    """Emit an event to a specific user (student, owner, admin)."""
    socketio.emit(event, data, room=f"user_{user_id}")

def emit_to_order(order_token, event, data):
    """Emit an event to everyone tracking a specific order."""
    socketio.emit(event, data, room=f"order_{order_token}")

def emit_to_admin(event, data):
    """Emit an event to admin dashboards."""
    socketio.emit(event, data, room="admin")

def register_socket_handlers():
    @socketio.on('connect')
    def handle_connect():
        print(f"[Socket Connected] client: {request.sid}")
        emit('connected', {'status': 'connected', 'sid': request.sid})

    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"[Socket Disconnected] client: {request.sid}")

    @socketio.on('join_user')
    def handle_join_user(data):
        user_id = data.get('user_id')
        if user_id:
            room = f"user_{user_id}"
            join_room(room)
            print(f"[Socket] User {user_id} joined room {room}")
            emit('room_joined', {'room': room})

    @socketio.on('join_shop')
    def handle_join_shop(data):
        shop_id = data.get('shop_id')
        if shop_id:
            room = f"shop_{shop_id}"
            join_room(room)
            print(f"[Socket] Shop owner joined room {room}")
            emit('room_joined', {'room': room})

    @socketio.on('join_order')
    def handle_join_order(data):
        order_token = data.get('order_token')
        if order_token:
            room = f"order_{order_token}"
            join_room(room)
            print(f"[Socket] Client joined order room {room}")
            emit('room_joined', {'room': room})

    @socketio.on('join_admin')
    def handle_join_admin(data):
        room = "admin"
        join_room(room)
        print(f"[Socket] Client joined admin room {room}")
        emit('room_joined', {'room': room})

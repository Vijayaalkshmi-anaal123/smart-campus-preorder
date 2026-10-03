import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from .models import db
from .sockets import socketio, register_socket_handlers
from .auth import auth_bp
from .routes_shop import shop_bp
from .routes_order import order_bp
from .routes_admin import admin_bp
from .routes_notification import notification_bp
from .seed_data import seed_database

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'smart-campus-preorder-secret-2026')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///campus_preorder.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app)

    # Register socket event handlers
    register_socket_handlers()

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(shop_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notification_bp)

    # Ensure tables exist and seed on first run
    with app.app_context():
        db.create_all()
        seed_database()

    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'service': 'Smart Campus Pre-Order API', 'version': '1.0.0'}

    return app

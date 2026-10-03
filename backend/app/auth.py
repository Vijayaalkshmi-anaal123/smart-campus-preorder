import os
from functools import wraps
from datetime import datetime, timedelta
import jwt
from flask import Blueprint, request, jsonify, current_app
from .models import db, User, Shop

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'campus-jwt-token-secret-key-super-secure-token!')
JWT_ALGORITHM = 'HS256'

def generate_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is missing'}), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            if current_user.status != 'active':
                return jsonify({'success': False, 'message': 'Account is deactivated. Contact admin.'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired. Please login again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token. Please login again.'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': f'Authentication error: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(current_user, *args, **kwargs):
            if current_user.role not in roles and 'admin' not in roles:
                # admin usually has super-access unless strictly excluded
                if current_user.role != 'admin':
                    return jsonify({'success': False, 'message': 'Unauthorized access: insufficient permissions'}), 403
            elif current_user.role not in roles and current_user.role != 'admin':
                return jsonify({'success': False, 'message': 'Unauthorized access: insufficient permissions'}), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    role = data.get('role', 'student').strip().lower()

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email and password are required'}), 400

    if role not in ['student', 'shop_owner']:
        return jsonify({'success': False, 'message': 'Invalid role for self-registration'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400

    user = User(
        name=name,
        email=email,
        phone=phone,
        role=role,
        status='active'
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user)
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    if user.status != 'active':
        return jsonify({'success': False, 'message': 'This account has been deactivated. Please contact the administrator.'}), 403

    token = generate_token(user)
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json() or {}
    if 'name' in data:
        current_user.name = data['name'].strip()
    if 'phone' in data:
        current_user.phone = data['phone'].strip()
    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
        current_user.set_password(data['password'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    }), 200


@auth_bp.route('/demo-accounts', methods=['GET'])
def get_demo_accounts():
    """Returns quick login credentials for demonstration and testing."""
    return jsonify({
        'success': True,
        'accounts': [
            {
                'role': 'Student',
                'name': 'Rahul Sharma',
                'email': 'student@campus.edu',
                'password': 'password123',
                'description': 'Regular campus student'
            },
            {
                'role': 'Shop Owner (Canteen)',
                'name': 'Ramesh Kumar (Canteen)',
                'email': 'canteen@campus.edu',
                'password': 'password123',
                'shop_type': 'CAN',
                'description': 'Owner of Campus Canteen (Snacks, Puffs, Cool drinks)'
            },
            {
                'role': 'Shop Owner (Fruit Shop)',
                'name': 'Anil Rao (Fruit Shop)',
                'email': 'fruit@campus.edu',
                'password': 'password123',
                'shop_type': 'FRU',
                'description': 'Owner of Fresh Fruit & Juice Bar'
            },
            {
                'role': 'Shop Owner (Cafeteria)',
                'name': 'Priya Nair (Cafeteria)',
                'email': 'cafeteria@campus.edu',
                'password': 'password123',
                'shop_type': 'CAF',
                'description': 'Owner of Main Cafeteria (Biryani, Meals, Tiffins)'
            },
            {
                'role': 'Shop Owner (Roll Shop)',
                'name': 'Sunil Verma (Roll Shop)',
                'email': 'roll@campus.edu',
                'password': 'password123',
                'shop_type': 'ROL',
                'description': 'Owner of Campus Roll & Fast Food Corner'
            },
            {
                'role': 'Shop Owner (Text Shop)',
                'name': 'Kavita Reddy (Text Shop)',
                'email': 'text@campus.edu',
                'password': 'password123',
                'shop_type': 'TXT',
                'description': 'Owner of Campus Stationery & Text Shop'
            },
            {
                'role': 'Administrator',
                'name': 'Campus Admin Officer',
                'email': 'admin@campus.edu',
                'password': 'admin123',
                'description': 'Full access to all shops, orders, users and analytics'
            }
        ]
    }), 200

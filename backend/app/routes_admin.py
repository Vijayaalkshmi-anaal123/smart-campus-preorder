from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from .models import db, User, Shop, Product, Order, Payment
from .auth import roles_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard', methods=['GET'])
@roles_required('admin')
def get_dashboard_metrics(current_user):
    """
    Returns aggregate campus statistics for the admin dashboard.
    """
    today_start = datetime.combine(date.today(), datetime.min.time())

    total_students = User.query.filter_by(role='student').count()
    total_shop_owners = User.query.filter_by(role='shop_owner').count()
    total_shops = Shop.query.count()
    total_products = Product.query.count()

    # Orders today
    todays_orders_query = Order.query.filter(Order.created_at >= today_start)
    todays_orders_count = todays_orders_query.count()

    # Active pending orders (ORDER_PLACED, ACCEPTED, PREPARING)
    pending_orders_count = Order.query.filter(Order.order_status.in_(['ORDER_PLACED', 'ACCEPTED', 'PREPARING'])).count()

    # Completed orders
    completed_orders_count = Order.query.filter_by(order_status='COMPLETED').count()

    # Cancelled / Rejected orders
    cancelled_orders_count = Order.query.filter(Order.order_status.in_(['CANCELLED', 'REJECTED'])).count()

    # Revenue
    todays_revenue = db.session.query(func.coalesce(func.sum(Payment.amount), 0.0))\
        .filter(Payment.payment_status == 'PAID', Payment.created_at >= today_start).scalar()

    total_revenue = db.session.query(func.coalesce(func.sum(Payment.amount), 0.0))\
        .filter(Payment.payment_status == 'PAID').scalar()

    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()

    # Shop revenue breakdown
    shop_revenues = []
    shops = Shop.query.all()
    for s in shops:
        rev = db.session.query(func.coalesce(func.sum(Order.total_amount), 0.0))\
            .filter(Order.shop_id == s.id, Order.payment_status == 'PAID').scalar()
        order_count = Order.query.filter_by(shop_id=s.id, payment_status='PAID').count()
        shop_revenues.append({
            'shop_id': s.id,
            'shop_name': s.name,
            'shop_type': s.type,
            'revenue': float(rev),
            'order_count': order_count
        })

    return jsonify({
        'success': True,
        'metrics': {
            'total_students': total_students,
            'total_shop_owners': total_shop_owners,
            'total_shops': total_shops,
            'total_products': total_products,
            'todays_orders': todays_orders_count,
            'pending_orders': pending_orders_count,
            'completed_orders': completed_orders_count,
            'cancelled_orders': cancelled_orders_count,
            'todays_revenue': float(todays_revenue),
            'total_revenue': float(total_revenue)
        },
        'shop_breakdown': shop_revenues,
        'recent_orders': [o.to_dict() for o in recent_orders]
    }), 200


@admin_bp.route('/users', methods=['GET'])
@roles_required('admin')
def get_users(current_user):
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.order_by(User.created_at.desc()).all()
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    }), 200


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@roles_required('admin')
def toggle_user_status(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'success': False, 'message': 'Cannot deactivate your own admin account'}), 400

    user.status = 'inactive' if user.status == 'active' else 'active'
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"User {user.name} is now {user.status}",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/shops', methods=['POST'])
@roles_required('admin')
def create_shop(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    shop_type = data.get('type', '').strip().upper()
    owner_id = data.get('owner_id')
    description = data.get('description', '').strip()
    image = data.get('image', '').strip()
    location = data.get('location', 'Campus Food Court').strip()

    if not name or not shop_type or not owner_id:
        return jsonify({'success': False, 'message': 'Shop name, type, and owner are required'}), 400

    owner = User.query.get(owner_id)
    if not owner or owner.role != 'shop_owner':
        return jsonify({'success': False, 'message': 'Owner must be an active user with role shop_owner'}), 400

    shop = Shop(
        name=name,
        type=shop_type,
        owner_id=owner_id,
        description=description,
        image=image or 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
        location=location,
        status='active'
    )
    db.session.add(shop)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Shop created successfully',
        'shop': shop.to_dict()
    }), 201


@admin_bp.route('/shops/<int:shop_id>', methods=['PUT'])
@roles_required('admin')
def update_shop(current_user, shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    data = request.get_json() or {}
    if 'name' in data:
        shop.name = data['name'].strip()
    if 'type' in data:
        shop.type = data['type'].strip().upper()
    if 'owner_id' in data:
        owner = User.query.get(data['owner_id'])
        if owner and owner.role == 'shop_owner':
            shop.owner_id = owner.id
    if 'description' in data:
        shop.description = data['description'].strip()
    if 'image' in data:
        shop.image = data['image'].strip()
    if 'location' in data:
        shop.location = data['location'].strip()
    if 'status' in data:
        shop.status = data['status']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Shop updated successfully',
        'shop': shop.to_dict()
    }), 200


@admin_bp.route('/payments', methods=['GET'])
@roles_required('admin')
def get_all_payments(current_user):
    """Retrieve all payments for administrative audit."""
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    out = []
    for p in payments:
        p_dict = p.to_dict()
        order = Order.query.get(p.order_id)
        if order:
            p_dict['order_token'] = order.order_token
            p_dict['shop_name'] = order.shop.name if order.shop else 'Unknown'
            p_dict['student_name'] = order.student.name if order.student else 'Unknown'
        out.append(p_dict)
    return jsonify({
        'success': True,
        'payments': out
    }), 200

import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from .models import db, Order, OrderItem, Payment, Product, Shop, User, Notification
from .auth import token_required, roles_required
from .sockets import emit_to_shop, emit_to_user, emit_to_order, emit_to_admin

order_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def generate_order_token(shop_type):
    """
    Generate unique readable order token like CAN-1025, FRU-1001, etc.
    """
    prefix = (shop_type or 'ORD')[:3].upper()
    # Find the latest order with this prefix
    latest_order = Order.query.filter(Order.order_token.like(f'{prefix}-%'))\
                              .order_by(Order.id.desc()).first()
    
    if latest_order and latest_order.order_token:
        try:
            parts = latest_order.order_token.split('-')
            last_num = int(parts[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1001
    else:
        new_num = 1001

    token = f"{prefix}-{new_num}"
    # Verify uniqueness
    while Order.query.filter_by(order_token=token).first():
        new_num += 1
        token = f"{prefix}-{new_num}"

    return token


@order_bp.route('/checkout-and-pay', methods=['POST'])
@token_required
def checkout_and_pay(current_user):
    """
    Places an order and processes mock payment.
    CRITICAL RULE:
    Payment must succeed BEFORE the shop owner receives the confirmed order.
    Prices and totals MUST be calculated and verified on the backend.
    """
    data = request.get_json() or {}
    shop_id = data.get('shop_id')
    raw_items = data.get('items', [])
    payment_method = data.get('payment_method', 'UPI')
    simulate_failure = data.get('simulate_failure', False)
    notes = data.get('notes', '').strip()

    if not shop_id or not raw_items:
        return jsonify({'success': False, 'message': 'Shop ID and cart items are required'}), 400

    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Selected shop does not exist'}), 404

    if shop.status != 'active':
        return jsonify({'success': False, 'message': 'This shop is currently not accepting orders'}), 400

    # Validate items and calculate authoritative backend total
    order_items_data = []
    total_amount = 0.0

    for item in raw_items:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return jsonify({'success': False, 'message': 'Item quantity must be at least 1'}), 400
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid item quantity'}), 400

        product = Product.query.get(product_id)
        if not product or product.shop_id != shop.id:
            return jsonify({'success': False, 'message': f'Product ID {product_id} is not valid for this shop'}), 400

        if product.stock_status == 'out_of_stock':
            return jsonify({
                'success': False,
                'message': f"Item '{product.name}' is currently Out of Stock. Please remove it from your cart."
            }), 400

        unit_price = float(product.price)
        item_total = unit_price * quantity
        total_amount += item_total

        order_items_data.append({
            'product': product,
            'quantity': quantity,
            'price_at_purchase': unit_price,
            'item_total': item_total
        })

    # Total rounding
    total_amount = round(total_amount, 2)

    # Generate mock transaction reference
    txn_ref = f"TXN-CAMPUS-{int(datetime.utcnow().timestamp())}-{uuid.uuid4().hex[:6].upper()}"

    # SIMULATED PAYMENT FAILURE
    if simulate_failure:
        # Create failed payment record with temporary failed order for auditing, but NOT sent to owner
        token = generate_order_token(shop.type)
        failed_order = Order(
            order_token=token,
            student_id=current_user.id,
            shop_id=shop.id,
            total_amount=total_amount,
            payment_status='FAILED',
            order_status='CANCELLED',
            notes=notes
        )
        db.session.add(failed_order)
        db.session.flush()

        failed_payment = Payment(
            order_id=failed_order.id,
            payment_method=payment_method,
            amount=total_amount,
            payment_status='FAILED',
            transaction_reference=txn_ref
        )
        db.session.add(failed_payment)
        db.session.commit()

        return jsonify({
            'success': False,
            'payment_status': 'FAILED',
            'message': 'Payment failed or was cancelled by user. No order was sent to the shop owner.'
        }), 402

    # PAYMENT SUCCESSFUL
    order_token = generate_order_token(shop.type)

    order = Order(
        order_token=order_token,
        student_id=current_user.id,
        shop_id=shop.id,
        total_amount=total_amount,
        payment_status='PAID',
        order_status='ORDER_PLACED',
        notes=notes
    )
    db.session.add(order)
    db.session.flush()

    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data['product'].id,
            quantity=item_data['quantity'],
            price_at_purchase=item_data['price_at_purchase'],
            item_total=item_data['item_total']
        )
        db.session.add(order_item)

    payment = Payment(
        order_id=order.id,
        payment_method=payment_method,
        amount=total_amount,
        payment_status='PAID',
        transaction_reference=txn_ref
    )
    db.session.add(payment)

    # In-app notification for the shop owner
    items_summary = ", ".join([f"{item['product'].name} × {item['quantity']}" for item in order_items_data])
    owner_notif = Notification(
        user_id=shop.owner_id,
        order_id=order.id,
        title=f"🔔 NEW PAID ORDER #{order.order_token}",
        message=f"Student {current_user.name} placed a paid order for ₹{total_amount:.2f}: {items_summary}. Payment: ✅ PAID"
    )
    db.session.add(owner_notif)

    # In-app notification for the student
    student_notif = Notification(
        user_id=current_user.id,
        order_id=order.id,
        title=f"Order Confirmed #{order.order_token}",
        message=f"Your payment of ₹{total_amount:.2f} was successful. Order is placed with {shop.name}."
    )
    db.session.add(student_notif)

    db.session.commit()

    order_dict = order.to_dict()

    # REAL-TIME WEBSOCKET NOTIFICATION TO SHOP OWNER
    emit_to_shop(shop.id, 'new_paid_order', {
        'order': order_dict,
        'notification': owner_notif.to_dict(),
        'message': f"🔔 New Paid Order #{order.order_token} from {current_user.name}"
    })

    # Real-time event to Admin
    emit_to_admin('admin_new_order', {
        'order': order_dict,
        'total_revenue': total_amount
    })

    return jsonify({
        'success': True,
        'payment_status': 'PAID',
        'message': 'Payment successful and order confirmed!',
        'order': order_dict
    }), 201


@order_bp.route('', methods=['GET'])
@token_required
def get_orders(current_user):
    """
    List orders with strict role-based isolation:
    - Student: sees ONLY their own orders
    - Shop Owner: sees ONLY paid orders for their shop
    - Admin: sees all orders (can filter by shop_id, status, payment_status)
    """
    status_filter = request.args.get('status')
    payment_status_filter = request.args.get('payment_status')

    if current_user.role == 'student':
        query = Order.query.filter_by(student_id=current_user.id)
    elif current_user.role == 'shop_owner':
        # Find the owner's shop
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop:
            return jsonify({'success': True, 'orders': []}), 200
        # Shop owner receives ONLY successfully paid orders!
        query = Order.query.filter_by(shop_id=shop.id, payment_status='PAID')
    elif current_user.role == 'admin':
        query = Order.query
        shop_id = request.args.get('shop_id', type=int)
        if shop_id:
            query = query.filter_by(shop_id=shop_id)
        if payment_status_filter:
            query = query.filter_by(payment_status=payment_status_filter)
    else:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    if status_filter:
        query = query.filter_by(order_status=status_filter)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200


@order_bp.route('/<token_or_id>', methods=['GET'])
@token_required
def get_order_by_token_or_id(current_user, token_or_id):
    """Get single order details with access control verification."""
    if token_or_id.isdigit():
        order = Order.query.get(int(token_or_id))
    else:
        order = Order.query.filter_by(order_token=token_or_id.strip()).first()

    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    # Strict authorization check
    if current_user.role == 'student' and order.student_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized to view this order'}), 403

    if current_user.role == 'shop_owner':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized: This order belongs to another shop'}), 403

    return jsonify({
        'success': True,
        'order': order.to_dict()
    }), 200


@order_bp.route('/<token_or_id>/accept', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def accept_order(current_user, token_or_id):
    """Shop owner accepts the paid order."""
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    # Access control: shop owner can only accept their shop's orders
    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    if order.order_status not in ['ORDER_PLACED']:
        return jsonify({'success': False, 'message': f'Cannot accept order with status {order.order_status}'}), 400

    order.order_status = 'ACCEPTED'
    order.updated_at = datetime.utcnow()

    # Notify student
    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"Order Accepted #{order.order_token}",
        message=f"{order.shop.name} has accepted your order. Preparation will start shortly."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    # Emit real-time updates
    emit_to_user(order.student_id, 'order_status_updated', {
        'order': order_dict,
        'notification': notif.to_dict()
    })
    emit_to_order(order.order_token, 'order_status_updated', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': 'Order accepted successfully',
        'order': order_dict
    }), 200


@order_bp.route('/<token_or_id>/prepare', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def start_preparing_order(current_user, token_or_id):
    """
    Shop owner starts preparing and sets estimated preparation time.
    Calculates estimated ready time = now + minutes.
    """
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    data = request.get_json() or {}
    estimated_minutes = data.get('estimated_minutes', 15)

    try:
        estimated_minutes = max(1, int(estimated_minutes))
    except (ValueError, TypeError):
        estimated_minutes = 15

    order.order_status = 'PREPARING'
    order.estimated_minutes = estimated_minutes
    order.estimated_ready_time = datetime.utcnow() + timedelta(minutes=estimated_minutes)
    order.updated_at = datetime.utcnow()

    ready_time_str = order.estimated_ready_time.strftime('%I:%M %p')

    # Notify student
    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"Preparing Order #{order.order_token}",
        message=f"{order.shop.name} is now preparing your items. Estimated ready time: ~{estimated_minutes} minutes ({ready_time_str})."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    # Emit real-time updates
    emit_to_user(order.student_id, 'order_status_updated', {
        'order': order_dict,
        'notification': notif.to_dict()
    })
    emit_to_order(order.order_token, 'order_status_updated', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': f'Order is now preparing with {estimated_minutes} mins estimated time',
        'order': order_dict
    }), 200


@order_bp.route('/<token_or_id>/update-prep-time', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def update_prep_time(current_user, token_or_id):
    """
    Shop owner updates the estimated prep time (e.g. from 15 mins to 20 mins).
    """
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    data = request.get_json() or {}
    new_minutes = data.get('estimated_minutes')
    if new_minutes is None:
        return jsonify({'success': False, 'message': 'New estimated_minutes is required'}), 400

    try:
        new_minutes = max(1, int(new_minutes))
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid minutes provided'}), 400

    order.estimated_minutes = new_minutes
    order.estimated_ready_time = datetime.utcnow() + timedelta(minutes=new_minutes)
    order.updated_at = datetime.utcnow()

    ready_time_str = order.estimated_ready_time.strftime('%I:%M %p')

    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"Time Update for #{order.order_token}",
        message=f"Prep time updated: Ready in approximately {new_minutes} minutes ({ready_time_str})."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    # Emit real-time updates
    emit_to_user(order.student_id, 'prep_time_updated', {
        'order': order_dict,
        'notification': notif.to_dict()
    })
    emit_to_order(order.order_token, 'prep_time_updated', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': f'Preparation time updated to {new_minutes} minutes',
        'order': order_dict
    }), 200


@order_bp.route('/<token_or_id>/ready', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def mark_order_ready(current_user, token_or_id):
    """
    Shop owner marks order Ready for pickup.
    Student receives: "🔔 Your order is ready. Please collect it from the [Shop Name]."
    """
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    order.order_status = 'READY'
    order.updated_at = datetime.utcnow()

    # Notify student
    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"🔔 Order Ready #{order.order_token}",
        message=f"🔔 Your order is ready! Please collect it from {order.shop.name} ({order.shop.location})."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    # Emit real-time notification
    emit_to_user(order.student_id, 'order_ready', {
        'order': order_dict,
        'notification': notif.to_dict(),
        'message': f"🔔 Your order #{order.order_token} is ready for pickup at {order.shop.name}!"
    })
    emit_to_order(order.order_token, 'order_ready', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': 'Order marked ready and student notified',
        'order': order_dict
    }), 200


@order_bp.route('/<token_or_id>/complete', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def mark_order_completed(current_user, token_or_id):
    """
    Shop owner marks order Completed / Collected.
    """
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    order.order_status = 'COMPLETED'
    order.updated_at = datetime.utcnow()

    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"Order Completed #{order.order_token}",
        message=f"Thank you for ordering at {order.shop.name}! Have a great day."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    emit_to_user(order.student_id, 'order_status_updated', {
        'order': order_dict,
        'notification': notif.to_dict()
    })
    emit_to_order(order.order_token, 'order_status_updated', {'order': order_dict})
    emit_to_admin('admin_order_completed', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': 'Order marked as completed/collected',
        'order': order_dict
    }), 200


@order_bp.route('/<token_or_id>/reject', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def reject_order(current_user, token_or_id):
    """Shop owner rejects the order with reason."""
    order = Order.query.filter_by(order_token=token_or_id).first() or Order.query.get(int(token_or_id) if token_or_id.isdigit() else 0)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if current_user.role != 'admin':
        shop = Shop.query.filter_by(owner_id=current_user.id).first()
        if not shop or order.shop_id != shop.id:
            return jsonify({'success': False, 'message': 'Unauthorized to manage this order'}), 403

    data = request.get_json() or {}
    reason = data.get('reason', 'Item unavailable or kitchen overload').strip()

    order.order_status = 'REJECTED'
    order.rejection_reason = reason
    order.updated_at = datetime.utcnow()

    notif = Notification(
        user_id=order.student_id,
        order_id=order.id,
        title=f"Order Rejected #{order.order_token}",
        message=f"{order.shop.name} could not fulfill your order. Reason: {reason}. Refund initiated."
    )
    db.session.add(notif)
    db.session.commit()

    order_dict = order.to_dict()

    emit_to_user(order.student_id, 'order_status_updated', {
        'order': order_dict,
        'notification': notif.to_dict()
    })
    emit_to_order(order.order_token, 'order_status_updated', {'order': order_dict})

    return jsonify({
        'success': True,
        'message': 'Order rejected',
        'order': order_dict
    }), 200

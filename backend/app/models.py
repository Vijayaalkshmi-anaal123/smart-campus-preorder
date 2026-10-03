from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student', 'shop_owner', 'admin'
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'inactive'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    shops = db.relationship('Shop', backref='owner', lazy=True)
    orders = db.relationship('Order', backref='student', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True, order_by='Notification.created_at.desc()')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        owned_shop = self.shops[0].to_basic_dict() if self.shops else None
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'shop': owned_shop,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Shop(db.Model):
    __tablename__ = 'shops'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'FRU', 'CAN', 'TXT', 'CAF', 'ROL'
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(500), nullable=True)
    location = db.Column(db.String(120), default='Campus Food Court')
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'inactive'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', backref='shop', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='shop', lazy=True)

    def to_basic_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'owner_id': self.owner_id,
            'status': self.status
        }

    def to_dict(self, include_products=False):
        data = {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'owner_id': self.owner_id,
            'owner_name': self.owner.name if self.owner else 'Unassigned',
            'owner_email': self.owner.email if self.owner else '',
            'description': self.description,
            'image': self.image,
            'location': self.location,
            'status': self.status,
            'product_count': len(self.products),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_products:
            data['products'] = [p.to_dict() for p in self.products]
        return data


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(80), nullable=True, default='General')
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(500), nullable=True)
    stock_status = db.Column(db.String(20), nullable=False, default='available')  # 'available', 'out_of_stock'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'shop_id': self.shop_id,
            'shop_name': self.shop.name if self.shop else '',
            'shop_type': self.shop.type if self.shop else '',
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'price': float(self.price),
            'image': self.image,
            'stock_status': self.stock_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_token = db.Column(db.String(30), unique=True, nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False, index=True)
    total_amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False, default='PENDING')  # 'PENDING', 'PAID', 'FAILED'
    order_status = db.Column(db.String(30), nullable=False, default='ORDER_PLACED')
    # Statuses: 'ORDER_PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'REJECTED', 'CANCELLED'
    estimated_minutes = db.Column(db.Integer, nullable=True)
    estimated_ready_time = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_token': self.order_token,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'student_email': self.student.email if self.student else '',
            'student_phone': self.student.phone if self.student else '',
            'shop_id': self.shop_id,
            'shop_name': self.shop.name if self.shop else '',
            'shop_type': self.shop.type if self.shop else '',
            'shop_location': self.shop.location if self.shop else '',
            'total_amount': float(self.total_amount),
            'payment_status': self.payment_status,
            'order_status': self.order_status,
            'estimated_minutes': self.estimated_minutes,
            'estimated_ready_time': self.estimated_ready_time.isoformat() if self.estimated_ready_time else None,
            'rejection_reason': self.rejection_reason,
            'notes': self.notes,
            'items': [item.to_dict() for item in self.items],
            'payment': self.payment.to_dict() if self.payment else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price_at_purchase = db.Column(db.Float, nullable=False)
    item_total = db.Column(db.Float, nullable=False)

    # Relationship to product
    product = db.relationship('Product', backref='order_items', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else 'Unavailable Product',
            'product_image': self.product.image if self.product else None,
            'quantity': self.quantity,
            'price_at_purchase': float(self.price_at_purchase),
            'item_total': float(self.item_total)
        }


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True, index=True)
    payment_method = db.Column(db.String(50), nullable=False)  # 'UPI', 'CARD', 'NETBANKING', 'CAMPUS_WALLET'
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)  # 'PAID', 'FAILED'
    transaction_reference = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_method': self.payment_method,
            'amount': float(self.amount),
            'payment_status': self.payment_status,
            'transaction_reference': self.transaction_reference,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'order_id': self.order_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

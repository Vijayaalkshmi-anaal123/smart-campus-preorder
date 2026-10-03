from flask import Blueprint, request, jsonify
from .models import db, Shop, Product, User
from .auth import token_required, roles_required

shop_bp = Blueprint('shops', __name__, url_prefix='/api/shops')

@shop_bp.route('', methods=['GET'])
def get_shops():
    """Get all active shops. Admin can pass ?all=true to view inactive shops too."""
    show_all = request.args.get('all', 'false').lower() == 'true'
    query = Shop.query
    if not show_all:
        query = query.filter_by(status='active')
    shops = query.all()
    return jsonify({
        'success': True,
        'shops': [s.to_dict() for s in shops]
    }), 200


@shop_bp.route('/<int:shop_id>', methods=['GET'])
def get_shop_details(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    return jsonify({
        'success': True,
        'shop': shop.to_dict(include_products=True)
    }), 200


@shop_bp.route('/<int:shop_id>/products', methods=['GET'])
def get_shop_products(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    category = request.args.get('category')
    search = request.args.get('search')
    stock_status = request.args.get('stock_status')

    query = Product.query.filter_by(shop_id=shop_id)
    if category:
        query = query.filter_by(category=category)
    if stock_status:
        query = query.filter_by(stock_status=stock_status)
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))

    products = query.order_by(Product.name.asc()).all()

    # Get distinct categories
    all_categories = [c[0] for c in db.session.query(Product.category).filter_by(shop_id=shop_id).distinct().all() if c[0]]

    return jsonify({
        'success': True,
        'shop': shop.to_dict(),
        'categories': all_categories,
        'products': [p.to_dict() for p in products]
    }), 200


@shop_bp.route('/my-shop', methods=['GET'])
@roles_required('shop_owner', 'admin')
def get_my_shop(current_user):
    """Retrieve the shop owned by the currently logged-in shop owner."""
    if current_user.role == 'admin':
        # Admin can view the first shop or specify ?shop_id=X
        shop_id = request.args.get('shop_id', type=int)
        if shop_id:
            shop = Shop.query.get(shop_id)
        else:
            shop = Shop.query.first()
    else:
        shop = Shop.query.filter_by(owner_id=current_user.id).first()

    if not shop:
        return jsonify({'success': False, 'message': 'No shop found associated with this account'}), 404

    return jsonify({
        'success': True,
        'shop': shop.to_dict(include_products=True)
    }), 200


@shop_bp.route('/my-shop', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def update_my_shop(current_user):
    """Update shop description, location, or status."""
    if current_user.role == 'admin':
        shop_id = request.args.get('shop_id', type=int)
        shop = Shop.query.get(shop_id) if shop_id else Shop.query.first()
    else:
        shop = Shop.query.filter_by(owner_id=current_user.id).first()

    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    data = request.get_json() or {}
    if 'description' in data:
        shop.description = data['description']
    if 'location' in data:
        shop.location = data['location']
    if 'status' in data and current_user.role == 'admin':
        shop.status = data['status']
    if 'image' in data:
        shop.image = data['image']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Shop details updated successfully',
        'shop': shop.to_dict(include_products=True)
    }), 200


@shop_bp.route('/<int:shop_id>/products', methods=['POST'])
@roles_required('shop_owner', 'admin')
def add_product(current_user, shop_id):
    """Add a new product. Shop owner can only add to their own shop."""
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    # Strict access control check
    if current_user.role != 'admin' and shop.owner_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized: You can only add products to your own shop'}), 403

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    price = data.get('price')
    category = data.get('category', 'General').strip()
    description = data.get('description', '').strip()
    image = data.get('image', '').strip()
    stock_status = data.get('stock_status', 'available').strip()

    if not name or price is None:
        return jsonify({'success': False, 'message': 'Product name and price are required'}), 400

    try:
        price = float(price)
        if price < 0:
            return jsonify({'success': False, 'message': 'Price cannot be negative'}), 400
    except ValueError:
        return jsonify({'success': False, 'message': 'Price must be a valid number'}), 400

    product = Product(
        shop_id=shop_id,
        name=name,
        price=price,
        category=category,
        description=description,
        image=image or 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        stock_status=stock_status if stock_status in ['available', 'out_of_stock'] else 'available'
    )
    db.session.add(product)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Product added successfully',
        'product': product.to_dict()
    }), 201


@shop_bp.route('/<int:shop_id>/products/<int:product_id>', methods=['PUT'])
@roles_required('shop_owner', 'admin')
def update_product(current_user, shop_id, product_id):
    """Update product details, price, or stock status."""
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    # Strict ownership check
    if current_user.role != 'admin' and shop.owner_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized: You can only edit products in your own shop'}), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop_id).first()
    if not product:
        return jsonify({'success': False, 'message': 'Product not found in this shop'}), 404

    data = request.get_json() or {}
    if 'name' in data:
        product.name = data['name'].strip()
    if 'category' in data:
        product.category = data['category'].strip()
    if 'description' in data:
        product.description = data['description'].strip()
    if 'image' in data:
        product.image = data['image'].strip()
    if 'stock_status' in data:
        if data['stock_status'] in ['available', 'out_of_stock']:
            product.stock_status = data['stock_status']
    if 'price' in data:
        try:
            val = float(data['price'])
            if val < 0:
                return jsonify({'success': False, 'message': 'Price cannot be negative'}), 400
            product.price = val
        except ValueError:
            return jsonify({'success': False, 'message': 'Price must be a valid number'}), 400

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200


@shop_bp.route('/<int:shop_id>/products/<int:product_id>', methods=['DELETE'])
@roles_required('shop_owner', 'admin')
def delete_product(current_user, shop_id, product_id):
    """Delete a product from the shop."""
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'success': False, 'message': 'Shop not found'}), 404

    # Strict ownership check
    if current_user.role != 'admin' and shop.owner_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized: You can only delete products in your own shop'}), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop_id).first()
    if not product:
        return jsonify({'success': False, 'message': 'Product not found in this shop'}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Product deleted successfully'
    }), 200

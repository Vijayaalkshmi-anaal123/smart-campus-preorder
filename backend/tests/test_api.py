import pytest
from app import create_app, db
from app.models import User, Shop, Product, Order, Payment

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_health(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_demo_accounts_available(client):
    response = client.get('/api/auth/demo-accounts')
    assert response.status_code == 200
    assert len(response.json['accounts']) >= 7

def test_student_login(client):
    response = client.post('/api/auth/login', json={
        'email': 'student@campus.edu',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'token' in response.json
    assert response.json['user']['role'] == 'student'

def test_five_shops_seeded(client):
    response = client.get('/api/shops')
    assert response.status_code == 200
    shops = response.json['shops']
    assert len(shops) == 5
    shop_types = [s['type'] for s in shops]
    for expected in ['FRU', 'CAN', 'TXT', 'CAF', 'ROL']:
        assert expected in shop_types

def test_complete_ordering_and_isolation_flow(client):
    # 1. Login as Student
    student_login = client.post('/api/auth/login', json={
        'email': 'student@campus.edu',
        'password': 'password123'
    })
    student_token = student_login.json['token']
    student_headers = {'Authorization': f'Bearer {student_token}'}

    # 2. Get Canteen products
    shops_res = client.get('/api/shops')
    canteen = next(s for s in shops_res.json['shops'] if s['type'] == 'CAN')
    canteen_id = canteen['id']

    products_res = client.get(f'/api/shops/{canteen_id}/products')
    assert products_res.status_code == 200
    products = products_res.json['products']
    assert len(products) > 0

    item1 = products[0]
    item2 = products[1]

    # 3. Simulate payment failure test: Must return failure and NOT create confirmed paid order
    fail_res = client.post('/api/orders/checkout-and-pay', json={
        'shop_id': canteen_id,
        'items': [
            {'product_id': item1['id'], 'quantity': 2}
        ],
        'payment_method': 'UPI',
        'simulate_failure': True
    }, headers=student_headers)
    assert fail_res.status_code == 402
    assert fail_res.json['payment_status'] == 'FAILED'

    # 4. Successful Mock Payment Order
    order_res = client.post('/api/orders/checkout-and-pay', json={
        'shop_id': canteen_id,
        'items': [
            {'product_id': item1['id'], 'quantity': 2},
            {'product_id': item2['id'], 'quantity': 1}
        ],
        'payment_method': 'UPI',
        'simulate_failure': False,
        'notes': 'Pack separately please'
    }, headers=student_headers)
    assert order_res.status_code == 201
    assert order_res.json['payment_status'] == 'PAID'
    order_data = order_res.json['order']
    order_token = order_data['order_token']
    assert order_token.startswith('CAN-')
    assert order_data['order_status'] == 'ORDER_PLACED'

    # Expected backend authoritative total
    expected_total = (item1['price'] * 2) + (item2['price'] * 1)
    assert abs(order_data['total_amount'] - expected_total) < 0.01

    # 5. Isolation Test: Login as Fruit Shop Owner
    fruit_login = client.post('/api/auth/login', json={
        'email': 'fruit@campus.edu',
        'password': 'password123'
    })
    fruit_token = fruit_login.json['token']
    fruit_headers = {'Authorization': f'Bearer {fruit_token}'}

    # Fruit Shop Owner attempts to access or manage Canteen order -> MUST BE FORBIDDEN (403)
    fruit_view = client.get(f'/api/orders/{order_token}', headers=fruit_headers)
    assert fruit_view.status_code == 403

    fruit_manage = client.put(f'/api/orders/{order_token}/accept', headers=fruit_headers)
    assert fruit_manage.status_code == 403

    # 6. Login as Canteen Owner -> MUST SUCCEED
    canteen_login = client.post('/api/auth/login', json={
        'email': 'canteen@campus.edu',
        'password': 'password123'
    })
    canteen_token = canteen_login.json['token']
    canteen_headers = {'Authorization': f'Bearer {canteen_token}'}

    # Owner views order
    owner_view = client.get(f'/api/orders/{order_token}', headers=canteen_headers)
    assert owner_view.status_code == 200
    assert owner_view.json['order']['order_token'] == order_token

    # Owner accepts order
    accept_res = client.put(f'/api/orders/{order_token}/accept', headers=canteen_headers)
    assert accept_res.status_code == 200
    assert accept_res.json['order']['order_status'] == 'ACCEPTED'

    # Owner starts preparing with 15 mins
    prep_res = client.put(f'/api/orders/{order_token}/prepare', json={
        'estimated_minutes': 15
    }, headers=canteen_headers)
    assert prep_res.status_code == 200
    assert prep_res.json['order']['order_status'] == 'PREPARING'
    assert prep_res.json['order']['estimated_minutes'] == 15
    assert prep_res.json['order']['estimated_ready_time'] is not None

    # Owner updates prep time to 20 mins
    update_time_res = client.put(f'/api/orders/{order_token}/update-prep-time', json={
        'estimated_minutes': 20
    }, headers=canteen_headers)
    assert update_time_res.status_code == 200
    assert update_time_res.json['order']['estimated_minutes'] == 20

    # Owner marks ready
    ready_res = client.put(f'/api/orders/{order_token}/ready', headers=canteen_headers)
    assert ready_res.status_code == 200
    assert ready_res.json['order']['order_status'] == 'READY'

    # Owner marks completed / collected
    complete_res = client.put(f'/api/orders/{order_token}/complete', headers=canteen_headers)
    assert complete_res.status_code == 200
    assert complete_res.json['order']['order_status'] == 'COMPLETED'

    # 7. Login as Admin and verify dashboard metrics reflect the completed order
    admin_login = client.post('/api/auth/login', json={
        'email': 'admin@campus.edu',
        'password': 'admin123'
    })
    admin_token = admin_login.json['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}

    admin_dash = client.get('/api/admin/dashboard', headers=admin_headers)
    assert admin_dash.status_code == 200
    metrics = admin_dash.json['metrics']
    assert metrics['total_shops'] == 5
    assert metrics['completed_orders'] >= 1
    assert metrics['total_revenue'] >= expected_total

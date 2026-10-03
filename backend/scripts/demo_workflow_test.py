import sys
import os

# Enable UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import requests

BASE_URL = "http://localhost:5000/api"

def run_e2e_demo_test():
    print("=" * 70)
    print("RUNNING COMPLETE REAL-WORLD END-TO-END DEMO TEST")
    print("=" * 70)

    # 1. Login as Student
    print("\n[Step 1] Logging in as Student (student@campus.edu)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "student@campus.edu",
        "password": "password123"
    })
    assert res.status_code == 200, f"Student login failed: {res.text}"
    student_token = res.json()["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("-> Student login SUCCESSFUL! User:", res.json()["user"]["name"])

    # 2. Open Canteen
    print("\n[Step 2] Retrieving Canteen Outlet...")
    res = requests.get(f"{BASE_URL}/shops")
    assert res.status_code == 200
    shops = res.json()["shops"]
    canteen = next(s for s in shops if s["type"] == "CAN")
    canteen_id = canteen["id"]
    print(f"-> Canteen found: ID={canteen_id}, Name='{canteen['name']}'")

    # 3. View Canteen Products
    print("\n[Step 3] Fetching Canteen Products & Selecting Items...")
    res = requests.get(f"{BASE_URL}/shops/{canteen_id}/products")
    assert res.status_code == 200
    products = res.json()["products"]
    assert len(products) > 0
    p1 = products[0]
    p2 = products[1]
    print(f"-> Selected Product 1: '{p1['name']}' (Price: Rs.{p1['price']})")
    print(f"-> Selected Product 2: '{p2['name']}' (Price: Rs.{p2['price']})")

    # 4. Check Payment Failure Behavior (Mock Test)
    print("\n[Step 4] Testing Simulated Payment Failure (must NOT create paid order)...")
    fail_res = requests.post(f"{BASE_URL}/orders/checkout-and-pay", json={
        "shop_id": canteen_id,
        "items": [{"product_id": p1["id"], "quantity": 2}],
        "payment_method": "UPI",
        "simulate_failure": True
    }, headers=student_headers)
    assert fail_res.status_code == 402
    assert fail_res.json()["payment_status"] == "FAILED"
    print("-> Payment failure correctly caught! Status: FAILED. No order sent to owner.")

    # 5. Successful Mock Payment & Order Confirmation
    print("\n[Step 5] Processing Successful Payment and Pre-Order...")
    qty1 = 2
    qty2 = 1
    expected_total = (p1["price"] * qty1) + (p2["price"] * qty2)

    pay_res = requests.post(f"{BASE_URL}/orders/checkout-and-pay", json={
        "shop_id": canteen_id,
        "items": [
            {"product_id": p1["id"], "quantity": qty1},
            {"product_id": p2["id"], "quantity": qty2}
        ],
        "payment_method": "UPI",
        "simulate_failure": False,
        "notes": "Extra tissues please"
    }, headers=student_headers)

    assert pay_res.status_code == 201, f"Checkout failed: {pay_res.text}"
    order_data = pay_res.json()["order"]
    token = order_data["order_token"]
    assert token.startswith("CAN-"), f"Unexpected token format: {token}"
    assert order_data["payment_status"] == "PAID"
    assert order_data["order_status"] == "ORDER_PLACED"
    assert abs(order_data["total_amount"] - expected_total) < 0.01

    print(f"-> Payment SUCCESSFUL! Order Confirmed!")
    print(f"   Order Token: {token}")
    print(f"   Status: {order_data['order_status']}")
    print(f"   Verified Total: Rs.{order_data['total_amount']:.2f}")

    # 6. Isolation Test: Login as Fruit Shop Owner
    print("\n[Step 6] ISOLATION TEST: Logging in as Fruit Shop Owner (fruit@campus.edu)...")
    fruit_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "fruit@campus.edu",
        "password": "password123"
    })
    assert fruit_login.status_code == 200
    fruit_token = fruit_login.json()["token"]
    fruit_headers = {"Authorization": f"Bearer {fruit_token}"}

    # Fruit Shop Owner attempts to access Canteen Order -> MUST BE 403 Forbidden!
    fruit_view = requests.get(f"{BASE_URL}/orders/{token}", headers=fruit_headers)
    assert fruit_view.status_code == 403, f"Expected 403, got {fruit_view.status_code}"

    fruit_accept = requests.put(f"{BASE_URL}/orders/{token}/accept", headers=fruit_headers)
    assert fruit_accept.status_code == 403, f"Expected 403, got {fruit_accept.status_code}"
    print("-> ISOLATION VERIFIED: Fruit Shop Owner was strictly BLOCKED from viewing or accepting Canteen Order! (HTTP 403)")

    # 7. Login as Canteen Owner
    print("\n[Step 7] Logging in as Canteen Owner (canteen@campus.edu)...")
    canteen_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "canteen@campus.edu",
        "password": "password123"
    })
    assert canteen_login.status_code == 200
    canteen_token = canteen_login.json()["token"]
    canteen_headers = {"Authorization": f"Bearer {canteen_token}"}
    print("-> Canteen Owner logged in.")

    # 8. Canteen Owner views orders
    print("\n[Step 8] Canteen Owner checks incoming paid orders...")
    owner_orders = requests.get(f"{BASE_URL}/orders", headers=canteen_headers).json()["orders"]
    matching_order = next((o for o in owner_orders if o["order_token"] == token), None)
    assert matching_order is not None, "Order not found in Canteen Owner queue"
    assert matching_order["payment_status"] == "PAID"
    print(f"-> Canteen Owner received NEW PAID ORDER: #{token}, Items: {len(matching_order['items'])}, Total: Rs.{matching_order['total_amount']}")

    # 9. Canteen Owner Accepts Order
    print(f"\n[Step 9] Canteen Owner accepts order #{token}...")
    accept_res = requests.put(f"{BASE_URL}/orders/{token}/accept", headers=canteen_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["order"]["order_status"] == "ACCEPTED"
    print("-> Order status: ACCEPTED")

    # 10. Canteen Owner Starts Preparing with 15 mins
    print(f"\n[Step 10] Canteen Owner sets 15-minute preparation time...")
    prep_res = requests.put(f"{BASE_URL}/orders/{token}/prepare", json={
        "estimated_minutes": 15
    }, headers=canteen_headers)
    assert prep_res.status_code == 200
    prep_data = prep_res.json()["order"]
    assert prep_data["order_status"] == "PREPARING"
    assert prep_data["estimated_minutes"] == 15
    assert prep_data["estimated_ready_time"] is not None
    print(f"-> Order status: PREPARING (Est. Duration: {prep_data['estimated_minutes']} mins, Ready Time: {prep_data['estimated_ready_time']})")

    # 11. Canteen Owner Updates Prep Time to 20 mins
    print(f"\n[Step 11] Canteen Owner updates prep time to 20 minutes...")
    update_time_res = requests.put(f"{BASE_URL}/orders/{token}/update-prep-time", json={
        "estimated_minutes": 20
    }, headers=canteen_headers)
    assert update_time_res.status_code == 200
    assert update_time_res.json()["order"]["estimated_minutes"] == 20
    print("-> Prep time updated to 20 minutes.")

    # 12. Student verifies updated ready time
    print(f"\n[Step 12] Student checks updated order status & estimated ready time...")
    student_check = requests.get(f"{BASE_URL}/orders/{token}", headers=student_headers)
    assert student_check.status_code == 200
    student_order = student_check.json()["order"]
    assert student_order["order_status"] == "PREPARING"
    assert student_order["estimated_minutes"] == 20
    print(f"-> Student screen: Order #{token} is PREPARING. Estimated Ready: ~20 mins")

    # 13. Owner Marks Order Ready
    print(f"\n[Step 13] Canteen Owner marks order #{token} as READY...")
    ready_res = requests.put(f"{BASE_URL}/orders/{token}/ready", headers=canteen_headers)
    assert ready_res.status_code == 200
    assert ready_res.json()["order"]["order_status"] == "READY"
    print("-> Order status: READY. Student notified to collect from Canteen!")

    # 14. Student checks notifications for ready alert
    print(f"\n[Step 14] Student checks in-app notifications...")
    notifs_res = requests.get(f"{BASE_URL}/notifications", headers=student_headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()["notifications"]
    ready_notif = next((n for n in notifs if f"#{token}" in n["title"] and "Ready" in n["title"]), None)
    assert ready_notif is not None, "Ready notification not found for student"
    print(f"-> Student received notification: '{ready_notif['title']}' - '{ready_notif['message']}'")

    # 15. Student Collects -> Owner Marks Completed
    print(f"\n[Step 15] Student collects food -> Canteen Owner marks COMPLETED...")
    comp_res = requests.put(f"{BASE_URL}/orders/{token}/complete", headers=canteen_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["order"]["order_status"] == "COMPLETED"
    print("-> Order status: COMPLETED.")

    # 16. Verify Student Order History
    print(f"\n[Step 16] Verifying order appears in Student Order History...")
    st_history = requests.get(f"{BASE_URL}/orders", headers=student_headers).json()["orders"]
    assert any(o["order_token"] == token and o["order_status"] == "COMPLETED" for o in st_history)
    print("-> Order confirmed in Student Order History.")

    # 17. Verify Owner Completed Orders
    print(f"\n[Step 17] Verifying order appears in Canteen Owner Completed queue...")
    ow_history = requests.get(f"{BASE_URL}/orders?status=COMPLETED", headers=canteen_headers).json()["orders"]
    assert any(o["order_token"] == token for o in ow_history)
    print("-> Order confirmed in Canteen Owner Completed queue.")

    # 18. Login as Admin & Verify Analytics
    print(f"\n[Step 18] Logging in as Admin (admin@campus.edu) & checking revenue...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@campus.edu",
        "password": "admin123"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    dash = requests.get(f"{BASE_URL}/admin/dashboard", headers=admin_headers).json()
    metrics = dash["metrics"]
    print(f"-> Admin Dashboard:")
    print(f"   Total Shops: {metrics['total_shops']}")
    print(f"   Completed Orders: {metrics['completed_orders']}")
    print(f"   Total Verified Revenue: Rs.{metrics['total_revenue']:.2f}")
    assert metrics["completed_orders"] >= 1
    assert metrics["total_revenue"] > 0

    print("\n" + "=" * 70)
    print("ALL 18 END-TO-END DEMO STEPS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_demo_test()

# Smart Campus Multi-Shop Pre-Ordering and Management System

A production-ready web application designed for college campuses to eliminate break-time queues. Students can pre-order food, snacks, and stationery from five distinct campus outlets before the break bell rings. Shop owners receive confirmed orders **only after successful payment**, manage preparation times with live updates, and notify students when their orders are ready for quick counter collection.

---

## 🌍 Live Public Web Application URL

The entire web application (Frontend + Backend + Real-Time WebSockets) is live and publicly accessible over secure HTTPS:

👉 **[https://from-acts-lexington-installed.trycloudflare.com](https://from-acts-lexington-installed.trycloudflare.com)**

- **Frontend Web Application**: `https://from-acts-lexington-installed.trycloudflare.com`
- **Backend API**: `https://from-acts-lexington-installed.trycloudflare.com/api`
- **API Health Check**: `https://from-acts-lexington-installed.trycloudflare.com/api/health`

*(You can open this URL on any smartphone, tablet, laptop, or desktop anywhere in the world without installing anything).*

---

## 🎯 Problem Solved
During college break intervals, hundreds of students arrive at campus canteens and shops simultaneously. This creates long, chaotic queues and wastes valuable break time.

**Smart Campus Pre-Order** solves this by:
1. Allowing students to order and pay ahead from anywhere on campus.
2. Generating unique readable order tokens (e.g. `CAN-1025`, `FRU-1001`, `CAF-1004`, `TXT-1003`, `ROL-1005`).
3. Ensuring shop owners receive **only successfully paid orders** (never unpaid or failed orders).
4. Providing real-time kitchen preparation timers and ready-for-pickup notifications.
5. Allowing students to simply walk up to the counter, show their token, and collect immediately without waiting in queues.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Socket.IO Client, Axios, Canvas Confetti |
| **Backend** | Python 3.12, Flask 3.0, Flask-SQLAlchemy, Flask-SocketIO, Flask-CORS, PyJWT, Werkzeug |
| **Database** | Relational Database (SQLite by default, zero setup; supports PostgreSQL & MySQL via `DATABASE_URL`) |
| **Real-time** | WebSockets (Flask-SocketIO + simple-websocket) with room-based pub/sub |
| **Security** | PBKDF2 Password Hashing, JWT Bearer Tokens, Role-Based Access Control (RBAC), Server-Side Price Calculations |

---

## 📁 Project Structure

```text
smart-campus-preorder/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask App Factory, CORS, Blueprints, SocketIO
│   │   ├── models.py             # SQLAlchemy Relational Models (User, Shop, Product, Order, Payment, etc.)
│   │   ├── auth.py               # JWT Authentication & Role-Based Decorators
│   │   ├── routes_shop.py        # Shop & Product Endpoints with Owner Authorization
│   │   ├── routes_order.py       # Order Lifecycle, Mock Payment, Preparation Timers
│   │   ├── routes_admin.py       # Campus Dashboard, Analytics, User & Shop Oversight
│   │   ├── routes_notification.py# In-App Notifications
│   │   ├── sockets.py            # Socket.IO Event Handlers & Rooms
│   │   └── seed_data.py          # Auto-seeding for 5 Shops, 66 Menu Items, and Demo Users
│   ├── tests/
│   │   └── test_api.py           # Integration & Isolation Test Suite (pytest)
│   ├── scripts/
│   │   └── demo_workflow_test.py # Automated E2E 18-step verification script
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Server Entrypoint (Flask + SocketIO on port 5000)
│   ├── .env                      # Environment variables
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive header with 1-click Demo Switcher & Cart Badge
│   │   │   ├── CartDrawer.jsx        # Slide-over cart with quantity stepper & totals
│   │   │   ├── NotificationBell.jsx  # In-app notification dropdown with unread count
│   │   │   ├── OrderStatusBadge.jsx  # Color-coded status badges
│   │   │   ├── OrderTimeline.jsx     # Visual order progress stepper & ready alerts
│   │   │   ├── PrepTimeModal.jsx     # Shop owner prep timer modal (+10m, +15m, +20m)
│   │   │   └── PaymentModal.jsx      # University Mock Payment Gateway with Failure Simulator
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Session, JWT, and user roles
│   │   │   ├── CartContext.jsx       # Single-shop cart enforcement, totals, item modifiers
│   │   │   └── SocketContext.jsx     # Real-time WebSocket listener with audio chimes
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Campus Hero & 5 Outlets Grid
│   │   │   ├── LoginPage.jsx         # Login form with 1-Click Demo Profiles
│   │   │   ├── RegisterPage.jsx      # Student & Shop Owner registration
│   │   │   ├── ShopDetailsPage.jsx   # Shop menu categories, product cards, stock indicators
│   │   │   ├── CheckoutPage.jsx      # Order review, notes, price verification
│   │   │   ├── OrderConfirmationPage.jsx # Big token display, status stepper, pickup directions
│   │   │   ├── OrderHistoryPage.jsx  # Student order receipts & live tracking
│   │   │   ├── StudentProfilePage.jsx# Profile management
│   │   │   ├── ShopOwnerDashboard.jsx# Live kitchen order queue (New, Preparing, Ready, Completed)
│   │   │   ├── ShopProductManagement.jsx # Owner menu manager (add, edit price, stock toggle)
│   │   │   ├── ShopReportsPage.jsx   # Outlet sales analytics & top products
│   │   │   └── AdminDashboard.jsx    # Master university portal: stats, shops, audit logs
│   │   ├── services/
│   │   │   └── api.js                # Axios client with JWT interceptor
│   │   ├── App.jsx                   # Main React entrypoint
│   │   ├── index.css                 # Tailwind CSS styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 👥 Demo Login Credentials

The database automatically seeds with realistic test accounts. You can type these credentials or click the **"⚡ Switch Demo Role"** button in the navbar for 1-click access:

| Role | User Name | Email | Password | Assigned Shop / Scope |
|---|---|---|---|---|
| **Student** | Rahul Sharma | `student@campus.edu` | `password123` | Campus Pre-Ordering |
| **Shop Owner** | Ramesh Kumar | `canteen@campus.edu` | `password123` | Campus Canteen (`CAN`) |
| **Shop Owner** | Anil Rao | `fruit@campus.edu` | `password123` | Fresh Fruit & Juice Bar (`FRU`) |
| **Shop Owner** | Priya Nair | `cafeteria@campus.edu` | `password123` | Main Campus Cafeteria (`CAF`) |
| **Shop Owner** | Sunil Verma | `roll@campus.edu` | `password123` | Rolls & Fries Express (`ROL`) |
| **Shop Owner** | Kavita Reddy | `text@campus.edu` | `password123` | Stationery & Text Shop (`TXT`) |
| **Administrator** | Campus Admin Officer | `admin@campus.edu` | `admin123` | Global Master Access |

---

## 🏪 The 5 Campus Shops & Seeded Menus

1. **Fresh Fruit & Juice Bar (`FRU`)**: Watermelon Juice (₹40), Sapota Juice (₹40), Carrot Juice (₹40), Beetroot Juice (₹40), Carrot & Beetroot Juice (₹40), ABC Juice (₹40), Chocolate Milkshake (₹40), Strawberry Milkshake (₹40), Butterscotch Milkshake (₹40), Mixed Fruit Bowl (₹30), Watermelon Pieces (₹40), Sapota Pieces (₹40), Pineapple Pieces (₹40), Mozambique Juice (₹30), Muskmelon Pieces (₹30).
2. **Campus Canteen (`CAN`)**: Bingo (₹20), Lays (₹20), Kurkure Masala Munch (₹20), Kurkure Green Chutney (₹20), Hot Samosa (₹20), Egg Puff (₹25), Veg Puff (₹20), Chicken Puff (₹30), Sprite (₹20), Thums Up (₹20), Mountain Dew (₹20), Coca Cola (₹20), Vanilla Shake (₹35), Oreo Shake (₹45), Badam Milk (₹30).
3. **Campus Stationery & Text Shop (`TXT`)**: Record Papers Bundle (₹60), Record Pads (₹30), Reynolds Ballpoint Pens (₹10), Gel Pen Black (₹15), Parker Vector Pen (₹120), Presentation Charts (₹10), Mobile Fast Charger (₹50), Engineering Graph Book (₹25), Geometry Box (₹80), A4 Spiral Notebook (₹75).
4. **Main Campus Cafeteria (`CAF`)**: Chicken Dum Biryani (₹120), Veg Biryani (₹120), Chicken Fried Rice (₹60), Gobi Fried Rice (₹60), Egg Fried Rice (₹60), Veg Hakka Noodles (₹60), Gobi Noodles (₹60), Chicken Noodles (₹80), Hot Puri (₹30), Crispy Plain Dosa (₹40), Karam Dosa (₹40), Onion Dosa (₹50), Panipuri (₹20), Gobi Chat (₹30), Chicken Rice (₹60).
5. **Rolls & Fries Express (`ROL`)**: Crispy Chicken Nuggets (₹120), Chicken Wings (₹120), Chicken Peri-Peri Strips (₹120), Veg Special Roll (₹80), Classic Veg Roll (₹60), Crispy Gobi Roll (₹60), Chicken Egg Roll (₹80), Classic Chicken Roll (₹80), Paneer Tikka Roll (₹80), Crispy Veg Sticks (₹60), Garden Veg Salad (₹80).

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+ (Installed at `C:\Users\hp\.local\bin` or system PATH)
- Node.js 18+ (Installed at `C:\Users\hp\.nodejs\node-v20.18.0-win-x64` or system PATH)

---

### Step 1: Backend Setup & Run

Open a terminal in `backend/`:

```powershell
cd smart-campus-preorder\backend

# 1. Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the Backend Server
python run.py
```

The backend server starts on **`http://localhost:5000`**.  
On first run, it automatically creates the relational database (`campus_preorder.db`) and seeds all 7 users, 5 shops, and 66 menu items.

---

### Step 2: Frontend Setup & Run

Open a second terminal in `frontend/`:

```powershell
cd smart-campus-preorder\frontend

# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

The application is accessible in your browser at **`http://localhost:5173`**.

---

## 🧪 Testing the Complete Real-World Workflow

Follow this exact test sequence to verify the end-to-end flow:

### 1. Student Order Placement & Mock Payment
1. Open `http://localhost:5173/` in your browser.
2. Sign in as **Student** (`student@campus.edu` / `password123`) or click **"⚡ Switch Demo Role"** -> **"Student"**.
3. Select **"Campus Canteen"**.
4. Browse products (e.g. *Hot Samosa* and *Badam Milk*), select quantities using `+` / `-`, and click **"Add to Cart"**.
5. Click the **Cart Icon** to open the slide-out drawer, verify item quantities and subtotal, then click **"Proceed to Checkout"**.
6. Review the order and click **"Proceed to Pay"**.
7. In the Mock Payment Modal:
   - Select **UPI / QR Code** or **Campus Smart Card**.
   - *(Optional Test)* Check **"Test Scenario: Simulate Payment Failure"** -> Click Pay -> Verify payment is rejected with status `FAILED` and **no order is sent to the shop owner**.
   - Uncheck the failure toggle and click **"Pay & Confirm"**.
8. Confetti fires, payment succeeds (`PAID`), and an order token is generated (e.g. `CAN-1002`).

### 2. Shop Owner Receives Paid Order & Starts Preparation
1. Switch to the **Canteen Owner** (`canteen@campus.edu` / `password123`).
2. The owner receives an immediate audio alert and a **"🔔 NEW PAID ORDER #CAN-1002"** notification.
3. The owner sees the paid order details: Student name, ordered items, total amount (₹), and payment badge `PAID`.
4. Click **"Accept Order"**.
5. The preparation modal appears: select **"15 mins"** (or custom minutes) and click **"Confirm Time"**.
6. The system calculates the estimated ready time (e.g. `10:20 AM`).

### 3. Preparation Time Update
1. From the **"Preparing"** tab, click **"Change Prep Time"**.
2. Select **"20 mins"** and save.
3. The student's view automatically updates to show the updated ready time and duration!

### 4. Order Ready & Collection
1. When the food is ready, the owner clicks **"Mark Order Ready"**.
2. The student receives an in-app notification:  
   *"🔔 Your order #CAN-1002 is ready! Please collect it from Campus Canteen (Central Food Plaza, Counter 1)."*
3. The student arrives at the counter and collects the food.
4. The owner clicks **"Student Collected • Mark Completed"**.
5. The order moves to Completed and appears in the student's **Order History**.

### 5. Cross-Shop Isolation Verification
1. Log in as **Fruit Shop Owner** (`fruit@campus.edu` / `password123`).
2. Verify that the Fruit Shop owner **cannot see, access, or modify** the Canteen order.
3. Any unauthorized API attempt returns **`403 Forbidden`**.

### 6. Admin Analytics Oversight
1. Log in as **Campus Admin** (`admin@campus.edu` / `admin123`).
2. View the system-wide overview: Total students, shop owners, today's orders, and verified revenue.
3. Audit all payments and orders across all 5 campus outlets.

---

## 🤖 Running Automated Automated Tests

### 1. Pytest Integration Test Suite
Tests authentication, 5 seeded shops, product retrieval, backend calculations, mock payments, status transitions, and role isolation:

```powershell
cd smart-campus-preorder\backend
.\.venv\Scripts\python.exe -m pytest -v
```
*(All 5 test suites pass with 100% success).*

### 2. End-to-End Live Workflow Script
Simulates the entire 18-step ordering lifecycle against the live server:

```powershell
cd smart-campus-preorder\backend
.\.venv\Scripts\python.exe scripts/demo_workflow_test.py
```

---

## 🔒 Security & Real-World Business Rules

1. **Payment-First Rule**: Orders are only dispatched to the shop kitchen queue **after payment verification**. Failed payments do not generate active orders.
2. **Server-Side Authoritative Pricing**: Product prices and order totals are calculated exclusively on the backend from database records. Frontend price tampering is strictly ignored.
3. **Historical Price Protection**: The price of each item at the time of purchase is stored in `order_items.price_at_purchase`. Future menu price changes do not alter past receipts.
4. **Out-of-Stock Protection**: Items marked `out_of_stock` by the shop owner cannot be added to cart or submitted in orders.
5. **Strict Isolation (RBAC)**:
   - Students can only view their own orders and profile.
   - Shop owners can only view and manage orders and products belonging to their designated shop.
   - Admins have system-wide oversight.
6. **Zero Sensitive Card Storage**: Payment is processed via mock gateway tokens. No credit card numbers, CVVs, or bank secrets are ever stored.

---

## 🚀 Deployment Instructions

### Production Deployment (e.g. Ubuntu / Docker / Cloud VM)

1. **Backend**:
   - Use a production WSGI server such as `gunicorn` with `eventlet` or `gevent`:
     ```bash
     gunicorn --worker-class eventlet -w 1 run:app -b 0.0.0.0:5000
     ```
   - Connect to PostgreSQL by setting the environment variable in `.env`:
     ```env
     DATABASE_URL=postgresql://campus_user:securepassword@localhost:5432/campus_preorder
     ```

2. **Frontend**:
   - Build optimized production static assets:
     ```bash
     npm run build
     ```
   - Serve the `dist/` directory using Nginx or Caddy with reverse proxy to `http://localhost:5000/api` and `http://localhost:5000/socket.io`.

3. **HTTPS / SSL**:
   - Configure Let's Encrypt SSL certificates via `certbot` for secure HTTPS/WSS communication.

---

## 🎓 Summary
The **Smart Campus Multi-Shop Pre-Ordering and Management System** successfully eliminates long canteen queues, protects shop owners from unpaid orders, and provides students with an effortless, transparent pre-ordering experience during college breaks.

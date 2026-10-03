import os
from .models import db, User, Shop, Product, Order, OrderItem, Payment, Notification

def seed_database():
    """Seeds the database with users, shops, and menus if empty."""
    if User.query.first():
        print("[Database] Already seeded.")
        return

    print("[Database] Seeding initial campus data...")

    # 1. ADMIN USER
    admin = User(
        name="Campus Admin Officer",
        email="admin@campus.edu",
        phone="9876543210",
        role="admin",
        status="active"
    )
    admin.set_password("admin123")
    db.session.add(admin)

    # 2. 5 SHOP OWNERS
    owner_fruit = User(name="Anil Rao", email="fruit@campus.edu", phone="9876543211", role="shop_owner", status="active")
    owner_fruit.set_password("password123")

    owner_canteen = User(name="Ramesh Kumar", email="canteen@campus.edu", phone="9876543212", role="shop_owner", status="active")
    owner_canteen.set_password("password123")

    owner_text = User(name="Kavita Reddy", email="text@campus.edu", phone="9876543213", role="shop_owner", status="active")
    owner_text.set_password("password123")

    owner_cafeteria = User(name="Priya Nair", email="cafeteria@campus.edu", phone="9876543214", role="shop_owner", status="active")
    owner_cafeteria.set_password("password123")

    owner_roll = User(name="Sunil Verma", email="roll@campus.edu", phone="9876543215", role="shop_owner", status="active")
    owner_roll.set_password("password123")

    db.session.add_all([owner_fruit, owner_canteen, owner_text, owner_cafeteria, owner_roll])

    # 3. STUDENT USER
    student = User(name="Rahul Sharma", email="student@campus.edu", phone="9876543220", role="student", status="active")
    student.set_password("password123")
    db.session.add(student)

    db.session.flush()

    # 4. 5 CAMPUS SHOPS
    shop_fruit = Shop(
        name="Fresh Fruit & Juice Bar",
        type="FRU",
        owner_id=owner_fruit.id,
        description="Freshly squeezed fruit juices, energizing mocktails, cold milkshakes and cut fruit bowls.",
        image="https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
        location="Campus Ground Floor, Block A",
        status="active"
    )

    shop_canteen = Shop(
        name="Campus Canteen",
        type="CAN",
        owner_id=owner_canteen.id,
        description="Daily baked hot puffs, samosas, crisps, chilled cold drinks and packaged snacks for quick break cravings.",
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        location="Central Food Plaza, Counter 1",
        status="active"
    )

    shop_text = Shop(
        name="Campus Stationery & Text Shop",
        type="TXT",
        owner_id=owner_text.id,
        description="Record notebooks, observation sheets, engineering charts, chargers, pens and academic stationery.",
        image="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
        location="Academic Block 2, Ground Floor",
        status="active"
    )

    shop_cafeteria = Shop(
        name="Main Campus Cafeteria",
        type="CAF",
        owner_id=owner_cafeteria.id,
        description="Hot aromatic Biryanis, sizzling Fried Rice, Hakka Noodles, crispy Dosas and evening chats.",
        image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
        location="Dining Hall, 1st Floor",
        status="active"
    )

    shop_roll = Shop(
        name="Rolls & Fries Express",
        type="ROL",
        owner_id=owner_roll.id,
        description="Crispy Golden Chicken Nuggets, Peri-Peri Wings, Stuffed Kathi Rolls and healthy Veg Salads.",
        image="https://images.unsplash.com/photo-1627042633706-01a5e040c837?w=600&auto=format&fit=crop&q=80",
        location="Campus Student Plaza, Kiosk 4",
        status="active"
    )

    db.session.add_all([shop_fruit, shop_canteen, shop_text, shop_cafeteria, shop_roll])
    db.session.flush()

    # 5. PRODUCTS SEEDING

    # FRUIT SHOP MENU
    fruit_products = [
        {"name": "Watermelon Juice", "category": "Fresh Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80", "desc": "100% pure hydrating chilled watermelon juice."},
        {"name": "Sapota Juice", "category": "Fresh Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80", "desc": "Rich creamy Sapota (Chikoo) freshly blended."},
        {"name": "Carrot Juice", "category": "Healthy Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80", "desc": "Vitamin A loaded cold pressed carrot juice."},
        {"name": "Beetroot Juice", "category": "Healthy Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", "desc": "Natural stamina booster fresh beetroot extract."},
        {"name": "Carrot and Beetroot Juice", "category": "Healthy Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80", "desc": "Power blend of carrot and beetroot with lemon."},
        {"name": "ABC Juice", "category": "Healthy Juices", "price": 40.0, "image": "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&q=80", "desc": "Apple, Beetroot, Carrot detox miracle elixir."},
        {"name": "Chocolate Milkshake", "category": "Milkshakes", "price": 40.0, "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", "desc": "Rich chocolate milkshake with chocolate drizzle."},
        {"name": "Strawberry Milkshake", "category": "Milkshakes", "price": 40.0, "image": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&q=80", "desc": "Creamy strawberry bliss served chilled."},
        {"name": "Butterscotch Milkshake", "category": "Milkshakes", "price": 40.0, "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&q=80", "desc": "Golden butterscotch crunch blended with ice cream."},
        {"name": "Mixed Fruit Bowl", "category": "Fruit Bowls", "price": 30.0, "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&q=80", "desc": "Seasonal fresh cut fruits topped with honey & chaat masala."},
        {"name": "Watermelon Pieces", "category": "Fruit Bowls", "price": 40.0, "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", "desc": "Sweet seedless watermelon chunks ready to eat."},
        {"name": "Sapota Pieces", "category": "Fruit Bowls", "price": 40.0, "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80", "desc": "Chilled sliced sweet sapota fruit box."},
        {"name": "Pineapple Pieces", "category": "Fruit Bowls", "price": 40.0, "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80", "desc": "Juicy pineapple slices sprinkled with mild chili salt."},
        {"name": "Mozambique Juice", "category": "Fresh Juices", "price": 30.0, "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80", "desc": "Refreshing sweet lime / mosambi citrus juice."},
        {"name": "Muskmelon Pieces", "category": "Fruit Bowls", "price": 30.0, "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", "desc": "Tender fragrant sweet muskmelon cubes."}
    ]
    for p in fruit_products:
        db.session.add(Product(shop_id=shop_fruit.id, name=p['name'], category=p['category'], price=p['price'], description=p['desc'], image=p['image'], stock_status='available'))

    # CANTEEN MENU
    canteen_products = [
        {"name": "Bingo Mad Angles", "category": "Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80", "desc": "Crispy triangular spicy nacho crisps."},
        {"name": "Lays Classic Salted", "category": "Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=400&q=80", "desc": "Thin and crispy golden salted potato chips."},
        {"name": "Kurkure Masala Munch", "category": "Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&q=80", "desc": "Tedhe medhe spicy puffed rice & corn snack."},
        {"name": "Kurkure Green Chutney", "category": "Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&q=80", "desc": "Tangy zesty mint chutney flavoured kurkure."},
        {"name": "Hot Samosa (2 pcs)", "category": "Hot Puffs & Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "desc": "Crispy golden crust filled with spiced potatoes and peas."},
        {"name": "Egg Puff", "category": "Hot Puffs & Snacks", "price": 25.0, "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80", "desc": "Flaky puff pastry stuffed with hard boiled egg and masala onion."},
        {"name": "Veg Puff", "category": "Hot Puffs & Snacks", "price": 20.0, "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80", "desc": "Golden flaky vegetable puff baked fresh daily."},
        {"name": "Chicken Puff", "category": "Hot Puffs & Snacks", "price": 30.0, "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80", "desc": "Spicy roasted chicken filling inside crisp butter pastry."},
        {"name": "Sprite Chilled (300ml)", "category": "Cool Drinks", "price": 20.0, "image": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80", "desc": "Clear lemon-lime fizzy soda served ice cold."},
        {"name": "Thums Up (300ml)", "category": "Cool Drinks", "price": 20.0, "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80", "desc": "Strong carbonated spicy cola drink."},
        {"name": "Mountain Dew (300ml)", "category": "Cool Drinks", "price": 20.0, "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80", "desc": "Citrus punch high caffeinated soda."},
        {"name": "Coca Cola (300ml)", "category": "Cool Drinks", "price": 20.0, "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80", "desc": "Classic Coca-Cola refreshing bottle."},
        {"name": "Vanilla Milkshake", "category": "Milkshakes", "price": 35.0, "image": "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=80", "desc": "Smooth sweet aromatic bourbon vanilla shake."},
        {"name": "Oreo Chocolate Shake", "category": "Milkshakes", "price": 45.0, "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", "desc": "Crushed Oreo cookie milkshake with vanilla ice cream."},
        {"name": "Badam Milk (Hot/Cold)", "category": "Milkshakes", "price": 30.0, "image": "https://images.unsplash.com/photo-1568651318042-05f7786481cf?w=400&q=80", "desc": "Almond saffron milk infused with cardamom."}
    ]
    for p in canteen_products:
        db.session.add(Product(shop_id=shop_canteen.id, name=p['name'], category=p['category'], price=p['price'], description=p['desc'], image=p['image'], stock_status='available'))

    # TEXT SHOP MENU
    text_products = [
        {"name": "Record Papers (Rule & Plain Bundle)", "category": "Lab & Records", "price": 60.0, "image": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80", "desc": "Official 100-sheet college laboratory record paper pack."},
        {"name": "Record Pads", "category": "Lab & Records", "price": 30.0, "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", "desc": "Hardboard writing pad for field notes and laboratory experiments."},
        {"name": "Reynolds Ballpoint Pen (Blue/Black)", "category": "Pens & Writing", "price": 10.0, "image": "https://images.unsplash.com/photo-1585336261026-688755c911ba?w=400&q=80", "desc": "Smooth gliding 0.7mm ballpoint exam pen."},
        {"name": "Gel Pen Black 0.5mm", "category": "Pens & Writing", "price": 15.0, "image": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80", "desc": "Waterproof quick dry gel pen for diagrams and titles."},
        {"name": "Parker Vector Rollerball Pen", "category": "Pens & Writing", "price": 120.0, "image": "https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=400&q=80", "desc": "Premium stainless steel rollerball pen with luxury refill."},
        {"name": "Presentation Charts (Pack of 3)", "category": "Stationery", "price": 10.0, "image": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80", "desc": "White and colored thick ivory chart paper sheets for seminars."},
        {"name": "Mobile Charger Fast Type-C", "category": "Electronics & Accessories", "price": 50.0, "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80", "desc": "Emergency 2.4A braided USB Type-C charging cable."},
        {"name": "Engineering Graph Book (60 Pages)", "category": "Stationery", "price": 25.0, "image": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80", "desc": "Millimeter grid graph book for engineering and physics labs."},
        {"name": "Oxford Mathematical Geometry Box", "category": "Stationery", "price": 80.0, "image": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80", "desc": "Precision compass, divider, protractor and set squares."},
        {"name": "Spiral Notebook A4 (200 Pages)", "category": "Stationery", "price": 75.0, "image": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80", "desc": "Durable polypropylene cover spiral journal for lectures."}
    ]
    for p in text_products:
        db.session.add(Product(shop_id=shop_text.id, name=p['name'], category=p['category'], price=p['price'], description=p['desc'], image=p['image'], stock_status='available'))

    # CAFETERIA MENU
    cafeteria_products = [
        {"name": "Chicken Dum Biryani", "category": "Biryani & Rice", "price": 120.0, "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", "desc": "Fragrant basmati rice slow-cooked with tender chicken and aromatic spices, served with raita."},
        {"name": "Veg Biryani", "category": "Biryani & Rice", "price": 120.0, "image": "https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=400&q=80", "desc": "Rich spiced vegetable biryani loaded with paneer cubes and fried onions."},
        {"name": "Chicken Fried Rice", "category": "Biryani & Rice", "price": 60.0, "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", "desc": "Wok tossed Indo-Chinese fried rice with seasoned chicken bits and scallions."},
        {"name": "Gobi Fried Rice", "category": "Biryani & Rice", "price": 60.0, "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80", "desc": "Fragrant rice stir fried with crispy golden cauliflower florets."},
        {"name": "Egg Fried Rice", "category": "Biryani & Rice", "price": 60.0, "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80", "desc": "Scrambled farm fresh eggs tossed with rice and savory soy sauce."},
        {"name": "Veg Hakka Noodles", "category": "Noodles", "price": 60.0, "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80", "desc": "Street style wok fried noodles with crunchy shredded vegetables."},
        {"name": "Gobi Noodles", "category": "Noodles", "price": 60.0, "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", "desc": "Spicy tossed noodles topped with crispy gobi manchurian."},
        {"name": "Chicken Noodles", "category": "Noodles", "price": 80.0, "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80", "desc": "Fiery wok noodles tossed with shredded chicken and garlic."},
        {"name": "Hot Puri (3 pcs) with Aloo Masala", "category": "Tiffins & Breakfast", "price": 30.0, "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "desc": "Fluffy puffed puris served with hot spiced potato bhaji."},
        {"name": "Crispy Plain Dosa", "category": "Tiffins & Breakfast", "price": 40.0, "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80", "desc": "Golden fermented crepe roasted with ghee, served with coconut chutney & sambar."},
        {"name": "Karam Dosa", "category": "Tiffins & Breakfast", "price": 40.0, "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80", "desc": "Traditional spicy red chili garlic chutney spread on crisp dosa."},
        {"name": "Onion Dosa", "category": "Tiffins & Breakfast", "price": 50.0, "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80", "desc": "Crispy dosa filled with caramelized onions and green chilies."},
        {"name": "Panipuri (8 pcs)", "category": "Evening Chats", "price": 20.0, "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80", "desc": "Hollow crispy puris filled with spiced potato and mint sweet tamarind water."},
        {"name": "Gobi Chat", "category": "Evening Chats", "price": 30.0, "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "desc": "Crispy fried cauliflower tossed in sweet tangy chat chutneys and sev."},
        {"name": "Chicken Rice", "category": "Biryani & Rice", "price": 60.0, "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80", "desc": "Flavorful steamed rice served with chicken curry and spicy gravy."}
    ]
    for p in cafeteria_products:
        db.session.add(Product(shop_id=shop_cafeteria.id, name=p['name'], category=p['category'], price=p['price'], description=p['desc'], image=p['image'], stock_status='available'))

    # ROLL SHOP MENU
    roll_products = [
        {"name": "Crispy Chicken Nuggets (6 pcs)", "category": "Appetizers & Starters", "price": 120.0, "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80", "desc": "Golden crusted tender chicken bites served with garlic dip."},
        {"name": "Chicken Wings (4 pcs)", "category": "Appetizers & Starters", "price": 120.0, "image": "https://images.unsplash.com/photo-1527477378406-1317150857b8?w=400&q=80", "desc": "Succulent roasted chicken wings glazed in barbecue glaze."},
        {"name": "Chicken Peri-Peri Strips", "category": "Appetizers & Starters", "price": 120.0, "image": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&q=80", "desc": "Spicy peri-peri seasoned boneless chicken fillets."},
        {"name": "Veg Special Roll", "category": "Kathi Rolls", "price": 80.0, "image": "https://images.unsplash.com/photo-1627042633706-01a5e040c837?w=400&q=80", "desc": "Loaded wrap with fresh paneer, spiced vegetables, mint chutney and cheese."},
        {"name": "Classic Veg Roll", "category": "Kathi Rolls", "price": 60.0, "image": "https://images.unsplash.com/photo-1627042633706-01a5e040c837?w=400&q=80", "desc": "Crispy paratha wrap stuffed with seasoned carrots, cabbage & capsicum."},
        {"name": "Crispy Gobi Roll", "category": "Kathi Rolls", "price": 60.0, "image": "https://images.unsplash.com/photo-1627042633706-01a5e040c837?w=400&q=80", "desc": "Spicy golden cauliflower florets rolled in flaky rumali roti."},
        {"name": "Chicken Egg Roll", "category": "Kathi Rolls", "price": 80.0, "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80", "desc": "Double egg coated paratha wrapped around grilled spicy chicken chunks."},
        {"name": "Classic Chicken Roll", "category": "Kathi Rolls", "price": 80.0, "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80", "desc": "Juicy roasted tandoori chicken tikka rolled with onions and lime."},
        {"name": "Paneer Tikka Roll", "category": "Kathi Rolls", "price": 80.0, "image": "https://images.unsplash.com/photo-1627042633706-01a5e040c837?w=400&q=80", "desc": "Char-grilled spiced cottage cheese cubes wrapped in warm layered flatbread."},
        {"name": "Crispy Veg Sticks", "category": "Appetizers & Starters", "price": 60.0, "image": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80", "desc": "Breaded mixed vegetable fingers fried to a crunchy finish."},
        {"name": "Healthy Garden Veg Salad", "category": "Healthy Bites", "price": 80.0, "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80", "desc": "Crisp iceberg lettuce, cucumber, cherry tomatoes, olives and lemon vinaigrette."}
    ]
    for p in roll_products:
        db.session.add(Product(shop_id=shop_roll.id, name=p['name'], category=p['category'], price=p['price'], description=p['desc'], image=p['image'], stock_status='available'))

    db.session.commit()
    print("[Database] Seed data successfully committed to database!")

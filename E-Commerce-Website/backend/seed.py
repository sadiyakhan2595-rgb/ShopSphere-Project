"""Seed database with admin user and sample products"""
import sys
sys.path.append(".")

from core.database import SessionLocal, engine, Base
from core.security import hash_password
from models.user import User
from models.product import Product
from models.shop import CartItem, Order, OrderItem, Payment, Review, WishlistItem
from models import UserRole

Base.metadata.create_all(bind=engine)

SAMPLE_PRODUCTS = [
    {"name": "Wireless Noise-Cancelling Headphones", "description": "Premium over-ear headphones with 30-hour battery life, active noise cancellation, and hi-res audio support.", "price": 4999, "stock": 50, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"},
    {"name": "Minimalist Leather Wallet", "description": "Slim RFID-blocking leather wallet. Holds up to 8 cards with a dedicated cash slot.", "price": 899, "stock": 120, "category": "Accessories", "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500"},
    {"name": "Mechanical Keyboard", "description": "Tenkeyless mechanical keyboard with Cherry MX switches, RGB backlight, and aluminum frame.", "price": 6499, "stock": 30, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"},
    {"name": "Yoga Mat Premium", "description": "Non-slip 6mm thick yoga mat with alignment lines, carrying strap, and sweat-resistant surface.", "price": 1299, "stock": 80, "category": "Sports", "image_url": "https://images.unsplash.com/photo-1601925228518-e5d48e3ba4b0?w=500"},
    {"name": "Ceramic Pour-Over Coffee Set", "description": "Handcrafted ceramic dripper with server, filters, and a precision gooseneck kettle.", "price": 2199, "stock": 45, "category": "Kitchen", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"},
    {"name": "Linen Shirt - Off White", "description": "Relaxed-fit 100% European linen shirt. Breathable, pre-washed for softness. Available in multiple sizes.", "price": 1799, "stock": 60, "category": "Clothing", "image_url": "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500"},
    {"name": "Smart Water Bottle", "description": "Hydration-tracking bottle with LED reminder, temperature display, and 500ml BPA-free capacity.", "price": 1499, "stock": 90, "category": "Sports", "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"},
    {"name": "Wireless Charging Pad", "description": "15W fast wireless charger compatible with all Qi devices. Ultra-slim design with anti-slip surface.", "price": 799, "stock": 150, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1591703713835-84dee1b4d0e9?w=500"},
    {"name": "Scented Soy Candle Set", "description": "Set of 3 hand-poured soy wax candles. Fragrances: Cedarwood, Vanilla Musk, and Ocean Breeze. 40hr burn each.", "price": 999, "stock": 70, "category": "Home", "image_url": "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500"},
    {"name": "Portable Bluetooth Speaker", "description": "360° sound, IPX7 waterproof, 12-hour playtime. Compact enough to fit in any bag.", "price": 3499, "stock": 40, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"},
    {"name": "Hardcover Dot Grid Notebook", "description": "A5 dotted journal with 200 GSM thick pages, lay-flat binding, and an elastic closure band.", "price": 549, "stock": 200, "category": "Stationery", "image_url": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500"},
    {"name": "Plant-Based Protein Powder", "description": "25g protein per serving, no artificial sweeteners. Chocolate flavour. 30 servings per bag.", "price": 1899, "stock": 55, "category": "Health", "image_url": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500"},
]

def seed():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@shopsphere.com").first()
        if not admin:
            admin = User(name="Admin", email="admin@shopsphere.com", password=hash_password("Admin@123"), role=UserRole.admin)
            db.add(admin)
            print("[OK] Admin user created: admin@shopsphere.com / Admin@123")
        
        demo = db.query(User).filter(User.email == "demo@shopsphere.com").first()
        if not demo:
            demo = User(name="Demo User", email="demo@shopsphere.com", password=hash_password("Demo@123"), role=UserRole.user)
            db.add(demo)
            print("[OK] Demo user created: demo@shopsphere.com / Demo@123")
        
        if db.query(Product).count() == 0:
            for p in SAMPLE_PRODUCTS:
                db.add(Product(**p))
            print(f"[OK] {len(SAMPLE_PRODUCTS)} sample products added")
        else:
            print("-> Products already exist, skipping")
        
        db.commit()
        print("[OK] Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

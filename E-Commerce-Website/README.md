# ShopSphere — Full-Stack E-Commerce Platform

A modern, scalable e-commerce application built with **FastAPI** + **React** + **PostgreSQL** + **Razorpay**.

---

## 📁 Project Structure

```
shopsphere/
├── backend/                    # FastAPI application
│   ├── core/
│   │   ├── config.py           # Settings & env vars
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   └── security.py         # JWT, bcrypt, auth guards
│   ├── models/
│   │   ├── __init__.py         # Enums (UserRole, OrderStatus, etc.)
│   │   ├── user.py             # User model
│   │   ├── product.py          # Product model
│   │   └── shop.py             # Cart, Order, Payment, Review, Wishlist
│   ├── schemas/
│   │   └── __init__.py         # All Pydantic schemas
│   ├── routes/
│   │   ├── auth.py             # /api/auth/*
│   │   ├── products.py         # /api/products/*
│   │   ├── cart.py             # /api/cart/*
│   │   ├── orders.py           # /api/orders/*
│   │   ├── payments.py         # /api/payments/*
│   │   ├── admin.py            # /api/admin/*
│   │   └── wishlist.py         # /api/wishlist/*
│   ├── main.py                 # FastAPI app entry
│   ├── seed.py                 # DB seed script
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                   # React application
    ├── src/
    │   ├── api/client.js        # Axios instance
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── ui.jsx           # Shared UI components
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── WishlistPage.jsx
    │   │   ├── LoginPage.jsx    # (also exports SignupPage)
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       └── AdminOrders.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+
- A **Razorpay** account (free test account works): https://razorpay.com

---

## 🚀 Quick Start

### 1. Clone & Setup Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE shopsphere;"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/shopsphere
#   SECRET_KEY=your-random-secret-key-min-32-chars
#   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
#   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Seed the database (creates admin + 12 sample products)
python seed.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🔑 Default Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@shopsphere.com     | Admin@123  |
| Demo  | (register via /signup)   | -          |

---

## 💳 Razorpay Setup

1. Sign up at https://razorpay.com → Dashboard → Settings → API Keys
2. Generate a **Test Mode** key pair
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Reload the backend

**Test Cards (Razorpay Test Mode):**
- Card: `4111 1111 1111 1111` | Expiry: Any future | CVV: Any 3 digits
- UPI: `success@razorpay`
- Net Banking: Any bank → use test credentials shown

> **Without Razorpay keys:** Use the "🧪 Simulate Payment" button on the checkout page — it marks orders as paid without any real payment.

---

## 🗄️ Database Schema

```
Users          id, name, email, password(hashed), role, is_active, created_at
Products       id, name, description, price, stock, category, image_url, is_active
CartItems      id, user_id→Users, product_id→Products, quantity
Orders         id, user_id→Users, total_price, status, shipping_address, created_at
OrderItems     id, order_id→Orders, product_id→Products, quantity, price
Payments       id, order_id→Orders, razorpay_order_id, payment_id, signature, amount, status
Reviews        id, user_id→Users, product_id→Products, rating(1-5), comment
WishlistItems  id, user_id→Users, product_id→Products
```

---

## 🛣️ API Reference

### Auth
| Method | Endpoint             | Auth | Description          |
|--------|----------------------|------|----------------------|
| POST   | /api/auth/signup     | ✗    | Register user        |
| POST   | /api/auth/login      | ✗    | Login (returns JWT)  |
| GET    | /api/auth/me         | ✓    | Get current user     |

### Products
| Method | Endpoint                         | Auth  | Description              |
|--------|----------------------------------|-------|--------------------------|
| GET    | /api/products/                   | ✗     | List (search/filter/sort)|
| GET    | /api/products/categories         | ✗     | List categories          |
| GET    | /api/products/{id}               | ✗     | Product detail           |
| GET    | /api/products/{id}/reviews       | ✗     | Product reviews          |
| POST   | /api/products/{id}/reviews       | ✓     | Add review               |

### Cart
| Method | Endpoint          | Auth | Description         |
|--------|-------------------|------|---------------------|
| GET    | /api/cart/        | ✓    | Get cart            |
| POST   | /api/cart/        | ✓    | Add item            |
| PUT    | /api/cart/{id}    | ✓    | Update quantity      |
| DELETE | /api/cart/{id}    | ✓    | Remove item         |
| DELETE | /api/cart/        | ✓    | Clear cart          |

### Orders
| Method | Endpoint              | Auth | Description      |
|--------|-----------------------|------|------------------|
| POST   | /api/orders/checkout  | ✓    | Place order      |
| GET    | /api/orders/          | ✓    | Order history    |
| GET    | /api/orders/{id}      | ✓    | Order detail     |

### Payments
| Method | Endpoint                              | Auth | Description              |
|--------|---------------------------------------|------|--------------------------|
| POST   | /api/payments/create-order            | ✓    | Create Razorpay order    |
| POST   | /api/payments/verify                  | ✓    | Verify payment signature |
| POST   | /api/payments/simulate-success/{id}   | ✓    | Test mode simulation     |

### Admin (admin role required)
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/admin/dashboard      | Stats & recent orders|
| GET    | /api/admin/products       | All products         |
| POST   | /api/admin/products       | Create product       |
| PUT    | /api/admin/products/{id}  | Update product       |
| DELETE | /api/admin/products/{id}  | Archive product      |
| GET    | /api/admin/orders         | All orders (filter)  |
| PUT    | /api/admin/orders/{id}    | Update order status  |
| GET    | /api/admin/users          | All users            |

---

## 🌟 Features

### User-Facing
- ✅ JWT authentication (signup/login)
- ✅ Product grid with search, category filter, price filter, sort
- ✅ Product detail page with image, description, stock status
- ✅ Star ratings & customer reviews
- ✅ Add/remove/update cart
- ✅ Wishlist (save for later)
- ✅ Checkout with Razorpay payment
- ✅ Test mode payment simulation
- ✅ Order history with expandable details
- ✅ Payment status tracking

### Admin Panel
- ✅ Dashboard stats (orders, revenue, products, customers)
- ✅ Pending orders alert
- ✅ CRUD for products (with image URL, stock, category)
- ✅ Order management with inline status update
- ✅ Filter orders by status

---

## 🏗️ Production Deployment

### Backend (e.g., Railway, Render, EC2)
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Environment vars to set:
DATABASE_URL=postgresql://...
SECRET_KEY=<long-random-string>
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

### Frontend (e.g., Vercel, Netlify)
```bash
npm run build
# Deploy the dist/ folder
# Set VITE_API_URL env var if backend is on different domain
# Update vite.config.js proxy or use CORS
```

---

## 🔧 Optional Enhancements (Implemented Stubs)

- **Cloudinary image upload**: Replace `image_url` field with file upload → Cloudinary SDK
- **Email confirmation**: Add `fastapi-mail` + SMTP settings
- **Coupons**: Add `Coupon` model with code, discount_pct, min_order
- **Pagination**: Products endpoint already supports `skip`/`limit`

---

## 📦 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | FastAPI, SQLAlchemy, PostgreSQL, Alembic|
| Auth     | JWT (python-jose), bcrypt (passlib)     |
| Payments | Razorpay                                |
| Frontend | React 18, React Router 6, Axios         |
| Styling  | Tailwind CSS, DM Sans + Fraunces fonts  |
| Build    | Vite                                    |

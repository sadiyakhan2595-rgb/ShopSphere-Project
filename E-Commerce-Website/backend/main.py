from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from core.database import engine, Base
from routes import auth, products, cart, orders, payments, admin, wishlist
from seed import seed

Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(
    title="ShopSphere API",
    description="Modern E-Commerce Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Simplified for easier deployment, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "ShopSphere API is running correctly",
        "instructions": "Visit http://localhost:3000 to view the main website",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from core.database import get_db
from core.security import get_current_admin
from models.user import User
from models.product import Product
from models.shop import Order, Payment
from models import OrderStatus
from schemas import ProductCreate, ProductUpdate, ProductResponse, OrderResponse, AdminOrderUpdate, DashboardStats

router = APIRouter()

# ─── Products ──────────────────────────────────────────
@router.post("/products", response_model=ProductResponse, status_code=201)
def create_product(
    product_data: ProductCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    update: ProductUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deleted"}

@router.get("/products", response_model=List[ProductResponse])
def admin_list_products(
    skip: int = 0,
    limit: int = 50,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Product).offset(skip).limit(limit).all()

# ─── Orders ────────────────────────────────────────────
@router.get("/orders", response_model=List[OrderResponse])
def list_all_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.status == status)
    return q.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/orders/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    update: AdminOrderUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = update.status
    db.commit()
    db.refresh(order)
    return order

# ─── Dashboard ─────────────────────────────────────────
@router.get("/dashboard", response_model=DashboardStats)
def dashboard(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.sum(Order.total_price)).filter(Order.status != "cancelled").scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_users = db.query(func.count(User.id)).filter(User.role == "user").scalar()
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar()
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    
    return DashboardStats(
        total_orders=total_orders,
        total_revenue=round(float(total_revenue), 2),
        total_products=total_products,
        total_users=total_users,
        pending_orders=pending_orders,
        recent_orders=recent_orders
    )

# ─── Users ─────────────────────────────────────────────
@router.get("/users")
def list_users(skip: int = 0, limit: int = 50, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.shop import CartItem, Order, OrderItem, Payment
from models.product import Product
from models.user import User
from models import PaymentStatus
from schemas import OrderResponse, CheckoutRequest

router = APIRouter()

@router.post("/checkout", response_model=OrderResponse, status_code=201)
def checkout(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = 0
    order_items_data = []
    for ci in cart_items:
        product = db.query(Product).filter(Product.id == ci.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product '{product.name if product else ci.product_id}' is unavailable")
        if product.stock < ci.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'")
        total += product.price * ci.quantity
        order_items_data.append({"product": product, "quantity": ci.quantity, "price": product.price})
    
    order = Order(
        user_id=current_user.id,
        total_price=round(total, 2),
        shipping_address=checkout_data.shipping_address
    )
    db.add(order)
    db.flush()
    
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(order_item)
        item_data["product"].stock -= item_data["quantity"]
    
    payment = Payment(order_id=order.id, amount=round(total, 2), status=PaymentStatus.pending)
    db.add(payment)
    
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[OrderResponse])
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

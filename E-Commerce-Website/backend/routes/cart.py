from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.shop import CartItem
from models.product import Product
from models.user import User
from schemas import CartItemCreate, CartItemUpdate, CartItemResponse

router = APIRouter()

@router.get("/", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

@router.post("/", response_model=CartItemResponse, status_code=201)
def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        if existing.quantity > product.stock:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        db.commit()
        db.refresh(existing)
        return existing
    
    cart_item = CartItem(user_id=current_user.id, **item.model_dump())
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if update.quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(status_code=200, detail="Item removed")
    
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if product.stock < update.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    item.quantity = update.quantity
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}

@router.delete("/")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.shop import WishlistItem
from models.product import Product
from models.user import User
from schemas import WishlistResponse

router = APIRouter()

@router.get("/", response_model=List[WishlistResponse])
def get_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()

@router.post("/")
def add_to_wishlist(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id).first()
    if existing:
        return existing
    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{product_id}")
def remove_from_wishlist(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not in wishlist")
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from core.database import get_db
from core.security import get_current_user, get_current_admin
from models.product import Product
from models.shop import Review
from models.user import User
from schemas import ProductResponse, ReviewCreate, ReviewResponse

router = APIRouter()

def enrich_product(product: Product, db: Session) -> dict:
    avg = db.query(func.avg(Review.rating)).filter(Review.product_id == product.id).scalar()
    count = db.query(func.count(Review.id)).filter(Review.product_id == product.id).scalar()
    d = {c.name: getattr(product, c.name) for c in product.__table__.columns}
    d["avg_rating"] = round(float(avg), 1) if avg else None
    d["review_count"] = count or 0
    return d

@router.get("/", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.category.ilike(f"%{search}%"))
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    col = getattr(Product, sort_by, Product.created_at)
    query = query.order_by(col.desc() if order == "desc" else col.asc())
    
    products = query.offset(skip).limit(limit).all()
    return [enrich_product(p, db) for p in products]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Product.category).filter(Product.is_active == True).distinct().all()
    return [c[0] for c in cats if c[0]]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return enrich_product(product, db)

@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).all()

@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=201)
def add_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing = db.query(Review).filter(Review.user_id == current_user.id, Review.product_id == product_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    review = Review(user_id=current_user.id, product_id=product_id, **review_data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

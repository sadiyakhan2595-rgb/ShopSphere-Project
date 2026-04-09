from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import OrderStatus, PaymentStatus, UserRole

# ─── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ─── Products ──────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: str
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ReviewSummary(BaseModel):
    rating: float
    count: int

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category: str
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    avg_rating: Optional[float] = None
    review_count: Optional[int] = 0
    model_config = {"from_attributes": True}

# ─── Cart ──────────────────────────────────────────────
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse
    model_config = {"from_attributes": True}

# ─── Orders ────────────────────────────────────────────
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductResponse
    model_config = {"from_attributes": True}

class PaymentResponse(BaseModel):
    id: int
    razorpay_order_id: Optional[str]
    payment_id: Optional[str]
    amount: float
    status: PaymentStatus
    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: OrderStatus
    shipping_address: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse] = []
    payment: Optional[PaymentResponse] = None
    model_config = {"from_attributes": True}

class CheckoutRequest(BaseModel):
    shipping_address: str

# ─── Payments ──────────────────────────────────────────
class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: int

class CreatePaymentOrder(BaseModel):
    order_id: int

# ─── Reviews ───────────────────────────────────────────
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user: UserResponse
    model_config = {"from_attributes": True}

# ─── Admin ─────────────────────────────────────────────
class AdminOrderUpdate(BaseModel):
    status: OrderStatus

class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_products: int
    total_users: int
    pending_orders: int
    recent_orders: List[OrderResponse] = []

# ─── Wishlist ──────────────────────────────────────────
class WishlistResponse(BaseModel):
    id: int
    product_id: int
    product: ProductResponse
    model_config = {"from_attributes": True}

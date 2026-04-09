from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

# Import all models to register them with Base
from models.user import User
from models.product import Product
from models.shop import CartItem, Order, OrderItem, Payment, Review, WishlistItem

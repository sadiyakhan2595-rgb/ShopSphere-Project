import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from core.config import settings
from models.shop import Order, Payment
from models.user import User
from models import PaymentStatus, OrderStatus
from schemas import PaymentVerify, CreatePaymentOrder, PaymentResponse

router = APIRouter()

def get_razorpay_client():
    try:
        import razorpay
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    except Exception:
        return None

@router.post("/create-order")
def create_payment_order(
    data: CreatePaymentOrder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == data.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    if payment.status == PaymentStatus.completed:
        raise HTTPException(status_code=400, detail="Order already paid")
    
    client = get_razorpay_client()
    if not client:
        raise HTTPException(status_code=503, detail="Payment service unavailable")
    
    try:
        amount_paise = int(order.total_price * 100)
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"order_{order.id}",
            "notes": {"order_id": str(order.id), "user_id": str(current_user.id)}
        })
        
        payment.razorpay_order_id = razorpay_order["id"]
        db.commit()
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_paise,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID,
            "order_id": order.id,
            "name": "ShopSphere",
            "description": f"Order #{order.id}",
            "prefill": {
                "name": current_user.name,
                "email": current_user.email,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == data.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Verify signature
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected, data.razorpay_signature):
        payment.status = PaymentStatus.failed
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    payment.payment_id = data.razorpay_payment_id
    payment.signature = data.razorpay_signature
    payment.status = PaymentStatus.completed
    order.status = OrderStatus.paid
    db.commit()
    db.refresh(order)
    
    return {"message": "Payment verified successfully", "order_id": order.id, "status": "paid"}

@router.post("/simulate-success/{order_id}")
def simulate_payment_success(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """For testing without real Razorpay credentials"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if payment:
        payment.payment_id = f"pay_simulated_{order_id}"
        payment.status = PaymentStatus.completed
    order.status = OrderStatus.paid
    db.commit()
    
    return {"message": "Payment simulated successfully", "order_id": order.id}

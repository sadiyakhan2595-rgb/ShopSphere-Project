import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, ErrorMsg } from '../components/ui'

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { items, totalPrice, fetchCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [step, setStep] = useState('address') // 'address' | 'payment' | 'success'
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) { setError('Please enter your shipping address'); return }
    setLoading(true); setError('')
    try {
      const { data: newOrder } = await api.post('/orders/checkout', { shipping_address: address })
      setOrder(newOrder)
      setStep('payment')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order')
    } finally { setLoading(false) }
  }

  const handleRazorpay = async () => {
    setLoading(true); setError('')
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay SDK failed to load')

      const { data: paymentOrder } = await api.post('/payments/create-order', { order_id: order.id })

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: paymentOrder.name,
        description: paymentOrder.description,
        order_id: paymentOrder.razorpay_order_id,
        prefill: paymentOrder.prefill,
        theme: { color: '#1c1917' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
            })
            await fetchCart()
            setStep('success')
          } catch {
            setError('Payment verification failed. Please contact support.')
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'))
      rzp.open()
    } catch (err) {
      setError(err.message || 'Payment initialization failed')
      setLoading(false)
    }
  }

  const handleSimulatePayment = async () => {
    setLoading(true); setError('')
    try {
      await api.post(`/payments/simulate-success/${order.id}`)
      await fetchCart()
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Simulation failed')
    } finally { setLoading(false) }
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="font-display text-3xl font-medium text-stone-900">Order Placed!</h1>
        <p className="text-stone-500 mt-2 mb-2">Your order #{order?.id} has been confirmed.</p>
        <p className="text-stone-400 text-sm mb-8">We'll send you a confirmation once it ships.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary">View Orders</Link>
          <Link to="/products" className="btn-secondary">Keep Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Step */}
          {step === 'address' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display text-xl font-medium text-stone-900">Shipping Address</h2>
              </div>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                  <input className="input" value={user?.name} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                  <input className="input" value={user?.email} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Address *</label>
                  <textarea
                    className="input h-28 resize-none"
                    placeholder="House/Flat No., Street, Area, City, State, PIN Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <ErrorMsg message={error} />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Placing Order...' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display text-xl font-medium text-stone-900">Payment</h2>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 mb-5 text-sm text-stone-600">
                <p><strong>Order #{order?.id}</strong> — {formatPrice(order?.total_price)}</p>
                <p className="mt-1 text-stone-500">Shipping to: {address}</p>
              </div>

              <ErrorMsg message={error} />

              <div className="space-y-3 mt-4">
                <button onClick={handleRazorpay} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {loading ? 'Processing...' : `Pay ${formatPrice(order?.total_price)} with Razorpay`}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 shrink-0">or for testing</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                <button onClick={handleSimulatePayment} disabled={loading} className="btn-secondary w-full">
                  🧪 Simulate Payment (Test Mode)
                </button>
              </div>

              <p className="text-xs text-stone-400 text-center mt-4">
                🔒 Payments are secured via Razorpay 256-bit encryption
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-display text-xl font-medium text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.product.image_url || `https://placehold.co/48x48/f5f5f4/a8a29e?text=${item.product.name.slice(0,2)}`}
                    onError={(e) => { e.target.src = `https://placehold.co/48x48/f5f5f4/a8a29e?text=?` }}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4">
              <div className="flex justify-between text-sm text-stone-600 mb-1">
                <span>Subtotal</span><span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600 mb-3">
                <span>Shipping</span><span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between font-medium text-stone-900">
                <span>Total</span>
                <span className="font-display text-lg">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

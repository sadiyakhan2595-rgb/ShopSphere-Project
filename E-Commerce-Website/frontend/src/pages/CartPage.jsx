import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice, EmptyState, PageLoader } from '../components/ui'

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart()

  if (loading) return <PageLoader />

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our products and add something you love."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-medium text-stone-900 mb-8">
        Your Cart <span className="text-stone-400 font-light">({totalItems} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const fallback = `https://placehold.co/100x100/f5f5f4/a8a29e?text=${encodeURIComponent(item.product.name.slice(0,10))}`
            return (
              <div key={item.id} className="card p-4 flex gap-4 items-center">
                <Link to={`/products/${item.product_id}`}>
                  <img
                    src={item.product.image_url || fallback}
                    onError={(e) => { e.target.src = fallback }}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-50 shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="font-medium text-stone-900 text-sm leading-snug hover:text-stone-600 line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-stone-500 text-xs mt-0.5">{item.product.category}</p>
                  <p className="font-display text-base font-medium text-stone-900 mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-stone-50 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium border-x border-stone-200 min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="px-2.5 py-1.5 hover:bg-stone-50 transition-colors disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-stone-700">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-display text-xl font-medium text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-stone-600">
                  <span className="truncate max-w-[160px]">{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between font-medium text-stone-900">
              <span>Total</span>
              <span className="font-display text-lg">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-stone-400 mt-1 text-right">Taxes & shipping calculated at checkout</p>
            <Link to="/checkout" className="btn-primary w-full text-center mt-4 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/products" className="btn-secondary w-full text-center mt-2 block">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

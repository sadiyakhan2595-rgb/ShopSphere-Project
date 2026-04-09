import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api/client'
import { PageLoader, StatusBadge, EmptyState, formatPrice, formatDate } from '../components/ui'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders/').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-medium text-stone-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <div
                className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-stone-900">Order #{order.id}</span>
                    <StatusBadge status={order.status} />
                    {order.payment && <StatusBadge status={order.payment.status} />}
                  </div>
                  <p className="text-sm text-stone-500">{formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-medium text-stone-900">{formatPrice(order.total_price)}</span>
                  {expanded === order.id ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-stone-100 p-5 space-y-4">
                  {order.shipping_address && (
                    <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-600">
                      <p className="font-medium text-stone-700 mb-1">Shipping Address</p>
                      <p>{order.shipping_address}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const fallback = `https://placehold.co/56x56/f5f5f4/a8a29e?text=${encodeURIComponent(item.product.name.slice(0,2))}`
                      return (
                        <div key={item.id} className="flex gap-3 items-center">
                          <img
                            src={item.product.image_url || fallback}
                            onError={(e) => { e.target.src = fallback }}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover bg-stone-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link to={`/products/${item.product_id}`} className="text-sm font-medium text-stone-900 hover:text-stone-600 line-clamp-1">
                              {item.product.name}
                            </Link>
                            <p className="text-stone-500 text-xs mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <p className="text-sm font-medium text-stone-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      )
                    })}
                  </div>

                  {order.payment && (
                    <div className="border-t border-stone-100 pt-3 text-xs text-stone-400 space-y-0.5">
                      {order.payment.payment_id && <p>Payment ID: {order.payment.payment_id}</p>}
                      <p>Amount: {formatPrice(order.payment.amount)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

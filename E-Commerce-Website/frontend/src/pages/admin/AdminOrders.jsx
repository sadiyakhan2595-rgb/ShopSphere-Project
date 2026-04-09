import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import api from '../../api/client'
import { PageLoader, StatusBadge, formatPrice, formatDate } from '../../components/ui'

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    const params = filterStatus ? { status: filterStatus } : {}
    api.get('/admin/orders', { params: { ...params, limit: 100 } })
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setLoading(true); fetchOrders() }, [filterStatus])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.put(`/admin/orders/${orderId}`, { status })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
    } finally { setUpdating(null) }
  }

  const filtered = orders.filter(o =>
    o.id.toString().includes(search) ||
    o.status.includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-medium text-stone-900">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input className="input pl-9 max-w-xs" placeholder="Search by order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterStatus('')} className={`badge cursor-pointer ${!filterStatus ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'} transition-colors`}>
            All
          </button>
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`badge cursor-pointer capitalize ${filterStatus === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'} transition-colors`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <p className="text-stone-400 text-sm">No orders found</p>
            </div>
          ) : filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div
                className="p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-stone-900 text-sm">Order #{order.id}</span>
                    <StatusBadge status={order.status} />
                    {order.payment && <StatusBadge status={order.payment.status} />}
                  </div>
                  <p className="text-stone-400 text-xs mt-0.5">{formatDate(order.created_at)} · {order.items?.length || 0} items</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-medium text-stone-900">{formatPrice(order.total_price)}</span>

                  {/* Status updater */}
                  <div onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900/20 bg-white cursor-pointer"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {expanded === order.id ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-stone-100 p-4 space-y-4">
                  {order.shipping_address && (
                    <div className="bg-stone-50 rounded-xl p-3 text-sm">
                      <p className="font-medium text-stone-700 text-xs mb-1">Shipping Address</p>
                      <p className="text-stone-600">{order.shipping_address}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center text-sm">
                        <img
                          src={item.product?.image_url || `https://placehold.co/40x40/f5f5f4/a8a29e?text=?`}
                          onError={(e) => { e.target.src = `https://placehold.co/40x40/f5f5f4/a8a29e?text=?` }}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-stone-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 truncate">{item.product?.name}</p>
                          <p className="text-stone-400 text-xs">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  {order.payment?.payment_id && (
                    <p className="text-xs text-stone-400 border-t border-stone-100 pt-3">
                      Payment ID: {order.payment.payment_id}
                    </p>
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

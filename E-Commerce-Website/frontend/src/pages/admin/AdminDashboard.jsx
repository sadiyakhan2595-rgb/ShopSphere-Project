import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import api from '../../api/client'
import { PageLoader, StatusBadge, formatPrice, formatDate } from '../../components/ui'

function StatCard({ icon: Icon, label, value, color = 'bg-stone-100 text-stone-600' }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-stone-500 text-sm">{label}</p>
        <p className="font-display text-2xl font-medium text-stone-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders.toLocaleString()} color="bg-violet-100 text-violet-600" />
        <StatCard icon={TrendingUp} label="Revenue" value={formatPrice(stats.total_revenue)} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Package} label="Products" value={stats.total_products.toLocaleString()} color="bg-sky-100 text-sky-600" />
        <StatCard icon={Users} label="Customers" value={stats.total_users.toLocaleString()} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Pending Orders Alert */}
      {stats.pending_orders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900 text-sm">{stats.pending_orders} pending order{stats.pending_orders !== 1 ? 's' : ''}</p>
              <p className="text-amber-700 text-xs">Require your attention</p>
            </div>
          </div>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors">
            View <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-stone-100">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-medium text-stone-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-stone-50">
          {stats.recent_orders.length === 0 ? (
            <p className="p-6 text-center text-stone-400 text-sm">No orders yet</p>
          ) : (
            stats.recent_orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors">
                <div>
                  <p className="font-medium text-stone-900 text-sm">Order #{order.id}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{formatDate(order.created_at)} · {order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-medium text-stone-900 text-sm">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

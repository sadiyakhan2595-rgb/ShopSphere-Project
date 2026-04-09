import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Users, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-stone-800">
          <p className="font-display text-lg font-medium">ShopSphere</p>
          <p className="text-stone-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-800 space-y-1">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors">
            <ExternalLink className="w-4 h-4" /> View Store
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="p-4 border-t border-stone-800">
          <p className="text-xs text-stone-500 truncate">{user?.name}</p>
          <p className="text-xs text-stone-600 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

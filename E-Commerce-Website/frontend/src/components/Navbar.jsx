import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, Package, LogOut, User, LayoutDashboard, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (location.pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-medium text-stone-900 hidden sm:block">ShopSphere</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/products" className="btn-ghost">Shop</Link>
            {user ? (
              <>
                <Link to="/wishlist" className="btn-ghost">
                  <Heart className="w-4 h-4" />
                </Link>
                <Link to="/orders" className="btn-ghost">Orders</Link>
                {isAdmin && (
                  <Link to="/admin" className="btn-ghost text-violet-600">
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/cart" className="relative btn-ghost">
                  <ShoppingBag className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-stone-400 hover:text-red-500">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/signup" className="btn-primary !py-2">Sign up</Link>
              </>
            )}
          </nav>

          {/* Mobile: Cart + Menu */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link to="/cart" className="relative p-2">
                <ShoppingBag className="w-5 h-5 text-stone-700" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-stone-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-stone-100 pt-3">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 rounded-xl text-sm focus:outline-none"
              />
            </form>
            <Link to="/products" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Shop</Link>
            {user ? (
              <>
                <Link to="/wishlist" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                <Link to="/orders" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Orders</Link>
                {isAdmin && <Link to="/admin" className="block btn-ghost w-full text-left text-violet-600" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={handleLogout} className="block btn-ghost w-full text-left text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="block btn-primary w-full text-center" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

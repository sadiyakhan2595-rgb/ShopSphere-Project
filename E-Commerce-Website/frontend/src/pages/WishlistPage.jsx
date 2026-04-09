import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import api from '../api/client'
import { PageLoader, EmptyState, formatPrice } from '../components/ui'
import { useCart } from '../context/CartContext'

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const fetchWishlist = () => {
    api.get('/wishlist/').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchWishlist() }, [])

  const remove = async (productId) => {
    await api.delete(`/wishlist/${productId}`)
    setItems(items.filter(i => i.product_id !== productId))
  }

  const moveToCart = async (productId) => {
    await addToCart(productId, 1)
    await remove(productId)
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-medium text-stone-900 mb-8">Wishlist</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love and come back to them later."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const fallback = `https://placehold.co/80x80/f5f5f4/a8a29e?text=${encodeURIComponent(item.product.name.slice(0,2))}`
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
                  <Link to={`/products/${item.product_id}`} className="font-medium text-stone-900 text-sm hover:text-stone-600 line-clamp-2">
                    {item.product.name}
                  </Link>
                  <p className="text-stone-500 text-xs mt-0.5">{item.product.category}</p>
                  <p className="font-display text-base font-medium text-stone-900 mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => moveToCart(item.product_id)}
                    disabled={item.product.stock === 0}
                    className="flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3 py-2 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {item.product.stock === 0 ? 'Out of stock' : 'Move to Cart'}
                  </button>
                  <button onClick={() => remove(item.product_id)} className="flex items-center gap-1.5 text-stone-400 hover:text-red-400 text-xs px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

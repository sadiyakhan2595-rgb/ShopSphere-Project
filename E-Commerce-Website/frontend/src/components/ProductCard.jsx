import { Link } from 'react-router-dom'
import { ShoppingBag, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { StarRating, formatPrice } from './ui'
import api from '../api/client'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [wished, setWished] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { window.location.href = '/login'; return }
    setAdding(true)
    try { await addToCart(product.id, 1) }
    catch (err) { alert(err.response?.data?.detail || 'Failed to add to cart') }
    finally { setAdding(false) }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) { window.location.href = '/login'; return }
    try {
      if (wished) {
        await api.delete(`/wishlist/${product.id}`)
      } else {
        await api.post('/wishlist/', { product_id: product.id })
      }
      setWished(!wished)
    } catch {}
  }

  const fallbackImg = `https://placehold.co/400x400/f5f5f4/a8a29e?text=${encodeURIComponent(product.name.slice(0, 15))}`

  return (
    <Link to={`/products/${product.id}`} className="group card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={imgErr ? fallbackImg : (product.image_url || fallbackImg)}
          alt={product.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-stone-900 text-white text-xs font-medium">Out of Stock</span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${wished ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
        >
          <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
        </button>
        {product.category && (
          <span className="absolute top-3 left-3 badge bg-white/90 text-stone-600 text-xs">
            {product.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-stone-700 transition-colors">
          {product.name}
        </h3>
        {product.avg_rating && (
          <div className="mt-1.5">
            <StarRating rating={product.avg_rating} count={product.review_count} />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-display text-lg font-medium text-stone-900">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3 py-2 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {adding ? '...' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  )
}

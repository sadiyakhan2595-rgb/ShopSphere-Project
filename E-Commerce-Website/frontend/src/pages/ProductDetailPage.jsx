import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Heart, ArrowLeft, Plus, Minus, Star } from 'lucide-react'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PageLoader, StarRating, StatusBadge, formatPrice, formatDate, ErrorMsg } from '../components/ui'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`)
    ]).then(([p, r]) => {
      setProduct(p.data)
      setReviews(r.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { window.location.href = '/login'; return }
    setAdding(true); setError('')
    try {
      await addToCart(product.id, qty)
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add to cart')
    } finally { setAdding(false) }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm)
      setReviews([data, ...reviews])
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit review')
    } finally { setSubmittingReview(false) }
  }

  if (loading) return <PageLoader />
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><p>Product not found</p></div>

  const fallbackImg = `https://placehold.co/600x600/f5f5f4/a8a29e?text=${encodeURIComponent(product.name.slice(0, 20))}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100">
          <img
            src={imgErr ? fallbackImg : (product.image_url || fallbackImg)}
            onError={() => setImgErr(true)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="badge bg-stone-100 text-stone-600 self-start mb-3">{product.category}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-stone-900 leading-tight">{product.name}</h1>

          {product.avg_rating && (
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.avg_rating} count={product.review_count} />
              <span className="text-sm text-stone-500">{product.avg_rating} / 5</span>
            </div>
          )}

          <p className="font-display text-4xl font-medium text-stone-900 mt-4">{formatPrice(product.price)}</p>

          <p className="text-stone-500 text-sm leading-relaxed mt-4">{product.description}</p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-emerald-600 text-sm font-medium">✓ {product.stock} in stock</span>
            ) : (
              <span className="text-red-500 text-sm font-medium">✗ Out of stock</span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {/* Qty */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-600 font-medium w-20">Quantity</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 hover:bg-stone-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2.5 text-sm font-medium border-x border-stone-200">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-2.5 hover:bg-stone-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <ErrorMsg message={error} />

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {adding ? 'Adding...' : addedSuccess ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {addedSuccess && (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                <span>Item added to cart!</span>
                <Link to="/cart" className="font-medium underline">View Cart →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-stone-100 pt-10">
        <h2 className="font-display text-2xl font-medium text-stone-900 mb-6">Customer Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={handleReview} className="card p-5 mb-8">
            <h3 className="font-medium text-stone-900 mb-4">Write a Review</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button type="button" key={s} onClick={() => setReviewForm(f => ({...f, rating: s}))}>
                  <Star className={`w-6 h-6 transition-colors ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              className="input h-24 resize-none mb-3"
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(f => ({...f, comment: e.target.value}))}
            />
            <button type="submit" disabled={submittingReview} className="btn-primary">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-stone-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{r.user?.name}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="text-stone-400 text-xs">{formatDate(r.created_at)}</span>
                </div>
                {r.comment && <p className="text-stone-600 text-sm mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

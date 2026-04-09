import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { PageLoader } from '../components/ui'

const CATEGORIES = [
  { name: 'Electronics', emoji: '⚡', color: 'bg-violet-50 text-violet-700' },
  { name: 'Clothing', emoji: '👕', color: 'bg-sky-50 text-sky-700' },
  { name: 'Home', emoji: '🏡', color: 'bg-amber-50 text-amber-700' },
  { name: 'Sports', emoji: '🏋️', color: 'bg-emerald-50 text-emerald-700' },
  { name: 'Kitchen', emoji: '☕', color: 'bg-orange-50 text-orange-700' },
  { name: 'Accessories', emoji: '👜', color: 'bg-pink-50 text-pink-700' },
]

const PERKS = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Secure Payments', desc: 'Razorpay encrypted' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/?limit=8').then(({ data }) => setFeatured(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-stone-800 text-stone-300 mb-4">New arrivals every week</span>
            <h1 className="font-display text-5xl sm:text-6xl font-light leading-tight mb-6">
              Things you'll<br />
              <em className="italic text-stone-300">actually</em> love
            </h1>
            <p className="text-stone-400 text-lg mb-8 max-w-md">
              Curated products from independent makers and trusted brands. Quality over quantity, always.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-xl font-medium hover:bg-stone-100 transition-colors">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products?category=Electronics" className="inline-flex items-center gap-2 border border-stone-700 text-stone-300 px-6 py-3 rounded-xl font-medium hover:border-stone-500 transition-colors">
                Browse Electronics
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
              'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
            ].map((src, i) => (
              <img key={i} src={src} alt="" className={`rounded-2xl object-cover w-full h-36 ${i === 0 ? 'mt-6' : i === 3 ? '-mt-6' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-display text-2xl font-medium text-stone-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${cat.color} hover:scale-105 transition-transform cursor-pointer`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-medium text-stone-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? <PageLoader /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {/* Perks */}
      <section className="bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-white rounded-xl border border-stone-200 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <p className="font-medium text-stone-900 text-sm">{title}</p>
                <p className="text-stone-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

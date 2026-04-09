import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { PageLoader } from '../components/ui'

const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹500', min: null, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: null },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name A–Z', value: 'name:asc' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const priceIdx = parseInt(searchParams.get('price') || '0')
  const sort = searchParams.get('sort') || 'created_at:desc'

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [sortBy, order] = sort.split(':')
      const priceRange = PRICE_RANGES[priceIdx] || PRICE_RANGES[0]
      const params = { sort_by: sortBy, order, limit: 40 }
      if (search) params.search = search
      if (category) params.category = category
      if (priceRange.min !== null) params.min_price = priceRange.min
      if (priceRange.max !== null) params.max_price = priceRange.max
      const { data } = await api.get('/products/', { params })
      setProducts(data)
    } finally { setLoading(false) }
  }, [search, category, priceIdx, sort])

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    setSearchParams(p)
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = search || category || priceIdx > 0 || sort !== 'created_at:desc'

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-medium text-stone-900 text-sm mb-3">Category</h3>
        <div className="space-y-1">
          <button onClick={() => setParam('category', '')} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-stone-900 text-white' : 'hover:bg-stone-100 text-stone-700'}`}>
            All Categories
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setParam('category', cat)} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat ? 'bg-stone-900 text-white' : 'hover:bg-stone-100 text-stone-700'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-medium text-stone-900 text-sm mb-3">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range, i) => (
            <button key={i} onClick={() => setParam('price', i > 0 ? i : '')} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${priceIdx === i ? 'bg-stone-900 text-white' : 'hover:bg-stone-100 text-stone-700'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-900">
            {search ? `Results for "${search}"` : category || 'All Products'}
          </h1>
          {!loading && <p className="text-stone-500 text-sm mt-1">{products.length} products</p>}
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden flex items-center gap-2 border border-stone-200 rounded-xl px-4 py-2.5 text-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Mobile Filters */}
      {filtersOpen && (
        <div className="md:hidden card p-4 mb-6">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="card p-4 sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? <PageLoader /> : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-display text-xl font-medium text-stone-900">No products found</h3>
              <p className="text-stone-500 text-sm mt-1">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-4 btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

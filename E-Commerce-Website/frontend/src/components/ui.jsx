// Footer
export function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg text-stone-900">ShopSphere</p>
        <p className="text-sm text-stone-400">© {new Date().getFullYear()} ShopSphere. Built with FastAPI + React.</p>
        <div className="flex gap-4 text-sm text-stone-500">
          <a href="#" className="hover:text-stone-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  )
}

// LoadingSpinner
export function Spinner({ size = 'md' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className={`${sz} border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}

// Star Rating
export function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count !== undefined && <span className="text-xs text-stone-400 ml-1">({count})</span>}
    </div>
  )
}

// Status Badge
export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
    delivered: 'bg-stone-100 text-stone-600 border border-stone-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    failed: 'bg-red-50 text-red-600 border border-red-200',
  }
  return (
    <span className={`badge ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-stone-400" />
      </div>
      <div>
        <h3 className="font-display text-xl font-medium text-stone-900">{title}</h3>
        <p className="text-stone-500 text-sm mt-1">{description}</p>
      </div>
      {action}
    </div>
  )
}

// Error Message
export function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

export function SuccessMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

// Format currency
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

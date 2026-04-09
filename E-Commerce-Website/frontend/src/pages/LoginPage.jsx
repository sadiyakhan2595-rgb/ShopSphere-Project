import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ErrorMsg } from '../components/ui'

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-medium text-stone-900">{title}</h1>
          <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally { setLoading(false) }
  }


  return (
    <AuthShell title="Welcome back" subtitle="Login to your premium shopping experience">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-800 ml-1">Email Address</label>
          <input 
            type="email" 
            className="input w-full px-4 py-3 rounded-xl border-stone-200 focus:ring-2 focus:ring-stone-900 transition-all duration-200" 
            placeholder="name@example.com" 
            value={form.email}
            onChange={(e) => setForm(f => ({...f, email: e.target.value}))} 
            required 
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between ml-1">
            <label className="block text-sm font-semibold text-stone-800">Password</label>
          </div>
          <div className="relative group">
            <input 
              type={showPw ? 'text' : 'password'} 
              className="input w-full px-4 py-3 rounded-xl border-stone-200 focus:ring-2 focus:ring-stone-900 pr-12 transition-all duration-200" 
              placeholder="••••••••"
              value={form.password} 
              onChange={(e) => setForm(f => ({...f, password: e.target.value}))} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPw(!showPw)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <ErrorMsg message={error} />
        
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-3.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-stone-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
          ) : 'Sign In'}
        </button>
      </form>
      

      <p className="text-center text-sm text-stone-500 mt-8">
        Don't have an account?{' '}
        <Link to="/signup" className="text-stone-900 font-bold hover:underline">Create Account</Link>
      </p>
    </AuthShell>
  )
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signup(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account')
    } finally { setLoading(false) }
  }

  return (
    <AuthShell title="Create account" subtitle="Join ShopSphere today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
          <input type="text" className="input" placeholder="John Doe" value={form.name}
            onChange={(e) => setForm(f => ({...f, name: e.target.value}))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
          <input type="email" className="input" placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm(f => ({...f, email: e.target.value}))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => setForm(f => ({...f, password: e.target.value}))} required minLength={6} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <ErrorMsg message={error} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-stone-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-stone-900 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage

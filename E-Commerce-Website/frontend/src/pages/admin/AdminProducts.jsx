import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import api from '../../api/client'
import { PageLoader, formatPrice, ErrorMsg } from '../../components/ui'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: '', image_url: '', is_active: true }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | product obj
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = () => {
    api.get('/admin/products?limit=100').then(({ data }) => setProducts(data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal('add') }
  const openEdit = (p) => { setForm({ ...p, price: p.price, stock: p.stock }); setError(''); setModal(p) }
  const closeModal = () => { setModal(null); setError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }
      if (modal === 'add') {
        await api.post('/admin/products', payload)
      } else {
        await api.put(`/admin/products/${modal.id}`, payload)
      }
      fetchProducts()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Archive this product?')) return
    await api.delete(`/admin/products/${id}`)
    fetchProducts()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-medium text-stone-900">Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <PageLoader /> : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left">
                  <th className="px-4 py-3 font-medium text-stone-600">Product</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Category</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Price</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Stock</th>
                  <th className="px-4 py-3 font-medium text-stone-600">Status</th>
                  <th className="px-4 py-3 font-medium text-stone-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url || `https://placehold.co/40x40/f5f5f4/a8a29e?text=${encodeURIComponent(p.name.slice(0,2))}`}
                          onError={(e) => { e.target.src = `https://placehold.co/40x40/f5f5f4/a8a29e?text=?` }}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <span className="font-medium text-stone-900 line-clamp-1 max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{p.category}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-600' : 'text-stone-700'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'}`}>
                        {p.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-stone-400 py-8 text-sm">No products found</p>}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="font-display text-xl font-medium">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                <textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₹) *</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock *</label>
                  <input type="number" min="0" className="input" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
                <input className="input" placeholder="e.g. Electronics, Clothing..." value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
                <input type="url" className="input" placeholder="https://..." value={form.image_url || ''} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} />
              </div>
              {modal !== 'add' && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="w-4 h-4 accent-stone-900" />
                  <label htmlFor="active" className="text-sm text-stone-700">Active (visible in store)</label>
                </div>
              )}
              <ErrorMsg message={error} />
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

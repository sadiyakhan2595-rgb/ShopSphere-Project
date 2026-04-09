import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    try {
      setLoading(true)
      const { data } = await api.get('/cart/')
      setItems(data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/', { product_id: productId, quantity })
    await fetchCart()
    return data
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeFromCart(itemId)
    await api.put(`/cart/${itemId}`, { quantity })
    await fetchCart()
  }

  const removeFromCart = async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    await fetchCart()
  }

  const clearCart = async () => {
    await api.delete('/cart/')
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

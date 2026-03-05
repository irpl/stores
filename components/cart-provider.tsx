"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Item = {
  item_id: string
  name: string
  description: string
  rate: number
  unit: string
  status: string
  quantity?: number
}

type CartContextType = {
  items: Item[]
  addToCart: (item: Item) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [totalItems, setTotalItems] = useState(0)

  // Load cart from localStorage on client side
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
        calculateTotalItems(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }
  }, [])

  // Calculate total items helper function
  const calculateTotalItems = (cartItems: Item[]) => {
    const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    setTotalItems(total)
  }

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
      calculateTotalItems(items)
    } else {
      localStorage.removeItem("cart")
      setTotalItems(0)
    }
  }, [items])

  const addToCart = (item: Item) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i.item_id === item.item_id)

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...prevItems]
        const existingItem = updatedItems[existingItemIndex]
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity || 1) + (item.quantity || 1),
        }
        return updatedItems
      } else {
        // Add new item with the provided quantity or default to 1
        return [...prevItems, { ...item, quantity: item.quantity || 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.item_id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.item_id === itemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
    setTotalItems(0)
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

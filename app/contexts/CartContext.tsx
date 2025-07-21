'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  quantity: number
  specialInstructions?: string
  foodItem: {
    id: string
    name: string
    price: string
    originalPrice?: string
    image: string
    shortDescription: string
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    cookTime: string
  }
}

export interface CartSummary {
  itemCount: number
  totalQuantity: number
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  freeDeliveryThreshold: number
  amountForFreeDelivery: number
}

export interface Cart {
  items: CartItem[]
  summary: CartSummary
}

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  addToCart: (foodItemId: string, quantity?: number, specialInstructions?: string) => Promise<boolean>
  updateCartItem: (foodItemId: string, quantity: number, specialInstructions?: string) => Promise<boolean>
  removeFromCart: (cartItemId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  refreshCart: () => Promise<void>
  getItemQuantity: (foodItemId: string) => number
  isUpdating: (foodItemId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const { user, isAuthenticated, extendSession } = useAuth()
  const { toast } = useToast()
  
  // Single request queue per food item to prevent race conditions
  const requestQueue = useRef<Map<string, Promise<boolean>>>(new Map())

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]): CartSummary => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0)
    const deliveryFee = subtotal >= 25 ? 0 : 5
    const tax = subtotal * 0.08
    const total = subtotal + deliveryFee + tax

    return {
      itemCount: items.length,
      totalQuantity,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      freeDeliveryThreshold: 25,
      amountForFreeDelivery: Math.max(0, 25 - subtotal)
    }
  }

  // Update cart state with new items
  const updateCartState = (items: CartItem[]) => {
    setCart({
      items,
      summary: calculateTotals(items)
    })
  }

  // Fetch cart data from server
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCart(null)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/cart?userId=${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCart(data.cart || { items: [], summary: calculateTotals([]) })
      } else {
        setCart({ items: [], summary: calculateTotals([]) })
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setCart({ items: [], summary: calculateTotals([]) })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Load cart on mount and when user changes
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Queue operations per food item to prevent race conditions
  const queueOperation = async (foodItemId: string, operation: () => Promise<boolean>): Promise<boolean> => {
    // If there's already an operation in progress for this item, wait for it
    const existingOperation = requestQueue.current.get(foodItemId)
    if (existingOperation) {
      await existingOperation
    }

    // Start new operation
    const newOperation = operation()
    requestQueue.current.set(foodItemId, newOperation)
    
    try {
      const result = await newOperation
      return result
    } finally {
      // Clear from queue after completion
      requestQueue.current.delete(foodItemId)
    }
  }

  // Add or update item in cart
  const addToCart = useCallback(async (
    foodItemId: string, 
    quantity: number = 1, 
    specialInstructions: string = ''
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) {
      return false
    }

    return queueOperation(foodItemId, async () => {
      setUpdatingItems(prev => new Set(prev).add(foodItemId))

      try {
        // Optimistic update - immediately show the change
        const existingItem = cart.items.find(item => item.foodItem.id === foodItemId)
        
        let newItems: CartItem[]
        if (existingItem) {
          // Update existing item quantity
          newItems = cart.items.map(item => 
            item.foodItem.id === foodItemId 
              ? { ...item, quantity: item.quantity + quantity, specialInstructions: specialInstructions || item.specialInstructions }
              : item
          )
        } else {
          // Add new item (create temporary item for optimistic update)
          const tempItem: CartItem = {
            id: `temp-${Date.now()}`,
            quantity,
            specialInstructions,
            foodItem: {
              id: foodItemId,
              name: 'Loading...',
              price: '0',
              image: '',
              shortDescription: '',
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              cookTime: ''
            }
          }
          newItems = [...cart.items, tempItem]
        }

        // Apply optimistic update
        updateCartState(newItems)

        // Make API call
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            foodItemId,
            quantity,
            specialInstructions
          })
        })

        if (response.ok) {
          extendSession()
          // Sync with server after successful operation (but don't override optimistic update immediately)
          setTimeout(() => refreshCart(), 500) // Gentle sync after a delay
          return true
        } else {
          // Revert optimistic update on failure
          updateCartState(cart.items)
          const data = await response.json()
          console.error('Add to cart failed:', data.error)
          return false
        }
      } catch (error) {
        // Revert optimistic update on error
        updateCartState(cart.items)
        console.error('Add to cart error:', error)
        return false
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(foodItemId)
          return newSet
        })
      }
    })
  }, [isAuthenticated, user, cart, refreshCart, extendSession])

  // Update item quantity (set to specific quantity, not add)
  const updateCartItem = useCallback(async (
    foodItemId: string,
    quantity: number,
    specialInstructions?: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) {
      return false
    }

    return queueOperation(foodItemId, async () => {
      setUpdatingItems(prev => new Set(prev).add(foodItemId))

      try {
        const existingItem = cart.items.find(item => item.foodItem.id === foodItemId)
        
        if (!existingItem) {
          // Item doesn't exist, add it
          return await addToCart(foodItemId, quantity, specialInstructions)
        }

        // Optimistic update - set to new quantity
        const newItems = cart.items.map(item => 
          item.foodItem.id === foodItemId 
            ? { ...item, quantity, specialInstructions: specialInstructions || item.specialInstructions }
            : item
        )

        // Store original state for potential rollback
        const originalItems = cart.items

        // Apply optimistic update
        updateCartState(newItems)

        // Make API call
        const response = await fetch(`/api/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            quantity,
            specialInstructions
          })
        })

        if (response.ok) {
          extendSession()
          return true
        } else {
          // Revert optimistic update on failure
          updateCartState(originalItems)
          const data = await response.json()
          console.error('Update cart failed:', data.error)
          return false
        }
      } catch (error) {
        console.error('Update cart error:', error)
        return false
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(foodItemId)
          return newSet
        })
      }
    })
  }, [isAuthenticated, user, cart, addToCart, extendSession])

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: string): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) {
      return false
    }

    const itemToRemove = cart.items.find(item => item.id === cartItemId)
    if (!itemToRemove) {
      return true // Already removed
    }

    const foodItemId = itemToRemove.foodItem.id

    return queueOperation(foodItemId, async () => {
      setUpdatingItems(prev => new Set(prev).add(foodItemId))

      try {
        // Optimistic update - remove item immediately
        const newItems = cart.items.filter(item => item.id !== cartItemId)
        const originalItems = cart.items

        updateCartState(newItems)

        // Handle temporary items (no API call needed)
        if (cartItemId.startsWith('temp-')) {
          return true
        }

        // Make API call
        const response = await fetch(`/api/cart/${cartItemId}?userId=${user.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          return true
        } else {
          // Revert optimistic update on failure
          updateCartState(originalItems)
          console.error('Remove from cart failed')
          return false
        }
      } catch (error) {
        console.error('Remove from cart error:', error)
        return false
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(foodItemId)
          return newSet
        })
      }
    })
  }, [isAuthenticated, user, cart])

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false

    try {
      setIsLoading(true)
      const response = await fetch(`/api/cart?userId=${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        updateCartState([])
        toast({ title: "Cart cleared" })
        return true
      } else {
        toast({ title: "Failed to clear cart", variant: "destructive" })
        return false
      }
    } catch (error) {
      console.error('Clear cart error:', error)
      toast({ title: "Failed to clear cart", variant: "destructive" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, toast])

  // Get quantity of specific item in cart
  const getItemQuantity = useCallback((foodItemId: string): number => {
    if (!cart) return 0
    const item = cart.items.find(item => item.foodItem.id === foodItemId)
    return item?.quantity || 0
  }, [cart])

  // Check if item is being updated
  const isUpdating = useCallback((foodItemId: string): boolean => {
    return updatingItems.has(foodItemId)
  }, [updatingItems])

  const value: CartContextType = {
    cart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getItemQuantity,
    isUpdating
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
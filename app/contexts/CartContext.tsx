'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Fetch cart data
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
        setCart(data.cart)
      } else {
        console.error('Failed to fetch cart')
        setCart({ items: [], summary: {
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          total: 0,
          freeDeliveryThreshold: 25,
          amountForFreeDelivery: 25
        }})
      }
    } catch (error) {
      console.error('Cart fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Load cart on mount and when user changes
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Add item to cart
  const addToCart = useCallback(async (
    foodItemId: string, 
    quantity: number = 1, 
    specialInstructions: string = ''
  ): Promise<boolean> => {
    console.log('🛒 AddToCart called with:', { foodItemId, quantity, specialInstructions })
    console.log('🔐 Auth state:', { isAuthenticated, user: user ? { id: user.id, email: user.email } : null })
    
    if (!isAuthenticated || !user) {
      console.error('❌ User not authenticated:', { isAuthenticated, user })
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      })
      return false
    }

    try {
      setIsLoading(true)
      
      // Log request data for debugging
      console.log('🔐 User ID:', user.id)
      console.log('🍕 Food Item ID:', foodItemId)

      const requestData = {
        userId: user.id,
        foodItemId,
        quantity,
        specialInstructions
      }
      
      console.log('📤 Sending request to /api/cart:', requestData)

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('📥 Response status:', response.status, response.statusText)
      
      let data
      try {
        data = await response.json()
        console.log('📥 Response data:', data)
      } catch (jsonError) {
        console.error('❌ Failed to parse response JSON:', jsonError)
        toast({
          title: "Server Error",
          description: "Invalid response from server. Please try again.",
          variant: "destructive"
        })
        return false
      }

      if (response.ok && data.success) {
        console.log('✅ Cart addition successful:', data)
        await refreshCart() // Refresh to get updated cart
        toast({
          title: "Added to cart",
          description: data.message || "Item added successfully",
        })
        return true
      } else {
        const errorMessage = data.error || `Server error: ${response.status}`
        console.error('❌ Add to cart failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          fullResponse: data
        })
        
        // Check if it's an authentication error
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue",
            variant: "destructive"
          })
          // Clear auth data if authentication failed
          localStorage.removeItem('user')
          localStorage.removeItem('authToken')
          localStorage.removeItem('cart')
          window.location.href = '/auth/login'
          return false
        }
        
        toast({
          title: "Failed to add to cart",
          description: errorMessage,
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('❌ Add to cart network error:', error)
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      toast({
        title: "Network Error",
        description: "Could not connect to server. Please check your internet connection.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, toast, refreshCart])

  // Update cart item
  const updateCartItem = useCallback(async (
    foodItemId: string,
    quantity: number,
    specialInstructions?: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    const itemInCart = cart?.items.find(item => item.foodItem.id === foodItemId);

    if (!itemInCart) {
      return await addToCart(foodItemId, quantity, specialInstructions);
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/cart/${itemInCart.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          quantity,
          specialInstructions
        })
      })

      const data = await response.json()

      if (response.ok) {
        await refreshCart()
        toast({
          title: "Cart updated",
          description: data.message,
        })
        return true
      } else {
        toast({
          title: "Failed to update cart",
          description: data.error,
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Update cart error:', error)
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, toast, refreshCart, cart, addToCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false

    try {
      setIsLoading(true)
      const authToken = localStorage.getItem('authToken')
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        await refreshCart()
        toast({
          title: "Item removed",
          description: data.message,
        })
        return true
      } else {
        toast({
          title: "Failed to remove item",
          description: data.error,
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Remove from cart error:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, toast, refreshCart])

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false

    try {
      setIsLoading(true)
      const response = await fetch(`/api/cart?userId=${user.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        await refreshCart()
        toast({
          title: "Cart cleared",
          description: data.message,
        })
        return true
      } else {
        toast({
          title: "Failed to clear cart",
          description: data.error,
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Clear cart error:', error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, toast, refreshCart])

  // Get quantity of specific item in cart
  const getItemQuantity = useCallback((foodItemId: string): number => {
    if (!cart) return 0
    const item = cart.items.find(item => item.foodItem.id === foodItemId)
    return item?.quantity || 0
  }, [cart])

  const value: CartContextType = {
    cart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getItemQuantity
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
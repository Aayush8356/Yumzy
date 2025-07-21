// yumzy/app/contexts/CartContext.tsx
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
  
  const requestQueue = useRef<Map<string, Promise<any>>>(new Map())

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

  const updateCartState = (items: CartItem[]) => {
    setCart({
      items,
      summary: calculateTotals(items)
    })
  }

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

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const queueOperation = async <T,>(foodItemId: string, operation: () => Promise<T>): Promise<T> => {
    const existingOperation = requestQueue.current.get(foodItemId)
    if (existingOperation) {
      await existingOperation.catch(() => {})
    }

    const newOperation = operation()
    requestQueue.current.set(foodItemId, newOperation)
    
    try {
      return await newOperation
    } finally {
      if (requestQueue.current.get(foodItemId) === newOperation) {
        requestQueue.current.delete(foodItemId)
      }
    }
  }

  const performCartUpdate = async (
    foodItemId: string,
    apiCall: () => Promise<Response>,
    optimisticUpdate: () => CartItem[],
    revertState: () => CartItem[]
  ) => {
    return queueOperation(foodItemId, async () => {
      setUpdatingItems(prev => new Set(prev).add(foodItemId));
      
      const originalItems = cart?.items ?? [];
      updateCartState(optimisticUpdate());

      try {
        const response = await apiCall();

        if (response.ok) {
          extendSession();
          await refreshCart(); // Always refresh the cart from the server
          return true;
        } else {
          updateCartState(revertState());
          const data = await response.json();
          console.error('Cart operation failed:', data.error);
          toast({ title: "Error", description: data.error, variant: "destructive" });
          return false;
        }
      } catch (error) {
        updateCartState(revertState());
        console.error('Cart operation error:', error);
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        return false;
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(foodItemId);
          return newSet;
        });
      }
    });
  };

  const addToCart = useCallback(async (
    foodItemId: string, 
    quantity: number = 1, 
    specialInstructions: string = ''
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) return false

    const existingItem = cart.items.find(item => item.foodItem.id === foodItemId)

    if (existingItem) {
      return updateCartItem(foodItemId, existingItem.quantity + quantity, specialInstructions)
    }

    const optimisticUpdate = () => {
      const tempItem: CartItem = {
        id: `temp-${Date.now()}`,
        quantity,
        specialInstructions,
        foodItem: {
          id: foodItemId,
          name: 'Adding...',
          price: '0',
          image: '',
          shortDescription: '',
          isVegetarian: false, isVegan: false, isGlutenFree: false, cookTime: ''
        }
      }
      return [...cart.items, tempItem]
    }

    return performCartUpdate(
      foodItemId,
      () => fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, foodItemId, quantity, specialInstructions })
      }),
      optimisticUpdate,
      () => cart.items
    )
  }, [isAuthenticated, user, cart, extendSession, toast])

  const updateCartItem = useCallback(async (
    foodItemId: string,
    quantity: number,
    specialInstructions?: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) return false

    const existingItem = cart.items.find(item => item.foodItem.id === foodItemId)
    if (!existingItem) return false

    if (quantity <= 0) {
      return removeFromCart(existingItem.id)
    }

    const optimisticUpdate = () => cart.items.map(item => 
      item.foodItem.id === foodItemId 
        ? { ...item, quantity, ...(specialInstructions && { specialInstructions }) }
        : item
    )

    return performCartUpdate(
      foodItemId,
      () => fetch(`/api/cart/${existingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quantity, specialInstructions })
      }),
      optimisticUpdate,
      () => cart.items
    )
  }, [isAuthenticated, user, cart, extendSession, toast])

  const removeFromCart = useCallback(async (cartItemId: string): Promise<boolean> => {
    if (!isAuthenticated || !user || !cart) return false;

    const itemToRemove = cart.items.find(item => item.id === cartItemId);
    if (!itemToRemove) return true;

    const foodItemId = itemToRemove.foodItem.id;

    const optimisticUpdate = () =>
      cart.items.map(item =>
        item.id === cartItemId
          ? { ...item, foodItem: { ...item.foodItem, name: 'Removing...' } }
          : item
      );

    return performCartUpdate(
      foodItemId,
      () => fetch(`/api/cart/${cartItemId}?userId=${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }),
      optimisticUpdate,
      () => cart.items
    );
  }, [isAuthenticated, user, cart, toast]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false

    setIsLoading(true)
    try {
      const response = await fetch(`/api/cart?userId=${user.id}`, { method: 'DELETE' })
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

  const getItemQuantity = useCallback((foodItemId: string): number => {
    if (!cart) return 0
    const item = cart.items.find(item => item.foodItem.id === foodItemId)
    return item?.quantity || 0
  }, [cart])

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

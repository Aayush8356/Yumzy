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
      const response = await fetch(`/api/cart?userId=${user.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setCart(data.cart)
      } else {
        // Set empty cart on error
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
      // Set empty cart on network error
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
  }, [isAuthenticated, user])

  // Load cart on mount and when user changes
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Add item to cart
  const addToCart: (foodItemId: string, quantity?: number, specialInstructions?: string) => Promise<boolean> = useCallback(async (
    foodItemId: string, 
    quantity: number = 1, 
    specialInstructions: string = ''
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false
    }

    // Check if item already exists in cart
    const existingItem = cart?.items.find(item => item.foodItem.id === foodItemId)
    
    if (existingItem && cart) {
      // If item exists, optimistically update its quantity
      const updatedItems = cart.items.map(item => 
        item.foodItem.id === foodItemId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
      
      // Calculate new totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0)
      const deliveryFee = subtotal >= 25 ? 0 : 5
      const tax = subtotal * 0.08
      const total = subtotal + deliveryFee + tax
      
      setCart({
        ...cart,
        items: updatedItems,
        summary: {
          ...cart.summary,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee,
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          totalQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      })
      
      // Still call API to sync with server
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            foodItemId,
            quantity,
            specialInstructions
          })
        })
        
        if (response.ok) {
          await refreshCart() // Sync with server
          return true
        }
      } catch (error) {
        // Revert on error
        setCart(cart)
      }
      return true
    }

    // Optimistic update - immediately update cart state before API call
    let optimisticItemData: CartItem | null = null
    
    if (cart) {
      // Create optimistic cart item with proper data structure
      const optimisticItem: CartItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        quantity,
        specialInstructions,
        foodItem: {
          id: foodItemId,
          name: 'Loading...', // Will be updated after API response
          price: '0',
          originalPrice: undefined,
          image: '',
          shortDescription: '',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          cookTime: ''
        }
      }
      
      optimisticItemData = optimisticItem
      
      // Update cart state immediately with the new item
      const updatedItems = [...cart.items, optimisticItem]
      
      setCart({
        ...cart,
        items: updatedItems,
        summary: {
          ...cart.summary,
          itemCount: cart.summary.itemCount + 1,
          totalQuantity: cart.summary.totalQuantity + quantity
        }
      })
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          foodItemId,
          quantity,
          specialInstructions
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Replace optimistic update with real data
          await refreshCart()
          return true
        }
      }
      
      // Revert optimistic update on failure
      if (cart && optimisticItemData) {
        const revertedItems = cart.items.filter(item => item.id !== optimisticItemData!.id)
        setCart({
          ...cart,
          items: revertedItems,
          summary: {
            ...cart.summary,
            itemCount: cart.summary.itemCount - 1,
            totalQuantity: cart.summary.totalQuantity - quantity
          }
        })
      }
      
      // Handle errors silently - let the component handle user feedback
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        localStorage.removeItem('cart')
        window.location.href = '/auth/login'
      }
      
      return false
    } catch (error) {
      // Revert optimistic update on error
      if (cart && optimisticItemData) {
        const revertedItems = cart.items.filter(item => item.id !== optimisticItemData!.id)
        setCart({
          ...cart,
          items: revertedItems,
          summary: {
            ...cart.summary,
            itemCount: cart.summary.itemCount - 1,
            totalQuantity: cart.summary.totalQuantity - quantity
          }
        })
      }
      return false
    }
  }, [isAuthenticated, user, cart, refreshCart])

  // Update cart item
  const updateCartItem = useCallback(async (
    foodItemId: string,
    quantity: number,
    specialInstructions?: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    const itemInCart = cart?.items.find(item => item.foodItem.id === foodItemId);

    if (!itemInCart) {
      if (quantity > 0) {
        return await addToCart(foodItemId, quantity, specialInstructions);
      }
      return true; // No item to remove
    }

    // If quantity is 0, remove the item instead of updating
    if (quantity === 0) {
      return await removeFromCart(itemInCart.id);
    }

    // Optimistic UI update - update cart state immediately
    const previousQuantity = itemInCart.quantity;
    if (cart) {
      const updatedItems = cart.items.map(item => 
        item.foodItem.id === foodItemId 
          ? { ...item, quantity, specialInstructions: specialInstructions || item.specialInstructions }
          : item
      );

      // Recalculate totals optimistically
      const subtotal = updatedItems.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0);
      const deliveryFee = subtotal >= 25 ? 0 : 5;
      const tax = subtotal * 0.08;
      const total = subtotal + deliveryFee + tax;

      setCart({
        ...cart,
        items: updatedItems,
        summary: {
          ...cart.summary,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee,
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          totalQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    }

    try {
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
        // Sync with server to ensure accuracy
        await refreshCart()
        return true
      } else {
        // Revert optimistic update on failure
        if (cart) {
          const revertedItems = cart.items.map(item => 
            item.foodItem.id === foodItemId 
              ? { ...item, quantity: previousQuantity }
              : item
          );

          const subtotal = revertedItems.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0);
          const deliveryFee = subtotal >= 25 ? 0 : 5;
          const tax = subtotal * 0.08;
          const total = subtotal + deliveryFee + tax;

          setCart({
            ...cart,
            items: revertedItems,
            summary: {
              ...cart.summary,
              subtotal: Number(subtotal.toFixed(2)),
              deliveryFee,
              tax: Number(tax.toFixed(2)),
              total: Number(total.toFixed(2)),
              totalQuantity: revertedItems.reduce((sum, item) => sum + item.quantity, 0)
            }
          });
        }

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

    // Store the item being removed for potential rollback
    const itemToRemove = cart?.items.find(item => item.id === cartItemId);
    
    // Optimistic UI update - remove item immediately
    if (cart && itemToRemove) {
      const updatedItems = cart.items.filter(item => item.id !== cartItemId);
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0);
      const deliveryFee = subtotal >= 25 ? 0 : 5;
      const tax = subtotal * 0.08;
      const total = subtotal + deliveryFee + tax;

      setCart({
        ...cart,
        items: updatedItems,
        summary: {
          ...cart.summary,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee,
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          totalQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    }

    try {
      const authToken = localStorage.getItem('authToken')
      const response = await fetch(`/api/cart/${cartItemId}?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Sync with server to ensure accuracy
        await refreshCart()
        toast({
          title: "Item removed",
          description: data.message,
        })
        return true
      } else {
        // Revert optimistic update on failure
        if (cart && itemToRemove) {
          const revertedItems = [...cart.items, itemToRemove];
          
          const subtotal = revertedItems.reduce((sum, item) => sum + (Number(item.foodItem.price) * item.quantity), 0);
          const deliveryFee = subtotal >= 25 ? 0 : 5;
          const tax = subtotal * 0.08;
          const total = subtotal + deliveryFee + tax;

          setCart({
            ...cart,
            items: revertedItems,
            summary: {
              ...cart.summary,
              subtotal: Number(subtotal.toFixed(2)),
              deliveryFee,
              tax: Number(tax.toFixed(2)),
              total: Number(total.toFixed(2)),
              totalQuantity: revertedItems.reduce((sum, item) => sum + item.quantity, 0)
            }
          });
        }

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
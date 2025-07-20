'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { ProfessionalFoodImage } from '@/components/ProfessionalFoodImage'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, updateCartItem, removeFromCart, isLoading } = useCart()
  const router = useRouter()

  // Listen for cart cleared event to auto-close modal
  React.useEffect(() => {
    const handleCartCleared = () => {
      if (isOpen) {
        onClose()
      }
    }

    window.addEventListener('cart-cleared', handleCartCleared)
    return () => window.removeEventListener('cart-cleared', handleCartCleared)
  }, [isOpen, onClose])

  const handleStartShopping = () => {
    onClose()
    router.push('/menu')
  }

  const handleProceedToCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    onClose()
    router.push('/menu')
  }

  const updateQuantity = async (cartItemId: string, foodItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(cartItemId)
    } else {
      await updateCartItem(foodItemId, newQuantity)
    }
  }

  const removeItem = async (cartItemId: string) => {
    await removeFromCart(cartItemId)
  }

  const cartItems = cart?.items || []
  const summary = cart?.summary || {
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
    totalQuantity: 0
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-background shadow-elegant border-0">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {summary.totalQuantity}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground text-sm">
                    Add some delicious items to get started!
                  </p>
                  <Button variant="hero" className="mt-4" onClick={handleStartShopping}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="bg-gradient-card border-0">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <ProfessionalFoodImage
                                src={item.foodItem.image || ''}
                                alt={item.foodItem.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                professionalCategories={[item.foodItem.category?.toLowerCase() || 'food']}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{item.foodItem.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.foodItem.shortDescription}</p>
                              <p className="font-bold text-primary">₹{parseFloat(item.foodItem.price).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.foodItem.id, item.quantity - 1)}
                                disabled={isLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.foodItem.id, item.quantity + 1)}
                                disabled={isLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeItem(item.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="sticky bottom-0 bg-background border-t p-6">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{summary.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{summary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>₹{summary.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button variant="hero" size="lg" className="w-full" onClick={handleProceedToCheckout}>
                  Proceed to Checkout
                </Button>
                
                <Button variant="outline" className="w-full mt-2" onClick={handleContinueShopping}>
                  Continue Shopping
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
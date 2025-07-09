'use client'

import { useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const { clearCart, cart } = useCart()

  useEffect(() => {
    // Clear cart only if it hasn't been cleared already
    if (cart && cart.items.length > 0) {
      clearCart()
    }
  }, [clearCart, cart])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully. A confirmation email has been sent to you.
        </p>
        <div className="space-x-4">
          <Link href="/orders">
            <Button>View My Orders</Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

function CheckoutSuccessContent() {
  const { clearCart, cart } = useCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

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
        <div className="space-y-3">
          {orderId && (
            <Link href={`/track/${orderId}`}>
              <Button className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Track Your Order
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
          <div className="flex gap-3">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
            <Link href="/menu" className="flex-1">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Loading your order details...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

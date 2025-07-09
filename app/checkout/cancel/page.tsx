'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Canceled</h1>
        <p className="text-gray-600 mb-6">
          Your payment process was canceled. You have not been charged.
        </p>
        <div className="space-x-4">
          <Link href="/cart">
            <Button>Back to Cart</Button>
          </Link>
          <Link href="/menu">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

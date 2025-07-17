import { NextRequest, NextResponse } from 'next/server'
import { OrderStatusManager } from '@/lib/order-status-manager'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Check and update order status based on timeline
    const updated = await OrderStatusManager.checkAndUpdateOrderStatus(orderId)
    
    return NextResponse.json({
      success: true,
      updated
    })
  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check order status' },
      { status: 500 }
    )
  }
}
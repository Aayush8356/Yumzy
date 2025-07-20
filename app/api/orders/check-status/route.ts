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

    console.log(`🔍 USER-TRIGGERED: Checking status for order ${orderId}`)
    
    // Check and update order status based on timeline (user-triggered = priority)
    const updated = await OrderStatusManager.checkAndUpdateOrderStatus(orderId)
    
    if (updated) {
      console.log(`✅ Order ${orderId} status updated due to user check`)
    } else {
      console.log(`🔄 Order ${orderId} status unchanged`)
    }
    
    return NextResponse.json({
      success: true,
      updated,
      message: updated ? 'Order status updated' : 'Order status unchanged'
    })
  } catch (error) {
    console.error('❌ Error checking order status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check order status' },
      { status: 500 }
    )
  }
}
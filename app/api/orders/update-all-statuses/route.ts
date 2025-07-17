import { NextResponse } from 'next/server'
import { OrderStatusUpdater } from '@/lib/order-status-updater'

export const dynamic = 'force-dynamic'

// This endpoint can be called to force update all order statuses
// Useful for ensuring delivery notifications are sent
export async function POST() {
  try {
    console.log('🔄 Starting bulk order status update...')
    
    const updatedCount = await OrderStatusUpdater.updateAllActiveOrders()
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} orders`,
      updatedCount
    })
  } catch (error) {
    console.error('❌ Bulk status update failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update order statuses'
    }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Order status updater is ready'
  })
}
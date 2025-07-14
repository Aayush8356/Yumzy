import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { OrderMigrationManager } from '@/lib/migrate-old-orders'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's orders and check for any that need migration
    const { db } = await import('@/lib/db')
    const { ordersTable } = await import('@/lib/db/schema')
    const { eq, and, lt } = await import('drizzle-orm')

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const userOldOrders = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.customerId, payload.userId),
          eq(ordersTable.status, 'preparing'),
          lt(ordersTable.createdAt, oneHourAgo)
        )
      )

    let migratedCount = 0
    
    // Update each old order for this user
    for (const order of userOldOrders) {
      const result = await OrderMigrationManager.updateOldOrderToDelivered(order.id)
      if (result) {
        migratedCount++
      }
    }

    return NextResponse.json({
      success: true,
      foundOldOrders: userOldOrders.length,
      migratedCount,
      message: migratedCount > 0 ? `Updated ${migratedCount} old orders to delivered status` : 'No old orders found'
    })
  } catch (error) {
    console.error('Error checking order status:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
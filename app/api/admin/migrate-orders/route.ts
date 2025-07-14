import { NextRequest, NextResponse } from 'next/server'
import { OrderMigrationManager } from '@/lib/migrate-old-orders'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Run migration
    const result = await OrderMigrationManager.migrateOldOrders()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully migrated ${result.migratedCount} old orders`,
        migratedCount: result.migratedCount
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in migrate orders API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint to check which orders need migration
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Import database dependencies
    const { db } = await import('@/lib/db')
    const { ordersTable } = await import('@/lib/db/schema')
    const { eq, and, lt } = await import('drizzle-orm')

    // Find old orders that need migration
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const oldOrders = await db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        customerName: ordersTable.customerName,
        total: ordersTable.totalAmount
      })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.status, 'preparing'),
          lt(ordersTable.createdAt, oneHourAgo)
        )
      )

    return NextResponse.json({
      success: true,
      oldOrders,
      count: oldOrders.length
    })
  } catch (error) {
    console.error('Error checking old orders:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
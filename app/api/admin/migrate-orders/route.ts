import { NextRequest, NextResponse } from 'next/server'
import { OrderMigrationManager } from '@/lib/migrate-old-orders'
import { AuthMiddleware } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await AuthMiddleware.requireAdmin(request)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
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
    const authResult = await AuthMiddleware.requireAdmin(request)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
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
        total: ordersTable.total
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
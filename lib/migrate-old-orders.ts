import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'

export class OrderMigrationManager {
  static async migrateOldOrders() {
    try {
      console.log('Starting migration of old orders...')
      
      // Find orders that are still "preparing" and created more than 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      const oldOrders = await db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.status, 'preparing'),
            lt(ordersTable.createdAt, oneHourAgo)
          )
        )

      console.log(`Found ${oldOrders.length} old orders to migrate`)

      for (const order of oldOrders) {
        await this.updateOldOrderToDelivered(order.id)
      }

      console.log('Migration completed successfully')
      return { success: true, migratedCount: oldOrders.length }
    } catch (error) {
      console.error('Error migrating old orders:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateOldOrderToDelivered(orderId: string) {
    try {
      // Calculate estimated delivery time based on creation time + realistic cooking time
      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .limit(1)

      if (order.length === 0) return

      const orderData = order[0]
      const createdAt = new Date(orderData.createdAt)
      
      // Assume total time from order to delivery is 45-60 minutes
      const deliveredAt = new Date(createdAt.getTime() + (50 * 60 * 1000)) // 50 minutes later
      
      // Update order status to delivered
      await db
        .update(ordersTable)
        .set({
          status: 'delivered',
          estimatedDeliveryTime: deliveredAt.toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(ordersTable.id, orderId))

      console.log(`Updated order ${orderId} to delivered status`)
      return true
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error)
      return false
    }
  }

  static async checkAndMigrateSpecificOrder(orderId: string) {
    try {
      const order = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .limit(1)

      if (order.length === 0) {
        return { success: false, error: 'Order not found' }
      }

      const orderData = order[0]
      
      // Check if it's an old order that needs migration
      const createdAt = new Date(orderData.createdAt)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      if (orderData.status === 'preparing' && createdAt < oneHourAgo) {
        await this.updateOldOrderToDelivered(orderId)
        return { success: true, migrated: true }
      }
      
      return { success: true, migrated: false, message: 'Order does not need migration' }
    } catch (error) {
      console.error('Error checking order for migration:', error)
      return { success: false, error: error.message }
    }
  }
}
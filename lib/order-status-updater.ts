import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema'
import { eq, and, notInArray } from 'drizzle-orm'
import { OrderStatusManager } from './order-status-manager'

export class OrderStatusUpdater {
  // Check and update all active orders
  static async updateAllActiveOrders() {
    try {
      // Get all orders that are not delivered or cancelled
      const activeOrders = await db
        .select()
        .from(ordersTable)
        .where(and(
          notInArray(ordersTable.status, ['delivered', 'cancelled'])
        ))
      
      console.log(`🔄 Found ${activeOrders.length} active orders to check`)
      
      let updatedCount = 0
      
      // Process each order
      for (const order of activeOrders) {
        try {
          const wasUpdated = await OrderStatusManager.checkAndUpdateOrderStatus(order.id)
          if (wasUpdated) {
            updatedCount++
            console.log(`📋 Updated order ${order.id} status`)
          }
        } catch (error) {
          console.error(`❌ Failed to update order ${order.id}:`, error)
        }
      }
      
      console.log(`✅ Status update completed: ${updatedCount}/${activeOrders.length} orders updated`)
      return updatedCount
    } catch (error) {
      console.error('❌ Error updating order statuses:', error)
      return 0
    }
  }
  
  // Check specific order status
  static async checkOrderStatus(orderId: string) {
    try {
      return await OrderStatusManager.checkAndUpdateOrderStatus(orderId)
    } catch (error) {
      console.error(`❌ Error checking order ${orderId}:`, error)
      return false
    }
  }
  
  // Force update order status (for testing)
  static async forceUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      await OrderStatusManager.updateOrderStatus(orderId, newStatus)
      await OrderStatusManager.notifyStatusChange(orderId, newStatus)
      console.log(`🔧 Force updated order ${orderId} to ${newStatus}`)
      return true
    } catch (error) {
      console.error(`❌ Error force updating order ${orderId}:`, error)
      return false
    }
  }
}

// Export for API usage
export const orderStatusUpdater = new OrderStatusUpdater()
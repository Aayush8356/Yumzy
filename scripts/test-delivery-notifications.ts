#!/usr/bin/env tsx

import { db } from '../lib/db'
import { ordersTable } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { OrderStatusManager } from '../lib/order-status-manager'
import { professionalNotificationSystem } from '../lib/data/professional-notifications'

async function testDeliveryNotifications() {
  console.log('🧪 Testing delivery notification system...\n')
  
  try {
    // Get a recent order for testing
    const recentOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(ordersTable.createdAt)
      .limit(5)
    
    if (recentOrders.length === 0) {
      console.log('❌ No orders found for testing')
      return
    }
    
    console.log(`📋 Found ${recentOrders.length} orders for testing`)
    
    for (const order of recentOrders) {
      console.log(`\n🔍 Testing order ${order.id}:`)
      console.log(`   - Current status: ${order.status}`)
      console.log(`   - Created: ${order.createdAt}`)
      console.log(`   - User ID: ${order.userId}`)
      
      if (order.status === 'delivered') {
        console.log('   ✅ Order already delivered, skipping')
        continue
      }
      
      // Test out-for-delivery notification
      if (order.status !== 'out_for_delivery' && order.status !== 'delivered') {
        console.log('   📤 Testing out-for-delivery notification...')
        
        // Update to out-for-delivery
        await OrderStatusManager.updateOrderStatus(order.id, 'out_for_delivery')
        await OrderStatusManager.notifyStatusChange(order.id, 'out_for_delivery')
        
        // Check if notification was created
        const notifications = professionalNotificationSystem.getUserNotifications(order.userId)
        const deliveryNotif = notifications.find(n => 
          n.type === 'order_update' && 
          n.data?.orderId === order.id &&
          n.data?.status === 'out_for_delivery'
        )
        
        if (deliveryNotif) {
          console.log('   ✅ Out-for-delivery notification created successfully')
          console.log(`      Title: ${deliveryNotif.title}`)
          console.log(`      Message: ${deliveryNotif.message}`)
        } else {
          console.log('   ❌ Out-for-delivery notification NOT created')
        }
        
        // Wait a bit before next test
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Test delivered notification
      console.log('   📤 Testing delivered notification...')
      
      // Update to delivered
      await OrderStatusManager.updateOrderStatus(order.id, 'delivered')
      await OrderStatusManager.notifyStatusChange(order.id, 'delivered')
      
      // Check if notification was created
      const notifications = professionalNotificationSystem.getUserNotifications(order.userId)
      const deliveredNotif = notifications.find(n => 
        n.type === 'order_update' && 
        n.data?.orderId === order.id &&
        n.data?.status === 'delivered'
      )
      
      if (deliveredNotif) {
        console.log('   ✅ Delivered notification created successfully')
        console.log(`      Title: ${deliveredNotif.title}`)
        console.log(`      Message: ${deliveredNotif.message}`)
      } else {
        console.log('   ❌ Delivered notification NOT created')
      }
      
      // Show user's notification count
      const userNotifications = professionalNotificationSystem.getUserNotifications(order.userId)
      const unreadCount = professionalNotificationSystem.getUnreadCount(order.userId)
      console.log(`   📊 User has ${userNotifications.length} total notifications, ${unreadCount} unread`)
    }
    
    console.log('\n🎉 Testing completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testDeliveryNotifications()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test script failed:', error)
      process.exit(1)
    })
}

export { testDeliveryNotifications }
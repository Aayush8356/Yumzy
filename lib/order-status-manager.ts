import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, foodItemsTable, usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { emailService } from '@/lib/email'

export interface OrderStatusTimeline {
  status: string
  timestamp: Date
  estimatedDuration: number // in minutes
}

export class OrderStatusManager {
  // Calculate total preparation time based on food items
  static calculatePreparationTime(orderItems: any[]): number {
    if (!orderItems || orderItems.length === 0) return 15;
    
    console.log('Calculating preparation time for items:', orderItems.map(item => ({
      name: item.name || item.foodItem?.name || 'Unknown',
      cookTime: item.cookTime || item.foodItem?.cookTime || '15 mins',
      quantity: item.quantity
    })));
    
    // Find the maximum cook time among all items (dishes can be cooked in parallel)
    let maxCookTime = 0;
    
    orderItems.forEach(item => {
      const cookTimeStr = item.cookTime || item.foodItem?.cookTime || item.preparationTime || '15 mins';
      const cookTime = this.parseCookTime(cookTimeStr);
      console.log(`Item cook time: ${cookTimeStr} -> ${cookTime} minutes`);
      maxCookTime = Math.max(maxCookTime, cookTime);
    });
    
    // Add a small buffer for kitchen setup and coordination (2-5 minutes)
    const kitchenBuffer = Math.min(2 + Math.floor(orderItems.length / 2), 5);
    const preparationTime = maxCookTime + kitchenBuffer;
    
    // Validate preparation time is reasonable (max 90 minutes)
    const finalTime = Math.min(Math.max(preparationTime, 10), 90);
    
    console.log(`Final preparation time: ${finalTime} minutes (max cook time: ${maxCookTime}, buffer: ${kitchenBuffer}, original: ${preparationTime})`);
    
    return Math.round(finalTime);
  }
  
  // Parse cook time string like "20-25 mins" or "1 hr"
  static parseCookTime(cookTimeStr: string): number {
    if (!cookTimeStr || typeof cookTimeStr !== 'string') {
      console.log('Invalid cook time string:', cookTimeStr);
      return 15;
    }
    
    const str = cookTimeStr.toLowerCase().trim();
    console.log('Parsing cook time:', str);
    
    // Handle hour format
    if (str.includes('hr') || str.includes('hour')) {
      const hours = parseFloat(str.match(/\d+/)?.[0] || '1');
      return hours * 60;
    }
    
    // Handle minute format with ranges like "15-20 min", "25 mins", etc.
    const matches = str.match(/(\d+)(?:\s*-\s*(\d+))?/);
    if (matches) {
      const min = parseInt(matches[1]);
      const max = matches[2] ? parseInt(matches[2]) : min;
      const result = Math.round((min + max) / 2);
      console.log(`Parsed time: ${min}-${max} -> ${result} minutes`);
      return result;
    }
    
    console.log('Could not parse cook time, using default 15 minutes');
    return 15; // Default fallback
  }
  
  // Generate random delivery time between 25-50 minutes
  static generateDeliveryTime(): number {
    return Math.floor(Math.random() * (50 - 25 + 1)) + 25;
  }
  
  // Get time-based status timeline for display
  static getOrderTimeline(orderCreatedAt: Date): OrderStatusTimeline[] {
    return [
      {
        status: 'confirmed',
        timestamp: orderCreatedAt,
        estimatedDuration: 2
      },
      {
        status: 'preparing',
        timestamp: new Date(orderCreatedAt.getTime() + 2 * 60 * 1000),
        estimatedDuration: 23
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(orderCreatedAt.getTime() + 25 * 60 * 1000),
        estimatedDuration: 30
      },
      {
        status: 'delivered',
        timestamp: new Date(orderCreatedAt.getTime() + 55 * 60 * 1000),
        estimatedDuration: 0
      }
    ];
  }
  
  // Update order status
  static async updateOrderStatus(orderId: string, newStatus: string, trackingInfo?: any) {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      };
      
      // Add delivery time for delivered status
      if (newStatus === 'delivered') {
        updateData.actualDeliveryTime = new Date();
      }
      
      // Update tracking info if provided
      if (trackingInfo) {
        updateData.trackingInfo = trackingInfo;
      }
      
      await db
        .update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, orderId));
      
      console.log(`Order ${orderId} status updated to: ${newStatus}`);
      return true;
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error);
      return false;
    }
  }
  
  // Simple helper to get remaining time for a status
  static getTimeRemainingForStatus(orderCreatedAt: Date, currentStatus: string): number {
    const now = new Date();
    const minutesSinceOrder = Math.floor((now.getTime() - orderCreatedAt.getTime()) / (1000 * 60));
    
    switch (currentStatus) {
      case 'confirmed':
        return Math.max(0, 2 - minutesSinceOrder);
      case 'preparing':
        return Math.max(0, 25 - minutesSinceOrder);
      case 'out_for_delivery':
        return Math.max(0, 55 - minutesSinceOrder);
      default:
        return 0;
    }
  }
  
  // Simple time-based order status calculation
  static calculateOrderStatus(orderCreatedAt: Date): string {
    const now = new Date();
    const minutesSinceOrder = Math.floor((now.getTime() - orderCreatedAt.getTime()) / (1000 * 60));
    
    console.log(`📅 Order created ${minutesSinceOrder} minutes ago`);
    
    // Simple time-based progression:
    // 0-2 minutes: confirmed
    // 2-25 minutes: preparing  
    // 25-55 minutes: out_for_delivery
    // 55+ minutes: delivered
    
    if (minutesSinceOrder < 2) {
      return 'confirmed';
    } else if (minutesSinceOrder < 25) {
      return 'preparing';
    } else if (minutesSinceOrder < 55) {
      return 'out_for_delivery';
    } else {
      return 'delivered';
    }
  }

  // Check and update order status based on time since creation
  static async checkAndUpdateOrderStatus(orderId: string) {
    try {
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId));
        
      if (!order) {
        return false;
      }

      // Skip if already delivered or cancelled
      if (order.status === 'delivered' || order.status === 'cancelled') {
        return false;
      }

      const currentStatus = order.status;
      
      // Normalize old status names to new ones first
      const normalizedStatus = this.normalizeOrderStatus(currentStatus);
      if (normalizedStatus !== currentStatus) {
        console.log(`🔄 Normalizing order ${orderId} status: ${currentStatus} → ${normalizedStatus}`);
        await this.updateOrderStatus(orderId, normalizedStatus);
        return true;
      }

      // Calculate what status should be based on creation time
      const orderCreatedAt = order.createdAt ? new Date(order.createdAt) : new Date();
      const calculatedStatus = this.calculateOrderStatus(orderCreatedAt);
      
      // Update status if it has progressed
      if (calculatedStatus !== currentStatus) {
        console.log(`🔄 Order ${orderId} status updated: ${currentStatus} → ${calculatedStatus} (${Math.floor((new Date().getTime() - orderCreatedAt.getTime()) / (1000 * 60))} minutes since creation)`);
        
        await this.updateOrderStatus(orderId, calculatedStatus);
        await this.notifyStatusChange(orderId, calculatedStatus);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking order status for ${orderId}:`, error);
      return false;
    }
  }

  // Normalize old status names to new standard
  static normalizeOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'confirmed',
      'order_confirmed': 'confirmed',
      'preparing': 'preparing',
      'ready': 'out_for_delivery',
      'on_the_way': 'out_for_delivery',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status] || status;
  }
  
  // Notify status change with real-time updates
  static async notifyStatusChange(orderId: string, newStatus: string) {
    try {
      // Get order details for notification
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
      
      if (!order) {
        console.error(`Order ${orderId} not found for notification`)
        return
      }

      // Create notification data
      const notificationData = {
        orderId: orderId,
        userId: order.userId,
        status: newStatus,
        message: this.getStatusMessage(newStatus),
        timestamp: new Date().toISOString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }

      // Use direct notification system instead of API call to avoid server-side fetch issues
      try {
        const { professionalNotificationSystem } = await import('@/lib/data/professional-notifications')
        
        // Create notification directly using the professional notification system
        professionalNotificationSystem.createNotification({
          userId: order.userId,
          type: 'order_update',
          title: this.getStatusTitle(newStatus),
          message: this.getStatusMessage(newStatus),
          data: {
            orderId,
            status: newStatus,
            previousStatus: order.status,
            orderTotal: order.total,
            estimatedDeliveryTime: order.estimatedDeliveryTime
          },
          isImportant: true,
          isPersistent: true // Make delivery notifications persistent
        })
        
        console.log(`📬 Direct notification created for order ${orderId}: ${newStatus}`)
      } catch (directError) {
        console.error('Failed to create direct notification:', directError)
        
        // Fallback to API call with better error handling
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${order.userId}`
            },
            body: JSON.stringify({
              userId: order.userId,
              type: 'order_update',
              title: this.getStatusTitle(newStatus),
              message: this.getStatusMessage(newStatus),
              data: {
                orderId,
                status: newStatus,
                previousStatus: order.status,
                orderTotal: order.total,
                estimatedDeliveryTime: order.estimatedDeliveryTime
              },
              isImportant: true
            })
          })
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`)
          }
          
          console.log(`📬 API notification created for order ${orderId}: ${newStatus}`)
        } catch (apiError) {
          console.error('Failed to send notification to API:', apiError)
        }
      }

      // Send real-time update with better error handling
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/realtime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'order_status',
            userId: order.userId,
            orderId,
            data: notificationData
          })
        })
        
        if (!response.ok) {
          throw new Error(`Realtime API returned ${response.status}: ${response.statusText}`)
        }
        
        console.log(`🔄 Real-time update sent for order ${orderId}: ${newStatus}`)
      } catch (realtimeError) {
        console.error('Failed to send real-time update:', realtimeError)
        
        // Fallback: Store update in global state directly
        try {
          if (!(global as any).pendingUpdates) {
            (global as any).pendingUpdates = new Map()
          }
          
          const key = `updates:${order.userId}`
          if (!(global as any).pendingUpdates.has(key)) {
            (global as any).pendingUpdates.set(key, [])
          }
          
          const update = {
            type: 'order_status' as const,
            userId: order.userId,
            orderId,
            data: notificationData,
            timestamp: new Date().toISOString()
          }
          
          const userUpdates = (global as any).pendingUpdates.get(key) as any[]
          userUpdates.push(update)
          console.log(`🔄 Fallback: Real-time update stored directly for order ${orderId}: ${newStatus}`)
        } catch (fallbackError) {
          console.error('Failed to store fallback update:', fallbackError)
        }
      }

      // Send email notifications for specific status changes
      try {
        if (['out_for_delivery', 'delivered'].includes(newStatus)) {
          // Get user details for email
          const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, order.userId))
          
          if (user && user.email && user.isVerified) {
            if (newStatus === 'out_for_delivery') {
              // Send out for delivery email
              const estimatedArrival = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now
              await emailService.sendOutForDelivery(user.email, user.name, {
                orderId,
                estimatedArrival: estimatedArrival.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              })
              console.log(`📧 Out for delivery email sent to ${user.email}`)
              
            } else if (newStatus === 'delivered') {
              // Get order items for delivery email
              const orderItems = await db
                .select({
                  foodItem: {
                    name: foodItemsTable.name
                  },
                  quantity: orderItemsTable.quantity
                })
                .from(orderItemsTable)
                .leftJoin(foodItemsTable, eq(orderItemsTable.foodItemId, foodItemsTable.id))
                .where(eq(orderItemsTable.orderId, orderId))
              
              const items = orderItems.map(item => ({
                name: item.foodItem?.name || 'Unknown Item',
                quantity: item.quantity
              }))
              
              // Send order delivered email
              await emailService.sendOrderDelivered(user.email, user.name, {
                orderId,
                total: `₹${parseFloat(order.total).toFixed(1)}`,
                items
              })
              console.log(`📧 Order delivered email sent to ${user.email}`)
            }
          } else {
            console.log(`📧 Skipping email for order ${orderId}: user email not verified or not found`)
          }
        }
      } catch (emailError) {
        console.error(`Error sending email notification for order ${orderId}:`, emailError)
      }

      console.log(`🔔 Order ${orderId} status notification processing completed: ${newStatus}`)
    } catch (error) {
      console.error(`Error sending notification for order ${orderId}:`, error)
    }
  }

  // Get status title for notifications
  static getStatusTitle(status: string): string {
    const titles = {
      'confirmed': 'Order Confirmed! 🎉',
      'preparing': 'Kitchen Started Cooking! 👨‍🍳',
      'out_for_delivery': 'Out for Delivery! 🛵',
      'delivered': 'Order Delivered! 🎉',
      'cancelled': 'Order Cancelled'
    }
    return titles[status as keyof typeof titles] || 'Order Status Updated'
  }

  // Get status message for notifications
  static getStatusMessage(status: string): string {
    const messages = {
      'confirmed': 'Your order has been confirmed and is being prepared',
      'preparing': 'Our kitchen is preparing your delicious meal',
      'out_for_delivery': 'Your order is on the way! Our delivery partner is heading to you',
      'delivered': 'Your order has been delivered successfully. Enjoy your meal!',
      'cancelled': 'Your order has been cancelled'
    }
    return messages[status as keyof typeof messages] || 'Order status updated'
  }
  
  // Get order status progress percentage
  static getOrderProgress(status: string): number {
    const statusProgress: Record<string, number> = {
      'pending': 0,
      'confirmed': 20,
      'preparing': 40,
      'out_for_delivery': 80,
      'delivered': 100,
      'cancelled': 0
    };
    
    return statusProgress[status] || 0;
  }
  
  // Get estimated delivery time for an order (simple: 55 minutes from creation)
  static getEstimatedDeliveryTime(orderCreatedAt?: Date): Date {
    const creationTime = orderCreatedAt || new Date();
    const deliveryTime = new Date(creationTime.getTime() + 55 * 60 * 1000); // 55 minutes from creation
    
    console.log(`🍕 Simple Delivery Time Calculation:
      - Order Created: ${creationTime.toLocaleTimeString()}
      - Estimated Delivery: ${deliveryTime.toLocaleTimeString()}
      - Total Time: 55 minutes`);
    
    return deliveryTime;
  }
  
  // Format time remaining
  static formatTimeRemaining(targetTime: Date): string {
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ready';
    
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  }
}
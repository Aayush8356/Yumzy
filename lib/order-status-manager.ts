import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
  
  // Create order status timeline
  static createOrderTimeline(orderItems: any[]): OrderStatusTimeline[] {
    const now = new Date();
    const preparationTime = this.calculatePreparationTime(orderItems);
    const deliveryTime = this.generateDeliveryTime();
    
    return [
      {
        status: 'confirmed',
        timestamp: now,
        estimatedDuration: 0
      },
      {
        status: 'preparing',
        timestamp: new Date(now.getTime() + 2 * 60 * 1000), // 2 minutes after confirmation
        estimatedDuration: preparationTime
      },
      {
        status: 'out_for_delivery',
        timestamp: new Date(now.getTime() + (2 + preparationTime) * 60 * 1000),
        estimatedDuration: deliveryTime
      },
      {
        status: 'delivered',
        timestamp: new Date(now.getTime() + (2 + preparationTime + deliveryTime) * 60 * 1000),
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
  
  // Schedule status updates for an order (store timeline in database)
  static async scheduleOrderStatusUpdates(orderId: string, orderItems: any[]) {
    const timeline = this.createOrderTimeline(orderItems);
    
    // Store the complete timeline in the order tracking info for client-side processing
    const trackingInfo = {
      timeline: timeline.map(t => ({
        status: t.status,
        timestamp: t.timestamp.toISOString(),
        estimatedDuration: t.estimatedDuration
      })),
      currentStatus: 'confirmed',
      lastUpdate: new Date().toISOString(),
      nextStatusTime: timeline[1]?.timestamp.toISOString()
    };
    
    // Update order with timeline information
    await this.updateOrderStatus(orderId, 'confirmed', trackingInfo);
    
    // Send initial confirmation notification
    await this.notifyStatusChange(orderId, 'confirmed');
    
    console.log(`📅 Order ${orderId} timeline stored:`, {
      confirmed: 'now',
      preparing: timeline[1]?.timestamp.toLocaleString(),
      out_for_delivery: timeline[2]?.timestamp.toLocaleString(), 
      delivered: timeline[3]?.timestamp.toLocaleString()
    });
  }
  
  // Check and update order status based on timeline (called by tracking page)
  static async checkAndUpdateOrderStatus(orderId: string) {
    try {
      const [order] = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId));
        
      if (!order || !order.trackingInfo?.timeline) {
        return false;
      }
      
      const timeline = order.trackingInfo.timeline;
      const currentTime = new Date();
      const currentStatus = order.status;
      
      // Find the next status that should be active
      let newStatus = currentStatus;
      for (const timelineItem of timeline) {
        const statusTime = new Date(timelineItem.timestamp);
        if (currentTime >= statusTime && timelineItem.status !== currentStatus) {
          newStatus = timelineItem.status;
        }
      }
      
      // Update status if it changed
      if (newStatus !== currentStatus) {
        const updatedTrackingInfo = {
          ...order.trackingInfo,
          currentStatus: newStatus,
          lastUpdate: new Date().toISOString()
        };
        
        await this.updateOrderStatus(orderId, newStatus, updatedTrackingInfo);
        await this.notifyStatusChange(orderId, newStatus);
        
        console.log(`🔄 Order ${orderId} status updated: ${currentStatus} → ${newStatus}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking order status for ${orderId}:`, error);
      return false;
    }
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

      // Send notification to notification center API (server-side safe)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/notifications`, {
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
      } catch (apiError) {
        console.error('Failed to send notification to API:', apiError)
      }

      // Send real-time update
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/realtime`, {
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
      } catch (realtimeError) {
        console.error('Failed to send real-time update:', realtimeError)
      }

      console.log(`🔔 Order ${orderId} status notification sent: ${newStatus}`)
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
  
  // Get estimated delivery time for an order
  static getEstimatedDeliveryTime(orderItems: any[]): Date {
    const preparationTime = this.calculatePreparationTime(orderItems);
    const deliveryTime = this.generateDeliveryTime();
    const confirmationTime = 2; // 2 minutes for order confirmation
    const totalTime = confirmationTime + preparationTime + deliveryTime;
    
    // Ensure total time is reasonable (between 30-90 minutes)
    const minTotalTime = 30; // minimum 30 minutes
    const maxTotalTime = 90; // maximum 90 minutes
    const validatedTotalTime = Math.max(minTotalTime, Math.min(totalTime, maxTotalTime));
    
    const now = new Date();
    const estimatedTime = new Date(now.getTime() + validatedTotalTime * 60 * 1000);
    
    console.log(`🍕 Delivery Time Calculation:
      - Current Time: ${now.toLocaleTimeString()}
      - Confirmation: ${confirmationTime} min
      - Preparation: ${preparationTime} min  
      - Delivery: ${deliveryTime} min
      - Total: ${totalTime} min
      - Validated: ${validatedTotalTime} min
      - Estimated Delivery: ${estimatedTime.toLocaleTimeString()}`);
    
    return estimatedTime;
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
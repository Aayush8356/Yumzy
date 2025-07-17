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
  
  // Schedule status updates for an order
  static async scheduleOrderStatusUpdates(orderId: string, orderItems: any[]) {
    const timeline = this.createOrderTimeline(orderItems);
    
    timeline.forEach((statusUpdate, index) => {
      if (index === 0) return; // Skip initial confirmed status
      
      const delay = statusUpdate.timestamp.getTime() - Date.now();
      
      // Schedule the status update
      setTimeout(async () => {
        const trackingInfo = {
          status: statusUpdate.status,
          lastUpdate: new Date(),
          estimatedArrival: index < timeline.length - 1 ? timeline[index + 1].timestamp : null
        };
        
        await this.updateOrderStatus(orderId, statusUpdate.status, trackingInfo);
        
        // Trigger real-time update
        await this.notifyStatusChange(orderId, statusUpdate.status);
        
      }, Math.max(delay, 0));
    });
    
    // Store timeline in order tracking info
    const initialTrackingInfo = {
      timeline: timeline,
      currentStatus: 'confirmed',
      lastUpdate: new Date(),
      estimatedArrival: timeline[1].timestamp
    };
    
    await this.updateOrderStatus(orderId, 'confirmed', initialTrackingInfo);
    
    // Send initial confirmation notification
    await this.notifyStatusChange(orderId, 'confirmed');
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

      // Send browser notification event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-status-updated', {
          detail: notificationData
        }))
      }

      // Send admin notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-order-updated', {
          detail: notificationData
        }))
        
        // Trigger analytics refresh
        window.dispatchEvent(new CustomEvent('admin-data-refresh', {
          detail: { type: 'order_status_change', orderId, newStatus }
        }))
      }

      console.log(`🔔 Order ${orderId} status changed to: ${newStatus}`)
    } catch (error) {
      console.error(`Error sending notification for order ${orderId}:`, error)
    }
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
    
    // Validate total time is reasonable (max 3 hours)
    const maxTotalTime = 3 * 60; // 3 hours
    const validatedTotalTime = Math.min(totalTime, maxTotalTime);
    
    console.log(`Estimated delivery time calculation:
      - Confirmation: ${confirmationTime} minutes
      - Preparation: ${preparationTime} minutes  
      - Delivery: ${deliveryTime} minutes
      - Total: ${totalTime} minutes
      - Validated Total: ${validatedTotalTime} minutes`);
    
    const estimatedTime = new Date(Date.now() + validatedTotalTime * 60 * 1000);
    console.log(`Estimated delivery time: ${estimatedTime.toLocaleString()}`);
    
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
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
    
    // Extract cook times and calculate total
    let totalCookTime = 0;
    let maxCookTime = 0;
    
    orderItems.forEach(item => {
      const cookTimeStr = item.foodItem?.cookTime || '15 mins';
      const cookTime = this.parseCookTime(cookTimeStr);
      totalCookTime += cookTime * item.quantity;
      maxCookTime = Math.max(maxCookTime, cookTime);
    });
    
    // Use parallel cooking logic: base time + additional time for complexity
    const preparationTime = Math.max(
      maxCookTime, // At least the longest single item
      Math.min(totalCookTime * 0.6, 45) // Cap at 45 minutes
    );
    
    return Math.round(preparationTime);
  }
  
  // Parse cook time string like "20-25 mins" or "1 hr"
  static parseCookTime(cookTimeStr: string): number {
    const str = cookTimeStr.toLowerCase();
    
    // Handle hour format
    if (str.includes('hr') || str.includes('hour')) {
      const hours = parseFloat(str.match(/\d+/)?.[0] || '1');
      return hours * 60;
    }
    
    // Handle minute format with ranges
    const matches = str.match(/(\d+)(?:-(\d+))?/);
    if (matches) {
      const min = parseInt(matches[1]);
      const max = matches[2] ? parseInt(matches[2]) : min;
      return Math.round((min + max) / 2);
    }
    
    return 15; // Default fallback
  }
  
  // Generate random delivery time
  static generateDeliveryTime(): number {
    const deliveryOptions = [15, 20, 25, 30, 35, 40, 45];
    return deliveryOptions[Math.floor(Math.random() * deliveryOptions.length)];
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
        
        // Trigger real-time update (we'll implement WebSocket later)
        this.notifyStatusChange(orderId, statusUpdate.status);
        
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
  }
  
  // Notify status change (placeholder for real-time updates)
  static notifyStatusChange(orderId: string, newStatus: string) {
    // TODO: Implement WebSocket or Server-Sent Events for real-time updates
    console.log(`🔔 Order ${orderId} status changed to: ${newStatus}`);
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
    const totalTime = 2 + preparationTime + deliveryTime; // 2 min confirmation + prep + delivery
    
    return new Date(Date.now() + totalTime * 60 * 1000);
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
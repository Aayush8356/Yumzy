/**
 * Complete Order Lifecycle Simulation System
 * Handles the entire journey from payment to delivery with realistic timing
 */

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_processing' 
  | 'payment_confirmed'
  | 'order_confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'driver_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderSimulationConfig {
  orderId: string
  items: Array<{
    id: string
    name: string
    cookTime: string // e.g., "25 min"
    difficulty: string
    quantity: number
  }>
  totalAmount: number
  customerDetails: {
    name: string
    address: string
    phone: string
  }
}

export interface OrderStatusUpdate {
  orderId: string
  status: OrderStatus
  timestamp: Date
  estimatedTime?: number // minutes
  message: string
  additionalData?: Record<string, any>
}

export interface DeliverySimulation {
  driverName: string
  driverPhone: string
  vehicleType: 'bike' | 'car' | 'bicycle'
  estimatedDeliveryTime: number // minutes
  currentLocation?: {
    latitude: number
    longitude: number
  }
}

class OrderSimulator {
  private static instance: OrderSimulator
  private activeOrders = new Map<string, NodeJS.Timeout[]>()
  private statusUpdateCallbacks = new Map<string, (update: OrderStatusUpdate) => void>()

  static getInstance(): OrderSimulator {
    if (!OrderSimulator.instance) {
      OrderSimulator.instance = new OrderSimulator()
    }
    return OrderSimulator.instance
  }

  /**
   * Start the complete order simulation process
   */
  async startOrderSimulation(
    config: OrderSimulationConfig,
    onStatusUpdate: (update: OrderStatusUpdate) => void
  ): Promise<void> {
    this.statusUpdateCallbacks.set(config.orderId, onStatusUpdate)
    
    // Calculate realistic cooking time based on items
    const totalCookTime = this.calculateTotalCookTime(config.items)
    
    // Start the simulation timeline
    this.scheduleOrderUpdates(config, totalCookTime)
  }

  /**
   * Calculate total cooking time based on menu items
   */
  private calculateTotalCookTime(items: Array<any>): number {
    let maxCookTime = 0
    let totalComplexity = 0

    items.forEach(item => {
      // Parse cook time (e.g., "25 min" -> 25)
      const cookMinutes = parseInt(item.cookTime.replace(/\D/g, '')) || 15
      
      // Adjust for difficulty
      const difficultyMap = {
        'Easy': 1,
        'Medium': 1.2,
        'Hard': 1.5
      } as const
      
      const difficultyMultiplier = difficultyMap[item.difficulty as keyof typeof difficultyMap] || 1

      const adjustedTime = cookMinutes * difficultyMultiplier * item.quantity
      maxCookTime = Math.max(maxCookTime, adjustedTime)
      totalComplexity += adjustedTime
    })

    // Add kitchen queue time (realistic restaurant simulation)
    const queueTime = Math.random() * 10 + 5 // 5-15 minutes queue time
    
    // Final cooking time (considering parallel cooking)
    return Math.ceil(maxCookTime + queueTime + (totalComplexity * 0.1))
  }

  /**
   * Schedule all order status updates with realistic timing
   */
  private scheduleOrderUpdates(config: OrderSimulationConfig, cookTime: number): void {
    const timers: NodeJS.Timeout[] = []
    const orderId = config.orderId

    // 1. Order Confirmed (immediate)
    this.emitStatusUpdate(orderId, {
      orderId,
      status: 'order_confirmed',
      timestamp: new Date(),
      message: `Order confirmed! Your ${config.items.length} items are queued for preparation.`,
      estimatedTime: cookTime + 30 // cooking + delivery time
    })

    // 2. Preparing (2-5 minutes delay)
    const preparingDelay = Math.random() * 3 + 2
    timers.push(setTimeout(() => {
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'preparing',
        timestamp: new Date(),
        message: `Our chefs are now preparing your delicious meal! 👨‍🍳`,
        estimatedTime: cookTime + 25,
        additionalData: {
          chefName: this.getRandomChefName(),
          kitchenQueue: Math.floor(Math.random() * 5) + 1
        }
      })
    }, preparingDelay * 60 * 1000))

    // 3. Ready for Pickup (after cooking time)
    timers.push(setTimeout(() => {
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'ready_for_pickup',
        timestamp: new Date(),
        message: `Your order is ready! Assigning delivery partner... 🚗`,
        estimatedTime: 25
      })
    }, cookTime * 60 * 1000))

    // 4. Driver Assigned (2-3 minutes after ready)
    const driverAssignDelay = cookTime + (Math.random() * 1 + 2)
    const deliveryInfo = this.generateDeliverySimulation()
    
    timers.push(setTimeout(() => {
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'driver_assigned',
        timestamp: new Date(),
        message: `${deliveryInfo.driverName} will deliver your order! 🏍️`,
        estimatedTime: deliveryInfo.estimatedDeliveryTime,
        additionalData: {
          driver: deliveryInfo
        }
      })
    }, driverAssignDelay * 60 * 1000))

    // 5. Out for Delivery (1-2 minutes after driver assigned)
    const outForDeliveryDelay = driverAssignDelay + (Math.random() * 1 + 1)
    timers.push(setTimeout(() => {
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'out_for_delivery',
        timestamp: new Date(),
        message: `Your food is on the way! Track ${deliveryInfo.driverName} in real-time 📍`,
        estimatedTime: deliveryInfo.estimatedDeliveryTime - 2,
        additionalData: {
          driver: deliveryInfo,
          trackingUrl: `/track/${orderId}`
        }
      })
    }, outForDeliveryDelay * 60 * 1000))

    // 6. Delivered (after full delivery time)
    const totalDeliveryTime = cookTime + deliveryInfo.estimatedDeliveryTime
    timers.push(setTimeout(() => {
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'delivered',
        timestamp: new Date(),
        message: `Order delivered successfully! 🎉 Enjoy your meal!`,
        additionalData: {
          deliveredBy: deliveryInfo.driverName,
          deliveryRating: null,
          feedbackRequested: true
        }
      })
      
      // Clean up timers
      this.cleanupOrder(orderId)
    }, totalDeliveryTime * 60 * 1000))

    // Store timers for potential cancellation
    this.activeOrders.set(orderId, timers)
  }

  /**
   * Generate realistic delivery partner simulation
   */
  private generateDeliverySimulation(): DeliverySimulation {
    const drivers = [
      'Raj Kumar', 'Amit Singh', 'Priya Sharma', 'Mohammed Ali',
      'Deepak Yadav', 'Sunita Devi', 'Arjun Patel', 'Kavya Reddy'
    ]
    
    const vehicles = ['bike', 'car', 'bicycle'] as const
    
    return {
      driverName: drivers[Math.floor(Math.random() * drivers.length)],
      driverPhone: '+91' + Math.floor(Math.random() * 9000000000 + 1000000000),
      vehicleType: vehicles[Math.floor(Math.random() * vehicles.length)],
      estimatedDeliveryTime: Math.floor(Math.random() * 30) + 15 // 15-45 minutes
    }
  }

  /**
   * Get random chef name for realism
   */
  private getRandomChefName(): string {
    const chefs = [
      'Chef Ramesh', 'Chef Priya', 'Chef Kumar', 'Chef Anita',
      'Chef Vikram', 'Chef Sunita', 'Chef Raj', 'Chef Kavita'
    ]
    return chefs[Math.floor(Math.random() * chefs.length)]
  }

  /**
   * Emit status update to callback
   */
  private emitStatusUpdate(orderId: string, update: OrderStatusUpdate): void {
    const callback = this.statusUpdateCallbacks.get(orderId)
    if (callback) {
      callback(update)
    }

    // Also emit to global event system for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('order-status-update', {
        detail: update
      }))
    }
  }

  /**
   * Cancel order simulation
   */
  cancelOrderSimulation(orderId: string): void {
    const timers = this.activeOrders.get(orderId)
    if (timers) {
      timers.forEach(timer => clearTimeout(timer))
      this.cleanupOrder(orderId)
      
      this.emitStatusUpdate(orderId, {
        orderId,
        status: 'cancelled',
        timestamp: new Date(),
        message: 'Order has been cancelled successfully. Refund will be processed within 2-3 business days.'
      })
    }
  }

  /**
   * Clean up order resources
   */
  private cleanupOrder(orderId: string): void {
    this.activeOrders.delete(orderId)
    this.statusUpdateCallbacks.delete(orderId)
  }

  /**
   * Get active order status
   */
  getActiveOrders(): string[] {
    return Array.from(this.activeOrders.keys())
  }

  /**
   * Check if order is active
   */
  isOrderActive(orderId: string): boolean {
    return this.activeOrders.has(orderId)
  }
}

export default OrderSimulator
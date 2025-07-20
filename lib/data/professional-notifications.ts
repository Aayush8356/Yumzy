import { foodItemsData } from './seed-data'
import { getDailyFeaturedItem } from '@/data/food-items'

export interface ProfessionalNotification {
  id: string
  type: 'hot_deal' | 'order' | 'order_update' | 'promo' | 'system' | 'delivery'
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  isImportant: boolean
  isPersistent: boolean // Should survive page reloads
  expiresAt?: string
  createdAt: string
  userId: string
}

// Export function to create delivery notifications from server-side
export function createDeliveryNotification(userId: string, orderId: string, status: string, orderData?: any) {
  const titles = {
    'out_for_delivery': 'Out for Delivery! 🛵',
    'delivered': 'Order Delivered! 🎉'
  }
  
  const messages = {
    'out_for_delivery': 'Your order is on the way! Our delivery partner is heading to you',
    'delivered': 'Your order has been delivered successfully. Enjoy your meal!'
  }
  
  return professionalNotificationSystem.createNotification({
    userId,
    type: 'order_update',
    title: titles[status as keyof typeof titles] || 'Order Status Updated',
    message: messages[status as keyof typeof messages] || 'Your order status has been updated',
    data: {
      orderId,
      status,
      orderTotal: orderData?.total,
      estimatedDeliveryTime: orderData?.estimatedDeliveryTime
    },
    isImportant: true,
    isPersistent: true
  })
}

interface NotificationState {
  notifications: ProfessionalNotification[]
  readNotifications: Set<string>
  dismissedNotifications: Set<string>
  lastHotDealDate: string | null
}

// Server-side state storage (in-memory but persisted per user)
const serverState = new Map<string, {
  readNotifications: Set<string>
  dismissedNotifications: Set<string>
  lastHotDealDate: string | null
}>()

class ProfessionalNotificationSystem {
  private state: NotificationState = {
    notifications: [],
    readNotifications: new Set(),
    dismissedNotifications: new Set(),
    lastHotDealDate: null
  }

  constructor() {
    // Initial load without userId for client-side
    this.loadState()
  }

  // Load state from localStorage (client) or server state (server)
  private loadState(userId?: string) {
    if (typeof window === 'undefined') {
      // Server-side: load from server state
      if (userId && serverState.has(userId)) {
        const saved = serverState.get(userId)!
        this.state = {
          ...this.state,
          readNotifications: new Set(saved.readNotifications),
          dismissedNotifications: new Set(saved.dismissedNotifications),
          lastHotDealDate: saved.lastHotDealDate
        }
        console.log(`📋 Server state loaded for user ${userId}:`, {
          read: Array.from(this.state.readNotifications),
          dismissed: Array.from(this.state.dismissedNotifications)
        })
      } else if (userId) {
        console.log(`🆕 No server state found for user ${userId}, starting fresh`)
      }
      return
    }

    // Client-side: load from localStorage
    try {
      const saved = localStorage.getItem('notification_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.state = {
          ...this.state,
          readNotifications: new Set(parsed.readNotifications || []),
          dismissedNotifications: new Set(parsed.dismissedNotifications || []),
          lastHotDealDate: parsed.lastHotDealDate || null
        }
        console.log('📋 Client state loaded from localStorage:', {
          read: Array.from(this.state.readNotifications),
          dismissed: Array.from(this.state.dismissedNotifications)
        })
      }
    } catch (error) {
      console.error('Failed to load notification state:', error)
    }
  }

  // Save state to localStorage (client) or server state (server)
  private saveState(userId?: string) {
    if (typeof window === 'undefined') {
      // Server-side: save to server state
      if (userId) {
        serverState.set(userId, {
          readNotifications: new Set(this.state.readNotifications),
          dismissedNotifications: new Set(this.state.dismissedNotifications),
          lastHotDealDate: this.state.lastHotDealDate
        })
        console.log(`💾 Server state saved for user ${userId}:`, {
          read: Array.from(this.state.readNotifications),
          dismissed: Array.from(this.state.dismissedNotifications)
        })
      }
      return
    }

    // Client-side: save to localStorage
    try {
      const toSave = {
        readNotifications: Array.from(this.state.readNotifications),
        dismissedNotifications: Array.from(this.state.dismissedNotifications),
        lastHotDealDate: this.state.lastHotDealDate
      }
      localStorage.setItem('notification_state', JSON.stringify(toSave))
      console.log('💾 Client state saved to localStorage:', toSave)
    } catch (error) {
      console.error('Failed to save notification state:', error)
    }
  }

  // Get today's hot deal item (exactly same logic as hero section)
  private getTodaysHotDeal() {
    return getDailyFeaturedItem()
  }

  // Check if we need to create today's hot deal notification
  private shouldCreateHotDeal(): boolean {
    const today = new Date().toISOString().split('T')[0]
    return this.state.lastHotDealDate !== today
  }

  // Create hot deal notification
  private createHotDealNotification(userId: string): ProfessionalNotification {
    const hotDeal = this.getTodaysHotDeal()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    const discountPercent = hotDeal.discount || 25

    this.state.lastHotDealDate = todayStr
    this.saveState(userId)

    return {
      id: `hot-deal-${todayStr}`,
      type: 'hot_deal',
      title: '🔥 Today\'s Hot Deal!',
      message: `${hotDeal.name} is ${discountPercent}% off today only! Limited time offer.`,
      data: {
        foodItem: hotDeal,
        discount: discountPercent,
        originalPrice: hotDeal.originalPrice,
        salePrice: hotDeal.price,
        validUntil: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      },
      isRead: false,
      isImportant: true,
      isPersistent: false, // Hot deals don't persist - they're daily
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: today.toISOString(),
      userId
    }
  }

  // Create system notifications (these are one-time only)
  private createSystemNotifications(userId: string): ProfessionalNotification[] {
    const now = new Date()
    const notifications: ProfessionalNotification[] = []

    // Welcome notification (only once per user - check if user has ever received it)
    const welcomeKey = `welcome_shown_${userId}`
    const hasShownWelcome = typeof window !== 'undefined' ? localStorage.getItem(welcomeKey) : null
    
    if (!hasShownWelcome && !this.state.dismissedNotifications.has(`welcome-${userId}`) && !this.state.readNotifications.has(`welcome-${userId}`)) {
      // Mark as shown so it never appears again
      if (typeof window !== 'undefined') {
        localStorage.setItem(welcomeKey, 'true')
      }
      
      notifications.push({
        id: `welcome-${userId}`,
        type: 'system',
        title: '👋 Welcome to Yumzy!',
        message: 'Thank you for joining us! Enjoy premium cuisine delivered fast.',
        isRead: false,
        isImportant: false,
        isPersistent: true,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
        userId
      })
    }

    // Weekend promo (only on weekends)
    const dayOfWeek = now.getDay()
    if ((dayOfWeek === 6 || dayOfWeek === 0) && !this.state.dismissedNotifications.has(`weekend-promo-${userId}`)) {
      notifications.push({
        id: `weekend-promo-${userId}`,
        type: 'promo',
        title: '🎉 Weekend Special!',
        message: 'Get 20% off on all orders this weekend! Use code WEEKEND20',
        data: { promoCode: 'WEEKEND20', discount: 20 },
        isRead: false,
        isImportant: false,
        isPersistent: true,
        expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        userId
      })
    }

    return notifications
  }

  // Get notifications for a user
  getUserNotifications(userId: string): ProfessionalNotification[] {
    // Load state for this specific user (important for server-side)
    this.loadState(userId)
    
    const notifications: ProfessionalNotification[] = []

    // Add persistent notifications from localStorage
    notifications.push(...this.loadPersistentNotifications(userId))

    // Add hot deal if needed
    if (this.shouldCreateHotDeal()) {
      notifications.push(this.createHotDealNotification(userId))
    }

    // Add system notifications
    notifications.push(...this.createSystemNotifications(userId))

    // Add any runtime notifications already in state
    notifications.push(...this.state.notifications.filter(n => n.userId === userId))

    // Remove duplicates by ID
    const unique = notifications.reduce((acc, notification) => {
      if (!acc.find(n => n.id === notification.id)) {
        acc.push(notification)
      }
      return acc
    }, [] as ProfessionalNotification[])

    // Filter out dismissed notifications and apply read status
    const filtered = unique
      .filter(n => !this.state.dismissedNotifications.has(n.id))
      .map(n => ({
        ...n,
        isRead: this.state.readNotifications.has(n.id)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    this.state.notifications = filtered
    return filtered
  }

  // Mark notification as read
  markAsRead(notificationId: string, userId?: string): boolean {
    // Load current state for this user
    if (userId) this.loadState(userId)
    
    this.state.readNotifications.add(notificationId)
    this.saveState(userId)
    
    // Update local state
    this.state.notifications = this.state.notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    
    return true
  }

  // Mark all as read
  markAllAsRead(userId: string): void {
    // Load current state for this user
    this.loadState(userId)
    
    this.state.notifications
      .filter(n => n.userId === userId)
      .forEach(n => this.state.readNotifications.add(n.id))
    
    this.saveState(userId)
    
    // Update local state
    this.state.notifications = this.state.notifications.map(n => ({ ...n, isRead: true }))
  }

  // Dismiss notification (won't show again)
  dismissNotification(notificationId: string, userId?: string): boolean {
    // Load current state for this user
    if (userId) this.loadState(userId)
    
    this.state.dismissedNotifications.add(notificationId)
    this.saveState(userId)
    
    // Remove from current state
    this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId)
    
    return true
  }

  // Clear all non-persistent notifications
  clearAllNotifications(userId: string): void {
    const persistentIds = this.state.notifications
      .filter(n => n.userId === userId && n.isPersistent)
      .map(n => n.id)

    // Add non-persistent to dismissed
    this.state.notifications
      .filter(n => n.userId === userId && !n.isPersistent)
      .forEach(n => this.state.dismissedNotifications.add(n.id))

    this.saveState(userId)

    // Keep only persistent notifications
    this.state.notifications = this.state.notifications.filter(n => 
      n.userId !== userId || persistentIds.includes(n.id)
    )
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    return this.state.notifications.filter(n => 
      n.userId === userId && !n.isRead
    ).length
  }

  // Force refresh hot deal (for testing)
  forceRefreshHotDeal(userId: string): void {
    this.loadState(userId)
    this.state.lastHotDealDate = null
    this.saveState(userId)
    this.getUserNotifications(userId) // This will create new hot deal
  }

  // Create a new notification programmatically
  createNotification(config: {
    userId: string
    type: ProfessionalNotification['type']
    title: string
    message: string
    data?: Record<string, unknown>
    isImportant?: boolean
    isPersistent?: boolean
    expiresAt?: string
  }): ProfessionalNotification {
    const notification: ProfessionalNotification = {
      id: `${config.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: config.type,
      title: config.title,
      message: config.message,
      data: config.data || {},
      isRead: false,
      isImportant: config.isImportant || false,
      isPersistent: config.isPersistent || false,
      expiresAt: config.expiresAt,
      createdAt: new Date().toISOString(),
      userId: config.userId
    }

    // Add to current state
    this.state.notifications.unshift(notification) // Add to beginning for newest first
    
    // Save persistent notifications to localStorage
    if (notification.isPersistent) {
      this.savePersistentNotification(notification)
    }

    // For delivery status notifications, also trigger a window event for immediate UI updates
    if (config.type === 'order_update' && config.data?.status && typeof window !== 'undefined') {
      const deliveryStatuses = ['out_for_delivery', 'delivered']
      if (deliveryStatuses.includes(config.data.status as string)) {
        // Dispatch custom event for immediate UI updates
        window.dispatchEvent(new CustomEvent('delivery-notification', {
          detail: {
            notification,
            orderId: config.data.orderId,
            status: config.data.status
          }
        }))
        
        console.log(`🚚 Delivery notification dispatched for status: ${config.data.status}`)
      }
    }

    console.log(`📬 Created ${config.type} notification for user ${config.userId}: ${config.title}`)
    return notification
  }

  // Save persistent notification to localStorage
  private savePersistentNotification(notification: ProfessionalNotification): void {
    if (typeof window === 'undefined') return

    try {
      const key = `persistent_notification_${notification.id}`
      localStorage.setItem(key, JSON.stringify(notification))
    } catch (error) {
      console.error('Failed to save persistent notification:', error)
    }
  }

  // Load persistent notifications from localStorage
  private loadPersistentNotifications(userId: string): ProfessionalNotification[] {
    if (typeof window === 'undefined') return []

    const notifications: ProfessionalNotification[] = []
    
    try {
      // Get all keys that match persistent notification pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('persistent_notification_')) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const notification = JSON.parse(stored) as ProfessionalNotification
            
            // Only include notifications for this user that haven't expired
            if (notification.userId === userId) {
              if (!notification.expiresAt || new Date(notification.expiresAt) > new Date()) {
                notifications.push(notification)
              } else {
                // Remove expired notification
                localStorage.removeItem(key)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load persistent notifications:', error)
    }

    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

// Export singleton instance
export const professionalNotificationSystem = new ProfessionalNotificationSystem()
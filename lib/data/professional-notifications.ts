import { foodItemsData } from './seed-data'
import { getDailyFeaturedItem } from '@/data/food-items'

export interface ProfessionalNotification {
  id: string
  type: 'hot_deal' | 'order' | 'promo' | 'system' | 'delivery'
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

interface NotificationState {
  notifications: ProfessionalNotification[]
  readNotifications: Set<string>
  dismissedNotifications: Set<string>
  lastHotDealDate: string | null
}

class ProfessionalNotificationSystem {
  private state: NotificationState = {
    notifications: [],
    readNotifications: new Set(),
    dismissedNotifications: new Set(),
    lastHotDealDate: null
  }

  constructor() {
    this.loadState()
  }

  // Load state from localStorage
  private loadState() {
    if (typeof window === 'undefined') return

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
      }
    } catch (error) {
      console.error('Failed to load notification state:', error)
    }
  }

  // Save state to localStorage
  private saveState() {
    if (typeof window === 'undefined') return

    try {
      const toSave = {
        readNotifications: Array.from(this.state.readNotifications),
        dismissedNotifications: Array.from(this.state.dismissedNotifications),
        lastHotDealDate: this.state.lastHotDealDate
      }
      localStorage.setItem('notification_state', JSON.stringify(toSave))
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
    this.saveState()

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

    // Welcome notification (only once per user - only on first login after signup)
    if (!this.state.dismissedNotifications.has(`welcome-${userId}`) && !this.state.readNotifications.has(`welcome-${userId}`)) {
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
    const notifications: ProfessionalNotification[] = []

    // Add hot deal if needed
    if (this.shouldCreateHotDeal()) {
      notifications.push(this.createHotDealNotification(userId))
    }

    // Add system notifications
    notifications.push(...this.createSystemNotifications(userId))

    // Filter out dismissed notifications and apply read status
    const filtered = notifications
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
  markAsRead(notificationId: string): boolean {
    this.state.readNotifications.add(notificationId)
    this.saveState()
    
    // Update local state
    this.state.notifications = this.state.notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    
    return true
  }

  // Mark all as read
  markAllAsRead(userId: string): void {
    this.state.notifications
      .filter(n => n.userId === userId)
      .forEach(n => this.state.readNotifications.add(n.id))
    
    this.saveState()
    
    // Update local state
    this.state.notifications = this.state.notifications.map(n => ({ ...n, isRead: true }))
  }

  // Dismiss notification (won't show again)
  dismissNotification(notificationId: string): boolean {
    this.state.dismissedNotifications.add(notificationId)
    this.saveState()
    
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

    this.saveState()

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
    this.state.lastHotDealDate = null
    this.saveState()
    this.getUserNotifications(userId) // This will create new hot deal
  }
}

// Export singleton instance
export const professionalNotificationSystem = new ProfessionalNotificationSystem()
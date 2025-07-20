'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  type: 'hot_deal' | 'order' | 'order_update' | 'promo' | 'system' | 'payment' | 'delivery'
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  isImportant: boolean
  isPersistent?: boolean
  expiresAt?: Date | string
  createdAt: Date | string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAllNotifications: () => void
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Load initial notifications - optimized for HMR
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${user.id}`, // In real app, use proper JWT
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        
        // Show toast for unread important notifications (exclude promotional ones for admins)
        const unreadImportant = (data.notifications || []).filter(
          (n: Notification) => !n.isRead && n.isImportant && 
          // Don't show promotional notifications (hot deals, promos) to admin users
          !(user.role === 'admin' && (n.type === 'hot_deal' || n.type === 'promo'))
        )
        
        // Prioritize delivery notifications
        const deliveryNotifications = unreadImportant.filter((n: Notification) => 
          n.type === 'order_update' && 
          n.data?.status && 
          ['out_for_delivery', 'delivered'].includes(n.data.status as string)
        )
        
        if (deliveryNotifications.length > 0) {
          // Show the most recent delivery notification
          const latest = deliveryNotifications[0]
          toast({
            title: latest.title,
            description: latest.message,
            duration: 6000, // Longer duration for delivery notifications
          })
        } else if (unreadImportant.length > 0) {
          // Show the most recent important notification if no delivery notifications
          const latest = unreadImportant[0]
          toast({
            title: latest.title,
            description: latest.message,
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [isAuthenticated, user?.id, user, toast]) // More specific dependency

  // Initialize connection (simplified for demo - no websockets needed)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Simulate connection for demo
    setIsConnected(true)
    console.log('🔗 Notification system initialized')

    // Listen for delivery notifications
    const handleDeliveryNotification = (event: CustomEvent) => {
      console.log('🚚 Delivery notification received:', event.detail)
      const { notification, orderId, status } = event.detail
      
      // Show toast for delivery status updates
      if (status === 'out_for_delivery' || status === 'delivered') {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 6000, // Longer duration for delivery notifications
        })
      }
      
      // Refresh notifications to show the new one
      refreshNotifications()
    }

    // Add event listener for delivery notifications
    if (typeof window !== 'undefined') {
      window.addEventListener('delivery-notification', handleDeliveryNotification as EventListener)
    }

    return () => {
      setIsConnected(false)
      if (typeof window !== 'undefined') {
        window.removeEventListener('delivery-notification', handleDeliveryNotification as EventListener)
      }
    }
  }, [isAuthenticated, user, toast, refreshNotifications])


  // Set up periodic refresh for delivery notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Check for order updates every 30 seconds
    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, refreshNotifications])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('👀 Marking notification as read:', notificationId)
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        console.log('✅ Successfully marked as read on server')
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        // Refresh to ensure sync
        setTimeout(() => refreshNotifications(), 100)
      } else {
        console.error('❌ Failed to mark as read:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [user, refreshNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [user])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId)
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        console.log('✅ Successfully deleted on server')
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        // Refresh to ensure sync
        setTimeout(() => refreshNotifications(), 100)
      } else {
        console.error('❌ Failed to delete notification:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [user, refreshNotifications])

  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
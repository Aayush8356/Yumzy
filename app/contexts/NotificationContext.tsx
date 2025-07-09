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

  // Initialize connection (simplified for demo - no websockets needed)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Simulate connection for demo
    setIsConnected(true)
    console.log('🔗 Notification system initialized')

    return () => {
      setIsConnected(false)
    }
  }, [isAuthenticated, user])

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
        
        if (unreadImportant.length > 0) {
          // Show the most recent important notification
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

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [user])

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
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [user])

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
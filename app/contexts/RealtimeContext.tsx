'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface RealtimeUpdate {
  type: 'order_status' | 'delivery_update' | 'payment_status' | 'notification' | 'order_deleted'
  userId: string
  orderId?: string
  data: any
  timestamp: string
}

interface RealtimeContextType {
  isConnected: boolean
  updates: RealtimeUpdate[]
  sendUpdate: (update: Omit<RealtimeUpdate, 'userId' | 'timestamp'>) => Promise<void>
  clearUpdates: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const lastPollTimeRef = useRef<string>(new Date().toISOString())
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Set up polling interval
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsConnected(false)
      setUpdates([])
      return
    }

    // Poll for updates function (defined inside effect to avoid dependency issues)
    const pollUpdates = async () => {
      try {
        const response = await fetch(`/api/realtime?userId=${user.id}&since=${lastPollTimeRef.current}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.updates && data.updates.length > 0) {
            setUpdates(prev => [...prev, ...data.updates])
            
            // Show toast for important updates and dispatch window events
            data.updates.forEach((update: RealtimeUpdate) => {
              if (update.type === 'order_status') {
                const status = update.data.status
                const isDeliveryStatus = status === 'out_for_delivery' || status === 'delivered'
                
                // Show more prominent toast for delivery statuses
                if (isDeliveryStatus) {
                  toast({
                    title: status === 'out_for_delivery' ? "Out for Delivery! 🛵" : "Order Delivered! 🎉",
                    description: getOrderStatusMessage(status),
                    duration: 6000, // Longer duration for delivery notifications
                  })
                } else {
                  toast({
                    title: "Order Update",
                    description: getOrderStatusMessage(status),
                  })
                }
                
                // Dispatch window event for order status updates
                window.dispatchEvent(new CustomEvent('order-status-updated', {
                  detail: update
                }))
                
                // Additional event for delivery notifications
                if (isDeliveryStatus) {
                  window.dispatchEvent(new CustomEvent('delivery-notification', {
                    detail: {
                      orderId: update.orderId,
                      status: status,
                      notification: {
                        title: status === 'out_for_delivery' ? "Out for Delivery! 🛵" : "Order Delivered! 🎉",
                        message: getOrderStatusMessage(status)
                      }
                    }
                  }))
                }
              } else if (update.type === 'delivery_update') {
                toast({
                  title: "Delivery Update",
                  description: update.data.message,
                })
              } else if (update.type === 'order_deleted') {
                toast({
                  title: "Order Deleted",
                  description: "An order has been removed from your order history",
                  variant: "destructive"
                })
                // Dispatch window event for order deletion
                window.dispatchEvent(new CustomEvent('order-deleted', {
                  detail: update
                }))
              }
            })
          }
          
          lastPollTimeRef.current = data.timestamp
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setIsConnected(false)
      }
    }

    // Initial poll
    pollUpdates()

    // Poll every 5 seconds
    const interval = setInterval(pollUpdates, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, toast]) // Removed pollUpdates and lastPollTime from dependencies

  // Send update
  const sendUpdate = useCallback(async (update: Omit<RealtimeUpdate, 'userId' | 'timestamp'>) => {
    if (!user) return

    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...update,
          userId: user.id
        })
      })
    } catch (error) {
      console.error('Send update error:', error)
    }
  }, [user])

  // Clear updates
  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  const value: RealtimeContextType = {
    isConnected,
    updates,
    sendUpdate,
    clearUpdates
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Helper function to get user-friendly order status messages
function getOrderStatusMessage(status: string): string {
  const messages = {
    'pending': 'Order received and being processed',
    'confirmed': 'Order confirmed by restaurant',
    'preparing': 'Your food is being prepared',
    'ready': 'Order is ready for pickup',
    'out_for_delivery': 'Your order is on the way! Our delivery partner is heading to you',
    'delivered': 'Your order has been delivered successfully. Enjoy your meal!',
    'cancelled': 'Order has been cancelled'
  }
  
  return messages[status as keyof typeof messages] || 'Order status updated'
}
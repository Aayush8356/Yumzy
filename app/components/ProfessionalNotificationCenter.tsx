'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/NotificationContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellRing, 
  X, 
  MoreHorizontal,
  Clock,
  Gift,
  Truck,
  User,
  AlertCircle,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Professional time formatting
function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'now'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`
  
  return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ProfessionalNotificationCenterProps {
  className?: string
}

interface NotificationData {
  foodItem?: {
    image: string;
    name: string;
  };
  discount?: number;
  salePrice?: number;
  originalPrice?: number;
  promoCode?: string;
  // Order notification data
  orderId?: string;
  status?: string;
  previousStatus?: string;
  orderTotal?: string;
  estimatedDeliveryTime?: string;
}

export function ProfessionalNotificationCenter({ className = '' }: ProfessionalNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications, 
    refreshNotifications 
  } = useNotifications()
  const { isAuthenticated } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isAuthenticated) {
    return null
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hot_deal':
        return <Gift className="w-4 h-4 text-orange-500" />
      case 'order':
        return <Truck className="w-4 h-4 text-blue-500" />
      case 'order_update':
        return <BellRing className="w-4 h-4 text-green-500" />
      case 'delivery':
        return <Truck className="w-4 h-4 text-green-500" />
      case 'system':
        return <User className="w-4 h-4 text-gray-500" />
      case 'promo':
        return <Gift className="w-4 h-4 text-purple-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />
    }
  }

  const handleDismissNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${1}`, // Replace with actual user ID
        },
      })

      if (response.ok) {
        refreshNotifications()
      }
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Professional Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-accent/50 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium min-w-5"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Professional Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Clean Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground font-normal whitespace-nowrap">
                    ({unreadCount} new)
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground mb-1">All caught up!</p>
                <p className="text-xs text-muted-foreground">No new notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const data = notification.data as NotificationData;
                  return (
                  <div
                    key={notification.id}
                    className={`p-4 bg-muted/50 cursor-pointer group relative ${
                      !notification.isRead ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-5 ${
                            !notification.isRead ? 'text-foreground' : 'text-foreground/80'
                          }`}>
                            {notification.title}
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={(e) => handleDismissNotification(notification.id, e)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Dismiss
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <p className={`text-xs mt-1 leading-4 ${
                          !notification.isRead ? 'text-muted-foreground' : 'text-foreground/60'
                        }`}>
                          {notification.message}
                        </p>

                        {notification.type === 'hot_deal' && data?.foodItem && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-md">
                            <div className="flex items-center gap-3">
                              <img 
                                src={data.foodItem.image} 
                                alt={data.foodItem.name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {data.foodItem.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-red-500 text-white text-xs">
                                    {data.discount}% OFF
                                  </Badge>
                                  <span className="text-sm font-semibold text-green-600">
                                    ${data.salePrice}
                                  </span>
                                  {data.originalPrice && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ${data.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Update Display */}
                        {notification.type === 'order_update' && data && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  Order #{data.orderId?.slice(0, 8) || 'Unknown'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {data.status?.replace('_', ' ').toUpperCase() || 'UPDATED'}
                                  </span>
                                  {data.orderTotal && (
                                    <span className="text-sm font-semibold text-gray-700">
                                      ₹{data.orderTotal}
                                    </span>
                                  )}
                                </div>
                                {data.estimatedDeliveryTime && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Expected: {new Date(data.estimatedDeliveryTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Promo Code Display */}
                        {notification.type === 'promo' && data?.promoCode && (
                          <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">
                            Code: {data.promoCode}
                          </div>
                        )}

                        {/* Read Status Indicator */}
                        {!notification.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </ScrollArea>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                Clear all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
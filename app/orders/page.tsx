'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Package, Clock, Truck, CheckCircle, ShoppingBag, Calendar, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'

interface Order {
  id: string
  status: string
  total: string
  subtotal: string
  deliveryFee: string
  tax: string
  paymentMethod: string
  paymentStatus: string
  estimatedDeliveryTime: string
  createdAt: string
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      if (!user) return
      
      try {
        // Add timestamp to prevent cache issues
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/orders?userId=${user.id}&_t=${timestamp}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
        const data = await response.json()
        if (data.success) {
          setOrders(data.orders)
        } else {
          toast({
            title: "Error",
            description: "Failed to load orders",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, isAuthenticated, router, toast])

  // Create a separate function that can be called from anywhere
  const refreshOrders = useCallback(async () => {
    if (!user) return
    
    try {
      // Add timestamp to prevent cache issues
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/orders?userId=${user.id}&_t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      const data = await response.json()
      if (data.success) {
        console.log('Orders refreshed from server:', data.orders.map((o: any) => ({ id: o.id.slice(0, 8), status: o.status })))
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to refresh orders:", error)
    }
  }, [user])

  // Listen for real-time order updates and deletions
  useEffect(() => {
    const handleOrderUpdate = () => {
      if (user?.id) {
        console.log('Order update event received, refreshing orders...')
        refreshOrders() // Refresh orders when updates occur
      }
    }

    const handleOrderDeleted = (event: any) => {
      if (user?.id) {
        console.log('Order deletion event received:', event.detail)
        // Immediately remove the order from state if we have the order ID
        if (event.detail?.orderId) {
          setOrders(prevOrders => prevOrders.filter(order => order.id !== event.detail.orderId))
        }
        // Also refresh from server to ensure consistency
        refreshOrders() // Refresh orders when an order is deleted
      }
    }

    // Listen for various order events
    window.addEventListener('order-status-updated', handleOrderUpdate)
    window.addEventListener('order-deleted', handleOrderDeleted)
    window.addEventListener('admin-data-refresh', handleOrderUpdate)
    
    return () => {
      window.removeEventListener('order-status-updated', handleOrderUpdate)
      window.removeEventListener('order-deleted', handleOrderDeleted)
      window.removeEventListener('admin-data-refresh', handleOrderUpdate)
    }
  }, [user?.id, refreshOrders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle
      case 'out_for_delivery': return Truck
      case 'preparing': return Clock
      case 'confirmed': return Package
      case 'pending': return Package
      default: return Package
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Preparing'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Your Orders</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Track your orders and view your order history
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                              Order #{order.id.slice(0, 8)}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <Badge className={`${getStatusColor(order.status)} font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm`}>
                            {getStatusText(order.status)}
                          </Badge>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                            {order.estimatedDeliveryTime}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">Delivery Address</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {order.deliveryAddress.street}<br />
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">Payment</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                            {order.paymentMethod.replace('_', ' ')}
                          </p>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="mt-1 text-xs">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xl sm:text-2xl font-bold text-green-600">
                              ${parseFloat(order.total).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Subtotal: ${parseFloat(order.subtotal).toFixed(2)} + 
                            Delivery: ${parseFloat(order.deliveryFee).toFixed(2)} + 
                            Tax: ${parseFloat(order.tax).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link href={`/track/${order.id}`}>
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm">
                              View Details
                            </Button>
                          </Link>
                          {order.status === 'delivered' && (
                            <Button variant="outline" className="w-full sm:w-auto text-sm">
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start exploring our delicious menu!
              </p>
              <Link href="/menu">
                <Button size="lg">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

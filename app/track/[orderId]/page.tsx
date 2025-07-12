'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  UtensilsCrossed, 
  MapPin, 
  Phone,
  User,
  Timer,
  Navigation,
  Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import WebSocketNotificationManager from '@/lib/websocket-notification-manager'
import Link from 'next/link'

interface OrderDetails {
  id: string
  status: string
  totalAmount: string
  estimatedDeliveryTime: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  createdAt: string
  items: Array<{
    itemName: string
    quantity: number
    price: string
    itemImage: string
  }>
  transactionId?: string
  paymentMethod?: string
}

interface StatusUpdate {
  status: string
  timestamp: string
  message: string
  estimatedTime?: number
  additionalData?: any
}

const statusSteps = [
  { key: 'order_confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: UtensilsCrossed },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: Clock },
  { key: 'driver_assigned', label: 'Driver Assigned', icon: User },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
]

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params?.orderId as string
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  // Real-time notifications and order updates
  useEffect(() => {
    if (!orderId || !isAuthenticated || !user) return

    const notificationManager = WebSocketNotificationManager.getInstance()

    const initializeConnection = async () => {
      try {
        // Connect to real-time notifications
        await notificationManager.connect(user.id)
        setIsConnected(true)

        // Listen for order-specific notifications
        notificationManager.on('order-updates', (notification) => {
          if (notification.orderId === orderId && notification.data) {
            const update = notification.data as StatusUpdate
            setStatusUpdates(prev => [update, ...prev])
            
            // Update current step
            const stepIndex = statusSteps.findIndex(step => step.key === update.status)
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex)
            }

            // Show toast for important updates
            if (['out_for_delivery', 'delivered'].includes(update.status)) {
              toast({
                title: notification.title,
                description: notification.message,
              })
            }

            // Update estimated time
            if (update.estimatedTime) {
              setEstimatedTimeLeft(update.estimatedTime)
            }

            // Refresh order details after status change
            fetchOrderDetails()
          }
        })

        // Listen for connection status changes
        notificationManager.on('connection-status', (status: any) => {
          setIsConnected(status.connected)
        })

      } catch (error) {
        console.error('Failed to initialize real-time connection:', error)
        setIsConnected(false)
      }
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setOrderDetails(data.order)
          
          // Update current step based on status
          const stepIndex = statusSteps.findIndex(step => step.key === data.order.status)
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex)
          }

          // Calculate estimated time left
          if (data.order.estimatedDeliveryTime) {
            const deliveryTime = new Date(data.order.estimatedDeliveryTime)
            const now = new Date()
            const timeLeft = Math.max(0, Math.floor((deliveryTime.getTime() - now.getTime()) / (1000 * 60)))
            setEstimatedTimeLeft(timeLeft)
          }
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error)
        toast({
          title: "Failed to load order details",
          description: "Please try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchOrderDetails()
    
    // Initialize real-time connection
    initializeConnection()

    // Fallback polling every 30 seconds (reduced frequency due to real-time updates)
    const interval = setInterval(fetchOrderDetails, 30000)

    return () => {
      clearInterval(interval)
      notificationManager.off('order-updates')
      notificationManager.off('connection-status')
    }
  }, [orderId, isAuthenticated, user, toast])

  // Countdown timer
  useEffect(() => {
    if (estimatedTimeLeft === null || estimatedTimeLeft <= 0) return

    const timer = setInterval(() => {
      setEstimatedTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [estimatedTimeLeft])

  const getStatusTitle = (status: string): string => {
    const titles = {
      'order_confirmed': 'Order Confirmed! 🎉',
      'preparing': 'Cooking Started! 👨‍🍳',
      'ready_for_pickup': 'Order Ready! 📦',
      'driver_assigned': 'Driver Assigned! 🚗',
      'out_for_delivery': 'On the Way! 🛵',
      'delivered': 'Delivered! 🎉'
    }
    return titles[status as keyof typeof titles] || 'Order Update'
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      'order_confirmed': 'bg-blue-500',
      'preparing': 'bg-orange-500',
      'ready_for_pickup': 'bg-yellow-500',
      'driver_assigned': 'bg-purple-500',
      'out_for_delivery': 'bg-green-500',
      'delivered': 'bg-green-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to track your order.</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercentage = ((currentStep + 1) / statusSteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
          </div>
          <p className="text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
          {isConnected && (
            <p className="text-xs text-green-600 mt-1">🔗 Real-time updates enabled</p>
          )}
        </div>

        {/* Estimated Time Remaining */}
        {estimatedTimeLeft !== null && estimatedTimeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Estimated Time Remaining</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {estimatedTimeLeft} minutes
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Progress value={progressPercentage} className="h-2" />
                  
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isCompleted = index <= currentStep
                      const isCurrent = index === currentStep
                      
                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                            isCurrent ? 'bg-primary/10 border border-primary/20' : 
                            isCompleted ? 'bg-green-50' : 'bg-muted/30'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-muted-foreground">In progress...</p>
                            )}
                          </div>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            {orderDetails.status === 'out_for_delivery' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Delivery Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Raj Kumar</p>
                        <p className="text-sm text-muted-foreground">Delivery Partner</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{orderDetails.totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{orderDetails.customerName}</p>
                  <p className="text-sm text-muted-foreground">{orderDetails.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{orderDetails.deliveryAddress}</p>
                </div>
                {orderDetails.paymentMethod && (
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <Badge variant="outline" className="mt-1">
                      {orderDetails.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rate Order (if delivered) */}
            {orderDetails.status === 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Rate Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    How was your food and delivery experience?
                  </p>
                  <Button className="w-full">
                    Rate Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
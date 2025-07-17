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
  Star,
  ArrowLeft,
  Package,
  CreditCard
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import WebSocketNotificationManager from '@/lib/websocket-notification-manager'
import Link from 'next/link'

interface OrderDetails {
  id: string
  status: string
  total: string
  estimatedDeliveryTime: string
  customerName: string
  customerPhone: string
  deliveryAddress: string | {
    street: string
    city: string
    state: string
    zipCode: string
    instructions?: string
  }
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
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: UtensilsCrossed },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
]

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params?.id as string
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

    // Listen for order status updates
    const handleOrderStatusUpdate = (event: any) => {
      const data = event.detail
      if (data && data.orderId === orderId) {
        console.log('Order status updated:', data)
        
        // Update current step
        const stepIndex = statusSteps.findIndex(step => step.key === data.status)
        if (stepIndex !== -1) {
          setCurrentStep(stepIndex)
        }

        // Show toast notification for all status updates
        const statusTitles = {
          'confirmed': 'Order Confirmed! 🎉',
          'preparing': 'Kitchen Started Cooking! 👨‍🍳',
          'out_for_delivery': 'Out for Delivery! 🛵',
          'delivered': 'Order Delivered! 🎉'
        }
        
        const statusTitle = statusTitles[data.status as keyof typeof statusTitles] || 'Order Status Updated'
        
        toast({
          title: statusTitle,
          description: data.message || `Your order status has been updated to: ${data.status.replace('_', ' ')}`,
          duration: 5000, // Show for 5 seconds
        })

        // Refresh order details after status change
        fetchOrderDetails()
      }
    }

    // Add event listener for order status updates
    window.addEventListener('order-status-updated', handleOrderStatusUpdate)

    // Function to check and update order status
    const checkOrderStatus = async () => {
      try {
        // Store current status before checking for updates
        const currentStatus = orderDetails?.status
        
        const response = await fetch('/api/orders/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId })
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.updated) {
            console.log('Order status updated automatically')
            
            // Refresh order details to get updated status
            await fetchOrderDetails()
            
            // Get the updated order details to compare status
            setTimeout(async () => {
              try {
                const token = localStorage.getItem('authToken')
                const orderResponse = await fetch(`/api/orders/${orderId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json()
                  const newStatus = orderData.order?.status
                  
                  if (newStatus && newStatus !== currentStatus) {
                    // Show notification for status change
                    const statusTitles = {
                      'confirmed': 'Order Confirmed! 🎉',
                      'preparing': 'Kitchen Started Cooking! 👨‍🍳',
                      'out_for_delivery': 'Out for Delivery! 🛵',
                      'delivered': 'Order Delivered! 🎉'
                    }
                    
                    const statusMessages = {
                      'confirmed': 'Your order has been confirmed and is being prepared',
                      'preparing': 'Our kitchen is preparing your delicious meal',
                      'out_for_delivery': 'Your order is on the way! Our delivery partner is heading to you',
                      'delivered': 'Your order has been delivered successfully. Enjoy your meal!'
                    }
                    
                    const statusTitle = statusTitles[newStatus as keyof typeof statusTitles] || 'Order Status Updated'
                    const statusMessage = statusMessages[newStatus as keyof typeof statusMessages] || `Your order status has been updated to: ${newStatus.replace('_', ' ')}`
                    
                    toast({
                      title: statusTitle,
                      description: statusMessage,
                      duration: 6000, // Show for 6 seconds
                    })
                    
                    console.log(`🔔 Status changed from ${currentStatus} to ${newStatus}`)
                  }
                }
              } catch (error) {
                console.error('Error fetching updated order status:', error)
              }
            }, 500) // Small delay to ensure data is updated
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error)
      }
    }

    const fetchOrderDetails = async () => {
      try {
        // Get fresh JWT token 
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('No authentication token')
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401) {
          toast({
            title: "Authentication failed",
            description: "Please sign in again.",
            variant: "destructive"
          })
          return
        }

        if (response.status === 403 || response.status === 404) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this order.",
            variant: "destructive"
          })
          setOrderDetails(null)
          return
        }

        if (response.ok) {
          const data = await response.json()
          
          // Transform the order data to match expected interface
          const transformedOrder = {
            ...data.order,
            items: data.order.orderItems?.map((item: any) => ({
              itemName: item.foodItem?.name || 'Unknown Item',
              quantity: item.quantity,
              price: item.price,
              itemImage: item.foodItem?.image || '/placeholder-food.jpg'
            })) || []
          }
          
          
          setOrderDetails(transformedOrder)
          
          // Update current step based on status
          const stepIndex = statusSteps.findIndex(step => step.key === data.order.status)
          
          
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex)
          } else {
            // Handle unknown status by defaulting to first step
            console.warn('Unknown order status:', data.order.status, 'Available:', statusSteps.map(s => s.key))
            setCurrentStep(0)
          }

          // Calculate estimated time left
          if (data.order.estimatedDeliveryTime) {
            const deliveryTime = new Date(data.order.estimatedDeliveryTime)
            const now = new Date()
            const timeLeft = Math.max(0, Math.floor((deliveryTime.getTime() - now.getTime()) / (1000 * 60)))
            
            console.log('Order tracking time calculation:', {
              estimatedDeliveryTime: data.order.estimatedDeliveryTime,
              deliveryTime: deliveryTime.toLocaleString(),
              currentTime: now.toLocaleString(),
              timeLeftMinutes: timeLeft,
              timeLeftHours: Math.floor(timeLeft / 60)
            })
            
            // Validate time is reasonable (less than 24 hours)
            if (timeLeft > 24 * 60) {
              console.warn('Estimated time seems too long:', timeLeft, 'minutes')
              setEstimatedTimeLeft(60) // Default to 1 hour if calculation seems wrong
            } else {
              setEstimatedTimeLeft(timeLeft)
            }
          } else {
            // If no estimated delivery time, calculate a reasonable default
            const defaultTime = 45; // 45 minutes default
            console.log('No estimated delivery time found, using default:', defaultTime, 'minutes')
            setEstimatedTimeLeft(defaultTime)
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

    // Check order status immediately and then every 10 seconds
    checkOrderStatus()
    const statusInterval = setInterval(checkOrderStatus, 10000)

    // Fallback polling every 30 seconds for order details
    const detailsInterval = setInterval(fetchOrderDetails, 30000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(detailsInterval)
      window.removeEventListener('order-status-updated', handleOrderStatusUpdate)
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
      'pending': 'Order Placed! 📋',
      'confirmed': 'Order Confirmed! 🎉',
      'preparing': 'Cooking Started! 👨‍🍳',
      'out_for_delivery': 'Out for Delivery! 🛵',
      'delivered': 'Delivered! 🎉'
    }
    return titles[status as keyof typeof titles] || 'Order Update'
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      'pending': 'bg-blue-500',
      'confirmed': 'bg-blue-600',
      'preparing': 'bg-orange-500',
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
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>

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
              {estimatedTimeLeft > 60 
                ? `${Math.floor(estimatedTimeLeft / 60)}h ${estimatedTimeLeft % 60}m`
                : `${estimatedTimeLeft} minutes`
              }
            </div>
            <div className="text-sm text-primary/70 mt-2">
              Expected delivery: {orderDetails.estimatedDeliveryTime ? 
                new Date(orderDetails.estimatedDeliveryTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Calculating...'
              }
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Order Progress</h3>
                    <p className="text-sm text-muted-foreground">Current status: {getStatusTitle(orderDetails.status)}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                  
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isCompleted = index < currentStep
                      const isCurrent = index === currentStep
                      const isPending = index > currentStep
                      
                      // Special case: if this is the last step (delivered) and it's current, it's completed
                      const isDeliveredAndCurrent = isCurrent && step.key === 'delivered'
                      
                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors border ${
                            isCurrent && !isDeliveredAndCurrent
                              ? 'bg-primary/10 border-primary/30 shadow-sm' 
                              : isCompleted || isDeliveredAndCurrent
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`p-3 rounded-full transition-all ${
                            isCompleted || isDeliveredAndCurrent
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                              ? 'bg-primary text-white animate-pulse' 
                              : 'bg-gray-300 text-gray-500'
                          }`}>
                            {isCompleted || isDeliveredAndCurrent ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${
                              isCurrent && !isDeliveredAndCurrent
                                ? 'text-primary' 
                                : isCompleted || isDeliveredAndCurrent
                                ? 'text-green-700' 
                                : 'text-gray-500'
                            }`}>
                              {step.label}
                            </p>
                            {isCurrent && !isCompleted && !isDeliveredAndCurrent && (
                              <p className="text-xs text-primary/70 mt-1">In progress...</p>
                            )}
                            {(isCompleted || isDeliveredAndCurrent) && (
                              <p className="text-xs text-green-600 mt-1">Completed</p>
                            )}
                            {isPending && (
                              <p className="text-xs text-gray-400 mt-1">Pending</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            {(isCompleted || isDeliveredAndCurrent) && (
                              <div className="text-green-500">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            )}
                            {isCurrent && !isDeliveredAndCurrent && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            )}
                            {isPending && (
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            )}
                          </div>
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
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderDetails.items?.length > 0 ? orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                      <img
                        src={item.itemImage || '/placeholder-food.jpg'}
                        alt={item.itemName || 'Food Item'}
                        className="w-14 h-14 rounded-lg object-cover border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-food.jpg'
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{item.itemName || 'Unknown Item'}</p>
                        <p className="text-xs text-gray-600">Quantity: {item.quantity || 1}</p>
                      </div>
                      <p className="font-semibold text-primary">₹{item.price || '0.00'}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">No items found</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">₹{orderDetails.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <p className="font-medium text-gray-900">{orderDetails.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <p className="text-sm text-gray-700">{orderDetails.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                    {typeof orderDetails.deliveryAddress === 'object' 
                      ? `${orderDetails.deliveryAddress.street}, ${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state} ${orderDetails.deliveryAddress.zipCode}`
                      : orderDetails.deliveryAddress || 'Address not available'
                    }
                  </p>
                </div>
                {orderDetails.paymentMethod && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Method
                    </p>
                    <Badge variant="outline" className="mt-1 text-gray-700 border-gray-300">
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
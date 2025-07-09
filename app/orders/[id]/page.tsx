'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Package, Truck, Check, Clock, MapPin, Phone, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { OrderTracker } from '@/components/OrderTracker'

interface OrderItem {
  id: string
  foodItem: {
    name: string
    image: string
  }
  quantity: number
  price: string
  specialInstructions?: string
}

interface Order {
  id: string
  status: string
  total: string
  subtotal: string
  tax: string
  deliveryFee: string
  paymentMethod: string
  paymentStatus: string
  estimatedDeliveryTime: string
  createdAt: string
  orderItems: OrderItem[]
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    instructions?: string
  }
  trackingInfo: {
    status: string
    estimatedArrival: string
    lastUpdate: string
  }
}

export default function OrderDetailsPage() {
  const params = useParams()
  const { id } = params
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) return
    
    if (id) {
      const fetchOrderDetails = async () => {
        try {
          const response = await fetch(`/api/orders/${id}`)
          const data = await response.json()
          if (data.success) {
            setOrder(data.order)
          } else {
            toast({
              title: "Order not found",
              description: "This order could not be found or you don't have permission to view it.",
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error("Failed to fetch order details:", error)
          toast({
            title: "Error",
            description: "Failed to load order details. Please try again.",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      fetchOrderDetails()
    }
  }, [id, isAuthenticated, toast])

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

  const getTrackingSteps = (currentStatus: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'confirmed', label: 'Confirmed', icon: Check },
      { key: 'preparing', label: 'Preparing', icon: Clock },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: Check },
    ]

    const currentIndex = steps.findIndex(step => step.key === currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const trackingSteps = getTrackingSteps(order.status)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold mt-2">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Order Tracking */}
            <OrderTracker orderId={order.id} initialStatus={order.status} />

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img 
                        src={item.foodItem.image} 
                        alt={item.foodItem.name} 
                        className="w-16 h-16 object-cover rounded-md" 
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.foodItem.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        {item.specialInstructions && (
                          <p className="text-sm text-muted-foreground">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-muted-foreground">
                      Instructions: {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${parseFloat(order.deliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold">Payment Method</h4>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Need help with your order?
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

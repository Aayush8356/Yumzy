'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  MapPin, 
  Clock, 
  Truck, 
  ArrowLeft,
  Shield,
  CheckCircle,
  User,
  Phone,
  Mail,
  Home,
  Smartphone,
  Building,
  Wallet,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, clearCart, refreshCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  })
  
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (!cart || cart.items.length === 0) {
      router.push('/menu')
      return
    }

    // Listen for payment progress updates
    const handlePaymentProgress = (event: CustomEvent) => {
      setPaymentProgress(event.detail.progress)
    }

    window.addEventListener('payment-progress', handlePaymentProgress as EventListener)
    
    return () => {
      window.removeEventListener('payment-progress', handlePaymentProgress as EventListener)
    }
  }, [isAuthenticated, cart, router])

  const handleProceedToPayment = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all delivery address fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setPaymentProgress(0)

    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in again.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      if (!cart || cart.items.length === 0) {
        toast({
          title: "Cart Error",
          description: "Cart is empty. Please add items to your cart.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Generate unique order ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()

      // Prepare complete address
      const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`

      // Process payment using dummy payment system
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          paymentMethod: paymentMethod,
          amount: cart.summary.total,
          customerDetails: {
            name: user.name || 'Customer',
            email: user.email || '',
            phone: user.phone || '',
            address: fullAddress
          },
          cartItems: cart.items.map(item => ({
            foodItemId: item.foodItem.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Payment Successful! 🎉",
          description: "Your order has been placed successfully",
        })
        
        // Clear cart after successful order
        const cartCleared = await clearCart()
        
        if (cartCleared) {
          console.log('Cart cleared successfully after order placement')
          // Force refresh cart to ensure UI is updated
          await refreshCart()
          
          // Trigger custom event to close any open cart modals
          window.dispatchEvent(new CustomEvent('cart-cleared'))
        } else {
          console.warn('Failed to clear cart after order placement')
          // Try to refresh cart anyway
          await refreshCart()
        }
        
        // Small delay to ensure cart state is updated before redirect
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${data.order.id}`)
        }, 800)
      } else {
        throw new Error(data.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setPaymentProgress(0)
    }
  }

  if (!isAuthenticated || !cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Cart</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Complete your order</p>
          </div>
        </div>

        {/* Payment Progress (shown during processing) */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Processing Payment...</h3>
                  <p className="text-sm text-muted-foreground">Please wait while we process your payment</p>
                </div>
                <Progress value={paymentProgress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {paymentProgress}% complete
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="Enter your street address"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="ZIP Code"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Add any special delivery instructions..."
                      value={deliveryAddress.instructions}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLoading}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="font-medium">Credit/Debit Card</Label>
                        <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="upi" id="upi" />
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor="upi" className="font-medium">UPI</Label>
                        <p className="text-sm text-muted-foreground">Pay using UPI (No extra charges)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor="netbanking" className="font-medium">Net Banking</Label>
                        <p className="text-sm text-muted-foreground">Pay directly from your bank</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor="wallet" className="font-medium">Digital Wallet</Label>
                        <p className="text-sm text-muted-foreground">Pay using digital wallets</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.foodItem.image}
                        alt={item.foodItem.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.foodItem.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-muted-foreground">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <p className="font-medium">₹{(parseFloat(item.foodItem.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{cart.summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹{cart.summary.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{cart.summary.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{cart.summary.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">35-50 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-primary">Secure Payment</p>
                    <p className="text-sm text-muted-foreground">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={isLoading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{cart.summary.total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
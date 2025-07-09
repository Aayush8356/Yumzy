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
  Home
} from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Initialize Razorpay
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
if (!razorpayKeyId) {
  console.warn('NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured - using development mode');
}

export default function CheckoutPage() {
  const { cart } = useCart()
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
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [isLoading, setIsLoading] = useState(false)

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      // Clear the cart after successful payment
      await fetch('/api/cart', { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      });
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully",
      });
      
      // Redirect to success page
      router.push(`/checkout/success?payment_id=${paymentResponse.razorpay_payment_id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast({
        title: "Payment processed but error occurred",
        description: "Please contact support if needed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
    
    if (!cart || cart.items.length === 0) {
      router.push('/menu')
    }
  }, [isAuthenticated, cart, router])

  const handleProceedToPayment = async () => {
    console.log("handleProceedToPayment called");
    console.log("Delivery Address:", deliveryAddress);

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      console.log("Validation failed: Missing address information.");
      toast({
        title: "Missing Information",
        description: "Please fill in all delivery address fields (street, city, state, zip code)",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true);

    // Development mode - bypass Razorpay if not configured
    if (!razorpayKeyId) {
      console.log("Razorpay not configured, using development mode");
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken || !user) {
          toast({
            title: "Authentication required",
            description: "Please log in again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!cart) {
          toast({
            title: "Cart Error",
            description: "Cart is empty. Please add items to your cart.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log("Creating development order with data:", {
          items: cart.items,
          deliveryAddress: deliveryAddress,
          paymentMethod: 'dev_mock',
          total: cart.summary.total,
          subtotal: cart.summary.subtotal,
          tax: cart.summary.tax,
          deliveryFee: cart.summary.deliveryFee,
        });

        // Create a mock order for development
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`,
          },
          body: JSON.stringify({
            items: cart.items,
            deliveryAddress: deliveryAddress,
            paymentMethod: 'dev_mock',
            total: cart.summary.total,
            subtotal: cart.summary.subtotal,
            tax: cart.summary.tax,
            deliveryFee: cart.summary.deliveryFee,
            specialInstructions: deliveryAddress.instructions || ''
          })
        });

        console.log("Development order API response:", response.status, response.statusText);

        const data = await response.json();
        console.log("Development order API data:", data);

        if (response.ok && data.success) {
          toast({
            title: "Order Created Successfully!",
            description: "Your order has been placed successfully",
          });
          
          // Clear the cart after successful order
          try {
            await fetch('/api/cart', { 
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${user.id}`
              }
            });
          } catch (clearError) {
            console.error('Failed to clear cart:', clearError);
          }
          
          router.push(`/orders/${data.orderId}`);
        } else {
          throw new Error(data.error || 'Failed to create order');
        }
      } catch (error) {
        console.error('Development order creation error:', error);
        toast({
          title: "Order Error",
          description: error instanceof Error ? error.message : "Failed to create order",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast({
          title: "Authentication required",
          description: "Please log in again.",
          variant: "destructive"
        });
        return;
      }

      if (!cart) {
        toast({
          title: "Cart Error",
          description: "Cart is empty. Please add items to your cart.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            items: cart.items,
            deliveryFee: cart.summary.deliveryFee,
            tax: cart.summary.tax,
            deliveryAddress: deliveryAddress,
        })
      });
      console.log("API response received:", response);

      const data = await response.json();
      console.log("API data parsed:", data);

      if (response.ok && data.success) {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'Yumzy',
            description: 'Food Order Payment',
            order_id: data.orderId,
            handler: function (response: any) {
              console.log('Payment successful:', response);
              // Handle successful payment
              handlePaymentSuccess(response);
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || ''
            },
            theme: {
              color: '#3399cc'
            },
            modal: {
              ondismiss: function() {
                console.log('Payment cancelled');
                setIsLoading(false);
              }
            }
          };
          
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.head.appendChild(script);
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to proceed to payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl"
        >
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/menu">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Browse Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/cart" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Cart</span>
            </Link>
            <div className="h-4 w-px bg-orange-200" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="ml-auto flex items-center gap-2 text-green-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Delivery Address</h3>
                      <p className="text-orange-100 text-sm">Where should we deliver your order?</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                        <Home className="w-4 h-4" />
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="123 Main Street, Building Name"
                        className="h-12 border-2 border-orange-100 focus:border-orange-300 rounded-xl bg-white/80"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Mumbai"
                          className="h-12 border-2 border-orange-100 focus:border-orange-300 rounded-xl bg-white/80"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                          State
                        </Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Maharashtra"
                          className="h-12 border-2 border-orange-100 focus:border-orange-300 rounded-xl bg-white/80"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                        ZIP / Postal Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="400001"
                        className="h-12 border-2 border-orange-100 focus:border-orange-300 rounded-xl bg-white/80"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instructions" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                        Delivery Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        value={deliveryAddress.instructions}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Leave at door, Ring doorbell, Apartment number, etc."
                        rows={3}
                        className="border-2 border-orange-100 focus:border-orange-300 rounded-xl bg-white/80 resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Payment Method</h3>
                      <p className="text-blue-100 text-sm">Secure payment powered by Razorpay</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Razorpay Secure Payment</p>
                        <p className="text-sm text-gray-600">Credit Card, Debit Card, UPI, Net Banking & Wallets</p>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    🔒 Your payment information is encrypted and secure. We don't store your card details.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delivery Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Estimated Delivery Time</h3>
                      <p className="text-green-100 text-sm">Fast & reliable delivery</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                    <div className="p-3 bg-green-500 rounded-full">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-green-700">25-35 min</p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Express
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Standard delivery to your location</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
                  <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                  <p className="text-orange-100 text-sm">Review your delicious order</p>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Cart Items */}
                  <div className="p-6 space-y-4">
                    {cart.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                      >
                        <img 
                          src={item.foodItem.image} 
                          alt={item.foodItem.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.foodItem.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-orange-600 mt-1">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <p className="font-bold text-orange-600">₹{(parseFloat(item.foodItem.price) * item.quantity).toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>

                  <Separator className="bg-gradient-to-r from-orange-200 to-red-200" />

                  {/* Pricing Breakdown */}
                  <div className="p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{cart.summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">₹{cart.summary.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">₹{cart.summary.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-gradient-to-r from-orange-200 to-red-200" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹{cart.summary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!razorpayKeyId && (
                    <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                      <div className="flex items-center gap-2 text-orange-700">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Development Mode</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Razorpay is not configured. Orders will be created with mock payment.
                      </p>
                    </div>
                  )}

                  <div className="p-6">
                    <Button 
                      onClick={handleProceedToPayment}
                      disabled={isLoading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          {!razorpayKeyId ? 
                            `Create Order (Dev) - ₹${cart.summary.total.toFixed(2)}` : 
                            `Secure Payment - ₹${cart.summary.total.toFixed(2)}`
                          }
                        </div>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                      🔒 By placing this order, you agree to our terms of service and privacy policy. 
                      Your payment is processed securely through Razorpay.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, foodItemsTable, usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import PaymentSimulator from '@/lib/payment-simulator'
import { OrderStatusManager } from '@/lib/order-status-manager'
import { ErrorHandler } from '@/lib/error-handler'
import { emailService } from '@/lib/email'

export const dynamic = 'force-dynamic'

interface ProcessPaymentRequest {
  orderId: string
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet'
  amount: number
  customerDetails: {
    name: string
    email: string
    phone: string
    address: string
  }
  cartItems: Array<{
    foodItemId: string
    quantity: number
    specialInstructions?: string
  }>
}

export async function POST(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json() as ProcessPaymentRequest
    
    // Validate request
    if (!body.orderId || !body.paymentMethod || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get authorization
    const authHeader = request.headers.get('Authorization')
    const userId = authHeader?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // Fetch cart items with full details
      const cartItemsWithDetails = await Promise.all(
        body.cartItems.map(async (item) => {
          const [foodItem] = await db
            .select()
            .from(foodItemsTable)
            .where(eq(foodItemsTable.id, item.foodItemId))
            .limit(1)
          
          if (!foodItem) {
            throw new Error(`Food item ${item.foodItemId} not found`)
          }

          return {
            ...item,
            name: foodItem.name,
            price: parseFloat(foodItem.price),
            cookTime: foodItem.cookTime,
            difficulty: foodItem.difficulty,
            image: foodItem.image
          }
        })
      )

      // Initialize payment simulator
      const paymentSimulator = PaymentSimulator.getInstance()
      
      // Process payment (dummy)
      const paymentResult = await paymentSimulator.processPayment({
        orderId: body.orderId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        customerDetails: body.customerDetails
      })

      if (!paymentResult.success) {
        return NextResponse.json({
          success: false,
          error: paymentResult.error || 'Payment failed',
          transactionId: paymentResult.transactionId
        }, { status: 400 })
      }

      // Calculate payment method fee
      const paymentFee = paymentSimulator.getPaymentMethodFee(body.paymentMethod, body.amount)
      const totalAmount = body.amount + paymentFee

      // Calculate delivery time using OrderStatusManager
      const orderCreationTime = new Date();
      const estimatedDeliveryTime = OrderStatusManager.getEstimatedDeliveryTime(orderCreationTime)
      
      // Create order in database
      const [newOrder] = await db.insert(ordersTable).values({
        userId: userId,
        status: 'confirmed',
        total: totalAmount.toString(),
        subtotal: body.amount.toString(),
        tax: '0',
        deliveryFee: '0',
        paymentMethod: body.paymentMethod,
        paymentStatus: 'paid',
        customerName: body.customerDetails.name,
        customerEmail: body.customerDetails.email,
        customerPhone: body.customerDetails.phone,
        deliveryAddress: {
          street: body.customerDetails.address.split(',')[0] || '',
          city: body.customerDetails.address.split(',')[1]?.trim() || '',
          state: body.customerDetails.address.split(',')[2]?.trim() || '',
          zipCode: body.customerDetails.address.split(',')[3]?.trim() || '',
          instructions: ''
        },
        estimatedDeliveryTime: estimatedDeliveryTime.toISOString(),
        notes: `Transaction ID: ${paymentResult.transactionId}`,
      }).returning()

      // Create order items
      const orderItemsData = cartItemsWithDetails.map(item => ({
        orderId: newOrder.id,
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: item.price.toString(),
        specialInstructions: item.specialInstructions || '',
        itemName: item.name,
        itemImage: item.image
      }))

      await db.insert(orderItemsTable).values(orderItemsData)

      // Send order confirmation email to verified users
      try {
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userId))
        
        if (user && user.email && user.isVerified) {
          const orderItems = cartItemsWithDetails.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: `₹${item.price.toFixed(1)}`
          }))
          
          await emailService.sendOrderConfirmation(user.email, user.name, {
            orderId: newOrder.id,
            items: orderItems,
            total: `₹${totalAmount.toFixed(1)}`,
            estimatedDelivery: estimatedDeliveryTime.toLocaleString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            }),
            address: body.customerDetails.address
          })
          console.log(`📧 Order confirmation email sent to ${user.email}`)
        } else {
          console.log(`📧 Skipping order confirmation email: user email not verified or not found`)
        }
      } catch (emailError) {
        console.error(`Error sending order confirmation email:`, emailError)
      }

      // Send initial order confirmation notification
      setTimeout(async () => {
        await OrderStatusManager.notifyStatusChange(newOrder.id, 'confirmed')
      }, 1000) // Start after 1 second delay

      // Cart clearing will be handled on the frontend after successful payment
      console.log('🛒 Cart should be cleared for user:', userId)

      return NextResponse.json({
        success: true,
        order: {
          id: newOrder.id,
          status: newOrder.status,
          totalAmount: newOrder.total,
          estimatedDeliveryTime: newOrder.estimatedDeliveryTime,
          transactionId: paymentResult.transactionId,
          paymentMethod: body.paymentMethod,
          customerDetails: body.customerDetails
        },
        payment: {
          transactionId: paymentResult.transactionId,
          amount: totalAmount,
          paymentMethod: body.paymentMethod,
          processingTime: paymentResult.processingTime,
          fee: paymentFee
        },
        message: 'Payment successful! Your order is being prepared.'
      })

    } catch (error) {
      console.error('Payment processing error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process payment. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  })
}

function getNotificationTitle(status: string): string {
  const titles = {
    'order_confirmed': 'Order Confirmed! 🎉',
    'preparing': 'Order is Being Prepared 👨‍🍳',
    'ready_for_pickup': 'Order Ready for Pickup! 📦',
    'driver_assigned': 'Driver Assigned 🚗',
    'out_for_delivery': 'On the Way! 🛵',
    'delivered': 'Order Delivered! 🎉'
  }
  
  return titles[status as keyof typeof titles] || 'Order Update'
}
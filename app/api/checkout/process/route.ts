import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, foodItems, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import PaymentSimulator from '@/lib/payment-simulator'
import OrderSimulator from '@/lib/order-simulator'
import { ErrorHandler } from '@/lib/error-handler'

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
            .from(foodItems)
            .where(eq(foodItems.id, item.foodItemId))
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

      // Create order in database
      const [newOrder] = await db.insert(orders).values({
        userId: userId,
        status: 'payment_confirmed',
        total: totalAmount.toString(),
        subtotal: body.amount.toString(),
        tax: '0',
        deliveryFee: '0',
        paymentMethod: body.paymentMethod,
        paymentStatus: 'completed',
        deliveryAddress: {
          street: body.customerDetails.address.split(',')[0] || '',
          city: body.customerDetails.address.split(',')[1]?.trim() || '',
          state: body.customerDetails.address.split(',')[2]?.trim() || '',
          zipCode: body.customerDetails.address.split(',')[3]?.trim() || '',
          instructions: ''
        },
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
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

      await db.insert(orderItems).values(orderItemsData)

      // Start order simulation process
      const orderSimulator = OrderSimulator.getInstance()
      
      // Create order simulation config
      const simulationConfig = {
        orderId: newOrder.id,
        items: cartItemsWithDetails.map(item => ({
          id: item.foodItemId,
          name: item.name,
          cookTime: item.cookTime,
          difficulty: item.difficulty,
          quantity: item.quantity
        })),
        totalAmount: totalAmount,
        customerDetails: {
          name: body.customerDetails.name,
          address: body.customerDetails.address,
          phone: body.customerDetails.phone
        }
      }

      // Start order simulation with real-time updates
      orderSimulator.startOrderSimulation(simulationConfig, async (statusUpdate) => {
        try {
          // Update order status in database
          await db
            .update(orders)
            .set({
              status: statusUpdate.status,
              estimatedDeliveryTime: statusUpdate.estimatedTime 
                ? new Date(Date.now() + statusUpdate.estimatedTime * 60 * 1000).toISOString()
                : undefined,
              updatedAt: new Date()
            })
            .where(eq(orders.id, newOrder.id))

          // Send real-time notification using SSE
          const { broadcastToUser } = await import('@/lib/sse-broadcaster')
          broadcastToUser(userId, {
            id: `order-${body.orderId}-${statusUpdate.status}`,
            type: 'order_status',
            userId: userId,
            orderId: newOrder.id,
            title: getNotificationTitle(statusUpdate.status),
            message: statusUpdate.message,
            data: statusUpdate,
            timestamp: new Date().toISOString(),
            priority: ['payment_confirmed', 'out_for_delivery', 'delivered'].includes(statusUpdate.status) ? 'high' : 'medium'
          })

          // Log notification creation (removed fetch to avoid server-side fetch issues)
          console.log('📧 Notification created:', {
            userId: userId,
            type: statusUpdate.status.includes('delivery') ? 'delivery' : 'order',
            title: getNotificationTitle(statusUpdate.status),
            message: statusUpdate.message,
            orderId: newOrder.id,
            status: statusUpdate.status
          })

        } catch (error) {
          console.error('Failed to update order status:', error)
        }
      })

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
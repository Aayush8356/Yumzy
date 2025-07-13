import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import crypto from 'crypto'

// For demo/simulation purposes - graceful fallback for missing Razorpay keys
const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_SECRET && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

const razorpay = isRazorpayConfigured ? new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
}) : null;

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('x-razorpay-signature')

  // Verify webhook signature if webhook secret is configured
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (err) {
    console.error('❌ Invalid JSON payload')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity

    try {
      if (!isRazorpayConfigured || !razorpay) {
        // Demo mode - just acknowledge the webhook
        console.log('🎭 DEMO MODE: Webhook received but Razorpay not configured, skipping order processing');
        return NextResponse.json({ received: true, demoMode: true })
      }

      // Get order details from Razorpay
      const razorpayOrder = await razorpay.orders.fetch(payment.order_id)
      
      const { userId, deliveryAddress, specialInstructions, items, deliveryFee, tax } = razorpayOrder.notes!
      
      const orderData = {
        userId: String(userId),
        deliveryAddress: JSON.parse(String(deliveryAddress || '{}')),
        paymentMethod: 'razorpay',
        status: 'paid',
        total: (payment.amount / 100).toString(),
        subtotal: ((payment.amount - parseFloat(String(deliveryFee || '0')) * 100 - parseFloat(String(tax || '0')) * 100) / 100).toString(),
        tax: String(tax || '0'),
        deliveryFee: String(deliveryFee || '0'),
      }
      
      const newOrder = await db.insert(orders).values(orderData).returning();
      
      const parsedItems = JSON.parse(String(items || '[]'))
      const parsedSpecialInstructions = specialInstructions ? JSON.parse(String(specialInstructions)) : {}
      
      const orderItemsData = parsedItems.map((item: any) => ({
        orderId: newOrder[0].id,
        foodItemId: item.id,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: parsedSpecialInstructions[item.id] || undefined
      }))

      if (orderItemsData.length > 0) {
        await db.insert(orderItems).values(orderItemsData);
      }

    } catch (error) {
      console.error('Error processing successful payment:', error)
      return NextResponse.json({ error: 'Error processing payment' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

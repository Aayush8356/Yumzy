import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { z } from 'zod'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TokenManager } from '@/lib/auth'

// For demo/simulation purposes - graceful fallback for missing Razorpay keys
const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_SECRET && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

const razorpay = isRazorpayConfigured ? new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
}) : null;

const checkoutSessionSchema = z.object({
  items: z.array(
    z.object({
      foodItem: z.object({
        id: z.string(),
        name: z.string(),
        price: z.string(),
      }),
      quantity: z.number().min(1),
      specialInstructions: z.string().optional(),
    })
  ),
  deliveryFee: z.number(),
  tax: z.number(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    instructions: z.string().optional(),
  }),
})

async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    if (!authToken) {
      return null;
    }

    // Try to decode JWT token to get user ID
    let userId: string;
    try {
      const decoded = TokenManager.verify(authToken);
      userId = decoded.userId;
    } catch (tokenError) {
      // Fallback: try using token as user ID directly (for backward compatibility)
      userId = authToken;
    }
    
    // Verify user exists in database
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user ? userId : null;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsedBody = checkoutSessionSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: parsedBody.error.format() },
        { status: 400 }
      )
    }

    const { items, deliveryFee, tax, deliveryAddress } = parsedBody.data

    const specialInstructions = items.reduce((acc, item) => {
        if (item.specialInstructions) {
            acc[item.foodItem.id] = item.specialInstructions
        }
        return acc
    }, {} as Record<string, string>)

    // Calculate total amount in paisa (INR * 100)
    const subtotal = items.reduce((total, item) => {
      return total + (parseFloat(item.foodItem.price) * item.quantity)
    }, 0)
    
    const totalAmount = Math.round((subtotal + deliveryFee + tax) * 100)

    // Create Razorpay order or simulate for demo
    if (isRazorpayConfigured && razorpay) {
      // Real Razorpay integration
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          userId,
          deliveryAddress: JSON.stringify(deliveryAddress),
          specialInstructions: JSON.stringify(specialInstructions),
          items: JSON.stringify(items.map(item => ({
            id: item.foodItem.id,
            name: item.foodItem.name,
            price: item.foodItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          }))),
          deliveryFee: deliveryFee.toString(),
          tax: tax.toString(),
        },
      })

      return NextResponse.json({ 
        success: true, 
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      })
    } else {
      // Demo/simulation mode - generate mock order
      const mockOrderId = `demo_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🎭 DEMO MODE: Simulated payment order created:', {
        orderId: mockOrderId,
        amount: totalAmount,
        items: items.length,
        userId
      });

      return NextResponse.json({ 
        success: true, 
        orderId: mockOrderId,
        amount: totalAmount,
        currency: 'INR',
        keyId: 'demo_razorpay_key',
        demoMode: true,
        message: 'Demo order created - no real payment processed'
      })
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

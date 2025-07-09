import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartTable, foodItemsTable, addressesTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/checkout - Process checkout and create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      addressId,
      paymentMethod,
      paymentToken, // For payment processing
      specialInstructions = '',
      scheduledDeliveryTime,
      tipAmount = 0,
      promoCode
    } = body

    if (!userId || !addressId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Required fields: userId, addressId, paymentMethod' },
        { status: 400 }
      )
    }

    // Validate user's cart has items
    const cartItems = await db
      .select({
        id: cartTable.id,
        quantity: cartTable.quantity,
        specialInstructions: cartTable.specialInstructions,
        foodItem: {
          id: foodItemsTable.id,
          name: foodItemsTable.name,
          price: foodItemsTable.price,
          cookTime: foodItemsTable.cookTime,
        }
      })
      .from(cartTable)
      .innerJoin(foodItemsTable, eq(cartTable.foodItemId, foodItemsTable.id))
      .where(eq(cartTable.userId, userId))

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate delivery address
    const address = await db
      .select()
      .from(addressesTable)
      .where(and(
        eq(addressesTable.id, addressId),
        eq(addressesTable.userId, userId)
      ))
      .limit(1)

    if (address.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid delivery address' },
        { status: 400 }
      )
    }

    // Calculate order totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.foodItem.price) * item.quantity)
    }, 0)

    let deliveryFee = subtotal > 25 ? 0 : 3.99
    let discount = 0

    // Apply promo code if provided
    if (promoCode) {
      const promoDiscount = await validatePromoCode(promoCode, subtotal)
      if (promoDiscount.valid) {
        discount = promoDiscount.amount
      }
    }

    const tax = (subtotal - discount) * 0.08
    const total = subtotal + deliveryFee + tax + tipAmount - discount

    // Process payment (mock implementation)
    const paymentResult = await processPayment({
      amount: total,
      paymentMethod,
      paymentToken,
      userId
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      )
    }

    // Create order
    const orderResponse = await fetch(`${request.url.split('/api')[0]}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deliveryAddress: address[0],
        paymentMethod,
        specialInstructions,
        scheduledDeliveryTime,
        tipAmount,
        discount,
        promoCode,
        paymentTransactionId: paymentResult.transactionId
      })
    })

    if (!orderResponse.ok) {
      // If order creation fails, refund payment
      await refundPayment(paymentResult.transactionId)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const orderData = await orderResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: orderData.order,
      payment: {
        transactionId: paymentResult.transactionId,
        status: 'completed',
        amount: total
      }
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}

// GET /api/checkout - Get checkout summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')
    const addressId = searchParams.get('addressId')
    const promoCode = searchParams.get('promoCode')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get cart items
    const cartItems = await db
      .select({
        id: cartTable.id,
        quantity: cartTable.quantity,
        specialInstructions: cartTable.specialInstructions,
        foodItem: {
          id: foodItemsTable.id,
          name: foodItemsTable.name,
          price: foodItemsTable.price,
          originalPrice: foodItemsTable.originalPrice,
          image: foodItemsTable.image,
          shortDescription: foodItemsTable.shortDescription,
          cookTime: foodItemsTable.cookTime,
        }
      })
      .from(cartTable)
      .innerJoin(foodItemsTable, eq(cartTable.foodItemId, foodItemsTable.id))
      .where(eq(cartTable.userId, userId))

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Get delivery address if provided
    let deliveryAddress = null
    if (addressId) {
      const address = await db
        .select()
        .from(addressesTable)
        .where(and(
          eq(addressesTable.id, addressId),
          eq(addressesTable.userId, userId)
        ))
        .limit(1)

      if (address.length > 0) {
        deliveryAddress = address[0]
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.foodItem.price) * item.quantity)
    }, 0)

    let deliveryFee = subtotal > 25 ? 0 : 3.99
    let discount = 0
    let promoDetails = null

    // Apply promo code if provided
    if (promoCode) {
      const promoDiscount = await validatePromoCode(promoCode, subtotal)
      if (promoDiscount.valid) {
        discount = promoDiscount.amount
        promoDetails = promoDiscount
      }
    }

    const tax = (subtotal - discount) * 0.08
    const total = subtotal + deliveryFee + tax - discount

    // Calculate estimated delivery time
    const maxPrepTime = Math.max(...cartItems.map(item => parseInt(item.foodItem.cookTime)))
    const estimatedDeliveryTime = new Date()
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + maxPrepTime + 30)

    return NextResponse.json({
      success: true,
      checkout: {
        items: cartItems,
        deliveryAddress,
        summary: {
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryFee: Math.round(deliveryFee * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          total: Math.round(total * 100) / 100,
          estimatedDeliveryTime,
          freeDeliveryThreshold: 25,
          amountForFreeDelivery: Math.max(0, 25 - subtotal)
        },
        promo: promoDetails
      }
    })
  } catch (error) {
    console.error('Checkout summary error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get checkout summary' },
      { status: 500 }
    )
  }
}

// Mock payment processing function
type PaymentResult = {
  success: true;
  transactionId: string;
  paymentMethod: string;
} | {
  success: false;
  error: string;
};
async function processPayment({ amount, paymentMethod, paymentToken, userId }: {
  amount: number
  paymentMethod: string
  paymentToken?: string
  userId: string
}): Promise<PaymentResult> {
  // Mock payment processing
  // In real implementation, integrate with Stripe, PayPal, etc.
  
  if (paymentMethod === 'credit_card') {
    if (!paymentToken) {
      return { success: false, error: 'Payment token required for credit card' }
    }
    
    // Mock credit card processing
    if (amount > 1000) {
      return { success: false, error: 'Transaction amount too high' }
    }
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod: 'credit_card'
    }
  }
  
  if (paymentMethod === 'cash_on_delivery') {
    return {
      success: true,
      transactionId: `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod: 'cash_on_delivery'
    }
  }
  
  return { success: false, error: 'Invalid payment method' }
}

// Mock promo code validation
type PromoValidationResult = {
  valid: true;
  amount: number;
  code: string;
  description: string;
} | {
  valid: false;
  error: string;
};
async function validatePromoCode(promoCode: string, subtotal: number): Promise<PromoValidationResult> {
  // Mock promo codes
  const promoCodes = {
    'SAVE10': { type: 'percentage', value: 10, minOrder: 20 },
    'NEWUSER': { type: 'fixed', value: 5, minOrder: 15 },
    'WEEKEND20': { type: 'percentage', value: 20, minOrder: 25 }
  }
  
  const promo = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes]
  
  if (!promo) {
    return { valid: false, error: 'Invalid promo code' }
  }
  
  if (subtotal < promo.minOrder) {
    return { 
      valid: false, 
      error: `Minimum order of $${promo.minOrder} required for this promo` 
    }
  }
  
  let discountAmount = 0
  if (promo.type === 'percentage') {
    discountAmount = (subtotal * promo.value) / 100
  } else {
    discountAmount = promo.value
  }
  
  return {
    valid: true,
    amount: Math.round(discountAmount * 100) / 100,
    code: promoCode.toUpperCase(),
    description: `${promo.type === 'percentage' ? promo.value + '%' : '$' + promo.value} off`
  }
}

// Mock refund function
async function refundPayment(transactionId: string) {
  // Mock refund implementation
  console.log(`Refunding transaction: ${transactionId}`)
  return { success: true, refundId: `ref_${Date.now()}` }
}
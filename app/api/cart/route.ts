import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cart, foodItems, usersTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { cartValidation, validateWithSchema } from '@/lib/validation'
import { ErrorHandler, ValidationError, NotFoundError, AuthenticationError } from '@/lib/error-handler'
import { AuthMiddleware } from '@/lib/auth'

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Validate user exists in database
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      console.error('❌ User not found in database:', userId)
      return NextResponse.json(
        { success: false, error: 'User not found. Please sign in again.' },
        { status: 401 }
      )
    }

    // Get cart items with food item details
    const cartItems = await db
      .select({
        id: cart.id,
        quantity: cart.quantity,
        specialInstructions: cart.specialInstructions,
        foodItem: {
          id: foodItems.id,
          name: foodItems.name,
          price: foodItems.price,
          originalPrice: foodItems.originalPrice,
          image: foodItems.image,
          shortDescription: foodItems.shortDescription || foodItems.description,
          isVegetarian: foodItems.isVegetarian,
          isVegan: foodItems.isVegan,
          isGlutenFree: foodItems.isGlutenFree,
          cookTime: foodItems.cookTime,
        }
      })
      .from(cart)
      .innerJoin(foodItems, eq(cart.foodItemId, foodItems.id))
      .where(eq(cart.userId, userId))

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.foodItem.price)
      return total + (itemPrice * item.quantity)
    }, 0)

    const deliveryFee = subtotal > 500 ? 0 : 49 // Free delivery over ₹500
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + deliveryFee + tax

    return NextResponse.json({
      success: true,
      cart: {
        items: cartItems,
        summary: {
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryFee: Math.round(deliveryFee * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
          freeDeliveryThreshold: 25,
          amountForFreeDelivery: Math.max(0, 25 - subtotal)
        }
      }
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json()
    
    // Validate input
    const validation = validateWithSchema(cartValidation.addItem, body)
    if (!validation.success) {
      throw new ValidationError('Invalid input data', validation.errors)
    }

    const { userId, foodItemId, quantity, specialInstructions } = validation.data!

    // Validate food item exists and is available
    const [foodItem] = await db
      .select({ id: foodItems.id, name: foodItems.name, isAvailable: foodItems.isAvailable })
      .from(foodItems)
      .where(eq(foodItems.id, foodItemId))
      .limit(1)

    if (!foodItem) {
      throw new NotFoundError('Food item not found')
    }

    if (!foodItem.isAvailable) {
      throw new ValidationError('This item is currently unavailable')
    }

    // Check if item already exists in cart
    const [existingCartItem] = await db
      .select({ id: cart.id, quantity: cart.quantity })
      .from(cart)
      .where(and(
        eq(cart.userId, userId),
        eq(cart.foodItemId, foodItemId)
      ))
      .limit(1)

    if (existingCartItem) {
      // Update existing item quantity
      const newQuantity = existingCartItem.quantity + quantity
      
      // Prevent excessive quantities
      if (newQuantity > 50) {
        throw new ValidationError('Maximum quantity limit reached (50 items)')
      }

      await db
        .update(cart)
        .set({ 
          quantity: newQuantity,
          specialInstructions: specialInstructions || '',
          updatedAt: new Date()
        })
        .where(eq(cart.id, existingCartItem.id))

      return NextResponse.json({
        success: true,
        message: `${foodItem.name} quantity updated to ${newQuantity}`,
        cartItem: {
          id: existingCartItem.id,
          quantity: newQuantity,
          specialInstructions: specialInstructions || ''
        }
      })
    } else {
      // Add new item to cart
      const [newCartItem] = await db
        .insert(cart)
        .values({
          userId,
          foodItemId,
          quantity,
          specialInstructions: specialInstructions || '',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      return NextResponse.json({
        success: true,
        message: `${foodItem.name} added to cart`,
        cartItem: newCartItem
      })
    }
  })
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Validate user exists in database
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      console.error('❌ User not found in database:', userId)
      return NextResponse.json(
        { success: false, error: 'User not found. Please sign in again.' },
        { status: 401 }
      )
    }

    await db
      .delete(cart)
      .where(eq(cart.userId, userId))

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cart, foodItems, usersTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

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

    const deliveryFee = subtotal > 25 ? 0 : 3.99 // Free delivery over $25
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
  console.log('🛒 POST /api/cart - Starting add to cart request')
  
  try {
    const body = await request.json()
    const { userId, foodItemId, quantity = 1, specialInstructions = '' } = body
    
    console.log('📤 Add to cart request body:', {
      userId,
      foodItemId,
      quantity,
      specialInstructions,
      bodyKeys: Object.keys(body)
    })

    if (!userId || !foodItemId) {
      console.error('❌ Missing required fields:', { userId, foodItemId })
      return NextResponse.json(
        { success: false, error: 'User ID and Food Item ID are required' },
        { status: 400 }
      )
    }

    // Log the received data for debugging
    console.log('📊 Received user ID:', userId)
    console.log('📊 Received food item ID:', foodItemId)

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

    // Validate quantity
    if (quantity < 1 || quantity > 50) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Validate food item exists
    console.log('🔍 Validating food item exists:', foodItemId)
    const foodItem = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.id, foodItemId))
      .limit(1)

    console.log('📊 Food item query result:', { 
      found: foodItem.length > 0, 
      count: foodItem.length,
      item: foodItem.length > 0 ? { id: foodItem[0].id, name: foodItem[0].name, isAvailable: foodItem[0].isAvailable } : null
    })

    if (foodItem.length === 0) {
      console.error('❌ Food item not found:', foodItemId)
      return NextResponse.json(
        { success: false, error: 'Food item not found' },
        { status: 404 }
      )
    }

    // Check if food item is available
    if (!foodItem[0].isAvailable) {
      console.error('❌ Food item unavailable:', { id: foodItemId, name: foodItem[0].name })
      return NextResponse.json(
        { success: false, error: 'This item is currently unavailable' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    console.log('🔍 Checking if item exists in cart:', { userId, foodItemId })
    const existingCartItem = await db
      .select()
      .from(cart)
      .where(and(
        eq(cart.userId, userId),
        eq(cart.foodItemId, foodItemId)
      ))
      .limit(1)

    console.log('📊 Cart item query result:', { 
      found: existingCartItem.length > 0, 
      count: existingCartItem.length,
      item: existingCartItem.length > 0 ? { id: existingCartItem[0].id, quantity: existingCartItem[0].quantity } : null
    })

    if (existingCartItem.length > 0) {
      // Update existing item quantity
      const newQuantity = existingCartItem[0].quantity + quantity
      
      console.log('📝 Updating existing cart item:', { 
        existingQuantity: existingCartItem[0].quantity, 
        addingQuantity: quantity, 
        newQuantity 
      })
      
      // Prevent excessive quantities
      if (newQuantity > 50) {
        console.error('❌ Maximum quantity exceeded:', { newQuantity, limit: 50 })
        return NextResponse.json(
          { success: false, error: 'Maximum quantity limit reached (50 items)' },
          { status: 400 }
        )
      }

      try {
        await db
          .update(cart)
          .set({ 
            quantity: newQuantity,
            specialInstructions: specialInstructions || existingCartItem[0].specialInstructions,
            updatedAt: new Date()
          })
          .where(eq(cart.id, existingCartItem[0].id))

        console.log('✅ Cart item updated successfully:', { id: existingCartItem[0].id, newQuantity })
        return NextResponse.json({
          success: true,
          message: `${foodItem[0].name} quantity updated to ${newQuantity}`,
          cartItem: {
            id: existingCartItem[0].id,
            quantity: newQuantity,
            specialInstructions: specialInstructions || existingCartItem[0].specialInstructions
          }
        })
      } catch (updateError) {
        console.error('❌ Failed to update cart item:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update cart item' },
          { status: 500 }
        )
      }
    } else {
      // Add new item to cart
      console.log('➕ Adding new item to cart:', { userId, foodItemId, quantity })
      
      try {
        const newCartItem = await db
          .insert(cart)
          .values({
            id: randomUUID(),
            userId,
            foodItemId,
            quantity,
            specialInstructions,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()

        console.log('✅ New cart item added successfully:', newCartItem[0])
        return NextResponse.json({
          success: true,
          message: `${foodItem[0].name} added to cart`,
          cartItem: newCartItem[0]
        })
      } catch (insertError) {
        console.error('❌ Failed to insert new cart item:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to add item to cart' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('❌ Add to cart error:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart. Please try again.' },
      { status: 500 }
    )
  }
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
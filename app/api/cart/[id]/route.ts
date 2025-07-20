import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cart } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// PATCH /api/cart/[id] - Update cart item quantity or instructions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartItemId = params.id
    const body = await request.json()
    const { quantity, specialInstructions, userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    if (quantity !== undefined && quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity cannot be negative' },
        { status: 400 }
      )
    }

    // If quantity is 0, this should be handled by the DELETE endpoint instead
    if (quantity !== undefined && quantity === 0) {
      return NextResponse.json(
        { success: false, error: 'Use DELETE endpoint to remove items with quantity 0' },
        { status: 400 }
      )
    }

    // Verify cart item belongs to user
    console.log('Looking for cart item:', { cartItemId, userId })
    const existingItem = await db
      .select()
      .from(cart)
      .where(and(
        eq(cart.id, cartItemId),
        eq(cart.userId, userId)
      ))
      .limit(1)

    console.log('Found cart items:', existingItem.length)
    if (existingItem.length === 0) {
      console.error('Cart item not found:', { cartItemId, userId })
      return NextResponse.json(
        { success: false, error: 'Cart item not found or unauthorized', details: { cartItemId, userId } },
        { status: 404 }
      )
    }

    // Update cart item
    const updateData: any = { updatedAt: new Date() }
    if (quantity !== undefined) updateData.quantity = quantity
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions

    const updatedItem = await db
      .update(cart)
      .set(updateData)
      .where(eq(cart.id, cartItemId))
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Cart item updated',
      cartItem: updatedItem[0]
    })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Remove specific item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartItemId = params.id
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Verify cart item belongs to user and delete
    const deletedItem = await db
      .delete(cart)
      .where(and(
        eq(cart.id, cartItemId),
        eq(cart.userId, userId)
      ))
      .returning()

    if (deletedItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      removedItem: deletedItem[0]
    })
  } catch (error) {
    console.error('Remove cart item error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
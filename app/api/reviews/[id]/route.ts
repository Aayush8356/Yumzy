import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviewsTable } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// PATCH /api/reviews/[id] - Update review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id
    const body = await request.json()
    const { userId, rating, comment, images } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Verify review belongs to user
    const existingReview = await db
      .select()
      .from(reviewsTable)
      .where(and(
        eq(reviewsTable.id, reviewId),
        eq(reviewsTable.userId, userId)
      ))
      .limit(1)

    if (existingReview.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found or unauthorized' },
        { status: 404 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Update review
    const updateData: any = { updatedAt: new Date() }
    if (rating !== undefined) updateData.rating = rating
    if (comment !== undefined) updateData.comment = comment
    if (images !== undefined) updateData.images = images.length > 0 ? JSON.stringify(images) : null

    const updatedReview = await db
      .update(reviewsTable)
      .set(updateData)
      .where(eq(reviewsTable.id, reviewId))
      .returning()

    // Update food item rating if rating changed
    if (rating !== undefined) {
      await updateFoodItemRating(existingReview[0].foodItemId)
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview[0]
    })
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get review to check ownership and get foodItemId
    const review = await db
      .select()
      .from(reviewsTable)
      .where(and(
        eq(reviewsTable.id, reviewId),
        eq(reviewsTable.userId, userId)
      ))
      .limit(1)

    if (review.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete review
    const deletedReview = await db
      .delete(reviewsTable)
      .where(eq(reviewsTable.id, reviewId))
      .returning()

    // Update food item rating
    await updateFoodItemRating(review[0].foodItemId)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      deletedReview: deletedReview[0]
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id
    const body = await request.json()
    const { userId, helpful = true } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // In a real app, you'd track which users found which reviews helpful
    // For now, just increment/decrement the count
    const increment = helpful ? 1 : -1

    const updatedReview = await db
      .update(reviewsTable)
      .set({
        helpfulCount: sql`${reviewsTable.helpfulCount} + ${increment}`,
        updatedAt: new Date()
      })
      .where(eq(reviewsTable.id, reviewId))
      .returning()

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: helpful ? 'Marked as helpful' : 'Removed helpful mark',
      review: updatedReview[0]
    })
  } catch (error) {
    console.error('Mark helpful error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update helpful status' },
      { status: 500 }
    )
  }
}

// Helper function to update food item rating (same as in route.ts)
async function updateFoodItemRating(foodItemId: string) {
  try {
    const { avg, count } = await import('drizzle-orm')
    
    const stats = await db
      .select({
        averageRating: avg(reviewsTable.rating),
        totalReviews: count(reviewsTable.id)
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.foodItemId, foodItemId))

    const averageRating = stats[0]?.averageRating || '0'
    const reviewCount = stats[0]?.totalReviews || 0

    const { foodItemsTable } = await import('@/lib/db/schema')
    
    await db
      .update(foodItemsTable)
      .set({
        rating: (Math.round(parseFloat(averageRating) * 10) / 10).toString(),
        reviewCount
      })
      .where(eq(foodItemsTable.id, foodItemId))
  } catch (error) {
    console.error('Update food item rating error:', error)
  }
}
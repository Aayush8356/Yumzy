import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviewsTable, foodItemsTable, usersTable, ordersTable } from '@/lib/db/schema'
import { eq, desc, and, avg, count, SQL } from 'drizzle-orm'

// GET /api/reviews - Get reviews for a food item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const foodItemId = searchParams.get('foodItemId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating') // Filter by rating
    
    if (!foodItemId) {
      return NextResponse.json(
        { success: false, error: 'Food item ID required' },
        { status: 400 }
      )
    }

    // Build query conditions
    const whereConditions: (SQL<unknown> | undefined)[] = [eq(reviewsTable.foodItemId, foodItemId)];
    if (rating) {
      whereConditions.push(eq(reviewsTable.rating, parseInt(rating)));
    }

    // Get reviews with user info
    const offset = (page - 1) * limit
    const reviews = await db
      .select({
        id: reviewsTable.id,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        images: reviewsTable.images,
        isVerified: reviewsTable.isVerified,
        helpfulCount: reviewsTable.helpfulCount,
        createdAt: reviewsTable.createdAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          avatar: usersTable.avatar
        }
      })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(and(...whereConditions.filter((c): c is SQL<unknown> => !!c)))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset)

    // Get review statistics
    const stats = await db
      .select({
        averageRating: avg(reviewsTable.rating),
        totalReviews: count(reviewsTable.id)
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.foodItemId, foodItemId))

    // Get rating distribution
    const ratingDistribution = await db
      .select({
        rating: reviewsTable.rating,
        count: count(reviewsTable.id)
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.foodItemId, foodItemId))
      .groupBy(reviewsTable.rating)
      .orderBy(reviewsTable.rating)

    const totalReviews = stats[0]?.totalReviews || 0
    const totalPages = Math.ceil(totalReviews / limit)

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        averageRating: stats[0]?.averageRating ? Math.round(parseFloat(stats[0].averageRating) * 10) / 10 : 0,
        totalReviews,
        ratingDistribution
      },
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      foodItemId,
      orderId,
      rating,
      comment = '',
      images = []
    } = body

    if (!userId || !foodItemId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Required fields: userId, foodItemId, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this food item
    const existingReview = await db
      .select()
      .from(reviewsTable)
      .where(and(
        eq(reviewsTable.userId, userId),
        eq(reviewsTable.foodItemId, foodItemId)
      ))
      .limit(1)

    if (existingReview.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this item' },
        { status: 400 }
      )
    }

    // Verify user has ordered this item (for verified purchase)
    let isVerified = false
    if (orderId) {
      const orderExists = await db
        .select()
        .from(ordersTable)
        .where(and(
          eq(ordersTable.id, orderId),
          eq(ordersTable.userId, userId),
          eq(ordersTable.status, 'delivered')
        ))
        .limit(1)

      isVerified = orderExists.length > 0
    }

    // Create review
    const newReview = await db
      .insert(reviewsTable)
      .values({
        userId,
        foodItemId,
        orderId: orderId || null,
        rating,
        comment,
        images,
        isVerified,
        helpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    // Update food item's average rating and review count
    await updateFoodItemRating(foodItemId)

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview[0]
    })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// Helper function to update food item rating
async function updateFoodItemRating(foodItemId: string) {
  try {
    const stats = await db
      .select({
        averageRating: avg(reviewsTable.rating),
        totalReviews: count(reviewsTable.id)
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.foodItemId, foodItemId))

    const averageRating = parseFloat(stats[0]?.averageRating || '0')
    const reviewCount = stats[0]?.totalReviews || 0

    await db
      .update(foodItemsTable)
      .set({
        rating: (Math.round(averageRating * 10) / 10).toString(),
        reviewCount
      })
      .where(eq(foodItemsTable.id, foodItemId))
  } catch (error) {
    console.error('Update food item rating error:', error)
  }
}
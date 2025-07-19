import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItemsTable, ordersTable, orderItemsTable, categoriesTable } from '@/lib/db/schema';
import { eq, desc, and, inArray, not } from 'drizzle-orm';
import { TokenManager } from '@/lib/auth';

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
    
    return userId;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyUser(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's order history
    console.log(`🔍 Fetching order history for user: ${userId}`);
    const userOrders = await db
      .select({
        orderId: ordersTable.id,
        foodItemId: orderItemsTable.foodItemId,
        quantity: orderItemsTable.quantity,
        createdAt: ordersTable.createdAt
      })
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(50); // Get last 50 orders

    console.log(`📊 Found ${userOrders.length} order entries for user ${userId}`);
    console.log(`📊 Sample orders:`, userOrders.slice(0, 3).map(o => ({ orderId: o.orderId?.slice(0, 8), foodItemId: o.foodItemId?.slice(0, 8) })));

    let recommendedItems: Array<{
      id: string;
      name: string;
      description: string | null;
      shortDescription: string | null;
      price: string;
      originalPrice: string | null;
      discount: number | null;
      rating: string | null;
      reviewCount: number | null;
      cookTime: string | null;
      image: string | null;
      isVegetarian: boolean | null;
      isSpicy: boolean | null;
      isPopular: boolean | null;
      categoryName: string | null;
    }> = [];

    if (userOrders.length > 0) {
      // Extract food item IDs from order history
      const orderedItemIds = userOrders
        .filter(order => order.foodItemId)
        .map(order => order.foodItemId)
        .filter(id => id !== null) as string[];

      console.log(`🍽️ Found ${orderedItemIds.length} unique food items in order history`);
      console.log(`🍽️ Sample food item IDs:`, orderedItemIds.slice(0, 5));

      // Skip processing if no valid item IDs
      if (orderedItemIds.length === 0) {
        console.log('⚠️ No valid food item IDs found in order history');
      } else {
        // Get categories of previously ordered items
        const orderedItems = await db
          .select({
            id: foodItemsTable.id,
            categoryId: foodItemsTable.categoryId,
            isVegetarian: foodItemsTable.isVegetarian,
            isSpicy: foodItemsTable.isSpicy
        })
          .from(foodItemsTable)
          .where(inArray(foodItemsTable.id, orderedItemIds));

        // Extract user preferences
        const categoryIds = Array.from(new Set(orderedItems.map(item => item.categoryId))).filter(id => id !== null) as string[];
        const isVegetarianPreferred = orderedItems.filter(item => item.isVegetarian).length > orderedItems.length * 0.6;
        const isSpicyPreferred = orderedItems.filter(item => item.isSpicy).length > orderedItems.length * 0.4;

        // Get similar items based on preferences (not previously ordered)
        let similarItems = await db
        .select({
          id: foodItemsTable.id,
          name: foodItemsTable.name,
          description: foodItemsTable.description,
          shortDescription: foodItemsTable.shortDescription,
          price: foodItemsTable.price,
          originalPrice: foodItemsTable.originalPrice,
          discount: foodItemsTable.discount,
          rating: foodItemsTable.rating,
          reviewCount: foodItemsTable.reviewCount,
          cookTime: foodItemsTable.cookTime,
          image: foodItemsTable.image,
          isVegetarian: foodItemsTable.isVegetarian,
          isSpicy: foodItemsTable.isSpicy,
          isPopular: foodItemsTable.isPopular,
          categoryName: categoriesTable.name
        })
        .from(foodItemsTable)
        .leftJoin(categoriesTable, eq(foodItemsTable.categoryId, categoriesTable.id))
        .where(
          and(
            eq(foodItemsTable.isAvailable, true),
            not(inArray(foodItemsTable.id, orderedItemIds)),
            categoryIds.length > 0 ? inArray(foodItemsTable.categoryId, categoryIds) : undefined,
            isVegetarianPreferred ? eq(foodItemsTable.isVegetarian, true) : undefined,
            isSpicyPreferred ? eq(foodItemsTable.isSpicy, true) : undefined
          )
        )
        .orderBy(desc(foodItemsTable.rating), desc(foodItemsTable.reviewCount))
        .limit(4);

        // If not enough similar items, get popular items from preferred categories
        if (similarItems.length < 4) {
          const additionalItems = await db
            .select({
              id: foodItemsTable.id,
              name: foodItemsTable.name,
              description: foodItemsTable.description,
              shortDescription: foodItemsTable.shortDescription,
              price: foodItemsTable.price,
              originalPrice: foodItemsTable.originalPrice,
              discount: foodItemsTable.discount,
              rating: foodItemsTable.rating,
              reviewCount: foodItemsTable.reviewCount,
              cookTime: foodItemsTable.cookTime,
              image: foodItemsTable.image,
              isVegetarian: foodItemsTable.isVegetarian,
              isSpicy: foodItemsTable.isSpicy,
              isPopular: foodItemsTable.isPopular,
              categoryName: categoriesTable.name
            })
            .from(foodItemsTable)
            .leftJoin(categoriesTable, eq(foodItemsTable.categoryId, categoriesTable.id))
            .where(
              and(
                eq(foodItemsTable.isAvailable, true),
                not(inArray(foodItemsTable.id, orderedItemIds)),
                not(inArray(foodItemsTable.id, similarItems.map(item => item.id))),
                eq(foodItemsTable.isPopular, true)
              )
            )
            .orderBy(desc(foodItemsTable.rating))
            .limit(4 - similarItems.length);

          similarItems = [...similarItems, ...additionalItems];
        }

        recommendedItems = similarItems;
      }
    }

    // If no order history or not enough recommendations, get popular items
    if (recommendedItems.length < 4) {
      const popularItems = await db
        .select({
          id: foodItemsTable.id,
          name: foodItemsTable.name,
          description: foodItemsTable.description,
          shortDescription: foodItemsTable.shortDescription,
          price: foodItemsTable.price,
          originalPrice: foodItemsTable.originalPrice,
          discount: foodItemsTable.discount,
          rating: foodItemsTable.rating,
          reviewCount: foodItemsTable.reviewCount,
          cookTime: foodItemsTable.cookTime,
          image: foodItemsTable.image,
          isVegetarian: foodItemsTable.isVegetarian,
          isSpicy: foodItemsTable.isSpicy,
          isPopular: foodItemsTable.isPopular,
          categoryName: categoriesTable.name
        })
        .from(foodItemsTable)
        .leftJoin(categoriesTable, eq(foodItemsTable.categoryId, categoriesTable.id))
        .where(
          and(
            eq(foodItemsTable.isAvailable, true),
            eq(foodItemsTable.isPopular, true),
            recommendedItems.length > 0 ? not(inArray(foodItemsTable.id, recommendedItems.map(item => item.id))) : undefined
          )
        )
        .orderBy(desc(foodItemsTable.rating), desc(foodItemsTable.reviewCount))
        .limit(4 - recommendedItems.length);

      recommendedItems = [...recommendedItems, ...popularItems];
    }

    // If still not enough, get random items
    if (recommendedItems.length < 4) {
      const randomItems = await db
        .select({
          id: foodItemsTable.id,
          name: foodItemsTable.name,
          description: foodItemsTable.description,
          shortDescription: foodItemsTable.shortDescription,
          price: foodItemsTable.price,
          originalPrice: foodItemsTable.originalPrice,
          discount: foodItemsTable.discount,
          rating: foodItemsTable.rating,
          reviewCount: foodItemsTable.reviewCount,
          cookTime: foodItemsTable.cookTime,
          image: foodItemsTable.image,
          isVegetarian: foodItemsTable.isVegetarian,
          isSpicy: foodItemsTable.isSpicy,
          isPopular: foodItemsTable.isPopular,
          categoryName: categoriesTable.name
        })
        .from(foodItemsTable)
        .leftJoin(categoriesTable, eq(foodItemsTable.categoryId, categoriesTable.id))
        .where(
          and(
            eq(foodItemsTable.isAvailable, true),
            recommendedItems.length > 0 ? not(inArray(foodItemsTable.id, recommendedItems.map(item => item.id))) : undefined
          )
        )
        .orderBy(desc(foodItemsTable.rating))
        .limit(4 - recommendedItems.length);

      recommendedItems = [...recommendedItems, ...randomItems];
    }

    // Format the response with proper pricing
    const formattedRecommendations = recommendedItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.shortDescription || item.description,
      price: `₹${item.price}`,
      originalPrice: item.originalPrice ? `₹${item.originalPrice}` : undefined,
      discount: item.discount,
      rating: parseFloat(item.rating || '4.5'),
      reviewCount: item.reviewCount || 0,
      cookTime: item.cookTime,
      image: item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      isVegetarian: item.isVegetarian,
      isSpicy: item.isSpicy,
      category: item.categoryName || 'General'
    }));

    return NextResponse.json({
      success: true,
      recommendations: formattedRecommendations,
      hasOrderHistory: userOrders.length > 0,
      recommendationType: userOrders.length > 0 ? 'personalized' : 'popular'
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recommendations' 
    }, { status: 500 });
  }
}
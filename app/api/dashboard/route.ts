// yumzy/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, foodItemsTable, favoritesTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 401 });
    }

    // Fetch recent orders
    const recentOrders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(3);

    // Fetch favorite items
    const favorites = await db
      .select({
        name: foodItemsTable.name,
        price: foodItemsTable.price,
        image: foodItemsTable.image,
        orders: foodItemsTable.reviewCount, // Using reviewCount as a stand-in for order count
      })
      .from(favoritesTable)
      .innerJoin(foodItemsTable, eq(favoritesTable.foodItemId, foodItemsTable.id))
      .where(eq(favoritesTable.userId, userId))
      .limit(3);

    // In a real app, you would calculate these stats
    const quickStats = [
      { icon: 'ShoppingCart', label: 'Total Orders', value: '0', color: 'text-blue-600' },
      { icon: 'Clock', label: 'Avg. Delivery', value: 'N/A', color: 'text-green-600' },
      { icon: 'Star', label: 'Your Rating', value: 'N/A', color: 'text-yellow-600' },
      { icon: 'TrendingUp', label: 'Saved Money', value: '$0', color: 'text-purple-600' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        quickStats,
        recentOrders,
        favorites,
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

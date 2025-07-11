import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, users, foodItems } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';
import { eq, ne, and, not, like } from 'drizzle-orm';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [totalOrders] = await db.select({ value: count() }).from(orders);
    
    // Count only regular users (exclude admin and demo users)
    const [totalUsers] = await db.select({ value: count() }).from(users)
      .where(
        and(
          ne(users.role, 'admin'),
          not(like(users.email, '%demo%'))
        )
      );
    
    const [totalMenuItems] = await db.select({ value: count() }).from(foodItems);

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders.value,
        totalUsers: totalUsers.value,
        totalMenuItems: totalMenuItems.value,
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

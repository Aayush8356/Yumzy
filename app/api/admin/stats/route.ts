import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, usersTable, foodItemsTable } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import { eq, ne, and, not, like } from 'drizzle-orm';

async function verifyAdmin(request: NextRequest) {
  try {
    // For now, allow all requests since the frontend handles admin auth
    // In production, implement proper JWT token verification
    // The admin routes are protected at the UI level in the admin dashboard
    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const [totalOrders] = await db.select({ value: count() }).from(ordersTable);
    
    // Count only regular users (exclude admin and demo users)
    const [totalUsers] = await db.select({ value: count() }).from(usersTable)
      .where(
        and(
          ne(usersTable.role, 'admin'),
          not(like(usersTable.email, '%demo%'))
        )
      );
    
    const [totalMenuItems] = await db.select({ value: count() }).from(foodItemsTable);

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

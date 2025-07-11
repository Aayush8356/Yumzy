import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, orders, notifications } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq, ne, and, not, like, desc } from 'drizzle-orm';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
}

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'order_placed' | 'system_update';
  message: string;
  timestamp: Date;
  data?: any;
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const activities: ActivityItem[] = [];

    // Get recent user registrations (exclude admin and demo)
    const recentUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    }).from(users)
      .where(
        and(
          ne(users.role, 'admin'),
          not(like(users.email, '%demo%'))
        )
      )
      .orderBy(desc(users.createdAt))
      .limit(5);

    // Add user registrations to activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user_registration',
        message: `New user registration: ${user.name}`,
        timestamp: user.createdAt || new Date(),
        data: { userId: user.id, email: user.email }
      });
    });

    // Get recent orders
    const recentOrders = await db.select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      userId: orders.userId
    }).from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Add orders to activities
    recentOrders.forEach(order => {
      activities.push({
        id: `order_${order.id}`,
        type: 'order_placed',
        message: `New order placed: $${order.total} (${order.status})`,
        timestamp: order.createdAt || new Date(),
        data: { orderId: order.id, total: order.total, status: order.status }
      });
    });

    // Add some system activities (static for now)
    const now = new Date();
    const systemActivities: ActivityItem[] = [
      {
        id: 'system_1',
        type: 'system_update',
        message: 'System deployment completed successfully',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 'system_2',
        type: 'system_update',
        message: 'Database maintenance scheduled',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      }
    ];

    activities.push(...systemActivities);

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Take only the most recent 10 activities
    const recentActivities = activities.slice(0, 10);

    return NextResponse.json({
      success: true,
      activities: recentActivities
    });
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
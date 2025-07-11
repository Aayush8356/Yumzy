import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable, ordersTable, notificationsTable } from '@/lib/db/schema';
import { eq, ne, and, not, like, desc } from 'drizzle-orm';

async function verifyAdmin(request: NextRequest) {
  try {
    // For now, allow all requests since the frontend handles admin auth
    // In production, implement proper JWT token verification
    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
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
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      createdAt: usersTable.createdAt
    }).from(usersTable)
      .where(
        and(
          ne(usersTable.role, 'admin'),
          not(like(usersTable.email, '%demo%'))
        )
      )
      .orderBy(desc(usersTable.createdAt))
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
      id: ordersTable.id,
      total: ordersTable.total,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      userId: ordersTable.userId
    }).from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
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

    // System activities would come from a real system logs table in production
    // For now, we'll only show real user and order activities

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
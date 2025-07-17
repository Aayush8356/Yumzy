import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable, ordersTable, notificationsTable, contactMessages, foodItems } from '@/lib/db/schema';
import { eq, ne, and, not, like, desc } from 'drizzle-orm';
import { OrderStatusManager } from '@/lib/order-status-manager';

export const dynamic = 'force-dynamic';

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
  type: 'user_registration' | 'order_placed' | 'system_update' | 'message_received' | 'menu_item_added' | 'admin_action';
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
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const activities: ActivityItem[] = [];

    // Function to add activities based on filter
    const shouldIncludeType = (type: string) => {
      return !typeFilter || typeFilter === 'all' || typeFilter === type;
    };

    // Get recent user registrations (exclude admin and demo)
    if (shouldIncludeType('user_registration')) {
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
        .limit(10);

      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_registration',
          message: `New user registration: ${user.name}`,
          timestamp: user.createdAt || new Date(),
          data: { userId: user.id, email: user.email }
        });
      });
    }

    // Get recent orders
    if (shouldIncludeType('order_placed')) {
      const recentOrders = await db.select({
        id: ordersTable.id,
        total: ordersTable.total,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        userId: ordersTable.userId
      }).from(ordersTable)
        .orderBy(desc(ordersTable.createdAt))
        .limit(10);

      // Update order statuses based on timeline before returning data
      await Promise.all(
        recentOrders.map(async (order) => {
          if (order.status !== 'delivered' && order.status !== 'cancelled') {
            try {
              await OrderStatusManager.checkAndUpdateOrderStatus(order.id);
            } catch (error) {
              console.error(`Failed to update status for order ${order.id}:`, error);
            }
          }
        })
      );

      // Fetch fresh order data after status updates
      const updatedRecentOrders = await db.select({
        id: ordersTable.id,
        total: ordersTable.total,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        userId: ordersTable.userId
      }).from(ordersTable)
        .orderBy(desc(ordersTable.createdAt))
        .limit(10);

      updatedRecentOrders.forEach(order => {
        activities.push({
          id: `order_${order.id}`,
          type: 'order_placed',
          message: `New order placed: ₹${order.total} (${order.status})`,
          timestamp: order.createdAt || new Date(),
          data: { orderId: order.id, total: order.total, status: order.status }
        });
      });
    }

    // Get recent contact messages
    if (shouldIncludeType('message_received')) {
      try {
        const recentMessages = await db.select({
          id: contactMessages.id,
          name: contactMessages.name,
          subject: contactMessages.subject,
          createdAt: contactMessages.createdAt
        }).from(contactMessages)
          .orderBy(desc(contactMessages.createdAt))
          .limit(10);

        recentMessages.forEach(message => {
          activities.push({
            id: `message_${message.id}`,
            type: 'message_received',
            message: `New message from ${message.name}: ${message.subject}`,
            timestamp: message.createdAt || new Date(),
            data: { messageId: message.id, subject: message.subject }
          });
        });
      } catch (error) {
        console.log('Contact messages table may not exist yet');
      }
    }

    // Get recent menu item additions
    if (shouldIncludeType('menu_item_added')) {
      try {
        const recentMenuItems = await db.select({
          id: foodItems.id,
          name: foodItems.name,
          price: foodItems.price,
          createdAt: foodItems.createdAt
        }).from(foodItems)
          .orderBy(desc(foodItems.createdAt))
          .limit(10);

        recentMenuItems.forEach(item => {
          activities.push({
            id: `menu_${item.id}`,
            type: 'menu_item_added',
            message: `New menu item added: ${item.name} (₹${item.price})`,
            timestamp: item.createdAt || new Date(),
            data: { itemId: item.id, name: item.name, price: item.price }
          });
        });
      } catch (error) {
        console.log('Food items table may not exist yet');
      }
    }

    // Add some system update activities for demonstration
    if (shouldIncludeType('system_update')) {
      const now = new Date();
      activities.push({
        id: 'system_update_1',
        type: 'system_update',
        message: 'Admin dashboard updated with real-time data',
        timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
        data: { updateType: 'dashboard_improvement' }
      });
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const totalActivities = activities.length;
    const paginatedActivities = activities.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalActivities / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filter: typeFilter || 'all'
    });
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
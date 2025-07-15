// yumzy/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    console.log('Admin verification - Auth token:', authToken);
    
    if (!authToken) {
      console.log('No auth token provided');
      return false;
    }

    // Try to find user by ID if it looks like a UUID
    if (authToken.includes('-')) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authToken)).limit(1);
      console.log('Found user by ID:', user?.email, 'Role:', user?.role);
      return user?.role === 'admin';
    } else {
      // For generic tokens like 'authenticated', check if any admin exists
      // This is a simplified approach - in production use proper JWT verification
      console.log('Generic auth token detected, checking for admin users');
      const [adminUser] = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
      console.log('Admin user found:', adminUser?.email);
      return !!adminUser;
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;
  try {
    const body = await request.json();
    const { status } = body;
    
    // Get the current order to check previous status
    const [currentOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Update the order status
    const [updatedOrder] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
    
    // Send notification and real-time update to customer if status changed
    if (currentOrder.status !== status) {
      const notificationMessage = getStatusMessage(status);
      const notificationTitle = getStatusTitle(status);
      
      try {
        // Send notification
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentOrder.userId,
            type: 'order_update',
            title: notificationTitle,
            message: `${notificationMessage} Order #${id.slice(0, 8)}`,
            data: {
              orderId: id,
              status: status,
              previousStatus: currentOrder.status
            },
            isImportant: true
          })
        });

        // Send real-time update
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/realtime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'order_status',
            userId: currentOrder.userId,
            orderId: id,
            data: {
              orderId: id,
              status: status,
              previousStatus: currentOrder.status,
              message: notificationMessage,
              title: notificationTitle,
              total: currentOrder.total,
              updatedAt: new Date().toISOString()
            }
          })
        });
      } catch (error) {
        console.error('Failed to send notification or real-time update:', error);
      }
    }
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(`Failed to update order ${id}:`, error);
    return NextResponse.json({ success: false, error: `Failed to update order ${id}` }, { status: 500 });
  }
}

function getStatusTitle(status: string): string {
  switch (status) {
    case 'pending': return 'Order Received';
    case 'preparing': return 'Order in Kitchen';
    case 'on-the-way': return 'Out for Delivery';
    case 'delivered': return 'Order Delivered';
    case 'cancelled': return 'Order Cancelled';
    default: return 'Order Update';
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;
  
  try {
    // Check if order exists
    const [existingOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    console.log(`Deleting order ${id} and its items from database`);
    
    // Delete order items first (foreign key constraint)
    const deletedItems = await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id)).returning();
    console.log(`Deleted ${deletedItems.length} order items`);
    
    // Delete the order
    const deletedOrders = await db.delete(ordersTable).where(eq(ordersTable.id, id)).returning();
    console.log(`Deleted ${deletedOrders.length} orders`);
    
    if (deletedOrders.length === 0) {
      throw new Error('Order not found or already deleted');
    }

    // Send real-time update to user about order deletion
    try {
      console.log(`Sending real-time order deletion notification for order ${id} to user ${existingOrder.userId}`);
      const realtimeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/realtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_deleted',
          userId: existingOrder.userId,
          orderId: id,
          data: {
            orderId: id,
            message: 'Order has been deleted',
            deletedAt: new Date().toISOString()
          }
        })
      });
      
      if (realtimeResponse.ok) {
        console.log('Real-time deletion notification sent successfully');
      } else {
        console.error('Failed to send real-time deletion notification:', await realtimeResponse.text());
      }
    } catch (error) {
      console.error('Failed to send real-time delete notification:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${id.slice(0, 8)} and all related data deleted successfully` 
    });
  } catch (error) {
    console.error(`Failed to delete order ${id}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete order ${id}` 
    }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending': return 'Your order has been received and is being processed.';
    case 'preparing': return 'Your order is being prepared in our kitchen.';
    case 'on-the-way': return 'Your order is on its way to you!';
    case 'delivered': return 'Your order has been delivered. Enjoy your meal!';
    case 'cancelled': return 'Your order has been cancelled.';
    default: return 'Your order status has been updated.';
  }
}

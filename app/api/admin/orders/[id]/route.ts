// yumzy/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    if (!authToken) {
      return false;
    }

    // Check if user exists and is admin
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authToken)).limit(1);
    return user?.role === 'admin';
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

    // Delete order items first (foreign key constraint)
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    
    // Delete the order
    await db.delete(ordersTable).where(eq(ordersTable.id, id));

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

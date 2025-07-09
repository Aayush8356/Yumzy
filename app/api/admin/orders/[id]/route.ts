// yumzy/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
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

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, foodItemsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { OrderStatusManager } from '@/lib/order-status-manager'
import { AuthMiddleware } from '@/lib/auth'

// GET - Get order status and tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get order with items
    const order = await db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        status: ordersTable.status,
        total: ordersTable.total,
        trackingInfo: ordersTable.trackingInfo,
        estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
        actualDeliveryTime: ordersTable.actualDeliveryTime,
        createdAt: ordersTable.createdAt,
        updatedAt: ordersTable.updatedAt
      })
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = order[0];
    const progress = OrderStatusManager.getOrderProgress(orderData.status);
    
    // Calculate time remaining if order is not delivered
    let timeRemaining = null;
    if (orderData.status !== 'delivered' && (orderData.trackingInfo as any)?.estimatedArrival) {
      const estimatedTime = new Date((orderData.trackingInfo as any).estimatedArrival);
      timeRemaining = OrderStatusManager.formatTimeRemaining(estimatedTime);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        progress,
        timeRemaining,
        statusHistory: (orderData.trackingInfo as any)?.timeline || []
      }
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await AuthMiddleware.requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user is admin
    const user = authResult.user;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update order status
    const trackingInfo = {
      status,
      lastUpdate: new Date(),
      updatedBy: user.email,
      notes: notes || null
    };

    const success = await OrderStatusManager.updateOrderStatus(id, status, trackingInfo);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      status,
      updatedAt: new Date()
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
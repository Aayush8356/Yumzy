import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, foodItemsTable, usersTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Get user role
    const [user] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    // Get the main order with ownership check
    let orderQuery;
    if (user.role === 'admin') {
      // Admins can access any order
      orderQuery = db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, id))
        .limit(1);
    } else {
      // Regular users can only access their own orders
      orderQuery = db
        .select()
        .from(ordersTable)
        .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
        .limit(1);
    }

    const [order] = await orderQuery;

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: user.role === 'admin' ? 'Order not found' : 'Order not found or access denied' 
      }, { status: 404 });
    }

    // Get order items with food details
    const orderItemsWithFood = await db
      .select({
        id: orderItemsTable.id,
        quantity: orderItemsTable.quantity,
        price: orderItemsTable.price,
        specialInstructions: orderItemsTable.specialInstructions,
        foodItem: {
          name: foodItemsTable.name,
          image: foodItemsTable.image,
        },
      })
      .from(orderItemsTable)
      .innerJoin(foodItemsTable, eq(orderItemsTable.foodItemId, foodItemsTable.id))
      .where(eq(orderItemsTable.orderId, id));

    // Combine order with items
    const fullOrder = {
      ...order,
      orderItems: orderItemsWithFood
    };

    return NextResponse.json({ success: true, order: fullOrder });
  } catch (error) {
    console.error(`Failed to fetch order details:`, error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Get user role
    const [user] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    // Only admins can update order status
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update order status
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({ 
        status,
        trackingInfo: {
          status,
          estimatedArrival: new Date(Date.now() + 30 * 60 * 1000),
          lastUpdate: new Date()
        }
      })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(`Failed to update order:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

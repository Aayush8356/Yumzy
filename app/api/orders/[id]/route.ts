import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, foodItemsTable, usersTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { OrderStatusManager } from '@/lib/order-status-manager';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Authenticate user - support both JWT and simple token approach
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    
    try {
      // Try JWT first
      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
      } else {
        // Fall back to simple token approach (token is user ID)
        userId = token;
      }
    } catch (error) {
      // If JWT fails, try simple token approach
      userId = token;
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

    // Get the main order with customer details
    let orderWithCustomerQuery;
    if (user.role === 'admin') {
      // Admins can access any order
      orderWithCustomerQuery = db
        .select({
          order: ordersTable,
          customer: {
            name: usersTable.name,
            email: usersTable.email,
            phone: usersTable.phone
          }
        })
        .from(ordersTable)
        .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(eq(ordersTable.id, id))
        .limit(1);
    } else {
      // Regular users can only access their own orders
      orderWithCustomerQuery = db
        .select({
          order: ordersTable,
          customer: {
            name: usersTable.name,
            email: usersTable.email,
            phone: usersTable.phone
          }
        })
        .from(ordersTable)
        .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
        .limit(1);
    }

    const [orderWithCustomer] = await orderWithCustomerQuery;
    
    if (!orderWithCustomer) {
      return NextResponse.json({ 
        success: false, 
        error: user.role === 'admin' ? 'Order not found' : 'Order not found or access denied' 
      }, { status: 404 });
    }

    let order = orderWithCustomer.order;
    let customer = orderWithCustomer.customer;
    
    // Update order status based on timeline before returning data
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      console.log(`🔄 Updating order status for order ${id}...`);
      try {
        await OrderStatusManager.checkAndUpdateOrderStatus(id);
        
        // Fetch fresh order data after status update
        const [updatedOrderResult] = await (user.role === 'admin' ? 
          db.select({
            order: ordersTable,
            customer: {
              name: usersTable.name,
              email: usersTable.email,
              phone: usersTable.phone
            }
          })
          .from(ordersTable)
          .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
          .where(eq(ordersTable.id, id))
          .limit(1) :
          db.select({
            order: ordersTable,
            customer: {
              name: usersTable.name,
              email: usersTable.email,
              phone: usersTable.phone
            }
          })
          .from(ordersTable)
          .innerJoin(usersTable, eq(ordersTable.userId, usersTable.id))
          .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)))
          .limit(1)
        );
        
        if (updatedOrderResult) {
          order = updatedOrderResult.order;
          customer = updatedOrderResult.customer;
        }
      } catch (error) {
        console.error(`Failed to update status for order ${id}:`, error);
      }
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

    // Combine order with items and customer data
    const fullOrder = {
      ...order,
      orderItems: orderItemsWithFood,
      customerName: customer.name,
      customerPhone: customer.phone || customer.email,
      customerEmail: customer.email
    };

    // Add cache-busting headers to prevent stale data
    const response = NextResponse.json({ success: true, order: fullOrder });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
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

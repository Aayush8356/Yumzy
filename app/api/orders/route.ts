import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, usersTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    if (!authToken) {
      return null;
    }

    // In a real app, you'd verify the JWT token here
    // For now, we'll use the token as user ID (assuming it's stored in localStorage)
    const userId = authToken;
    
    // Verify user exists in database
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user ? userId : null;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 401 });
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, deliveryAddress, paymentMethod, subtotal, tax, deliveryFee, total } = body;

    console.log('Creating order with data:', { userId, items, deliveryAddress, paymentMethod, subtotal, tax, deliveryFee, total });

    if (!items || !deliveryAddress) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
    }

    // Create the order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        status: 'pending',
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        deliveryFee: deliveryFee.toString(),
        total: total.toString(),
        deliveryAddress,
        paymentMethod,
        paymentStatus: 'pending',
        estimatedDeliveryTime: '25-35 minutes',
        trackingInfo: {
          status: 'order_placed',
          estimatedArrival: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          lastUpdate: new Date()
        }
      })
      .returning();

    console.log('Order created:', newOrder);

    // Create order items
    const orderItemsToInsert = items.map((item: any) => ({
      orderId: newOrder.id,
      foodItemId: item.foodItem.id,
      quantity: item.quantity,
      price: item.foodItem.price.toString(),
      specialInstructions: item.specialInstructions || null
    }));

    await db.insert(orderItems).values(orderItemsToInsert);

    console.log('Order items created:', orderItemsToInsert);

    return NextResponse.json({ 
      success: true, 
      order: newOrder,
      orderId: newOrder.id,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

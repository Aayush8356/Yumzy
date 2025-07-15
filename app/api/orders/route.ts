import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, orderItemsTable, usersTable, foodItemsTable } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { OrderStatusManager } from '@/lib/order-status-manager';

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

    console.log(`Fetching orders for user ${userId}`);
    
    const userOrders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));

    console.log(`Found ${userOrders.length} orders for user ${userId}:`, userOrders.map(o => ({ id: o.id.slice(0, 8), status: o.status, createdAt: o.createdAt })));

    // Add cache-busting headers to prevent stale data
    const response = NextResponse.json({ success: true, orders: userOrders });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('ETag', `"${Date.now()}"`);
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
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

    // Get food item details for preparation time calculation
    const foodItemIds = items.map((item: any) => item.foodItem.id);
    const foodItemDetails = await db
      .select()
      .from(foodItemsTable)
      .where(inArray(foodItemsTable.id, foodItemIds));

    // Enrich items with food details for status calculation
    const enrichedItems = items.map((item: any) => ({
      ...item,
      foodItem: {
        ...item.foodItem,
        cookTime: foodItemDetails.find(fi => fi.id === item.foodItem.id)?.cookTime || '15 mins'
      }
    }));

    // Calculate estimated delivery time
    const estimatedDeliveryTime = OrderStatusManager.getEstimatedDeliveryTime(enrichedItems);
    const estimatedTimeString = OrderStatusManager.formatTimeRemaining(estimatedDeliveryTime);

    // Create the order
    const [newOrder] = await db
      .insert(ordersTable)
      .values({
        userId,
        status: 'confirmed',
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        deliveryFee: deliveryFee.toString(),
        total: total.toString(),
        deliveryAddress,
        paymentMethod,
        paymentStatus: 'completed', // Assuming payment is successful at this point
        estimatedDeliveryTime: estimatedTimeString,
        trackingInfo: {
          status: 'confirmed',
          estimatedArrival: estimatedDeliveryTime,
          lastUpdate: new Date(),
          timeline: OrderStatusManager.createOrderTimeline(enrichedItems)
        } as any
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

    await db.insert(orderItemsTable).values(orderItemsToInsert);

    console.log('Order items created:', orderItemsToInsert);

    // Schedule automatic status updates
    setTimeout(() => {
      OrderStatusManager.scheduleOrderStatusUpdates(newOrder.id, enrichedItems);
    }, 1000); // Small delay to ensure order is fully created

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

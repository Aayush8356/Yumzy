import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, foodItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get the main order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Get order items with food details
    const orderItemsWithFood = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        specialInstructions: orderItems.specialInstructions,
        foodItem: {
          name: foodItems.name,
          image: foodItems.image,
        },
      })
      .from(orderItems)
      .innerJoin(foodItems, eq(orderItems.foodItemId, foodItems.id))
      .where(eq(orderItems.orderId, id));

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

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status,
        trackingInfo: {
          status,
          estimatedArrival: new Date(Date.now() + 30 * 60 * 1000),
          lastUpdate: new Date()
        }
      })
      .where(eq(orders.id, id))
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

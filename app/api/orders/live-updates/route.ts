import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema'
import { eq, gte } from 'drizzle-orm'

// GET - Server-Sent Events for real-time order updates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const orderId = searchParams.get('orderId');

  if (!userId && !orderId) {
    return NextResponse.json(
      { success: false, error: 'User ID or Order ID required' },
      { status: 400 }
    );
  }

  // Set up Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Set up polling for order updates
      const pollInterval = setInterval(async () => {
        try {
          let orders;
          
          if (orderId) {
            // Get specific order
            orders = await db
              .select()
              .from(ordersTable)
              .where(eq(ordersTable.id, orderId))
              .limit(1);
          } else {
            // Get user's recent active orders (not delivered)
            orders = await db
              .select()
              .from(ordersTable)
              .where(eq(ordersTable.userId, userId!))
              .limit(10);
          }

          // Send order updates
          orders.forEach(order => {
            const updateData = {
              type: 'order_update',
              orderId: order.id,
              status: order.status,
              trackingInfo: order.trackingInfo,
              estimatedDeliveryTime: order.estimatedDeliveryTime,
              updatedAt: order.updatedAt,
              timestamp: new Date().toISOString()
            };

            controller.enqueue(`data: ${JSON.stringify(updateData)}\n\n`);
          });

        } catch (error) {
          console.error('Error polling order updates:', error);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to fetch order updates',
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      }, 5000); // Poll every 5 seconds

      // Clean up on close
      request.signal?.addEventListener('abort', () => {
        clearInterval(pollInterval);
        controller.close();
      });

      // Auto-close after 30 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        controller.close();
      }, 30 * 60 * 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST - Manual refresh for order updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderId } = body;

    if (!userId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Order ID required' },
        { status: 400 }
      );
    }

    let orders;
    
    if (orderId) {
      // Get specific order
      orders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .limit(1);
    } else {
      // Get user's active orders
      orders = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.userId, userId))
        .limit(10);
    }

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        trackingInfo: order.trackingInfo,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        updatedAt: order.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching order updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order updates' },
      { status: 500 }
    );
  }
}
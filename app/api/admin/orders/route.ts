import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, foodItemsTable, usersTable } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, ilike, or, count } from 'drizzle-orm'
import { AuthMiddleware } from '@/lib/auth'
import { OrderStatusManager } from '@/lib/order-status-manager'

// GET - Admin: Get all orders with filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await AuthMiddleware.requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const countOnly = searchParams.get('countOnly') === 'true';

    const offset = (page - 1) * limit;
    
    console.log('Admin orders API - countOnly:', countOnly, 'status:', status);

    // Build query conditions
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(ordersTable.status, status));
    }
    
    // If only count is requested, return count only
    if (countOnly) {
      try {
        const countQuery = conditions.length > 0 
          ? db.select({ count: count() }).from(ordersTable).where(and(...conditions))
          : db.select({ count: count() }).from(ordersTable);
        
        const [result] = await countQuery;
        console.log('Orders count result:', result);
        
        const response = NextResponse.json({
          success: true,
          count: result.count
        });
        
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
      } catch (error) {
        console.error('Error fetching orders count:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch orders count' },
          { status: 500 }
        );
      }
    }

    // Get orders with user details
    const baseQuery = db
      .select({
        id: ordersTable.id,
        userId: ordersTable.userId,
        status: ordersTable.status,
        subtotal: ordersTable.subtotal,
        tax: ordersTable.tax,
        deliveryFee: ordersTable.deliveryFee,
        total: ordersTable.total,
        deliveryAddress: ordersTable.deliveryAddress,
        paymentMethod: ordersTable.paymentMethod,
        paymentStatus: ordersTable.paymentStatus,
        estimatedDeliveryTime: ordersTable.estimatedDeliveryTime,
        actualDeliveryTime: ordersTable.actualDeliveryTime,
        trackingInfo: ordersTable.trackingInfo,
        notes: ordersTable.notes,
        createdAt: ordersTable.createdAt,
        updatedAt: ordersTable.updatedAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
        userPhone: usersTable.phone
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .orderBy(desc(ordersTable.createdAt));

    // Apply conditions and get results
    const orders = conditions.length > 0 
      ? await baseQuery.where(and(...conditions)).limit(limit).offset(offset)
      : await baseQuery.limit(limit).offset(offset);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select({
            id: orderItemsTable.id,
            foodItemId: orderItemsTable.foodItemId,
            quantity: orderItemsTable.quantity,
            price: orderItemsTable.price,
            specialInstructions: orderItemsTable.specialInstructions,
            foodItemName: foodItemsTable.name,
            foodItemImage: foodItemsTable.image
          })
          .from(orderItemsTable)
          .leftJoin(foodItemsTable, eq(orderItemsTable.foodItemId, foodItemsTable.id))
          .where(eq(orderItemsTable.orderId, order.id));

        const progress = OrderStatusManager.getOrderProgress(order.status);
        
        // Calculate time remaining if not delivered
        let timeRemaining = null;
        if (order.status !== 'delivered' && (order.trackingInfo as any)?.estimatedArrival) {
          const estimatedTime = new Date((order.trackingInfo as any).estimatedArrival);
          timeRemaining = OrderStatusManager.formatTimeRemaining(estimatedTime);
        }

        return {
          ...order,
          items,
          progress,
          timeRemaining
        };
      })
    );

    // Add cache-busting headers to prevent stale data
    const response = NextResponse.json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        totalCount: orders.length,
        hasNext: orders.length === limit,
        hasPrev: page > 1
      }
    });
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
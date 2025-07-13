import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/delivery/track/[orderId] - Get delivery tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get order details
    const order = await db
      .select()
      .from(ordersTable)
      .where(and(
        eq(ordersTable.id, orderId),
        eq(ordersTable.userId, userId)
      ))
      .limit(1)

    if (order.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    const orderData = order[0]

    // Mock delivery tracking data
    const trackingInfo = generateTrackingInfo(orderData)

    return NextResponse.json({
      success: true,
      tracking: trackingInfo
    })
  } catch (error) {
    console.error('Delivery tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get tracking info' },
      { status: 500 }
    )
  }
}

// POST /api/delivery/track/[orderId] - Update delivery tracking (for delivery drivers)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { driverId, location, status, estimatedArrival } = body

    // In a real app, verify driver permissions here

    // Update tracking info
    const trackingUpdate = {
      driverId,
      currentLocation: location ? JSON.stringify(location) : undefined,
      status,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      lastUpdate: new Date()
    }

    // Update order with tracking info
    await db
      .update(ordersTable)
      .set({
        trackingInfo: trackingUpdate,
        updatedAt: new Date()
      })
      .where(eq(ordersTable.id, orderId))

    // Send real-time update to customer
    await sendTrackingUpdate(orderId, trackingUpdate)

    return NextResponse.json({
      success: true,
      message: 'Tracking updated successfully',
      tracking: trackingUpdate
    })
  } catch (error) {
    console.error('Update tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tracking' },
      { status: 500 }
    )
  }
}

// Generate mock tracking information
function generateTrackingInfo(order: any) {
  const status = order.status
  const createdAt = new Date(order.createdAt)
  const estimatedDeliveryTime = new Date(order.estimatedDeliveryTime)
  
  // Generate timeline based on order status
  const timeline = []
  
  // Order placed
  timeline.push({
    status: 'order_placed',
    title: 'Order Placed',
    description: 'Your order has been received and is being processed',
    timestamp: createdAt.toISOString(),
    completed: true
  })

  // Order confirmed
  if (['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(status)) {
    const confirmedTime = new Date(createdAt.getTime() + 5 * 60 * 1000) // +5 minutes
    timeline.push({
      status: 'confirmed',
      title: 'Order Confirmed',
      description: 'Restaurant has confirmed your order',
      timestamp: confirmedTime.toISOString(),
      completed: true
    })
  }

  // Preparing
  if (['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(status)) {
    const preparingTime = new Date(createdAt.getTime() + 10 * 60 * 1000) // +10 minutes
    timeline.push({
      status: 'preparing',
      title: 'Food Being Prepared',
      description: 'Your delicious meal is being prepared by our chefs',
      timestamp: preparingTime.toISOString(),
      completed: true
    })
  }

  // Ready for pickup
  if (['ready', 'out_for_delivery', 'delivered'].includes(status)) {
    const readyTime = new Date(createdAt.getTime() + 25 * 60 * 1000) // +25 minutes
    timeline.push({
      status: 'ready',
      title: 'Order Ready',
      description: 'Your order is ready and will be picked up soon',
      timestamp: readyTime.toISOString(),
      completed: true
    })
  }

  // Out for delivery
  if (['out_for_delivery', 'delivered'].includes(status)) {
    const outForDeliveryTime = new Date(createdAt.getTime() + 30 * 60 * 1000) // +30 minutes
    timeline.push({
      status: 'out_for_delivery',
      title: 'Out for Delivery',
      description: 'Your order is on the way!',
      timestamp: outForDeliveryTime.toISOString(),
      completed: true,
      driver: {
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        vehicle: 'Honda Civic - ABC 123'
      }
    })
  }

  // Delivered
  if (status === 'delivered') {
    timeline.push({
      status: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      timestamp: estimatedDeliveryTime.toISOString(),
      completed: true
    })
  } else if (status === 'out_for_delivery') {
    // Add expected delivery
    timeline.push({
      status: 'delivery_expected',
      title: 'Delivery Expected',
      description: 'Your order should arrive soon',
      timestamp: estimatedDeliveryTime.toISOString(),
      completed: false,
      estimated: true
    })
  }

  // Mock current location for out_for_delivery orders
  let currentLocation = null
  if (status === 'out_for_delivery') {
    // Mock delivery location (moving towards customer)
    currentLocation = {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
      address: '123 Main St, New York, NY',
      lastUpdate: new Date().toISOString()
    }
  }

  return {
    orderId: order.id,
    status: order.status,
    estimatedDeliveryTime: estimatedDeliveryTime.toISOString(),
    timeline,
    currentLocation,
    driver: status === 'out_for_delivery' || status === 'delivered' ? {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      vehicle: 'Honda Civic - ABC 123',
      rating: 4.8,
      photo: '/api/placeholder/driver-photo.jpg'
    } : null
  }
}

// Send real-time tracking update
async function sendTrackingUpdate(orderId: string, trackingInfo: any) {
  try {
    // This would integrate with your real-time system
    await fetch('/api/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'delivery_update',
        orderId,
        data: {
          message: getDeliveryUpdateMessage(trackingInfo.status),
          location: trackingInfo.currentLocation,
          estimatedArrival: trackingInfo.estimatedArrival
        }
      })
    })
  } catch (error) {
    console.error('Failed to send tracking update:', error)
  }
}

function getDeliveryUpdateMessage(status: string): string {
  const messages = {
    'assigned': 'A driver has been assigned to your order',
    'picked_up': 'Your order has been picked up and is on the way',
    'nearby': 'Your delivery driver is nearby',
    'delivered': 'Your order has been delivered!'
  }
  
  return messages[status as keyof typeof messages] || 'Delivery status updated'
}
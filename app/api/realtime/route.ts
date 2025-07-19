import { NextRequest, NextResponse } from 'next/server'

// This is a simplified WebSocket implementation for real-time updates
// In production, you'd use a proper WebSocket server or service like Pusher

// Store active connections (in production, use Redis or similar)
const activeConnections = new Map<string, {
  userId: string
  orderId?: string
  lastPing: number
}>()

// POST /api/realtime - Send real-time update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, orderId, data } = body

    if (!type || !userId) {
      return NextResponse.json(
        { success: false, error: 'Type and userId required' },
        { status: 400 }
      )
    }

    console.log(`Realtime API: Received ${type} update for user ${userId}`, orderId ? `order ${orderId}` : '', data);

    // Broadcast update to connected clients
    const update = {
      type,
      userId,
      orderId,
      data,
      timestamp: new Date().toISOString()
    }

    // In a real implementation, this would push to WebSocket connections
    // For now, we'll store the update and clients can poll for it
    await broadcastUpdate(update)

    return NextResponse.json({
      success: true,
      message: 'Update broadcasted',
      update
    })
  } catch (error) {
    console.error('Realtime update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send update' },
      { status: 500 }
    )
  }
}

// GET /api/realtime - Get pending updates (polling fallback)
export async function GET(request: NextRequest) {
  try {
    // Use NextRequest's searchParams directly for better reliability
    const { searchParams } = request.nextUrl
    
    const userId = searchParams.get('userId')
    const since = searchParams.get('since') // ISO timestamp
    
    console.log(`Realtime GET: userId=${userId}, since=${since}`)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get updates since timestamp
    const updates = await getUpdatesForUser(userId, since || undefined)
    
    console.log(`Realtime GET: Found ${updates.length} updates for user ${userId}`)

    return NextResponse.json({
      success: true,
      updates,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get updates error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to get updates' },
      { status: 500 }
    )
  }
}

// Mock functions for real-time updates
// In production, these would use a proper message queue/WebSocket service

async function broadcastUpdate(update: any) {
  // Mock broadcast - in production, use WebSockets, Server-Sent Events, or Pusher
  console.log('Broadcasting update:', update)
  
  // Store update temporarily (in production, use Redis with TTL)
  const key = `updates:${update.userId}`
  if (!(global as any).pendingUpdates) {
    (global as any).pendingUpdates = new Map()
  }
  
  if (!(global as any).pendingUpdates.has(key)) {
    (global as any).pendingUpdates.set(key, [])
  }
  
  (global as any).pendingUpdates.get(key).push(update)
  
  console.log(`Stored update for user ${update.userId}. Total pending updates: ${(global as any).pendingUpdates.get(key).length}`);
  
  // Clean up old updates (keep only last 50)
  const userUpdates = (global as any).pendingUpdates.get(key)
  if (userUpdates.length > 50) {
    userUpdates.splice(0, userUpdates.length - 50)
  }
}

async function getUpdatesForUser(userId: string, since?: string) {
  try {
    const key = `updates:${userId}`
    
    if (!(global as any).pendingUpdates || !(global as any).pendingUpdates.has(key)) {
      console.log(`No pending updates found for user ${userId}`)
      return []
    }
    
    let updates = (global as any).pendingUpdates.get(key) || []
    console.log(`Found ${updates.length} total updates for user ${userId}`)
    
    // Filter by timestamp if provided
    if (since) {
      try {
        const sinceDate = new Date(since)
        if (isNaN(sinceDate.getTime())) {
          console.error(`Invalid date format: ${since}`)
          // Return all updates if date is invalid
          return updates
        }
        
        const originalCount = updates.length
        updates = updates.filter((update: any) => {
          if (!update.timestamp) {
            return true // Include updates without timestamp
          }
          const updateDate = new Date(update.timestamp)
          return updateDate > sinceDate
        })
        console.log(`Filtered from ${originalCount} to ${updates.length} updates since ${since}`)
      } catch (dateError) {
        console.error(`Error filtering by date: ${dateError}`)
        // Return all updates if filtering fails
        return updates
      }
    }
    
    return updates
  } catch (error) {
    console.error(`Error in getUpdatesForUser: ${error}`)
    return []
  }
}
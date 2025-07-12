/**
 * Server-Sent Events Broadcaster
 * Handles broadcasting notifications to connected clients
 */

// Store active SSE connections
const connections = new Map<string, { controller: ReadableStreamDefaultController, userId: string }>()

// Function to register a new connection
export function registerConnection(connectionId: string, controller: ReadableStreamDefaultController, userId: string) {
  connections.set(connectionId, { controller, userId })
}

// Function to unregister a connection
export function unregisterConnection(connectionId: string) {
  connections.delete(connectionId)
}

// Function to broadcast notification to specific user
export function broadcastToUser(userId: string, notification: any) {
  let deliveredCount = 0
  const connectionsToRemove: string[] = []

  for (const [connectionId, connection] of Array.from(connections.entries())) {
    if (connection.userId === userId) {
      try {
        connection.controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`)
        deliveredCount++
      } catch (error) {
        console.error('Failed to send notification to connection:', error)
        connectionsToRemove.push(connectionId)
      }
    }
  }

  // Clean up failed connections
  connectionsToRemove.forEach(id => connections.delete(id))

  console.log(`📡 Broadcast notification to ${deliveredCount} connections for user ${userId}`)
  return deliveredCount
}

// Function to broadcast notification to all users
export function broadcastToAll(notification: any) {
  let deliveredCount = 0
  const connectionsToRemove: string[] = []

  for (const [connectionId, connection] of Array.from(connections.entries())) {
    try {
      connection.controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`)
      deliveredCount++
    } catch (error) {
      console.error('Failed to send notification to connection:', error)
      connectionsToRemove.push(connectionId)
    }
  }

  // Clean up failed connections
  connectionsToRemove.forEach(id => connections.delete(id))

  console.log(`📡 Broadcast notification to ${deliveredCount} total connections`)
  return deliveredCount
}

// Function to get connection count for a user
export function getUserConnectionCount(userId: string): number {
  return Array.from(connections.values()).filter(conn => conn.userId === userId).length
}

// Function to get total connection count
export function getTotalConnectionCount(): number {
  return connections.size
}

// Function to get connection stats
export function getConnectionStats() {
  const userCounts = new Map<string, number>()
  
  for (const connection of Array.from(connections.values())) {
    const current = userCounts.get(connection.userId) || 0
    userCounts.set(connection.userId, current + 1)
  }

  return {
    total: connections.size,
    uniqueUsers: userCounts.size,
    userConnections: Object.fromEntries(userCounts)
  }
}
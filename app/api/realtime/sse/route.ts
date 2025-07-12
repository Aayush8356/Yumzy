import { NextRequest } from 'next/server'
import { registerConnection, unregisterConnection } from '@/lib/sse-broadcaster'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new Response('Missing userId parameter', { status: 400 })
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const connectionId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      registerConnection(connectionId, controller, userId)

      // Send initial connection message
      const welcomeMessage = {
        id: 'connection-established',
        type: 'system_notification',
        userId,
        title: 'Connected',
        message: 'Real-time notifications connected',
        timestamp: new Date().toISOString(),
        priority: 'low'
      }

      controller.enqueue(`data: ${JSON.stringify(welcomeMessage)}\n\n`)

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: {"type":"heartbeat","timestamp":"${new Date().toISOString()}"}\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          unregisterConnection(connectionId)
        }
      }, 30000) // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unregisterConnection(connectionId)
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { professionalNotificationSystem } from '@/lib/data/professional-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    const notificationId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark notification as read (with persistence)
    const success = professionalNotificationSystem.markAsRead(notificationId, userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark notification read API error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// Add new endpoint to dismiss notification permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    const notificationId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Dismiss notification permanently
    const success = professionalNotificationSystem.dismissNotification(notificationId, userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dismiss notification API error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss notification' },
      { status: 500 }
    )
  }
}
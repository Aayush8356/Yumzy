import { NextRequest, NextResponse } from 'next/server'
import { professionalNotificationSystem } from '@/lib/data/professional-notifications'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get professional notifications with proper state management
    const userNotifications = professionalNotificationSystem.getUserNotifications(userId)
    const unreadCount = professionalNotificationSystem.getUnreadCount(userId)

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      count: userNotifications.length,
      unreadCount
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, message, data, isImportant } = body

    // Create new notification
    const notification = professionalNotificationSystem.createNotification({
      userId,
      type: type || 'order_update',
      title,
      message,
      data,
      isImportant: isImportant || false,
      isPersistent: true // Order notifications should persist
    })

    console.log(`📬 Created notification for user ${userId}: ${title}`)

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Create notification API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear all non-persistent notifications
    professionalNotificationSystem.clearAllNotifications(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear notifications' },
      { status: 500 }
    )
  }
}
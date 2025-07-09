import { NextRequest, NextResponse } from 'next/server'
import { professionalNotificationSystem } from '@/lib/data/professional-notifications'

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark all notifications as read for the user (with persistence)
    professionalNotificationSystem.markAllAsRead(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all notifications read API error:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}
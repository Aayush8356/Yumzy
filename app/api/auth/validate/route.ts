import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists in database
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        avatar: usersTable.avatar,
        role: usersTable.role,
        isVerified: usersTable.isVerified,
        preferences: usersTable.preferences,
        createdAt: usersTable.createdAt
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found', userExists: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User is valid',
      user: users[0],
      userExists: true
    })

  } catch (error) {
    console.error('User validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate user', userExists: false },
      { status: 500 }
    )
  }
}
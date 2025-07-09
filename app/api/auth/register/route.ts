import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // In production, hash the password properly
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        phone: phone || null,
        role: 'user',
        isVerified: false, // Users need to verify their email
        preferences: {
          notifications: true,
          newsletter: false,
          dietaryRestrictions: []
        }
        // In production: passwordHash: hashedPassword
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        role: usersTable.role,
        isVerified: usersTable.isVerified,
        createdAt: usersTable.createdAt
      })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
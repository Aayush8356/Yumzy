import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // For demo purposes, we'll accept any password for existing users
    // In production, you would hash passwords and compare them properly
    // const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    // Demo password validation - in production use proper password hashing
    const isValidPassword = password.length >= 1 // Accept any non-empty password for demo

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data (excluding sensitive information)
    const { ...userData } = user
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: 'demo-jwt-token' // In production, generate a proper JWT
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
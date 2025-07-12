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
    let users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    // Auto-create demo users if they don't exist and demo is enabled
    const isDemoEnabled = process.env.ENABLE_DEMO_DATA === 'true' || process.env.SEED_DEMO_DATA === 'true'
    
    if (users.length === 0 && isDemoEnabled) {
      // Check if this is a demo user email
      const demoUsers = {
        'demo@yumzy.com': {
          email: 'demo@yumzy.com',
          name: 'Demo User',
          phone: '+1 (555) 987-6543',
          role: 'user',
          isVerified: true,
          preferences: {
            notifications: true,
            newsletter: false,
            dietaryRestrictions: ['Vegetarian'],
          },
        },
        'guptaaayush537@gmail.com': {
          email: 'guptaaayush537@gmail.com',
          name: 'Aayush Gupta',
          phone: '+1 (555) 123-4567',
          role: 'admin',
          isVerified: true,
          preferences: {
            notifications: true,
            newsletter: true,
            dietaryRestrictions: [],
          },
        }
      }

      if (demoUsers[email as keyof typeof demoUsers]) {
        // Create the demo user
        const newUser = await db
          .insert(usersTable)
          .values(demoUsers[email as keyof typeof demoUsers])
          .returning()
        
        users = newUser
        console.log(`✅ Auto-created demo user: ${email}`)
      } else {
        // For any other email in demo mode, create a generic demo user
        const genericDemoUser = {
          email: email,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          phone: '+1 (555) 000-0000',
          role: 'user',
          isVerified: true,
          preferences: {
            notifications: true,
            newsletter: false,
            dietaryRestrictions: [],
          },
        }

        const newUser = await db
          .insert(usersTable)
          .values(genericDemoUser)
          .returning()
        
        users = newUser
        console.log(`✅ Auto-created generic demo user: ${email}`)
      }
    } else if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check password (demo mode vs production)
    let isValidPassword = false
    
    if (isDemoEnabled && !user.passwordHash) {
      // Demo mode: accept any non-empty password for users without passwordHash
      isValidPassword = password.length >= 1
    } else if (user.passwordHash) {
      // Production mode: verify against hashed password
      const { PasswordManager } = await import('@/lib/auth')
      isValidPassword = await PasswordManager.verify(password, user.passwordHash)
    } else {
      // User exists but no password set
      isValidPassword = false
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified (skip check for demo users or admin)
    if (!user.isVerified && user.role !== 'admin' && !isDemoEnabled) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        },
        { status: 403 }
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
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PasswordManager, SessionManager, RateLimiter } from '@/lib/auth'
import { userValidation, validateWithSchema, DataSanitizer } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for registration
    const clientId = RateLimiter.getClientIdentifier(request)
    if (!RateLimiter.check(clientId, 3, 60 * 60 * 1000)) { // 3 registrations per hour
      return NextResponse.json(
        { success: false, error: 'Registration limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateWithSchema(userValidation.register, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { name, email, password, phone, preferences } = validation.data!
    
    // Sanitize inputs
    const sanitizedEmail = DataSanitizer.sanitizeEmail(email)
    const sanitizedName = DataSanitizer.sanitizeString(name)

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, sanitizedEmail))
      .limit(1)

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await PasswordManager.hash(password)

    // Create user
    const newUser = {
      name: sanitizedName,
      email: sanitizedEmail,
      passwordHash: hashedPassword,
      phone: phone || null,
      role: 'user' as const,
      isVerified: process.env.NODE_ENV !== 'production', // Auto-verify in development
      preferences: {
        notifications: preferences?.notifications ?? true,
        newsletter: preferences?.newsletter ?? false,
        dietaryRestrictions: preferences?.dietaryRestrictions ?? []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const [createdUser] = await db
      .insert(usersTable)
      .values(newUser)
      .returning()

    // Create session for immediate login
    const session = SessionManager.createSession(createdUser)

    // Set secure cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: session.user,
      token: session.token, // Remove this in production
      requiresVerification: !createdUser.isVerified
    }, { status: 201 })

    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle duplicate email constraint
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
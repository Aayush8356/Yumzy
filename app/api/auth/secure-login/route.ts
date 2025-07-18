import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PasswordManager, SessionManager, RateLimiter } from '@/lib/auth'
import { userValidation, validateWithSchema, DataSanitizer } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - more lenient for production
    const clientId = RateLimiter.getClientIdentifier(request)
    if (!RateLimiter.check(clientId, 20, 5 * 60 * 1000)) { // 20 requests per 5 minutes
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateWithSchema(userValidation.login, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data!
    const sanitizedEmail = DataSanitizer.sanitizeEmail(email)

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, sanitizedEmail))
      .limit(1)

    if (users.length === 0) {
      // Don't reveal if user exists - security best practice
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // For production: verify password hash
    let isValidPassword = false
    
    if (user.passwordHash) {
      // Production password verification
      isValidPassword = await PasswordManager.verify(password, user.passwordHash)
    } else {
      isValidPassword = false
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is verified (allow unverified users for first 7 days or admin users)
    const accountAge = user.createdAt ? Date.now() - new Date(user.createdAt).getTime() : 0
    const gracePeriod = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    
    if (!user.isVerified && user.role !== 'admin' && accountAge > gracePeriod && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please verify your email address. Check your inbox for the verification link.',
          code: 'EMAIL_NOT_VERIFIED',
          gracePeriodExpired: true
        },
        { status: 401 }
      )
    }

    // Create secure session
    const session = SessionManager.createSession(user)

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: session.user,
      token: session.token // Remove this in production, use HTTP-only cookies instead
    })

    // Set secure cookie
    response.cookies.set('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to allow cross-origin cookies
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    // Add verification reminder if user is unverified but within grace period
    if (!user.isVerified && user.role !== 'admin' && process.env.NODE_ENV === 'production') {
      const daysLeft = Math.ceil((gracePeriod - accountAge) / (24 * 60 * 60 * 1000))
      response.headers.set('X-Verification-Reminder', `Please verify your email. ${daysLeft} days remaining.`)
    }

    return response

  } catch (error) {
    console.error('Secure login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Password reset endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword, resetToken } = body

    // Validate input
    if (!email || !newPassword || !resetToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = PasswordManager.validate(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // In production, verify reset token here
    // For now, just hash and update password
    const hashedPassword = await PasswordManager.hash(newPassword)

    await db
      .update(usersTable)
      .set({ passwordHash: hashedPassword })
      .where(eq(usersTable.email, email))

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
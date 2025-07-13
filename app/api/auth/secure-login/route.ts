import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PasswordManager, SessionManager, RateLimiter } from '@/lib/auth'
import { userValidation, validateWithSchema, DataSanitizer } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started')
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    })

    // Rate limiting - more lenient for production
    const clientId = RateLimiter.getClientIdentifier(request)
    if (!RateLimiter.check(clientId, 20, 5 * 60 * 1000)) { // 20 requests per 5 minutes
      console.log('❌ Rate limit exceeded for client:', clientId)
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    console.log('📧 Login attempt for email:', body.email)
    
    // Validate input
    const validation = validateWithSchema(userValidation.login, body)
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.errors)
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data!
    const sanitizedEmail = DataSanitizer.sanitizeEmail(email)
    console.log('🔍 Searching for user:', sanitizedEmail)

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, sanitizedEmail))
      .limit(1)

    console.log('👤 Users found:', users.length)

    if (users.length === 0) {
      console.log('❌ User not found')
      // Don't reveal if user exists - security best practice
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log('👤 User found:', { id: user.id, email: user.email, hasPasswordHash: !!user.passwordHash })

    // For production: verify password hash
    let isValidPassword = false
    
    if (user.passwordHash) {
      console.log('🔐 Verifying password hash...')
      // Production password verification
      isValidPassword = await PasswordManager.verify(password, user.passwordHash)
      console.log('🔐 Password verification result:', isValidPassword)
    } else {
      console.log('⚠️ No password hash found for user')
      // Demo mode fallback (only for development)
      const isDemoMode = process.env.NODE_ENV !== 'production' && 
                        (process.env.ENABLE_DEMO_DATA === 'true' || user.email.includes('demo'))
      
      if (isDemoMode) {
        isValidPassword = password.length >= 3 // Minimal demo validation
        console.warn('⚠️ Using demo mode password validation - NOT FOR PRODUCTION')
      } else {
        isValidPassword = false
      }
    }

    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is verified (for production)
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Please verify your email before logging in' },
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
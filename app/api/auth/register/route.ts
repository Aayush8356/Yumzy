import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ErrorHandler, ValidationError } from '@/lib/error-handler'
import { PasswordManager, RateLimiter } from '@/lib/auth'
import { auditLogger } from '@/lib/audit-logger'
import { emailService } from '@/lib/email'
import { userValidation } from '@/lib/validation'

export async function POST(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json()
    
    const validation = userValidation.register.safeParse(body)
    if (!validation.success) {
      throw new ValidationError('Invalid input data', validation.error.errors)
    }

    const { name, email, phone, password } = validation.data!

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting for registrations
    const clientId = RateLimiter.getClientIdentifier(request)
    if (!RateLimiter.check(clientId, 5, 60 * 60 * 1000)) { // 5 registrations per hour
      await auditLogger.logRateLimitExceeded(
        ipAddress,
        userAgent,
        '/api/auth/register'
      )
      
      throw new ValidationError('Too many registration attempts. Please try again later.')
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)

    if (existingUsers.length > 0) {
      // Log potential account enumeration attempt
      await auditLogger.logSecurity({
        type: 'suspicious_activity',
        ipAddress,
        userAgent,
        details: { 
          action: 'registration_duplicate_email',
          email: email.toLowerCase() 
        },
        severity: 'low',
        timestamp: new Date()
      })

      throw new ValidationError('An account with this email already exists')
    }

    // Hash password
    const hashedPassword = await PasswordManager.hash(password)

    // Generate email verification token
    const verificationToken = Math.random().toString(36).substring(2) + 
                             Date.now().toString(36) + 
                             Math.random().toString(36).substring(2)
    
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash: hashedPassword,
        role: 'user',
        isVerified: process.env.NODE_ENV !== 'production' || process.env.SKIP_EMAIL_VERIFICATION === 'true',
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        preferences: {
          notifications: true,
          newsletter: false,
          dietaryRestrictions: []
        }
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

    // Send verification email
    try {
      await emailService.sendEmailVerification(newUser.email, verificationToken, newUser.name)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

    // Log successful registration
    await auditLogger.log({
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'user_registered',
      resource: 'user_account',
      resourceId: newUser.id,
      method: 'POST',
      endpoint: '/api/auth/register',
      ipAddress,
      userAgent,
      success: true,
      severity: 'low',
      category: 'authentication'
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      }
    })
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { ErrorHandler, ValidationError, NotFoundError } from '@/lib/error-handler'
import { auditLogger } from '@/lib/audit-logger'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json()
    const { token } = body

    if (!token) {
      throw new ValidationError('Verification token is required')
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find user with valid verification token
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.emailVerificationToken, token),
          gt(usersTable.emailVerificationExpires, new Date())
        )
      )
      .limit(1)

    if (users.length === 0) {
      await auditLogger.logSecurity({
        type: 'suspicious_activity',
        ipAddress,
        userAgent,
        details: { 
          action: 'invalid_verification_token',
          token: token.substring(0, 10) + '...' 
        },
        severity: 'medium',
        timestamp: new Date()
      })

      throw new NotFoundError('Invalid or expired verification token')
    }

    const user = users[0]

    // Update user as verified and clear verification token
    await db
      .update(usersTable)
      .set({
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, user.id))

    // Log successful verification
    await auditLogger.logSecurity({
      type: 'account_creation',
      userId: user.id,
      userEmail: user.email,
      ipAddress,
      userAgent,
      details: { 
        action: 'email_verified',
        verifiedAt: new Date().toISOString()
      },
      severity: 'low',
      timestamp: new Date()
    })

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to Yumzy.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: true
      }
    })
  })
}

// Resend verification email
export async function PUT(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json()
    const { email } = body

    if (!email) {
      throw new ValidationError('Email is required')
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find unverified user
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, email.toLowerCase()),
          eq(usersTable.isVerified, false)
        )
      )
      .limit(1)

    if (users.length === 0) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an unverified account exists with this email, a verification email has been sent.'
      })
    }

    const user = users[0]

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2) + 
                            Date.now().toString(36) + 
                            Math.random().toString(36).substring(2)
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await db
      .update(usersTable)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, user.id))

    // Send verification email
    await emailService.sendEmailVerification(user.email, verificationToken, user.name)

    // Log resend activity
    await auditLogger.log({
      userId: user.id,
      userEmail: user.email,
      action: 'resend_verification_email',
      resource: 'email_verification',
      resourceId: user.email,
      method: 'PUT',
      endpoint: '/api/auth/verify-email',
      ipAddress,
      userAgent,
      success: true,
      severity: 'low',
      category: 'authentication'
    })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    })
  })
}
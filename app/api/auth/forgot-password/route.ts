import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ErrorHandler, ValidationError } from '@/lib/error-handler'
import { auditLogger } from '@/lib/audit-logger'
import { emailService } from '@/lib/email'
import { RateLimiter } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    // Rate limiting for password reset requests
    const clientId = RateLimiter.getClientIdentifier(request)
    if (!RateLimiter.check(clientId, 3, 60 * 60 * 1000)) { // 3 requests per hour
      await auditLogger.logRateLimitExceeded(
        ipAddress,
        userAgent,
        '/api/auth/forgot-password'
      )
      
      throw new ValidationError('Too many password reset requests. Please try again later.')
    }

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)

    // Always return success to prevent email enumeration
    const successMessage = 'If an account exists with this email, you will receive password reset instructions.'

    if (users.length === 0) {
      // Log potential email enumeration attempt
      await auditLogger.logSecurity({
        type: 'suspicious_activity',
        ipAddress,
        userAgent,
        details: { 
          action: 'password_reset_nonexistent_email',
          email: email.toLowerCase() 
        },
        severity: 'low',
        timestamp: new Date()
      })

      return NextResponse.json({
        success: true,
        message: successMessage
      })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2) + 
                      Date.now().toString(36) + 
                      Math.random().toString(36).substring(2)
    
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await db
      .update(usersTable)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, user.id))

    // Send password reset email
    await emailService.sendPasswordReset(user.email, resetToken, user.name)

    // Log password reset request
    await auditLogger.log({
      userId: user.id,
      userEmail: user.email,
      action: 'password_reset_requested',
      resource: 'user_account',
      resourceId: user.id,
      method: 'POST',
      endpoint: '/api/auth/forgot-password',
      ipAddress,
      userAgent,
      success: true,
      severity: 'medium',
      category: 'authentication'
    })

    return NextResponse.json({
      success: true,
      message: successMessage
    })
  })
}
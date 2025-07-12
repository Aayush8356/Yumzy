import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { ErrorHandler, ValidationError, NotFoundError } from '@/lib/error-handler'
import { auditLogger } from '@/lib/audit-logger'
import { PasswordManager } from '@/lib/auth'

export async function POST(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token) {
      throw new ValidationError('Reset token is required')
    }

    if (!newPassword) {
      throw new ValidationError('New password is required')
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long')
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Find user with valid reset token
    const users = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.passwordResetToken, token),
          gt(usersTable.passwordResetExpires, new Date())
        )
      )
      .limit(1)

    if (users.length === 0) {
      await auditLogger.logSecurity({
        type: 'suspicious_activity',
        ipAddress,
        userAgent,
        details: { 
          action: 'invalid_password_reset_token',
          token: token.substring(0, 10) + '...' 
        },
        severity: 'medium',
        timestamp: new Date()
      })

      throw new NotFoundError('Invalid or expired reset token')
    }

    const user = users[0]

    // Hash the new password
    const hashedPassword = await PasswordManager.hash(newPassword)

    // Update user password and clear reset token
    await db
      .update(usersTable)
      .set({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, user.id))

    // Log successful password reset
    await auditLogger.logSecurity({
      type: 'password_change',
      userId: user.id,
      userEmail: user.email,
      ipAddress,
      userAgent,
      details: { 
        action: 'password_reset_completed',
        resetAt: new Date().toISOString()
      },
      severity: 'medium',
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    })
  })
}
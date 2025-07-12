// Production-ready authentication utilities
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

// Environment variables with fallbacks for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Password hashing utilities
export class PasswordManager {
  static async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, BCRYPT_ROUNDS)
    } catch (error) {
      console.error('Password hashing error:', error)
      throw new Error('Failed to hash password')
    }
  }

  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// JWT token utilities
export class TokenManager {
  static generate(payload: any): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'yumzy-app',
        audience: 'yumzy-users'
      } as jwt.SignOptions)
    } catch (error) {
      console.error('Token generation error:', error)
      throw new Error('Failed to generate token')
    }
  }

  static verify(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'yumzy-app',
        audience: 'yumzy-users'
      })
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      } else {
        console.error('Token verification error:', error)
        throw new Error('Token verification failed')
      }
    }
  }

  static decode(token: string): any {
    try {
      return jwt.decode(token)
    } catch (error) {
      console.error('Token decode error:', error)
      return null
    }
  }

  static extractFromRequest(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Fallback to cookies
    const tokenCookie = request.cookies.get('auth-token')
    if (tokenCookie) {
      return tokenCookie.value
    }

    return null
  }
}

// Session management
export class SessionManager {
  static createSession(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      sessionId: this.generateSessionId()
    }

    return {
      token: TokenManager.generate(payload),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  }

  static validateSession(token: string): { isValid: boolean; user?: any; error?: string } {
    try {
      const decoded = TokenManager.verify(token)
      return {
        isValid: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          sessionId: decoded.sessionId
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Session validation failed'
      }
    }
  }

  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Authentication middleware
export class AuthMiddleware {
  static async validateUser(request: NextRequest): Promise<{ isValid: boolean; user?: any; error?: string }> {
    try {
      const token = TokenManager.extractFromRequest(request)
      
      if (!token) {
        return { isValid: false, error: 'No authentication token provided' }
      }

      return SessionManager.validateSession(token)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return { isValid: false, error: 'Authentication failed' }
    }
  }

  static async requireAuth(request: NextRequest): Promise<{ user: any } | { error: string; status: number }> {
    const validation = await this.validateUser(request)
    
    if (!validation.isValid) {
      return { error: validation.error || 'Unauthorized', status: 401 }
    }

    return { user: validation.user }
  }

  static async requireAdmin(request: NextRequest): Promise<{ user: any } | { error: string; status: number }> {
    const authResult = await this.requireAuth(request)
    
    if ('error' in authResult) {
      return authResult
    }

    if (authResult.user.role !== 'admin') {
      return { error: 'Admin access required', status: 403 }
    }

    return authResult
  }
}

// Rate limiting (simple in-memory implementation)
interface RateLimitEntry {
  count: number
  resetTime: number
}

export class RateLimiter {
  private static requests = new Map<string, RateLimitEntry>()
  
  static check(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const entry = this.requests.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }
    
    if (entry.count >= maxRequests) {
      return false
    }
    
    entry.count++
    return true
  }
  
  static getClientIdentifier(request: NextRequest): string {
    // Use IP address as identifier
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown'
    return ip
  }
}
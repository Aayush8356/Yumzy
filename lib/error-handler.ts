import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Error types
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

// Error logger
export class ErrorLogger {
  static log(error: Error, context?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const errorInfo = {
      timestamp,
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        code: error.code
      }),
      context
    }

    // In production, you would send this to a logging service
    // For now, we'll use console.error with structured logging
    if (process.env.NODE_ENV === 'production') {
      // Only log operational errors and server errors in production
      if (error instanceof AppError && !error.isOperational) {
        console.error('🚨 Non-operational error:', JSON.stringify(errorInfo, null, 2))
      } else if (!(error instanceof AppError)) {
        console.error('🚨 Unexpected error:', JSON.stringify(errorInfo, null, 2))
      }
    } else {
      // Log all errors in development
      console.error('🐛 Error:', JSON.stringify(errorInfo, null, 2))
    }
  }

  static logActivity(activity: string, details?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📝 ${activity}:`, details ? JSON.stringify(details, null, 2) : '')
    }
  }
}

// Error response formatter
export class ErrorHandler {
  static formatError(error: Error): {
    message: string
    code?: string
    statusCode: number
    details?: any
  } {
    // Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        if (!acc[path]) acc[path] = []
        acc[path].push(err.message)
        return acc
      }, {} as Record<string, string[]>)

      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details
      }
    }

    // Custom app errors
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      }
    }

    // Database errors
    if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
      return {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        statusCode: 409
      }
    }

    if (error.message.includes('foreign key constraint')) {
      return {
        message: 'Referenced resource not found',
        code: 'REFERENCE_ERROR',
        statusCode: 400
      }
    }

    // Default to internal server error
    return {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500
    }
  }

  static createErrorResponse(error: Error, context?: Record<string, any>): NextResponse {
    // Log the error
    ErrorLogger.log(error, context)

    // Format the error
    const formattedError = this.formatError(error)

    // Create response
    const response = {
      success: false,
      error: formattedError.message,
      code: formattedError.code,
      ...(formattedError.details && { details: formattedError.details }),
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(response, { status: formattedError.statusCode })
  }

  static async handleAsyncError<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | NextResponse> {
    try {
      return await operation()
    } catch (error) {
      return this.createErrorResponse(error as Error, context)
    }
  }
}

// API error wrapper utility
export function withErrorHandler(handler: Function) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return ErrorHandler.createErrorResponse(
        error as Error,
        {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        }
      )
    }
  }
}

// Type-safe error response
export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  stack?: string
  timestamp?: string
}

export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse
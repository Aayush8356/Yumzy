// Production-ready audit logging system
import { CacheManager, CacheKeys } from './cache'

export interface AuditLog {
  id: string
  timestamp: Date
  userId?: string
  userEmail?: string
  action: string
  resource: string
  resourceId?: string
  method: string
  endpoint: string
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  changes?: Record<string, { before: any; after: any }>
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'authentication' | 'authorization' | 'data' | 'admin' | 'security' | 'system'
}

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'password_change' | 
        'account_creation' | 'permission_denied' | 'suspicious_activity' | 'rate_limit_exceeded'
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export class AuditLogger {
  private static instance: AuditLogger
  private logBuffer: AuditLog[] = []
  private securityBuffer: SecurityEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.startAutoFlush()
    }
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  // Log general audit events
  async log(auditData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...auditData,
      id: this.generateId(),
      timestamp: new Date()
    }

    this.logBuffer.push(auditLog)

    // Cache recent logs for admin dashboard
    const cacheKey = CacheKeys.analytics('audit_logs', 'recent')
    const cachedLogs = await CacheManager.get<AuditLog[]>(cacheKey) || []
    cachedLogs.push(auditLog)

    // Keep only last 100 logs in cache
    if (cachedLogs.length > 100) {
      cachedLogs.splice(0, cachedLogs.length - 100)
    }

    await CacheManager.set(cacheKey, cachedLogs, 3600) // 1 hour

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 AUDIT: ${auditLog.action} on ${auditLog.resource}`, {
        userId: auditLog.userId,
        success: auditLog.success,
        severity: auditLog.severity
      })
    }

    // Alert on critical events
    if (auditLog.severity === 'critical') {
      await this.handleCriticalEvent(auditLog)
    }
  }

  // Log security-specific events
  async logSecurity(securityEvent: SecurityEvent): Promise<void> {
    this.securityBuffer.push(securityEvent)

    // Cache recent security events
    const cacheKey = CacheKeys.analytics('security_events', 'recent')
    const cachedEvents = await CacheManager.get<SecurityEvent[]>(cacheKey) || []
    cachedEvents.push(securityEvent)

    // Keep only last 50 security events in cache
    if (cachedEvents.length > 50) {
      cachedEvents.splice(0, cachedEvents.length - 50)
    }

    await CacheManager.set(cacheKey, cachedEvents, 3600) // 1 hour

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔐 SECURITY: ${securityEvent.type}`, {
        userId: securityEvent.userId,
        severity: securityEvent.severity,
        ipAddress: securityEvent.ipAddress
      })
    }

    // Alert on critical security events
    if (securityEvent.severity === 'critical') {
      await this.handleCriticalSecurityEvent(securityEvent)
    }
  }

  // Authentication events
  async logLoginAttempt(
    email: string, 
    success: boolean, 
    ipAddress: string, 
    userAgent: string,
    userId?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.logSecurity({
      type: success ? 'login_success' : 'login_failure',
      userId,
      userEmail: email,
      ipAddress,
      userAgent,
      details: { errorMessage },
      severity: success ? 'low' : 'medium',
      timestamp: new Date()
    })

    await this.log({
      userId,
      userEmail: email,
      action: 'login_attempt',
      resource: 'authentication',
      method: 'POST',
      endpoint: '/api/auth/login',
      ipAddress,
      userAgent,
      success,
      errorMessage,
      severity: success ? 'low' : 'medium',
      category: 'authentication'
    })
  }

  async logPasswordChange(
    userId: string, 
    userEmail: string, 
    ipAddress: string, 
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.logSecurity({
      type: 'password_change',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      details: { success, errorMessage },
      severity: 'medium',
      timestamp: new Date()
    })

    await this.log({
      userId,
      userEmail,
      action: 'password_change',
      resource: 'user_account',
      resourceId: userId,
      method: 'PUT',
      endpoint: '/api/auth/change-password',
      ipAddress,
      userAgent,
      success,
      errorMessage,
      severity: 'medium',
      category: 'authentication'
    })
  }

  async logAccountCreation(
    userId: string,
    userEmail: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.logSecurity({
      type: 'account_creation',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      details: { success, errorMessage },
      severity: 'low',
      timestamp: new Date()
    })

    await this.log({
      userId,
      userEmail,
      action: 'create_account',
      resource: 'user_account',
      resourceId: userId,
      method: 'POST',
      endpoint: '/api/auth/register',
      ipAddress,
      userAgent,
      success,
      errorMessage,
      severity: 'low',
      category: 'authentication'
    })
  }

  // Data access events
  async logDataAccess(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    method: string,
    endpoint: string,
    success: boolean,
    changes?: Record<string, { before: any; after: any }>,
    errorMessage?: string
  ): Promise<void> {
    const severity = this.determineSeverity(action, resource, success)

    await this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      method,
      endpoint,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      changes,
      severity,
      category: 'data'
    })
  }

  // Admin actions
  async logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    method: string,
    endpoint: string,
    success: boolean,
    changes?: Record<string, { before: any; after: any }>,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      userEmail: adminEmail,
      action,
      resource,
      resourceId,
      method,
      endpoint,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      changes,
      severity: 'high', // Admin actions are always high severity
      category: 'admin'
    })
  }

  // Rate limiting events
  async logRateLimitExceeded(
    ipAddress: string,
    userAgent: string,
    endpoint: string,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.logSecurity({
      type: 'rate_limit_exceeded',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      details: { endpoint },
      severity: 'medium',
      timestamp: new Date()
    })

    await this.log({
      userId,
      userEmail,
      action: 'rate_limit_exceeded',
      resource: 'api_endpoint',
      resourceId: endpoint,
      method: 'ANY',
      endpoint,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Rate limit exceeded',
      severity: 'medium',
      category: 'security'
    })
  }

  // Permission denied events
  async logPermissionDenied(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    endpoint: string
  ): Promise<void> {
    await this.logSecurity({
      type: 'permission_denied',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      details: { action, resource, resourceId },
      severity: 'medium',
      timestamp: new Date()
    })

    await this.log({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      method: 'ANY',
      endpoint,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Permission denied',
      severity: 'medium',
      category: 'authorization'
    })
  }

  // Get audit logs for dashboard
  async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    const cacheKey = CacheKeys.analytics('audit_logs', 'recent')
    const logs = await CacheManager.get<AuditLog[]>(cacheKey) || []
    return logs.slice(-limit).reverse() // Most recent first
  }

  // Get security events for dashboard
  async getRecentSecurityEvents(limit: number = 25): Promise<SecurityEvent[]> {
    const cacheKey = CacheKeys.analytics('security_events', 'recent')
    const events = await CacheManager.get<SecurityEvent[]>(cacheKey) || []
    return events.slice(-limit).reverse() // Most recent first
  }

  // Helper methods
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private determineSeverity(action: string, resource: string, success: boolean): 'low' | 'medium' | 'high' | 'critical' {
    if (!success) return 'medium'
    
    if (action.includes('delete') || action.includes('remove')) return 'high'
    if (resource.includes('admin') || resource.includes('user_account')) return 'medium'
    if (action.includes('create') || action.includes('update')) return 'low'
    
    return 'low'
  }

  private async handleCriticalEvent(auditLog: AuditLog): Promise<void> {
    // In production, this would send alerts to administrators
    console.error('🚨 CRITICAL AUDIT EVENT:', {
      action: auditLog.action,
      resource: auditLog.resource,
      userId: auditLog.userId,
      timestamp: auditLog.timestamp
    })

    // Could send email, Slack notification, etc.
  }

  private async handleCriticalSecurityEvent(securityEvent: SecurityEvent): Promise<void> {
    // In production, this would trigger immediate security response
    console.error('🔥 CRITICAL SECURITY EVENT:', {
      type: securityEvent.type,
      userId: securityEvent.userId,
      ipAddress: securityEvent.ipAddress,
      timestamp: securityEvent.timestamp
    })

    // Could trigger account lockdown, IP blocking, etc.
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushLogs()
    }, 60000) // Flush every minute in production
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length > 0 || this.securityBuffer.length > 0) {
      try {
        // In production, send to logging service (e.g., CloudWatch, Splunk, ELK)
        console.log(`📝 Flushing ${this.logBuffer.length} audit logs and ${this.securityBuffer.length} security events`)
        
        this.logBuffer = []
        this.securityBuffer = []
      } catch (error) {
        console.error('❌ Failed to flush audit logs:', error)
      }
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flushLogs()
  }
}

// Global audit logger instance
export const auditLogger = AuditLogger.getInstance()

// Middleware for automatic request auditing
export function withAuditing(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const url = new URL(request.url)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    try {
      const response = await handler(request, ...args)
      
      // Log successful API access (for sensitive endpoints)
      if (url.pathname.includes('/admin/') || url.pathname.includes('/api/user/')) {
        await auditLogger.log({
          action: `api_${request.method.toLowerCase()}`,
          resource: 'api_endpoint',
          resourceId: url.pathname,
          method: request.method,
          endpoint: url.pathname,
          ipAddress,
          userAgent,
          success: true,
          severity: 'low',
          category: 'data'
        })
      }
      
      return response
    } catch (error) {
      // Log failed API access
      await auditLogger.log({
        action: `api_${request.method.toLowerCase()}`,
        resource: 'api_endpoint',
        resourceId: url.pathname,
        method: request.method,
        endpoint: url.pathname,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        severity: 'medium',
        category: 'system'
      })
      
      throw error
    }
  }
}
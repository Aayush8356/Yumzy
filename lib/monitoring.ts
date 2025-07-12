// Production monitoring and analytics system
import { CacheManager, CacheKeys, CACHE_TTL } from './cache'

export interface MetricData {
  timestamp: Date
  value: number
  labels?: Record<string, string>
  metadata?: Record<string, any>
}

export interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId?: string
  properties?: Record<string, any>
  timestamp: Date
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  labels?: Record<string, string>
}

// Analytics and Monitoring Manager
export class MonitoringManager {
  private static instance: MonitoringManager
  private metricsBuffer: MetricData[] = []
  private eventsBuffer: AnalyticsEvent[] = []
  private bufferFlushInterval: NodeJS.Timeout | null = null

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.startBufferFlush()
    }
  }

  static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager()
    }
    return MonitoringManager.instance
  }

  // Track application metrics
  async trackMetric(
    name: string, 
    value: number, 
    labels?: Record<string, string>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: MetricData = {
      timestamp: new Date(),
      value,
      labels,
      metadata
    }

    this.metricsBuffer.push(metric)

    // Also cache recent metrics for dashboard
    const cacheKey = CacheKeys.analytics(name, 'recent')
    const cachedMetrics = await CacheManager.get<MetricData[]>(cacheKey) || []
    cachedMetrics.push(metric)

    // Keep only last 100 metrics
    if (cachedMetrics.length > 100) {
      cachedMetrics.splice(0, cachedMetrics.length - 100)
    }

    await CacheManager.set(cacheKey, cachedMetrics, CACHE_TTL.ANALYTICS)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Metric tracked: ${name} = ${value}`, labels)
    }
  }

  // Track user events
  async trackEvent(
    event: string,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      sessionId: this.generateSessionId(),
      properties,
      timestamp: new Date()
    }

    this.eventsBuffer.push(analyticsEvent)

    // Cache events for real-time dashboard
    const cacheKey = CacheKeys.analytics('events', 'recent')
    const cachedEvents = await CacheManager.get<AnalyticsEvent[]>(cacheKey) || []
    cachedEvents.push(analyticsEvent)

    // Keep only last 50 events
    if (cachedEvents.length > 50) {
      cachedEvents.splice(0, cachedEvents.length - 50)
    }

    await CacheManager.set(cacheKey, cachedEvents, CACHE_TTL.ANALYTICS)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎯 Event tracked: ${event}`, { userId, properties })
    }
  }

  // Track performance metrics
  async trackPerformance(
    name: string,
    startTime: number,
    labels?: Record<string, string>
  ): Promise<void> {
    const duration = Date.now() - startTime
    await this.trackMetric(`performance.${name}`, duration, {
      ...labels,
      unit: 'milliseconds'
    })
  }

  // Track API response times
  async trackApiPerformance(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number
  ): Promise<void> {
    await this.trackMetric('api.response_time', responseTime, {
      endpoint,
      method,
      status_code: statusCode.toString(),
      status_class: `${Math.floor(statusCode / 100)}xx`
    })

    // Track error rates
    if (statusCode >= 400) {
      await this.trackMetric('api.errors', 1, {
        endpoint,
        method,
        status_code: statusCode.toString()
      })
    }
  }

  // Track database query performance
  async trackDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    success: boolean
  ): Promise<void> {
    await this.trackMetric('database.query_time', duration, {
      operation,
      table,
      success: success.toString()
    })

    if (!success) {
      await this.trackMetric('database.errors', 1, {
        operation,
        table
      })
    }
  }

  // Track cache performance
  async trackCachePerformance(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    cacheType: 'redis' | 'memory',
    key?: string
  ): Promise<void> {
    await this.trackMetric('cache.operations', 1, {
      operation,
      cache_type: cacheType,
      ...(key && { key_pattern: this.getKeyPattern(key) })
    })
  }

  // Get analytics dashboard data
  async getDashboardData(): Promise<{
    metrics: Record<string, MetricData[]>
    events: AnalyticsEvent[]
    performance: {
      averageResponseTime: number
      errorRate: number
      cacheHitRate: number
    }
  }> {
    const metricsPromises = [
      'api.response_time',
      'api.errors',
      'cache.operations',
      'database.query_time',
      'database.errors'
    ].map(async metric => {
      const cacheKey = CacheKeys.analytics(metric, 'recent')
      const data = await CacheManager.get<MetricData[]>(cacheKey) || []
      return [metric, data] as [string, MetricData[]]
    })

    const metricsResults = await Promise.all(metricsPromises)
    const metrics = Object.fromEntries(metricsResults)

    const eventsKey = CacheKeys.analytics('events', 'recent')
    const events = await CacheManager.get<AnalyticsEvent[]>(eventsKey) || []

    // Calculate performance stats
    const responseTimeMetrics = metrics['api.response_time'] || []
    const errorMetrics = metrics['api.errors'] || []
    const cacheMetrics = metrics['cache.operations'] || []

    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0

    const totalRequests = responseTimeMetrics.length
    const totalErrors = errorMetrics.reduce((sum, m) => sum + m.value, 0)
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

    const cacheHits = cacheMetrics.filter(m => m.labels?.operation === 'hit').length
    const cacheMisses = cacheMetrics.filter(m => m.labels?.operation === 'miss').length
    const cacheHitRate = (cacheHits + cacheMisses) > 0 
      ? (cacheHits / (cacheHits + cacheMisses)) * 100 
      : 0

    return {
      metrics,
      events,
      performance: {
        averageResponseTime: Math.round(averageResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100
      }
    }
  }

  // Helper methods
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from cache key (e.g., "user:123:cart" -> "user:*:cart")
    return key.replace(/:[^:]+(?=:)/g, ':*').replace(/:[^:]+$/, ':*')
  }

  private startBufferFlush(): void {
    this.bufferFlushInterval = setInterval(() => {
      this.flushBuffers()
    }, 30000) // Flush every 30 seconds
  }

  private async flushBuffers(): Promise<void> {
    if (this.metricsBuffer.length > 0 || this.eventsBuffer.length > 0) {
      try {
        // In production, you would send these to your analytics service
        // For now, we'll just log the count
        console.log(`📤 Flushing ${this.metricsBuffer.length} metrics and ${this.eventsBuffer.length} events`)
        
        this.metricsBuffer = []
        this.eventsBuffer = []
      } catch (error) {
        console.error('❌ Failed to flush analytics buffers:', error)
      }
    }
  }

  // Cleanup
  destroy(): void {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval)
      this.bufferFlushInterval = null
    }
    this.flushBuffers()
  }
}

// Middleware for automatic API monitoring
export function withMonitoring(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const startTime = Date.now()
    const monitoring = MonitoringManager.getInstance()
    const url = new URL(request.url ?? 'http://localhost:3000')
    
    try {
      const response = await handler(request, ...args)
      const responseTime = Date.now() - startTime
      
      // Track successful request
      await monitoring.trackApiPerformance(
        url.pathname,
        request.method,
        response.status || 200,
        responseTime
      )
      
      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      // Track failed request
      await monitoring.trackApiPerformance(
        url.pathname,
        request.method,
        500,
        responseTime
      )
      
      throw error
    }
  }
}

// Performance timing decorator
export function withPerformanceTracking(name: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      const monitoring = MonitoringManager.getInstance()
      
      try {
        const result = await method.apply(this, args)
        await monitoring.trackPerformance(name, startTime, { 
          method: propertyName,
          success: 'true'
        })
        return result
      } catch (error) {
        await monitoring.trackPerformance(name, startTime, { 
          method: propertyName,
          success: 'false'
        })
        throw error
      }
    }
  }
}

// Global monitoring instance
export const monitoring = MonitoringManager.getInstance()

// Utility functions
export const trackEvent = (event: string, userId?: string, properties?: Record<string, any>) =>
  monitoring.trackEvent(event, userId, properties)

export const trackMetric = (name: string, value: number, labels?: Record<string, string>) =>
  monitoring.trackMetric(name, value, labels)

export const trackPerformance = (name: string, startTime: number, labels?: Record<string, string>) =>
  monitoring.trackPerformance(name, startTime, labels)
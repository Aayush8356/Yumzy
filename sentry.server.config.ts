import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture most errors in production, all in development
  sampleRate: process.env.NODE_ENV === 'production' ? 0.9 : 1.0,
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out expected errors
    const error = hint.originalException
    
    // Don't send database connection timeouts in development
    if (process.env.NODE_ENV === 'development' && 
        event.exception?.values?.[0]?.value?.includes('database')) {
      return null
    }
    
    // Don't send rate limiting errors (they're expected)
    if (event.exception?.values?.[0]?.value?.includes('Rate limit')) {
      return null
    }
    
    // Don't send validation errors (they're user errors)
    if (event.exception?.values?.[0]?.type === 'ValidationError') {
      return null
    }
    
    // Enhanced error context for API routes
    if (event.request?.url) {
      event.tags = {
        ...event.tags,
        api_route: event.request.url.includes('/api/'),
        endpoint: event.request.url,
      }
    }
    
    return event
  },
  
  // Configure additional context
  initialScope: {
    tags: {
      component: 'server',
    },
  },
})
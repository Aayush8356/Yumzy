import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate for edge runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out edge-specific noise
    if (event.exception?.values?.[0]?.value?.includes('edge runtime')) {
      return null
    }
    
    return event
  },
  
  initialScope: {
    tags: {
      component: 'edge',
    },
  },
})
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of errors in development, lower in production
  sampleRate: process.env.NODE_ENV === 'production' ? 0.8 : 1.0,
  
  // Configure the session replay sample rate
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Configure additional options
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out development noise
    if (process.env.NODE_ENV === 'development') {
      // Don't send HMR errors
      if (event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
        return null
      }
      
      // Don't send Next.js hydration errors in development
      if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
        return null
      }
    }
    
    // Filter out authentication errors (they're expected)
    if (event.exception?.values?.[0]?.value?.includes('Authentication')) {
      return null
    }
    
    return event
  },
  
  // Additional integrations
  integrations: [
    // Session Replay integration
    ...(process.env.NODE_ENV === 'production' ? [] : []), // Add replay only in production if needed
  ],
})
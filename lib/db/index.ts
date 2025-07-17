import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/yumzy'

// Create the connection with Vercel/serverless optimized settings
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false,
  onnotice: () => {}, // Disable notice logs
})

// Create the database instance
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

// Export schema for use in other files
export * from './schema'
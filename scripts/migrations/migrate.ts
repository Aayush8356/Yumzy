#!/usr/bin/env tsx
import { runMigrations } from '../../lib/db/migrator'

async function main() {
  try {
    console.log('🚀 Starting database migration...')
    await runMigrations()
    console.log('✅ Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
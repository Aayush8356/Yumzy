#!/usr/bin/env tsx
import { validateMigrations } from '../../lib/db/migrator'

async function main() {
  try {
    await validateMigrations()
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

main()
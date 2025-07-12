#!/usr/bin/env tsx
import { getMigrationStatus } from '../../lib/db/migrator'

async function main() {
  try {
    await getMigrationStatus()
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to get migration status:', error)
    process.exit(1)
  }
}

main()
// Production-ready database migration system
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { readdir, readFile } from 'fs/promises'
import path from 'path'

interface Migration {
  id: string
  name: string
  sql: string
  appliedAt?: Date
}

interface MigrationHistory {
  id: string
  filename: string
  appliedAt: Date
  checksum: string
}

export class DatabaseMigrator {
  private client: postgres.Sql
  private db: ReturnType<typeof drizzle>
  private migrationsPath: string

  constructor(databaseUrl: string, migrationsPath: string = './lib/db/migrations') {
    this.client = postgres(databaseUrl, { max: 1 })
    this.db = drizzle(this.client)
    this.migrationsPath = migrationsPath
  }

  // Initialize migration history table
  async initializeMigrationTable(): Promise<void> {
    await this.client`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) NOT NULL
      )
    `
    console.log('✅ Migration history table initialized')
  }

  // Get applied migrations from database
  async getAppliedMigrations(): Promise<MigrationHistory[]> {
    try {
      const result = await this.client`
        SELECT filename, applied_at, checksum 
        FROM migration_history 
        ORDER BY applied_at ASC
      `
      return result.map(row => ({
        id: row.filename,
        filename: row.filename,
        appliedAt: row.applied_at,
        checksum: row.checksum
      }))
    } catch (error) {
      // If table doesn't exist, return empty array
      return []
    }
  }

  // Get pending migrations from filesystem
  async getPendingMigrations(): Promise<Migration[]> {
    const appliedMigrations = await this.getAppliedMigrations()
    const appliedFilenames = new Set(appliedMigrations.map(m => m.filename))

    try {
      const files = await readdir(this.migrationsPath)
      const sqlFiles = files.filter(file => file.endsWith('.sql')).sort()

      const migrations: Migration[] = []
      
      for (const file of sqlFiles) {
        if (!appliedFilenames.has(file)) {
          const filePath = path.join(this.migrationsPath, file)
          const sql = await readFile(filePath, 'utf-8')
          
          migrations.push({
            id: file.replace('.sql', ''),
            name: file,
            sql: sql.trim()
          })
        }
      }

      return migrations
    } catch (error) {
      console.error('❌ Error reading migrations directory:', error)
      return []
    }
  }

  // Calculate checksum for migration
  private calculateChecksum(content: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  // Apply a single migration
  async applyMigration(migration: Migration): Promise<void> {
    const checksum = this.calculateChecksum(migration.sql)
    
    console.log(`🔄 Applying migration: ${migration.name}`)
    
    try {
      // Execute migration in a transaction
      await this.client.begin(async sql => {
        // Execute the migration SQL
        await sql.unsafe(migration.sql)
        
        // Record in migration history
        await sql`
          INSERT INTO migration_history (filename, checksum) 
          VALUES (${migration.name}, ${checksum})
        `
      })
      
      console.log(`✅ Migration applied: ${migration.name}`)
    } catch (error) {
      console.error(`❌ Failed to apply migration ${migration.name}:`, error)
      throw error
    }
  }

  // Run all pending migrations
  async runMigrations(): Promise<void> {
    console.log('🚀 Starting database migration...')
    
    await this.initializeMigrationTable()
    const pendingMigrations = await this.getPendingMigrations()

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found')
      return
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations`)

    for (const migration of pendingMigrations) {
      await this.applyMigration(migration)
    }

    console.log('🎉 All migrations completed successfully')
  }

  // Validate migration integrity
  async validateMigrations(): Promise<boolean> {
    console.log('🔍 Validating migration integrity...')
    
    const appliedMigrations = await this.getAppliedMigrations()
    let isValid = true

    for (const appliedMigration of appliedMigrations) {
      try {
        const filePath = path.join(this.migrationsPath, appliedMigration.filename)
        const currentSql = await readFile(filePath, 'utf-8')
        const currentChecksum = this.calculateChecksum(currentSql.trim())

        if (currentChecksum !== appliedMigration.checksum) {
          console.error(`❌ Migration integrity check failed: ${appliedMigration.filename}`)
          console.error(`   Expected checksum: ${appliedMigration.checksum}`)
          console.error(`   Current checksum:  ${currentChecksum}`)
          isValid = false
        }
      } catch (error) {
        console.error(`❌ Could not validate migration: ${appliedMigration.filename}`)
        isValid = false
      }
    }

    if (isValid) {
      console.log('✅ All applied migrations are valid')
    }

    return isValid
  }

  // Get migration status
  async getStatus(): Promise<{
    appliedCount: number
    pendingCount: number
    appliedMigrations: MigrationHistory[]
    pendingMigrations: Migration[]
  }> {
    const appliedMigrations = await this.getAppliedMigrations()
    const pendingMigrations = await this.getPendingMigrations()

    return {
      appliedCount: appliedMigrations.length,
      pendingCount: pendingMigrations.length,
      appliedMigrations,
      pendingMigrations
    }
  }

  // Create a new migration file
  async createMigration(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0]
    const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`
    const filePath = path.join(this.migrationsPath, filename)

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: Add your migration description here

-- Add your SQL statements here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Remember to test your migration before applying to production!
`

    await require('fs/promises').writeFile(filePath, template)
    console.log(`📝 Created migration file: ${filename}`)
    
    return filePath
  }

  // Rollback last migration (use with caution)
  async rollbackLastMigration(): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations()
    
    if (appliedMigrations.length === 0) {
      console.log('ℹ️ No migrations to rollback')
      return
    }

    const lastMigration = appliedMigrations[appliedMigrations.length - 1]
    
    console.warn(`⚠️ Rollback is dangerous and may cause data loss!`)
    console.warn(`   Rolling back: ${lastMigration.filename}`)
    
    // Remove from migration history
    await this.client`
      DELETE FROM migration_history 
      WHERE filename = ${lastMigration.filename}
    `
    
    console.log(`✅ Rolled back migration: ${lastMigration.filename}`)
    console.warn(`⚠️ Manual database changes may be required to fully revert the migration`)
  }

  // Close database connection
  async close(): Promise<void> {
    await this.client.end()
  }
}

// CLI utility functions
export async function runMigrations(databaseUrl?: string): Promise<void> {
  const url = databaseUrl || process.env.DATABASE_URL
  
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const migrator = new DatabaseMigrator(url)
  
  try {
    await migrator.runMigrations()
  } finally {
    await migrator.close()
  }
}

export async function getMigrationStatus(databaseUrl?: string): Promise<void> {
  const url = databaseUrl || process.env.DATABASE_URL
  
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const migrator = new DatabaseMigrator(url)
  
  try {
    const status = await migrator.getStatus()
    
    console.log('\n📊 Migration Status:')
    console.log(`   Applied: ${status.appliedCount}`)
    console.log(`   Pending: ${status.pendingCount}`)
    
    if (status.appliedMigrations.length > 0) {
      console.log('\n✅ Applied Migrations:')
      status.appliedMigrations.forEach(migration => {
        console.log(`   ${migration.filename} (${migration.appliedAt.toISOString()})`)
      })
    }
    
    if (status.pendingMigrations.length > 0) {
      console.log('\n⏳ Pending Migrations:')
      status.pendingMigrations.forEach(migration => {
        console.log(`   ${migration.name}`)
      })
    }
  } finally {
    await migrator.close()
  }
}

export async function validateMigrations(databaseUrl?: string): Promise<void> {
  const url = databaseUrl || process.env.DATABASE_URL
  
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const migrator = new DatabaseMigrator(url)
  
  try {
    const isValid = await migrator.validateMigrations()
    process.exit(isValid ? 0 : 1)
  } finally {
    await migrator.close()
  }
}
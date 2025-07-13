import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { PasswordManager } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting password migration for existing users...')
    
    // Find all users without password hashes
    const usersWithoutHashes = await db
      .select()
      .from(usersTable)
      .where(isNull(usersTable.passwordHash))
    
    console.log(`Found ${usersWithoutHashes.length} users without password hashes`)
    
    const results = []
    
    for (const user of usersWithoutHashes) {
      let defaultPassword = ''
      
      // Assign default passwords based on email patterns
      if (user.email.includes('demo')) {
        defaultPassword = 'demo123'
      } else if (user.email.includes('test')) {
        defaultPassword = 'test123'
      } else if (user.email.includes('admin')) {
        defaultPassword = 'admin123'
      } else {
        // For other users, use a generic secure password
        defaultPassword = 'tempPassword123!'
      }
      
      // Hash the password
      const hashedPassword = await PasswordManager.hash(defaultPassword)
      
      // Update the user with the hashed password
      await db
        .update(usersTable)
        .set({ passwordHash: hashedPassword })
        .where(eq(usersTable.id, user.id))
      
      results.push({
        id: user.id,
        email: user.email,
        defaultPassword: defaultPassword,
        migrated: true
      })
      
      console.log(`✅ Migrated user: ${user.email} with password: ${defaultPassword}`)
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${results.length} users`,
      users: results,
      instructions: "Users can now login with their assigned default passwords. They should change them after login."
    })
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

// GET endpoint to check users without password hashes (dry run)
export async function GET() {
  try {
    const usersWithoutHashes = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt
      })
      .from(usersTable)
      .where(isNull(usersTable.passwordHash))
    
    return NextResponse.json({
      success: true,
      message: `Found ${usersWithoutHashes.length} users without password hashes`,
      users: usersWithoutHashes
    })
    
  } catch (error) {
    console.error('❌ Check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Check failed'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

// POST /api/admin/setup - Create the first admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Check if an admin user already exists
    console.log('Checking if admin exists...')
    const adminCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
    
    console.log('Admin count result:', adminCountResult)
    const adminCount = adminCountResult[0]?.count || 0
    console.log('Current admin count:', adminCount)

    if (adminCount > 0) {
      return NextResponse.json(
        { success: false, error: 'An admin account already exists. Setup is disabled.' },
        { status: 403 }
      )
    }

    // In a real app, you would hash the password here
    // For this example, we'll store it as is, but this is NOT secure.
    const hashedPassword = `hashed_${password}`

    // Create the first admin user using Drizzle ORM
    console.log('Creating admin user with data:', { email, name, role: 'admin' })
    
    const insertResult = await db.insert(users).values({
      email,
      name,
      role: 'admin',
      isVerified: true,
      preferences: {
        notifications: true,
        newsletter: false,
        dietaryRestrictions: []
      }
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role
    })
    
    const newAdmin = insertResult[0]
    
    console.log('Admin user created successfully:', newAdmin)

    return NextResponse.json({
      success: true,
      message: 'First admin user created successfully!',
      user: newAdmin,
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === '23505') {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists.' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: `Failed to set up admin user: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// GET /api/admin/setup - Check if any admin exists
export async function GET() {
  try {
    console.log('GET /api/admin/setup - Checking admin status...')
    const adminCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
      
    console.log('Admin count result (GET):', adminCountResult)
    const adminCount = adminCountResult[0]?.count || 0
    console.log('Admin count (GET):', adminCount)

    return NextResponse.json({
      success: true,
      hasAdmin: adminCount > 0,
    })
  } catch (error) {
    console.error('Get admin setup status error:', error)
    console.error('Error details (GET):', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { success: false, error: `Failed to check admin status: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    console.log('Test auth - received email:', email)
    
    // Check if user exists
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
    
    const user = users[0]
    
    return NextResponse.json({
      success: true,
      email: email,
      userFound: users.length > 0,
      userHasPasswordHash: user ? !!user.passwordHash : false,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
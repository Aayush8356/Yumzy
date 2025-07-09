import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/auth/check-admin - Check if user has admin access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }

    // Check global admin store
    let adminUsers: any[] = []
    if (typeof global !== 'undefined' && (global as any).adminUsersStore) {
      adminUsers = (global as any).adminUsersStore
    }

    const isAdmin = adminUsers.some(user => user.email === email && user.role === 'admin')

    if (isAdmin) {
      const adminUser = adminUsers.find(user => user.email === email)
      return NextResponse.json({
        success: true,
        isAdmin: true,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin'
        }
      })
    }

    return NextResponse.json({
      success: true,
      isAdmin: false,
      user: null
    })
  } catch (error) {
    console.error('Check admin error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addressesTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(addressesTable.isDefault, addressesTable.createdAt)

    return NextResponse.json({
      success: true,
      addresses
    })
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

// POST /api/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      type,
      street,
      city,
      state,
      postalCode,
      country,
      landmark,
      instructions,
      isDefault = false
    } = body

    if (!userId || !street || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, error: 'Required fields: userId, street, city, state, postalCode' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId))
    }

    const newAddress = await db
      .insert(addressesTable)
      .values({
        userId,
        type: type || 'home',
        street,
        city,
        state,
        postalCode,
        country: country || 'United States',
        landmark,
        instructions,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      address: newAddress[0]
    })
  } catch (error) {
    console.error('Add address error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add address' },
      { status: 500 }
    )
  }
}
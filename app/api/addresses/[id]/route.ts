import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addressesTable } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// PUT /api/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id
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
      isDefault
    } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Verify address belongs to user
    const existingAddress = await db
      .select()
      .from(addressesTable)
      .where(and(
        eq(addressesTable.id, addressId),
        eq(addressesTable.userId, userId)
      ))
      .limit(1)

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault && !existingAddress[0].isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(and(
          eq(addressesTable.userId, userId),
          eq(addressesTable.isDefault, true)
        ))
    }

    // Update address
    const updateData: any = { updatedAt: new Date() }
    if (type !== undefined) updateData.type = type
    if (street !== undefined) updateData.street = street
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (country !== undefined) updateData.country = country
    if (landmark !== undefined) updateData.landmark = landmark
    if (instructions !== undefined) updateData.instructions = instructions
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const updatedAddress = await db
      .update(addressesTable)
      .set(updateData)
      .where(eq(addressesTable.id, addressId))
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress[0]
    })
  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId') || request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Verify address belongs to user and delete
    const deletedAddress = await db
      .delete(addressesTable)
      .where(and(
        eq(addressesTable.id, addressId),
        eq(addressesTable.userId, userId)
      ))
      .returning()

    if (deletedAddress.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      )
    }

    // If deleted address was default, set another address as default
    if (deletedAddress[0].isDefault) {
      const remainingAddresses = await db
        .select()
        .from(addressesTable)
        .where(eq(addressesTable.userId, userId))
        .limit(1)

      if (remainingAddresses.length > 0) {
        await db
          .update(addressesTable)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(addressesTable.id, remainingAddresses[0].id))
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
      deletedAddress: deletedAddress[0]
    })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}

// POST /api/addresses/[id]/set-default - Set address as default
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Verify address belongs to user
    const address = await db
      .select()
      .from(addressesTable)
      .where(and(
        eq(addressesTable.id, addressId),
        eq(addressesTable.userId, userId)
      ))
      .limit(1)

    if (address.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      )
    }

    // Unset all defaults for this user
    await db
      .update(addressesTable)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(addressesTable.userId, userId))

    // Set this address as default
    const updatedAddress = await db
      .update(addressesTable)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(addressesTable.id, addressId))
      .returning()

    return NextResponse.json({
      success: true,
      message: 'Default address updated',
      address: updatedAddress[0]
    })
  } catch (error) {
    console.error('Set default address error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set default address' },
      { status: 500 }
    )
  }
}
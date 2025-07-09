import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;
  try {
    const body = await request.json();
    const [updatedItem] = await db.update(foodItems).set(body).where(eq(foodItems.id, id)).returning();
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error(`Failed to update menu item ${id}:`, error);
    return NextResponse.json({ success: false, error: `Failed to update menu item ${id}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = params;
  try {
    await db.delete(foodItems).where(eq(foodItems.id, id));
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete menu item ${id}:`, error);
    return NextResponse.json({ success: false, error: `Failed to delete menu item ${id}` }, { status: 500 });
  }
}

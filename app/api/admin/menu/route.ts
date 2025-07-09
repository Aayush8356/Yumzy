import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems, users } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await db.select().from(foodItems).orderBy(foodItems.name);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const [newItem] = await db.insert(foodItems).values(body).returning();
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 });
  }
}

// yumzy/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, usersTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user.length > 0 && user[0].role === 'admin';
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// yumzy/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ordersTable, usersTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest) {
  // Temporarily bypass auth check for development
  return true;
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const orders = await db.select().from(ordersTable);
      return NextResponse.json({ success: true, count: orders.length });
    }

    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

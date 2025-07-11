// yumzy/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest) {
  try {
    // Since we're not using Clerk auth for this endpoint, we'll bypass auth check for now
    // In a production app, you'd want proper JWT validation here
    return true;
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
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
      const users = await db.select().from(usersTable);
      return NextResponse.json({ success: true, count: users.length });
    }

    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

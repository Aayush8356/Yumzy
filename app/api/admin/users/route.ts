// yumzy/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    if (!authToken) {
      return false;
    }

    const userId = authToken;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user && user.role === 'admin';
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
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

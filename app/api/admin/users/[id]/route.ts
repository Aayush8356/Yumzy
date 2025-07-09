// yumzy/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

async function verifyAdmin(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) return false;

  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
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
    const { role } = body;
    const [updatedUser] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return NextResponse.json({ success: false, error: `Failed to update user ${id}` }, { status: 500 });
  }
}

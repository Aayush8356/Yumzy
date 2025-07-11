import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems, users } from '@/lib/db/schema';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    if (countOnly) {
      const items = await db.select().from(foodItems);
      return NextResponse.json({ success: true, count: items.length });
    }

    // Get all items first to apply search filter
    let allItems = await db.select().from(foodItems).orderBy(foodItems.name);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      allItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = allItems.slice(offset, offset + limit);

    return NextResponse.json({ 
      success: true, 
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
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

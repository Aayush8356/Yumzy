// yumzy/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favoritesTable, usersTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TokenManager } from '@/lib/auth';

async function verifyUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    
    if (!authToken) {
      return null;
    }

    // Try to decode JWT token to get user ID
    let userId: string;
    try {
      const decoded = TokenManager.verify(authToken);
      userId = decoded.userId;
    } catch (tokenError) {
      // Fallback: try using token as user ID directly (for backward compatibility)
      userId = authToken;
    }
    
    // Verify user exists in database
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user ? userId : null;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
}

// Get user's favorite items
export async function GET(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));
    
    console.log(`Found ${userFavorites.length} favorites for user ${userId}:`, userFavorites);
    return NextResponse.json({ success: true, favorites: userFavorites });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// Add an item to favorites
export async function POST(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { foodItemId } = body;

    if (!foodItemId) {
      return NextResponse.json({ success: false, error: 'Food Item ID is required' }, { status: 400 });
    }

    // Check if it's already a favorite
    const existingFavorite = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.foodItemId, foodItemId)))
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json({ success: true, message: 'Item is already a favorite' });
    }

    const [newFavorite] = await db
      .insert(favoritesTable)
      .values({ userId, foodItemId })
      .returning();

    return NextResponse.json({ success: true, favorite: newFavorite }, { status: 201 });
  } catch (error) {
    console.error('Failed to add to favorites:', error);
    return NextResponse.json({ success: false, error: 'Failed to add to favorites' }, { status: 500 });
  }
}

// Remove an item from favorites
export async function DELETE(request: NextRequest) {
  const userId = await verifyUser(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { foodItemId } = body;

    if (!foodItemId) {
      return NextResponse.json({ success: false, error: 'Food Item ID is required' }, { status: 400 });
    }

    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.foodItemId, foodItemId)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove from favorites' }, { status: 500 });
  }
}

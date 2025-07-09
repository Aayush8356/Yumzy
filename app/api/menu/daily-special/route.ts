// yumzy/app/api/menu/daily-special/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { getFoodImage } from '@/lib/unsplash';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get date-based seed for consistent daily special
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Fetch all popular food items
    const popularItems = await db
      .select()
      .from(foodItems)
      .where(sql`${foodItems.isPopular} = true`);

    if (!popularItems || popularItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No special items found' }, { status: 404 });
    }

    // Select item based on day of year for consistent daily rotation
    const dailySpecial = popularItems[dayOfYear % popularItems.length];

    // Try to get a fresh image from Unsplash API if available
    try {
      const freshImage = await getFoodImage(
        dailySpecial.name,
        '',
        dailySpecial.id
      );
      
      // Update the item with fresh image if we got one
      if (freshImage && freshImage !== dailySpecial.image) {
        dailySpecial.image = freshImage;
      }
    } catch (imageError) {
      console.warn('Failed to fetch fresh image from Unsplash, using stored image:', imageError);
      // Continue with stored image if API fails
    }

    return NextResponse.json({ success: true, item: dailySpecial });
  } catch (error) {
    console.error('Failed to fetch daily special:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch daily special' }, { status: 500 });
  }
}

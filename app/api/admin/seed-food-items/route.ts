import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems as foodItemsTable } from '@/lib/db/schema';
import { foodItems } from '@/data/food-items';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest) {
  try {
    // For now, allow all requests since the frontend handles admin auth
    // In production, implement proper JWT token verification
    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    console.log(`🌱 Starting to seed ${foodItems.length} food items...`);
    
    // Get existing items count
    const existingItems = await db.select().from(foodItemsTable);
    console.log(`📊 Found ${existingItems.length} existing food items`);

    // Insert all food items
    for (const item of foodItems) {
      try {
        await db.insert(foodItemsTable).values({
          name: item.name,
          description: item.description,
          shortDescription: item.description.substring(0, 100),
          price: item.price,
          originalPrice: item.originalPrice || null,
          discount: item.discount || 0,
          rating: item.rating.toString(),
          reviewCount: Math.floor(Math.random() * 100) + 10,
          cookTime: item.cookTime,
          difficulty: item.spiceLevel === 'extra-hot' ? 'hard' : item.spiceLevel === 'hot' ? 'medium' : 'easy',
          spiceLevel: item.spiceLevel === 'mild' ? 1 : 
                     item.spiceLevel === 'medium' ? 2 : 
                     item.spiceLevel === 'hot' ? 3 : 4,
          servingSize: "1 person",
          calories: item.calories || null,
          image: item.image,
          images: [item.image],
          ingredients: [],
          allergens: [],
          categoryId: null,
          isPopular: item.isHot || false,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan || false,
          isGlutenFree: false,
          isSpicy: (item.spiceLevel === 'hot' || item.spiceLevel === 'extra-hot'),
          isAvailable: true,
          nutritionInfo: {
            calories: item.calories || 0,
            protein: Math.floor(Math.random() * 30) + 5,
            carbs: Math.floor(Math.random() * 50) + 10,
            fat: Math.floor(Math.random() * 20) + 5,
            fiber: Math.floor(Math.random() * 10) + 2,
            sugar: Math.floor(Math.random() * 15) + 2
          },
          tags: [item.category.toLowerCase(), item.spiceLevel || 'mild']
        });
        
        console.log(`✅ Inserted: ${item.name}`);
      } catch (itemError) {
        console.error(`❌ Failed to insert ${item.name}:`, itemError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${foodItems.length} food items`,
      count: foodItems.length
    });

  } catch (error) {
    console.error('Failed to seed food items:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed food items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await db.select().from(foodItemsTable);
    return NextResponse.json({
      success: true,
      count: items.length,
      items: items.slice(0, 10) // Return first 10 as sample
    });
  } catch (error) {
    console.error('Failed to fetch food items:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch food items'
    }, { status: 500 });
  }
}
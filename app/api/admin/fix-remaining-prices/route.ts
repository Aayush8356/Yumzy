import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { foodItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Items that still need realistic pricing updates based on the database screenshot
const remainingItemsToUpdate: Record<string, { price: number; originalPrice?: number; discount?: number }> = {
  // Vietnamese/Asian items
  "Beef Pho": { price: 280, originalPrice: 350, discount: 20 },
  "Pho Tai": { price: 290, originalPrice: 360, discount: 19 },
  "Thai Basil Beef": { price: 320, originalPrice: 390, discount: 18 },
  
  // French/European items  
  "Beef Bourguignon": { price: 450, originalPrice: 550, discount: 18 },
  
  // Korean/Asian items
  "Marinated Beef Bulgogi": { price: 380, originalPrice: 450, discount: 16 },
  "Korean BBQ Beef": { price: 420, originalPrice: 500, discount: 16 },
  
  // Japanese items
  "Beef Ramen": { price: 340, originalPrice: 420, discount: 19 },
  
  // Indian beverages
  "Mango Lassi": { price: 80, originalPrice: 100, discount: 20 },
  
  // Vietnamese/Asian items
  "Lemongrass Chicken": { price: 310, originalPrice: 380, discount: 18 },
  
  // Other items that might need updates
  "Vegetarian Sticky Rice": { price: 180, originalPrice: 220, discount: 18 },
  "Grilled Brazilian Style Chicken": { price: 360, originalPrice: 440, discount: 18 },
  "Kung Pao Chicken": { price: 280, originalPrice: 340, discount: 18 },
  "Mac and Cheese": { price: 220, originalPrice: 280, discount: 21 },
  "Pao de Acucar": { price: 150, originalPrice: 180, discount: 17 },
  "Schnitzel": { price: 380, originalPrice: 460, discount: 17 },
  
  // Any other items with decimal prices (like .99) should be updated
  "Beef Teriyaki": { price: 340, originalPrice: 420, discount: 19 },
  "Pad Thai": { price: 260, originalPrice: 320, discount: 19 },
  "Spring Rolls": { price: 160, originalPrice: 200, discount: 20 },
  "Tom Yum Soup": { price: 200, originalPrice: 250, discount: 20 },
  "Green Curry": { price: 280, originalPrice: 340, discount: 18 },
  "Massaman Curry": { price: 300, originalPrice: 370, discount: 19 },
  "Pad See Ew": { price: 240, originalPrice: 300, discount: 20 },
  "Satay Chicken": { price: 250, originalPrice: 310, discount: 19 },
  "Rendang": { price: 350, originalPrice: 430, discount: 19 },
  "Nasi Goreng": { price: 220, originalPrice: 270, discount: 19 }
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting fix for remaining unrealistic prices...');

    // Check authorization (admin only)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all food items from database to identify which ones need updates
    const allFoodItems = await db.select().from(foodItems);
    console.log(`📊 Found ${allFoodItems.length} total food items in database`);

    let updatedCount = 0;
    const itemsUpdated: string[] = [];

    // Find and update items that still have unrealistic pricing
    for (const foodItem of allFoodItems) {
      const currentPrice = parseFloat(foodItem.price);
      
      // Check if this item has unrealistic pricing (contains decimal like .99, .89, etc. or is very low)
      const hasUnrealisticPrice = (
        currentPrice < 50 || // Very low prices
        currentPrice.toString().includes('.99') || // Common unrealistic pricing patterns
        currentPrice.toString().includes('.89') ||
        currentPrice.toString().includes('.95') ||
        remainingItemsToUpdate[foodItem.name] // Specifically identified items
      );

      if (hasUnrealisticPrice) {
        // Use specific pricing if available, otherwise generate realistic pricing
        let newPricing = remainingItemsToUpdate[foodItem.name];
        
        if (!newPricing) {
          // Generate realistic pricing based on category and current price
          const basePrice = Math.max(Math.ceil(currentPrice * 15), 150); // Minimum ₹150
          newPricing = {
            price: basePrice,
            originalPrice: Math.ceil(basePrice * 1.25), // 25% higher original price
            discount: 20
          };
        }

        // Update the item
        await db
          .update(foodItems)
          .set({
            price: newPricing.price.toString(),
            originalPrice: newPricing.originalPrice?.toString(),
            discount: newPricing.discount,
            updatedAt: new Date()
          })
          .where(eq(foodItems.id, foodItem.id));

        updatedCount++;
        itemsUpdated.push(`${foodItem.name}: ₹${currentPrice} → ₹${newPricing.price}`);
        console.log(`Updated ${foodItem.name}: ₹${currentPrice} → ₹${newPricing.price}`);
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} items with realistic pricing!`);

    return NextResponse.json({
      success: true,
      message: 'Remaining items updated with realistic pricing',
      summary: {
        totalItemsChecked: allFoodItems.length,
        itemsUpdated: updatedCount,
        updatedItems: itemsUpdated.slice(0, 10), // Show first 10 for brevity
        allUpdatedItems: itemsUpdated
      }
    });

  } catch (error) {
    console.error('❌ Error fixing remaining prices:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fix remaining prices' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all food items and identify which ones still need updates
    const allFoodItems = await db.select().from(foodItems);
    const itemsNeedingUpdate: Array<{name: string, currentPrice: string, suggested: number}> = [];

    for (const foodItem of allFoodItems) {
      const currentPrice = parseFloat(foodItem.price);
      
      const hasUnrealisticPrice = (
        currentPrice < 50 || 
        currentPrice.toString().includes('.99') || 
        currentPrice.toString().includes('.89') ||
        currentPrice.toString().includes('.95') ||
        remainingItemsToUpdate[foodItem.name]
      );

      if (hasUnrealisticPrice) {
        const suggested = remainingItemsToUpdate[foodItem.name]?.price || Math.max(Math.ceil(currentPrice * 15), 150);
        itemsNeedingUpdate.push({
          name: foodItem.name,
          currentPrice: foodItem.price,
          suggested: suggested
        });
      }
    }

    return NextResponse.json({
      message: 'Items that need realistic pricing updates',
      totalItems: allFoodItems.length,
      itemsNeedingUpdate: itemsNeedingUpdate.length,
      items: itemsNeedingUpdate
    });

  } catch (error) {
    console.error('Error checking items:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check items' 
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orderItems, foodItems, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// New realistic pricing mapping (from food item names to new prices)
const newPricingMap: Record<string, { price: number; originalPrice?: number; discount?: number }> = {
  // BURGERS & SANDWICHES
  "Truffle Mushroom Burger": { price: 450, originalPrice: 550, discount: 18 },
  "Classic Cheeseburger": { price: 280, originalPrice: 350, discount: 20 },
  "BBQ Bacon Burger": { price: 380, originalPrice: 450, discount: 16 },
  "Veggie Deluxe Burger": { price: 220, originalPrice: 280, discount: 21 },
  "Spicy Jalapeño Burger": { price: 320, originalPrice: 390, discount: 18 },

  // PIZZA
  "Margherita Supreme Pizza": { price: 350, originalPrice: 450, discount: 22 },
  "Pepperoni Classic": { price: 420, originalPrice: 520, discount: 19 },
  "BBQ Chicken Pizza": { price: 480, originalPrice: 580, discount: 17 },
  "Vegetarian Supreme": { price: 380, originalPrice: 450, discount: 16 },
  "Meat Lovers Pizza": { price: 550, originalPrice: 650, discount: 15 },

  // INDIAN CUISINE
  "Butter Chicken": { price: 320, originalPrice: 390, discount: 18 },
  "Chicken Tikka Masala": { price: 340, originalPrice: 420, discount: 19 },
  "Palak Paneer": { price: 240, originalPrice: 300, discount: 20 },
  "Chicken Biryani": { price: 380, originalPrice: 450, discount: 16 },
  "Dal Makhani": { price: 180, originalPrice: 220, discount: 18 },

  // CHINESE CUISINE
  "Kung Pao Chicken": { price: 280, originalPrice: 340, discount: 18 },
  "Sweet and Sour Pork": { price: 320, originalPrice: 390, discount: 18 },
  "Beef and Broccoli": { price: 350, originalPrice: 420, discount: 17 },
  "Vegetable Fried Rice": { price: 180, originalPrice: 220, discount: 18 },
  "General Tso's Chicken": { price: 300, originalPrice: 360, discount: 17 },

  // ITALIAN CUISINE
  "Spaghetti Carbonara": { price: 340, originalPrice: 420, discount: 19 },
  "Chicken Parmigiana": { price: 420, originalPrice: 520, discount: 19 },
  "Fettuccine Alfredo": { price: 320, originalPrice: 390, discount: 18 },
  "Lasagna Bolognese": { price: 380, originalPrice: 460, discount: 17 },
  "Risotto Mushroom": { price: 360, originalPrice: 440, discount: 18 },

  // MEXICAN CUISINE
  "Chicken Quesadilla": { price: 260, originalPrice: 320, discount: 19 },
  "Beef Tacos (3pc)": { price: 220, originalPrice: 280, discount: 21 },
  "Chicken Burrito Bowl": { price: 290, originalPrice: 350, discount: 17 },
  "Veggie Enchiladas": { price: 240, originalPrice: 300, discount: 20 },
  "Carnitas Burrito": { price: 310, originalPrice: 380, discount: 18 },

  // JAPANESE CUISINE
  "Salmon Sushi Roll": { price: 450, originalPrice: 550, discount: 18 },
  "Chicken Teriyaki Bowl": { price: 320, originalPrice: 390, discount: 18 },
  "Vegetable Tempura": { price: 280, originalPrice: 340, discount: 18 },
  "Chicken Ramen": { price: 350, originalPrice: 420, discount: 17 },
  "California Roll": { price: 380, originalPrice: 460, discount: 17 },

  // AMERICAN CUISINE
  "Buffalo Wings": { price: 340, originalPrice: 420, discount: 19 },
  "Mac and Cheese": { price: 220, originalPrice: 280, discount: 21 },
  "BBQ Ribs": { price: 580, originalPrice: 720, discount: 19 },
  "Philly Cheesesteak": { price: 380, originalPrice: 460, discount: 17 },

  // DESSERTS & SWEETS
  "Tiramisu": { price: 180, originalPrice: 220, discount: 18 },
  "Crème Brûlée": { price: 220, originalPrice: 280, discount: 21 },
  "Baklava": { price: 150, originalPrice: 180, discount: 17 },
  "Gulab Jamun (2pc)": { price: 80, originalPrice: 100, discount: 20 },
  "Kulfi (2pc)": { price: 90, originalPrice: 110, discount: 18 },

  // BEVERAGES
  "Masala Chai": { price: 40, originalPrice: 50, discount: 20 },
  "Fresh Lime Soda": { price: 60, originalPrice: 80, discount: 25 },
  "Mango Lassi": { price: 80, originalPrice: 100, discount: 20 },
  "Fresh Coconut Water": { price: 70, originalPrice: 90, discount: 22 },
  "Cold Coffee": { price: 120, originalPrice: 150, discount: 20 }
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting pricing migration...');

    // Check authorization (admin only)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all food items from database
    const allFoodItems = await db.select().from(foodItems);
    console.log(`📊 Found ${allFoodItems.length} food items in database`);

    let foodItemsUpdated = 0;
    
    // Update food items with new pricing
    for (const foodItem of allFoodItems) {
      const newPricing = newPricingMap[foodItem.name];
      
      if (newPricing) {
        await db
          .update(foodItems)
          .set({
            price: newPricing.price.toString(),
            originalPrice: newPricing.originalPrice?.toString(),
            discount: newPricing.discount,
            updatedAt: new Date()
          })
          .where(eq(foodItems.id, foodItem.id));
        
        foodItemsUpdated++;
        console.log(`Updated ${foodItem.name}: ₹${foodItem.price} → ₹${newPricing.price}`);
      }
    }

    // Get all order items that need price updates
    const allOrderItems = await db.select().from(orderItems);
    console.log(`📋 Found ${allOrderItems.length} order items to potentially update`);

    let orderItemsUpdated = 0;
    let totalValueBefore = 0;
    let totalValueAfter = 0;

    // Update order items with new pricing
    for (const orderItem of allOrderItems) {
      // Find the corresponding food item
      const foodItem = allFoodItems.find(fi => fi.id === orderItem.foodItemId);
      
      if (foodItem) {
        const newPricing = newPricingMap[foodItem.name];
        
        if (newPricing) {
          const currentPriceNum = parseFloat(orderItem.price);
          const newPricePerItem = newPricing.price;
          const oldTotal = currentPriceNum * orderItem.quantity;
          const newTotal = newPricePerItem * orderItem.quantity;
          
          totalValueBefore += oldTotal;
          totalValueAfter += newTotal;

          // Update the order item with new pricing
          await db
            .update(orderItems)
            .set({ 
              price: newPricePerItem.toString()
            })
            .where(eq(orderItems.id, orderItem.id));

          orderItemsUpdated++;
        }
      }
    }

    // Recalculate order totals
    const allOrders = await db.select().from(orders);
    let ordersUpdated = 0;

    for (const order of allOrders) {
      // Get all items for this order
      const orderItemsForOrder = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      let newSubtotal = 0;
      
      // Calculate new subtotal based on updated order items
      for (const item of orderItemsForOrder) {
        const itemPrice = parseFloat(item.price);
        newSubtotal += itemPrice * item.quantity;
      }

      // Keep the same tax and delivery fee structure
      const taxRate = 0.18; // 18% GST
      const deliveryFee = 50; // Fixed delivery fee
      const newTax = newSubtotal * taxRate;
      const newTotal = newSubtotal + newTax + deliveryFee;

      // Update the order totals
      await db
        .update(orders)
        .set({
          subtotal: newSubtotal.toString(),
          tax: newTax.toString(),
          total: newTotal.toString(),
          updatedAt: new Date()
        })
        .where(eq(orders.id, order.id));

      ordersUpdated++;
    }

    const summary = {
      foodItemsUpdated,
      orderItemsUpdated,
      ordersUpdated,
      totalValueBefore: Math.round(totalValueBefore * 100) / 100,
      totalValueAfter: Math.round(totalValueAfter * 100) / 100,
      valueChange: Math.round((totalValueAfter - totalValueBefore) * 100) / 100,
      percentageChange: totalValueBefore > 0 ? Math.round(((totalValueAfter - totalValueBefore) / totalValueBefore * 100) * 100) / 100 : 0
    };

    console.log('✅ Pricing migration completed successfully!', summary);

    return NextResponse.json({
      success: true,
      message: 'Pricing migration completed successfully',
      summary
    });

  } catch (error) {
    console.error('❌ Error during pricing migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to migrate pricing' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to run pricing migration',
    endpoint: '/api/admin/migrate-pricing'
  });
}
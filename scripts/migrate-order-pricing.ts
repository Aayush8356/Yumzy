// Script to migrate existing order pricing to new realistic Indian market pricing
import { db } from '../lib/db';
import { orderItems, foodItems, orders } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// New realistic pricing mapping (from food item IDs to new prices)
const newPricingMap: Record<string, number> = {
  // BURGERS & SANDWICHES
  "1": 450,  // Truffle Mushroom Burger
  "2": 280,  // Classic Cheeseburger
  "3": 380,  // BBQ Bacon Burger
  "4": 220,  // Veggie Deluxe Burger
  "5": 320,  // Spicy Jalapeño Burger

  // PIZZA
  "6": 350,  // Margherita Supreme Pizza
  "7": 420,  // Pepperoni Classic
  "8": 480,  // BBQ Chicken Pizza
  "9": 380,  // Vegetarian Supreme
  "10": 550, // Meat Lovers Pizza

  // INDIAN CUISINE
  "11": 320, // Butter Chicken
  "12": 340, // Chicken Tikka Masala
  "13": 240, // Palak Paneer
  "14": 380, // Chicken Biryani
  "15": 180, // Dal Makhani

  // CHINESE CUISINE
  "16": 280, // Kung Pao Chicken
  "17": 320, // Sweet and Sour Pork
  "18": 350, // Beef and Broccoli
  "19": 180, // Vegetable Fried Rice
  "20": 300, // General Tso's Chicken

  // ITALIAN CUISINE
  "21": 340, // Spaghetti Carbonara
  "22": 420, // Chicken Parmigiana
  "23": 320, // Fettuccine Alfredo
  "24": 380, // Lasagna Bolognese
  "25": 360, // Risotto Mushroom

  // MEXICAN CUISINE
  "26": 260, // Chicken Quesadilla
  "27": 220, // Beef Tacos (3pc) - this one wasn't updated in the script above, need to fix
  "28": 290, // Chicken Burrito Bowl
  "29": 240, // Veggie Enchiladas
  "30": 310, // Carnitas Burrito

  // JAPANESE CUISINE
  "31": 450, // Salmon Sushi Roll
  "32": 320, // Chicken Teriyaki Bowl
  "33": 280, // Vegetable Tempura
  "34": 350, // Chicken Ramen
  "35": 380, // California Roll

  // AMERICAN CUISINE
  "36": 340, // Buffalo Wings
  "37": 220, // Mac and Cheese
  "38": 580, // BBQ Ribs
  "39": 380, // Philly Cheesesteak

  // DESSERTS & SWEETS
  "91": 180, // Tiramisu
  "92": 220, // Crème Brûlée
  "93": 150, // Baklava
  "94": 80,  // Gulab Jamun (2pc)
  "95": 90,  // Kulfi (2pc)

  // BEVERAGES
  "96": 40,  // Masala Chai
  "97": 60,  // Fresh Lime Soda
  "98": 80,  // Mango Lassi
  "99": 70,  // Fresh Coconut Water
  "100": 120 // Cold Coffee
};

async function migratePricing() {
  console.log('🔄 Starting order pricing migration...');
  
  try {
    // First, update the food items in the database with new pricing
    console.log('📊 Updating food items pricing in database...');
    
    for (const [foodItemId, newPrice] of Object.entries(newPricingMap)) {
      await db
        .update(foodItems)
        .set({ 
          price: newPrice.toString(),
          updatedAt: new Date()
        })
        .where(eq(foodItems.id, foodItemId));
    }

    console.log('✅ Food items pricing updated in database');

    // Get all order items that need price updates
    console.log('📋 Fetching existing order items...');
    
    const allOrderItems = await db
      .select({
        id: orderItems.id,
        foodItemId: orderItems.foodItemId,
        quantity: orderItems.quantity,
        currentPrice: orderItems.price
      })
      .from(orderItems);

    console.log(`📦 Found ${allOrderItems.length} order items to potentially update`);

    let updatedCount = 0;
    let totalValueBefore = 0;
    let totalValueAfter = 0;

    // Update each order item with the new pricing
    for (const orderItem of allOrderItems) {
      const newPrice = newPricingMap[orderItem.foodItemId];
      
      if (newPrice) {
        const currentPriceNum = parseFloat(orderItem.currentPrice);
        const newPricePerItem = newPrice;
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

        updatedCount++;
        
        console.log(`Updated order item ${orderItem.id}: ₹${currentPriceNum} → ₹${newPricePerItem} (qty: ${orderItem.quantity})`);
      }
    }

    // Now update the order totals based on the new item prices
    console.log('💰 Recalculating order totals...');
    
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

    // Summary
    console.log('\n📈 MIGRATION SUMMARY:');
    console.log('==================');
    console.log(`✅ Order items updated: ${updatedCount}`);
    console.log(`✅ Orders recalculated: ${ordersUpdated}`);
    console.log(`💵 Total value before: ₹${totalValueBefore.toFixed(2)}`);
    console.log(`💰 Total value after: ₹${totalValueAfter.toFixed(2)}`);
    console.log(`📊 Value change: ${totalValueAfter > totalValueBefore ? '+' : ''}₹${(totalValueAfter - totalValueBefore).toFixed(2)}`);
    console.log(`📈 Percentage change: ${((totalValueAfter - totalValueBefore) / totalValueBefore * 100).toFixed(2)}%`);
    
    console.log('\n🎉 Order pricing migration completed successfully!');
    console.log('📋 All order history now reflects realistic Indian market pricing');
    console.log('🔄 Admin analytics and user dashboards will show consistent pricing');

  } catch (error) {
    console.error('❌ Error during pricing migration:', error);
    throw error;
  }
}

// Function to verify the migration
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check a few sample order items
    const sampleOrderItems = await db
      .select()
      .from(orderItems)
      .limit(10);

    console.log('\n📋 Sample order items after migration:');
    sampleOrderItems.forEach(item => {
      const newPrice = newPricingMap[item.foodItemId];
      const status = newPrice && parseFloat(item.price) === newPrice ? '✅' : '❌';
      console.log(`${status} Order Item ${item.id}: Food ID ${item.foodItemId}, Price: ₹${item.price}`);
    });

    console.log('\n✅ Migration verification completed');
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

// Run the migration
async function main() {
  try {
    await migratePricing();
    await verifyMigration();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { migratePricing, verifyMigration, newPricingMap };
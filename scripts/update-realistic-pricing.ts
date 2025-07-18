// Script to update food items with realistic Indian market pricing
import fs from 'fs';
import path from 'path';

// Realistic Indian market pricing guide
const realisticPricing: Record<string, { price: string; originalPrice?: string; discount?: number }> = {
  // BURGERS & SANDWICHES - Premium restaurant pricing
  "Truffle Mushroom Burger": { price: "₹450", originalPrice: "₹550", discount: 18 },
  "Classic Cheeseburger": { price: "₹280", originalPrice: "₹350", discount: 20 },
  "BBQ Bacon Burger": { price: "₹380", originalPrice: "₹450", discount: 16 },
  "Veggie Deluxe Burger": { price: "₹220", originalPrice: "₹280", discount: 21 },
  "Spicy Jalapeño Burger": { price: "₹320", originalPrice: "₹390", discount: 18 },

  // PIZZA - Restaurant/Delivery pricing
  "Margherita Supreme Pizza": { price: "₹350", originalPrice: "₹450", discount: 22 },
  "Pepperoni Classic": { price: "₹420", originalPrice: "₹520", discount: 19 },
  "BBQ Chicken Pizza": { price: "₹480", originalPrice: "₹580", discount: 17 },
  "Vegetarian Supreme": { price: "₹380", originalPrice: "₹450", discount: 16 },
  "Meat Lovers Pizza": { price: "₹550", originalPrice: "₹650", discount: 15 },

  // INDIAN CUISINE - Authentic pricing
  "Butter Chicken": { price: "₹320", originalPrice: "₹390", discount: 18 },
  "Chicken Tikka Masala": { price: "₹340", originalPrice: "₹420", discount: 19 },
  "Palak Paneer": { price: "₹240", originalPrice: "₹300", discount: 20 },
  "Chicken Biryani": { price: "₹380", originalPrice: "₹450", discount: 16 },
  "Dal Makhani": { price: "₹180", originalPrice: "₹220", discount: 18 },

  // CHINESE CUISINE - Restaurant pricing
  "Kung Pao Chicken": { price: "₹280", originalPrice: "₹340", discount: 18 },
  "Sweet and Sour Pork": { price: "₹320", originalPrice: "₹390", discount: 18 },
  "Beef and Broccoli": { price: "₹350", originalPrice: "₹420", discount: 17 },
  "Vegetable Fried Rice": { price: "₹180", originalPrice: "₹220", discount: 18 },
  "General Tso's Chicken": { price: "₹300", originalPrice: "₹360", discount: 17 },

  // ITALIAN CUISINE - Restaurant pricing
  "Spaghetti Carbonara": { price: "₹340", originalPrice: "₹420", discount: 19 },
  "Chicken Parmigiana": { price: "₹420", originalPrice: "₹520", discount: 19 },
  "Fettuccine Alfredo": { price: "₹320", originalPrice: "₹390", discount: 18 },
  "Lasagna Bolognese": { price: "₹380", originalPrice: "₹460", discount: 17 },
  "Risotto Mushroom": { price: "₹360", originalPrice: "₹440", discount: 18 },

  // MEXICAN CUISINE - Restaurant pricing
  "Chicken Quesadilla": { price: "₹260", originalPrice: "₹320", discount: 19 },
  "Beef Tacos (3pc)": { price: "₹220", originalPrice: "₹280", discount: 21 },
  "Chicken Burrito Bowl": { price: "₹290", originalPrice: "₹350", discount: 17 },
  "Veggie Enchiladas": { price: "₹240", originalPrice: "₹300", discount: 20 },
  "Carnitas Burrito": { price: "₹310", originalPrice: "₹380", discount: 18 },

  // JAPANESE CUISINE - Premium pricing
  "Salmon Sushi Roll": { price: "₹450", originalPrice: "₹550", discount: 18 },
  "Chicken Teriyaki Bowl": { price: "₹320", originalPrice: "₹390", discount: 18 },
  "Vegetable Tempura": { price: "₹280", originalPrice: "₹340", discount: 18 },
  "Chicken Ramen": { price: "₹350", originalPrice: "₹420", discount: 17 },
  "California Roll": { price: "₹380", originalPrice: "₹460", discount: 17 },

  // AMERICAN CUISINE - Restaurant pricing
  "Buffalo Wings": { price: "₹340", originalPrice: "₹420", discount: 19 },
  "Mac and Cheese": { price: "₹220", originalPrice: "₹280", discount: 21 },
  "BBQ Ribs": { price: "₹580", originalPrice: "₹720", discount: 19 },
  "Philly Cheesesteak": { price: "₹380", originalPrice: "₹460", discount: 17 },

  // DESSERTS - Cafe/Restaurant pricing
  "Tiramisu": { price: "₹180", originalPrice: "₹220", discount: 18 },
  "Crème Brûlée": { price: "₹220", originalPrice: "₹280", discount: 21 },
  "Baklava": { price: "₹150", originalPrice: "₹180", discount: 17 },
  "Gulab Jamun (2pc)": { price: "₹80", originalPrice: "₹100", discount: 20 },
  "Kulfi (2pc)": { price: "₹90", originalPrice: "₹110", discount: 18 },

  // BEVERAGES - Cafe pricing
  "Masala Chai": { price: "₹40", originalPrice: "₹50", discount: 20 },
  "Fresh Lime Soda": { price: "₹60", originalPrice: "₹80", discount: 25 },
  "Mango Lassi": { price: "₹80", originalPrice: "₹100", discount: 20 },
  "Fresh Coconut Water": { price: "₹70", originalPrice: "₹90", discount: 22 },
  "Cold Coffee": { price: "₹120", originalPrice: "₹150", discount: 20 }
};

// Function to update the food items file
function updateFoodItemPricing() {
  const filePath = path.join(process.cwd(), 'app/data/food-items.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Update each item's pricing
  Object.entries(realisticPricing).forEach(([itemName, pricing]) => {
    // Find the item by name and update its pricing
    const namePattern = new RegExp(`name: "${itemName}",`, 'g');
    if (content.match(namePattern)) {
      // Update price
      const pricePattern = new RegExp(`(name: "${itemName}",[\\s\\S]*?)price: "₹\\d+",`, 'g');
      content = content.replace(pricePattern, `$1price: "${pricing.price}",`);
      
      // Update originalPrice if exists
      if (pricing.originalPrice) {
        const originalPricePattern = new RegExp(`(name: "${itemName}",[\\s\\S]*?)originalPrice: "₹\\d+",`, 'g');
        content = content.replace(originalPricePattern, `$1originalPrice: "${pricing.originalPrice}",`);
        
        // Add originalPrice if it doesn't exist
        if (!content.includes(`originalPrice: "${pricing.originalPrice}"`)) {
          const insertPattern = new RegExp(`(name: "${itemName}",[\\s\\S]*?price: "${pricing.price}",)`, 'g');
          content = content.replace(insertPattern, `$1\n    originalPrice: "${pricing.originalPrice}",`);
        }
      }
      
      // Update discount
      if (pricing.discount) {
        const discountPattern = new RegExp(`(name: "${itemName}",[\\s\\S]*?)discount: \\d+,`, 'g');
        content = content.replace(discountPattern, `$1discount: ${pricing.discount},`);
        
        // Add discount if it doesn't exist
        if (!content.includes(`discount: ${pricing.discount}`)) {
          const insertPattern = new RegExp(`(name: "${itemName}",[\\s\\S]*?originalPrice: "${pricing.originalPrice}",)`, 'g');
          content = content.replace(insertPattern, `$1\n    discount: ${pricing.discount},`);
        }
      }
    }
  });

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Food item pricing updated successfully!');
  
  // Log summary
  console.log('\n📊 Pricing Summary:');
  Object.entries(realisticPricing).forEach(([itemName, pricing]) => {
    const discount = pricing.discount ? ` (${pricing.discount}% off)` : '';
    console.log(`${itemName}: ${pricing.price}${discount}`);
  });
}

// Run the update
updateFoodItemPricing();
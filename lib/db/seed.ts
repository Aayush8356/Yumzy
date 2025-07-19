import { db } from './index'
import { categories, foodItems, users, notifications, cart } from './schema'
import { eq } from 'drizzle-orm'
import { foodItems as staticFoodItems, getCategoriesWithCounts } from '@/data/food-items'

// Generate categories from the food items data
const generateCategoriesFromFoodItems = () => {
  const categoriesWithCounts = getCategoriesWithCounts(staticFoodItems)
  const categoryImages: Record<string, string> = {
    'Burgers': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop',
    'Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
    'Asian': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
    'Healthy': 'https://images.unsplash.com/photo-1559847844-d721426d6924?w=300&h=200&fit=crop',
    'Desserts': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop',
    'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
    'Indian': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop',
    'Mexican': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=200&fit=crop',
    'Italian': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
    'Wraps': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
    'Sandwiches': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop'
  }

  const categoryDescriptions: Record<string, string> = {
    'Burgers': 'Juicy burgers with fresh ingredients',
    'Pizza': 'Wood-fired pizzas with authentic Italian flavors', 
    'Asian': 'Authentic Asian dishes with traditional recipes',
    'Healthy': 'Nutritious bowls packed with fresh ingredients',
    'Desserts': 'Sweet treats and decadent desserts',
    'Beverages': 'Refreshing drinks and specialty beverages',
    'Indian': 'Authentic Indian cuisine with aromatic spices',
    'Mexican': 'Bold Mexican flavors with fresh ingredients',
    'Italian': 'Classic Italian dishes and pasta',
    'Wraps': 'Fresh wraps and portable meals',
    'Sandwiches': 'Gourmet sandwiches and subs'
  }

  return categoriesWithCounts.map(({ category }) => ({
    name: category,
    description: categoryDescriptions[category] || `Delicious ${category.toLowerCase()} dishes`,
    image: categoryImages[category] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop'
  }))
}

const sampleCategories = generateCategoriesFromFoodItems()

// Convert static food items to database format
const generateDatabaseFoodItems = () => {
  return staticFoodItems.map(item => ({
    name: item.name,
    description: item.description,
    shortDescription: item.description.length > 100 
      ? item.description.substring(0, 100) + '...' 
      : item.description,
    price: item.price.replace('$', ''),
    originalPrice: item.originalPrice?.replace('$', ''),
    discount: item.discount,
    rating: item.rating.toString(),
    reviewCount: Math.floor(Math.random() * 500) + 50,
    cookTime: item.cookTime,
    difficulty: 'Medium',
    spiceLevel: item.spiceLevel === 'mild' ? 1 : 
               item.spiceLevel === 'medium' ? 2 :
               item.spiceLevel === 'hot' ? 4 :
               item.spiceLevel === 'extra-hot' ? 5 : 1,
    servingSize: '1 portion',
    calories: item.calories || 500,
    image: item.image,
    images: [item.image],
    ingredients: generateIngredients(item.category, item.isVegetarian),
    allergens: generateAllergens(item.category),
    nutritionInfo: {
      calories: item.calories || 500,
      protein: Math.floor((item.calories || 500) * 0.15 / 4),
      carbs: Math.floor((item.calories || 500) * 0.50 / 4),
      fat: Math.floor((item.calories || 500) * 0.30 / 9),
      fiber: Math.floor(Math.random() * 10) + 2,
      sugar: Math.floor(Math.random() * 15) + 5
    },
    tags: generateTags(item),
    isVegetarian: item.isVegetarian,
    isVegan: item.isVegan || false,
    isGlutenFree: Math.random() > 0.7,
    isSpicy: item.spiceLevel === 'hot' || item.spiceLevel === 'extra-hot',
    isPopular: item.isHot || Math.random() > 0.8,
  }))
}

// Helper functions
function generateIngredients(category: string, isVegetarian: boolean): string[] {
  const baseIngredients: Record<string, string[]> = {
    'Burgers': isVegetarian 
      ? ['Black bean patty', 'Lettuce', 'Tomato', 'Onion', 'Vegan mayo']
      : ['Beef patty', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Mayo'],
    'Pizza': ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Basil', 'Olive oil'],
    'Asian': ['Rice', 'Soy sauce', 'Ginger', 'Garlic', 'Vegetables'],
    'Healthy': ['Quinoa', 'Mixed greens', 'Avocado', 'Cherry tomatoes', 'Olive oil'],
    'Desserts': ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla'],
    'Wraps': ['Tortilla', 'Lettuce', 'Tomato', 'Cheese', 'Sauce'],
    'Sandwiches': ['Bread', 'Lettuce', 'Tomato', 'Mayo'],
    'Indian': ['Basmati rice', 'Spices', 'Onion', 'Garlic', 'Ginger'],
    'Mexican': ['Corn tortilla', 'Beans', 'Cheese', 'Salsa', 'Avocado'],
    'Italian': ['Pasta', 'Tomatoes', 'Garlic', 'Basil', 'Parmesan'],
    'Beverages': ['Fresh ingredients', 'Natural flavors']
  }
  
  return baseIngredients[category] || ['Fresh ingredients', 'Premium spices']
}

function generateAllergens(category: string): string[] {
  const categoryAllergens: Record<string, string[]> = {
    'Pizza': ['Gluten', 'Dairy'],
    'Burgers': ['Gluten', 'Dairy'],
    'Desserts': ['Gluten', 'Dairy', 'Eggs'],
    'Asian': ['Soy', 'Gluten'],
    'Italian': ['Gluten', 'Dairy'],
    'Indian': ['Dairy'],
    'Mexican': ['Dairy']
  }
  
  return categoryAllergens[category] || []
}

function generateTags(item: any): string[] {
  const tags = []
  
  if (item.isVegetarian) tags.push('Vegetarian')
  if (item.isVegan) tags.push('Vegan')
  if (item.isHot) tags.push('Popular')
  if (item.spiceLevel === 'hot' || item.spiceLevel === 'extra-hot') tags.push('Spicy')
  if (item.calories && item.calories < 400) tags.push('Light')
  if (item.discount && item.discount > 0) tags.push('On Sale')
  
  return tags
}

const sampleFoodItems = generateDatabaseFoodItems()

// Sample users - only create if SEED_DEMO_DATA environment variable is set
const createSampleUsers = () => {
  const shouldSeedDemo = process.env.SEED_DEMO_DATA === 'true' || process.env.ENABLE_DEMO_DATA === 'true'
  
  if (!shouldSeedDemo) {
    console.log('ℹ️  Skipping demo users (set SEED_DEMO_DATA=true to enable)')
    return []
  }
  
  return [
    {
      email: 'guptaaayush537@gmail.com',
      name: 'Aayush Gupta',
      phone: '+1 (555) 123-4567',
      // No avatar - will use initials-based avatar generated in AuthContext
      role: 'admin',
      isVerified: true,
      preferences: {
        notifications: true,
        newsletter: true,
        dietaryRestrictions: [],
      },
    },
    {
      email: 'demo@yumzy.com',
      name: 'Demo User',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'user',
      isVerified: true,
      preferences: {
        notifications: true,
        newsletter: false,
        dietaryRestrictions: ['Vegetarian'],
      },
    },
  ]
}

const sampleUsers = createSampleUsers()

// Sample notifications - only create if SEED_DEMO_DATA environment variable is set
const createSampleNotifications = () => {
  const shouldSeedDemo = process.env.SEED_DEMO_DATA === 'true' || process.env.ENABLE_DEMO_DATA === 'true'
  
  if (!shouldSeedDemo) {
    console.log('ℹ️  Skipping demo notifications (set SEED_DEMO_DATA=true to enable)')
    return []
  }
  
  return [
    {
      type: 'order_update',
      title: 'Order Delivered!',
      message: 'Your order #ORD-001 has been successfully delivered. Enjoy your meal!',
      data: { orderId: 'ORD-001', status: 'delivered' },
      isImportant: true,
    },
    {
      type: 'promo',
      title: 'Special Offer!',
      message: '20% off on all pizza orders this weekend. Use code PIZZA20',
      data: { code: 'PIZZA20', discount: 20 },
      isImportant: false,
    },
    {
      type: 'system',
      title: 'Welcome to Yumzy!',
      message: 'Thank you for joining Yumzy. Explore our menu and enjoy delicious food delivery.',
      data: {},
      isImportant: false,
    },
  ]
}

const sampleNotifications = createSampleNotifications()

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Check if data already exists before cleaning
    const existingCategories = await db.select().from(categories).limit(1)
    const existingFoodItems = await db.select().from(foodItems).limit(1)
    
    if (existingCategories.length > 0 || existingFoodItems.length > 0) {
      console.log('ℹ️  Data already exists. Skipping clean up to preserve existing data.')
      console.log('ℹ️  To force re-seed, manually truncate tables first.')
      return true
    }

    // Clean existing data only if no important data exists
    try {
      await db.delete(cart)
      await db.delete(notifications) 
      await db.delete(users)
      await db.delete(foodItems)
      await db.delete(categories)
      console.log('✅ Cleaned existing data')
    } catch (cleanError) {
      console.log('ℹ️  Could not clean existing data, proceeding with insertion...')
    }

    // Insert categories
    console.log('📂 Inserting categories...')
    const insertedCategories = await db.insert(categories).values(sampleCategories).returning()
    console.log(`✅ Inserted ${insertedCategories.length} categories`)

    // Insert food items with category references
    console.log('🍕 Inserting food items...')
    const foodItemsWithCategoryIds = await Promise.all(
      sampleFoodItems.map(async (item, index) => {
        // Get the original item to access category
        const originalItem = staticFoodItems[index]
        const category = insertedCategories.find(cat => cat.name === originalItem.category)
        if (!category) {
          throw new Error(`Category ${originalItem.category} not found`)
        }
        
        return {
          ...item,
          categoryId: category.id,
        }
      })
    )

    const insertedFoodItems = await db.insert(foodItems).values(foodItemsWithCategoryIds).returning()
    console.log(`✅ Inserted ${insertedFoodItems.length} food items`)

    // Insert users (only if demo data is enabled)
    if (sampleUsers.length > 0) {
      const insertedUsers = await db.insert(users).values(sampleUsers).returning()
      console.log(`✅ Inserted ${insertedUsers.length} users`)

      // Insert notifications for demo user
      const demoUser = insertedUsers.find(user => user.email === 'demo@yumzy.com')
      if (demoUser && sampleNotifications.length > 0) {
        console.log('🔔 Inserting notifications...')
        const notificationsWithUserId = sampleNotifications.map(notification => ({
          ...notification,
          userId: demoUser.id,
        }))
        
        const insertedNotifications = await db.insert(notifications).values(notificationsWithUserId).returning()
        console.log(`✅ Inserted ${insertedNotifications.length} notifications`)
      }
    }

    console.log('🎉 Database seeding completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
// For ES modules, we check if this is the main module using import.meta
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
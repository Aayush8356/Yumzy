import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories, foodItems } from '@/lib/db/schema'

export async function GET() {
  return handleSeed()
}

export async function POST() {
  return handleSeed()
}

async function handleSeed() {
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1)
    const existingFoodItems = await db.select().from(foodItems).limit(1)
    
    if (existingCategories.length > 0 || existingFoodItems.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already exists',
        existingCategories: existingCategories.length,
        existingFoodItems: existingFoodItems.length
      })
    }

    // Insert basic categories
    const sampleCategories = [
      {
        name: 'Burgers',
        description: 'Juicy burgers with fresh ingredients',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop'
      },
      {
        name: 'Pizza',
        description: 'Wood-fired pizzas with authentic Italian flavors',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop'
      },
      {
        name: 'Asian',
        description: 'Authentic Asian dishes with traditional recipes',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop'
      },
      {
        name: 'Indian',
        description: 'Authentic Indian cuisine with aromatic spices',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop'
      }
    ]

    const insertedCategories = await db.insert(categories).values(sampleCategories).returning()

    // Insert basic food items
    const burgerCategory = insertedCategories.find(cat => cat.name === 'Burgers')
    const pizzaCategory = insertedCategories.find(cat => cat.name === 'Pizza')
    const asianCategory = insertedCategories.find(cat => cat.name === 'Asian')
    const indianCategory = insertedCategories.find(cat => cat.name === 'Indian')

    const sampleFoodItems = [
      {
        name: "Truffle Mushroom Burger",
        description: "Premium beef patty with truffle mushroom sauce, aged cheese, and crispy onions.",
        shortDescription: "Premium beef patty with truffle mushroom sauce, aged cheese, and crispy onions.",
        price: "18.99",
        originalPrice: "24.99",
        discount: 25,
        rating: "4.9",
        reviewCount: 245,
        cookTime: "15-20 min",
        difficulty: "Medium",
        spiceLevel: 1,
        servingSize: "1 portion",
        calories: 650,
        image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&h=400&fit=crop"],
        ingredients: ["Beef patty", "Truffle mushroom sauce", "Aged cheese", "Crispy onions", "Lettuce"],
        allergens: ["Gluten", "Dairy"],
        nutritionInfo: {
          calories: 650,
          protein: 35,
          carbs: 45,
          fat: 30,
          fiber: 5,
          sugar: 8
        },
        tags: ["Popular", "Premium"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        categoryId: burgerCategory?.id
      },
      {
        name: "Margherita Pizza",
        description: "Classic Italian pizza with fresh mozzarella, tomato sauce, and basil.",
        shortDescription: "Classic Italian pizza with fresh mozzarella, tomato sauce, and basil.",
        price: "16.99",
        rating: "4.8",
        reviewCount: 312,
        cookTime: "18-22 min",
        difficulty: "Medium",
        spiceLevel: 0,
        servingSize: "1 pizza",
        calories: 800,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop"],
        ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella cheese", "Fresh basil", "Olive oil"],
        allergens: ["Gluten", "Dairy"],
        nutritionInfo: {
          calories: 800,
          protein: 32,
          carbs: 95,
          fat: 28,
          fiber: 4,
          sugar: 12
        },
        tags: ["Vegetarian", "Classic"],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        categoryId: pizzaCategory?.id
      },
      {
        name: "Chicken Ramen",
        description: "Rich chicken broth with tender noodles, soft-boiled egg, and fresh vegetables.",
        shortDescription: "Rich chicken broth with tender noodles, soft-boiled egg, and fresh vegetables.",
        price: "14.99",
        rating: "4.7",
        reviewCount: 189,
        cookTime: "20-25 min",
        difficulty: "Medium",
        spiceLevel: 2,
        servingSize: "1 bowl",
        calories: 620,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop"],
        ingredients: ["Chicken broth", "Ramen noodles", "Soft-boiled egg", "Green onions", "Bamboo shoots"],
        allergens: ["Gluten", "Eggs"],
        nutritionInfo: {
          calories: 620,
          protein: 28,
          carbs: 65,
          fat: 22,
          fiber: 3,
          sugar: 6
        },
        tags: ["Comfort Food", "Hot"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: true,
        isPopular: true,
        categoryId: asianCategory?.id
      },
      {
        name: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato-based curry sauce with aromatic spices.",
        shortDescription: "Tender chicken in a rich, creamy tomato-based curry sauce with aromatic spices.",
        price: "17.99",
        rating: "4.9",
        reviewCount: 298,
        cookTime: "25-30 min",
        difficulty: "Medium",
        spiceLevel: 3,
        servingSize: "1 portion",
        calories: 720,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop"],
        ingredients: ["Chicken", "Tomato sauce", "Heavy cream", "Butter", "Indian spices", "Basmati rice"],
        allergens: ["Dairy"],
        nutritionInfo: {
          calories: 720,
          protein: 42,
          carbs: 55,
          fat: 35,
          fiber: 4,
          sugar: 15
        },
        tags: ["Popular", "Spicy", "Creamy"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isSpicy: true,
        isPopular: true,
        categoryId: indianCategory?.id
      },
      {
        name: "Veggie Supreme Pizza",
        description: "Loaded with bell peppers, mushrooms, olives, onions, and mozzarella cheese.",
        shortDescription: "Loaded with bell peppers, mushrooms, olives, onions, and mozzarella cheese.",
        price: "18.99",
        rating: "4.6",
        reviewCount: 156,
        cookTime: "20-25 min",
        difficulty: "Medium",
        spiceLevel: 0,
        servingSize: "1 pizza",
        calories: 750,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop"],
        ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Bell peppers", "Mushrooms", "Olives", "Onions"],
        allergens: ["Gluten", "Dairy"],
        nutritionInfo: {
          calories: 750,
          protein: 28,
          carbs: 85,
          fat: 32,
          fiber: 6,
          sugar: 18
        },
        tags: ["Vegetarian", "Healthy"],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: false,
        categoryId: pizzaCategory?.id
      },
      {
        name: "Beef Teriyaki Bowl",
        description: "Grilled beef with teriyaki sauce served over steamed rice with vegetables.",
        shortDescription: "Grilled beef with teriyaki sauce served over steamed rice with vegetables.",
        price: "16.99",
        rating: "4.5",
        reviewCount: 134,
        cookTime: "18-22 min",
        difficulty: "Medium",
        spiceLevel: 1,
        servingSize: "1 bowl",
        calories: 680,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
        images: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop"],
        ingredients: ["Beef", "Teriyaki sauce", "Steamed rice", "Broccoli", "Carrots", "Sesame seeds"],
        allergens: ["Soy", "Gluten"],
        nutritionInfo: {
          calories: 680,
          protein: 38,
          carbs: 62,
          fat: 28,
          fiber: 4,
          sugar: 22
        },
        tags: ["Protein Rich"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: false,
        categoryId: asianCategory?.id
      }
    ]

    const insertedFoodItems = await db.insert(foodItems).values(sampleFoodItems).returning()

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      categoriesInserted: insertedCategories.length,
      foodItemsInserted: insertedFoodItems.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
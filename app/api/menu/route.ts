import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { foodItems, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  professionalCategories, 
  professionalFilters, 
  mapFoodItemToCategories,
  getPrimaryCategories,
  getCuisineCategories 
} from '@/data/professional-categories'
import { ImageManager, ImageUrls } from '@/lib/image-manager'
import { getFallbackImageForItem } from '@/data/fallback-images'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    
    // Check authorization header for logged-in users
    const authHeader = request.headers.get('Authorization')
    const isAuthenticated = !!authHeader
    
    // Query parameters
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const primaryCategory = searchParams.get('primaryCategory') // veg/non-veg/vegan/trending
    const cuisineCategory = searchParams.get('cuisineCategory') // indian/italian/asian etc
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const isVegetarian = searchParams.get('vegetarian') === 'true'
    const isNonVegetarian = searchParams.get('nonVegetarian') === 'true'
    const isVegan = searchParams.get('vegan') === 'true'
    const isGlutenFree = searchParams.get('glutenFree') === 'true'
    const isSpicy = searchParams.get('spicy') === 'true'
    const isPopular = searchParams.get('popular') === 'true'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || (isAuthenticated ? '12' : '6'))
    const isPublicOnly = searchParams.get('public') === 'true'
    
    // Remove artificial delay for better performance
    
    // Build database query with filters for better performance
    let query = db.select({
      id: foodItems.id,
      name: foodItems.name,
      description: foodItems.description,
      shortDescription: foodItems.shortDescription,
      price: foodItems.price,
      originalPrice: foodItems.originalPrice,
      discount: foodItems.discount,
      rating: foodItems.rating,
      reviewCount: foodItems.reviewCount,
      cookTime: foodItems.cookTime,
      difficulty: foodItems.difficulty,
      spiceLevel: foodItems.spiceLevel,
      servingSize: foodItems.servingSize,
      calories: foodItems.calories,
      image: foodItems.image,
      images: foodItems.images,
      ingredients: foodItems.ingredients,
      allergens: foodItems.allergens,
      nutritionInfo: foodItems.nutritionInfo,
      tags: foodItems.tags,
      isVegetarian: foodItems.isVegetarian,
      isVegan: foodItems.isVegan,
      isGlutenFree: foodItems.isGlutenFree,
      isSpicy: foodItems.isSpicy,
      isPopular: foodItems.isPopular,
      isAvailable: foodItems.isAvailable,
      categoryId: foodItems.categoryId,
      createdAt: foodItems.createdAt,
      updatedAt: foodItems.updatedAt,
      categoryName: categories.name
    }).from(foodItems)
    .leftJoin(categories, eq(foodItems.categoryId, categories.id))
    .where(eq(foodItems.isAvailable, true)) // Only available items
    
    // Get food items from database
    const allFoodItems = await query
    
    // If not authenticated, the limit is already set to 6.
    // For authenticated users, all items are available.
    let menuItems = allFoodItems
    
    // Transform database items to match the expected format with professional categories
    let filteredItems = menuItems.map(item => {
      const professionalCats = mapFoodItemToCategories(item)
      
      // Professional image handling
      const primaryImage = item.image || getFallbackImageForItem(professionalCats)
      const fallbackImage = getFallbackImageForItem(professionalCats)
      
      // Generate reliable image URLs with fallback
      const optimizedImage = item.image || fallbackImage
      
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        shortDescription: item.shortDescription || item.description || '',
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount,
        rating: item.rating,
        reviewCount: item.reviewCount,
        cookTime: item.cookTime,
        difficulty: item.difficulty,
        spiceLevel: item.spiceLevel,
        servingSize: item.servingSize,
        calories: item.calories,
        image: primaryImage,
        images: item.images || [primaryImage],
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        nutritionInfo: item.nutritionInfo || {
          calories: item.calories,
          protein: 20,
          carbs: 30,
          fat: 15,
          fiber: 5,
          sugar: 10
        },
        tags: item.tags || [],
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isSpicy: item.isSpicy,
        isPopular: item.isPopular,
        professionalCategories: professionalCats, // New professional categorization
        category: {
          id: item.categoryName?.toLowerCase().replace(/\s+/g, '-') || 'general',
          name: item.categoryName || 'General',
          description: `Delicious ${item.categoryName?.toLowerCase() || 'food'} dishes`,
          image: optimizedImage
        }
      }
    })
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.shortDescription.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply professional primary category filter (veg/non-veg/vegan/trending)
    if (primaryCategory) {
      filteredItems = filteredItems.filter(item => 
        item.professionalCategories.includes(primaryCategory)
      )
    }
    
    // Apply cuisine category filter
    if (cuisineCategory) {
      filteredItems = filteredItems.filter(item => 
        item.professionalCategories.includes(cuisineCategory)
      )
    }
    
    // Apply legacy category filter (for backward compatibility)
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category.name.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Apply dietary filters
    if (isVegetarian) filteredItems = filteredItems.filter(item => item.isVegetarian)
    if (isNonVegetarian) filteredItems = filteredItems.filter(item => !item.isVegetarian)
    if (isVegan) filteredItems = filteredItems.filter(item => item.isVegan)
    if (isGlutenFree) filteredItems = filteredItems.filter(item => item.isGlutenFree)
    if (isSpicy) filteredItems = filteredItems.filter(item => item.isSpicy)
    if (isPopular) filteredItems = filteredItems.filter(item => item.isPopular)
    
    // Apply price range filter
    if (minPrice) {
      filteredItems = filteredItems.filter(item => parseFloat(item.price) >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filteredItems = filteredItems.filter(item => parseFloat(item.price) <= parseFloat(maxPrice))
    }
    
    // Apply sorting
    filteredItems.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price)
          bValue = parseFloat(b.price)
          break
        case 'rating':
          aValue = parseFloat(a.rating || '0')
          bValue = parseFloat(b.rating || '0')
          break
        case 'popularity':
          aValue = a.reviewCount || 0
          bValue = b.reviewCount || 0
          break
        case 'calories':
          aValue = a.calories || 0
          bValue = b.calories || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
    
    // Calculate pagination
    const total = filteredItems.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedItems = filteredItems.slice(offset, offset + limit)
    
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
      },
      filters: {
        search,
        category,
        primaryCategory,
        cuisineCategory,
        sortBy,
        sortOrder,
        isVegetarian,
        isNonVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        isPopular,
        minPrice,
        maxPrice,
      },
      isAuthenticated,
      totalAvailable: allFoodItems.length,
      // Professional categorization system
      professionalCategories: {
        primary: getPrimaryCategories(),
        cuisine: getCuisineCategories(),
        all: professionalCategories
      },
      professionalFilters
    })
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// Helper function to generate mock ingredients based on category
function generateMockIngredients(category: string, isVegetarian: boolean): string[] {
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

// Helper function to generate mock allergens
function generateMockAllergens(category: string): string[] {
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

// Helper function to generate mock tags
function generateMockTags(item: any): string[] {
  const tags = []
  
  if (item.isVegetarian) tags.push('Vegetarian')
  if (item.isVegan) tags.push('Vegan')
  if (item.isHot) tags.push('Popular')
  if (item.spiceLevel === 'hot' || item.spiceLevel === 'extra-hot') tags.push('Spicy')
  if (item.calories && item.calories < 400) tags.push('Light')
  if (item.discount && item.discount > 0) tags.push('On Sale')
  
  return tags
}

// Unsplash API integration for professional food images
import { createApi } from 'unsplash-js'

// Initialize Unsplash API
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
})

export interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
    thumb: string
  }
  alt_description: string | null
  user: {
    name: string
    username: string
  }
}

// Cache for storing search results
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

interface CachedResult {
  images: UnsplashImage[]
  timestamp: number
}

const imageCache = new Map<string, CachedResult>()

// Enhanced search function with food-specific queries
export async function searchFoodImages(
  query: string,
  count: number = 10
): Promise<UnsplashImage[]> {
  const cacheKey = `${query}-${count}`
  
  // Check cache first
  const cached = imageCache.get(cacheKey) as CachedResult | undefined
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.images
  }

  try {
    // Enhanced food-specific search query
    const foodQuery = `${query} food delicious meal restaurant`
    
    const result = await unsplash.search.getPhotos({
      query: foodQuery,
      page: 1,
      perPage: count,
      orientation: 'landscape',
      orderBy: 'relevant',
    })

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors)
      return []
    }

    const images = result.response?.results?.map(photo => ({
      id: photo.id,
      urls: {
        small: photo.urls.small,
        regular: photo.urls.regular,
        thumb: photo.urls.thumb,
      },
      alt_description: photo.alt_description,
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
    })) || []

    // Cache the results
    imageCache.set(cacheKey, {
      images,
      timestamp: Date.now(),
    })

    return images
  } catch (error) {
    console.error('Error searching Unsplash:', error)
    return []
  }
}

// Get a specific food image based on food name and category
export async function getFoodImage(
  foodName: string,
  category: string = '',
  itemId: string = ''
): Promise<string> {
  // Create a comprehensive search query
  const searchTerms = [
    foodName,
    category,
    'food',
    'delicious',
    'restaurant'
  ].filter(Boolean).join(' ')

  try {
    const images = await searchFoodImages(searchTerms, 20)
    
    if (images.length === 0) {
      return getFallbackImage(category)
    }

    // Use item ID to get consistent but unique image selection
    const index = itemId ? 
      Math.abs(itemId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % images.length :
      Math.floor(Math.random() * images.length)

    return images[index]?.urls.regular || getFallbackImage(category)
  } catch (error) {
    console.error('Error getting food image:', error)
    return getFallbackImage(category)
  }
}

// Fallback images for when API fails
function getFallbackImage(category: string): string {
  const fallbacks: Record<string, string> = {
    'indian': 'https://images.unsplash.com/photo-1563379091339-03246963d638?w=400&h=300&fit=crop',
    'italian': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    'asian': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'mexican': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
    'american': 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop',
    'healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'desserts': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    'beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  }

  return fallbacks[category.toLowerCase()] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
}

// Batch get images for multiple food items
export async function batchGetFoodImages(
  items: Array<{ id: string; name: string; category: string }>
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()
  
  // Process items in batches to avoid rate limiting
  const batchSize = 5
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    const promises = batch.map(async (item) => {
      const imageUrl = await getFoodImage(item.name, item.category, item.id)
      return { id: item.id, url: imageUrl }
    })
    
    const results = await Promise.all(promises)
    results.forEach(({ id, url }) => {
      imageMap.set(id, url)
    })
    
    // Small delay between batches to be respectful to API
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return imageMap
}

// Pre-warm cache with common food searches
export async function prewarmImageCache(): Promise<void> {
  const commonSearches = [
    'pizza',
    'burger',
    'pasta',
    'salad',
    'biryani',
    'curry',
    'sushi',
    'tacos',
    'sandwich',
    'cake',
    'coffee',
    'ramen'
  ]

  // Fire and forget - don't wait for results
  commonSearches.forEach(query => {
    searchFoodImages(query, 10).catch(console.error)
  })
}
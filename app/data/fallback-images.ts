// Professional fallback image system for food delivery apps
// This system provides category-specific fallback images similar to major platforms

export const fallbackImages = {
  // Primary dietary categories
  vegetarian: '/images/fallback/vegetarian-dish.jpg',
  'non-vegetarian': '/images/fallback/non-vegetarian-dish.jpg',
  vegan: '/images/fallback/vegan-dish.jpg',
  
  // Cuisine-specific fallbacks
  'indian-cuisine': '/images/fallback/indian-food.jpg',
  italian: '/images/fallback/italian-food.jpg',
  asian: '/images/fallback/asian-food.jpg',
  mexican: '/images/fallback/mexican-food.jpg',
  american: '/images/fallback/american-food.jpg',
  'healthy-fresh': '/images/fallback/healthy-food.jpg',
  'desserts-sweets': '/images/fallback/desserts.jpg',
  beverages: '/images/fallback/beverages.jpg',
  
  // Course-specific fallbacks
  appetizers: '/images/fallback/appetizers.jpg',
  'main-course': '/images/fallback/main-course.jpg',
  desserts: '/images/fallback/desserts.jpg',
  'beverages-course': '/images/fallback/beverages.jpg',
  'snacks-sides': '/images/fallback/snacks.jpg',
  
  // Default fallback
  default: '/images/fallback/default-food.jpg'
}

// Generate data URLs for immediate fallback (base64 encoded placeholder images)
export const generatePlaceholderImage = (category: string, width: number = 300, height: number = 200): string => {
  const colors = {
    vegetarian: '#16a34a',
    'non-vegetarian': '#dc2626',
    vegan: '#059669',
    'indian-cuisine': '#f59e0b',
    italian: '#16a34a',
    asian: '#e11d48',
    mexican: '#eab308',
    american: '#2563eb',
    'healthy-fresh': '#65a30d',
    'desserts-sweets': '#ec4899',
    beverages: '#06b6d4',
    pizza: '#dc2626',
    chicken: '#f59e0b',
    biryani: '#f59e0b',
    beef: '#dc2626',
    seafood: '#06b6d4',
    burger: '#2563eb',
    pasta: '#16a34a',
    salad: '#65a30d',
    default: '#6b7280'
  }
  
  const color = colors[category as keyof typeof colors] || colors.default
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
        ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Professional image validation
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && (response.headers.get('content-type')?.startsWith('image/') || false)
  } catch {
    return false
  }
}

// Get appropriate fallback image based on food item categories
export const getFallbackImageForItem = (professionalCategories: string[]): string => {
  // Priority order: specific food > cuisine > primary dietary > course > default
  const specificFoodCategory = professionalCategories.find(cat => 
    ['pizza', 'chicken', 'biryani', 'beef', 'seafood', 'burger', 'pasta', 'salad'].includes(cat)
  )
  
  if (specificFoodCategory) {
    return generatePlaceholderImage(specificFoodCategory, 400, 300)
  }
  
  const cuisineCategory = professionalCategories.find(cat => 
    ['indian-cuisine', 'italian', 'asian', 'mexican', 'american', 'healthy-fresh', 'desserts-sweets', 'beverages'].includes(cat)
  )
  
  if (cuisineCategory) {
    return generatePlaceholderImage(cuisineCategory, 400, 300)
  }
  
  const primaryCategory = professionalCategories.find(cat => 
    ['vegetarian', 'non-vegetarian', 'vegan'].includes(cat)
  )
  
  if (primaryCategory) {
    return generatePlaceholderImage(primaryCategory, 400, 300)
  }
  
  return generatePlaceholderImage('default', 400, 300)
}
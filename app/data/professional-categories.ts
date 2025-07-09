// Professional Food Categorization System
// Industry-standard hierarchical categories for restaurants

export interface ProfessionalCategory {
  id: string
  name: string
  displayName: string
  icon: string
  description: string
  level: 'primary' | 'cuisine' | 'course'
  parentId?: string
  sortOrder: number
  colorScheme: {
    background: string
    text: string
    accent: string
  }
}

export const professionalCategories: ProfessionalCategory[] = [
  // LEVEL 1: PRIMARY DIETARY CATEGORIES (TOP PRIORITY)
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    displayName: '🌱 Vegetarian',
    icon: '🌱',
    description: 'Fresh vegetarian dishes with dairy products',
    level: 'primary',
    sortOrder: 1,
    colorScheme: {
      background: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-900 dark:text-green-100',
      accent: 'border-green-200 dark:border-green-800'
    }
  },
  {
    id: 'non-vegetarian',
    name: 'Non-Vegetarian',
    displayName: '🥩 Non-Vegetarian',
    icon: '🥩',
    description: 'Delicious meat, poultry, and seafood dishes',
    level: 'primary',
    sortOrder: 2,
    colorScheme: {
      background: 'bg-red-50 dark:bg-red-950',
      text: 'text-red-900 dark:text-red-100',
      accent: 'border-red-200 dark:border-red-800'
    }
  },
  {
    id: 'vegan',
    name: 'Vegan',
    displayName: '🌿 Vegan',
    icon: '🌿',
    description: '100% plant-based dishes with no animal products',
    level: 'primary',
    sortOrder: 3,
    colorScheme: {
      background: 'bg-emerald-50 dark:bg-emerald-950',
      text: 'text-emerald-900 dark:text-emerald-100',
      accent: 'border-emerald-200 dark:border-emerald-800'
    }
  },
  {
    id: 'trending',
    name: 'Trending',
    displayName: '🔥 Trending',
    icon: '🔥',
    description: 'Most popular and trending dishes',
    level: 'primary',
    sortOrder: 4,
    colorScheme: {
      background: 'bg-orange-50 dark:bg-orange-950',
      text: 'text-orange-900 dark:text-orange-100',
      accent: 'border-orange-200 dark:border-orange-800'
    }
  },

  // LEVEL 2: CUISINE CATEGORIES
  {
    id: 'indian-cuisine',
    name: 'Indian Cuisine',
    displayName: '🇮🇳 Indian Cuisine',
    icon: '🇮🇳',
    description: 'Authentic Indian flavors with aromatic spices',
    level: 'cuisine',
    sortOrder: 10,
    colorScheme: {
      background: 'bg-amber-50 dark:bg-amber-950',
      text: 'text-amber-900 dark:text-amber-100',
      accent: 'border-amber-200 dark:border-amber-800'
    }
  },
  {
    id: 'italian',
    name: 'Italian',
    displayName: '🇮🇹 Italian',
    icon: '🇮🇹',
    description: 'Classic Italian dishes, pizza, and pasta',
    level: 'cuisine',
    sortOrder: 11,
    colorScheme: {
      background: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-900 dark:text-green-100',
      accent: 'border-green-200 dark:border-green-800'
    }
  },
  {
    id: 'asian',
    name: 'Asian',
    displayName: '🇨🇳 Asian',
    icon: '🇨🇳',
    description: 'Chinese, Thai, Japanese, and other Asian cuisines',
    level: 'cuisine',
    sortOrder: 12,
    colorScheme: {
      background: 'bg-rose-50 dark:bg-rose-950',
      text: 'text-rose-900 dark:text-rose-100',
      accent: 'border-rose-200 dark:border-rose-800'
    }
  },
  {
    id: 'mexican',
    name: 'Mexican',
    displayName: '🇲🇽 Mexican',
    icon: '🇲🇽',
    description: 'Bold Mexican flavors and Latin cuisine',
    level: 'cuisine',
    sortOrder: 13,
    colorScheme: {
      background: 'bg-yellow-50 dark:bg-yellow-950',
      text: 'text-yellow-900 dark:text-yellow-100',
      accent: 'border-yellow-200 dark:border-yellow-800'
    }
  },
  {
    id: 'american',
    name: 'American',
    displayName: '🇺🇸 American',
    icon: '🇺🇸',
    description: 'Classic American dishes, burgers, and comfort food',
    level: 'cuisine',
    sortOrder: 14,
    colorScheme: {
      background: 'bg-blue-50 dark:bg-blue-950',
      text: 'text-blue-900 dark:text-blue-100',
      accent: 'border-blue-200 dark:border-blue-800'
    }
  },
  {
    id: 'healthy-fresh',
    name: 'Healthy & Fresh',
    displayName: '🥗 Healthy & Fresh',
    icon: '🥗',
    description: 'Nutritious salads, bowls, and light meals',
    level: 'cuisine',
    sortOrder: 15,
    colorScheme: {
      background: 'bg-lime-50 dark:bg-lime-950',
      text: 'text-lime-900 dark:text-lime-100',
      accent: 'border-lime-200 dark:border-lime-800'
    }
  },
  {
    id: 'desserts-sweets',
    name: 'Desserts & Sweets',
    displayName: '🍰 Desserts & Sweets',
    icon: '🍰',
    description: 'Decadent desserts and sweet treats',
    level: 'cuisine',
    sortOrder: 16,
    colorScheme: {
      background: 'bg-pink-50 dark:bg-pink-950',
      text: 'text-pink-900 dark:text-pink-100',
      accent: 'border-pink-200 dark:border-pink-800'
    }
  },
  {
    id: 'beverages',
    name: 'Beverages',
    displayName: '🥤 Beverages',
    icon: '🥤',
    description: 'Refreshing drinks, juices, and specialty beverages',
    level: 'cuisine',
    sortOrder: 17,
    colorScheme: {
      background: 'bg-cyan-50 dark:bg-cyan-950',
      text: 'text-cyan-900 dark:text-cyan-100',
      accent: 'border-cyan-200 dark:border-cyan-800'
    }
  },

  // LEVEL 3: MEAL COURSE CATEGORIES
  {
    id: 'appetizers',
    name: 'Appetizers',
    displayName: '🥗 Appetizers & Starters',
    icon: '🥗',
    description: 'Light starters and appetizers to begin your meal',
    level: 'course',
    sortOrder: 20,
    colorScheme: {
      background: 'bg-teal-50 dark:bg-teal-950',
      text: 'text-teal-900 dark:text-teal-100',
      accent: 'border-teal-200 dark:border-teal-800'
    }
  },
  {
    id: 'main-course',
    name: 'Main Course',
    displayName: '🍽️ Main Course',
    icon: '🍽️',
    description: 'Hearty main dishes and entrees',
    level: 'course',
    sortOrder: 21,
    colorScheme: {
      background: 'bg-violet-50 dark:bg-violet-950',
      text: 'text-violet-900 dark:text-violet-100',
      accent: 'border-violet-200 dark:border-violet-800'
    }
  },
  {
    id: 'desserts',
    name: 'Desserts',
    displayName: '🍮 Desserts',
    icon: '🍮',
    description: 'Sweet endings to your perfect meal',
    level: 'course',
    sortOrder: 22,
    colorScheme: {
      background: 'bg-fuchsia-50 dark:bg-fuchsia-950',
      text: 'text-fuchsia-900 dark:text-fuchsia-100',
      accent: 'border-fuchsia-200 dark:border-fuchsia-800'
    }
  },
  {
    id: 'beverages-course',
    name: 'Beverages',
    displayName: '☕ Beverages',
    icon: '☕',
    description: 'Drinks to complement your meal',
    level: 'course',
    sortOrder: 23,
    colorScheme: {
      background: 'bg-stone-50 dark:bg-stone-950',
      text: 'text-stone-900 dark:text-stone-100',
      accent: 'border-stone-200 dark:border-stone-800'
    }
  },
  {
    id: 'snacks-sides',
    name: 'Snacks & Sides',
    displayName: '🍿 Snacks & Sides',
    icon: '🍿',
    description: 'Perfect sides and snacks',
    level: 'course',
    sortOrder: 24,
    colorScheme: {
      background: 'bg-slate-50 dark:bg-slate-950',
      text: 'text-slate-900 dark:text-slate-100',
      accent: 'border-slate-200 dark:border-slate-800'
    }
  }
]

// Professional filters and tags
export interface ProfessionalFilter {
  id: string
  name: string
  displayName: string
  icon: string
  type: 'dietary' | 'spice' | 'time' | 'price' | 'special'
  values: Array<{
    id: string
    name: string
    icon?: string
  }>
}

export const professionalFilters: ProfessionalFilter[] = [
  {
    id: 'spice-level',
    name: 'Spice Level',
    displayName: '🌶️ Spice Level',
    icon: '🌶️',
    type: 'spice',
    values: [
      { id: 'mild', name: 'Mild', icon: '🌶️' },
      { id: 'medium', name: 'Medium', icon: '🌶️🌶️' },
      { id: 'hot', name: 'Hot', icon: '🌶️🌶️🌶️' },
      { id: 'extra-hot', name: 'Extra Hot', icon: '🌶️🌶️🌶️🌶️' }
    ]
  },
  {
    id: 'prep-time',
    name: 'Preparation Time',
    displayName: '⏱️ Prep Time',
    icon: '⏱️',
    type: 'time',
    values: [
      { id: 'quick', name: 'Quick (Under 15 min)', icon: '⚡' },
      { id: 'standard', name: 'Standard (15-30 min)', icon: '⏱️' },
      { id: 'premium', name: 'Premium (30+ min)', icon: '👨‍🍳' }
    ]
  },
  {
    id: 'price-range',
    name: 'Price Range',
    displayName: '💰 Price Range',
    icon: '💰',
    type: 'price',
    values: [
      { id: 'budget', name: 'Budget (Under $15)', icon: '💵' },
      { id: 'mid-range', name: 'Mid-range ($15-25)', icon: '💶' },
      { id: 'premium', name: 'Premium ($25+)', icon: '💎' }
    ]
  },
  {
    id: 'dietary-restrictions',
    name: 'Dietary Restrictions',
    displayName: '🏷️ Dietary',
    icon: '🏷️',
    type: 'dietary',
    values: [
      { id: 'gluten-free', name: 'Gluten Free', icon: '🌾' },
      { id: 'dairy-free', name: 'Dairy Free', icon: '🥛' },
      { id: 'keto', name: 'Keto Friendly', icon: '🥑' },
      { id: 'low-carb', name: 'Low Carb', icon: '📉' },
      { id: 'high-protein', name: 'High Protein', icon: '💪' }
    ]
  },
  {
    id: 'special-tags',
    name: 'Special Tags',
    displayName: '⭐ Special',
    icon: '⭐',
    type: 'special',
    values: [
      { id: 'chef-special', name: "Chef's Special", icon: '👨‍🍳' },
      { id: 'signature', name: 'Signature Dish', icon: '✨' },
      { id: 'new', name: 'New Item', icon: '🆕' },
      { id: 'bestseller', name: 'Bestseller', icon: '🏆' },
      { id: 'healthy', name: 'Healthy Choice', icon: '💚' }
    ]
  }
]

// Helper functions
export const getCategoriesByLevel = (level: 'primary' | 'cuisine' | 'course') => {
  return professionalCategories
    .filter(cat => cat.level === level)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getPrimaryCategories = () => getCategoriesByLevel('primary')
export const getCuisineCategories = () => getCategoriesByLevel('cuisine')
export const getCourseCategories = () => getCategoriesByLevel('course')

export const getCategoryById = (id: string) => {
  return professionalCategories.find(cat => cat.id === id)
}

export const mapFoodItemToCategories = (item: any) => {
  const categories = []
  
  // Primary dietary category
  if (item.isVegan) {
    categories.push('vegan')
  } else if (item.isVegetarian) {
    categories.push('vegetarian')
  } else {
    categories.push('non-vegetarian')
  }
  
  // Popular/trending
  if (item.isPopular || item.isHot) {
    categories.push('trending')
  }
  
  // Cuisine mapping
  const cuisineMap: Record<string, string> = {
    'Indian': 'indian-cuisine',
    'Italian': 'italian',
    'Asian': 'asian',
    'Mexican': 'mexican',
    'Burgers': 'american',
    'Sandwiches': 'american',
    'Wraps': 'american',
    'Healthy': 'healthy-fresh',
    'Desserts': 'desserts-sweets',
    'Beverages': 'beverages'
  }
  
  if (item.category && cuisineMap[item.category]) {
    categories.push(cuisineMap[item.category])
  }
  
  return categories
}
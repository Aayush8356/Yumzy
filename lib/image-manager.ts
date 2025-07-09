// Professional Image Management System
// Used by major food delivery platforms for reliable image handling

export interface ImageConfig {
  quality: number
  format: 'webp' | 'jpeg' | 'png'
  sizes: {
    thumbnail: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
  }
}

export const imageConfig: ImageConfig = {
  quality: 85,
  format: 'webp',
  sizes: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 300, height: 200 },
    large: { width: 600, height: 400 }
  }
}

// Image validation and processing
export class ImageManager {
  private static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private static async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'force-cache' 
      })
      return response.ok && (response.headers.get('content-type')?.startsWith('image/') || false)
    } catch {
      return false
    }
  }

  static async processImageUrl(originalUrl: string): Promise<string | null> {
    if (!originalUrl) return null
    
    // Basic URL validation
    if (!this.validateUrl(originalUrl)) {
      console.warn('Invalid image URL:', originalUrl)
      return null
    }
    
    // Check if image exists
    const exists = await this.checkImageExists(originalUrl)
    if (!exists) {
      console.warn('Image not found:', originalUrl)
      return null
    }
    
    return originalUrl
  }

  // Generate optimized image URLs (for future CDN integration)
  static generateOptimizedUrl(
    originalUrl: string, 
    size: keyof ImageConfig['sizes'] = 'medium'
  ): string {
    const { width, height } = imageConfig.sizes[size]
    
    // For future CDN integration (Cloudinary, AWS CloudFront, etc.)
    // return `https://your-cdn.com/image/fetch/w_${width},h_${height},c_fill,f_${imageConfig.format},q_${imageConfig.quality}/${encodeURIComponent(originalUrl)}`
    
    // For now, return original URL
    return originalUrl
  }

  // Batch image validation for menu items
  static async validateBatchImages(items: Array<{ id: string; image: string }>): Promise<Map<string, boolean>> {
    const validationMap = new Map<string, boolean>()
    
    const promises = items.map(async (item) => {
      const isValid = await this.processImageUrl(item.image)
      validationMap.set(item.id, !!isValid)
    })
    
    await Promise.all(promises)
    return validationMap
  }
}

// Image URL utilities for different environments
export const ImageUrls = {
  // Convert relative paths to absolute URLs
  makeAbsolute: (path: string): string => {
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${path}`
  },
  
  // Generate Unsplash food images as fallback
  generateUnsplashFood: (category: string, width: number = 300, height: number = 200): string => {
    const keywords = {
      'indian-cuisine': 'indian,food,curry,spices',
      'italian': 'italian,food,pasta,pizza',
      'asian': 'asian,food,noodles,rice',
      'mexican': 'mexican,food,tacos,burrito',
      'american': 'american,food,burger,fries',
      'healthy-fresh': 'healthy,food,salad,fresh',
      'desserts-sweets': 'dessert,cake,sweet',
      'beverages': 'drink,beverage,juice',
      'vegetarian': 'vegetarian,food,vegetables',
      'non-vegetarian': 'meat,food,protein',
      'vegan': 'vegan,food,plant,based',
      'default': 'food,delicious,meal'
    }
    
    const searchTerm = keywords[category as keyof typeof keywords] || keywords.default
    return `https://source.unsplash.com/${width}x${height}/?${searchTerm}&sig=${Math.random()}`
  },
  
  // Generate Placeholder.com images
  generatePlaceholder: (category: string, width: number = 300, height: number = 200): string => {
    const colors = {
      'vegetarian': '16a34a',
      'non-vegetarian': 'dc2626',
      'vegan': '059669',
      'indian-cuisine': 'f59e0b',
      'default': '6b7280'
    }
    
    const color = colors[category as keyof typeof colors] || colors.default
    const text = category.replace('-', ' ').toUpperCase()
    return `https://via.placeholder.com/${width}x${height}/${color}/ffffff?text=${encodeURIComponent(text)}`
  }
}

// Image caching utilities
export const ImageCache = {
  // Check if image is in browser cache
  isInCache: (url: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const cached = localStorage.getItem(`img_cache_${btoa(url)}`)
    if (!cached) return false
    
    const { timestamp, ttl } = JSON.parse(cached)
    return Date.now() - timestamp < ttl
  },
  
  // Cache image URL with TTL
  cacheImage: (url: string, ttl: number = 3600000): void => { // 1 hour default
    if (typeof window === 'undefined') return
    
    const cacheData = {
      timestamp: Date.now(),
      ttl,
      url
    }
    
    localStorage.setItem(`img_cache_${btoa(url)}`, JSON.stringify(cacheData))
  },
  
  // Clear expired cache entries
  clearExpiredCache: (): void => {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage).filter(key => key.startsWith('img_cache_'))
    
    keys.forEach(key => {
      const cached = localStorage.getItem(key)
      if (cached) {
        const { timestamp, ttl } = JSON.parse(cached)
        if (Date.now() - timestamp >= ttl) {
          localStorage.removeItem(key)
        }
      }
    })
  }
}
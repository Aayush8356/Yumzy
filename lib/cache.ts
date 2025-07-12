// Production-ready caching system using Redis
import { Redis } from '@upstash/redis'

// Environment configuration
const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  MENU_ITEMS: 30 * 60, // 30 minutes
  USER_SESSION: 24 * 60 * 60, // 24 hours
  CART_DATA: 60 * 60, // 1 hour
  CATEGORIES: 60 * 60, // 1 hour
  FOOD_ITEM: 15 * 60, // 15 minutes
  SEARCH_RESULTS: 10 * 60, // 10 minutes
  USER_PROFILE: 30 * 60, // 30 minutes
  ANALYTICS: 5 * 60, // 5 minutes
} as const

// Initialize Redis client
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  if (!REDIS_URL) {
    console.warn('⚠️ Redis URL not configured, using in-memory cache fallback')
    return null
  }

  if (!redis) {
    try {
      redis = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
        retry: {
          retries: 3,
          backoff: (retryCount) => Math.min(retryCount * 50, 500)
        }
      })
      console.log('✅ Redis client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Redis client:', error)
      return null
    }
  }

  return redis
}

// In-memory cache fallback
class InMemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private maxSize = 1000 // Limit memory usage

  set(key: string, value: any, ttlSeconds: number = 3600): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries when at capacity
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  keys(pattern: string): string[] {
    return Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern.replace('*', ''))
    )
  }
}

const inMemoryCache = new InMemoryCache()

// Cache manager with fallback support
export class CacheManager {
  // Set cache value
  static async set(
    key: string, 
    value: any, 
    ttlSeconds: number = CACHE_TTL.MENU_ITEMS
  ): Promise<boolean> {
    try {
      const redis = getRedisClient()
      
      if (redis) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value))
        return true
      } else {
        // Fallback to in-memory cache
        inMemoryCache.set(key, value, ttlSeconds)
        return true
      }
    } catch (error) {
      console.error(`❌ Cache SET error for key ${key}:`, error)
      // Fallback to in-memory cache on Redis error
      try {
        inMemoryCache.set(key, value, ttlSeconds)
        return true
      } catch (fallbackError) {
        console.error(`❌ In-memory cache fallback failed:`, fallbackError)
        return false
      }
    }
  }

  // Get cache value
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient()
      
      if (redis) {
        const value = await redis.get(key)
        return value ? JSON.parse(value as string) : null
      } else {
        // Fallback to in-memory cache
        return inMemoryCache.get(key)
      }
    } catch (error) {
      console.error(`❌ Cache GET error for key ${key}:`, error)
      // Try in-memory cache as fallback
      try {
        return inMemoryCache.get(key)
      } catch (fallbackError) {
        console.error(`❌ In-memory cache fallback failed:`, fallbackError)
        return null
      }
    }
  }

  // Delete cache value
  static async delete(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient()
      
      if (redis) {
        await redis.del(key)
      }
      
      inMemoryCache.delete(key)
      return true
    } catch (error) {
      console.error(`❌ Cache DELETE error for key ${key}:`, error)
      return false
    }
  }

  // Clear cache by pattern
  static async clearPattern(pattern: string): Promise<boolean> {
    try {
      const redis = getRedisClient()
      
      if (redis) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      }
      
      // Clear from in-memory cache
      const memoryKeys = inMemoryCache.keys(pattern)
      memoryKeys.forEach(key => inMemoryCache.delete(key))
      
      return true
    } catch (error) {
      console.error(`❌ Cache CLEAR PATTERN error for pattern ${pattern}:`, error)
      return false
    }
  }

  // Check if cache is available
  static async isAvailable(): Promise<boolean> {
    try {
      const redis = getRedisClient()
      if (redis) {
        await redis.ping()
        return true
      }
      return false // In-memory cache is always available
    } catch (error) {
      return false
    }
  }

  // Get cache statistics
  static async getStats(): Promise<{
    type: 'redis' | 'memory'
    available: boolean
    keyCount?: number
  }> {
    try {
      const redis = getRedisClient()
      
      if (redis) {
        const isAvailable = await redis.ping() === 'PONG'
        return {
          type: 'redis',
          available: isAvailable,
          keyCount: isAvailable ? await redis.dbsize() : undefined
        }
      } else {
        return {
          type: 'memory',
          available: true,
          keyCount: inMemoryCache.keys('*').length
        }
      }
    } catch (error) {
      return {
        type: 'memory',
        available: true,
        keyCount: inMemoryCache.keys('*').length
      }
    }
  }
}

// Cache key generators
export const CacheKeys = {
  menuItems: (filters?: string) => `menu:items${filters ? `:${filters}` : ''}`,
  foodItem: (id: string) => `food:item:${id}`,
  categories: () => `menu:categories`,
  userCart: (userId: string) => `user:${userId}:cart`,
  userSession: (userId: string) => `user:${userId}:session`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  searchResults: (query: string, filters?: string) => 
    `search:${query}${filters ? `:${filters}` : ''}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  rateLimiter: (identifier: string) => `rate_limit:${identifier}`,
}

// Cache warming utilities
export class CacheWarmer {
  // Warm up frequently accessed data
  static async warmCache(): Promise<void> {
    console.log('🔥 Starting cache warming...')
    
    try {
      // This would typically fetch and cache:
      // - Popular menu items
      // - Categories
      // - Featured items
      console.log('✅ Cache warming completed')
    } catch (error) {
      console.error('❌ Cache warming failed:', error)
    }
  }

  // Cache invalidation on data updates
  static async invalidateMenuCache(): Promise<void> {
    await CacheManager.clearPattern('menu:*')
    await CacheManager.clearPattern('search:*')
    console.log('🧹 Menu cache invalidated')
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    await CacheManager.clearPattern(`user:${userId}:*`)
    console.log(`🧹 User cache invalidated for ${userId}`)
  }
}

// Decorator for automatic caching
export function cached(
  keyGenerator: (...args: any[]) => string,
  ttl: number = CACHE_TTL.MENU_ITEMS
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args)
      
      // Try to get from cache first
      const cached = await CacheManager.get(cacheKey)
      if (cached !== null) {
        console.log(`📦 Cache hit for ${cacheKey}`)
        return cached
      }

      // Execute original method
      console.log(`🔄 Cache miss for ${cacheKey}, executing method`)
      const result = await method.apply(this, args)

      // Cache the result
      await CacheManager.set(cacheKey, result, ttl)
      
      return result
    }
  }
}
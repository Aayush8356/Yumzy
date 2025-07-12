import { CacheManager, CacheKeys, CACHE_TTL } from '@/lib/cache'

// Mock Redis client
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    setex: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    dbsize: jest.fn().mockResolvedValue(100)
  }))
}))

describe('Cache System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CacheManager', () => {
    it('should set and get cache values', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      await CacheManager.set(key, value, 300)
      const retrieved = await CacheManager.get(key)
      
      expect(retrieved).toEqual(value)
    })

    it('should handle cache misses gracefully', async () => {
      const result = await CacheManager.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should delete cache entries', async () => {
      const key = 'test-key'
      const value = { test: 'data' }
      
      await CacheManager.set(key, value)
      await CacheManager.delete(key)
      
      const retrieved = await CacheManager.get(key)
      expect(retrieved).toBeNull()
    })

    it('should clear cache patterns', async () => {
      const pattern = 'test:*'
      const result = await CacheManager.clearPattern(pattern)
      
      expect(result).toBe(true)
    })

    it('should check cache availability', async () => {
      const isAvailable = await CacheManager.isAvailable()
      expect(typeof isAvailable).toBe('boolean')
    })

    it('should get cache statistics', async () => {
      const stats = await CacheManager.getStats()
      
      expect(stats).toHaveProperty('type')
      expect(stats).toHaveProperty('available')
      expect(['redis', 'memory']).toContain(stats.type)
    })
  })

  describe('CacheKeys', () => {
    it('should generate consistent cache keys', () => {
      const userId = 'user-123'
      const foodItemId = 'food-456'
      
      const cartKey = CacheKeys.userCart(userId)
      const foodKey = CacheKeys.foodItem(foodItemId)
      const menuKey = CacheKeys.menuItems()
      
      expect(cartKey).toBe(`user:${userId}:cart`)
      expect(foodKey).toBe(`food:item:${foodItemId}`)
      expect(menuKey).toBe('menu:items')
    })

    it('should generate search keys with filters', () => {
      const query = 'pizza'
      const filters = 'vegetarian:true'
      
      const searchKey = CacheKeys.searchResults(query, filters)
      expect(searchKey).toBe(`search:${query}:${filters}`)
    })

    it('should generate analytics keys', () => {
      const type = 'orders'
      const period = 'daily'
      
      const analyticsKey = CacheKeys.analytics(type, period)
      expect(analyticsKey).toBe(`analytics:${type}:${period}`)
    })
  })

  describe('Cache TTL Configuration', () => {
    it('should have reasonable TTL values', () => {
      expect(CACHE_TTL.MENU_ITEMS).toBe(30 * 60) // 30 minutes
      expect(CACHE_TTL.USER_SESSION).toBe(24 * 60 * 60) // 24 hours
      expect(CACHE_TTL.CART_DATA).toBe(60 * 60) // 1 hour
      expect(CACHE_TTL.SEARCH_RESULTS).toBe(10 * 60) // 10 minutes
    })

    it('should have all required TTL constants', () => {
      const requiredTTLs = [
        'MENU_ITEMS',
        'USER_SESSION',
        'CART_DATA',
        'CATEGORIES',
        'FOOD_ITEM',
        'SEARCH_RESULTS',
        'USER_PROFILE',
        'ANALYTICS'
      ]
      
      requiredTTLs.forEach(ttl => {
        expect(CACHE_TTL).toHaveProperty(ttl)
        expect(typeof CACHE_TTL[ttl as keyof typeof CACHE_TTL]).toBe('number')
        expect(CACHE_TTL[ttl as keyof typeof CACHE_TTL]).toBeGreaterThan(0)
      })
    })
  })

  describe('In-Memory Cache Fallback', () => {
    it('should work when Redis is unavailable', async () => {
      // Simulate Redis being unavailable by setting REDIS_URL to undefined
      const originalRedisUrl = process.env.REDIS_URL
      delete process.env.REDIS_URL
      
      const key = 'test-memory-key'
      const value = { test: 'memory-data' }
      
      await CacheManager.set(key, value)
      const retrieved = await CacheManager.get(key)
      
      expect(retrieved).toEqual(value)
      
      // Restore original environment
      if (originalRedisUrl) {
        process.env.REDIS_URL = originalRedisUrl
      }
    })

    it('should respect memory cache limits', async () => {
      const originalRedisUrl = process.env.REDIS_URL
      delete process.env.REDIS_URL
      
      // Test memory cache behavior
      const key = 'test-limit-key'
      const value = { test: 'data' }
      
      await CacheManager.set(key, value, 1) // 1 second TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const retrieved = await CacheManager.get(key)
      expect(retrieved).toBeNull()
      
      if (originalRedisUrl) {
        process.env.REDIS_URL = originalRedisUrl
      }
    })
  })
})
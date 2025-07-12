import { PasswordManager, TokenManager, SessionManager, RateLimiter } from '@/lib/auth'

describe('Authentication System', () => {
  describe('PasswordManager', () => {
    it('should hash passwords correctly', async () => {
      const password = 'TestPassword123!'
      const hashedPassword = await PasswordManager.hash(password)
      
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(20)
      expect(hashedPassword).toMatch(/^\$2[ab]\$/)
    })

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!'
      const hashedPassword = await PasswordManager.hash(password)
      
      const isValid = await PasswordManager.verify(password, hashedPassword)
      const isInvalid = await PasswordManager.verify('wrongpassword', hashedPassword)
      
      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })

    it('should validate password strength', () => {
      const strongPassword = 'StrongPass123!'
      const weakPassword = 'weak'
      
      const strongResult = PasswordManager.validate(strongPassword)
      const weakResult = PasswordManager.validate(weakPassword)
      
      expect(strongResult.isValid).toBe(true)
      expect(strongResult.errors).toHaveLength(0)
      
      expect(weakResult.isValid).toBe(false)
      expect(weakResult.errors.length).toBeGreaterThan(0)
    })
  })

  describe('TokenManager', () => {
    const mockUser = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user'
    }

    it('should generate valid JWT tokens', () => {
      const token = TokenManager.generate(mockUser)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify valid tokens', () => {
      const token = TokenManager.generate(mockUser)
      const decoded = TokenManager.verify(token)
      
      expect(decoded.userId).toBe(mockUser.userId)
      expect(decoded.email).toBe(mockUser.email)
      expect(decoded.role).toBe(mockUser.role)
    })

    it('should reject invalid tokens', () => {
      expect(() => {
        TokenManager.verify('invalid.token.here')
      }).toThrow()
    })
  })

  describe('SessionManager', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }

    it('should create valid sessions', () => {
      const session = SessionManager.createSession(mockUser)
      
      expect(session.token).toBeDefined()
      expect(session.expiresAt).toBeInstanceOf(Date)
      expect(session.user.id).toBe(mockUser.id)
      expect(session.user.email).toBe(mockUser.email)
    })

    it('should validate sessions correctly', () => {
      const session = SessionManager.createSession(mockUser)
      const validation = SessionManager.validateSession(session.token)
      
      expect(validation.isValid).toBe(true)
      expect(validation.user?.id).toBe(mockUser.id)
    })
  })

  describe('RateLimiter', () => {
    beforeEach(() => {
      // Clear rate limiter state
      RateLimiter['requests'].clear()
    })

    it('should allow requests within limit', () => {
      const identifier = 'test-client'
      
      const firstRequest = RateLimiter.check(identifier, 5, 60000)
      const secondRequest = RateLimiter.check(identifier, 5, 60000)
      
      expect(firstRequest).toBe(true)
      expect(secondRequest).toBe(true)
    })

    it('should block requests exceeding limit', () => {
      const identifier = 'test-client'
      const limit = 2
      
      // Make requests up to limit
      for (let i = 0; i < limit; i++) {
        expect(RateLimiter.check(identifier, limit, 60000)).toBe(true)
      }
      
      // Next request should be blocked
      expect(RateLimiter.check(identifier, limit, 60000)).toBe(false)
    })

    it('should reset after time window', () => {
      const identifier = 'test-client'
      const limit = 1
      const windowMs = 1
      
      // Use up the limit
      expect(RateLimiter.check(identifier, limit, windowMs)).toBe(true)
      expect(RateLimiter.check(identifier, limit, windowMs)).toBe(false)
      
      // Wait for window to reset
      setTimeout(() => {
        expect(RateLimiter.check(identifier, limit, windowMs)).toBe(true)
      }, windowMs + 1)
    })
  })
})
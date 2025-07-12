import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NODE_ENV = 'test'
process.env.BCRYPT_ROUNDS = '4'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key'
process.env.UNSPLASH_SECRET_KEY = 'test-unsplash-secret'
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test-razorpay-key'
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/yumzy_test'
process.env.POSTGRES_URL = 'postgresql://postgres:postgres@localhost:5432/yumzy_test'

// Global test setup
global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})
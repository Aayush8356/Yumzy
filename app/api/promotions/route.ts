import { NextRequest, NextResponse } from 'next/server'

interface Promotion {
  id: string
  code: string
  title: string
  description: string
  type: 'percentage' | 'fixed' | 'free_delivery'
  value: number
  minOrderAmount: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  targetUsers: 'all' | 'new' | 'returning'
  categories?: string[]
}

// Mock promotions data (in real app, this would be in database)
const mockPromotions: Promotion[] = [
  {
    id: 'promo1',
    code: 'WELCOME20',
    title: 'Welcome Offer',
    description: 'Get 20% off your first order',
    type: 'percentage',
    value: 20,
    minOrderAmount: 15,
    maxDiscount: 15,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 450,
    isActive: true,
    targetUsers: 'new'
  },
  {
    id: 'promo2',
    code: 'SAVE10',
    title: 'Save $10',
    description: 'Get $10 off orders over $30',
    type: 'fixed',
    value: 10,
    minOrderAmount: 30,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 120,
    isActive: true,
    targetUsers: 'all'
  },
  {
    id: 'promo3',
    code: 'FREEDELIVERY',
    title: 'Free Delivery',
    description: 'Free delivery on all orders',
    type: 'free_delivery',
    value: 0,
    minOrderAmount: 0,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 230,
    isActive: true,
    targetUsers: 'all'
  },
  {
    id: 'promo4',
    code: 'WEEKEND25',
    title: 'Weekend Special',
    description: '25% off on weekends',
    type: 'percentage',
    value: 25,
    minOrderAmount: 25,
    maxDiscount: 20,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 200,
    usedCount: 80,
    isActive: true,
    targetUsers: 'all'
  }
]

// GET /api/promotions - Get available promotions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType') // 'new' or 'returning'
    const includeExpired = searchParams.get('includeExpired') === 'true'
    
    const now = new Date()
    
    // Filter promotions based on criteria
    let filteredPromotions = mockPromotions.filter(promo => {
      // Check if active
      if (!promo.isActive) return false
      
      // Check expiry unless includeExpired is true
      if (!includeExpired && new Date(promo.validUntil) < now) return false
      
      // Check target users
      if (userType && promo.targetUsers !== 'all' && promo.targetUsers !== userType) return false
      
      // Check usage limit
      if (promo.usedCount >= promo.usageLimit) return false
      
      return true
    })

    // Check if user has already used single-use promotions
    if (userId) {
      // In real app, check user's promotion usage history
      // For demo, we'll assume user hasn't used any
    }

    // Add calculated fields
    const promotionsWithMetadata = filteredPromotions.map(promo => ({
      ...promo,
      isExpired: new Date(promo.validUntil) < now,
      isAlmostExpired: new Date(promo.validUntil).getTime() - now.getTime() < 24 * 60 * 60 * 1000, // Less than 24 hours
      usagePercentage: Math.round((promo.usedCount / promo.usageLimit) * 100),
      daysLeft: Math.max(0, Math.ceil((new Date(promo.validUntil).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    }))

    return NextResponse.json({
      success: true,
      promotions: promotionsWithMetadata
    })
  } catch (error) {
    console.error('Promotions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promotions' },
      { status: 500 }
    )
  }
}

// POST /api/promotions/validate - Validate a promotion code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId, subtotal, cartItems } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Promotion code required' },
        { status: 400 }
      )
    }

    // Find promotion by code
    const promotion = mockPromotions.find(p => 
      p.code.toLowerCase() === code.toLowerCase() && p.isActive
    )

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Invalid promotion code' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Check expiry
    if (new Date(promotion.validUntil) < now) {
      return NextResponse.json(
        { success: false, error: 'Promotion code has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (promotion.usedCount >= promotion.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Promotion code usage limit reached' },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (subtotal < promotion.minOrderAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimum order amount of $${promotion.minOrderAmount} required` 
        },
        { status: 400 }
      )
    }

    // Check target users (simplified)
    if (userId && promotion.targetUsers === 'new') {
      // In real app, check if user is new
      // For demo, assume all users are eligible
    }

    // Check category restrictions
    if (promotion.categories && cartItems) {
      const eligibleItems = cartItems.filter((item: any) => 
        promotion.categories!.includes(item.category)
      )
      
      if (eligibleItems.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Promotion not applicable to items in your cart' 
          },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discountAmount = 0
    
    if (promotion.type === 'percentage') {
      discountAmount = (subtotal * promotion.value) / 100
      if (promotion.maxDiscount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscount)
      }
    } else if (promotion.type === 'fixed') {
      discountAmount = promotion.value
    } else if (promotion.type === 'free_delivery') {
      // This would be handled in checkout logic
      discountAmount = 3.99 // Standard delivery fee
    }

    discountAmount = Math.round(discountAmount * 100) / 100

    return NextResponse.json({
      success: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        title: promotion.title,
        description: promotion.description,
        type: promotion.type,
        discountAmount,
        validUntil: promotion.validUntil
      }
    })
  } catch (error) {
    console.error('Promotion validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate promotion' },
      { status: 500 }
    )
  }
}
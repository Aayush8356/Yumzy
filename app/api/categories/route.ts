import { NextRequest, NextResponse } from 'next/server'
import { getPublicMenuItems, getFullMenuItems, getCategoriesWithCounts } from '@/data/food-items'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const isPublicOnly = searchParams.get('public') === 'true'
    
    // Check authorization header for logged-in users
    const authHeader = request.headers.get('Authorization')
    const isAuthenticated = !!authHeader
    
    // Simulate a small delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Get appropriate menu items based on authentication
    const menuItems = (isPublicOnly || !isAuthenticated) ? getPublicMenuItems() : getFullMenuItems()
    const categoriesWithCounts = getCategoriesWithCounts(menuItems)
    
    // Transform to match expected format
    const categories = categoriesWithCounts.map(cat => ({
      id: cat.category.toLowerCase().replace(/\s+/g, '-'),
      name: cat.category,
      description: `Delicious ${cat.category.toLowerCase()} dishes prepared with finest ingredients`,
      image: menuItems.find(item => item.category === cat.category)?.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop',
      itemCount: cat.count
    }))
    
    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
      isAuthenticated,
      totalItemsAvailable: getFullMenuItems().length
    })
    
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

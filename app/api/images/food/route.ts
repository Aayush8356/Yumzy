import { NextRequest, NextResponse } from 'next/server'
import { getFoodImage, batchGetFoodImages } from '@/lib/unsplash'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const foodName = searchParams.get('name')
    const category = searchParams.get('category') || ''
    const itemId = searchParams.get('id') || ''
    
    if (!foodName) {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      )
    }

    const imageUrl = await getFoodImage(foodName, category, itemId)
    
    return NextResponse.json({
      success: true,
      imageUrl,
      foodName,
      category
    })
  } catch (error) {
    console.error('Food image API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food image' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const imageMap = await batchGetFoodImages(items)
    
    // Convert Map to object for JSON response
    const imageData = Object.fromEntries(imageMap)
    
    return NextResponse.json({
      success: true,
      images: imageData
    })
  } catch (error) {
    console.error('Batch food images API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food images' },
      { status: 500 }
    )
  }
}
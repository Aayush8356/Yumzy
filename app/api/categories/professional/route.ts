import { NextRequest, NextResponse } from 'next/server'
import { 
  professionalCategories, 
  professionalFilters,
  getPrimaryCategories,
  getCuisineCategories,
  getCourseCategories
} from '@/data/professional-categories'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const level = searchParams.get('level') // primary, cuisine, course, all
    
    let categories
    
    switch (level) {
      case 'primary':
        categories = getPrimaryCategories()
        break
      case 'cuisine':
        categories = getCuisineCategories()
        break
      case 'course':
        categories = getCourseCategories()
        break
      case 'all':
      default:
        categories = professionalCategories
        break
    }
    
    return NextResponse.json({
      success: true,
      categories,
      filters: professionalFilters,
      metadata: {
        total: categories.length,
        levels: {
          primary: getPrimaryCategories().length,
          cuisine: getCuisineCategories().length,
          course: getCourseCategories().length
        }
      }
    })
  } catch (error) {
    console.error('Professional categories API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
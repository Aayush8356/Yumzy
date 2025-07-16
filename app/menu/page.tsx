'use client'

import { Navigation } from '@/components/Navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Leaf, Award, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import ProfessionalFoodCard from '@/components/ProfessionalFoodCard'

interface FoodItem {
  id: string
  name: string
  description: string
  shortDescription: string
  price: string
  originalPrice?: string
  discount?: number
  rating: string
  reviewCount: number
  cookTime: string
  difficulty: string
  spiceLevel: number
  servingSize: string
  calories: number
  image: string
  images: string[]
  optimizedImage?: string
  fallbackImage?: string
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
  tags: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  isPopular: boolean
  isAvailable: boolean
  category: {
    id: string
    name: string
    description: string
    image: string
  }
}

export default function MenuPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [priceRange, setPriceRange] = useState('all')
  const [dietaryFilter, setDietaryFilter] = useState('all')
  const [spiceLevelFilter, setSpiceLevelFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access our premium menu",
        variant: "destructive"
      })
      window.location.href = '/auth/login'
      return
    }
  }, [isAuthenticated, toast])

  // Fetch menu items with pagination and filters
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const headers: HeadersInit = {}
        if (isAuthenticated) {
          const authToken = localStorage.getItem('authToken')
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
          }
        }

        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          sortBy,
          sortOrder: 'asc'
        })

        if (searchTerm) params.append('search', searchTerm)
        if (priceRange !== 'all') {
          if (priceRange === 'under10') {
            params.append('maxPrice', '10')
          } else if (priceRange === '10to20') {
            params.append('minPrice', '10')
            params.append('maxPrice', '20')
          } else if (priceRange === '20to30') {
            params.append('minPrice', '20')
            params.append('maxPrice', '30')
          } else if (priceRange === 'over30') {
            params.append('minPrice', '30')
          }
        }
        if (dietaryFilter === 'vegetarian') params.append('vegetarian', 'true')
        if (dietaryFilter === 'vegan') params.append('vegan', 'true')
        if (dietaryFilter === 'glutenFree') params.append('glutenFree', 'true')
        if (dietaryFilter === 'popular') params.append('popular', 'true')
        if (spiceLevelFilter !== 'all') params.append('spicy', 'true')
        if (ratingFilter !== 'all') params.append('minRating', ratingFilter)

        const response = await fetch(`/api/menu?${params.toString()}`, { 
          headers,
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch menu items')
        }
        
        const data = await response.json()
        
        if (data.success && data.items) {
          setFoodItems(data.items)
          setFilteredItems(data.items)
          setPagination(data.pagination)
          setTotalItems(data.pagination.total)
          setTotalPages(data.pagination.totalPages)
        } else {
          setFoodItems([])
          setFilteredItems([])
          setPagination({
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error)
        toast({
          title: "Failed to load menu",
          description: "Please try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchItems()
    }
  }, [isAuthenticated, toast, currentPage, searchTerm, sortBy, priceRange, dietaryFilter, spiceLevelFilter, ratingFilter])

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm, sortBy, priceRange, dietaryFilter, spiceLevelFilter, ratingFilter])


  const clearAllFilters = () => {
    setSearchTerm('')
    setSortBy('name')
    setPriceRange('all')
    setDietaryFilter('all')
    setSpiceLevelFilter('all')
    setRatingFilter('all')
  }

  const activeFiltersCount = [
    searchTerm,
    priceRange !== 'all' ? priceRange : null,
    dietaryFilter !== 'all' ? dietaryFilter : null,
    spiceLevelFilter !== 'all' ? spiceLevelFilter : null,
    ratingFilter !== 'all' ? ratingFilter : null
  ].filter(Boolean).length

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Our Premium Menu
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Discover delicious dishes crafted with premium ingredients, exclusively for our members
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-lg sm:rounded-xl border p-4 sm:p-6 mb-6 sm:mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search and Quick Filters Row */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search dishes, ingredients, or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>

            {/* Sort and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:flex-1 h-10 sm:h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="priceDesc">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="calories">Lowest Calories</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                className="w-full sm:w-auto h-10 sm:h-12 gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any price</SelectItem>
                    <SelectItem value="under10">Under $10</SelectItem>
                    <SelectItem value="10to20">$10 - $20</SelectItem>
                    <SelectItem value="20to30">$20 - $30</SelectItem>
                    <SelectItem value="over30">Over $30</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Options */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dietary Options</label>
                <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dishes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All dishes</SelectItem>
                    <SelectItem value="vegetarian">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Vegetarian
                      </div>
                    </SelectItem>
                    <SelectItem value="vegan">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Vegan
                      </div>
                    </SelectItem>
                    <SelectItem value="glutenFree">Gluten-Free</SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        Popular
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Spice Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Max Spice Level</label>
                <Select value={spiceLevelFilter} onValueChange={setSpiceLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any spice level</SelectItem>
                    <SelectItem value="0">🌶️ Mild</SelectItem>
                    <SelectItem value="1">🌶️🌶️ Medium</SelectItem>
                    <SelectItem value="2">🌶️🌶️🌶️ Hot</SelectItem>
                    <SelectItem value="3">🌶️🌶️🌶️🌶️ Very Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any rating</SelectItem>
                    <SelectItem value="4.5">⭐ 4.5+ stars</SelectItem>
                    <SelectItem value="4.0">⭐ 4.0+ stars</SelectItem>
                    <SelectItem value="3.5">⭐ 3.5+ stars</SelectItem>
                    <SelectItem value="3.0">⭐ 3.0+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} of {foodItems.length} dishes shown
              </p>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results Summary */}
        {!loading && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-lg text-muted-foreground">
              {filteredItems.length === 0 ? (
                "No dishes match your current filters"
              ) : (
                `Showing ${filteredItems.length} delicious ${filteredItems.length === 1 ? 'dish' : 'dishes'}`
              )}
            </p>
          </motion.div>
        )}

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-40 sm:h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-full"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No dishes found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProfessionalFoodCard
                  item={item}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <motion.div
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing page {currentPage} of {totalPages} ({totalItems} total items)
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
'use client'

import { Navigation } from '@/components/Navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Clock, Filter, Search, ShoppingCart, Heart, Info, Leaf, Award, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
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
  professionalCategories?: string[]
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
  category: {
    id: string
    name: string
    description: string
    image: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  image: string
  itemCount: number
}

export default function MenuPage() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  
  // Filters
  const [filters, setFilters] = useState({
    vegetarian: false,
    nonVegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
    popular: false,
  })

  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add authorization header if user is authenticated
        const headers: HeadersInit = {}
        if (isAuthenticated) {
          const authToken = localStorage.getItem('authToken');
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
        }

        const response = await fetch('/api/categories', { headers })
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [isAuthenticated])

  // Fetch menu items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        // Add authorization header if user is authenticated
        const headers: HeadersInit = {}
        if (isAuthenticated) {
          const authToken = localStorage.getItem('authToken');
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
        }

        const params = new URLSearchParams({
          search: searchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : '',
          sortBy,
          sortOrder,
          vegetarian: filters.vegetarian.toString(),
          nonVegetarian: filters.nonVegetarian.toString(),
          vegan: filters.vegan.toString(),
          glutenFree: filters.glutenFree.toString(),
          spicy: filters.spicy.toString(),
          popular: filters.popular.toString(),
        })

        const response = await fetch(`/api/menu?${params}`, { headers })
        const data = await response.json()
        
        if (data.success) {
          setItems(data.items)
          
          // Show notification if user is not authenticated about limited view
          if (!isAuthenticated && data.items.length < data.totalAvailable) {
            toast({
              title: "Limited Menu View",
              description: `Showing ${data.items.length} sample items. Login to see all ${data.totalAvailable} items!`,
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error)
        toast({
          title: "Error loading menu",
          description: "Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchItems, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedCategory, sortBy, sortOrder, filters, toast, isAuthenticated])

  const handleFilterChange = (filterKey: keyof typeof filters, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: checked
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Our <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Premium</span> Menu
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our carefully crafted collection of gourmet dishes, made with the finest ingredients
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for dishes, cuisines, or ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.name)}
                    size="sm"
                  >
                    {category.name} ({category.itemCount})
                  </Button>
                ))}
              </div>

              {/* Filters and Sort */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => handleFilterChange(key as keyof typeof filters, !!checked)}
                        />
                        <label htmlFor={key} className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-60 bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="h-6 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <ProfessionalFoodCard 
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
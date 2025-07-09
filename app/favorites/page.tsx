'use client'

import { Navigation } from '@/components/Navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star, Clock, Info, Trash2, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import ProfessionalFoodCard from '@/components/ProfessionalFoodCard'

interface FavoriteItem {
  id: string
  userId: string
  foodItemId: string
  createdAt: string
  foodItem?: {
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
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { isAuthenticated, user } = useAuth()
  const { addToCart } = useCart()
  const { toast } = useToast()

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
          setLoading(false)
          return
        }

        const response = await fetch('/api/favorites', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()
        
        if (data.success) {
          // Fetch food item details for each favorite
          const favoritesWithDetails = await Promise.all(
            data.favorites.map(async (favorite: FavoriteItem) => {
              try {
                const itemResponse = await fetch(`/api/menu?id=${favorite.foodItemId}`, {
                  headers: {
                    'Authorization': `Bearer ${authToken}`
                  }
                })
                const itemData = await itemResponse.json()
                
                if (itemData.success && itemData.items.length > 0) {
                  return {
                    ...favorite,
                    foodItem: itemData.items[0]
                  }
                }
                return favorite
              } catch (error) {
                console.error('Failed to fetch food item details:', error)
                return favorite
              }
            })
          )

          setFavorites(favoritesWithDetails.filter(f => f.foodItem))
        } else {
          toast({
            title: "Error loading favorites",
            description: data.error || "Please try again later.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error)
        toast({
          title: "Error loading favorites",
          description: "Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, toast])

  const removeFavorite = async (foodItemId: string) => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ foodItemId })
      })

      const data = await response.json()
      
      if (data.success) {
        setFavorites(prev => prev.filter(f => f.foodItemId !== foodItemId))
        toast({
          title: "Removed from favorites",
          description: "Item has been removed from your favorites."
        })
      } else {
        toast({
          title: "Error removing favorite",
          description: data.error || "Please try again later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      toast({
        title: "Error removing favorite",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const filteredFavorites = favorites.filter(favorite =>
    favorite.foodItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.foodItem?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.foodItem?.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view favorites</h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to save your favorite dishes
            </p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    )
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Your <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Favorites</span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All your beloved dishes in one place. Never lose track of what you love!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your favorite dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </Card>
          </motion.div>
        )}

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

        {/* Favorites Grid */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite, index) => {
              if (!favorite.foodItem) return null
              
              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <ProfessionalFoodCard 
                    item={favorite.foodItem}
                    index={index}
                  />
                  
                  {/* Remove from favorites button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    onClick={() => removeFavorite(favorite.foodItemId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring our menu and add dishes to your favorites by clicking the heart icon.
              </p>
              <Button onClick={() => window.location.href = '/menu'}>
                Explore Menu
              </Button>
            </div>
          </motion.div>
        )}

        {/* No Search Results */}
        {!loading && favorites.length > 0 && filteredFavorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No favorites found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms to find your favorite dishes.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
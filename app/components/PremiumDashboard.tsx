'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Clock, 
  Star, 
  TrendingUp, 
  Package, 
  Heart,
  User,
  Plus,
  ArrowRight,
  Crown,
  Gift,
  Zap,
  Award,
  Timer,
  Bell,
  MapPin,
  CreditCard,
  Calendar,
  Activity,
  Utensils,
  Flame,
  Target,
  Bookmark
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import ProfessionalFoodImage from '@/components/ProfessionalFoodImage'

interface ActiveOrder {
  id: string
  items: string[]
  total: number
  status: 'preparing' | 'on-the-way' | 'delivered'
  estimatedDelivery?: string
  createdAt: string
}

interface RecommendedItem {
  id: string
  name: string
  image: string
  price: number
  rating: number
  description: string
  cookTime: string
  category: string
  imageUrl?: string
  isLoadingImage?: boolean
}

export function PremiumDashboard() {
  const { user } = useAuth()
  const { cart, addToCart } = useCart()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>([])
  const [weeklySpent, setWeeklySpent] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)

  const cartItems = cart?.items || []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const handleAddToCart = async (item: RecommendedItem) => {
    if (!user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive"
      })
      return
    }

    try {
      const success = await addToCart(item.id, 1)
      
      if (success) {
        toast({
          title: "Added to cart!",
          description: `${item.name} has been added to your cart.`,
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to fetch dynamic Unsplash images for recommended items
  const fetchImageForItem = async (item: RecommendedItem) => {
    try {
      const response = await fetch(
        `/api/images/food?name=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category || '')}&id=${encodeURIComponent(item.id)}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.imageUrl) {
          return data.imageUrl
        }
      }
    } catch (error) {
      console.error('Failed to fetch image for item:', item.name, error)
    }
    
    // Return fallback image if API fails
    const fallbackImages = [
      'https://images.unsplash.com/photo-1563379091339-03246963d638?w=400&h=300&fit=crop&crop=center', // biryani
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&crop=center', // pizza  
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center', // ramen
      'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&crop=center', // burger
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&crop=center', // tacos
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center', // salad
    ]
    
    // Generate consistent fallback based on item ID
    let hash = 0
    const str = item.id + item.name
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const imageIndex = Math.abs(hash) % fallbackImages.length
    return fallbackImages[imageIndex]
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) {
          setLoading(false)
          return
        }

        // Fetch real user orders
        const ordersResponse = await fetch(`/api/orders?userId=${user.id}`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          
          // Find active order (preparing, on-the-way)
          const activeOrders = ordersData.orders?.filter((order: any) => 
            order.status === 'preparing' || order.status === 'on-the-way'
          ) || []
          
          if (activeOrders.length > 0) {
            const latestActiveOrder = activeOrders[0]
            setActiveOrder({
              id: latestActiveOrder.id,
              items: latestActiveOrder.items?.map((item: any) => item.name) || [],
              total: parseFloat(latestActiveOrder.total),
              status: latestActiveOrder.status,
              estimatedDelivery: latestActiveOrder.estimatedDeliveryTime || '30-45 min',
              createdAt: latestActiveOrder.createdAt
            })
          }

          // Calculate user stats from real orders
          const completedOrders = ordersData.orders?.filter((order: any) => order.status === 'delivered') || []
          setTotalOrders(completedOrders.length)
          
          const thisWeekStart = new Date()
          thisWeekStart.setDate(thisWeekStart.getDate() - 7)
          const weeklyOrders = completedOrders.filter((order: any) => 
            new Date(order.createdAt) >= thisWeekStart
          )
          const weeklyTotal = weeklyOrders.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total), 0
          )
          setWeeklySpent(weeklyTotal)
        }

        // Fetch user's favorite food items
        const favoritesResponse = await fetch(`/api/favorites?userId=${user.id}`)
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          setFavoriteCount(favoritesData.favorites?.length || 0)
        }

        // Fetch recommended food items (real menu items) - fallback to regular menu if featured fails
        let menuResponse = await fetch('/api/menu?limit=2&featured=true')
        if (!menuResponse.ok) {
          menuResponse = await fetch('/api/menu?limit=2')
        }
        
        if (menuResponse.ok) {
          const menuData = await menuResponse.json()
          if (menuData.success && menuData.items?.length > 0) {
            const formattedItems = menuData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              image: item.image || '', // Will be replaced by dynamic image
              price: parseFloat(item.price),
              rating: parseFloat(item.rating || '4.5'),
              description: item.description || 'Delicious dish made with fresh ingredients.',
              cookTime: item.cookTime || '15-20 min',
              category: item.category?.name || 'Popular',
              imageUrl: '',
              isLoadingImage: true
            }))
            setRecommendedItems(formattedItems)
          } else {
            // If no items from API, show some default recommendations
            setRecommendedItems([
              {
                id: 'default_1',
                name: 'Chef\'s Special Pizza',
                image: '',
                price: 24.99,
                rating: 4.8,
                description: 'Wood-fired pizza with fresh mozzarella and basil',
                cookTime: '15 min',
                category: 'Pizza',
                imageUrl: '',
                isLoadingImage: true
              },
              {
                id: 'default_2',
                name: 'Grilled Salmon',
                image: '',
                price: 32.99,
                rating: 4.9,
                description: 'Fresh Atlantic salmon with seasonal vegetables',
                cookTime: '20 min',
                category: 'Seafood',
                imageUrl: '',
                isLoadingImage: true
              }
            ])
          }
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user?.id])

  // Fetch images for recommended items when they are set
  useEffect(() => {
    const fetchImagesForItems = async () => {
      if (recommendedItems.length === 0) return

      const updatedItems = await Promise.all(
        recommendedItems.map(async (item) => {
          if (item.imageUrl || !item.isLoadingImage) return item
          
          const imageUrl = await fetchImageForItem(item)
          return {
            ...item,
            imageUrl,
            isLoadingImage: false
          }
        })
      )
      
      setRecommendedItems(updatedItems)
    }

    fetchImagesForItems()
  }, [recommendedItems.length]) // Only run when items length changes, not on every update

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {getGreeting()}, {user?.name?.split(' ')[0]}! 
                </h1>
                {user?.role === 'admin' && <Crown className="w-8 h-8 text-yellow-500" />}
              </div>
              <p className="text-muted-foreground text-lg">
                Your personalized culinary experience awaits
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="gap-1">
                  <Star className="w-3 h-3" />
                  Premium Member
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Target className="w-3 h-3" />
                  Level 3 Foodie
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
                <Link href="/cart">
                  <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <ShoppingCart className="w-4 h-4" />
                    Cart ({cartItems.length})
                  </Button>
                </Link>
              )}
              <Link href="/menu">
                <Button variant="outline" className="gap-2">
                  <Utensils className="w-4 h-4" />
                  Browse Menu
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Active Order Alert */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                      <Flame className="w-6 h-6 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-lg">
                        🍕 Your order is being prepared!
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {activeOrder.items.join(', ')} • Est. {activeOrder.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <Link href="/orders">
                    <Button variant="outline" size="sm" className="gap-2 border-amber-300">
                      <Timer className="w-4 h-4" />
                      Track Order
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">This Week</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹{weeklySpent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">Favorites</p>
                  <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{favoriteCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personalized Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recommended for You</h2>
                  <p className="text-sm text-muted-foreground">Based on your taste preferences and order history</p>
                </div>
              </div>
            </div>
            <Link href="/menu">
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Utensils className="w-4 h-4" />
                Explore Menu
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {recommendedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 hover:scale-[1.05] hover:border-orange-200 dark:hover:border-orange-800">
                  <div className="relative h-24">
                    {item.isLoadingImage ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <ProfessionalFoodImage
                        src={item.imageUrl || item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${item.isLoadingImage ? 'opacity-75' : 'opacity-100'}`}
                        professionalCategories={[item.category]}
                        priority={false}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-orange-500/90 text-white border-0 gap-1 text-xs px-1 py-0.5 text-[10px]">
                        <Star className="w-2 h-2 fill-white text-white" />
                        {item.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="mb-2">
                      <h3 className="font-bold text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed mb-2">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-2 h-2" />
                        <span className="text-[10px]">{item.cookTime}</span>
                      </div>
                      <p className="text-sm font-bold text-orange-600">₹{item.price}</p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full gap-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 font-medium text-xs h-7"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="w-2 h-2" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {recommendedItems.length === 0 && (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Order some food to get personalized recommendations!</p>
                <Link href="/menu">
                  <Button className="gap-2">
                    <Utensils className="w-4 h-4" />
                    Browse Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/orders">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Order History</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/favorites">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-pink-500 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Favorites</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/profile">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Profile</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/offers">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <Gift className="w-8 h-8 mx-auto mb-3 text-orange-500 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Offers</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
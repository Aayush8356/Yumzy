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
  Flame
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

interface FavoriteItem {
  id: string
  name: string
  image: string
  price: number
}

interface TrendingItem {
  id: string
  name: string
  description: string
  image: string
  price: number
  rating: number
  cookTime: string
  category: string
}

interface AuthenticatedHomepageProps {
  isDemoUser?: boolean
}

export function AuthenticatedHomepage({ isDemoUser = false }: AuthenticatedHomepageProps) {
  const { user } = useAuth()
  const { cart } = useCart()
  const { toast } = useToast()
  
  const cartItems = cart?.items || []
  
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomepageData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // Fetch active order
        const activeOrderResponse = await fetch(`/api/orders/active?userId=${user.id}`)
        if (activeOrderResponse.ok) {
          const activeOrderData = await activeOrderResponse.json()
          if (activeOrderData.success && activeOrderData.order) {
            setActiveOrder(activeOrderData.order)
          }
        }
        
        // Fetch user favorites
        const authToken = localStorage.getItem('authToken')
        if (authToken) {
          const favoritesResponse = await fetch(`/api/favorites`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          })
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json()
            if (favoritesData.success) {
              setFavorites(favoritesData.favorites.slice(0, 3)) // Only show top 3
            }
          }
        }
        
        // Fetch trending items
        const trendingResponse = await fetch('/api/menu/trending')
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json()
          if (trendingData.success) {
            setTrending(trendingData.items.slice(0, 6)) // Show 6 trending items
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'preparing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'on-the-way': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0]}! 
                {isDemoUser ? ' 🎯' : ' 👋'}
              </h1>
              <p className="text-muted-foreground">
                {isDemoUser 
                  ? "Explore our demo menu and features (checkout is read-only)"
                  : "Welcome to your personalized food experience!"
                }
              </p>
              {isDemoUser && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Demo Account - Limited Features
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
                <Link href="/cart">
                  <Button className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart ({cartItems.length})
                  </Button>
                </Link>
              )}
              {!isDemoUser && (
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <Activity className="w-4 h-4" />
                    My Dashboard
                  </Button>
                </Link>
              )}
              {isDemoUser && (
                <Button variant="outline" className="gap-2" disabled>
                  <Zap className="w-4 h-4" />
                  Demo Mode
                </Button>
              )}
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
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                        Your Order is {activeOrder.status === 'preparing' ? 'Being Prepared' : 'On the Way'}
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {activeOrder.items.join(', ')}
                        {activeOrder.estimatedDelivery && ` • Est. ${activeOrder.estimatedDelivery}`}
                      </p>
                    </div>
                  </div>
                  <Link href="/orders">
                    <Button variant="outline" size="sm" className="gap-2">
                      Track Order
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/menu">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Utensils className="w-6 h-6" />
                    <span className="text-sm">Browse Menu</span>
                  </Button>
                </Link>
                <Link href="/menu?category=trending">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Flame className="w-6 h-6" />
                    <span className="text-sm">What's Hot</span>
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Heart className="w-6 h-6" />
                    <span className="text-sm">My Favorites</span>
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Package className="w-6 h-6" />
                    <span className="text-sm">Order History</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Favorites */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Your Favorites
                </CardTitle>
                <Link href="/favorites">
                  <Button variant="outline" size="sm" className="gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favorites.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">${item.price}</span>
                            <Button size="sm" className="gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Trending Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Trending Now
              </CardTitle>
              <Link href="/menu?category=trending">
                <Button variant="outline" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {trending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trending.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all">
                        <div className="relative">
                          <ProfessionalFoodImage
                            src={item.image}
                            alt={item.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            professionalCategories={[item.category]}
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-orange-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-1">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">${item.price}</span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{item.rating}</span>
                              </div>
                            </div>
                            <Button size="sm" className="gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trending items available right now.</p>
                  <Link href="/menu">
                    <Button className="mt-4">Browse Menu</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
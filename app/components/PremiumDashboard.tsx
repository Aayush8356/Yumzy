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
}

export function PremiumDashboard() {
  const { user } = useAuth()
  const { cart } = useCart()
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulate API calls for user personalization
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock personalized data
        setActiveOrder({
          id: 'order_123',
          items: ['Gourmet Pizza', 'Caesar Salad'],
          total: 45.99,
          status: 'preparing',
          estimatedDelivery: '25-30 min',
          createdAt: new Date().toISOString()
        })
        
        setRecommendedItems([
          {
            id: '1',
            name: 'Truffle Pasta',
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
            price: 28.99,
            rating: 4.9,
            description: 'Handmade pasta with black truffle and parmesan',
            cookTime: '15 min',
            category: 'Italian'
          },
          {
            id: '2', 
            name: 'Wagyu Steak',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
            price: 65.99,
            rating: 5.0,
            description: 'Premium A5 Wagyu with roasted vegetables',
            cookTime: '20 min',
            category: 'Premium'
          }
        ])
        
        setWeeklySpent(156.50)
        setTotalOrders(12)
        setFavoriteCount(8)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
                <Crown className="w-8 h-8 text-yellow-500" />
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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                Recommended for You
              </h2>
              <p className="text-muted-foreground">Based on your taste preferences and order history</p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48">
                    <ProfessionalFoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-800 gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-xl font-bold text-orange-600">₹{item.price}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.cookTime}
                        </span>
                        <Badge variant="outline" size="sm">{item.category}</Badge>
                      </div>
                      <Button size="sm" className="gap-1">
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
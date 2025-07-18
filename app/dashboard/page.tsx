'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Package,
  Heart,
  CreditCard,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Timer,
  Crown,
  Flame
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderStats {
  thisMonth: number
  lastMonth: number
  totalSpent: number
  avgOrderValue: number
  favoriteCuisine: string
  totalOrders: number
}

interface RecentOrder {
  id: string
  date: string
  items: string[]
  total: number
  status: 'delivered' | 'preparing' | 'cancelled'
  rating?: number
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [monthlyProgress, setMonthlyProgress] = useState(75)
  const [favoriteCount, setFavoriteCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Redirect demo users
    const isDemoUser = user?.email === 'demo@yumzy.com' || user?.email?.includes('demo')
    if (isDemoUser) {
      router.push('/')
      return
    }

    const fetchDashboardData = async () => {
      try {
        if (!user?.id) {
          setLoading(false)
          return
        }

        // Fetch real user orders
        const ordersResponse = await fetch(`/api/orders?userId=${user.id}`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          const orders = ordersData.orders || []

          // Calculate real stats
          const now = new Date()
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

          const thisMonthOrders = orders.filter((order: any) => 
            new Date(order.createdAt) >= thisMonth
          )
          const lastMonthOrders = orders.filter((order: any) => 
            new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) <= lastMonthEnd
          )

          const totalSpent = orders.reduce((sum: number, order: any) => 
            sum + parseFloat(order.total || '0'), 0
          )
          const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0

          // Get most frequent cuisine from orders (simplified)
          const cuisines = orders.flatMap((order: any) => 
            order.items?.map((item: any) => item.category) || []
          )
          const cuisineCount = cuisines.reduce((acc: any, cuisine: string) => {
            acc[cuisine] = (acc[cuisine] || 0) + 1
            return acc
          }, {})
          const favoriteCuisine = Object.keys(cuisineCount).length > 0 
            ? Object.keys(cuisineCount).reduce((a, b) => cuisineCount[a] > cuisineCount[b] ? a : b)
            : 'None yet'

          setOrderStats({
            thisMonth: thisMonthOrders.length,
            lastMonth: lastMonthOrders.length,
            totalSpent: totalSpent,
            avgOrderValue: avgOrderValue,
            favoriteCuisine: favoriteCuisine,
            totalOrders: orders.length
          })

          // Set recent orders (real data)
          const formattedOrders = orders
            .slice(0, 3)
            .map((order: any) => ({
              id: order.id,
              date: order.createdAt,
              items: order.items?.map((item: any) => item.name) || [],
              total: parseFloat(order.total || '0'),
              status: order.status,
              rating: order.rating
            }))
          setRecentOrders(formattedOrders)
        }

        // Fetch user favorites count
        const favoritesResponse = await fetch(`/api/favorites?userId=${user.id}`)
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          setFavoriteCount(favoritesData.favorites?.length || 0)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200'
      case 'preparing': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const growthPercentage = orderStats 
    ? ((orderStats.thisMonth - orderStats.lastMonth) / orderStats.lastMonth * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                Analytics & Insights
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover your dining patterns, spending habits, and achieve your food goals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1 px-3 py-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium Analytics
              </Badge>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">This Month</p>
                  <p className="text-3xl font-bold text-blue-700">{orderStats?.thisMonth}</p>
                  <p className="text-xs text-blue-500">orders</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{growthPercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Spent</p>
                  <p className="text-3xl font-bold text-green-700">₹{orderStats?.totalSpent?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-green-500">all time</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Order</p>
                  <p className="text-3xl font-bold text-purple-700">₹{orderStats?.avgOrderValue?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-purple-500">per order</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Favorite</p>
                  <p className="text-2xl font-bold text-orange-700">{orderStats?.favoriteCuisine}</p>
                  <p className="text-xs text-orange-500">cuisine</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Monthly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Orders This Month</span>
                    <span className="text-sm text-muted-foreground">{orderStats?.thisMonth}/10</span>
                  </div>
                  <Progress value={(orderStats?.thisMonth || 0) * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Loyalty Points</span>
                    <span className="text-sm text-muted-foreground">750/1000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">250 points to next reward</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Achievement Unlocked!</span>
                  </div>
                  <p className="text-sm text-yellow-700">Foodie Explorer - Tried 5 different cuisines this month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-500" />
                    Recent Orders
                  </CardTitle>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{order.id}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {order.items.join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        {order.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {order.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{parseFloat(order.total).toFixed(1)}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                  <Timer className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                  <p className="text-2xl font-bold text-indigo-700">-</p>
                  <p className="text-sm text-indigo-600">Avg Delivery Time</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-pink-700">{favoriteCount}</p>
                  <p className="text-sm text-pink-600">Favorite Items</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-green-50 rounded-lg">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-teal-500" />
                  <p className="text-2xl font-bold text-teal-700">-</p>
                  <p className="text-sm text-teal-600">Delivery Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import withAdminAuth from '@/app/components/withAdminAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    thisMonth: number
    pending: number
    completed: number
    cancelled: number
  }
  users: {
    total: number
    verified: number
    unverified: number
    newThisMonth: number
    growth: number
  }
  popularItems: Array<{
    id: string
    name: string
    orders: number
    revenue: number
    rating: number
  }>
  ordersByDay: Array<{
    date: string
    orders: number
    revenue: number
  }>
  userRegistrationsByDay: Array<{
    date: string
    users: number
  }>
  categoryPerformance: Array<{
    category: string
    orders: number
    revenue: number
    items: number
  }>
}

function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d') // 7d, 30d, 90d
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
    orders: { total: 0, thisMonth: 0, pending: 0, completed: 0, cancelled: 0 },
    users: { total: 0, verified: 0, unverified: 0, newThisMonth: 0, growth: 0 },
    popularItems: [],
    ordersByDay: [],
    userRegistrationsByDay: [],
    categoryPerformance: []
  })

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics()
    }
  }, [user?.role, dateRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const exportData = async (type: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}&range=${dateRange}`, {
        method: 'GET',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${dateRange}.${type}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive business insights and metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={fetchAnalytics}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => exportData('csv')}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Revenue
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.revenue.growth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {formatPercentage(analytics.revenue.growth)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(analytics.revenue.total)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(analytics.revenue.thisMonth)} this month
              </p>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {analytics.orders.total}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600">{analytics.orders.completed} completed</span>
                <span className="text-yellow-600">{analytics.orders.pending} pending</span>
                <span className="text-red-600">{analytics.orders.cancelled} cancelled</span>
              </div>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Users
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  analytics.users.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.users.growth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {formatPercentage(analytics.users.growth)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {analytics.users.total}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600">{analytics.users.verified} verified</span>
                <span className="text-yellow-600">{analytics.users.unverified} unverified</span>
              </div>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(analytics.orders.total > 0 ? analytics.revenue.total / analytics.orders.total : 0)}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Per order average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2 p-4">
                {analytics.ordersByDay.slice(-7).map((day, index) => {
                  const maxRevenue = Math.max(...analytics.ordersByDay.map(d => d.revenue))
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 200 : 0
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2">
                        {formatCurrency(day.revenue)}
                      </div>
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2 p-4">
                {analytics.userRegistrationsByDay.slice(-7).map((day, index) => {
                  const maxUsers = Math.max(...analytics.userRegistrationsByDay.map(d => d.users))
                  const height = maxUsers > 0 ? (day.users / maxUsers) * 200 : 0
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2">
                        {day.users}
                      </div>
                      <div 
                        className="w-full bg-purple-500 rounded-t-sm transition-all duration-300 hover:bg-purple-600"
                        style={{ height: `${height}px` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performing Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{item.orders} orders</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryPerformance.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                        <p className="text-sm text-gray-500">{category.items} items • {category.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(category.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAdminAuth(AnalyticsPage)
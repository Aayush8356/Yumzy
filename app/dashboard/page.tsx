'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navigation } from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, Clock, Star, TrendingUp, Package, CreditCard, User, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    quickStats: [] as any[],
    recentOrders: [] as any[],
    favorites: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const authToken = localStorage.getItem('authToken');
        const [statsRes, ordersRes, favRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch(`/api/orders?userId=${user.id}`),
          fetch('/api/favorites', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          })
        ]);
        
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        const favData = await favRes.json();

        if (statsData.success) {
          setDashboardData(prev => ({ ...prev, quickStats: [
            { icon: ShoppingCart, label: 'Total Orders', value: statsData.stats.totalOrders.toString(), color: 'text-blue-600' },
            { icon: Clock, label: 'Avg. Delivery', value: '28min', color: 'text-green-600' },
            { icon: Star, label: 'Your Rating', value: '4.8', color: 'text-yellow-600' },
            { icon: TrendingUp, label: 'Saved Money', value: '$156', color: 'text-purple-600' }
          ]}));
        }
        if (ordersData.success) {
          setDashboardData(prev => ({ ...prev, recentOrders: ordersData.orders.slice(0, 3) }));
        }
        if (favData.success) {
          setDashboardData(prev => ({ ...prev, favorites: favData.favorites }));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'on-the-way': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Header */}
        <section className="pt-24 pb-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your orders and favorites
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      {/* This is a placeholder for the icon */}
                      <div className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/orders">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentOrders.length > 0 ? (
                      dashboardData.recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p>You have no recent orders.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/menu">
                      <Button className="w-full justify-start">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Update Profile
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="h-4 w-4 mr-2" />
                        Order History
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Favorites */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Your Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.favorites.length > 0 ? (
                      dashboardData.favorites.map((item, index) => (
                        <div key={item.name} className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Ordered {item.orders} times
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">${item.price}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>You have no favorite items yet.</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full">
                      View All Favorites
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
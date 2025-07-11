// yumzy/app/admin/components/AdminDashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated and is admin
    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user?.role]); // Re-fetch when auth state changes

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">📦</span>
            </div>
            Total Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalOrders}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {stats.totalOrders === 0 ? 'No orders yet' : 'Orders processed successfully'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">👥</span>
            </div>
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.totalUsers}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {stats.totalUsers === 0 ? 'No users registered' : 'Active user accounts'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🍽️</span>
            </div>
            Menu Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.totalMenuItems}</p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            {stats.totalMenuItems === 0 ? 'No menu items added' : 'Available food items'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

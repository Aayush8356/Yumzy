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
    return <div>Loading...</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalMenuItems}</p>
        </CardContent>
      </Card>
    </div>
  );
}

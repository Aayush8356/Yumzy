'use client';

import { useState, useEffect } from 'react';
import withAdminAuth from '@/app/components/withAdminAuth';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Utensils,
  LogOut,
  Settings,
  BarChart3,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'order_placed' | 'system_update';
  message: string;
  timestamp: Date;
  data?: any;
}

function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out from admin panel.",
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/admin/recent-activity');
        const data = await response.json();
        if (data.success) {
          // Convert timestamp strings back to Date objects
          const activitiesWithDates = data.activities.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          setRecentActivity(activitiesWithDates);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'green';
      case 'order_placed': return 'blue';
      case 'system_update': return 'yellow';
      default: return 'gray';
    }
  };

  const adminMenuItems = [
    { href: '/admin/users', icon: Users, label: 'Users', description: 'Manage user accounts' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', description: 'View and manage orders' },
    { href: '/admin/menu', icon: Utensils, label: 'Menu', description: 'Manage food items' },
    { href: '/admin/contact-messages', icon: MessageSquare, label: 'Messages', description: 'Customer support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                View Site
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="mb-8">
          <AdminDashboard />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg text-gray-900 dark:text-white">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors">
                        <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              {loadingActivity ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
                      <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const color = getActivityColor(activity.type);
                    return (
                      <div 
                        key={activity.id} 
                        className={`flex items-center gap-3 p-3 bg-${color}-50 dark:bg-${color}-900/50 rounded-lg`}
                      >
                        <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 flex-1">{activity.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No recent activity found.</p>
                  <p className="text-sm mt-1">Activity will appear here as users interact with your platform.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminPage);

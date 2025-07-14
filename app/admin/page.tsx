'use client';

import { useState, useEffect } from 'react';
import withAdminAuth from '@/app/components/withAdminAuth';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Home,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'order_placed' | 'system_update' | 'message_received' | 'menu_item_added' | 'admin_action';
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
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [quickActionCounts, setQuickActionCounts] = useState({
    users: 0,
    orders: 0,
    menuItems: 0,
    messages: 0,
    loading: true
  });

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

  const fetchRecentActivity = async (page: number = activityPage, resetPage: boolean = false) => {
    try {
      setLoadingActivity(true);
      const params = new URLSearchParams({
        page: (resetPage ? 1 : page).toString(),
        limit: '10'
      });
      
      if (activityFilter !== 'all') {
        params.set('type', activityFilter);
      }
      
      const url = `/api/admin/recent-activity?${params.toString()}`;
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        // Convert timestamp strings back to Date objects
        const activitiesWithDates = data.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        setRecentActivity(activitiesWithDates);
        setActivityPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
        
        if (resetPage) {
          setActivityPage(1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchQuickActionCounts = async () => {
    try {
      setQuickActionCounts(prev => ({ ...prev, loading: true }));
      
      // Fetch all counts in parallel
      const [usersRes, ordersRes, menuRes, messagesRes] = await Promise.all([
        fetch('/api/admin/users?countOnly=true', { cache: 'no-cache' }),
        fetch('/api/admin/orders?countOnly=true', { cache: 'no-cache' }),
        fetch('/api/admin/menu?countOnly=true', { cache: 'no-cache' }),
        fetch('/api/contact?countOnly=true', { cache: 'no-cache' })
      ]);

      const [usersData, ordersData, menuData, messagesData] = await Promise.all([
        usersRes.json(),
        ordersRes.json(),
        menuRes.json(),
        messagesRes.json()
      ]);

      setQuickActionCounts({
        users: usersData.count || 0,
        orders: ordersData.count || 0,
        menuItems: menuData.count || 0,
        messages: messagesData.count || 0,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch quick action counts:', error);
      setQuickActionCounts(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated and is admin
    if (user?.role === 'admin') {
      // Reset to page 1 when filter changes
      fetchRecentActivity(1, true);
      fetchQuickActionCounts();
    }
  }, [user?.role, activityFilter]); // Re-fetch when user role or filter changes

  // Separate effect for real-time updates (less frequent)
  useEffect(() => {
    if (user?.role === 'admin') {
      // Set up real-time updates every 60 seconds (reduced frequency)
      const interval = setInterval(() => {
        fetchRecentActivity(activityPage);
        fetchQuickActionCounts();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user?.role, activityPage]); // Re-setup interval when page changes

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityStyles = (type: string) => {
    switch (type) {
      case 'user_registration': 
        return {
          bg: 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800',
          dot: 'bg-green-500',
          text: 'text-green-900 dark:text-green-100',
          icon: '👤'
        };
      case 'order_placed': 
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
          text: 'text-blue-900 dark:text-blue-100',
          icon: '📦'
        };
      case 'message_received': 
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
          text: 'text-purple-900 dark:text-purple-100',
          icon: '💬'
        };
      case 'menu_item_added': 
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
          text: 'text-orange-900 dark:text-orange-100',
          icon: '🍽️'
        };
      case 'admin_action': 
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500',
          text: 'text-indigo-900 dark:text-indigo-100',
          icon: '⚙️'
        };
      case 'system_update': 
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
          text: 'text-amber-900 dark:text-amber-100',
          icon: '🔄'
        };
      default: 
        return {
          bg: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          dot: 'bg-gray-500',
          text: 'text-gray-900 dark:text-gray-100',
          icon: '📋'
        };
    }
  };

  const adminMenuItems = [
    { 
      href: '/admin/analytics', 
      icon: BarChart3, 
      label: 'Analytics', 
      description: 'Business insights & reports',
      count: null
    },
    { 
      href: '/admin/users', 
      icon: Users, 
      label: 'Users', 
      description: 'Manage user accounts',
      count: quickActionCounts.users
    },
    { 
      href: '/admin/orders', 
      icon: ShoppingBag, 
      label: 'Orders', 
      description: 'View and manage orders',
      count: quickActionCounts.orders
    },
    { 
      href: '/admin/menu', 
      icon: Utensils, 
      label: 'Menu', 
      description: 'Manage food items',
      count: quickActionCounts.menuItems
    },
    { 
      href: '/admin/contact-messages', 
      icon: MessageSquare, 
      label: 'Messages', 
      description: 'Customer support',
      count: quickActionCounts.messages
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {/* Clickable Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push('/admin')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Y</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
                    <CardTitle className="flex items-center justify-between text-lg text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors">
                          <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {item.label}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {item.count === null ? (
                          <BarChart3 className="w-6 h-6" />
                        ) : quickActionCounts.loading ? (
                          <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          item.count
                        )}
                      </div>
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

        {/* System Maintenance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">System Maintenance</h2>
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Order Status Migration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Fix old orders that are stuck in "preparing" status. This will update them to "delivered" status with appropriate timestamps.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('authToken');
                      const response = await fetch('/api/admin/migrate-orders', {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await response.json();
                      toast({
                        title: "Migration Check",
                        description: `Found ${data.count} old orders that need migration.`,
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to check old orders.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Old Orders
                </Button>
                <Button 
                  size="sm"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('authToken');
                      const response = await fetch('/api/admin/migrate-orders', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await response.json();
                      if (data.success) {
                        toast({
                          title: "Migration Complete",
                          description: `Successfully migrated ${data.migratedCount} old orders.`,
                        });
                        // Refresh activity and counts
                        fetchRecentActivity(activityPage);
                        fetchQuickActionCounts();
                      } else {
                        throw new Error(data.error);
                      }
                    } catch (error) {
                      toast({
                        title: "Migration Failed",
                        description: "Failed to migrate old orders. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Settings className="w-4 h-4" />
                  Migrate Old Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="flex items-center gap-3">
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="user_registration">👤 User Registrations</SelectItem>
                  <SelectItem value="order_placed">📦 Orders Placed</SelectItem>
                  <SelectItem value="message_received">💬 Messages Received</SelectItem>
                  <SelectItem value="menu_item_added">🍽️ Menu Items Added</SelectItem>
                  <SelectItem value="admin_action">⚙️ Admin Actions</SelectItem>
                  <SelectItem value="system_update">🔄 System Updates</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchRecentActivity(activityPage);
                  fetchQuickActionCounts();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
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
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const styles = getActivityStyles(activity.type);
                    return (
                      <div 
                        key={activity.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors hover:opacity-80 ${styles.bg}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{styles.icon}</span>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`}></div>
                        </div>
                        <p className={`text-sm flex-1 font-medium ${styles.text}`}>
                          {activity.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
              
              {/* Pagination Controls */}
              {!loadingActivity && recentActivity.length > 0 && activityPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {((activityPagination.page - 1) * activityPagination.limit) + 1} to{' '}
                    {Math.min(activityPagination.page * activityPagination.limit, activityPagination.total)} of{' '}
                    {activityPagination.total} activities
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = activityPage - 1;
                        setActivityPage(newPage);
                        fetchRecentActivity(newPage);
                      }}
                      disabled={!activityPagination.hasPrevPage || loadingActivity}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {activityPagination.page} of {activityPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = activityPage + 1;
                        setActivityPage(newPage);
                        fetchRecentActivity(newPage);
                      }}
                      disabled={!activityPagination.hasNextPage || loadingActivity}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
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

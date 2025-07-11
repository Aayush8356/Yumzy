'use client';

import { useState } from 'react';
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

function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

  const adminMenuItems = [
    { href: '/admin/users', icon: Users, label: 'Users', description: 'Manage user accounts' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', description: 'View and manage orders' },
    { href: '/admin/menu', icon: Utensils, label: 'Menu', description: 'Manage food items' },
    { href: '/admin/contact-messages', icon: MessageSquare, label: 'Messages', description: 'Customer support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
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
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">New user registration: mink bhai</p>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm">System deployment completed successfully</p>
                  <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm">Database maintenance scheduled</p>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminPage);

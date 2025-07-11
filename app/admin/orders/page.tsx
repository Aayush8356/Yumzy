// yumzy/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import withAdminAuth from '@/app/components/withAdminAuth';
import { OrderManagement } from './components/OrderManagement';
import Link from 'next/link';

function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate loading check
    if (isAuthenticated && user?.role === 'admin') {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-900 dark:text-white">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">View and manage customer orders</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium">
              ← Back to Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Order Management Component */}
        <OrderManagement />
      </div>
    </div>
  );
}

export default withAdminAuth(AdminOrdersPage);

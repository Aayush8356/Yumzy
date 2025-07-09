// yumzy/app/admin/orders/page.tsx
'use client';

import withAdminAuth from '@/app/components/withAdminAuth';
import { OrderManagement } from './components/OrderManagement';

function AdminOrdersPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <OrderManagement />
    </div>
  );
}

export default withAdminAuth(AdminOrdersPage);

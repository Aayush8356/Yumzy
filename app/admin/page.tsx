// yumzy/app/admin/page.tsx
'use client';

import withAdminAuth from '@/app/components/withAdminAuth';
import { AdminDashboard } from './components/AdminDashboard';

function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminDashboard />
    </div>
  );
}

export default withAdminAuth(AdminPage);

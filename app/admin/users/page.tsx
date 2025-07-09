// yumzy/app/admin/users/page.tsx
'use client';

import withAdminAuth from '@/app/components/withAdminAuth';
import { UserManagement } from './components/UserManagement';

function AdminUsersPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserManagement />
    </div>
  );
}

export default withAdminAuth(AdminUsersPage);

'use client';

import { MenuManagement } from './components/MenuManagement';
import withAdminAuth from '@/app/components/withAdminAuth';

function AdminMenuPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      <MenuManagement />
    </div>
  );
}

export default withAdminAuth(AdminMenuPage);

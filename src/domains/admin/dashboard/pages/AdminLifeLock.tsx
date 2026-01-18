/**
 * Admin LifeLock Page
 *
 * Main LifeLock administration and overview page
 */

import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { WeeklyView } from '@/domains/lifelock/2-weekly/WeeklyView';

const AdminLifeLock = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">LifeLock</h1>
          <p className="text-muted-foreground">Personal productivity and life management system</p>
        </div>
        <WeeklyView />
      </div>
    </AdminLayout>
  );
};

export default AdminLifeLock;

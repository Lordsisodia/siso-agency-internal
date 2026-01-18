/**
 * Admin LifeLock Overview Page
 *
 * Overview dashboard for LifeLock metrics and analytics
 */

import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { WeeklyOverviewSection } from '@/domains/lifelock/2-weekly/overview/WeeklyOverviewSection';

const AdminLifeLockOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">LifeLock Overview</h1>
          <p className="text-muted-foreground">Productivity metrics and insights</p>
        </div>
        <WeeklyOverviewSection />
      </div>
    </AdminLayout>
  );
};

export default AdminLifeLockOverview;

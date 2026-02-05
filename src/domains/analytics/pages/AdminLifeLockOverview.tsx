/**
 * Admin LifeLock Overview Page
 *
 * Overview dashboard for LifeLock metrics and analytics
 */

import { AdminLayout } from '@/components/ui/admin/AdminLayout';
import { WeeklyOverviewSection } from '@/domains/lifelock/2-weekly/overview/WeeklyOverviewSection';
import { mockWeeklyData } from '@/domains/lifelock/2-weekly/_shared/mockData';

const AdminLifeLockOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">LifeLock Overview</h1>
          <p className="text-muted-foreground">Productivity metrics and insights</p>
        </div>
        <WeeklyOverviewSection weeklyData={mockWeeklyData} />
      </div>
    </AdminLayout>
  );
};

export default AdminLifeLockOverview;

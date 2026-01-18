/**
 * XP Dashboard Page
 *
 * Analytics dashboard for XP economy and points
 */

import { XPEconomyDashboard } from '@/domains/xp-store/2-dashboard/ui/pages/XPEconomyDashboard';
import { XPStoreProvider } from '@/domains/xp-store/_shared/core/XPStoreContext';

export const XPDashboardPage = () => {
  return (
    <XPStoreProvider>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Dashboard</h1>
        <XPEconomyDashboard />
      </div>
    </XPStoreProvider>
  );
};

export default XPDashboardPage;

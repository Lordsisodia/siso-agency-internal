/**
 * XP Dashboard Page
 *
 * Analytics dashboard for XP economy and points
 */

import { XPStoreProvider } from '@/domains/lifelock/habits/gamification/1-earn/hooks/XPStoreContext';

export const XPDashboardPage = () => {
  return (
    <XPStoreProvider>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Dashboard</h1>
        <p className="text-muted-foreground">XP economy dashboard coming soon.</p>
      </div>
    </XPStoreProvider>
  );
};

export default XPDashboardPage;

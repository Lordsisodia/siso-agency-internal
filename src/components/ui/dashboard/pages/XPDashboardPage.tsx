/**
 * XP Dashboard Page
 *
 * Analytics dashboard for XP economy and points
 */

import { XPStoreProvider } from '@/domains/lifelock/habits/gamification/1-earn/hooks/XPStoreContext';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { PageLoader } from '@/components/ui/PageLoader';
import { AnalyticsDashboard } from '@/domains/lifelock/habits/gamification';

export const XPDashboardPage = () => {
  const { user, isLoaded } = useClerkUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!user?.id) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Dashboard</h1>
        <p className="text-muted-foreground">Please sign in to view your XP Dashboard.</p>
      </div>
    );
  }

  return (
    <XPStoreProvider userId={user.id}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Dashboard</h1>
        <AnalyticsDashboard />
      </div>
    </XPStoreProvider>
  );
};

export default XPDashboardPage;

/**
 * XP Store Page
 *
 * Main storefront for XP rewards and purchases
 */

import { RewardCatalog } from '@/domains/lifelock/habits/gamification/2-spend/features/storefront/RewardCatalog';
import { XPStoreProvider } from '@/domains/lifelock/habits/gamification/1-earn/hooks/XPStoreContext';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { PageLoader } from '@/components/ui/PageLoader';

export const XPStorePage = () => {
  const { user, isLoaded } = useClerkUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!user?.id) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Store</h1>
        <p className="text-muted-foreground">Please sign in to access the XP Store.</p>
      </div>
    );
  }

  return (
    <XPStoreProvider userId={user.id}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Store</h1>
        <RewardCatalog />
      </div>
    </XPStoreProvider>
  );
};

export default XPStorePage;

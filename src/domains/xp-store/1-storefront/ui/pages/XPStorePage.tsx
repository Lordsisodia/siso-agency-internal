/**
 * XP Store Page
 *
 * Main storefront for XP rewards and purchases
 */

import { RewardCatalog } from '@/domains/xp-store/1-storefront/ui/components/RewardCatalog';
import { XPStoreProvider } from '@/domains/xp-store/_shared/core/XPStoreContext';

export const XPStorePage = () => {
  return (
    <XPStoreProvider>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">XP Store</h1>
        <RewardCatalog />
      </div>
    </XPStoreProvider>
  );
};

export default XPStorePage;

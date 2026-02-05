/**
 * XP Store Domain
 *
 * Gamification system with earn, spend, and track phases
 */

// 1-earn: XP earning hooks and context
export { useXPStore } from './1-earn/hooks/useXPStore';
export { XPStoreProvider, useXPStoreContext } from './1-earn/hooks/XPStoreContext';
export { usePoints } from './1-earn/hooks/usePoints';

// 2-spend: Storefront and rewards
export { default as StorefrontPage } from './2-spend/ui/pages/StorefrontPage';
export { default as RewardCatalog } from './2-spend/features/storefront/RewardCatalog';
export { default as PurchaseConfirmationModal } from './2-spend/ui/components/PurchaseConfirmationModal';

// 3-track: Analytics and history
export { default as AnalyticsDashboard } from './3-track/ui/pages/AnalyticsDashboard';
export { default as XPAnalytics } from './3-track/features/analytics/XPAnalytics';
export { default as PurchaseHistory } from './3-track/features/history/PurchaseHistory';
export { default as XPStoreBalance } from './3-track/ui/components/XPStoreBalance';

// Services
export { dailyPointsService } from './3-track/domain/dailyPointsService';

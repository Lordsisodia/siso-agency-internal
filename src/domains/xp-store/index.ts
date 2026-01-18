/**
 * XP Store Domain
 *
 * Gamification, rewards, and points system
 */

// Core hooks and context
export { useXPStore } from './_shared/core/useXPStore';
export { XPStoreProvider } from './_shared/core/XPStoreContext';
export { usePoints } from './_shared/core/usePoints';

// Services
export { dailyPointsService } from './services/dailyPointsService';

// Dashboard components
export { default as XPAnalytics } from './2-dashboard/ui/components/XPAnalytics';
export { default as XPStoreBalance } from './2-dashboard/ui/components/XPStoreBalance';
export { default as PurchaseHistory } from './2-dashboard/ui/components/PurchaseHistory';
export { default as PurchaseConfirmationModal } from './2-dashboard/ui/components/PurchaseConfirmationModal';
export { default as XPEconomyDashboard } from './2-dashboard/ui/pages/XPEconomyDashboard';

// Storefront components
export { default as RewardCatalog } from './1-storefront/ui/components/RewardCatalog';

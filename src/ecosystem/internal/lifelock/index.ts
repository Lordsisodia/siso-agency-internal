/**
 * LifeLock Domain - Barrel Export
 *
 * Single source of truth for LifeLock domain components.
 * Use: import { LifeLockFocusTimer, DeepFocusSection } from '@/ecosystem/internal/lifelock';
 */

// UI Components
export { FocusSessionTimer as LifeLockFocusTimer } from './ui/FocusSessionTimer';

// Section Components
export { DeepFocusWorkSection } from './sections/DeepFocusWorkSection';

// Configuration
export { ENHANCED_TAB_CONFIG } from './admin-lifelock-tabs';
export { LIFELOCK_TABS } from './lifelock-tabs';

// Types
export type * from './types';

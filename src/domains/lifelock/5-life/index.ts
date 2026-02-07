/**
 * Life View Module Exports
 *
 * The Life view provides a high-level overview of your life journey,
 * including vision, goals, legacy, timeline, balance, reviews, and planning.
 */

// Main view component
export { LifeView } from './LifeView';

// Navigation
export { LifeBottomNav } from './_shared/LifeBottomNav';

// Section components
export { LifeVisionSection } from './vision/LifeVisionSection';
export { LifeActiveGoalsSection } from './active-goals/LifeActiveGoalsSection';
export { LifeLegacySection } from './legacy/LifeLegacySection';
export { LifeTimelineSection } from './timeline/LifeTimelineSection';
export { LifeBalanceSection } from './balance/LifeBalanceSection';
export { LifeReviewSection } from './review/LifeReviewSection';
export { LifePlanningSection } from './planning/LifePlanningSection';

// Types
export type {
  CoreValue,
  FiveYearVision,
  LifeVisionData,
  LifeGoal,
  LifetimeStats,
  AllTimeBests,
  FinancialLegacy,
  ImpactMetrics,
  LifeEvent,
  YearTimelineData,
  LifeBalanceScores,
  LifeReview,
  LifePlanning,
} from './_shared/types';

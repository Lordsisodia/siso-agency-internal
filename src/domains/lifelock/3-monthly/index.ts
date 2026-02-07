/**
 * Monthly View - Exports
 */

export { MonthlyView } from './MonthlyView';
export { MonthlyCalendarSection } from './calendar/MonthlyCalendarSection';
export { MonthlyGoalsSection } from './goals/MonthlyGoalsSection';
export { MonthlyPerformanceSection } from './performance/MonthlyPerformanceSection';
export { MonthlyConsistencySection } from './consistency/MonthlyConsistencySection';
export { MonthlyReviewSection } from './review/MonthlyReviewSection';

// V2 Components
export { MonthlyBottomNavV2 } from './_shared/MonthlyBottomNavV2';
export { MonthlyReviewSection as MonthlyReviewSectionV2 } from './review/ui/pages/MonthlyReviewSection';
export { MonthlyGoalsContainer } from './goals/ui/pages/MonthlyGoalsContainer';
export { MonthlyHabitsContainer } from './habits/ui/pages/MonthlyHabitsContainer';
export type {
  MonthlyData,
  MonthlyGoal,
  YearlyProgress,
  Project,
  MonthOverMonthMetric,
  HabitConsistency,
  MonthlyReflection
} from './_shared/types';

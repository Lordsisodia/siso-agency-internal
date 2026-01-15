/**
 * Shared Components for LifeLock Daily Views
 *
 * Scope: Components shared across daily views (morning-routine, light-work, deep-work, etc.)
 * Path: /src/domains/lifelock/1-daily/_shared/components
 *
 * These components are used across multiple daily views within the LifeLock domain
 * to maintain consistency and reduce duplication.
 *
 * Structure:
 * - navigation/ - Navigation components (bottom nav, etc.)
 * - task/ - Task-level components (header, actions, progress, etc.)
 * - subtask/ - Subtask-level components (items, metadata, input)
 * - ui/ - Reusable UI elements (selectors, calendars, cards)
 */

// Navigation Components
export { DailyBottomNav } from './navigation/DailyBottomNav';
export type { DailyBottomNavTab, DailyBottomNavProps } from './navigation/DailyBottomNav';
export { CleanDateNav } from './CleanDateNav';
export { BevelDateHeader } from './BevelDateHeader';
export { UnifiedTopNav } from './UnifiedTopNav';
export { DayProgressPill } from './DayProgressPill';
export { XPPill } from './XPPill';
export { SwipeableSubTabContent } from './SwipeableSubTabContent';

// Task Components
export { TaskHeader } from './task/TaskHeader';
export { TaskActionButtons } from './task/TaskActionButtons';
export { TaskProgress } from './task/TaskProgress';
export { TaskSeparator } from './task/TaskSeparator';
export { TaskStatsGrid } from './task/TaskStatsGrid';

// Subtask Components
export { SubtaskItem } from './subtask/SubtaskItem';
export { SubtaskMetadata } from './subtask/SubtaskMetadata';
export { AddSubtaskInput } from './subtask/AddSubtaskInput';

// Shared UI Components
export { PrioritySelector } from './ui/PrioritySelector';
export type { PriorityLevel } from './ui/PrioritySelector';
export { CustomCalendar } from './ui/CustomCalendar';
export { WorkProtocolCard } from './ui/WorkProtocolCard';

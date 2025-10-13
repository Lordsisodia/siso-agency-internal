/**
 * Shared Components for LifeLock Daily Views
 *
 * Scope: Components shared across daily views (morning-routine, light-work, deep-work, etc.)
 * Path: /src/ecosystem/internal/lifelock/views/daily/_shared/components
 *
 * These components are used across multiple daily views within the LifeLock domain
 * to maintain consistency and reduce duplication.
 */

// Core Components
export { DailyBottomNav } from './DailyBottomNav';
export type { DailyBottomNavTab, DailyBottomNavProps } from './DailyBottomNav';

export { PrioritySelector } from './PrioritySelector';
export type { PriorityLevel } from './PrioritySelector';

export { AddSubtaskInput } from './AddSubtaskInput';
export { CustomCalendar } from './CustomCalendar';
export { SubtaskItem } from './SubtaskItem';
export { SubtaskMetadata } from './SubtaskMetadata';
export { TaskActionButtons } from './TaskActionButtons';
export { TaskHeader } from './TaskHeader';
export { TaskProgress } from './TaskProgress';
export { TaskSeparator } from './TaskSeparator';
export { TaskStatsGrid } from './TaskStatsGrid';
export { WorkProtocolCard } from './WorkProtocolCard';

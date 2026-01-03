/**
 * Tasks Domain - Barrel Export
 *
 * Single source of truth for tasks domain components.
 * Use: import { TaskView, TaskManager, SubtaskItem } from '@/domains/tasks';
 */

// Component Exports
export { TaskView } from './components/TaskView';
export { TaskManager } from './management/TaskManager';
export { SubtaskItem } from './management/SubtaskItem';

// UI Components
export { FocusSessionTimer as TaskFocusTimer } from './ui/FocusSessionTimer';
export { InteractiveTodayCard } from './ui/InteractiveTodayCard';

// Types
export type * from './types';

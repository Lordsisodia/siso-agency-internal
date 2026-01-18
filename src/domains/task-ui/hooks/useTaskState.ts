/**
 * 🎛️ useTaskState Hook - Re-export
 *
 * This hook is maintained in the LifeLock domain as the canonical source.
 * Task-UI domain re-exports it for backward compatibility and cross-domain usage.
 *
 * Canonical location: @/domains/lifelock/1-daily/2-tasks/domain/useTaskState
 */

export { useTaskState } from '@/domains/lifelock/1-daily/2-tasks/domain/useTaskState';
export type {
  TaskFilters,
  TaskSortOptions,
  TaskExpansionState,
  TaskSelectionState
} from '@/domains/lifelock/1-daily/2-tasks/domain/useTaskState';

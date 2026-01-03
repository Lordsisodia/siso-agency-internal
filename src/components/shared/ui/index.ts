/**
 * Shared UI Components - Deduplicated from LifeLock domains
 * 
 * These components were previously duplicated across multiple domains.
 * Now centralized for better maintainability and consistency.
 */

// Timer & Flow Components
export { FlowStateTimer } from './FlowStateTimer';
export type { 
  FlowSession,
  FlowStats,
  FlowState,
  FocusIntensity,
  TaskContext
} from './FlowStateTimer';

// Thought Dump Components
export { ThoughtDumpResults } from './ThoughtDumpResults';

// Task Management Components
export { EisenhowerMatrixModal } from './EisenhowerMatrixModal';
export { CompactDeepFocusCard } from './CompactDeepFocusCard';
export { TasksOverviewCard } from './TasksOverviewCard';
export { TaskHeaderDashboard } from './TaskHeaderDashboard';
export { TaskHeaderList } from './TaskHeaderList';
export { EnhancedTaskDetailModal } from './EnhancedTaskDetailModal';

// Future deduplicated components will be added here:
// export { CollapsibleTaskCard } from './CollapsibleTaskCard';
/**
 * Shared UI Components - Deduplicated from LifeLock domains
 *
 * These components were previously duplicated across multiple domains.
 * Now centralized for better maintainability and consistency.
 */

// Thought Dump Components
export { ThoughtDumpResults } from './ThoughtDumpResults';

// Task Management Components
export { EisenhowerMatrixModal } from './EisenhowerMatrixModal';
// export { TasksOverviewCard } from './TasksOverviewCard'; // TODO: Needs to be created
// export { TaskHeaderList } from './TaskHeaderList'; // TODO: Needs to be created

// Note: The following components were moved/removed:
// - FlowStateTimer → moved to domains/lifelock/1-daily/4-deep-work/
// - CompactDeepFocusCard → moved to domains/lifelock/1-daily/4-deep-work/
// - TaskHeaderDashboard → moved to domains/lifelock/
// - EnhancedTaskDetailModal → needs to be recreated or found

/**
 * Tasks Domain - Barrel Export
 *
 * Unified task management system with specialized features
 */

// Core Task Management
export { TaskManager } from './features/task-management/ui/components/TaskManager';
export { SubtaskItem } from './features/task-management/ui/components/SubtaskItem';
export { WorkflowTaskManager } from './features/task-management/ui/components/WorkflowTaskManager';
export { TaskCard } from './features/task-management/ui/components/TaskCard';
export { TaskList } from './features/task-management/ui/components/TaskList';
export { TaskView } from './features/task-management/ui/components/TaskView';

// Deep Work Features
export { DeepWorkTab } from './features/deep-work/ui/components/DeepWorkTab';
export { DeepFocusWorkSection } from './features/deep-work/ui/components/DeepFocusWorkSection-v2';
export { CompactDeepFocusCard } from './features/deep-work/ui/components/CompactDeepFocusCard';
export { FlowStateTimer } from './features/deep-work/ui/components/FlowStateTimer';

// Light Work Features
export { LightWorkTab } from './features/light-work/ui/components/LightWorkTab';
export { LightFocusWorkSection } from './features/light-work/ui/components/LightFocusWorkSection-v2';

// AI Assistant Features
export { AITaskChat } from './features/ai-assistant/ui/components/AITaskChat';
export { AIAssistantTab } from './features/ai-assistant/ui/components/AIAssistantTab';
export { EnhancedAIChatView } from './features/ai-assistant/ui/components/EnhancedAIChatView';
export { TimeBoxAIAssistant } from './features/ai-assistant/ui/components/TimeBoxAIAssistant';

// Calendar Features
export { CalendarView } from './features/calendar/ui/components/CalendarView';
export { EnhancedTimeBoxCalendar } from './features/calendar/ui/components/EnhancedTimeBoxCalendar';

// Analytics Features
export { TaskAnalytics } from './features/analytics/ui/components/TaskAnalytics';
export { StatsView } from './features/analytics/ui/components/StatsView';
export { TodayProgressSection } from './features/analytics/ui/components/TodayProgressSection';
export { MonthlyProgressSection } from './features/analytics/ui/components/MonthlyProgressSection';

// Shared Components
export { FocusSessionTimer } from './_shared/ui/components/FocusSessionTimer';
export { InteractiveTodayCard } from './_shared/ui/components/InteractiveTodayCard';
export { TaskDetailsSheet } from './_shared/ui/components/TaskDetailsSheet';
export { TaskDetailModal } from './_shared/ui/components/TaskDetailModal';

// Types
export type * from './_shared/domain/types';
export type * from './_shared/domain/tasks.types';
export type * from './_shared/domain/timeblock.types';

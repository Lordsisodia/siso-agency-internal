/**
 * 🎯 TaskContainer V2 - Simplified Task Management Wrapper
 * 
 * Modern replacement for the monolithic TaskContainer that leverages
 * the new decomposed architecture with React Query, context providers,
 * and specialized hooks.
 * 
 * This component is now just a simple wrapper that:
 * 1. Provides TaskProvider context
 * 2. Renders TaskManager with configuration
 * 3. Handles error boundaries
 * 4. Maintains backward compatibility
 * 
 * Benefits:
 * - 90% less code than original TaskContainer
 * - Better separation of concerns
 * - Optimistic updates with React Query
 * - Type-safe validation
 * - Enhanced error handling
 * - Easier testing and maintenance
 */

import React from 'react';
import { TaskProvider, TaskErrorBoundary } from '@/providers/TaskProvider';
import { TaskManager } from '@/components/TaskManager';

/**
 * Props interface - maintains backward compatibility
 */
interface TaskContainerV2Props {
  // Core configuration
  taskType: 'light-work' | 'deep-work';
  userId?: string;
  
  // Event handlers
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  
  // UI configuration
  className?: string;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showBulkActions?: boolean;
  showAddTask?: boolean;
  compactMode?: boolean;
  
  // Legacy props (for backward compatibility)
  initialTasks?: any[]; // Ignored in V2 - data comes from React Query
  theme?: 'deep-work' | 'light-work' | 'default'; // Ignored - theme comes from taskType
  useDatabase?: boolean; // Always true in V2
  workType?: 'light_work' | 'deep_work'; // Deprecated - use taskType
  
  // Advanced configuration
  enableDevtools?: boolean;
  customErrorBoundary?: React.ComponentType<any>;
}

/**
 * TaskContainer V2 - The new simplified task management container
 */
export const TaskContainerV2: React.FC<TaskContainerV2Props> = ({
  taskType,
  userId,
  onStartFocusSession,
  className = '',
  showHeader = true,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  showAddTask = true,
  compactMode = false,
  enableDevtools = process.env.NODE_ENV === 'development',
  customErrorBoundary,
  
  // Legacy props (ignored with warnings)
  initialTasks,
  theme,
  useDatabase,
  workType
}) => {
  
  // Development warnings for deprecated props
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (initialTasks) {
        console.warn('TaskContainerV2: initialTasks prop is ignored. Data is loaded via React Query.');
      }
      if (theme && theme !== taskType) {
        console.warn('TaskContainerV2: theme prop is deprecated. Theme is determined by taskType.');
      }
      if (useDatabase === false) {
        console.warn('TaskContainerV2: useDatabase=false is not supported. Database is always used.');
      }
      if (workType && workType !== (taskType === 'deep-work' ? 'deep_work' : 'light_work')) {
        console.warn('TaskContainerV2: workType is deprecated. Use taskType instead.');
      }
    }
  }, [initialTasks, theme, useDatabase, workType, taskType]);

  // Error Boundary component
  const ErrorBoundary = customErrorBoundary || TaskErrorBoundary;

  return (
    <ErrorBoundary
      fallback={
        <div className={`flex items-center justify-center h-64 text-center ${className}`}>
          <div className="text-destructive">
            <h3 className="text-lg font-semibold mb-2">Task Management Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to load {taskType} tasks. Please try refreshing the page.
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <TaskProvider
        taskType={taskType}
        userId={userId}
        onStartFocusSession={onStartFocusSession}
        enableDevtools={enableDevtools}
      >
        <TaskManager
          className={className}
          showHeader={showHeader}
          showSearch={showSearch}
          showFilters={showFilters}
          showBulkActions={showBulkActions}
          showAddTask={showAddTask}
          compactMode={compactMode}
          onStartFocusSession={onStartFocusSession}
        />
      </TaskProvider>
    </ErrorBoundary>
  );
};

/**
 * Backward compatibility wrapper
 * 
 * This allows existing code to continue working while gradually
 * migrating to the new architecture.
 */
export const TaskContainer: React.FC<TaskContainerV2Props> = (props) => {
  return <TaskContainerV2 {...props} />;
};

/**
 * Migration helper functions
 */
export const migrateFromV1ToV2 = {
  /**
   * Convert legacy TaskContainer props to V2 props
   */
  convertProps: (v1Props: any): TaskContainerV2Props => {
    return {
      taskType: v1Props.workType === 'deep_work' ? 'deep-work' : 'light-work',
      userId: v1Props.userId,
      onStartFocusSession: v1Props.onStartFocusSession,
      className: v1Props.className,
      showHeader: true,
      showSearch: true,
      showFilters: true,
      showBulkActions: true,
      showAddTask: true,
      compactMode: false
    };
  },

  /**
   * Get recommended migration steps
   */
  getMigrationSteps: () => [
    '1. Replace TaskContainer import with TaskContainerV2',
    '2. Update taskType prop (workType → taskType)',
    '3. Remove initialTasks prop (data loaded automatically)',
    '4. Remove useDatabase prop (always enabled)',
    '5. Update theme prop usage (automatic from taskType)',
    '6. Test all functionality works as expected'
  ]
};

/**
 * Development helper for debugging
 */
if (process.env.NODE_ENV === 'development') {
  (TaskContainerV2 as any).displayName = 'TaskContainerV2';
  (TaskContainer as any).displayName = 'TaskContainer (V2 Compatibility)';
}

export default TaskContainerV2;
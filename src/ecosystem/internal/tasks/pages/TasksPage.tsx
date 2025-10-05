/**
 * Modern TasksPage Component
 * Compound component pattern with future-proof architecture
 */

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { TasksProvider, useTasks } from '@/stores/tasks/taskProviderCompat';
import { TasksHeader } from '../components/TasksHeader';
import { TasksFilters } from '../components/TasksFilters';
import { TasksContent } from '../components/TasksContent';
import { TasksAI } from '../components/TasksAI';
import { TasksSidebar } from '../components/TasksSidebar';
import { TasksErrorFallback } from '../components/TasksErrorFallback';
import { TasksLoadingFallback } from '../components/TasksLoadingFallback';
import { TaskFilters, TaskViewType } from '@/ecosystem/internal/tasks/types/task.types';
import { cn } from '@/shared/lib/utils';

// TasksPage Props
interface TasksPageProps {
  initialFilters?: TaskFilters;
  initialView?: TaskViewType;
  enableRealtime?: boolean;
  enableOptimisticUpdates?: boolean;
  className?: string;
  children?: React.ReactNode;
  
  // Layout options
  showSidebar?: boolean;
  showAI?: boolean;
  showHeader?: boolean;
  showFilters?: boolean;
  
  // Customization
  layout?: 'default' | 'compact' | 'fullscreen';
  theme?: 'light' | 'dark' | 'auto';
}

// Internal TasksPage component (wrapped with provider)
const TasksPageInternal: React.FC<Omit<TasksPageProps, 'initialFilters' | 'initialView' | 'enableRealtime' | 'enableOptimisticUpdates'>> = ({
  className,
  children,
  showSidebar = true,
  showAI = true,
  showHeader = true,
  showFilters = true,
  layout = 'default',
  theme = 'light'
}) => {
  const { isLoading, error } = useTasks();

  if (error) {
    throw new Error(error);
  }

  const layoutClasses = {
    default: 'grid grid-cols-[300px_1fr] gap-4 h-screen',
    compact: 'flex flex-col h-screen',
    fullscreen: 'h-screen w-full'
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    auto: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
  };

  return (
    <div className={cn(
      'tasks-page',
      layoutClasses[layout],
      themeClasses[theme],
      className
    )}>
      {/* Sidebar */}
      {showSidebar && layout !== 'compact' && (
        <div className="tasks-sidebar border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-full flex flex-col">
            {showFilters && (
              <div className="flex-1 overflow-hidden">
                <TasksPage.Filters />
              </div>
            )}
            {showAI && (
              <div className="h-[400px] border-t border-gray-200 dark:border-gray-700">
                <TasksPage.AI />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="tasks-main flex flex-col overflow-hidden">
        {showHeader && (
          <div className="tasks-header border-b border-gray-200 dark:border-gray-700">
            <TasksPage.Header />
          </div>
        )}

        {layout === 'compact' && showFilters && (
          <div className="tasks-filters-compact border-b border-gray-200 dark:border-gray-700">
            <TasksPage.Filters compact />
          </div>
        )}

        <div className="tasks-content flex-1 overflow-hidden">
          <Suspense fallback={<TasksLoadingFallback />}>
            <TasksPage.Content />
          </Suspense>
        </div>

        {layout === 'compact' && showAI && (
          <div className="tasks-ai-compact h-[200px] border-t border-gray-200 dark:border-gray-700">
            <TasksPage.AI compact />
          </div>
        )}
      </div>

      {/* Custom children */}
      {children}
    </div>
  );
};

// Main TasksPage component with provider wrapper
export const TasksPage: React.FC<TasksPageProps> = ({
  initialFilters,
  initialView,
  enableRealtime = true,
  enableOptimisticUpdates = true,
  ...props
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={TasksErrorFallback}
      onError={(error, errorInfo) => {
        console.error('TasksPage Error:', error, errorInfo);
        // Could send to error reporting service here
      }}
      onReset={() => {
        // Could reset any state here
        window.location.reload();
      }}
    >
      <TasksProvider
        initialFilters={initialFilters}
        initialView={initialView}
        enableRealtime={enableRealtime}
        enableOptimisticUpdates={enableOptimisticUpdates}
      >
        <Suspense fallback={<TasksLoadingFallback />}>
          <TasksPageInternal {...props} />
        </Suspense>
      </TasksProvider>
    </ErrorBoundary>
  );
};

// Compound component pattern - attach sub-components
TasksPage.Header = TasksHeader;
TasksPage.Filters = TasksFilters;
TasksPage.Content = TasksContent;
TasksPage.AI = TasksAI;
TasksPage.Sidebar = TasksSidebar;

// Layout variations
TasksPage.Compact = (props: Omit<TasksPageProps, 'layout'>) => (
  <TasksPage {...props} layout="compact" />
);

TasksPage.Fullscreen = (props: Omit<TasksPageProps, 'layout'>) => (
  <TasksPage {...props} layout="fullscreen" showSidebar={false} />
);

TasksPage.Minimal = (props: Omit<TasksPageProps, 'showSidebar' | 'showAI' | 'showFilters'>) => (
  <TasksPage {...props} showSidebar={false} showAI={false} showFilters={false} />
);

// Theme variations
TasksPage.Dark = (props: Omit<TasksPageProps, 'theme'>) => (
  <TasksPage {...props} theme="dark" />
);

TasksPage.Light = (props: Omit<TasksPageProps, 'theme'>) => (
  <TasksPage {...props} theme="light" />
);

// Specialized versions
TasksPage.Dashboard = (props: TasksPageProps) => (
  <TasksPage 
    {...props} 
    layout="compact" 
    showAI={false}
    initialView="list"
  />
);

TasksPage.Kanban = (props: TasksPageProps) => (
  <TasksPage 
    {...props} 
    layout="fullscreen"
    showSidebar={false}
    initialView="kanban"
  />
);

TasksPage.Calendar = (props: TasksPageProps) => (
  <TasksPage 
    {...props} 
    layout="fullscreen"
    showSidebar={false}
    initialView="calendar"
  />
);

// Usage examples in comments:
/*

// Basic usage
<TasksPage />

// With initial configuration
<TasksPage 
  initialView="kanban"
  initialFilters={{ status: ['in_progress'] }}
/>

// Compact layout for dashboards
<TasksPage.Compact showAI={false} />

// Full-screen kanban board
<TasksPage.Kanban />

// Custom layout with children
<TasksPage layout="compact">
  <CustomToolbar />
  <CustomFooter />
</TasksPage>

// Using compound components directly
<TasksPage showHeader={false} showSidebar={false}>
  <CustomHeader />
  <div className="flex">
    <TasksPage.Sidebar />
    <TasksPage.Content />
  </div>
</TasksPage>

*/

export default TasksPage;
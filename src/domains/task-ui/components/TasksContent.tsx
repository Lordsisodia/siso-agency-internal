/**
 * TasksContent Component
 * Main content area with view switching and task display
 */

import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Inbox, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks, useTasksView, useTasksSelection } from '../../../.@/lib/stores/tasks/taskProviderCompat';
import { TaskViewType } from '@/domains/task-ui/types/task.types';

// Lazy load view components for better performance
const ListView = React.lazy(() => import('./ListView'));
const KanbanView = React.lazy(() => import('./KanbanView'));
const CalendarView = React.lazy(() => import('./CalendarView'));

interface TasksContentProps {
  className?: string;
  onCreateTask?: () => void;
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  showViewHeader?: boolean;
}

// Loading fallback component
const ViewLoadingFallback: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Error fallback component
const ViewErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 mb-4 max-w-md">
      {error.message || 'An unexpected error occurred while loading the tasks view.'}
    </p>
    <Button onClick={resetErrorBoundary} variant="outline">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try again
    </Button>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => (
  <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Inbox className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No tasks found
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      Get started by creating your first task or adjusting your filters to see more results.
    </p>
    {onCreateTask && (
      <Button onClick={onCreateTask} className="bg-orange-600 hover:bg-orange-700">
        <Plus className="w-4 h-4 mr-2" />
        Create your first task
      </Button>
    )}
  </div>
);

// View header component
const ViewHeader: React.FC<{
  currentView: TaskViewType;
  tasksCount: number;
  filteredCount: number;
  selectedCount: number;
}> = ({ currentView, tasksCount, filteredCount, selectedCount }) => {
  const viewTitles = {
    list: 'List View',
    kanban: 'Kanban Board',
    calendar: 'Calendar View'
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {viewTitles[currentView]}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {filteredCount === tasksCount 
              ? `${tasksCount} task${tasksCount !== 1 ? 's' : ''}`
              : `${filteredCount} of ${tasksCount} task${tasksCount !== 1 ? 's' : ''}`
            }
          </span>
          {selectedCount > 0 && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {selectedCount} selected
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TasksContent: React.FC<TasksContentProps> = ({
  className,
  onCreateTask,
  onTaskSelect,
  onTaskEdit,
  showViewHeader = false
}) => {
  const { tasks, filteredTasks, isLoading, error } = useTasks();
  const { currentView } = useTasksView();
  const { selectedTasks } = useTasksSelection();
  
  const [retryCount, setRetryCount] = useState(0);

  // Handle retry on error
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Render the appropriate view component
  const renderView = () => {
    const commonProps = {
      tasks: filteredTasks,
      onTaskSelect,
      onTaskEdit,
      onCreateTask,
      key: `${currentView}-${retryCount}` // Force remount on retry
    };

    switch (currentView) {
      case 'kanban':
        return <KanbanView {...commonProps} />;
      case 'calendar':
        return <CalendarView {...commonProps} />;
      case 'list':
      default:
        return <ListView {...commonProps} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn('tasks-content flex-1 overflow-hidden', className)}>
        {showViewHeader && (
          <div className="py-4 px-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        )}
        <ViewLoadingFallback />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn('tasks-content flex-1 overflow-hidden', className)}>
        <ViewErrorFallback 
          error={new Error(error)} 
          resetErrorBoundary={handleRetry}
        />
      </div>
    );
  }

  // Show empty state if no tasks
  if (filteredTasks.length === 0 && tasks.length === 0) {
    return (
      <div className={cn('tasks-content flex-1 overflow-hidden', className)}>
        <EmptyState onCreateTask={onCreateTask} />
      </div>
    );
  }

  // Show no results state if filters applied but no matches
  if (filteredTasks.length === 0 && tasks.length > 0) {
    return (
      <div className={cn('tasks-content flex-1 overflow-hidden', className)}>
        <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tasks match your filters
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Try adjusting your search terms or filters to see more results.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Clear all filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('tasks-content flex-1 overflow-hidden', className)}>
      {/* View Header */}
      {showViewHeader && (
        <ViewHeader
          currentView={currentView}
          tasksCount={tasks.length}
          filteredCount={filteredTasks.length}
          selectedCount={selectedTasks.size}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary
          FallbackComponent={ViewErrorFallback}
          onError={(error, errorInfo) => {
            console.error('TasksContent View Error:', error, errorInfo);
          }}
          onReset={handleRetry}
          resetKeys={[currentView, retryCount]}
        >
          <Suspense fallback={<ViewLoadingFallback />}>
            {renderView()}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TasksContent;
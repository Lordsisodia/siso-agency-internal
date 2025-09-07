/**
 * TasksLoadingFallback Component
 * Loading states and skeletons for task components
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

interface TasksLoadingFallbackProps {
  variant?: 'list' | 'kanban' | 'calendar' | 'header' | 'filters' | 'sidebar';
  className?: string;
  itemCount?: number;
  showHeader?: boolean;
}

// Individual task skeleton for list view
const TaskListSkeleton: React.FC = () => (
  <Card className="mb-3">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-4 h-4 mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
        <Skeleton className="w-4 h-4" />
      </div>
    </CardContent>
  </Card>
);

// Kanban column skeleton
const KanbanColumnSkeleton: React.FC = () => (
  <Card className="flex-1 min-w-80 max-w-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-6" />
        </div>
        <Skeleton className="w-4 h-4" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-2" />
              <div className="flex gap-1 mb-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Calendar skeleton
const CalendarSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
    <div className="lg:col-span-2">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="lg:col-span-1">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-2 border rounded">
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Header skeleton
const HeaderSkeleton: React.FC = () => (
  <div className="flex items-center justify-between gap-4 p-6 border-b border-gray-200">
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
      <div className="flex border rounded-lg p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 mx-0.5" />
        ))}
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

// Filters skeleton
const FiltersSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-6" />
      </div>
      <Skeleton className="h-6 w-12" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-8 w-full" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
    
    {Array.from({ length: 3 }).map((_, section) => (
      <div key={section} className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Sidebar skeleton
const SidebarSkeleton: React.FC = () => (
  <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="w-4 h-4" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
    
    <div className="p-4 space-y-4 flex-1">
      {Array.from({ length: 4 }).map((_, section) => (
        <div key={section} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 ml-auto" />
          </div>
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <div className="p-4 border-t border-gray-200">
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const TasksLoadingFallback: React.FC<TasksLoadingFallbackProps> = ({
  variant = 'list',
  className,
  itemCount = 5,
  showHeader = true
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'header':
        return <HeaderSkeleton />;
      
      case 'filters':
        return <FiltersSkeleton />;
      
      case 'sidebar':
        return <SidebarSkeleton />;
      
      case 'kanban':
        return (
          <div className="p-4">
            <div className="flex gap-4 h-full overflow-x-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <KanbanColumnSkeleton key={i} />
              ))}
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="p-4">
            <CalendarSkeleton />
          </div>
        );
      
      case 'list':
      default:
        return (
          <div className="p-4">
            {showHeader && (
              <div className="flex items-center justify-between mb-4 p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            )}
            <div className="space-y-0">
              {Array.from({ length: itemCount }).map((_, i) => (
                <TaskListSkeleton key={i} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('tasks-loading-fallback animate-pulse', className)}>
      {renderSkeleton()}
    </div>
  );
};

export default TasksLoadingFallback;
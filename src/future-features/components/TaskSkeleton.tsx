/**
 * 🎨 Task Skeleton Loader
 *
 * Ultra-fast skeleton for task loading states
 * Only shows for <100ms (IndexedDB is instant!)
 */

import React from 'react';
import { Card } from '@/shared/ui/card';

export function TaskSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
            <div className="h-3 bg-gray-700/30 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-700/40 rounded w-16" />
              <div className="h-6 bg-gray-700/40 rounded w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-700/50 rounded w-48 animate-pulse" />
      <TaskSkeleton count={3} />
    </div>
  );
}

export function MiniTaskSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg animate-pulse">
          <div className="h-4 w-4 bg-gray-700/50 rounded" />
          <div className="h-3 bg-gray-700/40 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

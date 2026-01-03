import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  variant?: 'card' | 'list' | 'table';
}

export const LoadingSkeleton = React.memo(function LoadingSkeleton({ 
  className, 
  rows = 3, 
  variant = 'card' 
}: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-800/60 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-700/40 rounded w-16"></div>
                <div className="h-6 bg-gray-700/40 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
            <div className="h-8 w-8 bg-gray-700/50 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4 p-3">
            <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700/30 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700/40 rounded w-1/6"></div>
            <div className="h-4 bg-gray-700/30 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
});
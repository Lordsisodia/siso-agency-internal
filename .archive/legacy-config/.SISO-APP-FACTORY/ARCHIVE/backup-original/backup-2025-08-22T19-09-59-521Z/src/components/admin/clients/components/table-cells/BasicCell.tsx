
import React from 'react';
import { cn } from '@/lib/utils';
import { TodoItem } from '@/types/client.types';

interface BasicCellProps {
  value: string | number | null | undefined | TodoItem[] | string[];
  className?: string;
}

export const BasicCell = ({ value, className }: BasicCellProps) => {
  if (value === null || value === undefined) {
    return <span>-</span>;
  }
  
  // Handle arrays (TodoItems or string arrays)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>-</span>;
    if (typeof value[0] === 'string') {
      return <span className={cn("truncate", className)}>{value.join(', ')}</span>;
    }
    // For TodoItem[] we'll show counts
    return <span className={cn("truncate", className)}>{value.length} items</span>;
  }
  
  return (
    <span className={cn("truncate", className)}>
      {String(value)}
    </span>
  );
};

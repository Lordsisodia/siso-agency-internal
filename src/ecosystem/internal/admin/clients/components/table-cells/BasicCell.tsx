
import React from 'react';
import { cn } from '@/shared/lib/utils';
import { TodoItem } from '@/types/client.types';

interface BasicCellProps {
  value: string | number | null | undefined | TodoItem[] | string[];
  className?: string;
}

export const BasicCell = ({ value, className }: BasicCellProps) => {
  if (value === null || value === undefined) {
    return <span className="text-xs">-</span>;
  }

  // Handle arrays (TodoItems or string arrays)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-xs">-</span>;
    if (typeof value[0] === 'string') {
      return <span className={cn("text-xs truncate", className)}>{value.join(', ')}</span>;
    }
    // For TodoItem[] we'll show counts
    return <span className={cn("text-xs truncate", className)}>{value.length} items</span>;
  }

  return (
    <span className={cn("text-xs truncate", className)}>
      {String(value)}
    </span>
  );
};

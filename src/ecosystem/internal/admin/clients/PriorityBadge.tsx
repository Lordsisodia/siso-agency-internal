
import React from 'react';
import { Flag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PriorityBadgeProps {
  priority: string | null | undefined;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string | null | undefined) => {
    if (!priority) return { color: 'text-muted-foreground', label: 'No Priority' };
    
    switch (priority.toLowerCase()) {
      case 'high':
        return { color: 'text-red-500', label: 'High Priority' };
      case 'medium':
        return { color: 'text-amber-500', label: 'Medium Priority' };
      case 'low':
        return { color: 'text-green-500', label: 'Low Priority' };
      default:
        return { color: 'text-muted-foreground', label: priority };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div className={cn("flex items-center", config.color, className)}>
      <Flag className="h-3.5 w-3.5" />
    </div>
  );
}

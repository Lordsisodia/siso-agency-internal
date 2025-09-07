
import React from 'react';
import { Flame, AlertCircle, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TaskPriority } from '@/types/task.types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: Flame,
          text: 'Urgent',
          className: 'text-red-500'
        };
      case 'high':
        return {
          icon: AlertCircle,
          text: 'High',
          className: 'text-amber-500'
        };
      case 'medium':
        return {
          icon: ArrowUp,
          text: 'Medium',
          className: 'text-purple-500'
        };
      default:
        return {
          icon: Minus,
          text: 'Low',
          className: 'text-slate-400'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center", config.className, className)}>
      <Icon className="h-3 w-3" />
    </div>
  );
}

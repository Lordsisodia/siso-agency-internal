/**
 * Action Divider Component
 *
 * Visual divider for action sections with gradient lines and label.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ActionDividerProps {
  label: string;
  className?: string;
}

export const ActionDivider: React.FC<ActionDividerProps> = ({
  label,
  className
}) => {
  return (
    <div className={cn('flex items-center gap-2 px-1', className)}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
      <span className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
    </div>
  );
};

ActionDivider.displayName = 'ActionDivider';

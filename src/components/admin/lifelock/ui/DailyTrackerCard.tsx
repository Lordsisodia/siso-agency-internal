import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LucideIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyTrackerCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  emoji?: string;
  color: 'yellow' | 'purple' | 'green' | 'red' | 'pink' | 'indigo' | 'orange' | 'blue';
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  progress?: number;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  isCompact?: boolean;
  onClick?: () => void;
  // New collapsible props
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  showCollapseWhenComplete?: boolean;
  completedTasksCount?: number;
  totalTasksCount?: number;
}

const colorClasses = {
  yellow: {
    card: 'bg-yellow-900/20 border-yellow-700/50 hover:bg-yellow-900/25',
    title: 'text-yellow-400',
    icon: 'text-yellow-500',
    progress: 'bg-yellow-600',
    progressBg: 'bg-yellow-900/30',
    divider: 'border-yellow-600/50'
  },
  purple: {
    card: 'bg-purple-900/20 border-purple-700/50 hover:bg-purple-900/25',
    title: 'text-purple-400',
    icon: 'text-purple-500',
    progress: 'bg-purple-600',
    progressBg: 'bg-purple-900/30',
    divider: 'border-purple-600/50'
  },
  green: {
    card: 'bg-green-900/20 border-green-700/50 hover:bg-green-900/25',
    title: 'text-green-400',
    icon: 'text-green-500',
    progress: 'bg-green-600',
    progressBg: 'bg-green-900/30',
    divider: 'border-green-600/50'
  },
  red: {
    card: 'bg-red-900/20 border-red-700/50 hover:bg-red-900/25',
    title: 'text-red-400',
    icon: 'text-red-500',
    progress: 'bg-red-600',
    progressBg: 'bg-red-900/30',
    divider: 'border-red-600/50'
  },
  pink: {
    card: 'bg-pink-900/20 border-pink-700/50 hover:bg-pink-900/25',
    title: 'text-pink-400',
    icon: 'text-pink-500',
    progress: 'bg-pink-600',
    progressBg: 'bg-pink-900/30',
    divider: 'border-pink-600/50'
  },
  indigo: {
    card: 'bg-indigo-900/20 border-indigo-700/50 hover:bg-indigo-900/25',
    title: 'text-indigo-400',
    icon: 'text-indigo-500',
    progress: 'bg-indigo-600',
    progressBg: 'bg-indigo-900/30',
    divider: 'border-indigo-600/50'
  },
  orange: {
    card: 'bg-orange-900/20 border-orange-700/50 hover:bg-orange-900/25',
    title: 'text-orange-400',
    icon: 'text-orange-500',
    progress: 'bg-orange-600',
    progressBg: 'bg-orange-900/30',
    divider: 'border-orange-600/50'
  },
  blue: {
    card: 'bg-blue-900/20 border-blue-700/50 hover:bg-blue-900/25',
    title: 'text-blue-400',
    icon: 'text-blue-500',
    progress: 'bg-blue-600',
    progressBg: 'bg-blue-900/30',
    divider: 'border-blue-600/50'
  }
};

export const DailyTrackerCard: React.FC<DailyTrackerCardProps> = ({
  title,
  description,
  icon: Icon,
  emoji,
  color,
  children,
  className,
  headerContent,
  progress,
  badge,
  isCompact = false,
  onClick,
  isCollapsible = false,
  defaultCollapsed = false,
  showCollapseWhenComplete = false,
  completedTasksCount = 0,
  totalTasksCount = 0
}) => {
  const colors = colorClasses[color];
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  // Check if section should show as collapsible
  const shouldShowCollapsible = isCollapsible && (
    !showCollapseWhenComplete || 
    (showCollapseWhenComplete && completedTasksCount === totalTasksCount && totalTasksCount > 0)
  );
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'w-full transition-transform duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <Card 
        className={cn(
          colors.card,
          'transition-all duration-200 flex flex-col',
          isCompact && 'shadow-sm',
          !isCompact && 'shadow-lg',
          className
        )}
      >
        <CardHeader className={cn(
          isCompact ? 'p-4 sm:p-5 pb-3 sm:pb-4' : 'p-4 sm:p-5 lg:p-6',
          'relative shrink-0'
        )}>
          {/* Progress bar at top of card */}
          {progress !== undefined && (
            <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden rounded-t-lg">
              <div 
                className={cn('h-full transition-all duration-500', colors.progress)}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                'flex items-center gap-2 flex-wrap',
                colors.title,
                isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              )}>
                <Icon className={cn(
                  colors.icon,
                  isCompact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5 sm:h-6 sm:w-6'
                )} />
                {emoji && <span className="text-base sm:text-lg">{emoji}</span>}
                <span className="font-semibold truncate">{title}</span>
                {shouldShowCollapsible && completedTasksCount === totalTasksCount && totalTasksCount > 0 && (
                  <Check className="h-4 w-4 text-green-500 ml-1" />
                )}
              </CardTitle>
              
              {description && !isCollapsed && (
                <CardDescription className={cn(
                  'text-gray-300 mt-2 leading-relaxed',
                  isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                )}>
                  {description}
                </CardDescription>
              )}
              
              {/* Collapsed state summary */}
              {isCollapsed && shouldShowCollapsible && (
                <div className="mt-2 text-sm text-gray-400">
                  {completedTasksCount}/{totalTasksCount} tasks completed ✓
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {badge && (
                <Badge 
                  variant={badge.variant || 'outline'}
                  className={cn(
                    'shrink-0',
                    isCompact ? 'text-xs px-2 py-1' : 'text-xs sm:text-sm px-2 py-1'
                  )}
                >
                  {badge.label}
                </Badge>
              )}
              
              {/* Collapse button - only show on mobile */}
              {shouldShowCollapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCollapse}
                  className={cn(
                    'h-8 w-8 p-0 md:hidden',
                    colors.icon,
                    'hover:bg-gray-700/50'
                  )}
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {headerContent && !isCollapsed && (
            <>
              <div className={cn('border-t my-4', colors.divider)} />
              <div className="space-y-3">
                {headerContent}
              </div>
            </>
          )}
        </CardHeader>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <CardContent className={cn(
                'flex-1 min-h-0',
                isCompact ? 'p-4 sm:p-5 pt-0' : 'p-4 sm:p-5 lg:p-6 pt-0'
              )}>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default DailyTrackerCard;
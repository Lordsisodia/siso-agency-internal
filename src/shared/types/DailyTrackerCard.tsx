import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Button } from '@/shared/ui/button';
import { LucideIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
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
  const shouldShowCollapsible = isCollapsible;
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    if (shouldShowCollapsible) {
      e.stopPropagation();
      setIsCollapsed(!isCollapsed);
    }
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
          isCompact ? 'p-2 sm:p-3 pb-2 sm:pb-3' : 'p-3 sm:p-4 lg:p-5',
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
              <CardTitle 
                className={cn(
                  'flex items-center gap-2 flex-wrap transition-colors duration-200',
                  colors.title,
                  isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
                  shouldShowCollapsible && 'cursor-pointer hover:opacity-80 select-none'
                )}
                onClick={handleTitleClick}
              >
                <Icon className={cn(
                  colors.icon,
                  isCompact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5 sm:h-6 sm:w-6'
                )} />
                {emoji && <span className="text-base sm:text-lg">{emoji}</span>}
                <span className="font-semibold truncate">{title}</span>
                {shouldShowCollapsible && completedTasksCount === totalTasksCount && totalTasksCount > 0 && (
                  <Check className="h-4 w-4 text-green-500 ml-1" />
                )}
                
                {/* Inline collapse indicator */}
                {shouldShowCollapsible && (
                  <div className="ml-auto flex items-center gap-1">
                    {isCollapsed ? (
                      <ChevronDown className="h-5 w-5 opacity-80 hover:opacity-100 transition-opacity" />
                    ) : (
                      <ChevronUp className="h-5 w-5 opacity-80 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
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
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  {/* Progress summary with visual bar */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 font-medium">
                      {completedTasksCount}/{totalTasksCount} tasks completed
                    </div>
                    {completedTasksCount === totalTasksCount && totalTasksCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                        <Check className="h-3 w-3" />
                        <span>Complete</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className={cn('h-2 rounded-full transition-all duration-500', colors.progress)}
                      style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` }}
                    />
                  </div>
                  
                  {/* Additional info when not complete */}
                  {completedTasksCount < totalTasksCount && (
                    <div className="text-xs text-gray-500">
                      {totalTasksCount - completedTasksCount} tasks remaining
                    </div>
                  )}
                  
                  {/* Time indicator if available */}
                  {progress !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                      <span>Overall progress: {Math.round(progress)}%</span>
                    </div>
                  )}
                </motion.div>
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
                isCompact ? 'p-2 sm:p-3 pt-0' : 'p-3 sm:p-4 lg:p-5 pt-0'
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
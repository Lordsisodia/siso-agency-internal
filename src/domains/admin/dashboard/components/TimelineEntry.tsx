/**
 * Timeline Entry - Individual Day Entry in XP Timeline
 *
 * Shows daily XP breakdown with expandable details including:
 * - Date and total XP
 * - Activities completed
 * - Category breakdown with color coding
 * - Achievements unlocked
 * - Streak count
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trophy, Flame } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Category colors as specified in the requirements
const CATEGORY_COLORS = {
  task: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  focus: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  habit: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    dot: 'bg-green-400',
  },
  health: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
  },
  routine: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
  },
};

export interface TimelineEntryData {
  date: string;
  totalXP: number;
  activities: number;
  categories: {
    task: number;
    focus: number;
    habit: number;
    health: number;
    routine: number;
  };
  achievements?: string[];
  streak: number;
}

interface TimelineEntryProps {
  entry: TimelineEntryData;
  isToday?: boolean;
  isYesterday?: boolean;
}

export function TimelineEntry({ entry, isToday = false, isYesterday = false }: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date: "Jan 17, 2025"
  const formattedDate = format(new Date(entry.date), 'MMM d, yyyy');

  // Get label for grouping
  const getGroupLabel = () => {
    if (isToday) return 'TODAY';
    if (isYesterday) return 'YESTERDAY';
    return '';
  };

  const groupLabel = getGroupLabel();

  // Calculate categories with XP > 0
  const activeCategories = Object.entries(entry.categories)
    .filter(([_, xp]) => xp > 0)
    .map(([category, xp]) => ({ category: category as keyof typeof CATEGORY_COLORS, xp }));

  // Get total activities (use activities count from data)
  const activityCount = entry.activities;

  return (
    <motion.div
      className={cn(
        'relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden',
        isToday && 'border-blue-500/50'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Group Label */}
      {groupLabel && (
        <div className="absolute -top-3 left-4">
          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
            {groupLabel}
          </span>
        </div>
      )}

      {/* Main Content - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Left: Date and XP Summary */}
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium mb-1',
              isToday ? 'text-blue-400' : 'text-gray-300'
            )}>
              {formattedDate}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-xl font-bold text-white">
                {entry.totalXP} XP
              </p>
              <p className="text-xs text-gray-500">
                from {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
              </p>
            </div>
          </div>

          {/* Right: Streak and Expand Button */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400">{entry.streak}</span>
              </div>
            )}

            {/* Achievements Badge */}
            {entry.achievements && entry.achievements.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">{entry.achievements.length}</span>
              </div>
            )}

            {/* Expand/Collapse Icon */}
            <motion.div
              className="p-1"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-800 pt-4">
              {/* Category Breakdown */}
              {activeCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 mb-2">CATEGORY BREAKDOWN</p>
                  <div className="space-y-2">
                    {activeCategories.map(({ category, xp }) => {
                      const colors = CATEGORY_COLORS[category];
                      return (
                        <div
                          key={category}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg border',
                            colors.bg,
                            colors.border
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                            <span className={cn('text-sm font-medium capitalize', colors.text)}>
                              {category}
                            </span>
                          </div>
                          <span className={cn('text-sm font-bold', colors.text)}>+{xp} XP</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {entry.achievements && entry.achievements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">ACHIEVEMENTS UNLOCKED</p>
                  <div className="space-y-1">
                    {entry.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-2 py-1 bg-yellow-500/5 border border-yellow-500/20 rounded"
                      >
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-200">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No details message */}
              {activeCategories.length === 0 && !entry.achievements?.length && (
                <p className="text-xs text-gray-500 text-center py-2">No detailed data available for this day</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

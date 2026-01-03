/**
 * WeeklyTopNav - Clean Weekly Navigation
 *
 * Based on CleanDateNav pattern from Daily view
 * Shows week range and week completion progress
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getWeek, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyTopNavProps {
  selectedWeek: Date;
  weekCompletionPercentage?: number;
  className?: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}

export const WeeklyTopNav: React.FC<WeeklyTopNavProps> = ({
  selectedWeek,
  weekCompletionPercentage = 0,
  className = '',
  onPreviousWeek,
  onNextWeek,
}) => {
  // Blue/Indigo gradient for weekly view (matching Weekly theme)
  const colors = {
    primary: 'from-blue-600 via-blue-400 to-cyan-300',
    glow: 'bg-blue-300/50',
    shimmer: 'via-cyan-200/40',
    pulse: 'bg-blue-400/40',
    ring: 'bg-blue-400/30',
  };

  // Calculate week range
  const weekInfo = useMemo(() => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // Sunday
    const weekNumber = getWeek(selectedWeek, { weekStartsOn: 1 });

    // Format: "Week 42 • Oct 14-20, 2025"
    const weekLabel = `Week ${weekNumber}`;
    const dateRange = `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;

    return { weekLabel, dateRange };
  }, [selectedWeek]);

  return (
    <motion.div
      className={`bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left Arrow */}
        <div className="flex-shrink-0">
          {onPreviousWeek ? (
            <motion.button
              onClick={onPreviousWeek}
              className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* Center Content */}
        <div className="flex-1 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-white mb-1">
              {weekInfo.weekLabel}
            </h1>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              {weekInfo.dateRange}
            </p>
          </motion.div>
        </div>

        {/* Right Arrow */}
        <div className="flex-shrink-0">
          {onNextWeek ? (
            <motion.button
              onClick={onNextWeek}
              className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </div>

      {/* Week Completion Progress Bar */}
      {weekCompletionPercentage >= 0 && (
        <motion.div
          className="px-4 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Week Progress</span>
              <span className="text-xs text-gray-300 font-medium">
                {Math.round(weekCompletionPercentage)}%
              </span>
            </div>

            <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.primary} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(weekCompletionPercentage, 100))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

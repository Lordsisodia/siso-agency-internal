import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Get time-of-day icon based on current hour
const getTimeOfDayIcon = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    // Morning (5am - 12pm)
    return Sunrise;
  } else if (hour >= 12 && hour < 17) {
    // Afternoon (12pm - 5pm)
    return Sun;
  } else if (hour >= 17 && hour < 21) {
    // Evening (5pm - 9pm)
    return Sunset;
  } else {
    // Night (9pm - 5am)
    return Moon;
  }
};

interface DayProgressPillProps {
  percentage: number;              // 0-100
  icon?: React.ReactNode;          // Optional custom icon
  label?: string;                  // Default: "Day Progress"
  showPercentage?: boolean;        // Show percentage text
  showIcon?: boolean;              // Show/hide the icon (default: true)
  className?: string;
  activeTab?: string;              // For dynamic coloring
}

export const DayProgressPill: React.FC<DayProgressPillProps> = ({
  percentage = 0,
  icon,
  label = "Day Progress",
  showPercentage = true,
  showIcon = true,
  className = '',
  activeTab = 'timebox'
}) => {
  // Get time-of-day icon
  const TimeIcon = getTimeOfDayIcon();

  // Use custom icon if provided, otherwise use time-of-day icon, then Target as fallback
  const displayIcon = icon || <TimeIcon className="h-4 w-4 text-white" />;

  // Dynamic color system based on active tab
  const getTabColors = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return {
          gradient: 'from-orange-500 to-amber-400'
        };
      case 'work':
        return {
          gradient: 'from-blue-500 to-cyan-400'
        };
      case 'light-work':
        return {
          gradient: 'from-emerald-500 to-teal-400'
        };
      case 'timebox':
        return {
          gradient: 'from-indigo-500 to-cyan-400'
        };
      case 'wellness':
        return {
          gradient: 'from-rose-500 to-pink-400'
        };
      case 'checkout':
        return {
          gradient: 'from-purple-500 to-pink-400'
        };
      case 'diet':
        return {
          gradient: 'from-green-500 to-emerald-400'
        };
      default:
        return {
          gradient: 'from-indigo-500 to-cyan-400'
        };
    }
  }, [activeTab]);

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-full px-3.5 py-2.5"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2.5">
          {/* Icon with colored background - shows time of day */}
          {showIcon && (
            <div className={cn(
              'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
              getTabColors.gradient
            )}>
              {displayIcon}
            </div>
          )}

          {/* Content Area */}
          <div className={cn('flex-1', !showIcon && 'w-full')}>
            {/* Text Row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-gray-400">
                {label}
              </span>
              {showPercentage && (
                <span className="text-[11px] font-medium text-white">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden relative shadow-inner">
              <motion.div
                className={cn(
                  'h-full bg-gradient-to-r rounded-full relative overflow-hidden',
                  getTabColors.gradient
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
              >
                {/* Animated shimmer effect - goes across entire bar */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
                {/* Strong pulsing glow effect */}
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                    'blur-md'
                  )}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.03, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
                {/* Additional outer glow */}
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
                    'blur-lg'
                  )}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

DayProgressPill.displayName = 'DayProgressPill';

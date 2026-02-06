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
          gradient: 'from-blue-500 to-cyan-400'
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
      // Health section
      case 'stats':
        return {
          gradient: 'from-emerald-500 to-green-400'
        };
      case 'fitness':
        return {
          gradient: 'from-rose-500 to-orange-400'
        };
      case 'nutrition':
        return {
          gradient: 'from-amber-500 to-orange-400'
        };
      default:
        return {
          gradient: 'from-blue-500 to-cyan-400'
        };
    }
  }, [activeTab]);

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-white/[0.12] rounded-full px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.08)]"
        whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* Icon with colored background - shows time of day */}
          {showIcon && (
            <div className={cn(
              'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.4),0_0_12px_rgba(255,255,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.3)]',
              getTabColors.gradient
            )}>
              {displayIcon}
            </div>
          )}

          {/* Content Area */}
          <div className={cn('flex-1', !showIcon && 'w-full')}>
            {/* Text Row */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-gray-400">
                {label}
              </span>
              {showPercentage && (
                <span className={cn(
                  "text-[11px] font-bold tabular-nums transition-opacity duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                  percentage <= 50 ? "text-white" : "text-white/0"
                )}>
                  {Math.round(percentage)}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative">
              {/* Track with subtle depth */}
              <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_-1px_2px_rgba(255,255,255,0.08)] border border-white/10">
                {/* Fill with gradient and glow */}
                <motion.div
                  className={cn(
                    'h-full bg-gradient-to-r rounded-full relative overflow-visible',
                    getTabColors.gradient
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                  style={{
                    boxShadow: `
                      0 0 6px rgba(255,255,255,0.4),
                      0 0 12px rgba(255,255,255,0.2),
                      0 0 24px rgba(255,255,255,0.1),
                      inset 0 1px 1px rgba(255,255,255,0.3),
                      inset 0 -1px 1px rgba(0,0,0,0.2)
                    `
                  }}
                >
                  {/* Leading edge highlight */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-white/70 via-white/30 to-transparent rounded-full" />

                  {/* Top highlight for 3D effect */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  {/* Subtle shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 2.5,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </motion.div>
              </div>

              {/* Percentage marker on the bar */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                initial={{ left: '0%' }}
                animate={{ left: `${Math.min(92, Math.max(8, percentage))}%` }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
              >
                <div className="relative">
                  <span className={cn(
                    "text-[10px] font-bold tabular-nums drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]",
                    percentage > 50 ? "text-white" : "text-white/0"
                  )}>
                    {Math.round(percentage)}%
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

DayProgressPill.displayName = 'DayProgressPill';

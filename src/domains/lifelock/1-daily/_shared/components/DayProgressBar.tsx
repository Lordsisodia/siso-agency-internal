import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DayProgressBarProps {
  percentage: number;
  showPercentage?: boolean;
  className?: string;
  activeTab?: string;
}

export const DayProgressBar: React.FC<DayProgressBarProps> = ({
  percentage = 0,
  showPercentage = true,
  className = '',
  activeTab = 'timebox'
}) => {
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
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
          Day Progress
        </span>
        {showPercentage && (
          <span className="text-[10px] font-semibold text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden relative shadow-inner border border-white/5">
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r rounded-full relative overflow-hidden',
            getTabColors.gradient
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          style={{ minWidth: percentage > 0 ? '4px' : '0' }}
        >
          {/* Animated shimmer effect */}
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
          {/* Pulsing glow effect */}
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
  );
};

DayProgressBar.displayName = 'DayProgressBar';

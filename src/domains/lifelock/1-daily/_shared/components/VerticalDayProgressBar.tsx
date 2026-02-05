import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VerticalDayProgressBarProps {
  percentage: number;
  showPercentage?: boolean;
  className?: string;
  activeTab?: string;
}

export const VerticalDayProgressBar: React.FC<VerticalDayProgressBarProps> = ({
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
          gradient: 'from-orange-500 to-amber-400',
          glow: 'shadow-orange-500/30'
        };
      case 'work':
        return {
          gradient: 'from-blue-500 to-cyan-400',
          glow: 'shadow-blue-500/30'
        };
      case 'light-work':
        return {
          gradient: 'from-emerald-500 to-teal-400',
          glow: 'shadow-emerald-500/30'
        };
      case 'timebox':
        return {
          gradient: 'from-indigo-500 to-cyan-400',
          glow: 'shadow-indigo-500/30'
        };
      case 'wellness':
        return {
          gradient: 'from-rose-500 to-pink-400',
          glow: 'shadow-rose-500/30'
        };
      case 'checkout':
        return {
          gradient: 'from-purple-500 to-pink-400',
          glow: 'shadow-purple-500/30'
        };
      case 'diet':
        return {
          gradient: 'from-green-500 to-emerald-400',
          glow: 'shadow-green-500/30'
        };
      default:
        return {
          gradient: 'from-indigo-500 to-cyan-400',
          glow: 'shadow-indigo-500/30'
        };
    }
  }, [activeTab]);

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen w-1.5 z-40 pointer-events-none',
        className
      )}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Progress fill */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t rounded-t-sm',
          getTabColors.gradient,
          getTabColors.glow
        )}
        initial={{ height: 0 }}
        animate={{ height: `${clampedPercentage}%` }}
        transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
        style={{
          boxShadow: `0 0 10px 2px rgba(255, 255, 255, 0.1)`,
          minHeight: clampedPercentage > 0 ? '2px' : '0'
        }}
      >
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/40 to-transparent"
          animate={{ y: ['-200%', '200%'] }}
          transition={{
            duration: 2.5,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />

        {/* Pulsing glow at the top of the progress */}
        <motion.div
          className={cn(
            'absolute top-0 left-0 right-0 h-4 bg-gradient-to-t from-white/50 to-transparent',
            'blur-sm'
          )}
          animate={{
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
      </motion.div>

      {/* Percentage indicator at the top of progress bar */}
      {showPercentage && clampedPercentage > 0 && (
        <motion.div
          className="absolute left-2 z-50 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            bottom: `${clampedPercentage}%`
          }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{
            transform: clampedPercentage < 10 ? 'translateY(0)' : 'translateY(50%)'
          }}
        >
          <span
            className={cn(
              'text-[9px] font-bold text-white/90 tabular-nums',
              'bg-black/40 backdrop-blur-sm px-1 py-0.5 rounded',
              'border border-white/10 shadow-lg'
            )}
          >
            {Math.round(clampedPercentage)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

VerticalDayProgressBar.displayName = 'VerticalDayProgressBar';

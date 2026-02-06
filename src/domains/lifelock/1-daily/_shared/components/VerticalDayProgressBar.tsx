import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VerticalDayProgressBarProps {
  percentage: number;
  showPercentage?: boolean;
  className?: string;
  activeTab?: string;
}

// Milestone definitions
const MILESTONES = [
  { percent: 25, label: 'Morning', icon: '🌅' },
  { percent: 50, label: 'Halfway', icon: '⛰️' },
  { percent: 75, label: 'Almost', icon: '🎯' },
  { percent: 100, label: 'Complete', icon: '✨' }
];

export const VerticalDayProgressBar: React.FC<VerticalDayProgressBarProps> = ({
  percentage = 0,
  showPercentage = true,
  className = '',
  activeTab = 'timebox'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(new Set());

  // Get time-based color temperature (cool morning -> bright midday -> warm evening)
  const getTimeBasedColors = useMemo(() => {
    const hour = new Date().getHours();
    // Morning: 6-12 (cool blue), Midday: 12-17 (bright), Evening: 17-22 (warm), Night: 22-6 (deep)
    if (hour >= 6 && hour < 12) {
      return {
        gradient: 'from-blue-400 via-cyan-400 to-teal-400',
        glow: 'shadow-blue-400/30',
        temperature: 'morning'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        gradient: 'from-indigo-400 via-purple-400 to-pink-400',
        glow: 'shadow-indigo-400/30',
        temperature: 'midday'
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        gradient: 'from-orange-400 via-amber-400 to-yellow-400',
        glow: 'shadow-orange-400/30',
        temperature: 'evening'
      };
    } else {
      return {
        gradient: 'from-slate-500 via-purple-500 to-indigo-500',
        glow: 'shadow-slate-500/30',
        temperature: 'night'
      };
    }
  }, []);

  // Dynamic color system based on active tab (blends with time-based colors)
  const getTabColors = useMemo(() => {
    const timeColors = getTimeBasedColors;
    switch (activeTab) {
      case 'morning':
        return {
          gradient: 'from-orange-500 to-amber-400',
          glow: 'shadow-orange-500/30',
          temperature: timeColors.temperature
        };
      case 'work':
        return {
          gradient: 'from-blue-500 to-cyan-400',
          glow: 'shadow-blue-500/30',
          temperature: timeColors.temperature
        };
      case 'light-work':
        return {
          gradient: 'from-emerald-500 to-teal-400',
          glow: 'shadow-emerald-500/30',
          temperature: timeColors.temperature
        };
      case 'timebox':
        return {
          gradient: 'from-blue-500 to-cyan-400',
          glow: 'shadow-blue-500/30',
          temperature: timeColors.temperature
        };
      case 'wellness':
        return {
          gradient: 'from-rose-500 to-pink-400',
          glow: 'shadow-rose-500/30',
          temperature: timeColors.temperature
        };
      case 'checkout':
        return {
          gradient: 'from-purple-500 to-pink-400',
          glow: 'shadow-purple-500/30',
          temperature: timeColors.temperature
        };
      case 'diet':
        return {
          gradient: 'from-green-500 to-emerald-400',
          glow: 'shadow-green-500/30',
          temperature: timeColors.temperature
        };
      // Health section
      case 'stats':
        return {
          gradient: 'from-emerald-500 to-green-400',
          glow: 'shadow-emerald-500/30',
          temperature: timeColors.temperature
        };
      case 'fitness':
        return {
          gradient: 'from-rose-500 to-orange-400',
          glow: 'shadow-rose-500/30',
          temperature: timeColors.temperature
        };
      case 'nutrition':
        return {
          gradient: 'from-amber-500 to-orange-400',
          glow: 'shadow-amber-500/30',
          temperature: timeColors.temperature
        };
      default:
        return {
          gradient: 'from-blue-500 to-cyan-400',
          glow: 'shadow-blue-500/30',
          temperature: timeColors.temperature
        };
    }
  }, [activeTab, getTimeBasedColors]);

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Calculate time statistics
  const timeStats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0); // 6 AM
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0); // 10 PM
    const totalDayMinutes = (endOfDay.getTime() - startOfDay.getTime()) / (1000 * 60);
    const elapsedMinutes = Math.max(0, (now.getTime() - startOfDay.getTime()) / (1000 * 60));
    const remainingMinutes = Math.max(0, totalDayMinutes - elapsedMinutes);

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}h ${mins}m`;
    };

    return {
      elapsed: formatTime(elapsedMinutes),
      remaining: formatTime(remainingMinutes),
      percentThroughDay: Math.min(100, Math.max(0, (elapsedMinutes / totalDayMinutes) * 100))
    };
  }, []);

  // Check for milestone celebrations
  React.useEffect(() => {
    MILESTONES.forEach(milestone => {
      if (clampedPercentage >= milestone.percent && !celebratedMilestones.has(milestone.percent)) {
        setCelebratedMilestones(prev => new Set([...prev, milestone.percent]));
      }
    });
  }, [clampedPercentage, celebratedMilestones]);

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen w-1.5 z-40',
        className
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Milestone markers - subtle lines only */}
      {MILESTONES.map((milestone) => {
        const isReached = clampedPercentage >= milestone.percent;

        return (
          <div
            key={milestone.percent}
            className={cn(
              'absolute left-0 right-0 h-px transition-all duration-500',
              isReached ? 'bg-white/30' : 'bg-white/5'
            )}
            style={{ bottom: `${milestone.percent}%` }}
          />
        );
      })}

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
          className="absolute left-2 z-50 pointer-events-auto cursor-pointer"
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

      {/* Contextual Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-siso-bg-alt/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl min-w-[160px]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  getTabColors.temperature === 'morning' && 'bg-blue-400',
                  getTabColors.temperature === 'midday' && 'bg-purple-400',
                  getTabColors.temperature === 'evening' && 'bg-orange-400',
                  getTabColors.temperature === 'night' && 'bg-slate-400'
                )} />
                <span className="text-white/80 text-xs font-medium capitalize">
                  {getTabColors.temperature}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-[10px]">Elapsed</span>
                  <span className="text-white/80 text-[10px] font-medium">{timeStats.elapsed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-[10px]">Remaining</span>
                  <span className="text-white/80 text-[10px] font-medium">{timeStats.remaining}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-[10px]">Progress</span>
                  <span className="text-white font-semibold text-[10px]">{Math.round(clampedPercentage)}%</span>
                </div>
              </div>

              {/* Next milestone */}
              {clampedPercentage < 100 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-white/40 text-[9px]">
                    Next: {MILESTONES.find(m => m.percent > clampedPercentage)?.label}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

VerticalDayProgressBar.displayName = 'VerticalDayProgressBar';

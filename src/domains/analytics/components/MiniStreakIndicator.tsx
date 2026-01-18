/**
 * Mini Streak Indicator - Compact streak display for Dashboard
 *
 * Shows current streak count with fire icon
 * Tappable to navigate to Achievements tab for full calendar
 */

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreakData } from '@/services/analytics/types/xpAnalytics.types';

interface MiniStreakIndicatorProps {
  className?: string;
  data: StreakData;
  onClick?: () => void;
}

export const MiniStreakIndicator: React.FC<MiniStreakIndicatorProps> = ({
  className,
  data,
  onClick
}) => {
  const days = data.current;
  const best = data.best;

  // Determine intensity based on streak length
  const getIntensity = () => {
    if (days >= 30) return 'text-orange-400'; // On fire!
    if (days >= 14) return 'text-yellow-400'; // Getting hot
    if (days >= 7) return 'text-amber-400'; // Warming up
    if (days >= 3) return 'text-orange-600'; // Spark
    return 'text-gray-500'; // Cold
  };

  const intensity = getIntensity();

  return (
    <motion.div
      className={cn(
        'bg-gray-900 border border-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-800 transition-colors',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">Current Streak</p>
          <div className="flex items-center gap-3">
            <motion.div
              animate={
                days >= 7
                  ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, -5, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: days >= 7 ? Infinity : 0,
                repeatDelay: 2,
              }}
            >
              <Flame className={cn('w-8 h-8', intensity)} />
            </motion.div>
            <p className="text-4xl font-bold text-white">{days}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {days === 0 ? 'Start your streak today!' : days === 1 ? '1 day' : `${days} days`}
            {best > days && ` · Best: ${best}`}
          </p>
        </div>

        {/* Streak progress rings */}
        <div className="relative w-16 h-16">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-800"
            />
            {/* Progress ring - progress toward 30 day milestone */}
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={175.93}
              strokeDashoffset={175.93 - (175.93 * Math.min(days, 30) / 30)}
              className={intensity}
              initial={{ strokeDashoffset: 175.93 }}
              animate={{ strokeDashoffset: 175.93 - (175.93 * Math.min(days, 30) / 30) }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">
              {Math.min(days, 30)}/30
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

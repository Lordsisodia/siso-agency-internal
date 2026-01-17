/**
 * Mini Weekly Context - Compact weekly summary for Dashboard
 *
 * Shows this week's total XP and average with a sparkline trend indicator
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyXPData } from '@/domains/lifelock/analytics/types/xpAnalytics.types';

interface MiniWeeklyContextProps {
  className?: string;
  data: WeeklyXPData;
}

export const MiniWeeklyContext: React.FC<MiniWeeklyContextProps> = ({
  className,
  data
}) => {
  // Guard against undefined data
  if (!data || !data.dailyBreakdown || !Array.isArray(data.dailyBreakdown) || data.dailyBreakdown.length === 0) {
    return (
      <motion.div
        className={cn(
          'bg-gray-900 border border-gray-800 rounded-2xl p-5',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">This Week</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">—</p>
              <p className="text-sm text-gray-400">XP total</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">No data available</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate trend vs last week (simplified - just compare to average)
  const trend = data.average >= 50 ? 'up' : data.average >= 30 ? 'neutral' : 'down';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      className={cn(
        'bg-gray-900 border border-gray-800 rounded-2xl p-5',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">This Week</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{data.total}</p>
            <p className="text-sm text-gray-400">XP total</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{data.average}</span> avg/day
            </p>
            <TrendIcon className={cn('w-4 h-4', trendColor)} />
          </div>
        </div>

        {/* Mini sparkline visualization */}
        <div className="flex items-end gap-1 h-12">
          {data.dailyBreakdown.map((day, index) => {
            const maxXP = Math.max(...data.dailyBreakdown.map(d => d.xp));
            const height = maxXP > 0 ? (day.xp / maxXP) * 100 : 0;
            const isToday = index === data.dailyBreakdown.length - 1;

            return (
              <motion.div
                key={index}
                className={cn(
                  'w-2 rounded-full transition-all',
                  isToday ? 'bg-blue-400' : 'bg-gray-700'
                )}
                style={{ height: `${Math.max(height, 4)}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

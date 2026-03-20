/**
 * Peak Productivity Card
 *
 * Shows hourly XP breakdown to identify most productive hours
 */

import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import type { PeakProductivityData } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface PeakProductivityCardProps {
  data: PeakProductivityData;
}

export function PeakProductivityCard({ data }: PeakProductivityCardProps) {
  if (data.hourly.length === 0) {
    return (
      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <p className="text-center text-gray-500 text-sm">No productivity data yet</p>
      </motion.div>
    );
  }

  const maxHourXP = Math.max(...data.hourly.map(h => h.xp));

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Peak Productivity</h3>
            <p className="text-xs sm:text-sm text-gray-400">When you earn the most XP</p>
          </div>
        </div>
      </div>

      {/* Best Period Highlight */}
      <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Most Productive Time</p>
            <p className="text-lg sm:text-xl font-bold text-white">{data.bestPeriod.label}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">XP Earned</p>
            <p className="text-lg sm:text-xl font-bold text-amber-400">{data.bestPeriod.xp}</p>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 mb-3">Hourly Breakdown (Last 30 Days)</p>
        {data.hourly.map((hour, index) => {
          const barWidth = maxHourXP > 0 ? (hour.xp / maxHourXP) * 100 : 0;
          const isPeak = hour.isPeak;

          return (
            <motion.div
              key={hour.hour}
              className={cn(
                'flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg transition-all',
                isPeak ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.02 }}
            >
              {/* Time Label */}
              <div className={cn('w-12 sm:w-16 text-xs sm:text-sm font-medium shrink-0', isPeak ? 'text-amber-400' : 'text-gray-400')}>
                {hour.label}
              </div>

              {/* Bar */}
              <div className="flex-1 h-5 sm:h-6 bg-white/10 rounded-full overflow-hidden min-w-0">
                <motion.div
                  className={cn(
                    'h-full rounded-full relative overflow-hidden',
                    isPeak ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.02 }}
                >
                  {/* Peak indicator glow */}
                  {isPeak && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{
                        duration: 2,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  )}
                </motion.div>
              </div>

              {/* XP Value */}
              <div className="w-12 sm:w-16 text-right shrink-0">
                <p className={cn('text-xs sm:text-sm font-bold', isPeak ? 'text-amber-400' : 'text-gray-300')}>
                  {hour.xp}
                </p>
                <p className="text-xs text-gray-600 hidden sm:block">{hour.sessions} sessions</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 sm:gap-4">
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white">{data.totalXP.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total XP (30 days)</p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white">{data.averageXPPerSession}</p>
          <p className="text-xs text-gray-500">Avg XP/session</p>
        </div>
      </div>
    </motion.div>
  );
}

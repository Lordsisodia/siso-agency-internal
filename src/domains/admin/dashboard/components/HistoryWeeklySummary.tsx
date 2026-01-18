/**
 * History Weekly Summary - Compact "This Week" Summary for History Tab
 *
 * Shows current week's XP total, activities completed, best day, and mini trend indicator
 * Designed to be visually distinct from the main WeeklySummaryCard
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Flame, Target } from 'lucide-react';
import { TrendIndicator } from '@/services/analytics/ui/components/shared';
import type { WeeklyXPData } from '@/services/analytics/types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface HistoryWeeklySummaryProps {
  data: WeeklyXPData;
}

export function HistoryWeeklySummary({ data }: HistoryWeeklySummaryProps) {
  // Calculate total activities completed for the week
  const totalActivities = data.dailyBreakdown.reduce((sum, day) => sum + (day.xp > 0 ? 1 : 0), 0);

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">This Week</h3>
            <p className="text-xs text-gray-400">
              {data.dailyBreakdown[0]?.date} - {data.dailyBreakdown[6]?.date}
            </p>
          </div>
        </div>
        <TrendIndicator trend={data.trend} percent={data.trendPercent} size="sm" />
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total XP */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {data.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total XP</p>
        </div>

        {/* Activities Completed */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="text-2xl font-bold text-white">{totalActivities}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">Activities</p>
        </div>

        {/* Best Day */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{data.bestDay.xp}</p>
          <p className="text-xs text-gray-400 mt-1">Best: {data.bestDay.dayName}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400">Weekly Goal</span>
          <span className="text-gray-300">
            {data.total} / {data.target} XP
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

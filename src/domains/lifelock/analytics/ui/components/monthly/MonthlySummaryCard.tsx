/**
 * Monthly Summary Card
 *
 * Shows monthly XP totals, weekly breakdown, and comparison
 */

import { motion } from 'framer-motion';
import { Calendar, Award } from 'lucide-react';
import { TrendIndicator } from '../shared';
import type { MonthlyXPData } from '../../../types/xpAnalytics.types';

interface MonthlySummaryCardProps {
  data: MonthlyXPData;
}

export function MonthlySummaryCard({ data }: MonthlySummaryCardProps) {
  const monthName = new Date(data.weeklyBreakdown[0]?.startDate || new Date()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{monthName}</h3>
            <p className="text-sm text-gray-400">{data.daysCompleted} / {data.totalDays} days active</p>
          </div>
        </div>
        <TrendIndicator trend={data.trend} percent={data.trendPercent} label="vs last month" />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-3xl font-bold text-white">{(data.total / 1000).toFixed(1)}k</p>
          <p className="text-sm text-gray-400">Total XP</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{data.average}</p>
          <p className="text-sm text-gray-400">Daily avg</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{data.bestDay.xp}</p>
          <p className="text-sm text-gray-400">Best day</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{Math.round(data.goalHitPercent)}%</p>
          <p className="text-sm text-gray-400">Goals hit</p>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-400">Weekly Breakdown</p>
        {data.weeklyBreakdown.map((week, index) => {
          const maxWeekXP = Math.max(...data.weeklyBreakdown.map(w => w.xp));
          const percentOfMax = maxWeekXP > 0 ? (week.xp / maxWeekXP) * 100 : 0;

          return (
            <motion.div
              key={week.week}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{week.week}</span>
                <span className="text-lg font-bold text-white">{week.xp.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentOfMax}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{week.average}/day avg</span>
                <span>Best: {week.bestDay} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

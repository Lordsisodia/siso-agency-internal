/**
 * Monthly Summary Card
 *
 * Shows monthly XP totals, weekly breakdown, and comparison
 * PHASE 4 FIX: Removed month/year labels, using date ranges instead
 */

import { motion } from 'framer-motion';
import { Calendar, Award } from 'lucide-react';
import { TrendIndicator } from '../shared';
import type { MonthlyXPData } from '../../../types/xpAnalytics.types';

interface MonthlySummaryCardProps {
  data: MonthlyXPData;
}

export function MonthlySummaryCard({ data }: MonthlySummaryCardProps) {
  // Get date range instead of month name
  const firstWeek = data.weeklyBreakdown[0];
  const lastWeek = data.weeklyBreakdown[data.weeklyBreakdown.length - 1];
  
  const formatDateRange = () => {
    if (!firstWeek || !lastWeek) return 'This Month';
    
    // Extract start date from first week and end date from last week
    const startDate = new Date(firstWeek.startDate);
    const endDate = new Date(lastWeek.endDate);
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    
    // If same month, show "Jan 1-31"
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    }
    // If different months, show "Jan 28 - Feb 3"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  const dateRange = formatDateRange();

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
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
            <h3 className="text-lg font-bold text-white">Monthly Summary</h3>
            <p className="text-sm text-gray-400">{dateRange}</p>
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
              className="bg-gray-800 border border-gray-700 rounded-lg p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{week.week}</span>
                <span className="text-lg font-bold text-white">{week.xp.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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

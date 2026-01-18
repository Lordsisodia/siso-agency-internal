/**
 * Weekly Summary Card - Redesigned
 *
 * Beautiful weekly view with gradient bars and improved styling
 */

import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import { TrendIndicator } from '../shared';
import type { WeeklyXPData } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface WeeklySummaryCardProps {
  data: WeeklyXPData;
}

const DAY_GRADIENTS = [
  'from-red-500 to-orange-400',      // Monday
  'from-orange-500 to-amber-400',    // Tuesday
  'from-yellow-500 to-lime-400',     // Wednesday
  'from-green-500 to-emerald-400',   // Thursday
  'from-teal-500 to-cyan-400',       // Friday
  'from-blue-500 to-indigo-400',     // Saturday
  'from-indigo-500 to-purple-400',   // Sunday
];

const DAY_ICONS = ['💪', '🚀', '⚡', '🔥', '✨', '🎯', '💎'];

export function WeeklySummaryCard({ data }: WeeklySummaryCardProps) {
  return (
    <motion.div
      className="relative bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">This Week</h3>
            <p className="text-xs text-gray-400">{data.dailyBreakdown[0]?.date} - {data.dailyBreakdown[6]?.date}</p>
          </div>
        </div>
        <TrendIndicator trend={data.trend} percent={data.trendPercent} label="vs last week" />
      </div>

      {/* Main Stats Row */}
      <div className="relative grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {data.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total XP</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{data.average}</p>
          <p className="text-xs text-gray-400 mt-1">Daily avg</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{data.bestDay.xp}</p>
          <p className="text-xs text-gray-400 mt-1">Best: {data.bestDay.dayName}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400">Weekly Goal</span>
          <span className="text-gray-300">{data.total} / {data.target} XP</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
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
          </motion.div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="relative grid grid-cols-7 gap-2">
        {data.dailyBreakdown.map((day, index) => {
          const dayGoal = day.goal || 500;
          const dayProgress = Math.min(100, (day.xp / dayGoal) * 100);
          const gradient = DAY_GRADIENTS[index % DAY_GRADIENTS.length];
          const dayIcon = DAY_ICONS[index % DAY_ICONS.length];
          const isCompleted = day.xp >= dayGoal;
          const hasXP = day.xp > 0;

          return (
            <motion.div
              key={day.date}
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <div
                className={cn(
                  'relative rounded-xl p-2 text-center transition-all border',
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg shadow-green-500/20'
                    : hasXP
                    ? 'bg-white/5 border-blue-500/30'
                    : 'bg-white/5 border-white/10',
                  'hover:scale-105'
                )}
              >
                {/* Day Icon */}
                {hasXP && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br rounded-full flex items-center justify-center text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    style={{ background: gradient.includes('from-') ? `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` : undefined }}
                  >
                    {dayIcon}
                  </motion.div>
                )}

                {/* Day Name */}
                <p className={cn(
                  'text-xs font-medium mb-1',
                  isCompleted ? 'text-green-400' : hasXP ? 'text-blue-400' : 'text-gray-600'
                )}>
                  {day.dayName.charAt(0)}
                </p>

                {/* XP Value */}
                <p
                  className={cn(
                    'text-lg font-bold',
                    isCompleted ? 'text-green-400' : hasXP ? 'text-blue-400' : 'text-gray-700'
                  )}
                >
                  {day.xp}
                </p>

                {/* Mini Progress Bar */}
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full bg-gradient-to-r rounded-full', gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${dayProgress}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

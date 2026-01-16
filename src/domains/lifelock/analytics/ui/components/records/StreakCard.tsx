/**
 * Streak Card
 *
 * Shows current and best streaks with visual calendar
 */

import { motion } from 'framer-motion';
import { Flame, Crown } from 'lucide-react';
import type { StreakData } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface StreakCardProps {
  data: StreakData;
}

export function StreakCard({ data }: StreakCardProps) {
  // Get last 14 days for calendar view
  const recentDays = data.calendarData.slice(-14);

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Streaks</h3>
          <p className="text-sm text-gray-400">Keep the momentum going!</p>
        </div>
      </div>

      {/* Current & Best Streak */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-gray-300">Current</span>
          </div>
          <p className="text-4xl font-bold text-orange-400">{data.current}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.current === 1 ? 'day' : 'days'}
          </p>
        </div>

        {/* Best Streak */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Best</span>
          </div>
          <p className="text-4xl font-bold text-yellow-400">{data.best}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.best === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div>
        <p className="text-xs font-medium text-gray-400 mb-3">Last 14 Days</p>
        <div className="grid grid-cols-7 gap-2">
          {recentDays.map((day, index) => {
            const isCompleted = day.completed;
            const isToday = day.isToday;
            const isPast = day.isPast;

            return (
              <motion.div
                key={day.date}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all',
                  isCompleted && 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30',
                  !isCompleted && isPast && 'bg-white/5 text-gray-600',
                  !isCompleted && !isPast && 'bg-white/5 text-gray-700',
                  isToday && !isCompleted && 'border-2 border-orange-500/50',
                  isToday && isCompleted && 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-900'
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.02 }}
                title={`${day.date}: ${day.xp} XP`}
              >
                {day.xp > 0 && !isCompleted && day.xp}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Motivation Message */}
      {data.current > 0 && (
        <motion.div
          className="mt-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-center text-gray-300">
            {data.canExtend
              ? `🔥 Complete today to extend your streak to ${data.current + 1} days!`
              : data.todayCompleted
              ? `🎉 Streak extended! Keep it going tomorrow!`
              : `💪 Start a new streak today!`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

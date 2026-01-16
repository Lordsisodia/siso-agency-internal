/**
 * Today's Progress Card - Redesigned
 *
 * Beautiful hero card with glassmorphism and gradients
 */

import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { CircularProgress, TrendIndicator } from '../shared';
import type { TodayXPData, LevelProgress } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface TodayProgressCardProps {
  data: TodayXPData;
  level: LevelProgress;
}

export function TodayProgressCard({ data, level }: TodayProgressCardProps) {
  return (
    <motion.div
      className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-6 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/20 to-rose-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">Today's Progress</h3>
              <div className="px-2 py-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 rounded-full">
                <span className="text-xs font-semibold text-indigo-300">Level {level.current}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {level.xpToNext} XP to Level {level.next}
            </p>
          </div>
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        {/* Main Progress Circle */}
        <div className="flex items-center gap-6 mb-6">
          {/* Circular Progress */}
          <CircularProgress
            value={data.progress}
            size={140}
            strokeWidth={12}
            gradient="from-indigo-500 via-purple-500 to-pink-500"
          >
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent">
                {data.progress}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {data.total} / {data.goal} XP
              </div>
            </div>
          </CircularProgress>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            {/* Today's XP */}
            <motion.div
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Today</span>
              </div>
              <p className="text-2xl font-bold text-white">+{data.total}</p>
              {data.trend.percentChange !== 0 && (
                <div className="mt-1">
                  <TrendIndicator
                    trend={data.trend.difference > 0 ? 'up' : 'down'}
                    percent={Math.abs(data.trend.percentChange)}
                    size="sm"
                    showIcon={false}
                  />
                </div>
              )}
            </motion.div>

            {/* Remaining */}
            <motion.div
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">To Go</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.remaining}</p>
              <p className="text-xs text-gray-500">XP remaining</p>
            </motion.div>

            {/* Sessions */}
            <motion.div
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.sessions}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </motion.div>

            {/* Peak Hour */}
            <motion.div
              className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⏰</span>
                <span className="text-xs text-gray-400">Peak</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.peakHour}:00</p>
              <p className="text-xs text-gray-500">Best hour</p>
            </motion.div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-medium text-gray-400 mb-3">Today's Breakdown</p>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(data.categories).map(([key, cat], index) => (
              <motion.div
                key={key}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.05, borderColor: cat.color }}
              >
                <span className="text-lg">{cat.icon}</span>
                <p className={cn('text-lg font-bold', cat.text)}>{cat.total}</p>
                <p className="text-xs text-gray-600 capitalize">{key}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

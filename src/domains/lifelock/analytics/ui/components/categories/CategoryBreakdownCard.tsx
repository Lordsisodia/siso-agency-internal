/**
 * Category Breakdown Card
 *
 * Shows XP distribution across categories with trend indicators
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendIndicator } from '../shared';
import type { XPCategory } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface CategoryBreakdownCardProps {
  categories: Record<XPCategory, { total: number; percent: number; trend: number; icon: string; text: string }>;
  totalXP: number;
}

const CATEGORY_INFO: Record<XPCategory, { name: string; color: string; gradient: string }> = {
  tasks: { name: 'Tasks', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-400' },
  wellness: { name: 'Wellness', color: 'text-rose-400', gradient: 'from-rose-500 to-pink-400' },
  morning: { name: 'Morning', color: 'text-orange-400', gradient: 'from-orange-500 to-amber-400' },
  focus: { name: 'Focus', color: 'text-violet-400', gradient: 'from-violet-500 to-purple-400' },
  habits: { name: 'Habits', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-400' },
};

export function CategoryBreakdownCard({ categories, totalXP }: CategoryBreakdownCardProps) {
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b.total - a.total) as Array<
    [XPCategory, typeof categories[XPCategory]]
  >;

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">XP Sources Breakdown</h3>
        <p className="text-sm text-gray-400">Distribution across categories</p>
      </div>

      {/* Category Bars */}
      <div className="space-y-4">
        {sortedCategories.map(([key, cat], index) => {
          const info = CATEGORY_INFO[key];
          const barWidth = totalXP > 0 ? (cat.total / totalXP) * 100 : 0;

          return (
            <motion.div
              key={key}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className={cn('font-semibold', info.color)}>{info.name}</p>
                    <p className="text-xs text-gray-500">
                      {cat.total.toLocaleString()} XP ({cat.percent}%)
                    </p>
                  </div>
                </div>
                <TrendIndicator
                  trend={cat.trend > 0 ? 'up' : cat.trend < 0 ? 'down' : 'stable'}
                  percent={Math.abs(cat.trend)}
                  size="sm"
                  showIcon={false}
                />
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full bg-gradient-to-r rounded-full', info.gradient)}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.05, ease: 'easeOut' }}
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
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Increasing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span>Decreasing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Stable</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

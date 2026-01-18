/**
 * Recent Achievements Card
 *
 * Shows recently unlocked achievements and progress
 */

import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import type { AchievementSummary } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface RecentAchievementsCardProps {
  achievements: AchievementSummary[];
  totalUnlocked: number;
  totalAvailable: number;
  nextToUnlock: AchievementSummary[];
}

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-purple-500 to-violet-400',
  legendary: 'from-yellow-500 to-orange-400',
};

const RARITY_BG = {
  common: 'bg-gray-500/10',
  rare: 'bg-blue-500/10',
  epic: 'bg-purple-500/10',
  legendary: 'bg-yellow-500/10',
};

export function RecentAchievementsCard({
  achievements,
  totalUnlocked,
  totalAvailable,
  nextToUnlock,
}: RecentAchievementsCardProps) {
  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Achievements</h3>
            <p className="text-sm text-gray-400">
              {totalUnlocked} / {totalAvailable} unlocked
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
          <span className="text-sm font-bold text-yellow-400">
            {Math.round((totalUnlocked / totalAvailable) * 100)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalUnlocked / totalAvailable) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Recently Unlocked */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-400 mb-3">Recently Unlocked</p>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  RARITY_BG[achievement.rarity],
                  'border-white/10 hover:border-white/20'
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                {/* Badge */}
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br',
                  RARITY_COLORS[achievement.rarity]
                )}>
                  {achievement.badge}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>

                {/* Unlocked Icon */}
                <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Next to Unlock */}
      {nextToUnlock.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-3">In Progress</p>
          <div className="space-y-2">
            {nextToUnlock.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Badge (locked) */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white/5">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.progress} / {achievement.maxProgress}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && nextToUnlock.length === 0 && (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Start earning XP to unlock achievements!</p>
        </div>
      )}
    </motion.div>
  );
}

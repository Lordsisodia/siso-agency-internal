/**
 * Level Progress Card
 * Displays detailed level/XP progression information
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, Calendar, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LevelProgress } from '@/domains/lifelock/analytics/types/xpAnalytics.types';

interface LevelProgressCardProps {
  level: LevelProgress;
  className?: string;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  level,
  className
}) => {
  // Calculate days to next level at current rate
  const daysToNextLevel = level.estimatedDaysToNextLevel || 0;

  return (
    <Card className={cn("bg-gray-900 border-gray-800", className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Level Progress</h3>
              <p className="text-sm text-gray-400">Your journey continues</p>
            </div>
          </div>

          {/* Current Level Badge */}
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-1.5 text-sm">
            Level {level.current}
          </Badge>
        </div>

        {/* Main Level Display */}
        <div className="flex items-center gap-6">
          {/* Large Level Number */}
          <div className="relative">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(99, 102, 241, 0.3)",
                  "0 0 40px rgba(99, 102, 241, 0.5)",
                  "0 0 20px rgba(99, 102, 241, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-4xl font-bold text-white">{level.current}</span>
            </motion.div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
              LVL
            </div>
          </div>

          {/* XP Details */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total XP</span>
                <span className="text-2xl font-bold text-white">{level.totalXP.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">All time earned</span>
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">XP to Level {level.next}</span>
                <span className="text-lg font-semibold text-indigo-300">{level.xpToNext.toLocaleString()}</span>
              </div>
              <Progress value={level.progress} className="h-3 bg-gray-700" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">{level.currentXP} / {level.xpForNextLevel} XP</span>
                <span className="text-xs font-bold text-indigo-400">{Math.round(level.progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Levels This Month */}
          <div className="bg-gray-800 border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">+{level.levelsGainedThisMonth}</p>
            <p className="text-xs text-gray-500">Levels gained</p>
          </div>

          {/* Est Days to Next */}
          <div className="bg-gray-800 border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Est. Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{daysToNextLevel}</p>
            <p className="text-xs text-gray-500">Days to next level</p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gray-800 border-gray-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">
                {level.progress >= 75 ? "Almost there!" :
                 level.progress >= 50 ? "Great progress!" :
                 level.progress >= 25 ? "Keep going!" :
                 "Your journey begins!"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {level.progress >= 75 ? `Just ${level.xpToNext.toLocaleString()} more XP to Level ${level.next}` :
                 level.progress >= 50 ? `You're ${Math.round(100 - level.progress)}% of the way there` :
                 level.progress >= 25 ? `${level.xpToNext.toLocaleString()} XP remaining` :
                 `Earn ${level.xpToNext.toLocaleString()} XP to reach Level ${level.next}`}
              </p>
            </div>
          </div>
        </div>

        {/* Level Path Visualization */}
        <div className="flex items-center justify-between px-4">
          {[level.current, level.current + 1, level.current + 2, level.current + 3].map((lvl, idx) => (
            <div key={lvl} className="flex items-center">
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                  idx === 0
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30"
                    : idx === 1
                    ? "bg-white/10 border-white/20 text-gray-400"
                    : "bg-gray-800/50 border-gray-700 text-gray-600"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                {lvl}
              </motion.div>
              {idx < 3 && (
                <div className={cn(
                  "w-8 h-1 mx-1 rounded-full",
                  idx === 0 ? "bg-indigo-500/30" : "bg-gray-700/50"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

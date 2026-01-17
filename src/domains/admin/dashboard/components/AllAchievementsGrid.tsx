/**
 * All Achievements Grid
 * Displays all available achievements in a filterable grid
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Unlock, Star, Trophy, Target, Zap, Sunrise, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AchievementSummary } from '@/domains/lifelock/analytics/types/xpAnalytics.types';

interface AllAchievementsGridProps {
  achievements: AchievementSummary[];
  totalUnlocked: number;
  totalAvailable: number;
  className?: string;
}

type FilterCategory = 'all' | 'tasks' | 'wellness' | 'morning' | 'focus' | 'habits';
type FilterStatus = 'all' | 'unlocked' | 'locked' | 'in-progress';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  tasks: <Target className="h-4 w-4" />,
  wellness: <Zap className="h-4 w-4" />,
  morning: <Sunrise className="h-4 w-4" />,
  focus: <Brain className="h-4 w-4" />,
  habits: <Sparkles className="h-4 w-4" />,
};

export const AllAchievementsGrid: React.FC<AllAchievementsGridProps> = ({
  achievements,
  totalUnlocked,
  totalAvailable,
  className
}) => {
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      // Category filter
      if (categoryFilter !== 'all' && achievement.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'unlocked' && !achievement.unlocked) {
        return false;
      }
      if (statusFilter === 'locked' && achievement.unlocked) {
        return false;
      }
      if (statusFilter === 'in-progress') {
        if (achievement.unlocked) return false;
        if (!achievement.progress || achievement.progress >= achievement.maxProgress) return false;
      }

      return true;
    });
  }, [achievements, categoryFilter, statusFilter]);

  return (
    <Card className={cn("bg-gray-900 border-gray-800", className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">All Achievements</h3>
              <p className="text-sm text-gray-400">
                {totalUnlocked} of {totalAvailable} unlocked ({Math.round((totalUnlocked / totalAvailable) * 100)}%)
              </p>
            </div>
          </div>

          {/* Completion Badge */}
          <Badge className={cn(
            "px-3 py-1",
            totalUnlocked === totalAvailable
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          )}>
            {totalUnlocked === totalAvailable ? (
              <><Star className="h-3 w-3 mr-1" /> Complete!</>
            ) : (
              <>{totalAvailable - totalUnlocked} remaining</>
            )}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="wellness">Wellness</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="focus">Focus</SelectItem>
              <SelectItem value="habits">Habits</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Clear Filters
          </Button>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No achievements match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative border rounded-2xl p-4 transition-all duration-200",
                  achievement.unlocked
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white/5 border-white/10"
                )}
              >
                {/* Status Icon */}
                <div className="absolute top-3 right-3">
                  {achievement.unlocked ? (
                    <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                      <Unlock className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-500/20 border border-gray-500/30 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className={cn(
                  "text-4xl mb-3",
                  !achievement.unlocked && "grayscale opacity-50"
                )}>
                  {achievement.badge}
                </div>

                {/* Name */}
                <h4 className={cn(
                  "font-semibold mb-1",
                  achievement.unlocked ? "text-yellow-400" : "text-gray-400"
                )}>
                  {achievement.name}
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-3">
                  {achievement.description || 'Keep progressing to unlock this achievement'}
                </p>

                {/* Progress Bar (for in-progress achievements) */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Category Badge */}
                {achievement.category && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    {CATEGORY_ICONS[achievement.category] || <Trophy className="h-3 w-3" />}
                    <span className="capitalize">{achievement.category}</span>
                  </div>
                )}

                {/* Unlocked Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-3 text-xs text-gray-500">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * FlowStatisticsDashboard - Main dashboard combining all statistics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react';
import { WeeklyXPChart } from './WeeklyXPChart';
import { WakeSleepStats } from './WakeSleepStats';
import { CalorieTracker } from './CalorieTracker';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface FlowStatisticsDashboardProps {
  selectedDate: Date;
}

export const FlowStatisticsDashboard: React.FC<FlowStatisticsDashboardProps> = ({
  selectedDate,
}) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const today = new Date();

  // Calculate weekly stats
  const weeklyStats = React.useMemo(() => {
    let totalXP = 0;
    let bestDay = { day: '-', xp: 0 };
    let daysTracked = 0;

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const stats = GamificationService.getDailyXPBreakdown(date);
      const xp = stats?.totalXP || 0;
      totalXP += xp;
      if (xp > 0) daysTracked++;
      if (xp > bestDay.xp) {
        bestDay = { day: format(date, 'EEE'), xp };
      }
    }

    const avgXP = daysTracked > 0 ? Math.round(totalXP / daysTracked) : 0;
    const levelInfo = GamificationService.getLevelInfo();

    return {
      totalXP,
      avgXP,
      bestDay,
      daysTracked,
      level: levelInfo.level,
      currentLevelXP: levelInfo.currentXP,
      nextLevelXP: levelInfo.nextLevelXP,
      progress: levelInfo.progress,
    };
  }, [weekStart]);

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-orange-900/20 border-orange-700/40 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Award className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-orange-400/70 uppercase tracking-wide">Level</p>
                  <p className="text-2xl font-bold text-orange-300">{weeklyStats.level}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-orange-900/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${weeklyStats.progress}%` }}
                  />
                </div>
                <p className="text-xs text-orange-400/60 mt-1">
                  {weeklyStats.currentLevelXP} / {weeklyStats.nextLevelXP} XP
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-orange-900/20 border-orange-700/40 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-orange-400/70 uppercase tracking-wide">Weekly XP</p>
                  <p className="text-2xl font-bold text-orange-300">{weeklyStats.totalXP}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-orange-900/30 rounded-lg p-2">
                  <p className="text-xs text-orange-400/60">Avg/Day</p>
                  <p className="text-lg font-semibold text-orange-300">{weeklyStats.avgXP}</p>
                </div>
                <div className="bg-orange-900/30 rounded-lg p-2">
                  <p className="text-xs text-orange-400/60">Best</p>
                  <p className="text-lg font-semibold text-orange-300">
                    {weeklyStats.bestDay.xp > 0 ? weeklyStats.bestDay.day : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly XP Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WeeklyXPChart selectedDate={selectedDate} />
      </motion.div>

      {/* Wake/Sleep Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <WakeSleepStats selectedDate={selectedDate} />
      </motion.div>

      {/* Calorie Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CalorieTracker selectedDate={selectedDate} />
      </motion.div>

      {/* Daily Streaks Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-orange-900/20 border-orange-700/40">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-300 text-base">
              <Target className="h-5 w-5" />
              This Week at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(weekStart, i);
                const stats = GamificationService.getDailyXPBreakdown(date);
                const hasData = stats && stats.totalXP > 0;
                const isToday = isSameDay(date, today);

                return (
                  <div
                    key={i}
                    className={`text-center p-2 rounded-lg border ${
                      isToday
                        ? 'bg-orange-500/20 border-orange-500/50'
                        : hasData
                        ? 'bg-orange-900/30 border-orange-700/30'
                        : 'bg-orange-900/10 border-orange-700/20'
                    }`}
                  >
                    <p className="text-xs text-orange-400/70">{format(date, 'EEE')}</p>
                    <p className={`text-sm font-bold ${hasData ? 'text-orange-300' : 'text-orange-400/40'}`}>
                      {hasData ? stats.totalXP : '-'}
                    </p>
                    <p className="text-[10px] text-orange-400/50">XP</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

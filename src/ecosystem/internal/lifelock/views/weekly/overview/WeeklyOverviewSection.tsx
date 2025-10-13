/**
 * Weekly Overview Section
 * 
 * Main overview page showing week status, 7-day performance, summary stats, streaks, and red flags
 */

import React from 'react';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle, Trophy, Target, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { WeekGrid } from '../_shared/WeekGrid';
import { WeeklyStatsCard } from '../_shared/WeeklyStatsCard';
import { StreakTracker } from '../_shared/StreakTracker';
import type { WeeklyData } from '../_shared/types';

interface WeeklyOverviewSectionProps {
  weeklyData: WeeklyData;
}

export const WeeklyOverviewSection: React.FC<WeeklyOverviewSectionProps> = ({ weeklyData }) => {
  const { weekStart, weekEnd, dailyData, summary } = weeklyData;

  const streaksArray = [
    { name: 'Morning Routine', count: summary.streaks.morningRoutine, emoji: '🌅' },
    { name: 'Deep Work', count: summary.streaks.deepWork, emoji: '🧠' },
    { name: 'Workouts', count: summary.streaks.workouts, emoji: '💪' },
    { name: 'Checkout', count: summary.streaks.checkout, emoji: '✅' },
  ];

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Week Status Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">
                  Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'd, yyyy')}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Your 30-second health check
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-400">
                  {summary.averageGrade}
                </div>
                <div className="text-sm text-gray-400">
                  {summary.completionPercentage}% Complete
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300 font-medium">Total XP Earned</span>
                <span className="text-lg font-bold text-blue-400">{summary.totalXP} XP</span>
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full"
                  style={{ width: `${Math.min((summary.totalXP / 3500) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7-Day Performance Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                📊 7-Day Performance
              </CardTitle>
            </CardHeader>
            <WeekGrid dailyData={dailyData} />
          </div>
        </section>

        {/* Week Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeeklyStatsCard
            title="Best Day"
            icon={Trophy}
            value={summary.bestDay.grade}
            subtitle={`${format(summary.bestDay.date, 'EEEE')} - ${summary.bestDay.xp} XP`}
          />
          <WeeklyStatsCard
            title="Average Completion"
            icon={Target}
            value={`${summary.completionPercentage}%`}
            subtitle="Daily average"
            trend={{ direction: 'up', value: '+8%' }}
          />
          <WeeklyStatsCard
            title="Total XP"
            icon={Zap}
            value={summary.totalXP}
            subtitle="This week"
            trend={{ direction: 'up', value: '+12%' }}
          />
        </div>

        {/* Active Streaks */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-orange-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                🔥 Active Streaks
              </CardTitle>
            </CardHeader>
            <StreakTracker streaks={streaksArray} />
          </div>
        </section>

        {/* Red Flags & Problems */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ⚠️ Red Flags & Problems
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-300 mb-1">
                        {format(summary.worstDay.date, 'EEEE')} was rough
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        {summary.worstDay.issues.map((issue, idx) => (
                          <div key={idx}>• {issue}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {summary.completionPercentage < 90 && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-yellow-300 mb-1">
                          Below 90% completion target
                        </div>
                        <div className="text-sm text-gray-300">
                          You're at {summary.completionPercentage}% - push harder next week!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};

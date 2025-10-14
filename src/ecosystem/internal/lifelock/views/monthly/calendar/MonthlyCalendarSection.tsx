/**
 * Monthly Calendar Section
 * 
 * Calendar overview with 31-day grid, weekly bars, month summary
 */

import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { CalendarGrid } from '../_shared/CalendarGrid';
import { MonthlyStatsCard } from '../_shared/MonthlyStatsCard';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { MonthlyData } from '../_shared/types';

interface MonthlyCalendarSectionProps {
  monthlyData: MonthlyData;
}

export const MonthlyCalendarSection: React.FC<MonthlyCalendarSectionProps> = ({ monthlyData }) => {
  const { days, weeklySummaries, monthSummary } = monthlyData;

  const completionRate = Math.round((monthSummary.daysCompleted80Plus / monthSummary.totalDays) * 100);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-purple-400 flex items-center text-2xl">
                <CalendarIcon className="h-6 w-6 mr-2" />
                📅 {format(monthlyData.month, 'MMMM yyyy')}
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Monthly performance at a glance
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Month Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MonthlyStatsCard
            title="Completion Rate"
            icon={Target}
            value={`${completionRate}%`}
            subtitle={`${monthSummary.daysCompleted80Plus}/${monthSummary.totalDays} days`}
          />
          <MonthlyStatsCard
            title="Average Grade"
            icon={Trophy}
            value={monthSummary.averageGrade}
            subtitle="Monthly average"
          />
          <MonthlyStatsCard
            title="Total XP"
            icon={Zap}
            value={monthSummary.totalXP.toLocaleString()}
            subtitle={`of ${monthSummary.maxPossibleXP.toLocaleString()}`}
          />
          <MonthlyStatsCard
            title="Perfect Days"
            icon={TrendingUp}
            value={monthSummary.perfectDays}
            subtitle="95%+ completion"
          />
        </div>

        {/* Calendar Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                📆 Daily Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CalendarGrid
                days={days}
                onDayClick={(date) => {
                  console.log('Navigate to day:', format(date, 'yyyy-MM-dd'));
                }}
              />
            </CardContent>
          </div>
        </section>

        {/* Weekly Performance Bars */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-indigo-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                📊 Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {weeklySummaries.map((week, idx) => (
                  <motion.div
                    key={week.weekStart.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'px-3 py-1 rounded-full text-sm font-bold',
                          week.averageCompletion >= 90 ? 'bg-green-500/20 text-green-400' :
                          week.averageCompletion >= 80 ? 'bg-blue-500/20 text-blue-400' :
                          week.averageCompletion >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          Week {idx + 1}
                        </div>
                        <span className="text-sm text-gray-300">
                          {format(week.weekStart, 'MMM d')} - {format(week.weekEnd, 'MMM d')}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-300">
                        {week.grade} ({week.averageCompletion}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3">
                      <div
                        className={cn(
                          'h-3 rounded-full transition-all duration-500',
                          week.averageCompletion >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                          week.averageCompletion >= 80 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                          week.averageCompletion >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-rose-500'
                        )}
                        style={{ width: `${week.averageCompletion}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {week.totalXP.toLocaleString()} XP earned
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Legend */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-slate-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-500/20">
            <div className="text-sm text-gray-400 mb-2 font-semibold">Performance Legend</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600" />
                <span className="text-gray-300">95%+ (A+/A)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-green-600 to-green-700" />
                <span className="text-gray-300">85-94% (A-/B+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-600" />
                <span className="text-gray-300">75-84% (B/B-)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500 to-orange-500" />
                <span className="text-gray-300">65-74% (C+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-rose-600" />
                <span className="text-gray-300">&lt;65% (C/D)</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

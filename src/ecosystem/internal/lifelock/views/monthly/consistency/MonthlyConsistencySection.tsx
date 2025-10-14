/**
 * Monthly Consistency Section
 * 
 * Habit tracking grid, streaks, consistency scores
 */

import React from 'react';
import { Flame, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { HabitConsistency, MonthlyData } from '../_shared/types';

interface MonthlyConsistencySectionProps {
  habits: HabitConsistency[];
  monthlyData: MonthlyData;
}

export const MonthlyConsistencySection: React.FC<MonthlyConsistencySectionProps> = ({
  habits,
  monthlyData
}) => {
  const { days } = monthlyData;

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-orange-400 flex items-center text-2xl">
                <Flame className="h-6 w-6 mr-2" />
                🔥 Consistency & Streaks
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Am I building good habits?
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Consistency Scores */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                📊 Consistency Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {habits.map((habit, idx) => (
                  <motion.div
                    key={habit.habit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{habit.emoji}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-200">{habit.habit}</div>
                          <div className="text-xs text-gray-400">
                            {habit.daysCompleted}/{habit.totalDays} days
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'text-2xl font-bold',
                          habit.percentage >= 90 ? 'text-green-400' :
                          habit.percentage >= 75 ? 'text-blue-400' :
                          habit.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {habit.percentage}%
                        </div>
                        {habit.streak > 0 && (
                          <div className="text-xs text-orange-400 flex items-center justify-end">
                            <Flame className="h-3 w-3 mr-1" />
                            {habit.streak} day streak
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-500',
                          habit.percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                          habit.percentage >= 75 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                          habit.percentage >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-rose-500'
                        )}
                        style={{ width: `${habit.percentage}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Monthly Habit Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                📅 Monthly Habit Grid
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-300 pb-3 sticky left-0 bg-gray-900/60">
                        Habit
                      </th>
                      {days.map((day, idx) => (
                        <th key={idx} className="text-center text-xs font-semibold text-gray-400 pb-3 px-1">
                          {day.date.getDate()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit, habitIdx) => (
                      <motion.tr
                        key={habit.habit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: habitIdx * 0.05 }}
                        className="border-t border-gray-700/50"
                      >
                        <td className="py-2 text-xs text-gray-300 font-medium sticky left-0 bg-gray-900/60">
                          <span className="mr-1">{habit.emoji}</span>
                          {habit.habit}
                        </td>
                        {days.map((day, dayIdx) => {
                          // Check if habit was completed on this day
                          const habitKey = habit.habit.toLowerCase().replace(/\s+/g, '');
                          const completed = day.habits[habitKey as keyof typeof day.habits] || false;
                          
                          return (
                            <td key={dayIdx} className="py-2 text-center px-1">
                              <div className={cn(
                                'w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center mx-auto text-xs',
                                completed 
                                  ? 'bg-green-500/30 border border-green-500' 
                                  : 'bg-gray-700/30 border border-gray-600/50'
                              )}>
                                {completed ? '✓' : '−'}
                              </div>
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </div>
        </section>

        {/* Habit Analysis */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                💡 Habit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="font-semibold text-green-300 mb-2">💪 Strengths</div>
                  <div className="space-y-2 text-sm text-gray-200">
                    {habits
                      .filter(h => h.percentage >= 80)
                      .map(h => (
                        <div key={h.habit}>
                          • {h.habit} - {h.percentage}% consistency
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="font-semibold text-yellow-300 mb-2">⚠️ Needs Work</div>
                  <div className="space-y-2 text-sm text-gray-200">
                    {habits
                      .filter(h => h.percentage < 80)
                      .map(h => (
                        <div key={h.habit}>
                          • {h.habit} - {h.percentage}% consistency
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};

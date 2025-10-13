/**
 * Weekly Productivity Section
 * 
 * Work output analysis - deep work, light work, priorities, week-over-week comparison
 */

import React from 'react';
import { format } from 'date-fns';
import { Brain, CheckSquare, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { WeeklyStatsCard } from '../_shared/WeeklyStatsCard';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { ProductivityData } from '../_shared/types';

interface WeeklyProductivitySectionProps {
  productivityData: ProductivityData;
}

export const WeeklyProductivitySection: React.FC<WeeklyProductivitySectionProps> = ({ productivityData }) => {
  const { deepWork, lightWork, priorities, weekOverWeek } = productivityData;

  const priorityData = [
    { level: 'P1', ...priorities.p1, color: 'from-red-500 to-rose-600' },
    { level: 'P2', ...priorities.p2, color: 'from-orange-500 to-amber-600' },
    { level: 'P3', ...priorities.p3, color: 'from-yellow-500 to-yellow-600' },
    { level: 'P4', ...priorities.p4, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-purple-400 flex items-center text-2xl">
                <BarChart3 className="h-6 w-6 mr-2" />
                💼 Productivity Analysis
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                What did I accomplish this week?
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeeklyStatsCard
            title="Deep Work"
            icon={Brain}
            value={`${deepWork.totalHours}h`}
            subtitle={`${deepWork.sessions} sessions`}
            trend={{ 
              direction: weekOverWeek.deepWorkChange > 0 ? 'up' : 'down', 
              value: `${Math.abs(weekOverWeek.deepWorkChange)}%` 
            }}
          />
          <WeeklyStatsCard
            title="Light Work"
            icon={CheckSquare}
            value={`${lightWork.completedTasks}/${lightWork.totalTasks}`}
            subtitle="Tasks completed"
            trend={{ 
              direction: weekOverWeek.lightWorkChange > 0 ? 'up' : 'down', 
              value: `${Math.abs(weekOverWeek.lightWorkChange)}%` 
            }}
          />
          <WeeklyStatsCard
            title="Completion Rate"
            icon={Target}
            value={`${Math.round((lightWork.completedTasks / lightWork.totalTasks) * 100)}%`}
            subtitle="Overall completion"
            trend={{ 
              direction: weekOverWeek.completionChange > 0 ? 'up' : 'down', 
              value: `${Math.abs(weekOverWeek.completionChange)}%` 
            }}
          />
        </div>

        {/* Deep Work Breakdown */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                🧠 Deep Work Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {deepWork.dailyBreakdown.map((day, idx) => (
                  <motion.div
                    key={day.date.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-sm font-medium text-gray-300 w-20">
                        {format(day.date, 'EEE, MMM d')}
                      </div>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.hours / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-400 ml-4 w-16 text-right">
                      {day.hours}h
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Light Work Completion */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                ✅ Light Work Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {lightWork.dailyBreakdown.map((day, idx) => (
                  <motion.div
                    key={day.date.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-sm font-medium text-gray-300 w-20">
                        {format(day.date, 'EEE, MMM d')}
                      </div>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.tasks / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-400 ml-4 w-16 text-right">
                      {day.tasks} tasks
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Priority Breakdown */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                🎯 Priority Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {priorityData.map((priority, idx) => {
                  const completionRate = Math.round((priority.completed / priority.total) * 100);
                  return (
                    <motion.div
                      key={priority.level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            'px-3 py-1 rounded-full text-sm font-bold',
                            'bg-gradient-to-r text-white',
                            priority.color
                          )}>
                            {priority.level}
                          </div>
                          <span className="text-sm text-gray-300">
                            {priority.completed}/{priority.total} completed
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className={cn('h-2 rounded-full bg-gradient-to-r', priority.color)}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Week-over-Week Comparison */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-orange-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                📈 Week-over-Week Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Deep Work</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    weekOverWeek.deepWorkChange > 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {weekOverWeek.deepWorkChange > 0 ? '+' : ''}{weekOverWeek.deepWorkChange}%
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Light Work</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    weekOverWeek.lightWorkChange > 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {weekOverWeek.lightWorkChange > 0 ? '+' : ''}{weekOverWeek.lightWorkChange}%
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Completion</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    weekOverWeek.completionChange > 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {weekOverWeek.completionChange > 0 ? '+' : ''}{weekOverWeek.completionChange}%
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

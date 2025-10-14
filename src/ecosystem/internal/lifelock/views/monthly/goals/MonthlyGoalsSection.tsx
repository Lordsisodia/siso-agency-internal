/**
 * Monthly Goals Section
 * 
 * Monthly goals, yearly progress, ongoing projects
 */

import React from 'react';
import { Target, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { MonthlyStatsCard } from '../_shared/MonthlyStatsCard';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import type { MonthlyGoal, YearlyProgress, Project } from '../_shared/types';

interface MonthlyGoalsSectionProps {
  monthlyGoals: MonthlyGoal[];
  yearlyProgress: YearlyProgress[];
  projects: Project[];
}

export const MonthlyGoalsSection: React.FC<MonthlyGoalsSectionProps> = ({
  monthlyGoals,
  yearlyProgress,
  projects
}) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-purple-400 flex items-center text-2xl">
                <Target className="h-6 w-6 mr-2" />
                🎯 Goals & Progress
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Track your monthly and yearly objectives
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Monthly Goals */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                📅 Monthly Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {monthlyGoals.map((goal, idx) => {
                  const progress = Math.round((goal.current / goal.target) * 100);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-200">{goal.title}</div>
                          <div className="text-xs text-gray-400 capitalize">{goal.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-purple-400">
                            {goal.current}/{goal.target} {goal.unit}
                          </div>
                          <div className="text-xs text-gray-400">{progress}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all duration-500',
                            progress >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            progress >= 70 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                            progress >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-gradient-to-r from-red-400 to-rose-500'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Yearly Progress */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                📈 Yearly Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {yearlyProgress.map((item, idx) => {
                  const progress = Math.round((item.totalToDate / item.yearlyTarget) * 100);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-800/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-200">{item.title}</div>
                        <div className="text-sm font-bold text-green-400">{progress}%</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">This Month</div>
                          <div className="font-bold text-white">
                            {item.monthlyContribution.toLocaleString()} {item.unit}
                          </div>
                        </div>
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">Total</div>
                          <div className="font-bold text-white">
                            {item.totalToDate.toLocaleString()} {item.unit}
                          </div>
                        </div>
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">Target</div>
                          <div className="font-bold text-white">
                            {item.yearlyTarget.toLocaleString()} {item.unit}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Ongoing Projects */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-orange-400 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                💼 Ongoing Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'border rounded-lg p-4',
                      project.status === 'on-track' && 'bg-green-900/20 border-green-500/30',
                      project.status === 'at-risk' && 'bg-yellow-900/20 border-yellow-500/30',
                      project.status === 'delayed' && 'bg-red-900/20 border-red-500/30',
                      project.status === 'completed' && 'bg-blue-900/20 border-blue-500/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-200">{project.title}</div>
                      <div className={cn(
                        'px-2 py-1 rounded-full text-xs font-bold uppercase',
                        project.status === 'on-track' && 'bg-green-500/20 text-green-400',
                        project.status === 'at-risk' && 'bg-yellow-500/20 text-yellow-400',
                        project.status === 'delayed' && 'bg-red-500/20 text-red-400',
                        project.status === 'completed' && 'bg-blue-500/20 text-blue-400'
                      )}>
                        {project.status.replace('-', ' ')}
                      </div>
                    </div>
                    {project.deadline && (
                      <div className="text-xs text-gray-400 mb-3">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Due: {format(project.deadline, 'MMM d, yyyy')}
                      </div>
                    )}
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          project.status === 'on-track' && 'bg-gradient-to-r from-green-400 to-emerald-500',
                          project.status === 'at-risk' && 'bg-gradient-to-r from-yellow-400 to-orange-500',
                          project.status === 'delayed' && 'bg-gradient-to-r from-red-400 to-rose-500',
                          project.status === 'completed' && 'bg-gradient-to-r from-blue-400 to-indigo-500'
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{project.progress}% complete</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};

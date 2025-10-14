/**
 * Yearly Goals Section
 * 
 * Annual goals progress, milestones timeline, quarterly targets
 */

import React from 'react';
import { format } from 'date-fns';
import { Target, Trophy, Calendar, CheckCircle, Flag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { AnnualGoal, Milestone } from '../_shared/types';

interface YearlyGoalsSectionProps {
  annualGoals: AnnualGoal[];
  milestones: Milestone[];
}

export const YearlyGoalsSection: React.FC<YearlyGoalsSectionProps> = ({
  annualGoals,
  milestones
}) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-purple-400 flex items-center text-2xl">
                <Target className="h-6 w-6 mr-2" />
                🎯 Goals & Milestones
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Track your annual objectives and achievements
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Annual Goals Progress */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                🎯 2025 Annual Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {annualGoals.map((goal, idx) => {
                  const progress = Math.round((goal.current / goal.target) * 100);
                  const isCompleted = goal.status === 'completed';
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        'rounded-lg p-4 border',
                        isCompleted ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-800/30 border-gray-600/30'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            'px-2 py-1 rounded text-xs font-bold uppercase',
                            goal.category === 'health' && 'bg-pink-500/20 text-pink-400',
                            goal.category === 'career' && 'bg-blue-500/20 text-blue-400',
                            goal.category === 'financial' && 'bg-green-500/20 text-green-400',
                            goal.category === 'personal' && 'bg-purple-500/20 text-purple-400'
                          )}>
                            {goal.category}
                          </div>
                          <span className="font-semibold text-gray-200">{goal.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-orange-400">
                            {goal.current.toLocaleString()}/{goal.target.toLocaleString()} {goal.unit}
                          </div>
                          <div className="text-xs text-gray-400">{progress}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <div
                          className={cn(
                            'h-3 rounded-full transition-all duration-500',
                            isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            progress >= 75 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                            progress >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-gradient-to-r from-red-400 to-rose-500'
                          )}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {isCompleted && goal.completedDate && (
                        <div className="mt-2 flex items-center text-xs text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed on {format(goal.completedDate, 'MMM d')}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Milestones Timeline */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                🏆 Milestones Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {milestones.map((milestone, idx) => (
                  <motion.div
                    key={milestone.date.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className="text-2xl">{milestone.icon}</div>
                      {idx < milestones.length - 1 && (
                        <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent mt-2" />
                      )}
                    </div>

                    {/* Milestone content */}
                    <div className="flex-1 bg-gray-800/30 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-purple-300">{milestone.title}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {format(milestone.date, 'MMMM d, yyyy')}
                          </div>
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded text-xs font-bold uppercase',
                          milestone.type === 'achievement' && 'bg-green-500/20 text-green-400',
                          milestone.type === 'milestone' && 'bg-blue-500/20 text-blue-400',
                          milestone.type === 'record' && 'bg-orange-500/20 text-orange-400'
                        )}>
                          {milestone.type}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">{milestone.description}</div>
                    </div>
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

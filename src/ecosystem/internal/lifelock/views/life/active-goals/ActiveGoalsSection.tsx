/**
 * Active Goals Section
 * 
 * Track major life goals across categories
 */

import React from 'react';
import { format } from 'date-fns';
import { Target, Flag, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { LifeGoal } from '../_shared/types';

interface ActiveGoalsSectionProps {
  goals: LifeGoal[];
}

export const ActiveGoalsSection: React.FC<ActiveGoalsSectionProps> = ({ goals }) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-blue-400 flex items-center text-2xl">
                <Target className="h-6 w-6 mr-2" />
                🎯 Active Life Goals
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Your major life objectives in progress
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Major Life Goals */}
        {goals.map((goal, idx) => {
          const progress = Math.round((goal.currentProgress / goal.targetValue) * 100);
          
          return (
            <motion.section
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className={cn(
                'absolute inset-0 rounded-2xl blur-sm',
                goal.category === 'health' && 'bg-gradient-to-r from-pink-500/5 to-rose-500/5',
                goal.category === 'career' && 'bg-gradient-to-r from-blue-500/5 to-indigo-500/5',
                goal.category === 'financial' && 'bg-gradient-to-r from-green-500/5 to-emerald-500/5',
                goal.category === 'relationships' && 'bg-gradient-to-r from-purple-500/5 to-violet-500/5',
                goal.category === 'personal' && 'bg-gradient-to-r from-orange-500/5 to-amber-500/5'
              )} />
              <div className={cn(
                'relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border shadow-lg',
                goal.category === 'health' && 'border-pink-500/20 shadow-pink-500/10',
                goal.category === 'career' && 'border-blue-500/20 shadow-blue-500/10',
                goal.category === 'financial' && 'border-green-500/20 shadow-green-500/10',
                goal.category === 'relationships' && 'border-purple-500/20 shadow-purple-500/10',
                goal.category === 'personal' && 'border-orange-500/20 shadow-orange-500/10'
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase',
                        goal.category === 'health' && 'bg-pink-500/20 text-pink-400',
                        goal.category === 'career' && 'bg-blue-500/20 text-blue-400',
                        goal.category === 'financial' && 'bg-green-500/20 text-green-400',
                        goal.category === 'relationships' && 'bg-purple-500/20 text-purple-400',
                        goal.category === 'personal' && 'bg-orange-500/20 text-orange-400'
                      )}>
                        {goal.category}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{goal.title}</h3>
                    <div className="text-sm text-gray-400">{goal.target}</div>
                  </div>
                  {goal.deadline && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Deadline</div>
                      <div className="text-sm font-semibold text-white">
                        {format(goal.deadline, 'MMM yyyy')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-bold text-white">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className={cn(
                        'h-3 rounded-full transition-all duration-500',
                        goal.category === 'health' && 'bg-gradient-to-r from-pink-400 to-rose-500',
                        goal.category === 'career' && 'bg-gradient-to-r from-blue-400 to-indigo-500',
                        goal.category === 'financial' && 'bg-gradient-to-r from-green-400 to-emerald-500',
                        goal.category === 'relationships' && 'bg-gradient-to-r from-purple-400 to-violet-500',
                        goal.category === 'personal' && 'bg-gradient-to-r from-orange-400 to-amber-500'
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-3">Milestones</div>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, mIdx) => (
                        <div key={mIdx} className="flex items-center space-x-3">
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-500 flex-shrink-0" />
                          )}
                          <span className={cn(
                            'text-sm flex-1',
                            milestone.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                          )}>
                            {milestone.title}
                          </span>
                          {milestone.completedDate && (
                            <span className="text-xs text-gray-500">
                              {format(milestone.completedDate, 'MMM yyyy')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          );
        })}

      </div>
    </div>
  );
};

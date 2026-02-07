/**
 * LifeActiveGoalsSection - Active Goals Page
 *
 * Displays major life goals across categories with progress tracking
 */

import React from 'react';
import { Target, TrendingUp, CheckCircle2, Circle, Calendar } from 'lucide-react';
import type { LifeGoal } from '../_shared/types';

interface LifeActiveGoalsSectionProps {
  goals: LifeGoal[];
}

const categoryColors = {
  health: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
  career: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  financial: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  relationships: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', bar: 'bg-pink-500' },
  personal: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
};

export const LifeActiveGoalsSection: React.FC<LifeActiveGoalsSectionProps> = ({ goals }) => {
  const completedGoals = goals.filter(g => g.currentProgress >= g.targetValue).length;
  const totalProgress = goals.reduce((sum, g) => sum + (g.currentProgress / g.targetValue) * 100, 0) / goals.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Target className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Active Goals</h1>
        <p className="text-gray-400">Major life goals and milestones</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Goals"
          value={goals.length.toString()}
          subtitle="Active pursuits"
        />
        <StatCard
          title="Completed"
          value={completedGoals.toString()}
          subtitle="Goals achieved"
        />
        <StatCard
          title="Progress"
          value={`${Math.round(totalProgress)}%`}
          subtitle="Overall completion"
        />
        <StatCard
          title="Milestones"
          value={goals.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0).toString()}
          subtitle="Completed"
        />
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const colors = categoryColors[goal.category];
          const progressPercent = Math.min(100, (goal.currentProgress / goal.targetValue) * 100);
          const completedMilestones = goal.milestones.filter(m => m.completed).length;

          return (
            <section key={goal.id} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
              <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Goal Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                      </span>
                      {goal.deadline && (
                        <span className="text-xs text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{goal.target}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">
                          {goal.currentProgress.toLocaleString()} / {goal.targetValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {Math.round(progressPercent)}% complete
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="md:w-64 bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">Milestones</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {completedMilestones}/{goal.milestones.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {milestone.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${milestone.completed ? 'text-gray-300 line-through' : 'text-gray-400'}`}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
  <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
    <div className="text-xs text-gray-400 mb-1">{title}</div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);

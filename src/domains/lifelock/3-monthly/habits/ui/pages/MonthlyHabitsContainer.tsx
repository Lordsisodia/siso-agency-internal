/**
 * Monthly Habits Container
 *
 * Habits pill with sub-tabs: consistency, habit-grid, analysis
 * Uses purple theme
 */

import React from 'react';
import { Target, CheckCircle, TrendingUp } from 'lucide-react';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { MonthlyConsistencySection } from '../../../consistency/MonthlyConsistencySection';
import type { HabitConsistency, MonthlyData } from '../../../_shared/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Habit Grid sub-tab content
interface HabitGridViewProps {
  habits: HabitConsistency[];
  days: MonthlyData['days'];
}

const HabitGridView: React.FC<HabitGridViewProps> = ({ habits, days }) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-400">📅 Monthly Habit Grid</h2>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Track your daily habit completion
            </p>
          </div>
        </section>

        {/* Habit Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
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
                        const habitKey = habit.habit.toLowerCase().replace(/\s+/g, '') as keyof typeof day.habits;
                        const completed = day.habits[habitKey] || false;

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
          </div>
        </section>
      </div>
    </div>
  );
};

// Analysis sub-tab content
interface AnalysisViewProps {
  habits: HabitConsistency[];
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ habits }) => {
  const strengths = habits.filter(h => h.percentage >= 80);
  const needsWork = habits.filter(h => h.percentage < 80);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-400">💡 Habit Analysis</h2>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Insights into your habit performance
            </p>
          </div>
        </section>

        {/* Analysis Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <span>💪</span>
                  <span>Strengths</span>
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  {strengths.length > 0 ? (
                    strengths.map(h => (
                      <div key={h.habit} className="flex items-center justify-between">
                        <span>{h.habit}</span>
                        <span className="text-green-400 font-semibold">{h.percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">No habits at 80%+ yet. Keep building!</div>
                  )}
                </div>
              </div>

              {/* Needs Work */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Needs Work</span>
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  {needsWork.length > 0 ? (
                    needsWork.map(h => (
                      <div key={h.habit} className="flex items-center justify-between">
                        <span>{h.habit}</span>
                        <span className="text-yellow-400 font-semibold">{h.percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">All habits are above 80%! 🎉</div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{strengths.length}</div>
                <div className="text-xs text-gray-400">Strong Habits</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(habits.reduce((acc, h) => acc + h.percentage, 0) / habits.length)}%
                </div>
                <div className="text-xs text-gray-400">Avg Consistency</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.max(...habits.map(h => h.streak), 0)}
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface MonthlyHabitsContainerProps {
  habits: HabitConsistency[];
  monthlyData: MonthlyData;
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
}

const SUB_TABS: WeeklySubTab[] = [
  { id: 'consistency', label: 'Consistency', icon: Target },
  { id: 'habit-grid', label: 'Habit Grid', icon: CheckCircle },
  { id: 'analysis', label: 'Analysis', icon: TrendingUp },
];

export const MonthlyHabitsContainer: React.FC<MonthlyHabitsContainerProps> = ({
  habits,
  monthlyData,
  activeSubTab = 'consistency',
  onSubTabChange,
}) => {
  const handleTabChange = (tabId: string) => {
    onSubTabChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Sub-tab Navigation */}
      <WeeklySectionSubNav
        tabs={SUB_TABS}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
        theme="health"
      />

      {/* Content Area */}
      <div className="w-full">
        {activeSubTab === 'consistency' && (
          <MonthlyConsistencySection habits={habits} monthlyData={monthlyData} />
        )}
        {activeSubTab === 'habit-grid' && (
          <HabitGridView habits={habits} days={monthlyData.days} />
        )}
        {activeSubTab === 'analysis' && (
          <AnalysisView habits={habits} />
        )}
      </div>
    </div>
  );
};

export default MonthlyHabitsContainer;

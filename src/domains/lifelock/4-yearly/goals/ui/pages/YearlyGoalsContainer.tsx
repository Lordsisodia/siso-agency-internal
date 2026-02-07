/**
 * Yearly Goals Container
 *
 * Container component with sub-tab navigation for yearly goals content.
 * Sub-tabs: goals, milestones, growth
 */

import React from 'react';
import { Target, Flag, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { YearlyGoalsSection } from '../../YearlyGoalsSection';
import { YearlyGrowthSection } from '../../growth/YearlyGrowthSection';
import type { AnnualGoal, Milestone, YearOverYearMetric } from '../../_shared/types';

export type YearlyGoalsSubTab = 'goals' | 'milestones' | 'growth';

interface YearlyGoalsContainerProps {
  activeSubTab: YearlyGoalsSubTab;
  onSubTabChange: (tab: YearlyGoalsSubTab) => void;
  annualGoals: AnnualGoal[];
  milestones: Milestone[];
  yearOverYear: YearOverYearMetric[];
  currentYear: number;
}

const GOALS_TABS: WeeklySubTab[] = [
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
];

export const YearlyGoalsContainer: React.FC<YearlyGoalsContainerProps> = ({
  activeSubTab,
  onSubTabChange,
  annualGoals,
  milestones,
  yearOverYear,
  currentYear,
}) => {
  const handleTabChange = (tabId: string) => {
    onSubTabChange(tabId as YearlyGoalsSubTab);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Sub-tab Navigation */}
      <WeeklySectionSubNav
        tabs={GOALS_TABS}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
        theme="work"
      />

      {/* Content Area */}
      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeSubTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YearlyGoalsSection annualGoals={annualGoals} milestones={milestones} />
            </motion.div>
          )}

          {activeSubTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6"
            >
              {/* Milestones Header */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center space-x-3">
                    <Flag className="h-6 w-6 text-orange-400" />
                    <div>
                      <h2 className="text-xl font-bold text-orange-400">🏆 Milestones Timeline</h2>
                      <p className="text-sm text-gray-400">
                        Key achievements and milestones for {currentYear}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Milestones Timeline */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-purple-400 flex items-center">
                      <Flag className="h-5 w-5 mr-2" />
                      📅 Achievement Timeline
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
                              <div className="w-0.5 h-full bg-gradient-to-b from-orange-500/50 to-transparent mt-2" />
                            )}
                          </div>

                          {/* Milestone content */}
                          <div className="flex-1 bg-gray-800/30 border border-orange-500/30 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-orange-300">{milestone.title}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {format(milestone.date, 'MMMM d, yyyy')}
                                </div>
                              </div>
                              <div className={`
                                px-2 py-1 rounded text-xs font-bold uppercase
                                ${milestone.type === 'achievement' && 'bg-green-500/20 text-green-400'}
                                ${milestone.type === 'milestone' && 'bg-blue-500/20 text-blue-400'}
                                ${milestone.type === 'record' && 'bg-orange-500/20 text-orange-400'}
                              `}>
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
            </motion.div>
          )}

          {activeSubTab === 'growth' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YearlyGrowthSection yearOverYear={yearOverYear} currentYear={currentYear} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YearlyGoalsContainer;

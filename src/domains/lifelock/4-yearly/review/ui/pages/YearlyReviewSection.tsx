/**
 * Yearly Review Section
 *
 * Container component with sub-tab navigation for yearly review content.
 * Sub-tabs: overview, wins, vision
 */

import React from 'react';
import { LayoutDashboard, Trophy, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { YearlyOverviewSection } from '../../overview/YearlyOverviewSection';
import { YearlyPlanningSection } from '../../planning/YearlyPlanningSection';
import type { YearlyData, YearlyReflection } from '../../_shared/types';

export type YearlyReviewSubTab = 'overview' | 'wins' | 'vision';

interface YearlyReviewSectionProps {
  activeSubTab: YearlyReviewSubTab;
  onSubTabChange: (tab: YearlyReviewSubTab) => void;
  yearlyData: YearlyData;
  reflectionData: YearlyReflection;
  currentYear: number;
}

const REVIEW_TABS: WeeklySubTab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'wins', label: 'Wins', icon: Trophy },
  { id: 'vision', label: 'Vision', icon: Rocket },
];

// Extracted wins data for the wins sub-tab
const YEARLY_WINS = [
  { title: '🚀 892 hours deep work (+24% vs 2024)', category: 'Productivity' },
  { title: '📚 38 books read (+58% vs 2024)', category: 'Learning' },
  { title: '💪 156 workouts (+10% vs 2024)', category: 'Health' },
  { title: '💰 Revenue increased 12% year-over-year', category: 'Financial' },
];

export const YearlyReviewSection: React.FC<YearlyReviewSectionProps> = ({
  activeSubTab,
  onSubTabChange,
  yearlyData,
  reflectionData,
  currentYear,
}) => {
  const handleTabChange = (tabId: string) => {
    onSubTabChange(tabId as YearlyReviewSubTab);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Sub-tab Navigation */}
      <WeeklySectionSubNav
        tabs={REVIEW_TABS}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
        theme="review"
      />

      {/* Content Area */}
      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeSubTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YearlyOverviewSection yearlyData={yearlyData} />
            </motion.div>
          )}

          {activeSubTab === 'wins' && (
            <motion.div
              key="wins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6"
            >
              {/* Wins Header */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-6 w-6 text-orange-400" />
                    <div>
                      <h2 className="text-xl font-bold text-orange-400">🏆 Yearly Wins</h2>
                      <p className="text-sm text-gray-400">
                        Biggest achievements of {currentYear}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Wins List */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                  <div className="space-y-4">
                    {YEARLY_WINS.map((win, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <Trophy className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold text-orange-300 mb-1">{win.title}</div>
                            <div className="text-xs text-gray-400">{win.category}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeSubTab === 'vision' && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YearlyPlanningSection
                reflectionData={reflectionData}
                currentYear={currentYear}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YearlyReviewSection;

/**
 * Yearly Balance Container
 *
 * Container component with sub-tab navigation for yearly balance content.
 * Sub-tabs: scorecard, trends, insights
 */

import React from 'react';
import { PieChart, TrendingUp, Lightbulb, Heart, Briefcase, DollarSign, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { YearlyBalanceSection } from '../../YearlyBalanceSection';
import type { LifeBalanceData } from '../../_shared/types';

export type YearlyBalanceSubTab = 'scorecard' | 'trends' | 'insights';

interface YearlyBalanceContainerProps {
  activeSubTab: YearlyBalanceSubTab;
  onSubTabChange: (tab: YearlyBalanceSubTab) => void;
  balanceData: LifeBalanceData;
  currentYear: number;
}

const BALANCE_TABS: WeeklySubTab[] = [
  { id: 'scorecard', label: 'Scorecard', icon: PieChart },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

const LIFE_AREAS = [
  { key: 'health', label: 'Health & Fitness', icon: Heart, color: 'from-pink-500 to-rose-600', emoji: '❤️' },
  { key: 'career', label: 'Career & Business', icon: Briefcase, color: 'from-blue-500 to-indigo-600', emoji: '💼' },
  { key: 'financial', label: 'Financial', icon: DollarSign, color: 'from-green-500 to-emerald-600', emoji: '💰' },
  { key: 'relationships', label: 'Relationships', icon: Users, color: 'from-purple-500 to-violet-600', emoji: '👥' },
  { key: 'personal', label: 'Personal Growth', icon: User, color: 'from-orange-500 to-amber-600', emoji: '🌱' },
];

// Mock quarterly trends data
const QUARTERLY_TRENDS = [
  { quarter: 'Q1', health: 75, career: 82, financial: 68, relationships: 70, personal: 78 },
  { quarter: 'Q2', health: 78, career: 85, financial: 72, relationships: 73, personal: 80 },
  { quarter: 'Q3', health: 82, career: 88, financial: 75, relationships: 76, personal: 83 },
  { quarter: 'Q4', health: 85, career: 90, financial: 78, relationships: 80, personal: 85 },
];

export const YearlyBalanceContainer: React.FC<YearlyBalanceContainerProps> = ({
  activeSubTab,
  onSubTabChange,
  balanceData,
  currentYear,
}) => {
  const handleTabChange = (tabId: string) => {
    onSubTabChange(tabId as YearlyBalanceSubTab);
  };

  // Calculate insights based on balance data
  const strengths = LIFE_AREAS.filter(
    (a) => balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>] >= 80
  );
  const improvements = LIFE_AREAS.filter(
    (a) => balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>] < 80
  );

  return (
    <div className="min-h-screen w-full">
      {/* Sub-tab Navigation */}
      <WeeklySectionSubNav
        tabs={BALANCE_TABS}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
        theme="health"
      />

      {/* Content Area */}
      <div className="px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeSubTab === 'scorecard' && (
            <motion.div
              key="scorecard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YearlyBalanceSection balanceData={balanceData} />
            </motion.div>
          )}

          {activeSubTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6"
            >
              {/* Trends Header */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                    <div>
                      <h2 className="text-xl font-bold text-orange-400">📈 Balance Trends</h2>
                      <p className="text-sm text-gray-400">
                        Quarterly progression across all life areas
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quarterly Trends */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-blue-400 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      📊 Quarterly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-6">
                      {LIFE_AREAS.map((area, idx) => {
                        const Icon = area.icon;
                        return (
                          <motion.div
                            key={area.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{area.emoji}</span>
                              <span className="text-sm font-semibold text-gray-200">{area.label}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {QUARTERLY_TRENDS.map((q, qIdx) => {
                                const score = q[area.key as keyof typeof q] as number;
                                const prevScore = qIdx > 0 ? (QUARTERLY_TRENDS[qIdx - 1][area.key as keyof typeof q] as number) : score;
                                const change = score - prevScore;
                                return (
                                  <div
                                    key={q.quarter}
                                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center"
                                  >
                                    <div className="text-xs text-gray-400 mb-1">{q.quarter}</div>
                                    <div className={`text-lg font-bold ${
                                      score >= 80 ? 'text-green-400' :
                                      score >= 70 ? 'text-blue-400' :
                                      score >= 60 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                      {score}
                                    </div>
                                    {qIdx > 0 && (
                                      <div className={`text-xs ${
                                        change > 0 ? 'text-green-400' :
                                        change < 0 ? 'text-red-400' : 'text-gray-400'
                                      }`}>
                                        {change > 0 ? '+' : ''}{change}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${area.color}`}
                                style={{ width: `${balanceData[area.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>]}%` }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </section>

              {/* Overall Trend Summary */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-green-400 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      📈 Year-over-Year Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {QUARTERLY_TRENDS.map((q) => {
                        const avg = Math.round(
                          (q.health + q.career + q.financial + q.relationships + q.personal) / 5
                        );
                        return (
                          <div key={q.quarter} className="text-center p-4 bg-gray-800/30 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">{q.quarter}</div>
                            <div className={`text-2xl font-bold ${
                              avg >= 80 ? 'text-green-400' :
                              avg >= 70 ? 'text-blue-400' :
                              avg >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {avg}
                            </div>
                            <div className="text-xs text-gray-500">Average</div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </section>
            </motion.div>
          )}

          {activeSubTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6"
            >
              {/* Insights Header */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="h-6 w-6 text-orange-400" />
                    <div>
                      <h2 className="text-xl font-bold text-orange-400">💡 Balance Insights</h2>
                      <p className="text-sm text-gray-400">
                        AI-powered analysis of your life balance data
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Overall Balance Score */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-purple-400 flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      🎯 Overall Balance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-orange-400 mb-2">
                        {balanceData.overall}/100
                      </div>
                      <div className="text-sm text-gray-400">Holistic life balance for {currentYear}</div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-amber-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${balanceData.overall}%` }}
                      />
                    </div>
                  </CardContent>
                </div>
              </section>

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Strengths */}
                <section className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
                  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-green-400 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        💪 Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-3">
                        {strengths.length > 0 ? (
                          strengths.map((a) => (
                            <motion.div
                              key={a.key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center space-x-3 bg-green-900/20 border border-green-500/30 rounded-lg p-3"
                            >
                              <span className="text-xl">{a.emoji}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-200">{a.label}</div>
                                <div className="text-xs text-green-400">
                                  {balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>]}/100
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 italic">No areas above 80 yet. Keep pushing!</div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </section>

                {/* Areas to Improve */}
                <section className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
                  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-yellow-400 flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        ⚠️ Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-3">
                        {improvements.length > 0 ? (
                          improvements.map((a) => (
                            <motion.div
                              key={a.key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center space-x-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3"
                            >
                              <span className="text-xl">{a.emoji}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-200">{a.label}</div>
                                <div className="text-xs text-yellow-400">
                                  {balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>]}/100
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 italic">All areas above 80! Amazing balance!</div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </section>
              </div>

              {/* Personalized Recommendations */}
              <section className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-indigo-400 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      🎯 Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/30 border-2 border-indigo-500/50 flex items-center justify-center">
                            <span className="text-indigo-300 font-bold text-xs">1</span>
                          </div>
                          <div className="flex-1 text-gray-200">
                            Focus on your lowest-scoring area first. Small improvements there will have the biggest impact on overall balance.
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/30 border-2 border-indigo-500/50 flex items-center justify-center">
                            <span className="text-indigo-300 font-bold text-xs">2</span>
                          </div>
                          <div className="flex-1 text-gray-200">
                            Leverage your strengths. Apply successful habits from high-scoring areas to improve weaker ones.
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/30 border-2 border-indigo-500/50 flex items-center justify-center">
                            <span className="text-indigo-300 font-bold text-xs">3</span>
                          </div>
                          <div className="flex-1 text-gray-200">
                            Schedule quarterly balance reviews to track progress and adjust priorities as needed.
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YearlyBalanceContainer;

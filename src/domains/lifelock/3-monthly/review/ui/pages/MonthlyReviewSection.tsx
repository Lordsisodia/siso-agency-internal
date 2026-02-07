/**
 * Monthly Review Section Container
 *
 * Review pill with sub-tabs: calendar, wins, reflection
 * Uses purple theme
 */

import React, { useState } from 'react';
import { Calendar, Trophy, Lightbulb } from 'lucide-react';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { MonthlyCalendarSection } from '../../../calendar/MonthlyCalendarSection';
import type { MonthlyReflection, MonthlyData } from '../../../_shared/types';

// Wins sub-tab content
interface WinsViewProps {
  wins: string[];
  improvements: string[];
}

const WinsView: React.FC<WinsViewProps> = ({ wins, improvements }) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Monthly Wins */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">🏆 Monthly Wins & Achievements</h3>
            </div>
            <div className="space-y-3">
              {wins.map((win, idx) => (
                <div
                  key={idx}
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <Trophy className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-gray-200">{win}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Areas for Improvement */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">⚠️ Areas for Improvement</h3>
            </div>
            <div className="space-y-3">
              {improvements.map((improvement, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-gray-200">{improvement}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Reflection sub-tab content
interface ReflectionViewProps {
  reflectionData: MonthlyReflection;
}

const ReflectionView: React.FC<ReflectionViewProps> = ({ reflectionData }) => {
  const [reflection, setReflection] = useState(reflectionData.reflection);
  const [nextMonthFocus, setNextMonthFocus] = useState(reflectionData.nextMonthFocus);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Monthly Reflection */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">💭 Monthly Reflection</h3>
            </div>
            <div className="space-y-6">
              {/* Key Learnings */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What did I learn this month?
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Reflect on your biggest learnings, insights, and discoveries..."
                  className="w-full bg-gray-800/50 border border-purple-500/30 text-white placeholder:text-gray-500 min-h-[120px] rounded-lg p-3 focus:border-purple-400 focus:ring-purple-400/20 focus:outline-none"
                />
              </div>

              {/* Next Month Focus */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What&apos;s my focus for next month?
                </label>
                <textarea
                  value={nextMonthFocus}
                  onChange={(e) => setNextMonthFocus(e.target.value)}
                  placeholder="Set your intentions, priorities, and goals for the upcoming month..."
                  className="w-full bg-gray-800/50 border border-purple-500/30 text-white placeholder:text-gray-500 min-h-[120px] rounded-lg p-3 focus:border-purple-400 focus:ring-purple-400/20 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg"
                  onClick={() => {
                    // Save logic here
                  }}
                >
                  Save & Close Month
                </button>
                <button
                  className="border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 py-2 px-4 rounded-lg"
                  onClick={() => {
                    setReflection('');
                    setNextMonthFocus('');
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Motivational Quote */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 text-center">
            <div className="text-2xl mb-2">🌟</div>
            <p className="text-gray-200 italic mb-2">
              &quot;Success is the sum of small efforts repeated day in and day out.&quot;
            </p>
            <p className="text-sm text-gray-400">— Robert Collier</p>
          </div>
        </section>
      </div>
    </div>
  );
};

interface MonthlyReviewSectionProps {
  reflectionData: MonthlyReflection;
  monthlyData: MonthlyData;
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
}

const SUB_TABS: WeeklySubTab[] = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'wins', label: 'Wins', icon: Trophy },
  { id: 'reflection', label: 'Reflection', icon: Lightbulb },
];

export const MonthlyReviewSection: React.FC<MonthlyReviewSectionProps> = ({
  reflectionData,
  monthlyData,
  activeSubTab = 'calendar',
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
        theme="review"
      />

      {/* Content Area */}
      <div className="w-full">
        {activeSubTab === 'calendar' && (
          <MonthlyCalendarSection monthlyData={monthlyData} />
        )}
        {activeSubTab === 'wins' && (
          <WinsView wins={reflectionData.wins} improvements={reflectionData.improvements} />
        )}
        {activeSubTab === 'reflection' && (
          <ReflectionView reflectionData={reflectionData} />
        )}
      </div>
    </div>
  );
};

export default MonthlyReviewSection;

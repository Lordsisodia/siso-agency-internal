/**
 * YearlyView - Main Orchestrator
 *
 * Manages navigation between 3 main pills with sub-tabs:
 * 1. Review (overview, wins, vision)
 * 2. Goals (goals, milestones, growth)
 * 3. Balance (scorecard, trends, insights)
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Target, PieChart, ChevronLeft, ChevronRight, ArrowLeft, Trophy, Sparkles, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { YearlyBottomNavV2 } from './_shared/YearlyBottomNavV2';
import { SectionSubNav } from '@/components/navigation/SectionSubNav';
import { YearlyOverviewSection } from './overview/YearlyOverviewSection';
import { YearlyGoalsSection } from './goals/YearlyGoalsSection';
import { YearlyGrowthSection } from './growth/YearlyGrowthSection';
import { YearlyBalanceSection } from './balance/YearlyBalanceSection';
import { YearlyPlanningSection } from './planning/YearlyPlanningSection';
import {
  mockYearlyData,
  mockAnnualGoals,
  mockMilestones,
  mockYearOverYear,
  mockLifeBalance,
  mockYearlyReflection
} from './_shared/mockData';

// Define the 3 main pills
const PILLS = [
  { title: 'Review', icon: Calendar },
  { title: 'Goals', icon: Target },
  { title: 'Balance', icon: PieChart },
];

// Define sub-tabs for each pill
const SUB_TABS = {
  review: [
    { id: 'overview', name: 'Overview', icon: Calendar },
    { id: 'wins', name: 'Wins', icon: Trophy },
    { id: 'vision', name: 'Vision', icon: Sparkles },
  ],
  goals: [
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'milestones', name: 'Milestones', icon: Trophy },
    { id: 'growth', name: 'Growth', icon: TrendingUp },
  ],
  balance: [
    { id: 'scorecard', name: 'Scorecard', icon: PieChart },
    { id: 'trends', name: 'Trends', icon: BarChart3 },
    { id: 'insights', name: 'Insights', icon: Lightbulb },
  ],
};

// Pill ID type
type PillId = 'review' | 'goals' | 'balance';

export const YearlyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activePill, setActivePill] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  const goToPreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const goToNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const goToCurrentYear = () => {
    setSelectedYear(new Date().getFullYear());
  };

  const isCurrentYear = selectedYear === new Date().getFullYear();

  // Update mock data with selected year
  const yearlyData = { ...mockYearlyData, year: selectedYear };

  // Get current pill ID
  const currentPillId: PillId = ['review', 'goals', 'balance'][activePill] as PillId;

  // Get current sub-tabs for the active pill
  const currentSubTabs = SUB_TABS[currentPillId];

  // Handle pill change
  const handlePillChange = (index: number | null) => {
    if (index === null) {
      // More button clicked - handle as needed
      return;
    }
    setActivePill(index);
    // Set default sub-tab for the new pill
    const newPillId = ['review', 'goals', 'balance'][index] as PillId;
    setActiveSubTab(SUB_TABS[newPillId][0].id);
  };

  // Handle sub-tab change
  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  // Render content based on active pill and sub-tab
  const renderContent = () => {
    switch (currentPillId) {
      case 'review':
        switch (activeSubTab) {
          case 'overview':
            return <YearlyOverviewSection yearlyData={yearlyData} />;
          case 'wins':
            // Wins view - could be a new component or reuse overview with wins filter
            return <YearlyOverviewSection yearlyData={yearlyData} showWins />;
          case 'vision':
            return <YearlyPlanningSection reflectionData={mockYearlyReflection} currentYear={selectedYear} />;
          default:
            return <YearlyOverviewSection yearlyData={yearlyData} />;
        }
      case 'goals':
        switch (activeSubTab) {
          case 'goals':
            return <YearlyGoalsSection annualGoals={mockAnnualGoals} milestones={mockMilestones} />;
          case 'milestones':
            // Milestones view - could filter goals section to show milestones
            return <YearlyGoalsSection annualGoals={mockAnnualGoals} milestones={mockMilestones} showMilestones />;
          case 'growth':
            return <YearlyGrowthSection yearOverYear={mockYearOverYear} currentYear={selectedYear} />;
          default:
            return <YearlyGoalsSection annualGoals={mockAnnualGoals} milestones={mockMilestones} />;
        }
      case 'balance':
        switch (activeSubTab) {
          case 'scorecard':
            return <YearlyBalanceSection balanceData={mockLifeBalance} />;
          case 'trends':
            // Trends view - could reuse growth section or create new
            return <YearlyGrowthSection yearOverYear={mockYearOverYear} currentYear={selectedYear} showTrends />;
          case 'insights':
            // Insights view - could reuse planning section or create new
            return <YearlyPlanningSection reflectionData={mockYearlyReflection} currentYear={selectedYear} showInsights />;
          default:
            return <YearlyBalanceSection balanceData={mockLifeBalance} />;
        }
      default:
        return <YearlyOverviewSection yearlyData={yearlyData} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 relative">

      {/* Year Selector - Fixed at top */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Back to Monthly / Forward to Life (future) */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock/monthly')}
              className="text-gray-400 hover:text-purple-400 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Monthly View
            </Button>
            <div className="text-xs text-gray-500">
              Life View (Coming Soon)
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Previous Year Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousYear}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Year Display */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-400">
                {selectedYear}
              </div>
              {!isCurrentYear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToCurrentYear}
                  className="text-xs text-gray-400 hover:text-orange-400 mt-1"
                >
                  Jump to current year
                </Button>
              )}
            </div>

            {/* Next Year Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextYear}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <SectionSubNav
        subSections={currentSubTabs}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
        activeColor="text-orange-400"
        activeBgColor="bg-orange-400/20"
      />

      {/* Page Content */}
      <div className="relative pb-24">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <YearlyBottomNavV2
        tabs={PILLS}
        activeIndex={activePill}
        activeColor="text-orange-400"
        activeSubTab={activeSubTab}
        onChange={handlePillChange}
      />
    </div>
  );
};

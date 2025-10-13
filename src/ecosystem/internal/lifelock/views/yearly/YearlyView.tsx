/**
 * YearlyView - Main Orchestrator
 * 
 * Manages navigation between 5 yearly pages:
 * 1. Overview (12-month grid, quarterly breakdown)
 * 2. Goals & Milestones
 * 3. Growth & Trends
 * 4. Life Balance
 * 5. Planning & Vision
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Target, TrendingUp, PieChart, Rocket, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { YearlyBottomNav } from './_shared/YearlyBottomNav';
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

export const YearlyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { title: 'Overview', icon: Calendar },
    { title: 'Goals', icon: Target },
    { title: 'Growth', icon: TrendingUp },
    { title: 'Balance', icon: PieChart },
    { title: 'Vision', icon: Rocket },
  ];

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

      {/* Page Content */}
      <div className="relative">
        {activeTab === 0 && <YearlyOverviewSection yearlyData={yearlyData} />}
        {activeTab === 1 && (
          <YearlyGoalsSection
            annualGoals={mockAnnualGoals}
            milestones={mockMilestones}
          />
        )}
        {activeTab === 2 && (
          <YearlyGrowthSection
            yearOverYear={mockYearOverYear}
            currentYear={selectedYear}
          />
        )}
        {activeTab === 3 && <YearlyBalanceSection balanceData={mockLifeBalance} />}
        {activeTab === 4 && (
          <YearlyPlanningSection
            reflectionData={mockYearlyReflection}
            currentYear={selectedYear}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <YearlyBottomNav
        tabs={tabs}
        activeIndex={activeTab}
        activeColor="text-orange-400"
        onChange={(index) => {
          if (index !== null) setActiveTab(index);
        }}
      />
    </div>
  );
};

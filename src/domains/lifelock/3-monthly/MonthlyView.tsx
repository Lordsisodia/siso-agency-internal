/**
 * MonthlyView - Main Orchestrator
 *
 * Manages navigation between 3 main pills with sub-tabs:
 * 1. Review (Calendar, Wins, Reflection)
 * 2. Goals (Monthly Goals, Performance, Projects)
 * 3. Habits (Consistency, Habit Grid, Analysis)
 */

import React, { useState } from 'react';
import { addMonths, subMonths, startOfMonth, format } from 'date-fns';
import { Calendar, Target, Flame, Lightbulb, ChevronLeft, ChevronRight, ArrowLeft, Trophy, TrendingUp, Grid3X3, BarChart3, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MonthlyBottomNavV2 } from './_shared/MonthlyBottomNavV2';
import { SectionSubNav } from '@/components/navigation/SectionSubNav';
import { NavSubSection } from '@/services/shared/navigation-config';
import { MonthlyCalendarSection } from './calendar/MonthlyCalendarSection';
import { MonthlyGoalsSection } from './goals/MonthlyGoalsSection';
import { MonthlyPerformanceSection } from './performance/MonthlyPerformanceSection';
import { MonthlyConsistencySection } from './consistency/MonthlyConsistencySection';
import { MonthlyReviewSection } from './review/MonthlyReviewSection';
import {
  mockMonthlyData,
  mockMonthlyGoals,
  mockYearlyProgress,
  mockProjects,
  mockMonthOverMonth,
  mockHabitConsistency,
  mockMonthlyReflection
} from './_shared/mockData';

// Define the 3 main pills
const MAIN_PILLS = [
  { title: 'Review', icon: Lightbulb },
  { title: 'Goals', icon: Target },
  { title: 'Habits', icon: Flame },
];

// Define sub-sections for each pill
const REVIEW_SUBSECTIONS: NavSubSection[] = [
  { id: 'calendar', name: 'Calendar', icon: Calendar },
  { id: 'wins', name: 'Wins', icon: Trophy },
  { id: 'reflection', name: 'Reflection', icon: Lightbulb },
];

const GOALS_SUBSECTIONS: NavSubSection[] = [
  { id: 'monthly-goals', name: 'Monthly Goals', icon: Target },
  { id: 'performance', name: 'Performance', icon: TrendingUp },
  { id: 'projects', name: 'Projects', icon: Grid3X3 },
];

const HABITS_SUBSECTIONS: NavSubSection[] = [
  { id: 'consistency', name: 'Consistency', icon: Flame },
  { id: 'habit-grid', name: 'Habit Grid', icon: Grid3X3 },
  { id: 'analysis', name: 'Analysis', icon: BarChart3 },
];

// Map pill index to sub-sections
const SUBSECTIONS_MAP: Record<number, NavSubSection[]> = {
  0: REVIEW_SUBSECTIONS,
  1: GOALS_SUBSECTIONS,
  2: HABITS_SUBSECTIONS,
};

export const MonthlyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [activePill, setActivePill] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<string>('calendar');

  const goToPreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(startOfMonth(new Date()));
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  // Update mock data with selected month
  const monthlyData = { ...mockMonthlyData, month: selectedMonth };

  // Handle pill change - reset sub-tab to first of new pill
  const handlePillChange = (index: number | null) => {
    if (index === null) {
      // More button clicked - handle grid menu
      // TODO: Implement grid menu for monthly view
      return;
    }
    setActivePill(index);
    // Set sub-tab to first option of the new pill
    const newSubSections = SUBSECTIONS_MAP[index];
    if (newSubSections && newSubSections.length > 0) {
      setActiveSubTab(newSubSections[0].id);
    }
  };

  // Handle sub-tab change
  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  // Get current sub-sections based on active pill
  const currentSubSections = SUBSECTIONS_MAP[activePill] || REVIEW_SUBSECTIONS;

  // Render content based on active pill and sub-tab
  const renderContent = () => {
    switch (activePill) {
      case 0: // Review
        switch (activeSubTab) {
          case 'calendar':
            return <MonthlyCalendarSection monthlyData={monthlyData} />;
          case 'wins':
            return <MonthlyReviewSection reflectionData={mockMonthlyReflection} />;
          case 'reflection':
            return <MonthlyReviewSection reflectionData={mockMonthlyReflection} />;
          default:
            return <MonthlyCalendarSection monthlyData={monthlyData} />;
        }
      case 1: // Goals
        switch (activeSubTab) {
          case 'monthly-goals':
            return (
              <MonthlyGoalsSection
                monthlyGoals={mockMonthlyGoals}
                yearlyProgress={mockYearlyProgress}
                projects={mockProjects}
              />
            );
          case 'performance':
            return <MonthlyPerformanceSection monthOverMonth={mockMonthOverMonth} />;
          case 'projects':
            return (
              <MonthlyGoalsSection
                monthlyGoals={mockMonthlyGoals}
                yearlyProgress={mockYearlyProgress}
                projects={mockProjects}
              />
            );
          default:
            return (
              <MonthlyGoalsSection
                monthlyGoals={mockMonthlyGoals}
                yearlyProgress={mockYearlyProgress}
                projects={mockProjects}
              />
            );
        }
      case 2: // Habits
        switch (activeSubTab) {
          case 'consistency':
            return (
              <MonthlyConsistencySection
                habits={mockHabitConsistency}
                monthlyData={monthlyData}
              />
            );
          case 'habit-grid':
            return (
              <MonthlyConsistencySection
                habits={mockHabitConsistency}
                monthlyData={monthlyData}
              />
            );
          case 'analysis':
            return (
              <MonthlyConsistencySection
                habits={mockHabitConsistency}
                monthlyData={monthlyData}
              />
            );
          default:
            return (
              <MonthlyConsistencySection
                habits={mockHabitConsistency}
                monthlyData={monthlyData}
              />
            );
        }
      default:
        return <MonthlyCalendarSection monthlyData={monthlyData} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 relative">

      {/* Month Selector - Fixed at top */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Back to Weekly / Forward to Yearly */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock/weekly')}
              className="text-gray-400 hover:text-blue-400 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Weekly View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock/yearly')}
              className="text-gray-400 hover:text-orange-400 hover:bg-transparent"
            >
              Yearly View
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Previous Month Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Month Display */}
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-purple-400">
                {format(selectedMonth, 'MMMM yyyy')}
              </div>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="text-xs text-gray-400 hover:text-purple-400 mt-1"
                >
                  Jump to current month
                </Button>
              )}
            </div>

            {/* Next Month Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Section Sub-Navigation */}
      <SectionSubNav
        subSections={currentSubSections}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
      />

      {/* Page Content */}
      <div className="relative pb-24">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <MonthlyBottomNavV2
        tabs={MAIN_PILLS}
        activeIndex={activePill}
        activeColor="text-purple-400"
        activeSubTab={activeSubTab}
        onChange={handlePillChange}
      />
    </div>
  );
};

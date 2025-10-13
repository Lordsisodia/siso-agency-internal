/**
 * MonthlyView - Main Orchestrator
 * 
 * Manages navigation between 5 monthly pages:
 * 1. Calendar
 * 2. Goals & Progress
 * 3. Performance & Trends
 * 4. Consistency & Streaks
 * 5. Review & Reflection
 */

import React, { useState } from 'react';
import { addMonths, subMonths, startOfMonth, format } from 'date-fns';
import { Calendar, Target, TrendingUp, Flame, Lightbulb, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { MonthlyBottomNav } from './_shared/MonthlyBottomNav';
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

export const MonthlyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { title: 'Calendar', icon: Calendar },
    { title: 'Goals', icon: Target },
    { title: 'Performance', icon: TrendingUp },
    { title: 'Habits', icon: Flame },
    { title: 'Review', icon: Lightbulb },
  ];

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

      {/* Page Content */}
      <div className="relative">
        {activeTab === 0 && <MonthlyCalendarSection monthlyData={monthlyData} />}
        {activeTab === 1 && (
          <MonthlyGoalsSection
            monthlyGoals={mockMonthlyGoals}
            yearlyProgress={mockYearlyProgress}
            projects={mockProjects}
          />
        )}
        {activeTab === 2 && <MonthlyPerformanceSection monthOverMonth={mockMonthOverMonth} />}
        {activeTab === 3 && (
          <MonthlyConsistencySection
            habits={mockHabitConsistency}
            monthlyData={monthlyData}
          />
        )}
        {activeTab === 4 && <MonthlyReviewSection reflectionData={mockMonthlyReflection} />}
      </div>

      {/* Bottom Navigation */}
      <MonthlyBottomNav
        tabs={tabs}
        activeIndex={activeTab}
        activeColor="text-purple-400"
        onChange={(index) => {
          if (index !== null) setActiveTab(index);
        }}
      />
    </div>
  );
};

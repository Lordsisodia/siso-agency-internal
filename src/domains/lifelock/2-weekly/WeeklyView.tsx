/**
 * WeeklyView - Main Orchestrator
 *
 * Manages navigation between 5 weekly pages:
 * 1. Overview
 * 2. Productivity
 * 3. Wellness
 * 4. Time Analysis
 * 5. Insights & Checkout
 */

import React, { useState, useMemo } from 'react';
import { addWeeks, subWeeks, startOfWeek, differenceInDays, addDays, format } from 'date-fns';
import { BarChart3, Target, Briefcase, Heart, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/ui/admin/AdminLayout';
import { WeeklyTopNav } from './_shared/WeeklyTopNav';
import { WeeklyBottomNav } from './_shared/WeeklyBottomNav';
import { WeeklyOverviewSection } from './overview/WeeklyOverviewSection';
import { WeeklyProductivitySection } from './productivity/WeeklyProductivitySection';
import { WeeklyWellnessSection } from './wellness/WeeklyWellnessSection';
import { WeeklyTimeAnalysisSection } from './time-analysis/WeeklyTimeAnalysisSection';
import { WeeklyCheckoutSection } from './checkout/WeeklyCheckoutSection';
import { mockWeeklyData, mockProductivityData, mockWellnessData, mockTimeAnalysisData, mockInsightsData } from './_shared/mockData';
import { WeeklyGoalsSection } from './goals/WeeklyGoalsSection';

export const WeeklyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { title: 'Overview', icon: BarChart3 },
    { title: 'Goals', icon: Target },
    { title: 'Work', icon: Briefcase },
    { title: 'Health', icon: Heart },
    { title: 'Time', icon: Clock },
    { title: 'Review', icon: CheckCircle },
  ];

  const goToPreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  // Calculate week completion percentage (how far through the week we are)
  const weekCompletionPercentage = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 7);

    // If we're viewing a future week, show 0%
    if (now < weekStart) return 0;

    // If we're viewing a past week, show 100%
    if (now > weekEnd) return 100;

    // Calculate percentage through current week
    const daysSinceStart = differenceInDays(now, weekStart);
    const totalDays = 7;
    return Math.min(100, Math.round((daysSinceStart / totalDays) * 100));
  }, [selectedWeek]);

  // Update mock data with selected week
  const weeklyData = { ...mockWeeklyData, weekStart: selectedWeek, weekEnd: addWeeks(selectedWeek, 1) };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-[#121212] text-white relative">

        {/* Navigation Button - Monthly View on left */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/lifelock/monthly')}
                className="text-gray-400 hover:text-purple-400 hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Monthly View
              </Button>
            </div>
          </div>
        </div>

      {/* Weekly Top Navigation - Fixed at top */}
      <div className="sticky top-12 z-40 px-4 py-3 bg-[#121212]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <WeeklyTopNav
            selectedWeek={selectedWeek}
            weekCompletionPercentage={weekCompletionPercentage}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="relative">
        {activeTab === 0 && <WeeklyOverviewSection weeklyData={weeklyData} onNavigateToDaily={() => navigate('/admin/lifelock/daily')} />}
        {activeTab === 1 && <WeeklyGoalsSection selectedWeek={selectedWeek} />}
        {activeTab === 2 && <WeeklyProductivitySection productivityData={mockProductivityData} />}
        {activeTab === 3 && <WeeklyWellnessSection wellnessData={mockWellnessData} />}
        {activeTab === 4 && <WeeklyTimeAnalysisSection timeData={mockTimeAnalysisData} />}
        {activeTab === 5 && <WeeklyCheckoutSection insightsData={mockInsightsData} />}
      </div>

      {/* Bottom Navigation */}
      <WeeklyBottomNav
        tabs={tabs}
        activeIndex={activeTab}
        activeColor="text-blue-400"
        onChange={(index) => {
          if (index !== null) setActiveTab(index);
        }}
      />
      </div>
    </AdminLayout>
  );
};

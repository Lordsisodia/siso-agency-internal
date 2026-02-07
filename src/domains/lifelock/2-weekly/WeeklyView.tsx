/**
 * WeeklyView - Main Orchestrator
 *
 * Manages navigation between 3 main pills with sub-tabs:
 * 1. Review (Overview, Wins, Problems)
 * 2. Work (Productivity, Goals, Time Analysis)
 * 3. Health (Wellness, Habits, Recovery)
 */

import React, { useState, useMemo } from 'react';
import { addWeeks, subWeeks, startOfWeek, differenceInDays, addDays, format } from 'date-fns';
import { BarChart3, Target, Briefcase, Heart, Clock, CheckCircle, ChevronLeft, Trophy, AlertCircle, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/ui/admin/AdminLayout';
import { WeeklyTopNav } from './_shared/WeeklyTopNav';
import { WeeklyBottomNavV2 } from './_shared/WeeklyBottomNavV2';
import { SectionSubNav } from '@/components/navigation/SectionSubNav';
import { NavSubSection } from '@/services/shared/navigation-config';
import { WeeklyOverviewSection } from './overview/WeeklyOverviewSection';
import { WeeklyProductivitySection } from './productivity/WeeklyProductivitySection';
import { WeeklyWellnessSection } from './wellness/WeeklyWellnessSection';
import { WeeklyTimeAnalysisSection } from './time-analysis/WeeklyTimeAnalysisSection';
import { WeeklyCheckoutSection } from './checkout/WeeklyCheckoutSection';
import { mockWeeklyData, mockProductivityData, mockWellnessData, mockTimeAnalysisData, mockInsightsData } from './_shared/mockData';
import { WeeklyGoalsSection } from './goals/WeeklyGoalsSection';

// Define the 3 main pills
const MAIN_PILLS = [
  { title: 'Review', icon: CheckCircle },
  { title: 'Work', icon: Briefcase },
  { title: 'Health', icon: Heart },
];

// Define sub-sections for each pill
const REVIEW_SUBSECTIONS: NavSubSection[] = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'wins', name: 'Wins', icon: Trophy },
  { id: 'problems', name: 'Problems', icon: AlertCircle },
];

const WORK_SUBSECTIONS: NavSubSection[] = [
  { id: 'productivity', name: 'Productivity', icon: Zap },
  { id: 'goals', name: 'Goals', icon: Target },
  { id: 'time-analysis', name: 'Time Analysis', icon: Clock },
];

const HEALTH_SUBSECTIONS: NavSubSection[] = [
  { id: 'wellness', name: 'Wellness', icon: Heart },
  { id: 'habits', name: 'Habits', icon: CheckCircle },
  { id: 'recovery', name: 'Recovery', icon: Calendar },
];

// Map pill index to sub-sections
const SUBSECTIONS_MAP: Record<number, NavSubSection[]> = {
  0: REVIEW_SUBSECTIONS,
  1: WORK_SUBSECTIONS,
  2: HEALTH_SUBSECTIONS,
};

export const WeeklyView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activePill, setActivePill] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

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

  // Handle pill change - reset sub-tab to first of new pill
  const handlePillChange = (index: number | null) => {
    if (index === null) {
      // More button clicked - handle grid menu
      // TODO: Implement grid menu for weekly view
      return;
    }
    setActivePill(index);
    // Set sub-tab to first option of the new pill
    const newSubSections = SUBSECTIONS_MAP[index];
    if (newSubSections && newSubSections.length > 0) {
      setActiveSubTab(newSubSections[0].id);
    }
  };

  // Get current sub-sections based on active pill
  const currentSubSections = SUBSECTIONS_MAP[activePill] || REVIEW_SUBSECTIONS;

  // Render content based on active pill and sub-tab
  const renderContent = () => {
    switch (activePill) {
      case 0: // Review
        switch (activeSubTab) {
          case 'overview':
            return <WeeklyOverviewSection weeklyData={weeklyData} onNavigateToDaily={() => navigate('/admin/lifelock/daily')} />;
          case 'wins':
            return <WeeklyCheckoutSection insightsData={mockInsightsData} />;
          case 'problems':
            return <WeeklyCheckoutSection insightsData={mockInsightsData} />;
          default:
            return <WeeklyOverviewSection weeklyData={weeklyData} onNavigateToDaily={() => navigate('/admin/lifelock/daily')} />;
        }
      case 1: // Work
        switch (activeSubTab) {
          case 'productivity':
            return <WeeklyProductivitySection productivityData={mockProductivityData} />;
          case 'goals':
            return <WeeklyGoalsSection selectedWeek={selectedWeek} />;
          case 'time-analysis':
            return <WeeklyTimeAnalysisSection timeData={mockTimeAnalysisData} />;
          default:
            return <WeeklyProductivitySection productivityData={mockProductivityData} />;
        }
      case 2: // Health
        switch (activeSubTab) {
          case 'wellness':
            return <WeeklyWellnessSection wellnessData={mockWellnessData} />;
          case 'habits':
            return <WeeklyWellnessSection wellnessData={mockWellnessData} />;
          case 'recovery':
            return <WeeklyWellnessSection wellnessData={mockWellnessData} />;
          default:
            return <WeeklyWellnessSection wellnessData={mockWellnessData} />;
        }
      default:
        return <WeeklyOverviewSection weeklyData={weeklyData} onNavigateToDaily={() => navigate('/admin/lifelock/daily')} />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-siso-bg text-white relative">

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
      <div className="sticky top-12 z-40 px-4 py-3 bg-siso-bg/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <WeeklyTopNav
            selectedWeek={selectedWeek}
            weekCompletionPercentage={weekCompletionPercentage}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
          />
        </div>
      </div>

      {/* Section Sub-Navigation */}
      <SectionSubNav
        subSections={currentSubSections}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />

      {/* Page Content */}
      <div className="relative pb-24">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <WeeklyBottomNavV2
        tabs={MAIN_PILLS}
        activeIndex={activePill}
        activeColor="text-blue-400"
        activeSubTab={activeSubTab}
        onChange={handlePillChange}
      />
      </div>
    </AdminLayout>
  );
};

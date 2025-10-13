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

import React, { useState } from 'react';
import { addWeeks, subWeeks, startOfWeek, format } from 'date-fns';
import { BarChart3, Briefcase, Heart, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { WeeklyBottomNav } from './_shared/WeeklyBottomNav';
import { WeeklyOverviewSection } from './overview/WeeklyOverviewSection';
import { WeeklyProductivitySection } from './productivity/WeeklyProductivitySection';
import { WeeklyWellnessSection } from './wellness/WeeklyWellnessSection';
import { WeeklyTimeAnalysisSection } from './time-analysis/WeeklyTimeAnalysisSection';
import { WeeklyCheckoutSection } from './checkout/WeeklyCheckoutSection';
import { mockWeeklyData, mockProductivityData, mockWellnessData, mockTimeAnalysisData, mockInsightsData } from './_shared/mockData';

export const WeeklyView: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { title: 'Overview', icon: BarChart3 },
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

  const goToCurrentWeek = () => {
    setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isCurrentWeek = format(selectedWeek, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Update mock data with selected week
  const weeklyData = { ...mockWeeklyData, weekStart: selectedWeek, weekEnd: addWeeks(selectedWeek, 1) };

  return (
    <div className="min-h-screen w-full bg-gray-950 relative">
      
      {/* Week Selector - Fixed at top */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Previous Week Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Week Display */}
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-blue-400">
                {format(selectedWeek, 'MMM d')} - {format(addWeeks(selectedWeek, 1), 'd, yyyy')}
              </div>
              {!isCurrentWeek && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToCurrentWeek}
                  className="text-xs text-gray-400 hover:text-blue-400 mt-1"
                >
                  Jump to current week
                </Button>
              )}
            </div>

            {/* Next Week Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="relative">
        {activeTab === 0 && <WeeklyOverviewSection weeklyData={weeklyData} />}
        {activeTab === 1 && <WeeklyProductivitySection productivityData={mockProductivityData} />}
        {activeTab === 2 && <WeeklyWellnessSection wellnessData={mockWellnessData} />}
        {activeTab === 3 && <WeeklyTimeAnalysisSection timeData={mockTimeAnalysisData} />}
        {activeTab === 4 && <WeeklyCheckoutSection insightsData={mockInsightsData} />}
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
  );
};

/**
 * WeeklyView - Debug Version with Error Boundaries
 * Testing each section component individually
 */

import React, { useState, Suspense } from 'react';
import { addWeeks, subWeeks, startOfWeek, format } from 'date-fns';
import { BarChart3, Briefcase, Heart, Clock, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { ErrorBoundary } from 'react-error-boundary';

// Import sections
import { WeeklyBottomNav } from './_shared/WeeklyBottomNav';

// Lazy load sections to catch import errors
const WeeklyOverviewSection = React.lazy(() => import('./overview/WeeklyOverviewSection').then(m => ({ default: m.WeeklyOverviewSection })));
const WeeklyProductivitySection = React.lazy(() => import('./productivity/WeeklyProductivitySection').then(m => ({ default: m.WeeklyProductivitySection })));
const WeeklyWellnessSection = React.lazy(() => import('./wellness/WeeklyWellnessSection').then(m => ({ default: m.WeeklyWellnessSection })));
const WeeklyTimeAnalysisSection = React.lazy(() => import('./time-analysis/WeeklyTimeAnalysisSection').then(m => ({ default: m.WeeklyTimeAnalysisSection })));
const WeeklyCheckoutSection = React.lazy(() => import('./checkout/WeeklyCheckoutSection').then(m => ({ default: m.WeeklyCheckoutSection })));

// Import mock data
import { mockWeeklyData, mockProductivityData, mockWellnessData, mockTimeAnalysisData, mockInsightsData } from './_shared/mockData';

// Error fallback
function SectionErrorFallback({ error, sectionName }: { error: Error; sectionName: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-2xl">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          ❌ {sectionName} Failed to Load
        </h2>
        <p className="text-gray-300 mb-4">Error: {error.message}</p>
        <pre className="bg-black/50 p-4 rounded text-xs text-gray-400 overflow-auto">
          {error.stack}
        </pre>
      </div>
    </div>
  );
}

export const WeeklyView: React.FC = () => {
  const navigate = useNavigate();
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
          {/* Back to Daily Button */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/lifelock/daily/${format(new Date(), 'yyyy-MM-dd')}`)}
              className="text-gray-400 hover:text-blue-400 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Daily View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock/monthly')}
              className="text-gray-400 hover:text-purple-400 hover:bg-transparent"
            >
              Monthly View
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

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

      {/* Page Content - Wrapped in Error Boundaries */}
      <div className="relative">
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading section...</div>}>
          {activeTab === 0 && (
            <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Overview" />}>
              <WeeklyOverviewSection weeklyData={weeklyData} />
            </ErrorBoundary>
          )}
          {activeTab === 1 && (
            <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Productivity" />}>
              <WeeklyProductivitySection productivityData={mockProductivityData} />
            </ErrorBoundary>
          )}
          {activeTab === 2 && (
            <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Wellness" />}>
              <WeeklyWellnessSection wellnessData={mockWellnessData} />
            </ErrorBoundary>
          )}
          {activeTab === 3 && (
            <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Time Analysis" />}>
              <WeeklyTimeAnalysisSection timeData={mockTimeAnalysisData} />
            </ErrorBoundary>
          )}
          {activeTab === 4 && (
            <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Checkout" />}>
              <WeeklyCheckoutSection insightsData={mockInsightsData} />
            </ErrorBoundary>
          )}
        </Suspense>
      </div>

      {/* Bottom Navigation */}
      <ErrorBoundary FallbackComponent={(props) => <SectionErrorFallback {...props} sectionName="Bottom Nav" />}>
        <WeeklyBottomNav
          tabs={tabs}
          activeIndex={activeTab}
          activeColor="text-blue-400"
          onChange={(index) => {
            if (index !== null) setActiveTab(index);
          }}
        />
      </ErrorBoundary>
    </div>
  );
};

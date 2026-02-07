/**
 * LifeView - Main Orchestrator
 *
 * Manages navigation between 7 Life pages:
 * 1. Vision (Mission, Values, 5-Year Vision)
 * 2. Active Goals (Major goals, categories, milestones)
 * 3. Legacy & Stats (Lifetime stats, all-time bests, financial)
 * 4. Multi-Year Timeline (Year cards, life events)
 * 5. Balance Scorecard (Life balance wheel, category scores)
 * 6. Life Review (Quarterly review, course corrections)
 * 7. Planning & Roadmap (1/3/5/10-year plans)
 */

import React, { useState } from 'react';
import { Star, Target, Trophy, Calendar, PieChart, Lightbulb, Rocket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/ui/admin/AdminLayout';
import { LifeBottomNav } from './_shared/LifeBottomNav';
import { LifeVisionSection } from './vision/LifeVisionSection';
import { LifeActiveGoalsSection } from './active-goals/LifeActiveGoalsSection';
import { LifeLegacySection } from './legacy/LifeLegacySection';
import { LifeTimelineSection } from './timeline/LifeTimelineSection';
import { LifeBalanceSection } from './balance/LifeBalanceSection';
import { LifeReviewSection } from './review/LifeReviewSection';
import { LifePlanningSection } from './planning/LifePlanningSection';
import {
  mockLifeVision,
  mockLifeGoals,
  mockLifetimeStats,
  mockAllTimeBests,
  mockFinancialLegacy,
  mockImpactMetrics,
  mockYearTimeline,
  mockLifeBalance,
  mockLifeReviews,
  mockLifePlanning
} from './_shared/mockData';

// Define the 7 main tabs
const MAIN_TABS = [
  { title: 'Vision', icon: Star },
  { title: 'Goals', icon: Target },
  { title: 'Legacy', icon: Trophy },
  { title: 'Timeline', icon: Calendar },
  { title: 'Balance', icon: PieChart },
  { title: 'Review', icon: Lightbulb },
  { title: 'Planning', icon: Rocket },
];

export const LifeView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      setActiveTab(index);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 0: // Vision
        return <LifeVisionSection visionData={mockLifeVision} />;
      case 1: // Active Goals
        return <LifeActiveGoalsSection goals={mockLifeGoals} />;
      case 2: // Legacy & Stats
        return (
          <LifeLegacySection
            lifetimeStats={mockLifetimeStats}
            allTimeBests={mockAllTimeBests}
            financialLegacy={mockFinancialLegacy}
            impactMetrics={mockImpactMetrics}
          />
        );
      case 3: // Multi-Year Timeline
        return <LifeTimelineSection timelineData={mockYearTimeline} />;
      case 4: // Balance Scorecard
        return <LifeBalanceSection balanceData={mockLifeBalance} />;
      case 5: // Life Review
        return <LifeReviewSection reviews={mockLifeReviews} />;
      case 6: // Planning & Roadmap
        return <LifePlanningSection planningData={mockLifePlanning} />;
      default:
        return <LifeVisionSection visionData={mockLifeVision} />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-siso-bg text-white relative">
        {/* Navigation Header - Back to Yearly */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/lifelock/yearly')}
                className="text-gray-400 hover:text-orange-400 hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Yearly View
              </Button>
              <div className="text-lg font-bold text-amber-400">
                Life Journey
              </div>
              <div className="w-24" /> {/* Spacer for balance */}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative pb-32">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <LifeBottomNav
          tabs={MAIN_TABS}
          activeIndex={activeTab}
          activeColor="text-amber-400"
          onChange={handleTabChange}
        />
      </div>
    </AdminLayout>
  );
};

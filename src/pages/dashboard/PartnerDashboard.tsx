import React, { useEffect } from 'react';
import { PartnerOnboarding } from '@/internal/dashboard/PartnerOnboarding';
import { theme } from '@/styles/theme';
import { useImplementation } from '@/migration/feature-flags';
import { PartnershipLayout } from '@/ai-first/features/partnerships/components/PartnershipLayout';
import { DashboardGreetingCard } from '@/shared/ui/dashboard-templates';
import { useUser } from '@/shared/hooks/useUser';
import { AppPlanMicroChat } from '@/internal/dashboard/AppPlanMicroChat';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { LoadingState } from '@/shared/ui/loading-state';

// Refactored components
import { 
  StatsGrid, 
  PartnerAdvancement, 
  TrainingHub, 
  ClientManagement, 
  SupportCenter 
} from './components';

// Custom hooks
import { usePartnerStats, usePartnerOnboarding } from './hooks';

// Interfaces moved to hooks for better organization

const PartnerDashboard = () => {
  const { user } = useUser();
  const { stats, isLoading: statsLoading, error, refreshStats } = usePartnerStats();
  const { 
    isOnboardingComplete, 
    isLoading: onboardingLoading, 
    checkOnboardingStatus, 
    handleOnboardingComplete, 
    handleOnboardingSkip 
  } = usePartnerOnboarding();

  const isLoading = statsLoading || onboardingLoading;

  // Add custom CSS styles for optimal grid layout
  const gridStyles = `
    .dashboard-container {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
      min-height: 100vh;
    }

    .row-1 { 
      grid-column: 1 / -1; 
      min-height: 120px;
    }

    .row-2a { 
      grid-column: 1 / 9; 
      min-height: 140px;
    }

    .row-2b { 
      grid-column: 9 / -1; 
      min-height: 140px;
    }

    .row-3-cards { 
      grid-column: 1 / -1; 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 1.5rem;
      min-height: 180px;
    }

    .row-4 { 
      grid-column: 1 / -1; 
      min-height: 400px;
    }

    .row-5-container {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      min-height: 350px;
    }

    .row-5a { 
      grid-column: 1;
    }

    .row-5b { 
      grid-column: 2;
    }

    .row-6 { 
      grid-column: 1 / -1; 
      min-height: 200px;
    }

    /* Responsive adjustments */
    @media (max-width: 1199px) {
      .dashboard-container {
        grid-template-columns: repeat(8, 1fr);
        gap: 1rem;
        padding: 1rem;
      }
      
      .row-2a { grid-column: 1 / 6; }
      .row-2b { grid-column: 6 / -1; }
      
      .row-5-container {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .row-5a, .row-5b { 
        grid-column: 1; 
      }
    }

    @media (max-width: 767px) {
      .dashboard-container {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }
      
      .row-2a, .row-2b, .row-3-cards {
        grid-column: 1;
      }
      
      .row-3-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  // Initialize onboarding check on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  if (isLoading) {
    return useImplementation(
      'useUnifiedLoadingState',
      // NEW: Unified loading state (safer, consistent, reusable)
      <LoadingState 
        message="Loading partner dashboard..." 
        variant="spinner"
        size="lg"
        className="min-h-screen"
      />,
      // OLD: Original loading state (fallback for safety)
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show onboarding if not complete (temporarily disabled to show new dashboard)
  if (false && isOnboardingComplete === false) {
    return (
      <div className="p-6">
        <PartnerOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }


  return (
    <PartnershipLayout>
      {/* Inject custom CSS styles for optimal grid layout */}
      <style>{gridStyles}</style>
      
      {/* Optimized Dashboard Container with CSS Grid Layout */}
      <div className="dashboard-container">
      
      {/* ROW 1: Smart Dashboard Greeting Card - Full Width */}
      <div className="row-1">
        <DashboardGreetingCard 
          pageTitle="Partnership Dashboard"
          pageSubtitle="Here's what's happening with your partnership today"
          showDate={true}
          pageContext={{
            pageType: 'dashboard',
            keyMetrics: {
              primary: { value: '£1,247', label: 'Monthly Earnings', trend: '+23%' },
              secondary: { value: '18', label: 'Active Referrals' }
            }
          }}
        />
      </div>

      {/* ROW 2: App Plan Micro Chat (8 cols) + Quick Stats Summary (4 cols) */}
      <div className="row-2a">
        <AppPlanMicroChat 
          onNavigateToFullBuilder={() => window.location.href = '/partner/app-plan-generator'}
        />
      </div>
      
      <div className="row-2b">
        <Card className={useImplementation(
          'useUnifiedThemeSystem',
          // NEW: Use theme opacity backgrounds
          `backdrop-blur-xl border-orange-500/20 h-full ${theme.backgrounds.opacity.blackHeavy}`,
          // OLD: Original classes (fallback for safety)
          'bg-black/60 backdrop-blur-xl border-orange-500/20 h-full'
        )}>
          <CardContent className="p-4 h-full flex flex-col justify-center">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-orange-400">Quick Overview</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-lg font-bold text-white">£{stats.totalEarnings.toLocaleString()}</div>
                  <div className="text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.conversionRate}%</div>
                  <div className="text-gray-400">Rate</div>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 text-xs">+12% Growth</Badge>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* ROW 3: Stats Grid - 4 Equal Columns */}
      <div className="row-3-cards">
        <StatsGrid stats={stats} />
      </div>

      {/* ROW 4: Premium Partner Advancement & Leaderboard - Full Width */}
      <div className="row-4">
        <PartnerAdvancement stats={stats} />
      </div>

      {/* ROW 5: Training Hub (Left) + Client Management (Right) */}
      <div className="row-5-container">
        <div className="row-5a">
          <TrainingHub />
        </div>
        
        <div className="row-5b">
          <ClientManagement />
        </div>
      </div>

      {/* ROW 6: Support Center - Full Width */}
      <div className="row-6">
        <SupportCenter />
      </div>
      </div>
    </PartnershipLayout>
  );
};

export default PartnerDashboard; 
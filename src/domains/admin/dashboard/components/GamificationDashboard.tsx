/**
 * Gamification Dashboard - XP Hub with Beautiful Analytics
 *
 * Complete XP tracking dashboard with dark theme and glassmorphism
 * PHASE 4 POLISH - All enhancements implemented
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Sparkles, TrendingUp, Award, Flame, Clock, Target, Zap, Trophy, ShoppingCart } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { xpAnalyticsService } from '@/domains/lifelock/analytics/services/xpAnalyticsService';
import type { XPAnalyticsData } from '@/domains/lifelock/analytics/types/xpAnalytics.types';
import { UnifiedTopNav } from '@/domains/lifelock/1-daily/_shared/components/UnifiedTopNav';
import { DayProgressPill } from '@/domains/lifelock/1-daily/_shared/components/DayProgressPill';
import { XPPill } from '@/domains/lifelock/1-daily/_shared/components/XPPill';
import { MonthlyDatePickerModalV2 } from '@/domains/lifelock/1-daily/_shared/components/MonthlyDatePickerModalV2';
import { TodayProgressCard } from '@/domains/lifelock/analytics/ui/components/today/TodayProgressCard';
import { WeeklySummaryCard } from '@/domains/lifelock/analytics/ui/components/weekly/WeeklySummaryCard';
import { MonthlySummaryCard } from '@/domains/lifelock/analytics/ui/components/monthly/MonthlySummaryCard';
import { HistoryWeeklySummary } from './HistoryWeeklySummary';
import { XPTimeline } from './XPTimeline';
import { MiniWeeklyContext } from './MiniWeeklyContext';
import { MiniStreakIndicator } from './MiniStreakIndicator';
import { CategoryBreakdownCard } from '@/domains/lifelock/analytics/ui/components/categories/CategoryBreakdownCard';
import { PersonalBestsCard } from '@/domains/lifelock/analytics/ui/components/records/PersonalBestsCard';
import { StreakCard } from '@/domains/lifelock/analytics/ui/components/records/StreakCard';
import { TrendChartCard } from '@/domains/lifelock/analytics/ui/components/trends/TrendChartCard';
import { PeakProductivityCard } from '@/domains/lifelock/analytics/ui/components/productivity/PeakProductivityCard';
import { RecentAchievementsCard } from '@/domains/lifelock/analytics/ui/components/achievements/RecentAchievementsCard';
import { XPBottomNav } from '@/domains/lifelock/analytics/ui/pages/XPBottomNav';
import { GridMoreMenu } from '@/components/GridMoreMenu';
import { RewardCatalog } from '@/domains/xp-store/1-storefront/ui/components/RewardCatalog';
import { XPStoreProvider } from '@/domains/xp-store/_shared/core/XPStoreContext';
import { AllAchievementsGrid } from './AllAchievementsGrid';
import { LevelProgressCard } from './LevelProgressCard';
import { StoreManagementPanel } from './StoreManagementPanel';
import { useAdminCheck } from '@/domains/admin/hooks/useAdminCheck';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

// XP Hub Navigation Tabs
const XP_HUB_TABS = [
  { id: 'dashboard', title: 'Dashboard', icon: TrendingUp },
  { id: 'store', title: 'Store', icon: ShoppingCart },
  { id: 'history', title: 'History', icon: Clock },
  { id: 'achievements', title: 'Achievements', icon: Trophy },
];

type XPHubTab = typeof XP_HUB_TABS[number]['id'];

interface GamificationDashboardProps {
  className?: string;
  compact?: boolean;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  className,
  compact = false
}) => {
  const { user } = useUser();
  const { isAdmin } = useAdminCheck();
  const [analytics, setAnalytics] = useState<XPAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<XPHubTab>('dashboard');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [storeManagementOpen, setStoreManagementOpen] = useState(false);

  const fetchAnalytics = async (showRefreshLoading = false) => {
    console.log('fetchAnalytics called, user:', user?.id);

    if (!user?.id) {
      console.log('No user ID, skipping fetch');
      return;
    }

    try {
      if (showRefreshLoading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Calling xpAnalyticsService.getAnalytics...');
      const startTime = Date.now();

      const data = await xpAnalyticsService.getAnalytics(user.id);

      console.log('Analytics data loaded in ' + (Date.now() - startTime) + 'ms:', data);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching XP analytics:', err);
      setError('Failed to load analytics data: ' + (err as Error).message);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleTabChange = (index: number | null) => {
    // More button clicked - open grid menu
    if (index === null) {
      setMoreMenuOpen(true);
      return;
    }
    const tab = XP_HUB_TABS[index];
    setActiveTab(tab.id as XPHubTab);
  };

  // Purchase handler for store
  const handlePurchase = (rewardId: string) => {
    console.log('Purchase requested:', rewardId);
    // TODO: Implement purchase flow
  };

  // Calculate day progress - use the pre-calculated progress from analytics
  const dayProgress = analytics?.today?.progress ?? 0;
  const totalXP = analytics?.today?.total ?? 0;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-black pb-32">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-white/5 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-64 animate-pulse" />
        </div>

        {/* Today Card Skeleton */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-4 animate-pulse">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/5 rounded-xl p-4 h-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-32">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Analytics</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
          >
            Try Again
          </button>
        </motion.div>

        {/* Still show more menu for navigation */}
        <GridMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
      </div>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pb-32">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No XP Data Yet</h3>
          <p className="text-gray-400 mb-6">Start completing tasks to earn XP and track your progress!</p>
        </motion.div>

        {/* Still show more menu for navigation */}
        <GridMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-black pb-32 relative", className)}>
      {/* Unified Top Navigation - Same as LifeLog Daily */}
      <UnifiedTopNav
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        completionPercentage={dayProgress}
        activeTab="dashboard"
        totalXP={totalXP}
      />

      {/* Main Content - minimal padding */}
      <div className="relative px-3">

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* DASHBOARD TAB - Streamlined, Today-focused */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-4"
          >
            {/* Today's Progress - Hero Component */}
            <TodayProgressCard data={analytics.today} level={analytics.level} />

            {/* XP Sources - Where did today's XP come from? */}
            <CategoryBreakdownCard categories={analytics.today.categories} totalXP={analytics.today.total} />

            {/* Context Row - Weekly & Streak (Compact) */}
            <div className="grid grid-cols-2 gap-3">
              <MiniWeeklyContext data={analytics.week} />
              <MiniStreakIndicator
                data={analytics.streaks}
                onClick={() => setActiveTab('achievements')}
              />
            </div>
          </motion.div>
        )}

        {/* STORE TAB - XP Spending */}
        {activeTab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-4"
          >
            {/* XP Balance Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Available XP</p>
                  <p className="text-4xl font-bold text-white">{analytics.level.totalXP.toLocaleString()}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Spend your hard-earned XP on rewards</p>
            </div>

            {/* Admin Button */}
            {isAdmin && (
              <div className="flex justify-end">
                <Dialog open={storeManagementOpen} onOpenChange={setStoreManagementOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Store Management</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Add, edit, and manage XP store rewards
                      </DialogDescription>
                    </DialogHeader>
                    <StoreManagementPanel onRewardChange={() => {
                      // Refresh rewards when changed
                      window.location.reload();
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Reward Catalog - Integrated with dark theme wrapper */}
            {user?.id && (
              <XPStoreProvider userId={user.id}>
                <div className="reward-catalog-dark-theme">
                  <RewardCatalog onPurchase={handlePurchase} />
                </div>
              </XPStoreProvider>
            )}
          </motion.div>
        )}

        {/* HISTORY TAB - Time-based analytics */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-4"
          >
            {/* This Week Summary - Compact version at top */}
            <HistoryWeeklySummary data={analytics.week} />

            {/* Weekly Summary Card - Full detailed version */}
            <WeeklySummaryCard data={analytics.week} />

            {/* XP Timeline - Main timeline with daily history */}
            <XPTimeline limit={20} />

            {/* Monthly Summary - Simplified, no month/year labels */}
            <MonthlySummaryCard data={analytics.month} />

            {/* Trend Chart - 30-day trend analysis */}
            <TrendChartCard data={analytics.trend} />

            {/* Peak Productivity - Best hours analysis */}
            <PeakProductivityCard data={analytics.peakProductivity} />
          </motion.div>
        )}

        {/* ACHIEVEMENTS TAB - Gamification focused */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-4"
          >
            {/* Level Progress - Full Width */}
            <LevelProgressCard level={analytics.level} />

            {/* Streak Card - Full calendar heatmap */}
            <StreakCard data={analytics.streaks} />

            {/* Personal Bests - Full Width */}
            <PersonalBestsCard data={analytics.personalBests} />

            {/* All Achievements Grid - Full Width */}
            <AllAchievementsGrid
              achievements={analytics.achievements.recent}
              totalUnlocked={analytics.achievements.totalUnlocked}
              totalAvailable={analytics.achievements.totalAvailable}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <XPBottomNav
        tabs={XP_HUB_TABS}
        activeIndex={XP_HUB_TABS.findIndex(t => t.id === activeTab)}
        onChange={handleTabChange}
      />

      {/* Last Updated Footer */}
      <motion.div
        className="fixed bottom-24 left-0 right-0 text-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-gray-600">Updated {new Date(analytics.lastUpdated).toLocaleTimeString()}</p>
      </motion.div>

      {/* Grid More Menu */}
      <GridMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </div>
  );
};

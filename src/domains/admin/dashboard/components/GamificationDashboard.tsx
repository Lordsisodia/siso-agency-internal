/**
 * Gamification Dashboard - XP Hub with Beautiful Analytics
 *
 * Complete XP tracking dashboard with dark theme and glassmorphism
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Sparkles, TrendingUp, Award, Flame, Clock, Target, Zap } from 'lucide-react';
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
import { CategoryBreakdownCard } from '@/domains/lifelock/analytics/ui/components/categories/CategoryBreakdownCard';
import { PersonalBestsCard } from '@/domains/lifelock/analytics/ui/components/records/PersonalBestsCard';
import { StreakCard } from '@/domains/lifelock/analytics/ui/components/records/StreakCard';
import { TrendChartCard } from '@/domains/lifelock/analytics/ui/components/trends/TrendChartCard';
import { PeakProductivityCard } from '@/domains/lifelock/analytics/ui/components/productivity/PeakProductivityCard';
import { RecentAchievementsCard } from '@/domains/lifelock/analytics/ui/components/achievements/RecentAchievementsCard';
import { XPBottomNav } from '@/domains/lifelock/analytics/ui/pages/XPBottomNav';
import { GridMoreMenu } from '@/components/GridMoreMenu';

// XP Hub Navigation Tabs
const XP_HUB_TABS = [
  { id: 'dashboard', title: 'Dashboard', icon: TrendingUp },
  { id: 'store', title: 'XP Store', icon: Sparkles },
  { id: 'stats', title: 'Stats', icon: Award },
  { id: 'history', title: 'History', icon: Clock },
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
  const [analytics, setAnalytics] = useState<XPAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<XPHubTab>('dashboard');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchAnalytics = async (showRefreshLoading = false) => {
    if (!user?.id) return;

    try {
      if (showRefreshLoading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await xpAnalyticsService.getAnalytics(user.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching XP analytics:', err);
      setError('Failed to load analytics data');
    } finally {
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

  // Calculate day progress (using today's XP percentage of daily goal)
  const dailyGoal = 500;
  const dayProgress = analytics?.today ? Math.min(100, (analytics.today.total / dailyGoal) * 100) : 0;
  const totalXP = analytics?.today.total || 0;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 pb-32">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-white/5 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-64 animate-pulse" />
        </div>

        {/* Today Card Skeleton */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 rounded-3xl p-6 mb-4 animate-pulse">
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
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 pb-32">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Analytics</h3>
          <p className="text-gray-400 mb-6">{error || 'No data available'}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            Try Again
          </button>
        </motion.div>

        {/* Still show more menu for navigation */}
        <GridMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pb-32 relative", className)}>
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Unified Top Navigation - Same as LifeLog Daily */}
      <UnifiedTopNav
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        completionPercentage={dayProgress}
        activeTab="dashboard"
        totalXP={totalXP}
      />

      {/* Main Content - with top padding to account for fixed header */}
      <div className="relative p-4">

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-4"
          >
            {/* Today's Progress - Full Width */}
            <TodayProgressCard data={analytics.today} level={analytics.level} />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.week.average}</p>
                    <p className="text-xs text-gray-400">Weekly Avg</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.streaks.current}</p>
                    <p className="text-xs text-gray-400">Day Streak</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.trend.maximum}</p>
                    <p className="text-xs text-gray-400">Best Day</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.today.sessions}</p>
                    <p className="text-xs text-gray-400">Sessions</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Weekly & Monthly Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WeeklySummaryCard data={analytics.week} />
              <MonthlySummaryCard data={analytics.month} />
            </div>

            {/* Category & Records Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CategoryBreakdownCard categories={analytics.today.categories} totalXP={analytics.today.total} />
              <PersonalBestsCard data={analytics.personalBests} />
            </div>

            {/* Streaks & Achievements Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StreakCard data={analytics.streaks} />
              <RecentAchievementsCard
                achievements={analytics.achievements.recent}
                totalUnlocked={analytics.achievements.totalUnlocked}
                totalAvailable={analytics.achievements.totalAvailable}
                nextToUnlock={analytics.achievements.nextToUnlock}
              />
            </div>

            {/* Trend Chart - Full Width */}
            <TrendChartCard data={analytics.trend} />

            {/* Peak Productivity - Full Width */}
            <PeakProductivityCard data={analytics.peakProductivity} />
          </motion.div>
        )}

        {activeTab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">XP Store</h2>
              <p className="text-gray-400 mb-6">Coming Soon! Spend your hard-earned XP on rewards.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">{analytics.level.totalXP} XP Available</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Statistics</h2>
              <p className="text-gray-400">Coming Soon! Deep dive into your XP analytics.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
              <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">History</h2>
              <p className="text-gray-400">Coming Soon! View your complete XP history.</p>
            </div>
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

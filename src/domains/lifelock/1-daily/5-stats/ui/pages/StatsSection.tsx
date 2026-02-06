/**
 * Health Tracker Section - Consolidated Health Monitoring
 *
 * PHASE 5: Stats section renamed to Health
 * - Smoking + Water merged into "Stats" subtab
 * - Fitness and Nutrition remain separate subtabs
 *
 * Features:
 * - Stats (Smoking + Water) tracking
 * - Fitness/workout tracking
 * - Nutrition tracking (Photo, Meals, Macros)
 * - XP rewards for healthy habits
 * - Analytics and trends
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, CigaretteOff, Dumbbell, Apple, BarChart3 } from 'lucide-react';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { SmokingTracker } from '../components/SmokingTracker';
import { HomeWorkoutSection } from '@/domains/lifelock/1-daily/5-stats/features/wellness/ui/pages/HomeWorkoutSection';
import { DietSection } from '@/domains/lifelock/1-daily/5-stats/features/diet/ui/pages/DietSection';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { cn } from '@/lib/utils';

interface StatsSectionProps {
  selectedDate: Date;
  navigateDay?: (direction: 'prev' | 'next') => void;
  activeSubTab?: 'stats' | 'fitness' | 'nutrition';
}

type StatsTab = 'stats' | 'fitness' | 'nutrition';

interface TabConfig {
  id: StatsTab;
  label: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  activeColor: string;
  xpCategory: string;
  xp: number;
  accentColor: string;
}

const STATS_TABS: TabConfig[] = [
  {
    id: 'stats',
    label: 'Stats',
    title: 'Daily Stats',
    subtitle: 'Smoking & Water tracking',
    icon: BarChart3,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-emerald-400',
    activeColor: 'bg-emerald-500/20 text-emerald-400',
    xpCategory: 'stats',
    xp: 50,
    accentColor: 'bg-gradient-to-b from-emerald-500/40 via-green-500/40 to-emerald-600/40 shadow-emerald-500/10',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    title: 'Fitness Tracker',
    subtitle: 'Log your daily workouts',
    icon: Dumbbell,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-rose-400',
    activeColor: 'bg-rose-500/20 text-rose-400',
    xpCategory: 'fitness',
    xp: 30,
    accentColor: 'bg-gradient-to-b from-rose-500/40 via-orange-500/40 to-rose-600/40 shadow-rose-500/10',
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    title: 'Nutrition Tracking',
    subtitle: 'Photo • Meals • Macros',
    icon: Apple,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-amber-400',
    activeColor: 'bg-amber-500/20 text-amber-400',
    xpCategory: 'diet',
    xp: 65,
    accentColor: 'bg-gradient-to-b from-amber-500/40 via-orange-500/40 to-amber-600/40 shadow-amber-500/10',
  },
];

export const StatsSection: React.FC<StatsSectionProps> = ({
  selectedDate,
  navigateDay,
  activeSubTab = 'stats' // Default to merged stats tab
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // Debug logging
  

  // Get active tab config based on prop
  const activeTabConfig = useMemo(
    () => STATS_TABS.find((tab) => tab.id === activeSubTab) || STATS_TABS[0],
    [activeSubTab]
  );

  

  const ActiveIcon = activeTabConfig.icon;

  return (
    <div className="min-h-screen w-full bg-siso-bg relative overflow-x-hidden">
      <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
        {/* Header with icon, title, and XP - changes based on active tab */}
        <div className="px-3 py-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${activeTabConfig.iconBg} ${activeTabConfig.iconBorder} flex items-center justify-center flex-shrink-0`}>
                <ActiveIcon className={`h-7 w-7 ${activeTabConfig.iconColor}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-white tracking-tight">{activeTabConfig.title}</h1>
                <p className="text-sm text-white/60 mt-0.5">{activeTabConfig.subtitle}</p>
              </div>
            </div>
            <XPPill xp={activeTabConfig.xp} activeTab={activeTabConfig.xpCategory} />
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Content - each tab renders independently */}
      <div className="space-y-4 px-4 sm:px-6">
        {/* PHASE 5: Merged Stats tab shows both Smoking and Water */}
        {activeSubTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="stats-panel-stats"
            role="tabpanel"
            aria-labelledby="stats-tab-stats"
            tabIndex={0}
            className="space-y-4"
          >
            <SmokingTracker selectedDate={selectedDate} />
            <WaterTrackerCard selectedDate={selectedDate} userId={internalUserId} />
          </motion.div>
        )}

        {activeSubTab === 'fitness' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="stats-panel-fitness"
            role="tabpanel"
            aria-labelledby="stats-tab-fitness"
            tabIndex={0}
          >
            <HomeWorkoutSection selectedDate={selectedDate} />
          </motion.div>
        )}

        {activeSubTab === 'nutrition' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="stats-panel-nutrition"
            role="tabpanel"
            aria-labelledby="stats-tab-nutrition"
            tabIndex={0}
          >
            <DietSection selectedDate={selectedDate} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

StatsSection.displayName = 'StatsSection';

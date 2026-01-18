/**
 * Stats Tracker Section - Consolidated Stats Monitoring
 *
 * PHASE 4: Health tabs (Fitness, Nutrition) merged into Stats
 *
 * Features:
 * - Smoking cessation tracking
 * - Water intake tracking
 * - Fitness/workout tracking
 * - Nutrition tracking (Photo, Meals, Macros)
 * - XP rewards for healthy habits
 * - Analytics and trends
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, CigaretteOff, Dumbbell, Apple } from 'lucide-react';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';
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
  activeSubTab?: 'smoking' | 'water' | 'fitness' | 'nutrition';
}

type StatsTab = 'smoking' | 'water' | 'fitness' | 'nutrition';

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
    id: 'smoking',
    label: 'Smoking',
    title: 'Smoking Tracker',
    subtitle: 'Track your smoking cessation',
    icon: CigaretteOff,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-purple-400',
    activeColor: 'bg-purple-500/20 text-purple-400',
    xpCategory: 'smoking',
    xp: 50,
    accentColor: 'bg-gradient-to-b from-purple-500/40 via-pink-500/40 to-purple-600/40 shadow-purple-500/10',
  },
  {
    id: 'water',
    label: 'Water',
    title: 'Hydration',
    subtitle: 'Track your water intake',
    icon: Droplets,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-cyan-400',
    activeColor: 'bg-cyan-500/20 text-cyan-400',
    xpCategory: 'water',
    xp: 50,
    accentColor: 'bg-gradient-to-b from-cyan-500/40 via-blue-500/40 to-cyan-600/40 shadow-cyan-500/10',
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
    iconColor: 'text-green-400',
    activeColor: 'bg-green-500/20 text-green-400',
    xpCategory: 'diet',
    xp: 65,
    accentColor: 'bg-gradient-to-b from-green-500/40 via-emerald-500/40 to-green-600/40 shadow-green-500/10',
  },
];

export const StatsSection: React.FC<StatsSectionProps> = ({
  selectedDate,
  navigateDay,
  activeSubTab = 'smoking' // Default to smoking tab
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // Debug logging
  console.log('[StatsSection] Rendering with activeSubTab:', activeSubTab);

  // Get active tab config based on prop
  const activeTabConfig = useMemo(
    () => STATS_TABS.find((tab) => tab.id === activeSubTab) || STATS_TABS[0],
    [activeSubTab]
  );

  console.log('[StatsSection] Active tab config:', activeTabConfig);

  const ActiveIcon = activeTabConfig.icon;

  return (
    <div className="min-h-screen w-full pb-24 relative">
      {/* Header with icon, title, and XP - changes based on active tab */}
      <div className="px-5 py-5 border-b border-white/10">
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

      {/* Content - each tab renders independently */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {activeSubTab === 'smoking' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="stats-panel-smoking"
            role="tabpanel"
            aria-labelledby="stats-tab-smoking"
            tabIndex={0}
          >
            <SmokingTracker selectedDate={selectedDate} />
          </motion.div>
        )}

        {activeSubTab === 'water' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="stats-panel-water"
            role="tabpanel"
            aria-labelledby="stats-tab-water"
            tabIndex={0}
          >
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

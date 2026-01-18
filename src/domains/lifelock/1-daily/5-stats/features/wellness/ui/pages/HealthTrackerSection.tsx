/**
 * Health Tracker Section - Comprehensive Health Monitoring
 *
 * Features:
 * - Fitness/workout tracking
 * - Nutrition tracking (Photo, Meals, Macros)
 * - XP rewards for healthy habits
 *
 * PHASE 3 COMPLETE: Smoking and Water moved to Stats section
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Apple } from 'lucide-react';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';
import { HomeWorkoutSection } from './HomeWorkoutSection';
import { DietSection } from '@/domains/lifelock/1-daily/5-stats/features/diet/ui/pages/DietSection';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { cn } from '@/lib/utils';

interface HealthTrackerSectionProps {
  selectedDate: Date;
  navigateDay?: (direction: 'prev' | 'next') => void;
  activeSubTab?: 'fitness' | 'nutrition';
}

type HealthTab = 'fitness' | 'nutrition';

interface TabConfig {
  id: HealthTab;
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

const HEALTH_TABS: TabConfig[] = [
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
    accentColor: 'bg-gradient-to-b from-rose-500/60 via-orange-500/60 to-rose-600/60 shadow-rose-500/20',
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
    accentColor: 'bg-gradient-to-b from-green-500/60 via-emerald-500/60 to-green-600/60 shadow-green-500/20',
  },
];

export const HealthTrackerSection: React.FC<HealthTrackerSectionProps> = ({
  selectedDate,
  navigateDay,
  activeSubTab = 'fitness' // Default to fitness tab
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // Debug logging
  console.log('[HealthTrackerSection] Rendering with activeSubTab:', activeSubTab);

  // Get active tab config based on prop
  const activeTabConfig = useMemo(
    () => HEALTH_TABS.find((tab) => tab.id === activeSubTab) || HEALTH_TABS[0],
    [activeSubTab]
  );

  console.log('[HealthTrackerSection] Active tab config:', activeTabConfig);

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

      {/* Content - each tab renders independently like Diet section */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {activeSubTab === 'fitness' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="health-panel-fitness"
            role="tabpanel"
            aria-labelledby="health-tab-fitness"
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
            id="health-panel-nutrition"
            role="tabpanel"
            aria-labelledby="health-tab-nutrition"
            tabIndex={0}
          >
            <DietSection selectedDate={selectedDate} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

HealthTrackerSection.displayName = 'HealthTrackerSection';

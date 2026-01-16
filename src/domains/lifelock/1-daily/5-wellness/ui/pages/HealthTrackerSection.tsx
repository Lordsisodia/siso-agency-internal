/**
 * Health Tracker Section - Comprehensive Health Monitoring
 *
 * Features:
 * - Water intake tracking
 * - Fitness/workout tracking
 * - Smoking cessation tracking
 * - XP rewards for healthy habits
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Dumbbell, Cigarette } from 'lucide-react';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { SmokingTracker } from '../components/SmokingTracker';
import { HomeWorkoutSection } from './HomeWorkoutSection';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/supabase-clerk';
import { cn } from '@/lib/utils';

interface HealthTrackerSectionProps {
  selectedDate: Date;
  navigateDay?: (direction: 'prev' | 'next') => void;
  activeSubTab?: 'water' | 'fitness' | 'smoking';
}

type HealthTab = 'water' | 'fitness' | 'smoking';

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
    id: 'water',
    label: 'Water',
    title: 'Hydration',
    subtitle: 'Track your water intake',
    icon: Droplets,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-blue-400',
    activeColor: 'bg-blue-500/20 text-blue-400',
    xpCategory: 'water',
    xp: 20,
    accentColor: 'bg-gradient-to-b from-blue-500/60 via-cyan-500/60 to-blue-600/60 shadow-blue-500/20',
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
    accentColor: 'bg-gradient-to-b from-rose-500/60 via-orange-500/60 to-rose-600/60 shadow-rose-500/20',
  },
  {
    id: 'smoking',
    label: 'Smoking',
    title: 'Smoking',
    subtitle: 'Track your smoking',
    icon: Cigarette,
    iconBg: 'bg-white/5',
    iconBorder: 'border-white/10',
    iconColor: 'text-purple-400',
    activeColor: 'bg-purple-500/20 text-purple-400',
    xpCategory: 'smoking',
    xp: 25,
    accentColor: 'bg-gradient-to-b from-purple-500/60 via-pink-500/60 to-purple-600/60 shadow-purple-500/20',
  },
];

export const HealthTrackerSection: React.FC<HealthTrackerSectionProps> = ({
  selectedDate,
  navigateDay,
  activeSubTab = 'water' // Default to water tab
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // Get active tab config based on prop
  const activeTabConfig = useMemo(
    () => HEALTH_TABS.find((tab) => tab.id === activeSubTab) || HEALTH_TABS[0],
    [activeSubTab]
  );

  const ActiveIcon = activeTabConfig.icon;

  return (
    <div className="min-h-screen bg-[#121212] pb-24 relative">
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
        {activeSubTab === 'water' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="health-panel-water"
            role="tabpanel"
            aria-labelledby="health-tab-water"
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
            id="health-panel-fitness"
            role="tabpanel"
            aria-labelledby="health-tab-fitness"
            tabIndex={0}
          >
            <HomeWorkoutSection selectedDate={selectedDate} />
          </motion.div>
        )}

        {activeSubTab === 'smoking' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="health-panel-smoking"
            role="tabpanel"
            aria-labelledby="health-tab-smoking"
            tabIndex={0}
          >
            <SmokingTracker selectedDate={selectedDate} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

HealthTrackerSection.displayName = 'HealthTrackerSection';

/**
 * WeeklyHealthSection - Health Pill Container
 *
 * Manages 3 sub-tabs:
 * 1. Wellness - Workouts, energy, nutrition overview
 * 2. Habits - Habit grid/streaks tracking
 * 3. Recovery - Sleep/rest metrics and analysis
 */

import React, { useState } from 'react';
import { Heart, Grid3X3, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WeeklyWellnessSection } from '../../../wellness/WeeklyWellnessSection';
import type { WellnessData } from '../../../_shared/types';

export type HealthSubTab = 'wellness' | 'habits' | 'recovery';

interface WeeklyHealthSectionProps {
  wellnessData: WellnessData;
  onSubTabChange?: (subTab: HealthSubTab) => void;
}

interface SubTabConfig {
  id: HealthSubTab;
  label: string;
  icon: React.ElementType;
  color: string;
}

const subTabs: SubTabConfig[] = [
  {
    id: 'wellness',
    label: 'Wellness',
    icon: Heart,
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: Grid3X3,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    icon: Moon,
    color: 'from-indigo-500 to-blue-500',
  },
];

// Habits Sub-Section Component - Detailed habit grid/streaks
const HabitsSection: React.FC<{ wellnessData: WellnessData }> = ({ wellnessData }) => {
  const { healthHabits } = wellnessData;

  const habitConfigs = [
    { key: 'morningRoutine', label: 'Morning Routine', color: 'from-orange-400 to-amber-400', icon: '🌅' },
    { key: 'checkout', label: 'Daily Checkout', color: 'from-purple-400 to-violet-400', icon: '✅' },
    { key: 'water', label: 'Hydration', color: 'from-sky-400 to-blue-400', icon: '💧' },
    { key: 'meditation', label: 'Meditation', color: 'from-amber-400 to-yellow-400', icon: '🧘' },
    { key: 'sleep', label: 'Sleep Quality', color: 'from-indigo-400 to-purple-400', icon: '😴' },
  ] as const;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 p-6 shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-emerald-500/20 p-2">
            <Grid3X3 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Habit Streaks</h2>
            <p className="text-sm text-slate-400">Track your daily habit consistency</p>
          </div>
        </div>

        {/* Habit Grid */}
        <div className="space-y-4">
          {habitConfigs.map((habit) => {
            const values = healthHabits[habit.key as keyof typeof healthHabits] as boolean[];
            const streak = values.reduce((acc, completed, idx) => {
              if (idx === 0) return completed ? 1 : 0;
              return completed && values[idx - 1] ? acc + 1 : completed ? 1 : acc;
            }, 0);
            const totalCompleted = values.filter(Boolean).length;

            return (
              <motion.div
                key={habit.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{habit.icon}</span>
                    <div>
                      <h3 className="font-medium text-white">{habit.label}</h3>
                      <p className="text-xs text-slate-400">
                        {totalCompleted}/7 days · Current streak: {streak}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    totalCompleted >= 5
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : totalCompleted >= 3
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  )}>
                    {totalCompleted >= 5 ? 'Strong' : totalCompleted >= 3 ? 'Good' : 'Needs Work'}
                  </div>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {values.map((completed, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-2 transition-all',
                        completed
                          ? cn('border-transparent bg-gradient-to-br', habit.color)
                          : 'border-white/10 bg-white/5'
                      )}
                    >
                      <span className="text-[10px] uppercase text-white/60">{dayLabels[idx]}</span>
                      <div className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold',
                        completed ? 'bg-white/20 text-white' : 'text-white/30'
                      )}>
                        {completed ? '✓' : '–'}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {Object.values(healthHabits).flat().filter(Boolean).length}
            </p>
            <p className="text-xs text-slate-400">Total Check-ins</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(Object.values(healthHabits).flat().filter(Boolean).length / 35 * 100)}%
            </p>
            <p className="text-xs text-slate-400">Overall Rate</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {habitConfigs.filter(h => (healthHabits[h.key as keyof typeof healthHabits] as boolean[]).filter(Boolean).length >= 5).length}
            </p>
            <p className="text-xs text-slate-400">Strong Habits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recovery Sub-Section Component - Sleep/rest metrics
const RecoverySection: React.FC<{ wellnessData: WellnessData }> = ({ wellnessData }) => {
  const { energySleep, workouts } = wellnessData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock sleep data for the week (would come from actual data)
  const sleepData = [
    { hours: 7.5, quality: 8 },
    { hours: 7, quality: 7 },
    { hours: 6.5, quality: 6 },
    { hours: 8, quality: 9 },
    { hours: 6, quality: 5 },
    { hours: 7, quality: 7 },
    { hours: 8, quality: 8 },
  ];

  const getSleepColor = (hours: number) => {
    if (hours >= 7.5) return 'from-emerald-400 to-green-400';
    if (hours >= 6.5) return 'from-amber-400 to-yellow-400';
    return 'from-rose-400 to-red-400';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-emerald-400';
    if (quality >= 6) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 p-6 shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-indigo-500/20 p-2">
            <Moon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recovery & Sleep</h2>
            <p className="text-sm text-slate-400">Sleep quality and rest metrics</p>
          </div>
        </div>

        {/* Sleep Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Sleep</p>
            <p className="text-2xl font-bold text-white mt-1">{energySleep.averageSleep.toFixed(1)}h</p>
            <p className="text-xs text-slate-500">Target: 7-8h</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Sleep Quality</p>
            <p className="text-2xl font-bold text-white mt-1">{energySleep.sleepQuality}/10</p>
            <p className="text-xs text-slate-500">Self-reported</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Energy Score</p>
            <p className="text-2xl font-bold text-white mt-1">{energySleep.averageEnergy.toFixed(1)}</p>
            <p className="text-xs text-slate-500">Out of 10</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Rest Days</p>
            <p className="text-2xl font-bold text-white mt-1">{7 - workouts.total}</p>
            <p className="text-xs text-slate-500">From workouts</p>
          </div>
        </div>

        {/* Daily Sleep Breakdown */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white mb-4">Daily Sleep Breakdown</h3>
          <div className="space-y-3">
            {sleepData.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="w-10 text-xs text-slate-400">{days[idx]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{day.hours}h</span>
                    <span className={cn('text-xs', getQualityColor(day.quality))}>
                      Quality: {day.quality}/10
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (day.hours / 10) * 100)}%` }}
                      transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
                      className={cn('h-full rounded-full bg-gradient-to-r', getSleepColor(day.hours))}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recovery Tips */}
        <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
          <h3 className="text-sm font-medium text-indigo-200 mb-2">Recovery Insights</h3>
          <ul className="space-y-2 text-sm text-indigo-100/80">
            {energySleep.averageSleep < 7 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-400">⚠</span>
                <span>Your average sleep is below 7 hours. Consider setting a stricter bedtime.</span>
              </li>
            )}
            {energySleep.averageSleep >= 7 && (
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Great job maintaining healthy sleep duration!</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-400">💡</span>
              <span>Aim for consistent wake times to improve sleep quality.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Sub-Tab Navigation Component
const HealthSubNav: React.FC<{
  activeTab: HealthSubTab;
  onChange: (tab: HealthSubTab) => void;
}> = ({ activeTab, onChange }) => {
  return (
    <div className="sticky top-0 z-30 bg-siso-bg/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="healthActiveTab"
                    className={cn(
                      'absolute inset-0 rounded-xl bg-gradient-to-r',
                      tab.color
                    )}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const WeeklyHealthSection: React.FC<WeeklyHealthSectionProps> = ({
  wellnessData,
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<HealthSubTab>('wellness');

  const handleSubTabChange = (tab: HealthSubTab) => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  return (
    <div className="relative min-h-screen pb-28">
      <HealthSubNav activeTab={activeSubTab} onChange={handleSubTabChange} />

      <div className="pt-4">
        {activeSubTab === 'wellness' && (
          <WeeklyWellnessSection wellnessData={wellnessData} />
        )}
        {activeSubTab === 'habits' && (
          <HabitsSection wellnessData={wellnessData} />
        )}
        {activeSubTab === 'recovery' && (
          <RecoverySection wellnessData={wellnessData} />
        )}
      </div>
    </div>
  );
};

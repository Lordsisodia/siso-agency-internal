/**
 * WeeklyReviewSection - Review Pill Container
 *
 * Manages 3 sub-tabs:
 * 1. Overview - Weekly snapshot and summary
 * 2. Wins - Extracted wins from checkout
 * 3. Problems - Extracted problems/red flags from checkout
 */

import React, { useState } from 'react';
import { BarChart3, Trophy, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WeeklyOverviewSection } from '../../../overview/WeeklyOverviewSection';
import type { WeeklyData, InsightsData } from '../../../_shared/types';

export type ReviewSubTab = 'overview' | 'wins' | 'problems';

interface WeeklyReviewSectionProps {
  weeklyData: WeeklyData;
  insightsData: InsightsData;
  onNavigateToDaily?: () => void;
  onSubTabChange?: (subTab: ReviewSubTab) => void;
}

interface SubTabConfig {
  id: ReviewSubTab;
  label: string;
  icon: React.ElementType;
  color: string;
}

const subTabs: SubTabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'wins',
    label: 'Wins',
    icon: Trophy,
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'problems',
    label: 'Problems',
    icon: AlertTriangle,
    color: 'from-rose-500 to-orange-500',
  },
];

// Wins Sub-Section Component
const WinsSection: React.FC<{ wins: string[] }> = ({ wins }) => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 p-6 shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-emerald-500/20 p-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Weekly Wins</h2>
            <p className="text-sm text-slate-400">Celebrate what went well this week</p>
          </div>
        </div>

        {wins.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-white/20 mb-3" />
            <p className="text-sm text-slate-400">No wins captured yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Log your wins during daily checkout to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {wins.map((win, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                  {idx + 1}
                </span>
                <p className="text-sm text-emerald-100">{win}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Problems Sub-Section Component
const ProblemsSection: React.FC<{ problems: string[] }> = ({ problems }) => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 p-6 shadow-2xl shadow-rose-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-rose-500/20 p-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Problems & Red Flags</h2>
            <p className="text-sm text-slate-400">Identify what broke down to fix next week</p>
          </div>
        </div>

        {problems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-white/20 mb-3" />
            <p className="text-sm text-slate-400">No problems logged yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Capture issues during daily checkout to track patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-sm">
                  {idx + 1}
                </span>
                <p className="text-sm text-rose-100">{problem}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-200/80">
            <strong>Tip:</strong> Review these problems before setting next week&apos;s goals.
            Look for patterns across multiple weeks.
          </p>
        </div>
      </div>
    </div>
  );
};

// Sub-Tab Navigation Component
const ReviewSubNav: React.FC<{
  activeTab: ReviewSubTab;
  onChange: (tab: ReviewSubTab) => void;
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
                    layoutId="reviewActiveTab"
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

export const WeeklyReviewSection: React.FC<WeeklyReviewSectionProps> = ({
  weeklyData,
  insightsData,
  onNavigateToDaily,
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ReviewSubTab>('overview');

  const handleSubTabChange = (tab: ReviewSubTab) => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  return (
    <div className="relative min-h-screen pb-28">
      <ReviewSubNav activeTab={activeSubTab} onChange={handleSubTabChange} />

      <div className="pt-4">
        {activeSubTab === 'overview' && (
          <WeeklyOverviewSection
            weeklyData={weeklyData}
            onNavigateToDaily={onNavigateToDaily}
          />
        )}
        {activeSubTab === 'wins' && <WinsSection wins={insightsData.wins} />}
        {activeSubTab === 'problems' && <ProblemsSection problems={insightsData.problems} />}
      </div>
    </div>
  );
};

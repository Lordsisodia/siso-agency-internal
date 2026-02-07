/**
 * WeeklyWorkSection - Work Pill Container
 *
 * Manages 3 sub-tabs:
 * 1. Productivity - Deep work, light tasks, completion rates
 * 2. Goals - Weekly goal tracking and management
 * 3. Time Analysis - Time audit, utilization, sleep/wake patterns
 */

import React, { useState } from 'react';
import { Briefcase, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WeeklyProductivitySection } from '../../../productivity/WeeklyProductivitySection';
import { WeeklyGoalsSection } from '../../../goals/WeeklyGoalsSection';
import { WeeklyTimeAnalysisSection } from '../../../time-analysis/WeeklyTimeAnalysisSection';
import type { ProductivityData, TimeAnalysisData } from '../../../_shared/types';

export type WorkSubTab = 'productivity' | 'goals' | 'time-analysis';

interface WeeklyWorkSectionProps {
  selectedWeek: Date;
  productivityData: ProductivityData;
  timeData: TimeAnalysisData;
  onSubTabChange?: (subTab: WorkSubTab) => void;
}

interface SubTabConfig {
  id: WorkSubTab;
  label: string;
  icon: React.ElementType;
  color: string;
}

const subTabs: SubTabConfig[] = [
  {
    id: 'productivity',
    label: 'Productivity',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'time-analysis',
    label: 'Time Analysis',
    icon: Clock,
    color: 'from-amber-500 to-orange-500',
  },
];

// Sub-Tab Navigation Component
const WorkSubNav: React.FC<{
  activeTab: WorkSubTab;
  onChange: (tab: WorkSubTab) => void;
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
                    layoutId="workActiveTab"
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

export const WeeklyWorkSection: React.FC<WeeklyWorkSectionProps> = ({
  selectedWeek,
  productivityData,
  timeData,
  onSubTabChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WorkSubTab>('productivity');

  const handleSubTabChange = (tab: WorkSubTab) => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  return (
    <div className="relative min-h-screen pb-28">
      <WorkSubNav activeTab={activeSubTab} onChange={handleSubTabChange} />

      <div className="pt-4">
        {activeSubTab === 'productivity' && (
          <WeeklyProductivitySection productivityData={productivityData} />
        )}
        {activeSubTab === 'goals' && (
          <WeeklyGoalsSection selectedWeek={selectedWeek} />
        )}
        {activeSubTab === 'time-analysis' && (
          <WeeklyTimeAnalysisSection timeData={timeData} />
        )}
      </div>
    </div>
  );
};

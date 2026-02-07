/**
 * Weekly Section Sub-Navigation Component (iOS-Style Segmented Control)
 *
 * Clean horizontal segmented control for weekly sections with multiple sub-tabs
 * Used by Review, Work, and Health pills in the Weekly view
 *
 * Features:
 * - iOS-style segmented control with smooth color transitions
 * - Active tab fills with gradient color based on theme
 * - Minimal design with no borders
 * - Color coding: Review (blue/cyan), Work (indigo/blue), Health (emerald/teal)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeeklySubTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface WeeklySectionSubNavProps {
  tabs: WeeklySubTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  theme: 'review' | 'work' | 'health';
}

// Theme-specific color configurations
const THEME_COLORS: Record<
  'review' | 'work' | 'health',
  {
    activeText: string;
    activeBg: string;
    gradient: string;
    glow: string;
  }
> = {
  review: {
    activeText: 'text-blue-400',
    activeBg: 'bg-blue-400/20',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  work: {
    activeText: 'text-indigo-400',
    activeBg: 'bg-indigo-400/20',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'shadow-indigo-500/20',
  },
  health: {
    activeText: 'text-emerald-400',
    activeBg: 'bg-emerald-400/20',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
};

export const WeeklySectionSubNav: React.FC<WeeklySectionSubNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
  theme,
}) => {
  if (!tabs || tabs.length <= 1) return null;

  const colors = THEME_COLORS[theme];
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const tabWidth = 100 / tabs.length;

  return (
    <div className="px-4 py-3 overflow-x-hidden">
      <div className="relative">
        {/* Main navigation container */}
        <div className="flex items-center gap-2 overflow-x-hidden">
          <div className="flex-1 bg-white/5 rounded-full p-1 overflow-x-hidden relative">
            {/* Sliding gradient background for active tab */}
            <motion.div
              className={cn(
                'absolute top-1 bottom-1 rounded-full',
                colors.activeBg
              )}
              initial={false}
              animate={{
                left: `${activeIndex * tabWidth}%`,
                width: `${tabWidth}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 35,
              }}
            />

            {/* Tab buttons */}
            <div className="relative flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2',
                      'py-2 px-3 rounded-full',
                      'transition-all duration-200',
                      'text-sm font-medium whitespace-nowrap',
                      'relative z-10',
                      isActive
                        ? colors.activeText
                        : 'text-gray-400 hover:text-gray-300'
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive && 'text-current'
                        )}
                      />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySectionSubNav;

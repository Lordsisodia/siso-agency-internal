/**
 * Section Sub-Navigation Component (iOS-Style Segmented Control)
 *
 * Clean horizontal segmented control for sections with multiple sub-tabs
 * Used by Timebox (Timebox, Morning, Checkout) and Tasks (Today, Light Work, Deep Work)
 *
 * Features:
 * - iOS-style segmented control with smooth color transitions
 * - Active tab fills with gradient color
 * - Minimal design with no borders
 * - Color changes based on active sub-tab
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavSubSection } from '@/services/shared/navigation-config';
import { cn } from '@/lib/utils';

interface SectionSubNavProps {
  subSections: NavSubSection[];
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  activeColor?: string;
  activeBgColor?: string;
}

// Sub-tab specific colors - each sub-tab has its own color
const SUBTAB_COLORS: Record<string, { color: string; bg: string; gradient: string }> = {
  'morning': {
    color: 'text-orange-400',
    bg: 'bg-orange-400/20',
    gradient: 'from-orange-500 to-amber-400'
  },
  'timebox': {
    color: 'text-sky-400',
    bg: 'bg-sky-400/20',
    gradient: 'from-indigo-500 to-cyan-400'
  },
  'checkout': {
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
    gradient: 'from-purple-500 to-pink-400'
  },
  'tasks': {
    color: 'text-amber-400',
    bg: 'bg-amber-400/20',
    gradient: 'from-amber-500 to-yellow-400'
  },
  'light-work': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/20',
    gradient: 'from-emerald-500 to-teal-400'
  },
  'deep-work': {
    color: 'text-blue-400',
    bg: 'bg-blue-400/20',
    gradient: 'from-blue-500 to-cyan-400'
  }
};

export const SectionSubNav: React.FC<SectionSubNavProps> = ({
  subSections,
  activeSubTab,
  onSubTabChange,
  activeColor,
  activeBgColor
}) => {
  if (!subSections || subSections.length <= 1) return null;

  // Get colors for the active sub-tab
  const activeSubTabColors = SUBTAB_COLORS[activeSubTab] || {
    color: activeColor || 'text-amber-400',
    bg: activeBgColor || 'bg-amber-400/20',
    gradient: 'from-amber-500 to-yellow-400'
  };

  // Calculate position and width of active indicator
  const activeIndex = subSections.findIndex(s => s.id === activeSubTab);
  const tabWidth = 100 / subSections.length; // Equal width for each tab

  return (
    <div className="px-4 py-3">
      <div className="relative bg-white/5 rounded-full p-1">
        {/* Sliding gradient background for active tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            className={cn(
              "absolute top-1 bottom-1 rounded-full",
              activeSubTabColors.bg
            )}
            initial={false}
            animate={{
              left: `${activeIndex * tabWidth}%`,
              width: `${tabWidth}%`
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35
            }}
          />
        </AnimatePresence>

        {/* Tab buttons */}
        <div className="relative flex">
          {subSections.map((sub, index) => {
            const isActive = activeSubTab === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => onSubTabChange(sub.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "py-2 px-3 rounded-full",
                  "transition-all duration-200",
                  "text-sm font-medium whitespace-nowrap",
                  isActive
                    ? activeSubTabColors.color
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <sub.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive && "bg-gradient-to-br bg-clip-text"
                )} style={isActive ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` } : {}} />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

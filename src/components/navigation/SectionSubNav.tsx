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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MoreVertical } from 'lucide-react';
import { NavSubSection } from '@/services/shared/navigation-config';
import { cn } from '@/lib/utils';
import { useLongPress } from '@/lib/hooks/useLongPress';
import { miniCelebrate } from '@/lib/utils/confetti';

interface SectionSubNavProps {
  subSections: NavSubSection[];
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  activeColor?: string;
  activeBgColor?: string;
  completedSubTabs?: string[]; // Array of completed sub-tab IDs
  onToggleComplete?: (subTab: string) => void; // Optional handler for toggling completion
  completionPercentages?: Record<string, number>; // Completion percentage for each subtab
  onBulkAction?: (action: 'markAllComplete' | 'markAllIncomplete') => void; // Bulk action handler
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
  },
  'water': {
    color: 'text-blue-400',
    bg: 'bg-blue-400/20',
    gradient: 'from-blue-500 to-cyan-400'
  },
  'fitness': {
    color: 'text-rose-400',
    bg: 'bg-rose-400/20',
    gradient: 'from-rose-500 to-pink-400'
  },
  'smoking': {
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
    gradient: 'from-purple-500 to-pink-400'
  },
  'photo': {
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    gradient: 'from-green-500 to-emerald-400'
  },
  'meals': {
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    gradient: 'from-green-500 to-emerald-400'
  },
  'macros': {
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    gradient: 'from-green-500 to-emerald-400'
  }
};

export const SectionSubNav: React.FC<SectionSubNavProps> = ({
  subSections,
  activeSubTab,
  onSubTabChange,
  activeColor,
  activeBgColor,
  completedSubTabs = [],
  onToggleComplete,
  completionPercentages = {},
  onBulkAction
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);

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
    <div className="px-4 py-3 overflow-x-hidden">
      <div className="relative">
        {/* Bulk actions menu */}
        {onBulkAction && (
          <div className="absolute -top-12 right-0 z-50">
            <AnimatePresence>
              {showBulkMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[200px]"
                >
                  <button
                    onClick={() => {
                      onBulkAction('markAllComplete');
                      setShowBulkMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Mark All Complete
                  </button>
                  <button
                    onClick={() => {
                      onBulkAction('markAllIncomplete');
                      setShowBulkMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    Mark All Incomplete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-hidden">
          {/* Main navigation */}
          <div className="flex-1 bg-white/5 rounded-full p-1 overflow-x-hidden">
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
                const isCompleted = completedSubTabs.includes(sub.id);
                const completionPercentage = completionPercentages[sub.id];
                const wasJustCompleted = React.useRef(false);

                // Long-press handler for mobile
                const longPress = useLongPress({
                  onLongPress: () => {
                    if (onToggleComplete) {
                      const newCompletedState = !isCompleted;

                      // Trigger confetti if marking as complete
                      if (newCompletedState && !wasJustCompleted.current) {
                        miniCelebrate();
                        wasJustCompleted.current = true;
                        setTimeout(() => {
                          wasJustCompleted.current = false;
                        }, 1000);
                      }

                      onToggleComplete(sub.id);
                    }
                  },
                  ms: 500,
                });

                return (
                  <button
                    key={sub.id}
                    onClick={() => onSubTabChange(sub.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      // Right-click to toggle completion
                      if (onToggleComplete) {
                        const newCompletedState = !isCompleted;

                        // Trigger confetti if marking as complete
                        if (newCompletedState && !wasJustCompleted.current) {
                          miniCelebrate();
                          wasJustCompleted.current = true;
                          setTimeout(() => {
                            wasJustCompleted.current = false;
                          }, 1000);
                        }

                        onToggleComplete(sub.id);
                      }
                    }}
                    {...longPress}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2",
                      "py-2 px-3 rounded-full",
                      "transition-all duration-200",
                      "text-sm font-medium whitespace-nowrap",
                      "relative group",
                      isActive
                        ? activeSubTabColors.color
                        : "text-gray-400 hover:text-gray-300"
                    )}
                  >
                    <sub.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive && "bg-gradient-to-br bg-clip-text"
                    )} style={isActive ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` } : {}} />
                    <span className="relative">
                      {sub.name}
                      {/* Completion percentage badge */}
                      {completionPercentage !== undefined && completionPercentage > 0 && !isCompleted && (
                        <span className="absolute -top-2 -right-3 bg-gray-700 text-white text-[9px] px-1 rounded-full font-semibold">
                          {completionPercentage}%
                        </span>
                      )}
                    </span>

                    {/* Completion indicator - checkmark */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }}
                        className={cn(
                          "absolute -top-1 -right-1",
                          isActive
                            ? activeSubTabColors.color.replace('text-', 'bg-').replace('/20', '/40')
                            : "bg-green-500/80",
                          "rounded-full p-0.5 shadow-lg"
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-white drop-shadow-md" />
                      </motion.div>
                    )}
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

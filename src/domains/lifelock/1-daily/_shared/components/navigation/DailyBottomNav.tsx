/**
 * DailyBottomNav Component
 *
 * Shared bottom navigation with glassmorphism effect for LifeLock daily views.
 * Provides consistent styling and behavior across all daily sections.
 *
 * Design: Single rounded rectangular bar with underline active state + 9-dot FAB button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DailyBottomNavTab {
  title: string;
  icon: LucideIcon;
  color?: string;
  bgActive?: string;
}

export interface DailyBottomNavProps {
  tabs: DailyBottomNavTab[];
  activeIndex: number;
  activeColor?: string;
  activeBgColor?: string;
  onChange: (index: number | null) => void;
  className?: string;
}

export const DailyBottomNav: React.FC<DailyBottomNavProps> = ({
  tabs,
  activeIndex,
  onChange,
  className = ''
}) => {
  // Extract first 4 tabs for main navigation
  const navTabs = tabs.slice(0, 4);
  const moreTabIndex = tabs.length - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pointer-events-none">
      <div className="pointer-events-auto flex items-center px-4 w-full">
        {/* Main Navigation Bar - Taller callout card style */}
        <div
          className={cn(
            "flex items-center justify-around gap-1 sm:gap-2",
            "px-3 py-3 h-18 sm:h-20 rounded-full flex-1",
            "bg-gray-900/60 backdrop-blur-xl border border-white/10 shadow-2xl",
            className
          )}
        >
          {navTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeIndex === index;

            return (
              <motion.button
                key={tab.title}
                className="flex flex-col items-center gap-1 relative min-w-[3rem]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(index)}
                aria-label={tab.title}
                aria-pressed={isActive}
              >
                <Icon
                  size={28}
                  className={cn(
                    "text-white/70 transition-colors",
                    isActive && "text-white"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] sm:text-[12px] font-medium whitespace-nowrap",
                    "text-white/70 transition-colors",
                    isActive && "text-white"
                  )}
                >
                  {tab.title}
                </span>

                {/* Active State: White Underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Spacer - equal to the screen padding (16px) */}
        <div className="w-4 flex-shrink-0" />

        {/* FAB (9-dot) Button - Same height as main bar */}
        <motion.button
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl shadow-purple-500/10 flex items-center justify-center relative overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(moreTabIndex)}
          aria-label="More options"
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full" />
          <NineDotsIcon className="w-7 h-7 text-white relative z-10" />
        </motion.button>
      </div>
    </div>
  );
};

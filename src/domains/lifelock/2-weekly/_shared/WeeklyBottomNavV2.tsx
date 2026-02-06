/**
 * WeeklyBottomNavV2 Component
 *
 * Shared bottom navigation with glassmorphism effect for LifeLock weekly views.
 * Based on DailyBottomNav pattern with blue/indigo theme for weekly.
 *
 * 3-pill navigation + More button (9-dot) as 4th pill
 * - Review (Overview, Wins, Problems)
 * - Work (Productivity, Goals, Time Analysis)
 * - Health (Wellness, Habits, Recovery)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';
import { AIOrbButton } from '@/components/ui/AIOrbButton';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeeklyBottomNavTab {
  title: string;
  icon: LucideIcon;
  color?: string;
  bgActive?: string;
}

export interface WeeklyBottomNavV2Props {
  tabs: WeeklyBottomNavTab[];
  activeIndex: number;
  activeColor?: string;
  activeBgColor?: string;
  activeSubTab?: string; // For dynamic subsection coloring
  onChange: (index: number | null) => void;
  onAILegacyClick?: () => void;
  className?: string;
  hidden?: boolean;
}

export const WeeklyBottomNavV2: React.FC<WeeklyBottomNavV2Props> = ({
  tabs,
  activeIndex,
  activeSubTab,
  onChange,
  onAILegacyClick,
  className = '',
  hidden = false
}) => {
  // Extract all tabs (should be 3 now + More button)
  const navTabs = tabs.slice(0, 3);

  // Get color based on active subsection - BLUE THEME for Weekly
  const getSubTabGradient = (subTab: string | undefined): string => {
    switch (subTab) {
      // Review section
      case 'overview':
        return 'from-blue-500 to-cyan-500';
      case 'wins':
        return 'from-emerald-500 to-teal-500';
      case 'problems':
        return 'from-rose-500 to-orange-500';
      // Work section
      case 'productivity':
        return 'from-indigo-500 to-blue-500';
      case 'goals':
        return 'from-violet-500 to-purple-500';
      case 'time-analysis':
        return 'from-cyan-500 to-sky-500';
      // Health section
      case 'wellness':
        return 'from-emerald-500 to-green-500';
      case 'habits':
        return 'from-amber-500 to-orange-500';
      case 'recovery':
        return 'from-teal-500 to-cyan-500';
      default:
        return '';
    }
  };

  // Color gradients for each main tab (fallback when no subsection)
  // BLUE THEME for Weekly view
  const tabColors = [
    'from-blue-500 to-cyan-500',      // Review
    'from-indigo-500 to-blue-500',    // Work
    'from-emerald-500 to-teal-500',   // Health
  ];

  // Get the appropriate gradient - use subsection color if available
  const subTabGradient = getSubTabGradient(activeSubTab);
  const getTabGradient = (index: number): string => {
    if (index === activeIndex && subTabGradient) {
      return subTabGradient;
    }
    return tabColors[index % tabColors.length];
  };

  if (hidden) return null;

  return (
    <div data-bottom-nav="true" className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 w-full max-w-lg">
        {/* Main Navigation Pill - 3 tabs + More button integrated */}
        <div className="flex-1 h-14 bg-siso-bg-alt/70 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-hidden">
          <div className="flex items-center h-full">
            {/* Regular navigation tabs */}
            {navTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeIndex === index;
              const gradient = getTabGradient(index);

              return (
                <motion.button
                  key={tab.title}
                  className="flex-1 relative min-w-[4rem] h-full px-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(index)}
                  aria-label={tab.title}
                  aria-pressed={isActive}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="weeklyActiveTabBg"
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        gradient
                      )}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    size={20}
                    className={cn(
                      'mx-auto mb-0.5 transition-colors relative z-10',
                      isActive ? 'text-white' : 'text-gray-400'
                    )}
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      'block text-[10px] font-medium text-center relative z-10',
                      isActive ? 'text-white' : 'text-gray-400'
                    )}
                  >
                    {tab.title}
                  </span>

                  {/* Active Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="weeklyActiveGlow"
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-30 blur-lg',
                        gradient
                      )}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* More Button - Integrated as 4th pill */}
            <motion.button
              className="flex-1 relative min-w-[4rem] h-full px-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(null)} // Pass null to indicate more button was clicked
              aria-label="More options"
            >
              {/* Icon */}
              <NineDotsIcon
                className={cn(
                  'mx-auto mb-0.5 transition-colors relative z-10',
                  'text-gray-400'
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  'block text-[9px] font-medium text-center relative z-10',
                  'text-gray-400'
                )}
              >
                More
              </span>
            </motion.button>
          </div>
        </div>

        {/* AI Legacy Button */}
        <AIOrbButton
          onClick={onAILegacyClick}
          size="md"
          className="flex-shrink-0"
          activeSubTab={activeSubTab}
        />
      </div>
    </div>
  );
};

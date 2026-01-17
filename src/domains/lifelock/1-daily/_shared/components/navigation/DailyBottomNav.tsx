/**
 * DailyBottomNav Component
 *
 * Shared bottom navigation with glassmorphism effect for LifeLock daily views.
 * Provides consistent styling and behavior across all daily sections.
 *
 * PHASE 5 COMPLETE: AI Legacy button replaces Timeline circle button
 * PHASE 4: 3-pill navigation + More button (9-dot) as 4th pill
 * Previous: 4-pill navigation + 9-dot FAB button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';
import { AIOrbButton } from '@/components/ui/AIOrbButton';
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
  onAILegacyClick?: () => void;
  className?: string;
  hidden?: boolean;
}

export const DailyBottomNav: React.FC<DailyBottomNavProps> = ({
  tabs,
  activeIndex,
  onChange,
  onAILegacyClick,
  className = '',
  hidden = false
}) => {
  // Extract all tabs (should be 3 now + More button)
  const navTabs = tabs.slice(0, 3);

  // Color gradients for each tab (PHASE 4: Updated for 3 tabs + More)
  const tabColors = [
    'from-purple-500 to-violet-500',  // Plan
    'from-amber-500 to-orange-500',    // Tasks
    'from-cyan-500 to-blue-500',       // Stats
  ];

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 w-full max-w-lg">
        {/* Main Navigation Pill - 3 tabs + More button integrated */}
        <div className="flex-1 h-14 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl overflow-hidden">
          <div className="flex items-center h-full">
            {/* Regular navigation tabs */}
            {navTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeIndex === index;
              const gradient = tabColors[index % tabColors.length];

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
                      layoutId="activeTabBg"
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
                      layoutId="activeGlow"
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

        {/* AI Legacy Button - PHASE 5: Replaces Timeline circle button */}
        <AIOrbButton
          onClick={onAILegacyClick}
          size="md"
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
};

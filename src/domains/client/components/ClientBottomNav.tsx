/**
 * ClientBottomNav Component
 *
 * Bottom navigation with glassmorphism effect for Client Portal.
 * Provides consistent styling and behavior across client-facing pages.
 *
 * Design: 4-pill navigation + 9-dot FAB button (matching DailyBottomNav design)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientBottomNavTab {
  title: string;
  icon: LucideIcon;
  color?: string;
  bgActive?: string;
}

export interface ClientBottomNavProps {
  tabs: ClientBottomNavTab[];
  activeIndex: number;
  activeColor?: string;
  activeBgColor?: string;
  onChange: (index: number | null) => void;
  className?: string;
  hidden?: boolean;
}

export const ClientBottomNav: React.FC<ClientBottomNavProps> = ({
  tabs,
  activeIndex,
  onChange,
  className = '',
  hidden = false
}) => {
  // Extract first 4 tabs for main navigation
  const navTabs = tabs.slice(0, 4);

  // Color gradients for each tab (client-focused color scheme)
  const tabColors = [
    'from-blue-500 to-cyan-500',      // Dashboard
    'from-purple-500 to-violet-500',  // Projects
    'from-amber-500 to-orange-500',   // Support
    'from-green-500 to-emerald-500',  // Resources
  ];

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 w-full max-w-lg">
        {/* Main Navigation Pill - 4-pill design */}
        <div className="flex-1 h-14 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl overflow-hidden">
          <div className="flex items-center h-full">
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
                      layoutId="activeClientTabBg"
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
                      'block text-[9px] font-medium text-center relative z-10',
                      isActive ? 'text-white' : 'text-gray-400'
                    )}
                  >
                    {tab.title}
                  </span>

                  {/* Active Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeClientGlow"
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
          </div>
        </div>

        {/* More Button - 9-dot FAB */}
        <motion.button
          className="w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-2xl border-2 border-white/30 shadow-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(null)} // Pass null to indicate more button was clicked
          aria-label="More options"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />

          {/* Icon */}
          <NineDotsIcon className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </div>
    </div>
  );
};

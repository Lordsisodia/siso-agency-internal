/**
 * XP Bottom Navigation
 *
 * 4-pill navigation + more button for XP Hub
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';
import { cn } from '@/lib/utils';

export interface XPBottomNavTab {
  id: string;
  title: string;
  icon: LucideIcon;
}

export interface XPBottomNavProps {
  tabs: XPBottomNavTab[];
  activeIndex: number;
  onChange: (index: number | null) => void;
  className?: string;
}

export function XPBottomNav({ tabs, activeIndex, onChange, className }: XPBottomNavProps) {
  // Color gradients for each tab
  const tabColors = [
    'from-indigo-500 to-purple-500',  // Dashboard
    'from-yellow-500 to-amber-500',    // Store
    'from-pink-500 to-rose-500',       // Stats
    'from-cyan-500 to-blue-500',       // History
  ];

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 w-full max-w-lg">
        {/* Main Navigation Pill */}
        <div className="flex-1 h-14 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl overflow-hidden">
          <div className="flex items-center h-full">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeIndex === index;
              const gradient = tabColors[index % tabColors.length];

              return (
                <motion.button
                  key={tab.id}
                  className="flex-1 relative min-w-[4rem] h-full px-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(index)}
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
                      'block text-[9px] font-medium text-center relative z-10',
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
          </div>
        </div>

        {/* More Button */}
        <motion.button
          className="w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-2xl border-2 border-white/30 shadow-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(null)}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />

          {/* Icon */}
          <NineDotsIcon className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </div>
    </div>
  );
}

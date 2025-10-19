/**
 * DailyBottomNav Component
 * 
 * Shared bottom navigation with glassmorphism effect for LifeLock daily views.
 * Provides consistent styling and behavior across all daily sections.
 */

import React from 'react';
import { ExpandableTabs } from '@/shared/ui/expandable-tabs';
import { LucideIcon } from 'lucide-react';

export interface DailyBottomNavTab {
  title: string;
  icon: LucideIcon;
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
  activeColor = 'text-orange-400',
  activeBgColor = 'bg-orange-400/20',
  onChange,
  className = ''
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none">
      <div className="pointer-events-auto w-full max-w-xl">
        <ExpandableTabs
          tabs={tabs}
          activeIndex={activeIndex}
          activeColor={activeColor}
          activeBgColor={activeBgColor}
          className={`bg-gray-900/30 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl ${className}`}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

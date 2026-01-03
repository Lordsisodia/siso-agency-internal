/**
 * WeeklyBottomNav Component
 * 
 * Bottom navigation for Weekly View with glassmorphism effect
 * Reused from DailyBottomNav pattern with blue/indigo theme
 */

import React from 'react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { LucideIcon } from 'lucide-react';

export interface WeeklyBottomNavTab {
  title: string;
  icon: LucideIcon;
}

export interface WeeklyBottomNavProps {
  tabs: WeeklyBottomNavTab[];
  activeIndex: number;
  activeColor?: string;
  onChange: (index: number | null) => void;
  className?: string;
}

export const WeeklyBottomNav: React.FC<WeeklyBottomNavProps> = ({
  tabs,
  activeIndex,
  activeColor = 'text-blue-400',
  onChange,
  className = ''
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <ExpandableTabs
          tabs={tabs}
          activeIndex={activeIndex}
          activeColor={activeColor}
          className={`bg-gray-900/30 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl ${className}`}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

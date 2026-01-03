/**
 * LifeBottomNav Component
 * 
 * Bottom navigation for Life View with gold theme
 */

import React from 'react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { LucideIcon } from 'lucide-react';

export interface LifeBottomNavTab {
  title: string;
  icon: LucideIcon;
}

export interface LifeBottomNavProps {
  tabs: LifeBottomNavTab[];
  activeIndex: number;
  activeColor?: string;
  onChange: (index: number | null) => void;
  className?: string;
}

export const LifeBottomNav: React.FC<LifeBottomNavProps> = ({
  tabs,
  activeIndex,
  activeColor = 'text-yellow-400',
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

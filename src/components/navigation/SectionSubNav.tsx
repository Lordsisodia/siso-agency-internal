/**
 * Section Sub-Navigation Component
 *
 * Horizontal pill-button navigation for sections with multiple sub-tabs
 * Used by Timebox (Timebox, Morning, Checkout) and Tasks (Today, Light Work, Deep Work)
 */

import React from 'react';
import { NavSubSection } from '@/services/shared/navigation-config';
import { cn } from '@/lib/utils';

interface SectionSubNavProps {
  subSections: NavSubSection[];
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  activeColor?: string;
  activeBgColor?: string;
}

export const SectionSubNav: React.FC<SectionSubNavProps> = ({
  subSections,
  activeSubTab,
  onSubTabChange,
  activeColor = 'text-amber-400',
  activeBgColor = 'bg-amber-400/20'
}) => {
  if (!subSections || subSections.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      {subSections.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSubTabChange(sub.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            'border-2',
            activeSubTab === sub.id
              ? `${activeColor} ${activeBgColor} border-current shadow-lg`
              : 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-white/5 hover:border-white/10'
          )}
        >
          <sub.icon className="h-4 w-4" />
          <span>{sub.name}</span>
        </button>
      ))}
    </div>
  );
};

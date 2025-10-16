/**
 * 📊 TaskStatsGrid Component
 * 
 * Extracted from UnifiedWorkSection.tsx (Phase 4B Refactoring)
 * Displays task statistics in a responsive grid layout
 * 
 * Benefits:
 * - Reusable stats display component
 * - Configurable stat types and colors
 * - Clean separation of stats logic
 * - Easy to add new stat types
 */

import React from 'react';
import { selectImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';

export interface StatsData {
  timeRemaining?: string;
  avgXP?: string;
  expToEarn?: string;
}

export interface TaskStatsGridProps {
  statsData: StatsData;
  showStats: boolean;
}

export const TaskStatsGrid: React.FC<TaskStatsGridProps> = ({
  statsData,
  showStats
}) => {
  if (!showStats || !statsData) return null;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-3">
        {statsData.timeRemaining && (
          <div className={selectImplementation(
            'useUnifiedThemeSystem',
            `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-green-500/30 ${theme.themes.card.secondary}`,
            'group relative p-4 bg-transparent rounded-lg border border-emerald-500/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-800/20'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center justify-center text-center h-full">
              <div className="text-2xl font-bold text-emerald-400 leading-tight">
                {statsData.timeRemaining}
              </div>
              <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Time Left</div>
            </div>
          </div>
        )}
        
        {statsData.avgXP && (
          <div className={selectImplementation(
            'useUnifiedThemeSystem',
            `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 ${theme.themes.card.secondary}`,
            'group relative p-4 bg-transparent rounded-lg border border-blue-500/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-800/20'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center justify-center text-center h-full">
              <div className="text-2xl font-bold text-blue-400 leading-tight">
                {statsData.avgXP}
              </div>
              <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">Avg XP</div>
            </div>
          </div>
        )}
        
        {statsData.expToEarn && (
          <div className={selectImplementation(
            'useUnifiedThemeSystem',
            `group relative p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 ${theme.themes.card.secondary}`,
            'group relative p-4 bg-transparent rounded-lg border border-yellow-700/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-900/20'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center justify-center text-center h-full">
              <div className="text-2xl font-bold text-yellow-400 leading-tight">
                {statsData.expToEarn}
              </div>
              <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">EXP to Earn</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
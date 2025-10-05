/**
 * LightWorkTab - Upgraded with New Reusable Architecture
 * 
 * Uses the same TaskContainer architecture as Deep Work for consistency.
 * Demonstrates the power of reusable components across different contexts.
 */

import React, { useEffect } from 'react';
import { TabProps } from '../../types/DayTabContainer';
import SisoLightWorkPlan from '@/components/ui/siso-light-work-plan';

export const LightWorkTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd
}) => {
  // Set dark theme
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen text-white';
    document.documentElement.className = 'dark bg-gray-900';
    return () => {
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SisoLightWorkPlan
        onStartFocusSession={(taskId, intensity) => {
          console.log('Starting light work focus session:', { taskId, intensity });
          // TODO: Integrate with focus timer system
        }}
      />
    </div>
  );
};
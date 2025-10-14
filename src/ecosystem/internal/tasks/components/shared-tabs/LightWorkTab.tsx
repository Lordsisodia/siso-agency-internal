/**
 * LightWorkTab - Upgraded with New Reusable Architecture
 *
 * Uses the same TaskContainer architecture as Deep Work for consistency.
 * Demonstrates the power of reusable components across different contexts.
 */

import React, { useEffect } from 'react';
import { TabProps } from '../../types/DayTabContainer';
// TODO: Create SisoLightWorkPlan component
// import SisoLightWorkPlan from '@/components/ui/siso-light-work-plan';

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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg mb-4">Light Work Tab</p>
        <p className="text-gray-500 text-sm">Component under development</p>
      </div>
      {/* TODO: Restore when SisoLightWorkPlan component is created
      <SisoLightWorkPlan
        onStartFocusSession={(taskId, intensity) => {
          console.log('Starting light work focus session:', { taskId, intensity });
          // TODO: Integrate with focus timer system
        }}
      /> */}
    </div>
  );
};
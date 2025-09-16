/**
 * 🎯 Deep Work Tab - Administrative Interface
 * 
 * Simplified Deep Work interface using the reusable SisoDeepFocusPlanV2 component.
 * Demonstrates component reusability with the same architecture as Light Work.
 */

import React from 'react';
import SisoDeepFocusPlanV2 from '@/components/ui/siso-deep-focus-plan-v2';

interface TabProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

export const DeepWorkTab: React.FC<TabProps> = ({ onStartFocusSession }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 
        🎯 Component Reusability Benefits:
        - Same TaskContainer architecture as Light Work
        - Deep Work theme (orange/red colors vs emerald/teal)
        - Higher intensity tasks (levels 3-4 vs 1-2 for Light Work)
        - Longer time estimates (45-120min vs 10-30min)
        - All CRUD operations work identically
        - Reuses TaskCard, TaskDetailModal, TaskContainer
      */}
      <SisoDeepFocusPlanV2
        onStartFocusSession={(taskId, intensity) => {
          console.log('Starting deep work focus session:', { taskId, intensity });
          onStartFocusSession?.(taskId, intensity);
        }}
      />
    </div>
  );
};

export default DeepWorkTab;
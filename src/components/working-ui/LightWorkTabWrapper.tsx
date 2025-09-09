/**
 * LightWorkTab Wrapper - Feature Flagged UI Swap
 * 
 * This wrapper conditionally renders either:
 * 1. Working UI (MinimalWorkingUI) when useWorkingUI flag is enabled
 * 2. Original LightWorkTab when flag is disabled
 * 
 * Safe migration - no risk to existing functionality.
 */

console.log('🔄🔄🔄 LIGHTWORKTABWRAPPER MODULE IMPORTED! 🔄🔄🔄');

import React from 'react';
import { useImplementation, isFeatureEnabled } from '@/migration/feature-flags';
import { UnifiedTaskManager } from './UnifiedTaskManager';
import { LightWorkTab } from '@/shared/tabs/LightWorkTab';
import { TabProps } from '@/ai-first/features/tasks/DayTabContainer';

// Extended props to match MinimalWorkingUI interface
interface ExtendedTabProps extends TabProps {
  selectedDate: Date;
  onTaskToggle: (taskId: string) => void;
  onCustomTaskAdd: (taskData: any) => Promise<any>;
}

export const LightWorkTabWrapper: React.FC<ExtendedTabProps> = (props) => {
  console.log('🚨🚨🚨 LIGHTWORKTABWRAPPER COMPONENT LOADED! 🚨🚨🚨');
  console.log('🔥🔥🔥 LIGHTWORKTABWRAPPER IS BEING CALLED! 🔥🔥🔥');
  console.log('💡💡💡 Props received:', Object.keys(props));
  const { selectedDate, todayCard, onTaskToggle, onCustomTaskAdd, ...restProps } = props;
  
  // Debug logging
  console.log('🔧 LightWorkTabWrapper Debug:', {
    useWorkingUIFlag: isFeatureEnabled('useWorkingUI'),
    todayCard,
    selectedDate,
    propsKeys: Object.keys(props)
  });
  
  console.log('🚨 FEATURE FLAG CHECK:', {
    flagValue: isFeatureEnabled('useWorkingUI'),
    willUseNewUI: isFeatureEnabled('useWorkingUI') ? 'YES - UnifiedTaskManager' : 'NO - Original LightWorkTab'
  });

  // Map todayCard tasks to MinimalWorkingUI format
  const mappedTasks = React.useMemo(() => {
    if (!todayCard?.lightWork) return [];
    
    return todayCard.lightWork.map((task: any) => ({
      id: task.id || `task-${Math.random()}`,
      title: task.title || task.text || 'Untitled Task',
      completed: task.completed || false,
      workType: 'LIGHT' as const,
      aiAnalyzed: task.aiAnalyzed || false,
      xpReward: task.xpReward || 0,
      difficulty: task.difficulty || 'Medium'
    }));
  }, [todayCard]);

  // Action handlers for MinimalWorkingUI
  const handleAnalyzeWithAI = async (taskId: string) => {
    console.log('🧠 AI Analysis for task:', taskId);
    // TODO: Integrate with actual AI analysis system
  };

  const handleStartThoughtDump = async (taskId: string) => {
    console.log('🎤 Thought dump for task:', taskId);
    // TODO: Integrate with voice recording system
  };

  const handlePushToAnotherDay = async (taskId: string) => {
    console.log('📅 Push to another day:', taskId);
    // TODO: Integrate with task scheduling system
  };

  const handleViewTask = async (taskId: string) => {
    console.log('👁 View task details:', taskId);
    // TODO: Open task details modal/page
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('❌ Delete task:', taskId);
    // TODO: Integrate with task deletion system
  };

  const handleToggleTask = async (taskId: string) => {
    console.log('✅ Toggle task completion:', taskId);
    if (onTaskToggle) {
      onTaskToggle(taskId);
    }
  };

  const workingUIEnabled = isFeatureEnabled('useWorkingUI');
  console.log(`🚀 Rendering ${workingUIEnabled ? 'WORKING UI' : 'ORIGINAL UI'} for LightWorkTab`);

  return useImplementation(
    'useWorkingUI',
    // NEW: Unified Task Manager for both Light and Deep Work
    <UnifiedTaskManager
      workType="LIGHT"
      selectedDate={selectedDate}
      tasks={mappedTasks}
      loading={false}
      error={null}
      onAnalyzeWithAI={handleAnalyzeWithAI}
      onStartThoughtDump={handleStartThoughtDump}
      onPushToAnotherDay={handlePushToAnotherDay}
      onViewTask={handleViewTask}
      onDeleteTask={handleDeleteTask}
      onToggleTask={handleToggleTask}
      onCreateTask={() => console.log('Create new task')}
    />,
    // OLD: Original LightWorkTab (fallback for safety)
    <LightWorkTab {...props} />
  );
};
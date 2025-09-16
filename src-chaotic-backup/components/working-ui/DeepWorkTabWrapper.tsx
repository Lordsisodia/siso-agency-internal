/**
 * DeepWorkTab Wrapper - Feature Flagged UI Swap
 * 
 * This wrapper conditionally renders either:
 * 1. Working UI (UnifiedTaskManager) when useWorkingUI flag is enabled
 * 2. Original DeepFocusTab when flag is disabled
 * 
 * Safe migration - no risk to existing functionality.
 */

import React from 'react';
import { useImplementation, isFeatureEnabled } from '@/migration/feature-flags';
import { UnifiedTaskManager } from './UnifiedTaskManager';
import { DeepFocusTab } from '@/ecosystem/internal/tasks/components/DeepFocusTab';
import { TabProps } from '@/ecosystem/internal/tasks/DayTabContainer';

// Extended props to match UnifiedTaskManager interface
interface ExtendedTabProps extends TabProps {
  selectedDate: Date;
  onTaskToggle: (taskId: string) => void;
  onCustomTaskAdd: (taskData: any) => Promise<any>;
}

export const DeepWorkTabWrapper: React.FC<ExtendedTabProps> = (props) => {
  const { selectedDate, todayCard, onTaskToggle, onCustomTaskAdd, ...restProps } = props;
  
  // Debug logging
  console.log('🔧 DeepWorkTabWrapper Debug:', {
    useWorkingUIFlag: isFeatureEnabled('useWorkingUI'),
    todayCard,
    selectedDate,
    propsKeys: Object.keys(props)
  });

  // Map todayCard tasks to UnifiedTaskManager format
  const mappedTasks = React.useMemo(() => {
    if (!todayCard?.deepWork) return [];
    
    return todayCard.deepWork.map((task: any) => ({
      id: task.id || `task-${Math.random()}`,
      title: task.title || task.text || 'Untitled Deep Work Task',
      completed: task.completed || false,
      workType: 'DEEP' as const,
      aiAnalyzed: task.aiAnalyzed || false,
      xpReward: task.xpReward || 0,
      difficulty: task.difficulty || 'High'
    }));
  }, [todayCard]);

  // Action handlers for UnifiedTaskManager
  const handleAnalyzeWithAI = async (taskId: string) => {
    console.log('🧠 AI Analysis for deep work task:', taskId);
    // TODO: Integrate with actual AI analysis system
  };

  const handleStartThoughtDump = async (taskId: string) => {
    console.log('🎤 Thought dump for deep work task:', taskId);
    // TODO: Integrate with voice recording system
  };

  const handlePushToAnotherDay = async (taskId: string) => {
    console.log('📅 Push to another day:', taskId);
    // TODO: Integrate with task scheduling system
  };

  const handleViewTask = async (taskId: string) => {
    console.log('👁 View deep work task details:', taskId);
    // TODO: Open task details modal/page
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('❌ Delete deep work task:', taskId);
    // TODO: Integrate with task deletion system
  };

  const handleToggleTask = async (taskId: string) => {
    console.log('✅ Toggle deep work task completion:', taskId);
    if (onTaskToggle) {
      onTaskToggle(taskId);
    }
  };

  const workingUIEnabled = isFeatureEnabled('useWorkingUI');
  console.log(`🚀 Rendering ${workingUIEnabled ? 'WORKING UI' : 'ORIGINAL UI'} for DeepWorkTab`);

  return useImplementation(
    'useWorkingUI',
    // NEW: Unified Task Manager for both Light and Deep Work
    <UnifiedTaskManager
      workType="DEEP"
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
      onCreateTask={() => console.log('Create new deep work task')}
    />,
    // OLD: Original DeepFocusTab (fallback for safety)
    <DeepFocusTab {...props} />
  );
};
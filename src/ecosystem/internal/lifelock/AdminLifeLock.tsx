import React, { useState, useEffect, memo, useCallback } from 'react';


import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { TabLayoutWrapper } from './TabLayoutWrapper';

import { getTaskService } from '@/services/database/TaskServiceRegistry';
import { useTaskCRUD } from '@/hooks/useTaskCRUD';
import { useTaskState } from '@/hooks/useTaskState';
import { useTaskValidation } from '@/hooks/useTaskValidation';



// Refactored components and hooks
import { SafeTabContentRenderer } from '@/components/ui/TabContentRenderer';
import { useDateNavigation, useModalHandlers } from './hooks';

// New TabRegistry integration
import { useTabConfiguration } from '@/shared/hooks/useTabConfiguration';
import { tabRegistry } from '@/shared/services/TabRegistry';

// TaskProvider for service integration
import { TasksProvider } from '../../../stores/tasks/taskProviderCompat';

// Day progress utilities
import { calculateDayCompletionPercentage } from '@/utils/dayProgress';

// Modal components (assuming they exist or need to be created)
import { CreateTaskModal } from './modals/CreateTaskModal';
import { CreateHabitModal } from './modals/CreateHabitModal';
import { CreateGoalModal } from './modals/CreateGoalModal';
import { CreateJournalEntryModal } from './modals/CreateJournalEntryModal';

const AdminLifeLock: React.FC = memo(() => {
  const { user } = useClerkUser();
  
  // Custom hooks for modular functionality
  const dateNavigation = useDateNavigation();
  
  // State for real-time day progress updates
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute for real-time day progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Initialize TaskServiceRegistry and get appropriate service for current context
  const taskService = getTaskService('light-work'); // Default to light-work, can be made dynamic
  
  // Use new task management hooks
  const taskCRUD = useTaskCRUD({ taskType: 'light-work', userId: user?.id });
  const taskState = useTaskState(taskCRUD.tasks || []);
  const taskValidation = useTaskValidation({ taskType: 'light-work' });
  
  // Legacy compatibility layer - map new hooks to old interface
  const lifeLockHook = {
    // Data - these would come from processed task state
    tasks: taskState.tasks || [],
    stats: taskState.stats || { total: 0, completed: 0, completionRate: 0 },
    
    // State - use loading states from CRUD operations
    isLoading: taskCRUD.isLoading,
    isProcessing: taskCRUD.isAnyOperationLoading,
    
    // Actions - map to new CRUD operations with proper error handling
    handleTaskToggle: (taskId: string) => {
      const task = taskState.tasks?.find(t => t.id === taskId);
      if (task) {
        taskCRUD.updateTask({
          id: taskId,
          status: task.status === 'completed' ? 'pending' : 'completed'
        });
      }
    },
    handleCustomTaskAdd: (task: { title: string; priority: string }) => 
      taskCRUD.createTask({ 
        title: task.title, 
        priority: task.priority as any,
        status: 'pending',
        description: ''
      }),
    
    // Search and filter actions
    setSearchQuery: taskState.setSearchQuery || (() => {}),
    updateFilters: taskState.updateFilters || (() => {}),
    
    // Selection actions
    toggleTaskSelection: taskState.toggleTaskSelection || (() => {}),
    clearSelection: taskState.clearSelection || (() => {}),
  };
  
  const lifeLockData = lifeLockHook; // Maintain compatibility
  const refactoredLifeLockData = lifeLockHook; // Maintain compatibility
  const modalHandlers = useModalHandlers();
  
  // TabRegistry integration - replaces manual tab state management
  const tabConfig = useTabConfiguration();

  const handleCreateTask = () => {
    modalHandlers.openCreateTaskModal();
  };

  const handleCreateHabit = () => {
    modalHandlers.openCreateHabitModal();
  };

  const handleCreateGoal = () => {
    modalHandlers.openCreateGoalModal();
  };

  const handleCreateJournalEntry = () => {
    modalHandlers.openCreateJournalModal();
  };

  // Compute day progress percentage using utility function
  const dayCompletionPercentage = calculateDayCompletionPercentage(currentTime);

  // Quick add adapter for QuickActionsSection
  const handleQuickAdd = (title: string) => {
    lifeLockHook?.handleCustomTaskAdd?.({ title, priority: 'medium' });
  };

  // 🎯 TABREGISTRY INTEGRATION: Automatic props filtering using TabRegistry
  // TabRegistry handles prop filtering based on tab configuration
  const getTabSpecificProps = useCallback((activeTab: string, allProps: any) => {
    const tabConfig = tabRegistry.getTab(activeTab);
    if (!tabConfig) {
      console.warn(`Tab configuration not found for: ${activeTab}`);
      // Return base props as fallback
      return {
        selectedDate: allProps.selectedDate,
        dayCompletionPercentage: allProps.dayCompletionPercentage,
        navigateDay: allProps.navigateDay,
      };
    }
    
    // Use TabRegistry's prop filtering capabilities
    // Base props that all tabs need
    const baseProps = {
      selectedDate: allProps.selectedDate,
      dayCompletionPercentage: allProps.dayCompletionPercentage,
      navigateDay: allProps.navigateDay,
    };
    
    // Add tab-specific props based on TabRegistry configuration
    const specificProps = tabConfig.features?.includes('organization') ? {
      handleOrganizeTasks: allProps.handleOrganizeTasks,
      isAnalyzingTasks: allProps.isAnalyzingTasks,
      todayCard: allProps.todayCard
    } : {};
    
    const quickAddProps = tabConfig.features?.includes('quickAdd') ? {
      handleQuickAdd: allProps.handleQuickAdd
    } : {};
    
    const voiceProps = tabConfig.features?.includes('voice') ? {
      handleVoiceCommand: allProps.handleVoiceCommand,
      isProcessingVoice: allProps.isProcessingVoice
    } : {};
    
    return {
      ...baseProps,
      ...specificProps,
      ...quickAddProps,
      ...voiceProps
    };
  }, []);

  return (
    <TasksProvider>
      {/* Removed wrapper div - TabLayoutWrapper handles full-screen layout */}
      <TabLayoutWrapper 
            selectedDate={dateNavigation.currentDate} 
            onDateChange={dateNavigation.setCurrentDate}
          >
            {(activeTab, navigateDay) => {
              // Get tab-specific props using TabRegistry integration
              const tabSpecificProps = getTabSpecificProps(activeTab, {
                selectedDate: dateNavigation.currentDate,
                dayCompletionPercentage,
                navigateDay,
                handleQuickAdd,
                handleOrganizeTasks: lifeLockHook?.handleOrganizeTasks,
                isAnalyzingTasks: lifeLockHook?.isAnalyzingTasks,
                isProcessingVoice: lifeLockHook?.isProcessingVoice,
                handleVoiceCommand: lifeLockHook?.handleVoiceCommand,
                todayCard: lifeLockHook?.todayCard,
                userId: user?.id
              });
              
              return (
                <SafeTabContentRenderer
                  activeTab={activeTab as any}
                  layoutProps={tabSpecificProps}
                />
              );
            }}
          </TabLayoutWrapper>

      {/* Modals */}
        {modalHandlers.isCreateTaskModalOpen && (
          <CreateTaskModal
            currentDate={dateNavigation.currentDate}
            onClose={modalHandlers.closeCreateTaskModal}
          />
        )}

        {modalHandlers.isCreateHabitModalOpen && (
          <CreateHabitModal
            currentDate={dateNavigation.currentDate}
            onClose={modalHandlers.closeCreateHabitModal}
          />
        )}

        {modalHandlers.isCreateGoalModalOpen && (
          <CreateGoalModal
            currentDate={dateNavigation.currentDate}
            onClose={modalHandlers.closeCreateGoalModal}
          />
        )}

        {modalHandlers.isCreateJournalModalOpen && (
          <CreateJournalEntryModal
            currentDate={dateNavigation.currentDate}
            onClose={modalHandlers.closeCreateJournalModal}
          />
        )}
    </TasksProvider>
  );
});

export default AdminLifeLock;

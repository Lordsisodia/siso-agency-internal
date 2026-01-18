import React, { useState, useEffect, memo, useCallback } from 'react';


import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { TabLayoutWrapper } from '@/domains/lifelock/_shared/core/TabLayoutWrapper';

import { getTaskService } from '@/services/database/TaskServiceRegistry';
import { useTaskCRUD } from '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD';
import { useTaskState } from '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskState';
import { useTaskValidation } from '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskValidation';



// Refactored components and hooks
import { SafeTabContentRenderer } from '@/domains/lifelock/_shared/core/TabContentRenderer';
import useDateNavigation from '@/domains/lifelock/_shared/hooks/useDateNavigation';
import { useModalHandlers } from '@/domains/lifelock/_shared/hooks';

// New TabRegistry integration
import { useTabConfiguration } from '@/lib/domains/admin/hooks/useTabConfiguration';
import { tabRegistry } from '@/services/shared/TabRegistry';

// TaskProvider for service integration
import { TasksProvider } from '@/lib/stores/tasks/taskProviderCompat';

// Day progress utilities
import { calculateDayCompletionPercentage } from '@/lib/utils/dayProgress';

// Modal components (assuming they exist or need to be created)
import { CreateTaskModal } from '@/domains/lifelock/1-daily/_shared/modals/CreateTaskModal';
import { CreateHabitModal } from '@/domains/lifelock/1-daily/_shared/modals/CreateHabitModal';
import { CreateGoalModal } from '@/domains/lifelock/1-daily/_shared/modals/CreateGoalModal';
import { CreateJournalEntryModal } from '@/domains/lifelock/1-daily/_shared/modals/CreateJournalEntryModal';

import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
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
        activeSubTab: allProps.activeSubTab,
      };
    }

    // Use TabRegistry's prop filtering capabilities
    // Base props that all tabs need
    const baseProps = {
      selectedDate: allProps.selectedDate,
      dayCompletionPercentage: allProps.dayCompletionPercentage,
      navigateDay: allProps.navigateDay,
      activeSubTab: allProps.activeSubTab,
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
    <AdminLayout>
      <TasksProvider>
        {/* Removed wrapper div - TabLayoutWrapper handles full-screen layout */}
        <TabLayoutWrapper 
              selectedDate={dateNavigation.currentDate} 
              onDateChange={dateNavigation.setCurrentDate}
            >
              {(activeTab, navigateDay, activeSubTab) => {
                // Get tab-specific props using TabRegistry integration
                const tabSpecificProps = getTabSpecificProps(activeTab, {
                  selectedDate: dateNavigation.currentDate,
                  dayCompletionPercentage,
                  navigateDay,
                  activeSubTab,
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
    </AdminLayout>
  );
});

export default AdminLifeLock;

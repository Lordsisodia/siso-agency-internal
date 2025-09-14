import React, { useMemo, useState, useEffect, memo, useCallback } from 'react';
import { AdminLayout } from '@/internal/admin/layout/AdminLayout';
import { format, addWeeks, getYear, isToday } from 'date-fns';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/ClerkProvider';
import { ThoughtDumpResults } from '@/ecosystem/internal/tasks/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/ecosystem/internal/tasks/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from './TabLayoutWrapper';
import { TodayProgressSection } from '@/ecosystem/internal/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '@/ecosystem/internal/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '@/ecosystem/internal/tasks/components/VoiceCommandSection';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { SisoIcon } from '@/shared/ui/icons/SisoIcon';
import { CleanDateNav } from '@/shared/ui/clean-date-nav';
import { PriorityTasksSection } from '@/ecosystem/internal/tasks/components/PriorityTasksSection';
import { QuickActionsSection } from '@/ecosystem/internal/tasks/ui/QuickActionsSection';
import { MonthlyProgressSection } from '@/ecosystem/internal/tasks/components/MonthlyProgressSection';
import { MorningRoutineTab } from '@/ecosystem/internal/tasks/components/MorningRoutineTab';
import { LightWorkTab } from '@/shared/tabs/LightWorkTab';
import { LightWorkTabWrapper } from '@/components/working-ui/LightWorkTabWrapper';
import { DeepFocusTab } from '@/ecosystem/internal/tasks/components/DeepFocusTab';
import { DeepWorkTabWrapper } from '@/components/working-ui/DeepWorkTabWrapper';
import { TimeBoxTab } from '@/ecosystem/internal/tasks/components/TimeBoxTab';
import { NightlyCheckoutTab } from '@/ecosystem/internal/tasks/components/NightlyCheckoutTab';
import { useLifeLockData } from './useLifeLockData';
import { useRefactoredLifeLockData } from './useRefactoredLifeLockData';
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '@/shared/services/tab-config';
import { TabContentRenderer } from '@/refactored/components/TabContentRenderer';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { useFeatureFlags } from '@/shared/hooks/useFeatureFlags';
import { LoadingState } from '@/shared/ui/loading-state';
import { theme } from '@/styles/theme';
import { FloatingAIAssistant } from '@/shared/components/FloatingAIAssistant';

// Refactored components and hooks
import { SafeTabContentRenderer } from '@/refactored/components/TabContentRenderer';
import { useDateNavigation, useModalHandlers } from './hooks';

// Modal components (assuming they exist or need to be created)
import { CreateTaskModal } from './modals/CreateTaskModal';
import { CreateHabitModal } from './modals/CreateHabitModal';
import { CreateGoalModal } from './modals/CreateGoalModal';
import { CreateJournalEntryModal } from './modals/CreateJournalEntryModal';

const AdminLifeLock: React.FC = memo(() => {
  const { useRefactoredLifeLockData } = useFeatureFlags();
  
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
  
  // Load LifeLock data based on the selected date
  const lifeLockHook = useLifeLockData(dateNavigation.currentDate);
  const lifeLockData: any = lifeLockHook;
  const refactoredLifeLockData: any = lifeLockHook;
  const modalHandlers = useModalHandlers();
  
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Compute day progress percentage (how far through the day we are)
  const dayCompletionPercentage = (() => {
    const now = currentTime;
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const totalDayMs = endOfDay.getTime() - startOfDay.getTime();
    const elapsedMs = now.getTime() - startOfDay.getTime();
    
    return Math.round((elapsedMs / totalDayMs) * 100);
  })();

  // Quick add adapter for QuickActionsSection
  const handleQuickAdd = (title: string) => {
    lifeLockHook?.handleCustomTaskAdd?.({ title, priority: 'medium' });
  };

  // 🎯 COUPLING FIX: Props filtering to prevent shared state pollution
  // This ensures each tab only gets the props it actually needs
  const getTabSpecificProps = (activeTab: string, allProps: any) => {
    // Base props that ALL tabs need
    const baseProps = {
      selectedDate: allProps.selectedDate,
      dayCompletionPercentage: allProps.dayCompletionPercentage,
      navigateDay: allProps.navigateDay,
    };

    // Only give tabs what they actually use (prevents coupling)
    switch (activeTab) {
      case 'work':
      case 'focus':
        // Deep Work tabs need organization functionality
        return { 
          ...baseProps, 
          handleOrganizeTasks: allProps.handleOrganizeTasks, 
          isAnalyzingTasks: allProps.isAnalyzingTasks,
          todayCard: allProps.todayCard 
        };
        
      case 'light-work':
      case 'light':
        // Light Work tabs need quick add functionality
        return { 
          ...baseProps, 
          handleQuickAdd: allProps.handleQuickAdd 
        };

      case 'morning':
        // Morning routine needs voice commands
        return {
          ...baseProps,
          handleVoiceCommand: allProps.handleVoiceCommand,
          isProcessingVoice: allProps.isProcessingVoice
        };
        
      default: // wellness, timebox, checkout
        // Other tabs get minimal props to prevent coupling
        return baseProps;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <TabLayoutWrapper 
          selectedDate={dateNavigation.currentDate} 
          onDateChange={dateNavigation.setCurrentDate}
        >
          {(activeTab, navigateDay) => (
            <SafeTabContentRenderer
              activeTab={activeTab as any}
              layoutProps={getTabSpecificProps(activeTab, {
                selectedDate: dateNavigation.currentDate,
                dayCompletionPercentage,
                navigateDay,
                handleQuickAdd,
                handleOrganizeTasks: lifeLockHook?.handleOrganizeTasks,
                isAnalyzingTasks: lifeLockHook?.isAnalyzingTasks,
                isProcessingVoice: lifeLockHook?.isProcessingVoice,
                handleVoiceCommand: lifeLockHook?.handleVoiceCommand,
                todayCard: lifeLockHook?.todayCard
              })}
            />
          )}
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
      </div>
    </div>
  );
});

export default AdminLifeLock;

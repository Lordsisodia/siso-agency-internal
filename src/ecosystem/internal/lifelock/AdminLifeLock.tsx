import React, { useMemo, useState, useEffect, memo, useCallback } from 'react';
import { AdminLayout } from '@/internal/admin/layout/AdminLayout';
import { format, addWeeks, getYear, isToday } from 'date-fns';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/ClerkProvider';
import { ThoughtDumpResults } from '@/ai-first/features/tasks/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/ai-first/features/tasks/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from './TabLayoutWrapper';
import { TodayProgressSection } from '@/ai-first/features/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '@/ai-first/features/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '@/ai-first/features/tasks/components/VoiceCommandSection';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { SisoIcon } from '@/shared/ui/icons/SisoIcon';
import { CleanDateNav } from '@/shared/ui/clean-date-nav';
import { PriorityTasksSection } from '@/ai-first/features/tasks/components/PriorityTasksSection';
import { QuickActionsSection } from '@/ai-first/features/tasks/ui/QuickActionsSection';
import { MonthlyProgressSection } from '@/ai-first/features/tasks/components/MonthlyProgressSection';
import { MorningRoutineTab } from '@/ai-first/features/tasks/components/MorningRoutineTab';
import { LightWorkTab } from '@/shared/tabs/LightWorkTab';
import { LightWorkTabWrapper } from '@/components/working-ui/LightWorkTabWrapper';
import { DeepFocusTab } from '@/ai-first/features/tasks/components/DeepFocusTab';
import { DeepWorkTabWrapper } from '@/components/working-ui/DeepWorkTabWrapper';
import { TimeBoxTab } from '@/ai-first/features/tasks/components/TimeBoxTab';
import { NightlyCheckoutTab } from '@/ai-first/features/tasks/components/NightlyCheckoutTab';
import { useLifeLockData } from './useLifeLockData';
import { useRefactoredLifeLockData } from './useRefactoredLifeLockData';
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '@/ai-first/core/tab-config';
import { TabContentRenderer } from '@/refactored/components/TabContentRenderer';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { useFeatureFlags } from '@/shared/hooks/useFeatureFlags';
import { LoadingState } from '@/shared/ui/loading-state';
import { theme } from '@/styles/theme';

// Refactored components and hooks
import { LifeLockTabRenderer, LifeLockDateNavigation } from './components';
import { useDateNavigation, useModalHandlers } from './hooks';

// Modal components (assuming they exist or need to be created)
import { CreateTaskModal } from './modals/CreateTaskModal';
import { CreateHabitModal } from './modals/CreateHabitModal';
import { CreateGoalModal } from './modals/CreateGoalModal';
import { CreateJournalEntryModal } from './modals/CreateJournalEntryModal';

const AdminLifeLock: React.FC = memo(() => {
  const { useRefactoredLifeLockData } = useFeatureFlags();
  const { lifeLockData, refactoredLifeLockData } = useLifeLockData();
  
  // Custom hooks for modular functionality
  const dateNavigation = useDateNavigation();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <TabLayoutWrapper activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="space-y-6">
            <LifeLockDateNavigation
              currentDate={dateNavigation.currentDate}
              onDateChange={dateNavigation.setCurrentDate}
              onPreviousDay={dateNavigation.previousDay}
              onNextDay={dateNavigation.nextDay}
              onToday={dateNavigation.goToToday}
            />

            <LifeLockTabRenderer
              activeTab={activeTab}
              currentDate={dateNavigation.currentDate}
              lifeLockData={lifeLockData}
              refactoredLifeLockData={refactoredLifeLockData}
              onDateChange={dateNavigation.setCurrentDate}
              onCreateTask={handleCreateTask}
              onCreateHabit={handleCreateHabit}
              onCreateGoal={handleCreateGoal}
              onCreateJournalEntry={handleCreateJournalEntry}
            />
          </div>
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
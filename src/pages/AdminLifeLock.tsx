import React, { useMemo } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { format, addWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/components/ClerkProvider';
import { ThoughtDumpResults } from '@/ai-first/features/tasks/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/ai-first/features/tasks/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from '@/ai-first/features/dashboard/components/TabLayoutWrapper';
import { TodayProgressSection } from '@/ai-first/features/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '@/ai-first/features/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '@/ai-first/features/tasks/components/VoiceCommandSection';
import { PriorityTasksSection } from '@/ai-first/features/tasks/components/PriorityTasksSection';
import { QuickActionsSection } from '@/ai-first/features/tasks/ui/QuickActionsSection';
import { MonthlyProgressSection } from '@/ai-first/features/tasks/components/MonthlyProgressSection';
import { MorningRoutineSection } from '@/ai-first/features/tasks/components/MorningRoutineSection';
import { DeepFocusWorkSection } from '@/ai-first/features/tasks/components/DeepFocusWorkSection';
import { LightFocusWorkSection } from '@/ai-first/features/tasks/components/LightFocusWorkSection';
import { EnhancedLightWorkManager } from '@/components/ui/enhanced-light-work-manager';
import { NightlyCheckoutSection } from '@/ai-first/features/tasks/components/NightlyCheckoutSection';
import { HomeWorkoutSection } from '@/ai-first/features/tasks/components/HomeWorkoutSection';
import { HealthNonNegotiablesSection } from '@/ai-first/features/tasks/components/HealthNonNegotiablesSection';
import { TimeboxSection } from '@/ai-first/features/tasks/components/TimeboxSection';
import { useLifeLockData } from '@/hooks/useLifeLockData';
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '@/ai-first/core/tab-config';

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded } = useClerkUser();

  // DEVELOPMENT VALIDATION: Check that all tabs are handled (only runs once in dev)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handledTabs = new Set<string>([
        'morning', 'light-work', 'work', 'wellness', 'timebox', 'checkout', 'ai-chat'
      ]);
      const missingTabs = validateTabHandler(handledTabs);
      if (missingTabs.length === 0) {
        console.log('✅ All tabs properly handled in AdminLifeLock.tsx');
      }
    }
  }, []);
  
  // Parse date from URL or default to today - memoized to prevent infinite re-renders
  const selectedDate = useMemo(() => {
    return date ? new Date(date) : new Date();
  }, [date]);
  
  // Use custom hook for all LifeLock data and actions
  const {
    todayCard,
    weekCards,
    weekStart,
    isProcessingVoice,
    isAnalyzingTasks,
    lastThoughtDumpResult,
    eisenhowerResult,
    showEisenhowerModal,
    handleTaskToggle,
    handleCustomTaskAdd,
    handleVoiceCommand,
    handleOrganizeTasks,
    handleApplyOrganization,
    handleReanalyze,
    setLastThoughtDumpResult,
    setShowEisenhowerModal,
    setEisenhowerResult
  } = useLifeLockData(selectedDate);

  // Navigation handlers
  const handleCardClick = (card: any) => {
    navigate(`/admin/lifelock/day/${format(card.date, 'yyyy-MM-dd')}`);
  };

  const handleDateChange = (newDate: Date) => {
    navigate(`/admin/lifelock/day/${format(newDate, 'yyyy-MM-dd')}`);
  };

  const handleQuickAdd = () => {
    console.log('Quick add task');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // For week navigation within the day view
    const newDate = direction === 'next' ? addWeeks(selectedDate, 1) : addWeeks(selectedDate, -1);
    navigate(`/admin/lifelock/day/${format(newDate, 'yyyy-MM-dd')}`);
  };

  // Loading and auth guards

  if (!isLoaded) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!isSignedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="w-full h-full min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      <TabLayoutWrapper
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      >
        {(activeTab) => {
          // Runtime validation - ensures tab is valid
          if (!isValidTabId(activeTab)) {
            console.error(`🚨 Invalid tab ID: ${activeTab}`);
            return <div className="p-4 text-red-500">Invalid tab: {activeTab}</div>;
          }

          // TypeScript ensures we handle all cases
          switch (activeTab as TabId) {
            case 'morning':
              return (
                <MorningRoutineSection
                  todayCard={todayCard}
                  onViewDetails={handleCardClick}
                  onQuickAdd={handleQuickAdd}
                  onTaskToggle={handleTaskToggle}
                  onCustomTaskAdd={handleCustomTaskAdd}
                />
              );
            
            case 'focus':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <DeepFocusWorkSection selectedDate={selectedDate} />
                  <EnhancedLightWorkManager selectedDate={selectedDate} />
                  <QuickActionsSection
                    handleQuickAdd={handleQuickAdd}
                    handleOrganizeTasks={handleOrganizeTasks}
                    isAnalyzingTasks={isAnalyzingTasks}
                    todayCard={todayCard}
                  />
                </div>
              );
            
            case 'light':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <QuickActionsSection
                    handleQuickAdd={handleQuickAdd}
                    handleOrganizeTasks={handleOrganizeTasks}
                    isAnalyzingTasks={isAnalyzingTasks}
                    todayCard={todayCard}
                  />
                </div>
              );
            
            case 'light-work':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <LightFocusWorkSection selectedDate={selectedDate} />
                  <QuickActionsSection
                    handleQuickAdd={handleQuickAdd}
                    handleOrganizeTasks={handleOrganizeTasks}
                    isAnalyzingTasks={isAnalyzingTasks}
                    todayCard={todayCard}
                  />
                </div>
              );
            
            case 'work':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <DeepFocusWorkSection selectedDate={selectedDate} />
                  <QuickActionsSection
                    handleQuickAdd={handleQuickAdd}
                    handleOrganizeTasks={handleOrganizeTasks}
                    isAnalyzingTasks={isAnalyzingTasks}
                    todayCard={todayCard}
                  />
                </div>
              );
            
            case 'wellness':
              return (
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 pb-24">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      💪 Wellness & Health
                    </h1>
                    <p className="text-gray-400 text-sm">
                      Physical fitness and nutrition tracking for optimal health
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <HomeWorkoutSection selectedDate={selectedDate} />
                    <HealthNonNegotiablesSection selectedDate={selectedDate} />
                  </div>
                </div>
              );
            
            case 'timebox':
              return (
                <TimeboxSection selectedDate={selectedDate} />
              );
            
            case 'checkout':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <NightlyCheckoutSection selectedDate={selectedDate} />
                </div>
              );
            
            case 'ai-chat':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <VoiceCommandSection
                    onVoiceCommand={handleVoiceCommand}
                    isProcessingVoice={isProcessingVoice}
                  />
                </div>
              );
            
            default:
              return assertExhaustive(activeTab);
          }
        }}
      </TabLayoutWrapper>

      {/* Global Modals */}
      {lastThoughtDumpResult && (
        <ThoughtDumpResults
          result={lastThoughtDumpResult}
          onClose={() => setLastThoughtDumpResult(null)}
          onAddToSchedule={() => setLastThoughtDumpResult(null)}
        />
      )}

      {showEisenhowerModal && eisenhowerResult && (
        <EisenhowerMatrixModal
          result={eisenhowerResult}
          onClose={() => {
            setShowEisenhowerModal(false);
            setEisenhowerResult(null);
          }}
          onApplyOrganization={handleApplyOrganization}
          onReanalyze={handleReanalyze}
        />
      )}
    </div>
  );
};

export default AdminLifeLock;
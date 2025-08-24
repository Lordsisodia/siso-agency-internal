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
import { useLifeLockData } from '@/hooks/useLifeLockData';

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded } = useClerkUser();
  
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
          switch (activeTab) {
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
            
            case 'timebox':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <WeeklyViewSection
                    weekCards={weekCards}
                    weekStart={weekStart}
                    onCardClick={handleCardClick}
                    onNavigateWeek={navigateWeek}
                  />
                  <MonthlyProgressSection
                    selectedMonth={selectedDate}
                    selectedYear={getYear(selectedDate)}
                  />
                </div>
              );
            
            case 'checkout':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <NightlyCheckoutSection selectedDate={selectedDate} />
                </div>
              );
            
            case 'ai':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <VoiceCommandSection
                    onVoiceCommand={handleVoiceCommand}
                    isProcessingVoice={isProcessingVoice}
                  />
                </div>
              );
            
            default:
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <TodayProgressSection
                    todayCard={todayCard}
                    onViewDetails={handleCardClick}
                    onQuickAdd={handleQuickAdd}
                    onTaskToggle={handleTaskToggle}
                    onCustomTaskAdd={handleCustomTaskAdd}
                  />
                </div>
              );
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
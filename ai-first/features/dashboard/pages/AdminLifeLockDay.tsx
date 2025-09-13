import React from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/components/ClerkProvider';
import { ThoughtDumpResults } from '@/components/admin/lifelock/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/components/admin/lifelock/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from '@/components/admin/lifelock/TabLayoutWrapper';
import { TodayProgressSection } from '@/components/admin/lifelock/sections/TodayProgressSection';
import { WeeklyViewSection } from '@/components/admin/lifelock/sections/WeeklyViewSection';
import { VoiceCommandSection } from '@/components/admin/lifelock/sections/VoiceCommandSection';
import { PriorityTasksSection } from '@/components/admin/lifelock/sections/PriorityTasksSection';
import { QuickActionsSection } from '@/components/admin/lifelock/sections/QuickActionsSection';
import { MonthlyProgressSection } from '@/components/admin/lifelock/sections/MonthlyProgressSection';
import { useLifeLockData } from '@/shared/hooks/useLifeLockData';
import { MorningRoutineSection } from '@/ai-first/features/tasks/components/MorningRoutineSection';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded } = useClerkUser();
  
  // Parse date from URL or default to today
  const selectedDate = date ? new Date(date) : new Date();
  
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
    <AdminLayout>
      <TabLayoutWrapper
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      >
        {(activeTab) => {
          switch (activeTab) {
            case 'morning':
              return (
                <MorningRoutineSection />
              );
            
            case 'focus':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <PriorityTasksSection />
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
                  <TodayProgressSection
                    todayCard={todayCard}
                    onViewDetails={handleCardClick}
                    onQuickAdd={handleQuickAdd}
                    onTaskToggle={handleTaskToggle}
                    onCustomTaskAdd={handleCustomTaskAdd}
                  />
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
    </AdminLayout>
  );
};

export default AdminLifeLockDay;
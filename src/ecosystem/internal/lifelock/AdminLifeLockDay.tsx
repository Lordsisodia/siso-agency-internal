import React, { useMemo } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/ClerkProvider';
import { ThoughtDumpResults } from '@/ecosystem/internal/tasks/views/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/ecosystem/internal/tasks/modals/EisenhowerMatrixModal';
import { TabLayoutWrapper } from '@/ecosystem/internal/dashboard/components/TabLayoutWrapper';
import { TodayProgressSection } from '@/ecosystem/internal/tasks/sections/TodayProgressSection';
import { WeeklyViewSection } from '@/ecosystem/internal/tasks/sections/WeeklyViewSection';
import { VoiceCommandSection } from '@/ecosystem/internal/tasks/sections/VoiceCommandSection';
import { PriorityTasksSection } from '@/ecosystem/internal/tasks/sections/PriorityTasksSection';
import { QuickActionsSection } from '@/ecosystem/internal/tasks/sections/QuickActionsSection';
import { MonthlyProgressSection } from '@/ecosystem/internal/tasks/sections/MonthlyProgressSection';
import { MorningRoutineSection } from '@/ecosystem/internal/tasks/sections/MorningRoutineSection';
import { DeepFocusWorkSection } from '@/ecosystem/internal/tasks/sections/DeepFocusWorkSection-v2';
import { LightFocusWorkSection } from '@/ecosystem/internal/tasks/sections/LightFocusWorkSection-v2';
import { NightlyCheckoutSection } from '@/ecosystem/internal/tasks/sections/NightlyCheckoutSection';
import { HomeWorkoutSection } from '@/ecosystem/internal/tasks/sections/HomeWorkoutSection';
import { HealthNonNegotiablesSection } from '@/ecosystem/internal/tasks/sections/HealthNonNegotiablesSection';
import { TimeboxSection } from '@/ecosystem/internal/tasks/sections/TimeboxSection';
import { useLifeLockData } from '@/ecosystem/internal/lifelock/useLifeLockData';
import { useRefactoredLifeLockData } from '@/ecosystem/internal/lifelock/useRefactoredLifeLockData';
import { LoadingState } from '@/shared/ui/loading-state';
import { useImplementation } from '@/migration/feature-flags';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded } = useClerkUser();
  
  // Parse date from URL or default to today - memoized to prevent infinite re-renders
  const selectedDate = useMemo(() => {
    return date ? new Date(date) : new Date();
  }, [date]);
  
  // Use custom hook for all LifeLock data and actions
  const hookData = useImplementation(
    'useRefactoredLifeLockHooks',
    // NEW: Split focused hooks (226 lines → 6 focused hooks)
    useRefactoredLifeLockData(selectedDate),
    // OLD: Monolithic hook (fallback for safety)
    useLifeLockData(selectedDate)
  );

  // Extract data with safe destructuring
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
  } = hookData;

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
    return useImplementation(
      'useUnifiedLoadingState',
      // NEW: Unified loading state (safer, consistent, reusable)
      <AdminLayout>
        <LoadingState 
          message="Loading LifeLock Day..." 
          variant="spinner"
          size="lg"
          className="h-screen"
        />
      </AdminLayout>,
      // OLD: Original loading state (fallback for safety)
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
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
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
            
            case 'work':
              return (
                <div style={{ border: '2px solid red', padding: '20px', backgroundColor: 'yellow' }}>
                  <h1 style={{ color: 'black', fontSize: '24px' }}>DEBUG: Deep Work Section</h1>
                  <DeepFocusWorkSection selectedDate={selectedDate} />
                </div>
              );
            
            case 'light-work':
              return (
                <div style={{ border: '2px solid blue', padding: '20px', backgroundColor: 'lightgreen' }}>
                  <h1 style={{ color: 'black', fontSize: '24px' }}>DEBUG: Light Work Section</h1>
                  <LightFocusWorkSection selectedDate={selectedDate} />
                </div>
              );
            
            case 'timebox':
              return (
                <TimeboxSection selectedDate={selectedDate} />
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
            
            case 'checkout':
              return (
                <div className="p-4 sm:p-6 space-y-6">
                  <NightlyCheckoutSection selectedDate={selectedDate} />
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

export default AdminLifeLockDay;
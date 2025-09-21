import React, { useMemo } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/ClerkProvider';
import { ThoughtDumpResults } from "@/shared/components/ui";
import { EisenhowerMatrixModal } from "@/shared/components/ui";
import { TabLayoutWrapper } from '@/internal/lifelock/TabLayoutWrapper';
import { TodayProgressSection } from '@/ecosystem/internal/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '@/ecosystem/internal/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '@/ecosystem/internal/tasks/components/VoiceCommandSection';
import { PriorityTasksSection } from '@/ecosystem/internal/tasks/components/PriorityTasksSection';
import { QuickActionsSection } from '@/ecosystem/internal/tasks/ui/QuickActionsSection';
import { MonthlyProgressSection } from '@/ecosystem/internal/tasks/components/MonthlyProgressSection';
import { MorningRoutineSection } from './sections/MorningRoutineSection';
import { DeepFocusWorkSection } from './sections/DeepFocusWorkSection';
import { LightFocusWorkSection } from './sections/LightFocusWorkSection';
import { NightlyCheckoutSection } from './sections/NightlyCheckoutSection';
import { HomeWorkoutSection } from './sections/HomeWorkoutSection';
import { HealthNonNegotiablesSection } from './sections/HealthNonNegotiablesSection';
import { TimeboxSection } from './sections/TimeboxSection';
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
  const loadingImplementation = useImplementation(
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
  
  if (!isLoaded) {
    return loadingImplementation;
  }

  if (!isSignedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-black via-gray-900 to-black">
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
                <div className="h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 pb-24">
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

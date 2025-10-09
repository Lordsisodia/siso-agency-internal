import React, { useMemo, useEffect } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
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
import { AnimatedDateHeader } from '@/shared/ui/animated-date-header-v2';
import { useLifeLockData } from '@/ecosystem/internal/lifelock/useLifeLockData';
import { useRefactoredLifeLockData } from '@/ecosystem/internal/lifelock/useRefactoredLifeLockData';
import { LoadingState } from '@/shared/ui/loading-state';
import { useImplementation } from '@/migration/feature-flags';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded, user } = useClerkUser();

  // Debug logging
  useEffect(() => {
    console.log('🔍 [ADMIN-DAY] Clerk user:', { isSignedIn, isLoaded, userId: user?.id });
  }, [isSignedIn, isLoaded, user?.id]);

  const internalUserId = useSupabaseUserId(user?.id || null);
  
  // Debug logging for internalUserId
  useEffect(() => {
    console.log('🔍 [ADMIN-DAY] internalUserId changed:', internalUserId);
  }, [internalUserId]);
  
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

  // Debug: Log every render of AdminLifeLockDay
  console.log('🔍 [ADMIN-DAY] RENDER:', { internalUserId, selectedDate: format(selectedDate, 'yyyy-MM-dd') });

  return (
    <>
      <TabLayoutWrapper
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        userId={internalUserId}
      >
        {(activeTab) => {
          console.log('🔍 [ADMIN-DAY] Children function called:', { activeTab, internalUserId });
          switch (activeTab) {
            case 'morning':
              return (
                <MorningRoutineSection
                  selectedDate={selectedDate}
                />
              );
            
            case 'work':
              return (
                <DeepFocusWorkSection selectedDate={selectedDate} />
              );

            case 'light-work':
              return (
                <LightFocusWorkSection selectedDate={selectedDate} />
              );
            
            case 'timebox':
              return (
                <TimeboxSection selectedDate={selectedDate} userId={internalUserId || undefined} />
              );
            
            case 'wellness':
              return (
                <div className="space-y-6">
                  <AnimatedDateHeader
                    selectedDate={selectedDate}
                    earnedXP={0}
                    potentialXP={0}
                    currentLevel={1}
                    streakDays={0}
                    badgeCount={0}
                    colorScheme="green"
                  />
                  <HomeWorkoutSection selectedDate={selectedDate} />
                  <HealthNonNegotiablesSection selectedDate={selectedDate} />
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
    </>
  );
};

export default AdminLifeLockDay;

import React, { useMemo, useEffect, useState } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { ThoughtDumpResults } from "@/shared/components/ui";
import { EisenhowerMatrixModal } from "@/shared/components/ui";
import { LifeLockViewRenderer } from './core/LifeLockViewRenderer';
import { useLifeLockData } from '@/ecosystem/internal/lifelock/useLifeLockData';
import { useRefactoredLifeLockData } from '@/ecosystem/internal/lifelock/useRefactoredLifeLockData';
import { LoadingState } from '@/shared/ui/loading-state';
import { useImplementation } from '@/migration/feature-flags';
import { calculateDayCompletionPercentage } from '@/utils/dayProgress';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const { isSignedIn, isLoaded, user } = useClerkUser();

  const internalUserId = useSupabaseUserId(user?.id || null);

  // State for real-time day progress updates (same as AdminLifeLock.tsx)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for real-time day progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Parse date from URL or default to today - memoized to prevent infinite re-renders
  const selectedDate = useMemo(() => {
    return date ? new Date(date) : new Date();
  }, [date]);

  // Compute day progress percentage using utility function
  const dayCompletionPercentage = calculateDayCompletionPercentage(currentTime);
  
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
    navigate(`/admin/life-lock/daily/${format(card.date, 'yyyy-MM-dd')}`);
  };

  const handleDateChange = (newDate: Date) => {
    navigate(`/admin/life-lock/daily/${format(newDate, 'yyyy-MM-dd')}`);
  };

  const handleQuickAdd = () => {
    console.log('Quick add task');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // For week navigation within the day view
    const newDate = direction === 'next' ? addWeeks(selectedDate, 1) : addWeeks(selectedDate, -1);
    navigate(`/admin/life-lock/daily/${format(newDate, 'yyyy-MM-dd')}`);
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
    <>
      {/* NEW: Using LifeLockViewRenderer with CORRECT components from SafeTabContentRenderer */}
      <LifeLockViewRenderer
        view="daily"
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        userId={internalUserId}
        hideBottomNav={false}
        dayCompletionPercentage={dayCompletionPercentage}
      />

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

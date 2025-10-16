import React, { useMemo, useEffect, useState } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { ThoughtDumpResults } from "@/shared/components/ui";
import { EisenhowerMatrixModal } from "@/shared/components/ui";
import { LifeLockViewRenderer } from './core/LifeLockViewRenderer';
import { useLifeLockData } from '@/ecosystem/internal/lifelock/useLifeLockData';
import { useRefactoredLifeLockData } from '@/ecosystem/internal/lifelock/useRefactoredLifeLockData';
import { LoadingState } from '@/shared/ui/loading-state';
import { selectImplementation } from '@/migration/feature-flags';
import { calculateDayCompletionPercentage } from '@/utils/dayProgress';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Parse date from query params or default to today - memoized to prevent infinite re-renders
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  }, [searchParams]);

  // Compute day progress percentage using utility function
  const dayCompletionPercentage = calculateDayCompletionPercentage(currentTime);
  
  // Use custom hook for all LifeLock data and actions
  const hookData = selectImplementation(
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

  // Navigation handlers - all use clean URL with query params
  const handleCardClick = (card: any) => {
    const cardDate = format(card.date, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    // Use query param for date selection
    if (cardDate === today) {
      // Today - no query param needed
      navigate('/admin/lifelock/daily');
    } else {
      // Other dates - use query param
      navigate(`/admin/lifelock/daily?date=${cardDate}`);
    }
  };

  const handleDateChange = (newDate: Date) => {
    const selectedDateStr = format(newDate, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    // Use query param for date selection
    if (selectedDateStr === today) {
      // Today - no query param needed
      navigate('/admin/lifelock/daily');
    } else {
      // Other dates - use query param
      navigate(`/admin/lifelock/daily?date=${selectedDateStr}`);
    }
  };

  const handleQuickAdd = () => {
    console.log('Quick add task');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // For week navigation within the day view
    const newDate = direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
    const selectedDateStr = format(newDate, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    // Use query param for date selection
    if (selectedDateStr === today) {
      // Today - no query param needed
      navigate('/admin/lifelock/daily');
    } else {
      // Other dates - use query param
      navigate(`/admin/lifelock/daily?date=${selectedDateStr}`);
    }
  };

  // Loading and auth guards
  const loadingImplementation = selectImplementation(
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
    <AdminLayout>
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
    </AdminLayout>
  );
};

export default AdminLifeLockDay;

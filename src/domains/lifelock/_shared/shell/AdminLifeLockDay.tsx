import React, { useMemo, useEffect, useState } from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { format, addWeeks, subWeeks, getYear, parse, isValid } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { useGamificationInit } from '@/domains/lifelock/_shared/hooks/useGamificationInit';
import { ThoughtDumpResults } from "@/components/shared/ui";
import { EisenhowerMatrixModal } from "@/components/shared/ui";
import { LifeLockViewRenderer } from '@/domains/lifelock/_shared/core/LifeLockViewRenderer';
import { useRefactoredLifeLockData } from '@/domains/lifelock/_shared/core/useRefactoredLifeLockData';
import { LoadingState } from '@/components/ui/loading-state';
import { selectImplementation } from '@/lib/utils/feature-flags';
import { calculateDayCompletionPercentage } from '@/lib/utils/api/dayProgress';

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSignedIn, isLoaded, user } = useClerkUser();

  const internalUserId = useSupabaseUserId(user?.id || null);

  // Parse date from query params or default to today - memoized to prevent infinite re-renders
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    if (!dateParam) {
      return new Date();
    }

    const parsed = parse(dateParam, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      return parsed;
    }

    // Fallback to native parsing (e.g., legacy URLs with timestamps)
    const fallback = new Date(dateParam);
    return isValid(fallback) ? fallback : new Date();
  }, [searchParams]);

  // 🎮 Initialize XP/Gamification system
  useGamificationInit();

  // State for real-time day progress updates (same as AdminLifeLock.tsx)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for real-time day progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Compute day progress percentage using utility function
  const dayCompletionPercentage = calculateDayCompletionPercentage(currentTime);
  
  // Use custom hook for all LifeLock data and actions
  const hookData = useRefactoredLifeLockData(selectedDate);

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

  // REMOVED: Auth check - now publicly accessible for testing
  // If user is not signed in, internalUserId will be null and the UI will work in demo mode
  console.log('🔓 LifeLock Daily accessible in demo mode - authentication optional');

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

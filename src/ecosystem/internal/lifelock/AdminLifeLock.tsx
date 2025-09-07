import React, { useMemo, useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { format, addWeeks, getYear, isToday } from 'date-fns';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/components/ClerkProvider';
import { ThoughtDumpResults } from '../../ai-first/features/tasks/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '../../ai-first/features/tasks/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from '../../ai-first/features/dashboard/components/TabLayoutWrapper';
import { TodayProgressSection } from '../../ai-first/features/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '../../ai-first/features/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '../../ai-first/features/tasks/components/VoiceCommandSection';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';
import { CleanDateNav } from '@/components/ui/clean-date-nav';
import { PriorityTasksSection } from '../../ai-first/features/tasks/components/PriorityTasksSection';
import { QuickActionsSection } from '../../ai-first/features/tasks/ui/QuickActionsSection';
import { MonthlyProgressSection } from '../../ai-first/features/tasks/components/MonthlyProgressSection';
import { MorningRoutineTab } from '../../ai-first/features/tasks/components/MorningRoutineTab';
import { LightWorkTab } from '@/components/tabs/LightWorkTab';
import { DeepFocusTab } from '../../ai-first/features/tasks/components/DeepFocusTab';
import { TimeBoxTab } from '../../ai-first/features/tasks/components/TimeBoxTab';
import { NightlyCheckoutTab } from '../../ai-first/features/tasks/components/NightlyCheckoutTab';
import { useLifeLockData } from '@/hooks/useLifeLockData';
import { useRefactoredLifeLockData } from '@/refactored/hooks/useRefactoredLifeLockData';
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '../../ai-first/core/tab-config';
import { TabContentRenderer } from '@/refactored/components/TabContentRenderer';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { LoadingState } from '@/components/ui/loading-state';
import { theme } from '@/styles/theme';
import { SimpleFeedbackButton } from '@/components/feedback/SimpleFeedbackButton';

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn, isLoaded } = useClerkUser();

  // DEVELOPMENT VALIDATION: Check that all tabs are handled (only runs once in dev)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handledTabs = new Set<string>([
        'morning', 'light-work', 'work', 'wellness', 'timebox', 'checkout'
      ]);
      const missingTabs = validateTabHandler(handledTabs);
      if (missingTabs.length === 0) {
        console.log('✅ All tabs properly handled in AdminLifeLock.tsx');
      }
    }
  }, []);
  
  // Add missing state variables for Tab components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Parse date from URL params or search params, or default to today
  const selectedDate = useMemo(() => {
    // First try URL path parameter (for day routes like /admin/lifelock/day/2025-08-26)
    if (date) {
      console.log('📅 Using URL path date:', date);
      return new Date(date);
    }
    // Then try search parameter (for main routes like /admin/lifelock?date=2025-08-26)
    const dateParam = searchParams.get('date');
    if (dateParam) {
      console.log('📅 Using search param date:', dateParam);
      return new Date(dateParam);
    }
    // Default to today
    console.log('📅 Using default date (today)');
    return new Date();
  }, [date, searchParams]);
  
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

  // State to force real-time updates
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date());
    
    // Update every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Cleanup timer on unmount
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array - run once on mount

  // Calculate day completion percentage based on time progression
  const dayCompletionPercentage = useMemo(() => {
    // Use currentTime state instead of new Date() for real-time updates
    const now = currentTime;
    
    // Only show progress if we're viewing today's date
    if (!isToday(selectedDate)) {
      return 0;
    }
    
    // Calculate how much of the day has passed
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const totalMinutesInDay = 24 * 60; // 1440 minutes
    const currentMinutesElapsed = (currentHour * 60) + currentMinute;
    
    const percentage = (currentMinutesElapsed / totalMinutesInDay) * 100;
    
    console.log('⏰ Day progress calculation:', {
      time: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      isToday: isToday(selectedDate),
      minutesElapsed: currentMinutesElapsed,
      percentage: Math.round(percentage)
    });
    
    return Math.min(percentage, 100); // Cap at 100%
  }, [selectedDate, currentTime]);

  // Navigation handlers
  const handleCardClick = (card: any) => {
    navigate(`/admin/lifelock/day/${format(card.date, 'yyyy-MM-dd')}`);
  };

  const handleDateChange = (newDate: Date) => {
    // Stay on the same route, just update the date parameter
    const currentTab = new URLSearchParams(window.location.search).get('tab') || 'morning';
    const newDateStr = format(newDate, 'yyyy-MM-dd');
    console.log('🔄 Date navigation:', {
      from: format(selectedDate, 'yyyy-MM-dd'),
      to: newDateStr,
      tab: currentTab
    });
    navigate(`/admin/lifelock?tab=${currentTab}&date=${newDateStr}`);
  };
  
  // Date navigation - arrows navigate between different days

  const handleQuickAdd = () => {
    console.log('Quick add task');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    // For week navigation within the same view
    const newDate = direction === 'next' ? addWeeks(selectedDate, 1) : addWeeks(selectedDate, -1);
    const currentTab = new URLSearchParams(window.location.search).get('tab') || 'morning';
    navigate(`/admin/lifelock?tab=${currentTab}&date=${format(newDate, 'yyyy-MM-dd')}`);
  };

  // Loading and auth guards

  if (!isLoaded) {
    return useImplementation(
      'useUnifiedLoadingState',
      // NEW: Unified loading state (safer, consistent, reusable)
      <AdminLayout>
        <LoadingState 
          message="Loading LifeLock..." 
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
    <div className={useImplementation(
      'useUnifiedThemeSystem',
      // NEW: Unified theme system (12,000+ CSS classes → centralized theme)
      `w-full h-full ${theme.themes.layout.page} overflow-hidden`,
      // OLD: Original classes (fallback for safety)  
      'w-full h-full min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black'
    )}>
      <TabLayoutWrapper
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      >
        {(activeTab, navigateDay) => {
          // Runtime validation - ensures tab is valid
          if (!isValidTabId(activeTab)) {
            console.error(`🚨 Invalid tab ID: ${activeTab}`);
            return <div className="p-4 text-red-500">Invalid tab: {activeTab}</div>;
          }

          // Common props for all tab components
          const commonTabProps = {
            user,
            selectedDate,
            todayCard,
            weekCards,
            refreshTrigger,
            onRefresh: () => setRefreshTrigger(prev => prev + 1),
            onTaskToggle: handleTaskToggle,
            onQuickAdd: handleQuickAdd,
            onCustomTaskAdd: handleCustomTaskAdd,
            onVoiceCommand: handleVoiceCommand,
            onCardClick: handleCardClick,
            onNavigateWeek: navigateWeek,
            onOrganizeTasks: handleOrganizeTasks,
            isProcessingVoice,
            isAnalyzingTasks,
            lastThoughtDumpResult,
            eisenhowerResult,
            showEisenhowerModal,
            onCloseEisenhowerModal: () => setShowEisenhowerModal(false),
            onApplyOrganization: handleApplyOrganization,
            onReanalyze: handleReanalyze
          };

          // Feature flag: Use refactored TabContentRenderer or fallback to original switch
          return useImplementation(
            'useRefactoredAdminLifeLock',
            // NEW: Configuration-driven rendering (220 lines → 10 lines)
            <TabContentRenderer
              activeTab={activeTab}
              layoutProps={{
                selectedDate,
                dayCompletionPercentage,
                navigateDay,
                handleQuickAdd,
                handleOrganizeTasks,
                handleVoiceCommand,
                isAnalyzingTasks,
                isProcessingVoice,
                todayCard
              }}
            />,
            // OLD: Original 220-line switch statement (fallback for safety)
            (() => {
              switch (activeTab as TabId) {
                case 'morning':
                  return (
                    <div className="h-full flex flex-col">
                      <div className="flex-1">
                        <MorningRoutineTab {...commonTabProps} />
                      </div>
                      <div className="px-4 pb-4">
                        <SimpleFeedbackButton />
                      </div>
                    </div>
                  );
                
                case 'focus':
                case 'work':
                  return <DeepFocusTab {...commonTabProps} />;
                
                case 'light':
                  return (
                    <LightWorkTab
                      user={user}
                      todayCard={todayCard}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onCardClick={handleCardClick}
                    />
                  );
                
                case 'light-work':
                  return (
                    <LightWorkTab
                      user={user}
                      selectedDate={selectedDate}
                      todayCard={todayCard}
                      weekCards={weekCards}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onVoiceCommand={handleVoiceCommand}
                      onCardClick={handleCardClick}
                      onNavigateWeek={navigateWeek}
                      onOrganizeTasks={handleOrganizeTasks}
                      isProcessingVoice={isProcessingVoice}
                      isAnalyzingTasks={isAnalyzingTasks}
                      lastThoughtDumpResult={lastThoughtDumpResult}
                      eisenhowerResult={eisenhowerResult}
                      showEisenhowerModal={showEisenhowerModal}
                      onCloseEisenhowerModal={() => setShowEisenhowerModal(false)}
                      onApplyOrganization={handleApplyOrganization}
                      onReanalyze={handleReanalyze}
                    />
                  );
                
                case 'work':
                  return (
                    <DeepFocusTab
                      user={user}
                      todayCard={todayCard}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onCardClick={handleCardClick}
                    />
                  );
                
                case 'wellness':
                  // Use TimeBoxTab as wellness/health planning interface
                  return (
                    <TimeBoxTab
                      user={user}
                      todayCard={todayCard}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onCardClick={handleCardClick}
                    />
                  );
                
                case 'timebox':
                  return (
                    <TimeBoxTab
                      user={user}
                      todayCard={todayCard}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onCardClick={handleCardClick}
                    />
                  );
                
                case 'checkout':
                  return (
                    <NightlyCheckoutTab
                      user={user}
                      todayCard={todayCard}
                      refreshTrigger={refreshTrigger}
                      onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                      onTaskToggle={handleTaskToggle}
                      onQuickAdd={handleQuickAdd}
                      onCustomTaskAdd={handleCustomTaskAdd}
                      onCardClick={handleCardClick}
                    />
                  );
                
                default:
                  return assertExhaustive(activeTab);
              }
            })()
          );
        }}
      </TabLayoutWrapper>

      {/* Feedback Button - positioned at bottom of page, above navigation */}
      <div className="px-4 pb-4">
        <SimpleFeedbackButton />
      </div>

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
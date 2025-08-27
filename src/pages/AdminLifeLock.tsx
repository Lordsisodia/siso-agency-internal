import React, { useMemo } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { format, addWeeks, getYear } from 'date-fns';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useClerkUser } from '@/components/ClerkProvider';
import { ThoughtDumpResults } from '@/ai-first/features/tasks/ui/ThoughtDumpResults';
import { EisenhowerMatrixModal } from '@/ai-first/features/tasks/ui/EisenhowerMatrixModal';
import { TabLayoutWrapper } from '@/ai-first/features/dashboard/components/TabLayoutWrapper';
import { TodayProgressSection } from '@/ai-first/features/tasks/components/TodayProgressSection';
import { WeeklyViewSection } from '@/ai-first/features/tasks/components/WeeklyViewSection';
import { VoiceCommandSection } from '@/ai-first/features/tasks/components/VoiceCommandSection';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';
import { CleanDateNav } from '@/components/ui/clean-date-nav';
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
import { useRefactoredLifeLockData } from '@/refactored/hooks/useRefactoredLifeLockData';
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '@/ai-first/core/tab-config';
import { TabContentRenderer } from '@/refactored/components/TabContentRenderer';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { LoadingState } from '@/components/ui/loading-state';
import { theme } from '@/styles/theme';

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const [searchParams] = useSearchParams();
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

  // Calculate day completion percentage
  const dayCompletionPercentage = useMemo(() => {
    console.log('🔍 Calculating completion - todayCard:', todayCard);
    
    if (!todayCard) {
      console.log('❌ No todayCard data');
      return 25; // Show demo progress for now
    }
    
    // Get all tasks from today card
    const allTasks = [
      ...(todayCard.morningTasks || []),
      ...(todayCard.lightWorkTasks || []),
      ...(todayCard.deepWorkTasks || [])
    ];
    
    console.log('📋 All tasks found:', allTasks.length, allTasks);
    
    if (allTasks.length === 0) {
      console.log('⚠️ No tasks found, showing demo progress');
      return 45; // Show demo progress
    }
    
    const completedTasks = allTasks.filter(task => task.completed);
    const percentage = (completedTasks.length / allTasks.length) * 100;
    
    console.log('✅ Completion calculation:', {
      total: allTasks.length,
      completed: completedTasks.length,
      percentage: Math.round(percentage)
    });
    
    return percentage;
  }, [todayCard]);

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
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <MorningRoutineSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'focus':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <DeepFocusWorkSection selectedDate={selectedDate} />
                        <QuickActionsSection
                          handleQuickAdd={handleQuickAdd}
                          handleOrganizeTasks={handleOrganizeTasks}
                          isAnalyzingTasks={isAnalyzingTasks}
                          todayCard={todayCard}
                        />
                      </div>
                    </div>
                  );
                
                case 'light':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <QuickActionsSection
                          handleQuickAdd={handleQuickAdd}
                          handleOrganizeTasks={handleOrganizeTasks}
                          isAnalyzingTasks={isAnalyzingTasks}
                          todayCard={todayCard}
                        />
                      </div>
                    </div>
                  );
                
                case 'light-work':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <LightFocusWorkSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'work':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <DeepFocusWorkSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'wellness':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <HomeWorkoutSection selectedDate={selectedDate} />
                        <HealthNonNegotiablesSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'timebox':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <TimeboxSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'checkout':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system
                      `${theme.themes.layout.page} p-4 pb-24`,
                      // OLD: Original classes (fallback for safety)
                      'min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24'
                    )}>
                      <CleanDateNav 
                        selectedDate={selectedDate}
                        completionPercentage={dayCompletionPercentage}
                        className="mb-6"
                        onPreviousDate={() => navigateDay?.('prev')}
                        onNextDate={() => navigateDay?.('next')}
                      />
                      <div className="space-y-6">
                        <NightlyCheckoutSection selectedDate={selectedDate} />
                      </div>
                    </div>
                  );
                
                case 'ai-chat':
                  return (
                    <div className={useImplementation(
                      'useUnifiedThemeSystem',
                      // NEW: Unified theme system (special case: h-screen instead of min-h-screen)
                      `relative overflow-hidden ${theme.gradients.diagonal.grayToBlack} h-screen`,
                      // OLD: Original classes (fallback for safety)
                      'relative h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden'
                    )}>
                      <div className="p-4">
                        <CleanDateNav 
                          selectedDate={selectedDate}
                          completionPercentage={dayCompletionPercentage}
                          className="mb-6"
                          onPreviousDate={() => navigateDay?.('prev')}
                          onNextDate={() => navigateDay?.('next')}
                        />
                      </div>
                      <div className="px-4 pb-4">
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <SisoIcon className="w-8 h-8 text-orange-500" />
                            <h1 className="text-xl font-bold text-white">AI Chat Assistant</h1>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Voice and text-powered AI assistant for managing your life and tasks
                          </p>
                        </div>
                      </div>
                      <div className="h-full overflow-y-auto p-4 pb-32">
                        <div className="max-w-4xl mx-auto space-y-4">
                          <div className="text-center text-gray-500 text-sm mt-20">
                            Start a conversation by typing or using voice commands below
                          </div>
                        </div>
                      </div>
                      <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
                        <div className="max-w-4xl mx-auto">
                          <div className="bg-black/90 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4 shadow-2xl">
                            <PromptInputBox
                              onSend={(message, files) => {
                                handleVoiceCommand(message);
                              }}
                              isLoading={isProcessingVoice}
                              placeholder="Ask me anything about your tasks, schedule, or life management..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                
                default:
                  return assertExhaustive(activeTab);
              }
            })()
          );
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
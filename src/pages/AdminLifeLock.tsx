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
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';
import { AnimatedDateHeader } from '@/components/ui/animated-date-header-v2';
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
import { TabId, validateTabHandler, assertExhaustive, isValidTabId } from '@/ai-first/core/tab-config';

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
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
  
  // Date navigation - arrows navigate between different days

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
        {(activeTab, navigateDay) => {
          // Runtime validation - ensures tab is valid
          if (!isValidTabId(activeTab)) {
            console.error(`🚨 Invalid tab ID: ${activeTab}`);
            return <div className="p-4 text-red-500">Invalid tab: {activeTab}</div>;
          }

          // TypeScript ensures we handle all cases
          switch (activeTab as TabId) {
            case 'morning':
              return (
                <MorningRoutineSection
                  selectedDate={selectedDate}
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
            
            case 'light-work':
              return (
                <LightFocusWorkSection 
                  selectedDate={selectedDate}
                  onPreviousDate={() => navigateDay?.('prev')}
                  onNextDate={() => navigateDay?.('next')}
                />
              );
            
            case 'work':
              return (
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
                  {/* Clean Animated Header */}
                  <AnimatedDateHeader 
                    selectedDate={selectedDate}
                    earnedXP={150} // TODO: Calculate actual work XP
                    potentialXP={75} // TODO: Calculate potential work XP
                    currentLevel={2}
                    streakDays={5} // TODO: Implement work streak tracking
                    badgeCount={2} // TODO: Implement work badge system
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
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
                  {/* Clean Animated Header */}
                  <AnimatedDateHeader 
                    selectedDate={selectedDate}
                    earnedXP={125} // TODO: Calculate actual wellness XP
                    potentialXP={75} // TODO: Calculate potential wellness XP
                    currentLevel={2}
                    streakDays={7} // TODO: Implement wellness streak tracking
                    badgeCount={3} // TODO: Implement wellness badge system
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
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
                  {/* Clean Animated Header */}
                  <AnimatedDateHeader 
                    selectedDate={selectedDate}
                    earnedXP={200} // TODO: Calculate actual timebox XP
                    potentialXP={100} // TODO: Calculate potential timebox XP
                    currentLevel={3}
                    streakDays={12} // TODO: Implement timebox streak tracking
                    badgeCount={4} // TODO: Implement timebox badge system
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
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pb-24">
                  {/* Clean Animated Header */}
                  <AnimatedDateHeader 
                    selectedDate={selectedDate}
                    earnedXP={180} // TODO: Calculate actual checkout XP
                    potentialXP={60} // TODO: Calculate potential checkout XP
                    currentLevel={2}
                    streakDays={8} // TODO: Implement checkout streak tracking
                    badgeCount={3} // TODO: Implement checkout badge system
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
                <div className="relative h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
                  {/* Header with SISO logo and title */}
                  <div className="p-4 border-b border-gray-800">
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <SisoIcon className="w-8 h-8 text-orange-500" />
                        <h1 className="text-xl font-bold text-white">
                          AI Chat Assistant
                        </h1>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Voice and text-powered AI assistant for managing your life and tasks
                      </p>
                    </div>
                  </div>
                  
                  {/* Chat messages area - with bottom padding for fixed input */}
                  <div className="h-full overflow-y-auto p-4 pb-32">
                    <div className="max-w-4xl mx-auto space-y-4">
                      {/* Chat messages will go here */}
                      <div className="text-center text-gray-500 text-sm mt-20">
                        Start a conversation by typing or using voice commands below
                      </div>
                    </div>
                  </div>
                  
                  {/* Fixed input at bottom with gap */}
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
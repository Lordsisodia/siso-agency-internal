import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/domains/admin/components-from-root/layout/AdminLayout';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, getYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MobileTodayCard } from '@/domains/admin/components-from-root/lifelock/ui/MobileTodayCard';
import { StatisticalWeekView } from '@/domains/admin/components-from-root/lifelock/ui/StatisticalWeekView';
import { MobileMicrophoneButton } from '@/domains/admin/components-from-root/lifelock/ui/MobileMicrophoneButton';
import { useClerkUser } from '@/components/ClerkProvider';
import { PersonalTaskCard, personalTaskService } from '@/services/shared/task.service';
import { ClerkHybridTaskService } from '@/services/shared/auth.service';
import { lifeLockVoiceTaskProcessor, ThoughtDumpResult } from '@/domains/lifelock/_shared/services/lifeLockVoiceTaskProcessor';
import { ThoughtDumpResults } from "@/components/shared/ui";
import { eisenhowerMatrixOrganizer, EisenhowerMatrixResult } from '@/services/shared/task.service';
import { EisenhowerMatrixModal } from "@/components/shared/ui";
import { Lock, Calendar } from 'lucide-react';
import { FloatingAIAssistant } from '@/domains/admin/components-from-shared/FloatingAIAssistant';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    workType: 'LIGHT' | 'DEEP';
    priority?: string;
  }[];
}

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [view, setView] = useState<'week' | 'month'>('week');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Task management state
  const [todayCard, setTodayCard] = useState<TaskCard | null>(null);
  const [weekCards, setWeekCards] = useState<TaskCard[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isAnalyzingTasks, setIsAnalyzingTasks] = useState(false);
  const [lastThoughtDumpResult, setLastThoughtDumpResult] = useState<ThoughtDumpResult | null>(null);
  const [eisenhowerResult, setEisenhowerResult] = useState<EisenhowerMatrixResult | null>(null);
  const [showEisenhowerModal, setShowEisenhowerModal] = useState(false);

  // Initialize hybrid service and clear caches on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add timeout to prevent hanging
        const initPromise = ClerkHybridTaskService.initialize();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 5000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        console.log('✅ [APP] Hybrid service initialized with auto-migration');
      } catch (error) {
        console.error('❌ [APP] Hybrid service initialization failed:', error);
      }
      
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
    };

    initializeApp();
  }, []);

  // Load tasks for current week
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    const loadWeekTasks = async () => {
      try {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekTaskCards: TaskCard[] = await Promise.all(
          weekDays.map(async (day) => {
            try {
              const dayTasks = await personalTaskService.getTasksForDate(user.id, day);
              const tasksArray = Array.isArray(dayTasks) ? dayTasks : [];
              return {
                id: format(day, 'yyyy-MM-dd'),
                date: day,
                title: format(day, 'EEEE, MMM d'),
                completed: tasksArray.every(task => task.completed),
                tasks: tasksArray.map(task => ({
                  id: task.id,
                  title: task.title,
                  completed: task.completed,
                  workType: task.workType ?? 'LIGHT',
                  priority: task.priority
                }))
              };
            } catch (dayError) {
              console.error(`Failed to load tasks for ${format(day, 'yyyy-MM-dd')}:`, dayError);
              return {
                id: format(day, 'yyyy-MM-dd'),
                date: day,
                title: format(day, 'EEEE, MMM d'),
                completed: false,
                tasks: []
              };
            }
          })
        );

        const currentTodayCard = weekTaskCards.find(
          card => card.id === format(new Date(), 'yyyy-MM-dd')
        ) ?? null;

        if (!isCancelled) {
          setWeekCards(weekTaskCards);
          setTodayCard(currentTodayCard);
        }
      } catch (error) {
        console.error('Failed to load week tasks:', error);
        if (!isCancelled) {
          setWeekCards([]);
          setTodayCard(null);
        }
      }
    };

    loadWeekTasks();

    return () => {
      isCancelled = true;
    };
  }, [user, currentDate, refreshTrigger]);

  const weekStart = React.useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = React.useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleCardClick = (card: TaskCard) => {
    // Navigate to the individual day page with tabs
    navigate(`/admin/lifelock/day/${format(card.date, 'yyyy-MM-dd')}`);
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      const allTasks = weekCards.flatMap(card => card.tasks);
      const targetTask = allTasks.find(task => task.id === taskId);
      const workType = targetTask?.workType ?? 'LIGHT';
      await personalTaskService.toggleTask(taskId, workType, targetTask?.completed);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleQuickAdd = () => {
    // Navigate to today's page with morning tab
    navigate(`/admin/lifelock/day/${format(new Date(), 'yyyy-MM-dd')}?tab=morning`);
  };

  const handleCustomTaskAdd = async (task: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      if (!user?.id) {
        throw new Error('User not available');
      }
      await personalTaskService.addTask(task.title, new Date(), task.priority, 'LIGHT', user.id);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessingVoice(true);
    try {
      const result = await lifeLockVoiceTaskProcessor.processVoiceInput(command, new Date());
      setLastThoughtDumpResult(result);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Voice processing failed:', error);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleOrganizeTasks = async () => {
    if (!todayCard || todayCard.tasks.length === 0) return;
    
    setIsAnalyzingTasks(true);
    try {
      const result = await eisenhowerMatrixOrganizer.organizeTasks(todayCard.tasks);
      setEisenhowerResult(result);
      setShowEisenhowerModal(true);
    } catch (error) {
      console.error('Task organization failed:', error);
    } finally {
      setIsAnalyzingTasks(false);
    }
  };

  const handleApplyOrganization = async () => {
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReanalyze = () => {
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    handleOrganizeTasks();
  };

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
      <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black pb-96">
        <div className="p-4 sm:p-6 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Life Lock Header */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-orange-400/20 p-6 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-300/20">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Life Lock
                </h1>
                <p className="text-gray-300 text-base font-medium">
                  Daily progress tracking system
                </p>
              </div>
            </div>
          </div>

          {/* Today's Progress - Mobile Compact View */}
          <MobileTodayCard
            card={todayCard}
            onViewDetails={handleCardClick}
            onQuickAdd={handleQuickAdd}
            onTaskToggle={handleTaskToggle}
            onCustomTaskAdd={handleCustomTaskAdd}
            className="mb-6"
          />

          {/* Weekly Statistical View */}
          <StatisticalWeekView
            weekCards={weekCards}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onCardClick={handleCardClick}
            onNavigateWeek={navigateWeek}
          />

          {/* Monthly Progress Overview */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-sm"></div>
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Monthly Progress
                  </h2>
                  <p className="text-purple-200/80 text-sm font-medium">
                    {format(selectedMonth, 'MMMM yyyy')} • Day {format(new Date(), 'd')} of {format(new Date(), 'dd')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-15 gap-2 mb-4">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dayDate = new Date(selectedYear, selectedMonth.getMonth(), day);
                  const isToday = day === new Date().getDate() && selectedMonth.getMonth() === new Date().getMonth();
                  const isPast = dayDate < new Date() && !isToday;
                  const isCurrentMonth = dayDate.getMonth() === selectedMonth.getMonth();
                  
                  if (!isCurrentMonth) return null;
                  
                  const completionRate = isPast ? Math.random() * 100 : isToday ? 50 : 0;
                  
                  return (
                    <div 
                      key={day} 
                      className="flex flex-col items-center space-y-1 cursor-pointer"
                      onClick={() => handleCardClick({ 
                        id: format(dayDate, 'yyyy-MM-dd'), 
                        date: dayDate, 
                        title: format(dayDate, 'EEEE, MMM d'), 
                        completed: false, 
                        tasks: [] 
                      })}
                    >
                      <div className="text-xs text-gray-400 font-medium">{day}</div>
                      <div 
                        className={`w-3 h-3 rounded-full border transition-all duration-200 hover:scale-110 ${
                          isToday 
                            ? 'border-orange-400 bg-orange-400/50 shadow-md shadow-orange-500/30' 
                            : completionRate >= 80 
                              ? 'border-emerald-400 bg-emerald-400/80' 
                              : completionRate >= 50 
                                ? 'border-amber-400 bg-amber-400/80' 
                                : completionRate > 0 
                                  ? 'border-orange-400 bg-orange-400/60' 
                                  : 'border-gray-600 bg-gray-800/60'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Excellent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span>Good</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span>Started</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400/50 border border-orange-400"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Voice Command Interface */}
      <MobileMicrophoneButton 
        onVoiceCommand={handleVoiceCommand}
        disabled={isProcessingVoice}
      />

      {/* Global Modals */}
      {lastThoughtDumpResult && (
        <ThoughtDumpResults
          result={lastThoughtDumpResult}
          onClose={() => setLastThoughtDumpResult(null)}
          onAddToSchedule={() => {
            setLastThoughtDumpResult(null);
          }}
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

      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        context="lifelock"
        onTaskCreated={(task) => {
          console.log('✅ Task created from AI:', task);
          // Trigger refresh to show new task
          setRefreshTrigger(prev => prev + 1);
        }}
        onSessionComplete={(session) => {
          console.log('🏁 AI session completed:', session);
        }}
      />
    </AdminLayout>
  );
};

export default AdminLifeLock;

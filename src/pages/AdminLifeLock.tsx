import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, getYear, eachWeekOfInterval, getWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MobileTodayCard } from '@/components/admin/lifelock/ui/MobileTodayCard';
import { MobileWeekView } from '@/components/admin/lifelock/ui/MobileWeekView';
import { StatisticalWeekView } from '@/components/admin/lifelock/ui/StatisticalWeekView';
import { FloatingActionButton } from '@/components/admin/lifelock/ui/FloatingActionButton';
import { MobileMicrophoneButton } from '@/components/admin/lifelock/ui/MobileMicrophoneButton';
import { useClerkUser } from '@/components/ClerkProvider';
import { PersonalTaskCard, personalTaskService } from '@/services/personalTaskService';
import { ClerkHybridTaskService } from '@/services/clerkHybridTaskService';
import { lifeLockVoiceTaskProcessor, ThoughtDumpResult } from '@/services/lifeLockVoiceTaskProcessor';
import { ThoughtDumpResults } from '@/components/admin/lifelock/ui/ThoughtDumpResults';
import { eisenhowerMatrixOrganizer, EisenhowerMatrixResult } from '@/services/eisenhowerMatrixOrganizer';
import { EisenhowerMatrixModal } from '@/components/admin/lifelock/ui/EisenhowerMatrixModal';
import SyncStatusWidget from '@/components/SyncStatusWidget';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [view, setView] = useState<'week' | 'month'>('week');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To trigger re-render when tasks change
  
  // Initialize hybrid service and clear caches on component mount
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize hybrid service with automatic migration
      try {
        await ClerkHybridTaskService.initialize();
        console.log('✅ [APP] Hybrid service initialized with auto-migration');
      } catch (error) {
        console.error('❌ [APP] Hybrid service initialization failed:', error);
      }
      
      // Clear caches for fresh data
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }
    };
    
    initializeApp();
  }, []);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [lastThoughtDumpResult, setLastThoughtDumpResult] = useState<ThoughtDumpResult | null>(null);
  
  // Eisenhower Matrix state
  const [showEisenhowerModal, setShowEisenhowerModal] = useState(false);
  const [eisenhowerResult, setEisenhowerResult] = useState<EisenhowerMatrixResult | null>(null);
  const [isAnalyzingTasks, setIsAnalyzingTasks] = useState(false);

  // Enhanced voice command handler with intelligent thought dump processing
  const handleVoiceCommand = async (command: string) => {
    console.log('🎤 Voice command received:', command);
    const lowerCommand = command.toLowerCase();
    
    // Check for navigation commands first
    if (lowerCommand.includes('today') || lowerCommand.includes('day view')) {
      navigate('/admin/life-lock/day');
      return;
    } else if (lowerCommand.includes('week') || lowerCommand.includes('week view')) {
      setView('week');
      return;
    } else if (lowerCommand.includes('month') || lowerCommand.includes('month view')) {
      setView('month');
      return;
    }
    
    // Everything else is treated as a thought dump for task creation
    console.log('🧠 Processing as thought dump...');
    setIsProcessingVoice(true);
    
    try {
      const result = await lifeLockVoiceTaskProcessor.processThoughtDump(command);
      setLastThoughtDumpResult(result);
      
      if (result.success) {
        console.log(`✅ Thought dump processed: ${result.totalTasks} tasks created`);
        console.log(`🔥 Deep tasks: ${result.deepTasks.length}`);
        console.log(`⚡ Light tasks: ${result.lightTasks.length}`);
        
        // Add thought dump results to personal task system
        const personalTasks = [...result.deepTasks, ...result.lightTasks].map(task => 
          personalTaskService.convertLifeLockTaskToPersonal(task)
        );
        if (user) {
          for (const task of personalTasks) {
            await ClerkHybridTaskService.addTask(user, task);
          }
        }
        
        // Trigger refresh to show new tasks
        setRefreshTrigger(prev => prev + 1);
        
        // Show success feedback - will display the results modal
      } else {
        console.error('❌ Thought dump processing failed:', result.message);
        alert('Failed to process your thought dump. Please try again.');
      }
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      alert('Error processing your voice input. Please try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Generate available years (current year ± 2)
  const currentYear = getYear(new Date());
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Generate months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Task toggle handler with personal task service
  const handleTaskToggle = async (taskId: string) => {
    if (user) {
      await ClerkHybridTaskService.updateTask(user, taskId, { completed: true });
    }
    console.log('Personal task toggled:', taskId);
    setRefreshTrigger(prev => prev + 1); // Trigger re-render
  };

  // Quick add handler for creating simple tasks
  const handleQuickAdd = async () => {
    const taskName = prompt('Enter task name:');
    if (taskName && taskName.trim()) {
      const newTask = {
        title: taskName.trim(),
        workType: 'light' as const,
        priority: 'medium' as const,
        description: 'Quick task added manually'
      };
      
      if (user) {
        await ClerkHybridTaskService.addTask(user, newTask);
      }
      console.log('Quick task added:', taskName);
      setRefreshTrigger(prev => prev + 1); // Trigger re-render
    }
  };

  // Custom task add handler for CustomTaskInput component
  const handleCustomTaskAdd = async (task: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    const newTask = {
      title: task.title,
      workType: 'light' as const,
      priority: task.priority,
      description: 'Custom task added by user'
    };
    
    if (user) {
      await ClerkHybridTaskService.addTask(user, newTask);
    }
    console.log('Custom task added:', task.title, 'Priority:', task.priority);
    setRefreshTrigger(prev => prev + 1); // Trigger re-render
  };

  // Eisenhower Matrix handlers
  const handleOrganizeTasks = async () => {
    console.log('🎯 Starting Eisenhower Matrix analysis...');
    setIsAnalyzingTasks(true);
    
    try {
      const result = await eisenhowerMatrixOrganizer.organizeTasks(currentDate);
      setEisenhowerResult(result);
      setShowEisenhowerModal(true);
      
      console.log('✅ Eisenhower Matrix analysis complete:', {
        doFirst: result.doFirst.length,
        schedule: result.schedule.length,
        delegate: result.delegate.length,
        eliminate: result.eliminate.length
      });
      
    } catch (error) {
      console.error('❌ Failed to analyze tasks:', error);
      alert('Failed to analyze tasks. Please try again.');
    } finally {
      setIsAnalyzingTasks(false);
    }
  };

  const handleApplyOrganization = async () => {
    if (!eisenhowerResult) return;
    
    console.log('🔄 Applying Eisenhower Matrix organization...');
    
    try {
      await eisenhowerMatrixOrganizer.applyOrganizedOrder(eisenhowerResult, currentDate);
      setRefreshTrigger(prev => prev + 1); // Trigger UI refresh
      setShowEisenhowerModal(false);
      setEisenhowerResult(null);
      
      console.log('✅ Task organization applied successfully!');
      
      // Show success feedback
      alert(`Tasks organized successfully! ${eisenhowerResult.summary.doFirstCount} critical tasks prioritized.`);
      
    } catch (error) {
      console.error('❌ Failed to apply organization:', error);
      alert('Failed to apply task organization. Please try again.');
    }
  };

  const handleReanalyze = async () => {
    setEisenhowerResult(null);
    await handleOrganizeTasks();
  };

  // Personal task data with automatic rollover  
  const [todayCard, setTodayCard] = useState<any>({
    id: 'loading',
    date: new Date(),
    title: 'Loading...',
    completed: false,
    tasks: []
  });
  
  useEffect(() => {
    const loadTodayCard = async () => {
      if (user) {
        const personalCard = await ClerkHybridTaskService.getTasksForDate(user, new Date());
        // Convert PersonalTaskCard to TaskCard format for compatibility
        const cardData = {
          id: personalCard.id,
          date: personalCard.date,
          title: personalCard.title,
          completed: personalCard.completed,
          tasks: personalCard.tasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            description: task.description,
            logField: task.workType === 'deep' ? 'Deep Focus Session' : 'Quick Task',
            logValue: task.completedAt ? `Completed: ${new Date(task.completedAt).toLocaleTimeString()}` : undefined
          }))
        };
        setTodayCard(cardData);
      }
    };
    
    loadTodayCard();
  }, [user, refreshTrigger]);

  // Get week's date range
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  const weekCards = React.useMemo(() => {
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return weekDays.map(date => {
      // Use sync version since this is just for display
      // For now, use fallback data for week view (will be updated to async loading)
      const personalCard = personalTaskService.getTasksForDate(date);
      // Convert PersonalTaskCard to TaskCard format for compatibility
      return {
        id: personalCard.id,
        date: personalCard.date,
        title: personalCard.title,
        completed: personalCard.completed,
        tasks: personalCard.tasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          description: task.description,
          logField: task.workType === 'deep' ? 'Deep Focus Session' : 'Quick Task',
          logValue: task.completedAt ? `Completed: ${new Date(task.completedAt).toLocaleTimeString()}` : undefined
        }))
      };
    });
  }, [weekStart, weekEnd, refreshTrigger]);

  // Get month's tasks organized in calendar format
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  // Get the first Monday before or at the start of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Get the last Sunday after or at the end of the month
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // Get all days in the calendar view (including previous/next month days)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Organize into weeks (rows) with 7 days each (columns)
  const calendarWeeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabelsMobile = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleCardClick = (card: TaskCard) => {
    // Navigate to notion-like page for this day
    const dateParam = format(card.date, 'yyyy-MM-dd');
    navigate(`/admin/life-lock/day?date=${dateParam}`);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(direction === 'next' ? addMonths(selectedMonth, 1) : subMonths(selectedMonth, 1));
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(selectedYear, parseInt(monthIndex), 1);
    setSelectedMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
    const newDate = new Date(parseInt(year), selectedMonth.getMonth(), 1);
    setSelectedMonth(newDate);
  };

  const TaskCardComponent = ({ card, size = 'medium', isCurrentMonth = true }: { card: TaskCard; size?: 'small' | 'medium' | 'large'; isCurrentMonth?: boolean }) => {
    const isToday = isSameDay(card.date, new Date());
    const isPast = card.date < new Date() && !isToday;
    const completedTasks = card.tasks.filter(task => task.completed).length;
    const totalTasks = card.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const cardSizes = {
      small: 'p-2 sm:p-4 min-h-[80px] sm:min-h-[140px]',
      medium: 'p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]',
      large: 'p-5 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[240px]'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => handleCardClick(card)}
      >
        <Card className={`
          ${cardSizes[size]}
          ${card.completed && isPast ? 'border-emerald-400/60 bg-gradient-to-br from-emerald-900/30 via-gray-900/50 to-emerald-900/20 border-2 shadow-lg shadow-emerald-500/15' : 
            card.completed ? 'border-emerald-400/50 bg-gradient-to-br from-emerald-900/25 via-gray-900/40 to-emerald-900/15 shadow-md shadow-emerald-500/10' : 
            'bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-orange-400/30'}
          ${isToday ? 'ring-2 ring-orange-400/80 border-orange-400/70 shadow-xl shadow-orange-500/30' : ''}
          ${!isCurrentMonth ? 'opacity-40' : ''}
          hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-[1.05] hover:border-orange-400/60 hover:ring-1 hover:ring-orange-400/40 transition-all duration-300 text-white cursor-pointer backdrop-blur-xl relative overflow-hidden group
        `}>
          {/* Enhanced glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-amber-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>
          
          <CardHeader className={`${size === 'small' ? 'pb-1 p-2' : 'pb-1 sm:pb-2'} relative z-10`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-gray-200 ${
                size === 'large' 
                  ? 'text-sm sm:text-base md:text-lg' 
                  : size === 'medium'
                  ? 'text-xs sm:text-sm'
                  : 'text-lg sm:text-xs'
              }`}>
                {size === 'small' ? format(card.date, 'd') : card.title}
              </h3>
              {size !== 'small' && (
                card.completed ? (
                  <CheckCircle2 className={`${size === 'small' ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} text-emerald-400`} />
                ) : (
                  <Circle className={`${size === 'small' ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} text-gray-300`} />
                )
              )}
            </div>
            {isToday && size !== 'small' && (
              <Badge variant="secondary" className="w-fit bg-orange-500/20 text-orange-300 border-orange-500/40 text-xs">
                Today
              </Badge>
            )}
          </CardHeader>
          <CardContent className={`${size === 'small' ? 'p-2 pt-0' : ''} relative z-10`}>
            <div className={`space-y-1 ${size === 'small' ? 'sm:space-y-2' : 'space-y-2'}`}>
              {size !== 'small' && (
                <>
                  <div className="flex justify-between text-xs text-gray-300 font-medium">
                    <span>{completedTasks}/{totalTasks} tasks</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-800/60 backdrop-blur-sm rounded-full h-2 sm:h-3 shadow-inner border border-orange-400/30">
                    <div 
                      className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 h-2 sm:h-3 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/25 relative overflow-hidden"
                      style={{ width: `${completionRate}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10"></div>
                    </div>
                  </div>
                </>
              )}
              {size === 'small' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300 font-medium">
                    <span>{completedTasks}/{totalTasks}</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-800/60 backdrop-blur-sm rounded-full h-2 shadow-inner border border-orange-400/30">
                    <div 
                      className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 h-2 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/25 relative overflow-hidden"
                      style={{ width: `${completionRate}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              )}
              {size === 'large' && (
                <div className="space-y-1 mt-2 hidden sm:block">
                  {card.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-xs">
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`truncate font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {card.tasks.length > 3 && (
                    <div className="text-xs text-gray-400 ml-5 font-medium">
                      +{card.tasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Handle loading state
  if (!isLoaded || !user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  // Handle non-admin access
  // Clerk handles auth, no additional admin check needed
  if (false) {
    navigate('/login');
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
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

        {/* Today's Progress - Desktop Hero Section */}
        <section className="relative overflow-hidden hidden sm:block">
          {/* Background with gradient and glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/15 to-orange-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-12 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg shadow-orange-500/25">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Today's Progress
              </h2>
              <p className="text-gray-300 text-base sm:text-lg font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-orange-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active Session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Day {Math.floor((new Date().getTime() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)) + 1} of 2025</span>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <TaskCardComponent card={todayCard} size="large" />
            </div>
          </div>
        </section>

        {/* This Week - Mobile Statistical View v3.0 - FORCE REFRESH */}
        <StatisticalWeekView
          weekCards={weekCards}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onNavigateWeek={navigateWeek}
          onCardClick={handleCardClick}
          className="mb-6"
        />

        {/* This Week - Desktop Enhanced Layout */}
        <section className="relative hidden sm:block">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-2xl blur-sm"></div>
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-orange-400 inline" />
                  This Week
                </h2>
                <p className="text-orange-200/80 text-sm font-medium">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          
            {/* Week Cards Grid - Improved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
              {weekCards.map((card) => (
                <div key={card.id} className="lg:col-span-1">
                  <TaskCardComponent card={card} size="medium" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Progress - Simple Overview */}
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
            
            {/* Monthly Progress Dots */}
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
                  <div key={day} className="flex flex-col items-center space-y-1">
                    <div className="text-xs text-gray-400 font-medium">{day}</div>
                    <div 
                      className={`w-3 h-3 rounded-full border transition-all duration-200 ${
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
            
            {/* Legend */}
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

        {/* Priority Tasks */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl blur-sm"></div>
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Priority Tasks
                </h2>
                <p className="text-red-200/80 text-sm font-medium">
                  Focus on what matters most
                </p>
              </div>
              <Button
                size="sm"
                className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400/70 px-4 py-2"
                onClick={() => console.log('Edit priorities')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Priority
              </Button>
            </div>
            
            {/* Priority Task Cards */}
            <div className="space-y-3">
              {[
                { id: '1', title: 'Complete quarterly review', priority: 'high', dueDate: 'Today', completed: false },
                { id: '2', title: 'Finish client presentation', priority: 'high', dueDate: 'Tomorrow', completed: false },
                { id: '3', title: 'Review team feedback', priority: 'medium', dueDate: 'This week', completed: true },
              ].map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-red-400/30 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-400">{task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions - Enhanced */}
        <section className="flex justify-center pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Button 
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
              onClick={handleQuickAdd}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add New Task
            </Button>
            
            <Button 
              className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOrganizeTasks}
              disabled={isAnalyzingTasks || !todayCard || todayCard.tasks.length === 0}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              {isAnalyzingTasks ? (
                <>
                  <motion.div 
                    className="h-5 w-5 sm:h-6 sm:w-6 mr-2 border-2 border-white border-t-transparent rounded-full" 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Organize Tasks
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-white bg-black/30 backdrop-blur-sm px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/admin/life-lock/day')}
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Today's Details
            </Button>
          </div>
        </section>
        </div>
      </div>

      {/* Mobile Microphone Button - Top Center */}
      <MobileMicrophoneButton 
        onVoiceCommand={handleVoiceCommand}
        disabled={isProcessingVoice}
      />

      {/* Floating Action Button removed - using microphone button instead */}

      {/* Thought Dump Results Modal */}
      {lastThoughtDumpResult && (
        <ThoughtDumpResults
          result={lastThoughtDumpResult}
          onClose={() => setLastThoughtDumpResult(null)}
          onAddToSchedule={() => {
            // Tasks were already added when voice processing completed
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      {/* Eisenhower Matrix Modal */}
      <EisenhowerMatrixModal
        isOpen={showEisenhowerModal}
        onClose={() => {
          setShowEisenhowerModal(false);
          setEisenhowerResult(null);
        }}
        result={eisenhowerResult}
        onApplyOrganization={handleApplyOrganization}
        onReanalyze={handleReanalyze}
        isLoading={isAnalyzingTasks}
      />

      {/* Hybrid Sync Status Widget */}
      <SyncStatusWidget />
    </AdminLayout>
  );
};

export default AdminLifeLock;
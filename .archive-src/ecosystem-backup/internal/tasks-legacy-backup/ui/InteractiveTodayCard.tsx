import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Plus, 
  Settings,
  ArrowRight,
  Target,
  Dumbbell,
  Heart,
  Coffee,
  Sun,
  Zap,
  Brain,
  Timer,
  Mic,
  Camera,
  TrendingUp,
  Flame,
  Clock,
  Award,
  Activity,
  Star,
  Sparkles,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { LifeLockService, DailyRoutine, DailyWorkout, DailyHealth, DailyHabits, DailyReflections } from '@/services/core/task.service';
import { EnhancedTaskService, EnhancedTask } from '@/services/core/task.service';
import { format } from 'date-fns';
import { FocusSessionTimer } from './FocusSessionTimer';
import SisoDeepFocusPlan from '@/shared/ui/siso-deep-focus-plan';
import { MilkTracker } from './MilkTracker';

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

interface RealLifeLockData {
  routine: DailyRoutine | null;
  workout: DailyWorkout | null;
  health: DailyHealth | null;
  habits: DailyHabits | null;
  reflections: DailyReflections | null;
  deepFocusTasks: EnhancedTask[];
}

interface TaskSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  progress: number;
  completedCount: number;
  totalCount: number;
  metrics?: {
    hoursLogged?: number;
    targetHours?: number;
    streak?: number;
    efficiency?: number;
    completionTime?: string;
  };
}

// Mobile Section Card Component
interface MobileSectionCardProps {
  section: TaskSection;
  onToggle: (sectionId: string) => void;
  onTaskToggle: (sectionId: string, taskId: string) => void;
  onQuickAdd?: (sectionId: string) => void;
  isExpanded: boolean;
}

const MobileSectionCard: React.FC<MobileSectionCardProps> = ({
  section,
  onToggle,
  onTaskToggle,
  onQuickAdd,
  isExpanded
}) => {
  const isCompleted = section.progress === 100;
  
  return (
    <motion.div
      className={cn(
        'p-4 rounded-lg border transition-all duration-300 relative overflow-hidden',
        isCompleted 
          ? 'bg-green-500/20 border-green-500/30' 
          : 'bg-orange-500/20 border-orange-500/30'
      )}
      layout
    >
      <div className="flex items-center justify-between mb-3" onClick={() => onToggle(section.id)}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-full transition-all duration-300',
            isCompleted ? 'bg-green-500/20' : 'bg-orange-500/20'
          )}>
            <section.icon className={cn(
              'h-5 w-5',
              isCompleted ? 'text-green-400' : 'text-orange-400'
            )} />
          </div>
          <div>
            <h3 className={cn(
              'font-semibold transition-all duration-300',
              isCompleted ? 'text-green-300' : 'text-white'
            )}>
              {section.title}
            </h3>
            <p className="text-xs text-gray-400">
              {section.completedCount} of {section.totalCount} tasks completed
            </p>
            {section.tasks.length > 0 && (
              <p className="text-xs text-blue-400 mt-1">
                📋 {section.tasks.length} total tasks {isCompleted ? '✅' : '📝'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-lg font-bold px-3 py-1 rounded-full',
            isCompleted 
              ? 'text-green-400 bg-green-500/20' 
              : 'text-orange-400 bg-orange-500/20'
          )}>
            {Math.round(section.progress)}%
          </div>
          {section.metrics?.hoursLogged && (
            <div className="text-xs text-gray-400 mt-1">
              ⏱️ {section.metrics.hoursLogged}h logged
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-black/40 rounded-full h-2 mb-3">
        <motion.div 
          className={cn(
            'h-2 rounded-full',
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-green-400' 
              : 'bg-gradient-to-r from-orange-500 to-yellow-400'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${section.progress}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Tasks List (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              {section.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                    task.completed 
                      ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/15" 
                      : "hover:bg-white/5 border border-transparent hover:border-gray-600/30"
                  )}
                  onClick={() => onTaskToggle(section.id, task.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  {task.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 hover:text-gray-300" />
                  )}
                  <span className={cn(
                    'text-sm flex-1 font-medium transition-all duration-200',
                    task.completed 
                      ? 'line-through text-green-300' 
                      : 'text-gray-200'
                  )}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-xs text-green-400 font-semibold px-2 py-1 bg-green-500/20 rounded-full">
                        Done
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {onQuickAdd && (
              <Button
                onClick={() => onQuickAdd(section.id)}
                size="sm"
                variant="ghost"
                className="w-full mt-3 text-gray-400 hover:text-white border-dashed border border-gray-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface InteractiveTodayCardProps {
  card: TaskCard;
  onViewDetails: (card: TaskCard) => void;
  onTaskToggle?: (sectionId: string, taskId: string) => void;
  onQuickAdd?: (sectionId: string) => void;
  onVoiceInput?: () => void;
  onStartTimer?: () => void;
  onQuickPhoto?: () => void;
  className?: string;
  isMobile?: boolean;
}

export const InteractiveTodayCard: React.FC<InteractiveTodayCardProps> = ({
  card,
  onViewDetails,
  onTaskToggle,
  onQuickAdd,
  onVoiceInput,
  onStartTimer,
  onQuickPhoto,
  className,
  isMobile = false
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isCompactMode, setIsCompactMode] = useState(isMobile);
  const [showAllSections, setShowAllSections] = useState(!isMobile);
  const [showDeepFocusSession, setShowDeepFocusSession] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [lifeLockData, setLifeLockData] = useState<RealLifeLockData>({
    routine: null,
    workout: null,
    health: null,
    habits: null,
    reflections: null,
    deepFocusTasks: []
  });

  // Load real LifeLock data
  useEffect(() => {
    const loadRealData = async () => {
      setIsLoading(true);
      try {
        const [allDailyData, deepFocusTasks] = await Promise.all([
          LifeLockService.getAllDailyData(card.date),
          EnhancedTaskService.getDeepFocusTasksForDate(card.date)
        ]);
        
        setLifeLockData({
          routine: allDailyData.routine,
          workout: allDailyData.workout,
          health: allDailyData.health,
          habits: allDailyData.habits,
          reflections: allDailyData.reflections,
          deepFocusTasks: deepFocusTasks
        });
      } catch (error) {
        console.error('Failed to load LifeLock data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [card.date]);

  const completedTasks = card.tasks.filter(task => task.completed).length;
  const totalTasks = card.tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Generate task sections from real LifeLock data
  const taskSections: TaskSection[] = React.useMemo(() => {
    if (isLoading) return [];
    
    const sections: TaskSection[] = [];
    
    // Morning Routine Section - Enhanced
    if (lifeLockData.routine?.items) {
      const routineItems = lifeLockData.routine.items;
      const completedCount = routineItems.filter(item => item.completed).length;
      const totalCount = routineItems.length;
      const isFullyCompleted = completedCount === totalCount && totalCount > 0;
      sections.push({
        id: 'morning',
        title: isFullyCompleted ? '🌅 Morning Routine Complete!' : 'Morning Routine',
        icon: isFullyCompleted ? CheckCircle : Sun,
        color: isFullyCompleted ? 'green' : 'yellow',
        tasks: routineItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 5, // Could be calculated from historical data
          completionTime: isFullyCompleted ? '7:30 AM' : undefined,
          efficiency: isFullyCompleted ? 95 : Math.round((completedCount / totalCount) * 100)
        }
      });
    }
    
    // Deep Focus Work Section
    if (lifeLockData.deepFocusTasks.length > 0) {
      const deepTasks = lifeLockData.deepFocusTasks;
      const completedCount = deepTasks.filter(task => task.status === 'done').length;
      const totalCount = deepTasks.length;
      sections.push({
        id: 'deep-focus',
        title: 'Deep Focus Work',
        icon: Brain,
        color: 'orange',
        tasks: deepTasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'done'
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          hoursLogged: lifeLockData.habits?.deep_work_hours || 0,
          targetHours: 8,
          efficiency: 85
        }
      });
    }
    
    // Workout Section
    if (lifeLockData.workout?.exercises) {
      const workoutItems = lifeLockData.workout.exercises;
      const completedCount = workoutItems.filter(item => item.completed).length;
      const totalCount = workoutItems.length;
      sections.push({
        id: 'workout',
        title: 'Workout',
        icon: Dumbbell,
        color: 'red',
        tasks: workoutItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 3
        }
      });
    }
    
    // Health Section
    if (lifeLockData.health?.health_checklist) {
      const healthItems = lifeLockData.health.health_checklist;
      const completedCount = healthItems.filter(item => item.completed).length;
      const totalCount = healthItems.length;
      sections.push({
        id: 'health',
        title: 'Health',
        icon: Heart,
        color: 'pink',
        tasks: healthItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 7
        }
      });
    }
    
    // Light Focus Section
    if (lifeLockData.habits?.habits_data?.lightFocusTasks) {
      const lightTasks = lifeLockData.habits.habits_data.lightFocusTasks.filter(task => task.title);
      const completedCount = lightTasks.filter(task => task.completed).length;
      const totalCount = lightTasks.length;
      if (totalCount > 0) {
        sections.push({
          id: 'light-focus',
          title: 'Light Focus',
          icon: Coffee,
          color: 'green',
          tasks: lightTasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed
          })),
          progress: (completedCount / totalCount) * 100,
          completedCount,
          totalCount,
          metrics: {
            hoursLogged: lifeLockData.habits?.light_work_hours || 0,
            targetHours: 4
          }
        });
      }
    }
    
    return sections;
  }, [lifeLockData, isLoading]);

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 hover:border-yellow-500/50',
      orange: 'text-orange-400 bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30 hover:border-orange-500/50',
      red: 'text-red-400 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50',
      pink: 'text-pink-400 bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-500/50',
      green: 'text-green-400 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50 shadow-green-500/20',
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleTaskToggle = (sectionId: string, taskId: string) => {
    onTaskToggle?.(sectionId, taskId);
  };

  const handleMilkIntakeUpdate = (newIntake: number) => {
    if (lifeLockData.health) {
      setLifeLockData(prev => ({
        ...prev,
        health: prev.health ? {
          ...prev.health,
          milk_intake_ml: newIntake
        } : null
      }));
    }
  };

  // Mobile swipe handlers
  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile || taskSections.length === 0) return;
    
    const threshold = 50;
    if (info.offset.x > threshold) {
      // Swipe right - previous section
      setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    } else if (info.offset.x < -threshold) {
      // Swipe left - next section
      setCurrentSectionIndex(prev => Math.min(taskSections.length - 1, prev + 1));
    }
  };

  // Auto-collapse completed sections on mobile
  useEffect(() => {
    if (isMobile && taskSections.length > 0) {
      const completedSections = taskSections.filter(s => s.progress === 100);
      if (completedSections.length > 0 && !showAllSections) {
        // Find next incomplete section
        const nextIncomplete = taskSections.find(s => s.progress < 100);
        if (nextIncomplete) {
          const nextIndex = taskSections.findIndex(s => s.id === nextIncomplete.id);
          setCurrentSectionIndex(nextIndex);
        }
      }
    }
  }, [taskSections, isMobile, showAllSections]);

  // Touch-optimized section navigation
  const navigateToSection = (index: number) => {
    setCurrentSectionIndex(index);
    if (isMobile) {
      // Always expand the current section on mobile to show all tasks
      setExpandedSection(taskSections[index]?.id || null);
    }
  };

  // Auto-expand current section on mobile when sections load
  useEffect(() => {
    if (isMobile && taskSections.length > 0 && !expandedSection) {
      setExpandedSection(taskSections[currentSectionIndex]?.id || null);
    }
  }, [taskSections, isMobile, currentSectionIndex, expandedSection]);

  // Calculate overall progress from all sections
  const overallProgress = React.useMemo(() => {
    if (taskSections.length === 0) return 0;
    
    const totalTasks = taskSections.reduce((sum, section) => sum + section.totalCount, 0);
    const completedTasks = taskSections.reduce((sum, section) => sum + section.completedCount, 0);
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }, [taskSections]);

  // Generate insights based on real data
  const generateInsights = () => {
    const insights = [];
    
    if (lifeLockData.habits?.deep_work_hours && lifeLockData.habits.deep_work_hours >= 8) {
      insights.push("🔥 Deep work goal achieved!");
    }
    
    const morningSection = taskSections.find(s => s.id === 'morning');
    if (morningSection && morningSection.progress === 100) {
      insights.push("🌅 Morning routine completed!");
    }
    
    const workoutSection = taskSections.find(s => s.id === 'workout');
    if (workoutSection && workoutSection.progress > 0) {
      insights.push("💪 Workout in progress!");
    }
    
    if (insights.length === 0) {
      insights.push("💪 Keep pushing forward!");
    }
    
    return insights[0]; // Return the first insight
  };

  return (
    <div className={cn('w-full', className)} ref={cardRef}>
      <Card className={cn(
        'bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-xl shadow-orange-500/10 overflow-hidden transition-all duration-300',
        isMobile && 'shadow-lg shadow-orange-500/20'
      )}>
        <CardHeader className={cn('pb-4', isMobile && 'pb-2')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center',
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              )}>
                <Calendar className={cn('text-white', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
              <div>
                <h3 className={cn(
                  'text-white font-bold',
                  isMobile ? 'text-base' : 'text-lg'
                )}>
                  Today's Progress
                </h3>
                <p className={cn(
                  'text-gray-400',
                  isMobile ? 'text-xs' : 'text-sm'
                )}>
                  {card.date.toLocaleDateString('en-US', { 
                    weekday: isMobile ? 'short' : 'long', 
                    month: isMobile ? 'short' : 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {!isLoading && !isMobile && (
                  <p className="text-orange-300 text-xs mt-1">
                    {generateInsights()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile: Show compact mode toggle */}
              {isMobile && taskSections.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSections(!showAllSections)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  {showAllSections ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              )}
              <Badge 
                variant="outline" 
                className={cn(
                  'font-semibold',
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1',
                  overallProgress === 100 
                    ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                    : overallProgress > 75
                    ? 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                    : 'border-gray-500/50 text-gray-400 bg-gray-500/10'
                )}
              >
                {Math.round(overallProgress)}%
              </Badge>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-3 shadow-inner border border-orange-500/20 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-full rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>
                {isLoading ? (
                  'Loading...'
                ) : (
                  `${taskSections.reduce((sum, s) => sum + s.completedCount, 0)}/${taskSections.reduce((sum, s) => sum + s.totalCount, 0)} tasks completed`
                )}
              </span>
              <span>
                {overallProgress > 75 ? '🔥 Great progress!' : overallProgress > 50 ? '💪 Keep going!' : '🎯 Let\'s do this!'}
              </span>
            </div>
          </div>

          {/* Key Metrics Display */}
          {!isLoading && (
            <div className={cn(
              'mt-4 grid gap-2 text-xs',
              isMobile ? 'grid-cols-3' : 'grid-cols-2'
            )}>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-orange-400 font-semibold">
                  {lifeLockData.habits?.deep_work_hours || 0}h
                </div>
                <div className="text-gray-400">Deep Focus</div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <div className="text-green-400 font-semibold">
                  {lifeLockData.habits?.light_work_hours || 0}h
                </div>
                <div className="text-gray-400">Light Focus</div>
              </div>
              {isMobile && (
                <div className="bg-black/20 rounded-lg p-2 text-center">
                  <div className="text-yellow-400 font-semibold">
                    {taskSections.length}
                  </div>
                  <div className="text-gray-400">Sections</div>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading your LifeLock data...</div>
            </div>
          )}

          {/* Mobile: Section Navigation */}
          {isMobile && !isLoading && taskSections.length > 0 && !showAllSections && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToSection(Math.max(0, currentSectionIndex - 1))}
                    disabled={currentSectionIndex === 0}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400">
                    {currentSectionIndex + 1} of {taskSections.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToSection(Math.min(taskSections.length - 1, currentSectionIndex + 1))}
                    disabled={currentSectionIndex === taskSections.length - 1}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-1">
                  {taskSections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToSection(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        index === currentSectionIndex 
                          ? 'bg-orange-500' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      )}
                    />
                  ))}
                </div>
              </div>
              
              {/* Single Section Display for Mobile */}
              <motion.div
                key={currentSectionIndex}
                onPan={handlePan}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {taskSections[currentSectionIndex] && (
                  <MobileSectionCard 
                    section={taskSections[currentSectionIndex]}
                    onToggle={handleSectionToggle}
                    onTaskToggle={handleTaskToggle}
                    onQuickAdd={onQuickAdd}
                    isExpanded={true} // Always show tasks on mobile
                  />
                )}
              </motion.div>
            </div>
          )}

          {/* Task Sections Overview - Enhanced */}
          {!isLoading && taskSections.length > 0 && (!isMobile || showAllSections) && (
            <div className={cn(
              'gap-3 mb-4',
              isMobile ? 'grid grid-cols-1' : 'grid grid-cols-2'
            )}>
              {taskSections.map((section, index) => {
                const isCompleted = section.progress === 100;
                const isMorningRoutine = section.id === 'morning';
                const isDeepFocus = section.id === 'deep-focus';
                
                // Render enhanced deep focus session card if enabled
                if (isDeepFocus && showDeepFocusSession) {
                  return (
                    <motion.div
                      key="deep-focus-enhanced"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="col-span-full"
                    >
                      <SisoDeepFocusPlan
                        onStartFocusSession={(taskId, intensity) => {
                          console.log('Starting deep focus session:', { taskId, intensity });
                          // Start flow state timer with specified intensity
                        }}
                      />
                    </motion.div>
                  );
                }
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden',
                      getColorClasses(section.color),
                      expandedSection === section.id && 'ring-2 ring-orange-500/50',
                      isCompleted && 'animate-pulse-subtle shadow-lg',
                      isMorningRoutine && isCompleted && 'bg-gradient-to-br from-green-900/30 to-yellow-900/20'
                    )}
                    onClick={() => handleSectionToggle(section.id)}
                  >
                    {/* Completion Celebration Effect */}
                    {isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          'p-1.5 rounded-full transition-all duration-300',
                          isCompleted ? 'bg-green-500/20 animate-pulse' : 'bg-black/20'
                        )}>
                          <section.icon className={cn(
                            'h-4 w-4 transition-all duration-300',
                            isCompleted && isMorningRoutine ? 'text-green-400' : ''
                          )} />
                        </div>
                        <span className={cn(
                          'text-sm font-medium transition-all duration-300',
                          isCompleted ? 'text-green-300' : 'text-white'
                        )}>
                          {section.title}
                        </span>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                          >
                            <Sparkles className="h-3 w-3 text-yellow-400" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {section.metrics?.streak && (
                          <div className="flex items-center space-x-1">
                            <Flame className={cn(
                              'h-3 w-3 transition-all duration-300',
                              section.metrics.streak > 7 ? 'text-red-400' : 'text-orange-400'
                            )} />
                            <span className={cn(
                              'text-xs font-semibold',
                              section.metrics.streak > 7 ? 'text-red-400' : 'text-orange-400'
                            )}>
                              {section.metrics.streak}
                            </span>
                          </div>
                        )}
                        {isDeepFocus && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeepFocusSession(!showDeepFocusSession);
                            }}
                            className={cn(
                              'h-6 w-6 p-0 transition-all duration-300',
                              showDeepFocusSession
                                ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30'
                                : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/20'
                            )}
                            title="Toggle Enhanced Focus Session"
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                        )}
                        <span className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full',
                          isCompleted 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-black/30 text-white'
                        )}>
                          {Math.round(section.progress)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="w-full bg-black/40 rounded-full h-2 mb-2 overflow-hidden">
                      <motion.div 
                        className={cn(
                          'h-2 rounded-full transition-all duration-700',
                          isCompleted 
                            ? 'bg-gradient-to-r from-green-500 via-yellow-400 to-green-500' 
                            : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${section.progress}%` }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                      >
                        {isCompleted && (
                          <div className="w-full h-full bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        {section.metrics?.hoursLogged && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{section.metrics.hoursLogged}h</span>
                          </span>
                        )}
                        {section.metrics?.completionTime && (
                          <span className="text-green-400 font-medium">
                            ✓ {section.metrics.completionTime}
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        'border rounded-full px-3 py-1 text-xs font-medium transition-all duration-300',
                        isCompleted 
                          ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                          : 'bg-black/40 border-gray-600/50 text-white'
                      )}>
                        {isCompleted ? (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Complete!</span>
                          </span>
                        ) : (
                          <span>{section.completedCount} of {section.totalCount}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* No Data State */}
          {!isLoading && taskSections.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No data available for today</p>
              <p className="text-xs mt-1">Start your day by completing some tasks!</p>
            </div>
          )}

          {/* Expanded Section Tasks */}
          <AnimatePresence>
            {expandedSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                {taskSections
                  .filter(section => section.id === expandedSection)
                  .map((section) => (
                    <div key={section.id} className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold flex items-center space-x-2">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onQuickAdd?.(section.id)}
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {/* Milk Tracker for Health Section */}
                        {section.id === 'health' && lifeLockData.health && (
                          <div className="mb-4">
                            <MilkTracker
                              currentIntake={lifeLockData.health.milk_intake_ml || 0}
                              targetIntake={2000}
                              date={card.date}
                              onUpdate={handleMilkIntakeUpdate}
                              compact={isMobile}
                              className="mb-3"
                            />
                          </div>
                        )}
                        
                        {/* Regular Tasks */}
                        <div className="space-y-2">
                          {section.tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              whileHover={{ x: 4 }}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                              onClick={() => handleTaskToggle(section.id, task.id)}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={cn(
                                'text-sm flex-1',
                                task.completed 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-300'
                              )}>
                                {task.title}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Quick Actions */}
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className={cn(
              'flex gap-2',
              isMobile && 'flex-col'
            )}>
              <Button 
                variant="outline" 
                onClick={() => onViewDetails(card)}
                className={cn(
                  'flex-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 transition-all duration-300',
                  isMobile ? 'text-sm px-4 py-3 h-12' : 'text-sm px-4 py-2'
                )}
              >
                <Settings className="h-4 w-4 mr-2" />
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                onClick={() => onQuickAdd?.('quick')}
                className={cn(
                  'flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transition-all duration-300',
                  isMobile ? 'text-sm px-4 py-3 h-12' : 'text-sm px-4 py-2'
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                onClick={() => onVoiceInput?.()}
                className={cn(
                  'text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300',
                  isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2'
                )}
              >
                <Mic className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
                Voice
              </Button>
              <Button 
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                onClick={() => setShowFocusTimer(!showFocusTimer)}
                className={cn(
                  "transition-all duration-300",
                  isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2',
                  showFocusTimer 
                    ? "text-orange-400 bg-orange-500/20 hover:bg-orange-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Timer className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
                {isMobile ? (showFocusTimer ? 'Timer' : 'Timer') : (showFocusTimer ? 'Hide Timer' : 'Focus Timer')}
              </Button>
              <Button 
                variant="ghost"
                size={isMobile ? "default" : "sm"}
                onClick={() => onQuickPhoto?.()}
                className={cn(
                  'text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300',
                  isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2'
                )}
              >
                <Camera className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
                Photo
              </Button>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          {!isLoading && taskSections.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-400">
              <div className="text-center">
                <div className="text-green-400 font-semibold">
                  {taskSections.reduce((sum, s) => sum + s.completedCount, 0)}
                </div>
                <div>Completed</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-semibold">
                  {taskSections.reduce((sum, s) => sum + (s.totalCount - s.completedCount), 0)}
                </div>
                <div>Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">
                  {(lifeLockData.habits?.deep_work_hours || 0) + (lifeLockData.habits?.light_work_hours || 0)}h
                </div>
                <div>Work Hours</div>
              </div>
            </div>
          )}

          {/* Enhanced Daily Insights */}
          {!isLoading && (
            <div className="mt-4 p-3 bg-gradient-to-br from-black/20 to-gray-900/20 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Daily Insights</span>
                </div>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                {lifeLockData.habits?.deep_work_hours && lifeLockData.habits.deep_work_hours > 6 ? (
                  <p className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>Strong focus session today! 🎯</span>
                  </p>
                ) : (
                  <p className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-orange-400" />
                    <span>Consider scheduling focused work time 📅</span>
                  </p>
                )}
                {taskSections.find(s => s.id === 'morning')?.progress === 100 ? (
                  <p className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Morning routine mastered! 🌅</span>
                  </p>
                ) : (
                  <p className="flex items-center space-x-1">
                    <Sun className="h-3 w-3 text-yellow-400" />
                    <span>Consistent morning routine builds momentum 🚀</span>
                  </p>
                )}
                {taskSections.find(s => s.id === 'workout')?.progress && taskSections.find(s => s.id === 'workout')!.progress > 0 ? (
                  <p className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-red-400" />
                    <span>Physical activity boosts productivity! 💪</span>
                  </p>
                ) : (
                  <p className="flex items-center space-x-1">
                    <Brain className="h-3 w-3 text-purple-400" />
                    <span>Physical activity enhances mental clarity 🧠</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Focus Session Timer */}
          <AnimatePresence>
            {showFocusTimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <FocusSessionTimer
                  selectedTasks={lifeLockData.deepFocusTasks
                    .filter(task => task.status !== 'done')
                    .map(task => task.id)
                  }
                  onSessionComplete={async (session) => {
                    // Handle session completion - could update LifeLock data
                    console.log('Focus session completed:', session);
                    
                    // Optionally close the timer after completion
                    setTimeout(() => {
                      setShowFocusTimer(false);
                    }, 3000);
                  }}
                  onSessionStart={(config) => {
                    console.log('Focus session started:', config);
                  }}
                  compact={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveTodayCard;
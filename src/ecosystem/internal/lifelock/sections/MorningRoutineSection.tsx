import React, { useState, useEffect } from 'react';
import { useExceptionalPerformanceMonitor } from '@/hooks/useExceptionalPerformanceMonitor';
import { useExceptionalAccessibility } from '@/hooks/useExceptionalAccessibility';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { 
  Sun,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Droplets,
  Dumbbell,
  Brain,
  Newspaper,
  Target,
  Calendar as CalendarIcon,
  Activity,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { ExceptionalAnimatedCheckbox } from '@/components/ui/exceptional-animated-checkbox';
import { ExceptionalProgressCounter } from '@/components/ui/exceptional-progress-counter';
import { ExceptionalAnimatedTaskIcon } from '@/components/ui/exceptional-animated-task-icon';
import { ExceptionalSwipeHint } from '@/components/ui/exceptional-swipe-hint';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useClerkUser } from '@/shared/ClerkProvider';
import { workTypeApiClient } from '@/services/workTypeApiClient';
import { theme } from '@/styles/theme';
import { getTasksForSection } from '@/data/task-defaults';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { LoadingState } from '@/shared/ui/loading-state';
import { ErrorState } from '@/shared/ui/error-state';



interface MorningRoutineHabit {
  name: string;
  completed: boolean;
}

interface MorningRoutineData {
  id: string;
  userId: string;
  date: string;
  items: MorningRoutineHabit[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

interface MorningRoutineSectionProps {
  selectedDate: Date;
}

const MORNING_ROUTINE_TASKS = useImplementation(
  'useRefactoredDefaultTasks',
  // NEW: Use centralized task defaults (47 lines saved)
  getTasksForSection('morning'),
  // OLD: Original hardcoded tasks (fallback for safety)
  [
  {
    key: 'wakeUp' as const,
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
    timeEstimate: '5 min',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'getBloodFlowing' as const,
    title: 'Get Blood Flowing',
    description: 'Max rep push-ups (Target PB: 30) - Physical activation to wake up the body.',
    timeEstimate: '5 min',
    icon: Dumbbell,
    hasTimeTracking: false,
    subtasks: [
      { key: 'pushups', title: 'Push-ups (PB 30)' },
      { key: 'situps', title: 'Sit-ups' },
      { key: 'pullups', title: 'Pull-ups' }
    ]
  },
  {
    key: 'freshenUp' as const,
    title: 'Freshen Up (25 min)',
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    timeEstimate: '25 min',
    icon: Droplets,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bathroom', title: 'Bathroom break' },
      { key: 'brushTeeth', title: 'Brush teeth' },
      { key: 'coldShower', title: 'Cold shower' }
    ]
  },
  {
    key: 'powerUpBrain' as const,
    title: 'Power Up Brain (5 min)',
    description: 'Hydrate and fuel the body and mind.',
    timeEstimate: '5 min',
    icon: Brain,
    hasTimeTracking: false,
    subtasks: [
      { key: 'water', title: 'Water (5 glasses)' },
      { key: 'supplements', title: 'Supplements' },
      { key: 'preworkout', title: 'Pre-workout' }
    ]
  },
  {
    key: 'planDay' as const,
    title: 'Plan Day (15 min)',
    description: 'Go through tasks, prioritize, and allocate time slots.',
    timeEstimate: '15 min',
    icon: CalendarIcon,
    hasTimeTracking: false,
    subtasks: [
      { key: 'thoughtDump', title: 'Thought dump' },
      { key: 'planDeepWork', title: 'Plan deep work' },
      { key: 'planLightWork', title: 'Plan light work' },
      { key: 'setTimebox', title: 'Set timebox' }
    ]
  },
  {
    key: 'meditation' as const,
    title: 'Meditation (2 min)',
    description: 'Meditate to set an innovative mindset for creating business value.',
    timeEstimate: '2 min',
    icon: Heart,
    hasTimeTracking: false,
    subtasks: []
  }
  ]
);

export const MorningRoutineSection: React.FC<MorningRoutineSectionProps> = ({
  selectedDate
}) => {
  const { user } = useClerkUser();
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exceptional performance and accessibility monitoring
  const performance = useExceptionalPerformanceMonitor({
    enableMemoryMonitoring: true,
    enableFPSMonitoring: true,
    enableInteractionTracking: true,
    onPerformanceIssue: (issue) => {
      console.warn('Performance issue detected:', issue);
      accessibility.announce(`Performance adjusted for better experience`, 'polite');
    }
  });

  const accessibility = useExceptionalAccessibility({
    enableMetrics: true,
    enableAdaptiveInterface: true,
    enableCognitiveSupport: true,
    onAccessibilityIssue: (issue) => {
      console.warn('Accessibility issue detected:', issue);
    }
  });

  const [wakeUpTime, setWakeUpTime] = useState<string>(() => {
    const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-wakeUpTime`);
    return saved || '';
  });

  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    return !localStorage.getItem('morning-routine-swipe-hint-dismissed');
  });

  // Load morning routine data
  useEffect(() => {
    const loadMorningRoutine = async () => {
      if (!user?.id || !selectedDate) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await workTypeApiClient.getMorningRoutine(user.id, selectedDate);
        setMorningRoutine(data);
      } catch (error) {
        console.error('Error loading morning routine:', error);
        setError('Failed to load morning routine');
      } finally {
        setLoading(false);
      }
    };

    loadMorningRoutine();
  }, [user?.id, selectedDate]);

  // Save wake-up time to localStorage
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-wakeUpTime`, wakeUpTime);
  }, [wakeUpTime, selectedDate]);

  // Handle habit toggle with performance and accessibility tracking
  const handleHabitToggle = async (habitKey: string, completed: boolean) => {
    if (!user?.id || !selectedDate || !morningRoutine) return;
    
    const interactionStart = performance.now();
    accessibility.trackInteractionStart();
    
    try {
      await workTypeApiClient.updateMorningRoutineHabit(
        user.id, 
        selectedDate, 
        habitKey, 
        completed
      );
      // Refresh the morning routine data
      const updatedData = await workTypeApiClient.getMorningRoutine(user.id, selectedDate);
      setMorningRoutine(updatedData);
      
      // Track successful interaction
      accessibility.trackInteractionComplete(true);
      performance.trackInteraction(interactionStart);
      
      // Announce completion for screen readers
      const taskName = MORNING_ROUTINE_TASKS.find(task => task.key === habitKey)?.title || habitKey;
      accessibility.announce(
        completed ? `${taskName} completed` : `${taskName} marked incomplete`,
        'polite'
      );
      
    } catch (error) {
      console.error('Error updating habit:', error);
      accessibility.trackInteractionComplete(false);
      accessibility.handleAccessibilityError(
        error as Error,
        `Updating habit: ${habitKey}`
      );
    }
  };

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle setting current time as wake-up time
  const setCurrentTimeAsWakeUp = () => {
    setWakeUpTime(getCurrentTime());
    setIsEditingWakeTime(false);
  };

  // Handle dismissing swipe hint
  const dismissSwipeHint = () => {
    setShowSwipeHint(false);
    localStorage.setItem('morning-routine-swipe-hint-dismissed', 'true');
  };

  // Calculate progress based on completed tasks and subtasks
  const getRoutineProgress = () => {
    if (!morningRoutine) return 0;
    return morningRoutine.completionPercentage || 0;
  };

  // Helper function to check if a habit is completed
  const isHabitCompleted = (habitKey: string): boolean => {
    if (!morningRoutine || !morningRoutine.items) return false;
    const habit = morningRoutine.items.find(item => item.name === habitKey);
    return habit?.completed || false;
  };
  
  const morningRoutineProgress = getRoutineProgress();

  if (loading) {
    return useImplementation(
      'useUnifiedLoadingState',
      // NEW: Unified loading state (safer, consistent, reusable)
      <LoadingState 
        message="Loading morning routine..." 
        variant="spinner"
        size="lg"
        className={useImplementation(
          'useUnifiedThemeSystem',
          // NEW: Unified theme system
          `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
          // OLD: Original classes (fallback for safety)
          'min-h-screen w-full bg-gray-900'
        )}
      />,
      // OLD: Original loading state (fallback for safety)
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        // NEW: Unified theme system
        `min-h-screen w-full flex items-center justify-center ${theme.backgrounds.solid.gray900}`,
        // OLD: Original classes (fallback for safety)
        'min-h-screen w-full bg-gray-900 flex items-center justify-center'
      )}>
        <div className="text-yellow-400">Loading morning routine...</div>
      </div>
    );
  }

  if (error) {
    return useImplementation(
      'useUnifiedErrorState',
      // NEW: Unified error state (safer, consistent, reusable)
      <ErrorState 
        title="Error Loading Morning Routine"
        message={`Could not load morning routine tasks: ${error}`}
        type="loading_error"
        className="min-h-screen w-full bg-gray-900"
      />,
      // OLD: Original error state (fallback for safety)
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        // NEW: Unified theme system
        `min-h-screen w-full flex items-center justify-center ${theme.backgrounds.solid.gray900}`,
        // OLD: Original classes (fallback for safety)
        'min-h-screen w-full bg-gray-900 flex items-center justify-center'
      )}>
        <div className="text-red-400">Error loading morning routine: {error}</div>
      </div>
    );
  }

  return (
    <div 
      className={useImplementation(
        'useUnifiedThemeSystem',
        // NEW: Unified theme system
        `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
        // OLD: Original classes (fallback for safety)
        'min-h-screen w-full bg-gray-900'
      )}
      style={{
        ...accessibility.adaptiveStyles,
        '--performance-mode': performance.performanceMode,
        '--animation-speed': performance.optimalSettings.animationDuration
      }}
      role="main"
      aria-label={accessibility.createAriaLabel('Morning Routine Dashboard', `${Math.round(morningRoutineProgress)}% complete`)}
    >
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Morning Routine Card */}
        <Card 
          className="bg-yellow-900/20 border-yellow-700/50"
          role="region"
          aria-labelledby="morning-routine-title"
          aria-describedby="morning-routine-description"
          tabIndex={accessibility.features.keyboardNavigation ? 0 : -1}
        >
          <CardHeader className="p-4 sm:p-6">
            <CardTitle 
              id="morning-routine-title"
              className="flex items-center justify-between text-yellow-400 text-base sm:text-lg"
            >
              <div className="flex items-center">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
                <span role="text">🌅 Morning Routine</span>
              </div>
              <div 
                className="text-sm font-medium"
                role="status"
                aria-live="polite"
                aria-label={`${Math.round(morningRoutineProgress)}% of morning routine completed`}
              >
                {Math.round(morningRoutineProgress)}% Complete
              </div>
            </CardTitle>
            
            {/* Progress Bar */}
            <div 
              className="w-full bg-yellow-900/20 rounded-full h-2 mt-4"
              role="progressbar"
              aria-valuenow={Math.round(morningRoutineProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Morning routine completion progress"
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${morningRoutineProgress}%`,
                  transition: { 
                    duration: performance.optimalSettings.animationDuration,
                    ease: "easeOut"
                  }
                }}
                style={{
                  filter: accessibility.preferences.prefersHighContrast ? 'contrast(1.5)' : 'none'
                }}
              />
            </div>

            <div className="border-t border-yellow-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Coding My Brain</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path. 
                  When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom. 
                  I will not be distracted from the path.
                </p>
              </div>
              <div className="border-t border-yellow-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Flow State Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• No use of apps other than Notion.</li>
                  <li>• No vapes or drugs (including weed).</li>
                  <li>• No more than 5 seconds until the next action.</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-yellow-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            

            {/* Morning Routine Tasks */}
            <div className="space-y-2 sm:space-y-3">
              {MORNING_ROUTINE_TASKS.map((task) => {
                const IconComponent = task.icon;
                const isMainTaskCompleted = isHabitCompleted(task.key);
                const completedSubtasks = task.subtasks.filter(subtask => isHabitCompleted(subtask.key)).length;
                
                return (
                  <div key={task.key} className="group bg-yellow-900/10 border border-yellow-700/30 rounded-xl hover:bg-yellow-900/15 hover:border-yellow-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5">
                    {/* Main Task Header */}
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                      <ExceptionalAnimatedCheckbox
                        checked={isMainTaskCompleted}
                        onCheckedChange={(checked) => handleHabitToggle(task.key, !!checked)}
                        className="mt-1"
                        size="md"
                        showCelebration={task.subtasks.length === 0}
                        taskDifficulty={
                          task.key === 'getBloodFlowing' || task.key === 'planDay' ? 'hard' :
                          task.key === 'freshenUp' ? 'medium' :
                          'easy'
                        }
                        completionStreak={0} // TODO: Track completion streaks
                        contextualPriority={
                          task.key === 'wakeUp' || task.key === 'planDay' ? 'high' :
                          task.key === 'meditation' ? 'medium' :
                          'low'
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ExceptionalAnimatedTaskIcon 
                              icon={IconComponent}
                              isCompleted={isMainTaskCompleted}
                              size="md"
                              taskType={
                                task.key === 'getBloodFlowing' ? 'workout' :
                                task.key === 'freshenUp' ? 'hygiene' :
                                task.key === 'powerUpBrain' ? 'nutrition' :
                                task.key === 'planDay' ? 'planning' :
                                task.key === 'meditation' ? 'meditation' :
                                'default'
                              }
                              completionStreak={0} // TODO: Track completion streaks
                              taskDifficulty={
                                task.key === 'getBloodFlowing' || task.key === 'planDay' ? 'hard' :
                                task.key === 'freshenUp' ? 'medium' :
                                'easy'
                              }
                              timeOfDay="morning"
                              showProgress={task.subtasks.length > 0}
                              progress={task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0}
                            />
                            <h4 className="text-yellow-100 font-semibold text-sm sm:text-base">{task.title}</h4>
                            <span className="text-xs text-gray-400">({task.timeEstimate})</span>
                          </div>
                          {task.subtasks.length > 0 && (
                            <ExceptionalProgressCounter
                              current={completedSubtasks}
                              total={task.subtasks.length}
                              className="ml-2"
                              showCelebration={true}
                              taskType={
                                task.key === 'getBloodFlowing' ? 'workout' :
                                task.key === 'freshenUp' ? 'hygiene' :
                                task.key === 'powerUpBrain' ? 'nutrition' :
                                task.key === 'planDay' ? 'planning' :
                                task.key === 'meditation' ? 'meditation' :
                                'planning'
                              }
                              completionStreak={0} // TODO: Track completion streaks
                              taskDifficulty={
                                task.key === 'getBloodFlowing' || task.key === 'planDay' ? 'hard' :
                                task.key === 'freshenUp' ? 'medium' :
                                'easy'
                              }
                              timeOfDay="morning"
                            />
                          )}
                        </div>
                        {task.description && (
                          <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">{task.description}</p>
                        )}
                        
                        {/* Special wake-up time interface */}
                        {task.hasTimeTracking && (
                          <div className="mt-2">
                            <div className="space-y-2">
                              {wakeUpTime ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 bg-yellow-900/20 border border-yellow-700/50 rounded-md px-3 py-2">
                                    <Clock className="h-4 w-4 text-yellow-400" />
                                    <span className="text-yellow-100 font-semibold">
                                      Woke up at: {wakeUpTime}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditingWakeTime(!isEditingWakeTime)}
                                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              ) : null}
                              
                              {(!wakeUpTime || isEditingWakeTime) && (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    placeholder="Enter wake-up time (e.g., 7:30 AM)"
                                    value={wakeUpTime}
                                    onChange={(e) => setWakeUpTime(e.target.value)}
                                    className="bg-yellow-900/20 border-yellow-700/50 text-yellow-100 text-sm placeholder:text-gray-400 focus:border-yellow-600 flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={setCurrentTimeAsWakeUp}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white whitespace-nowrap"
                                  >
                                    Use Now ({getCurrentTime()})
                                  </Button>
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-400 italic">
                                Track your wake-up time to build better morning routine habits.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Sub-tasks - Enhanced with better visual hierarchy */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-2 ml-6 space-y-2 border-l border-yellow-700/30 pl-4">
                        {task.subtasks.map((subtask) => {
                          const swipeHandlers = useSwipeable({
                            onSwipedRight: () => handleHabitToggle(subtask.key, true),
                            onSwipedLeft: () => handleHabitToggle(subtask.key, false),
                            preventDefaultTouchmoveEvent: true,
                            trackMouse: false,
                            delta: 80
                          });

                          return (
                          <motion.div
                            key={subtask.key}
                            {...swipeHandlers}
                            className="group flex items-center space-x-3 p-3 sm:p-2 hover:bg-yellow-900/10 rounded-lg transition-all duration-200 min-h-[48px] sm:min-h-[40px] cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ExceptionalAnimatedCheckbox
                              checked={isHabitCompleted(subtask.key)}
                              onCheckedChange={(checked) => handleHabitToggle(subtask.key, !!checked)}
                              size="sm"
                              showCelebration={true}
                              taskDifficulty={
                                subtask.key === 'pushups' || subtask.key === 'thoughtDump' ? 'hard' :
                                subtask.key === 'coldShower' || subtask.key === 'planDeepWork' ? 'medium' :
                                'easy'
                              }
                              completionStreak={0} // TODO: Track individual subtask streaks
                              contextualPriority={
                                subtask.key === 'pushups' || subtask.key === 'thoughtDump' || subtask.key === 'planDeepWork' ? 'high' :
                                subtask.key === 'coldShower' || subtask.key === 'water' ? 'medium' :
                                'low'
                              }
                            />
                            <span className={cn(
                              "text-sm font-medium transition-all duration-200 flex-1",
                              isHabitCompleted(subtask.key)
                                ? "text-gray-500 line-through" 
                                : "text-yellow-100/90 group-hover:text-yellow-50"
                            )}>
                              {subtask.title}
                            </span>
                            {isHabitCompleted(subtask.key) && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 animate-in zoom-in-50 duration-200 flex-shrink-0" />
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Exceptional Swipe Hint for Mobile Users */}
      <ExceptionalSwipeHint 
        show={showSwipeHint} 
        onDismiss={dismissSwipeHint}
        variant="floating"
        gestureContext="subtasks"
        adaptivePosition="auto"
        swipeActions={{
          right: { label: "Complete", color: "text-green-400" },
          left: { label: "Undo", color: "text-red-400" }
        }}
      />

      {/* ARIA Live Regions for Screen Reader Announcements */}
      <div className="sr-only">
        {accessibility.announcements.map((announcement, index) => {
          const [priority, message] = announcement.split(':');
          return (
            <div
              key={index}
              aria-live={priority as 'polite' | 'assertive'}
              aria-atomic="true"
            >
              {message}
            </div>
          );
        })}
      </div>

      {/* Performance and Accessibility Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm text-xs text-gray-300 p-2 rounded border border-gray-600 max-w-xs">
          <div>Performance: {performance.getPerformanceGrade()}</div>
          <div>FPS: {performance.metrics.averageFPS}</div>
          <div>Mode: {performance.performanceMode}</div>
          <div>A11y Score: {accessibility.getAccessibilityScore()}</div>
          <div>Features: {Object.entries(accessibility.features).filter(([k,v]) => v).map(([k]) => k).join(', ')}</div>
        </div>
      )}
    </div>
  );
};
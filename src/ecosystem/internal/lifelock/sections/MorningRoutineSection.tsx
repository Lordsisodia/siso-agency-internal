import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useClerkUser } from '@/shared/ClerkProvider';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { workTypeApiClient } from '@/services/workTypeApiClient';
import { useOfflineManager } from '@/shared/hooks/useOfflineManager';

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

const MORNING_ROUTINE_TASKS = [
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
    title: 'Get Blood Flowing (5 min)',
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
];

export const MorningRoutineSection: React.FC<MorningRoutineSectionProps> = React.memo(({
  selectedDate
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const { saveTask, loadTasks, isOffline } = useOfflineManager();
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wakeUpTime, setWakeUpTime] = useState<string>(() => {
    const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-wakeUpTime`);
    return saved || '';
  });

  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false);
  const [localProgressTrigger, setLocalProgressTrigger] = useState(0);

  // Load morning routine data
  useEffect(() => {
    const loadMorningRoutine = async () => {
      if (!internalUserId || !selectedDate) return;
      
      try {
        setLoading(true);
        setError(null);
        // Try offline-first approach
        const data = await loadTasks('morning_routine', {
          user_id: internalUserId,
          date: format(selectedDate, 'yyyy-MM-dd')
        });
        
        if (data && data.length > 0) {
          // Use offline data
          const routineData = data[0];
          setMorningRoutine(routineData);
        } else {
          // Fallback to API if no offline data
          const apiData = await workTypeApiClient.getMorningRoutine(internalUserId, selectedDate);
          setMorningRoutine(apiData);
        }
      } catch (error) {
        console.error('Error loading morning routine:', error);
        setError('Failed to load morning routine');
      } finally {
        setLoading(false);
      }
    };

    loadMorningRoutine();
  }, [internalUserId, selectedDate, loadTasks]);

  // Save wake-up time to localStorage
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-wakeUpTime`, wakeUpTime);
  }, [wakeUpTime, selectedDate]);

  // Handle habit toggle
  const handleHabitToggle = async (habitKey: string, completed: boolean) => {
    if (!internalUserId || !selectedDate) return;
    
    try {
      // Always save to localStorage for immediate feedback
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      localStorage.setItem(`lifelock-${dateKey}-${habitKey}`, completed.toString());
      
      // Use offline manager for persistent storage and sync
      // Transform to daily_health schema structure
      const healthData = {
        id: `${internalUserId}-${format(selectedDate, 'yyyy-MM-dd')}`, // Composite key
        user_id: internalUserId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        health_checklist: {
          morning_routine: {
            [habitKey]: completed
          }
        },
        updated_at: new Date().toISOString()
      };
      
      await saveTask('morning_routine', healthData);
      
      // Update local state immediately for better UX
      if (morningRoutine && morningRoutine.items && Array.isArray(morningRoutine.items)) {
        const updatedItems = morningRoutine.items.map(item =>
          item.name === habitKey ? { ...item, completed } : item
        );
        const completedCount = updatedItems.filter(item => item.completed).length;
        setMorningRoutine({
          ...morningRoutine,
          items: updatedItems,
          completedCount,
          completionPercentage: (completedCount / updatedItems.length) * 100
        });
      }
      
      // Force re-render to update progress calculation
      setLocalProgressTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating habit:', error);
      // LocalStorage save still works even if API fails
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

  // Helper function to check if a habit is completed
  const isHabitCompleted = useCallback((habitKey: string): boolean => {
    if (morningRoutine && morningRoutine.items) {
      // Use API data if available
      const habit = morningRoutine.items.find(item => item.name === habitKey);
      return habit?.completed || false;
    } else {
      // Fallback to localStorage if API data not available
      const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const stored = localStorage.getItem(`lifelock-${dateKey}-${habitKey}`);
      return stored === 'true';
    }
  }, [morningRoutine, selectedDate]);

  // Calculate progress based on completed tasks and subtasks
  const getRoutineProgress = useCallback(() => {
    if (!morningRoutine) {
      // If no API data, calculate locally based on MORNING_ROUTINE_TASKS
      let totalTasks = 0;
      let completedTasks = 0;
      
      MORNING_ROUTINE_TASKS.forEach(task => {
        // Count main task
        totalTasks += 1;
        if (isHabitCompleted(task.key)) completedTasks += 1;
        
        // Count subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            totalTasks += 1;
            if (isHabitCompleted(subtask.key)) completedTasks += 1;
          });
        }
      });
      
      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }
    
    return morningRoutine.completionPercentage || 0;
  }, [morningRoutine, isHabitCompleted]);
  
  const morningRoutineProgress = useMemo(() => {
    return getRoutineProgress();
  }, [getRoutineProgress]);

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400">Loading morning routine...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error loading morning routine: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-gray-900">

      <div className="max-w-7xl mx-auto space-y-6 p-4">
        
        {/* Morning Routine Card */}
        <Card className="bg-yellow-900/20 border-yellow-700/50">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center justify-between text-yellow-400 text-base sm:text-lg">
              <div className="flex items-center">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                🌅 Morning Routine
              </div>
              <div className="text-sm font-medium">
                {Math.round(morningRoutineProgress)}% Complete
              </div>
            </CardTitle>
            
            {/* Progress Bar */}
            <div className="w-full bg-yellow-900/20 rounded-full h-2 mt-4">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${morningRoutineProgress}%` }}
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
          <CardContent className="p-6 pt-0">
            

            {/* Morning Routine Tasks */}
            <div className="space-y-2 sm:space-y-3">
              {MORNING_ROUTINE_TASKS.map((task) => {
                const IconComponent = task.icon;
                const isMainTaskCompleted = isHabitCompleted(task.key);
                const completedSubtasks = task.subtasks.filter(subtask => isHabitCompleted(subtask.key)).length;
                
                return (
                  <div key={task.key} className="group py-3 transition-all duration-300">
                    {/* Main Task Header */}
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                      <Checkbox
                        checked={isMainTaskCompleted}
                        onCheckedChange={(checked) => handleHabitToggle(task.key, !!checked)}
                        className="mt-1 border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5 text-yellow-400" />
                            <h4 className="text-yellow-100 font-semibold text-sm sm:text-base">{task.title}</h4>
                            <span className="text-xs text-gray-400">({task.timeEstimate})</span>
                          </div>
                          {task.subtasks.length > 0 && (
                            <div className="relative">
                              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-400/40 rounded-full px-3 py-1.5 ml-2 shadow-sm">
                                <span className="text-xs text-yellow-300 font-semibold tracking-wide">
                                  {completedSubtasks}/{task.subtasks.length}
                                </span>
                              </div>
                              {/* Progress completion indicator */}
                              {completedSubtasks === task.subtasks.length && task.subtasks.length > 0 && (
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg">
                                  <div className="absolute inset-0.5 bg-green-300 rounded-full animate-ping"></div>
                                </div>
                              )}
                            </div>
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
                                  <div className="flex items-center space-x-1 bg-transparent border border-yellow-700/50 rounded-md px-3 py-2">
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
                                    className="bg-transparent border-yellow-700/50 text-yellow-100 text-sm placeholder:text-gray-400 focus:border-yellow-600 flex-1"
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
                      <div className="mt-4 ml-8 space-y-3">
                        {task.subtasks.map((subtask) => (
                          <div
                            key={subtask.key}
                            className="group flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                          >
                            {/* Visual connector line */}
                            <div className="relative">
                              <div className="absolute -left-4 top-1/2 w-3 h-px bg-yellow-500/30"></div>
                              <Checkbox
                                checked={isHabitCompleted(subtask.key)}
                                onCheckedChange={(checked) => handleHabitToggle(subtask.key, !!checked)}
                                className="h-4 w-4 border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 transition-all duration-200 group-hover:border-yellow-400"
                              />
                            </div>
                            <span className={cn(
                              "text-sm font-medium transition-all duration-200 flex-1",
                              isHabitCompleted(subtask.key)
                                ? "text-gray-500 line-through" 
                                : "text-yellow-100/90 group-hover:text-yellow-50"
                            )}>
                              {subtask.title}
                            </span>
                            {isHabitCompleted(subtask.key) && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 animate-in zoom-in-50 duration-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
});
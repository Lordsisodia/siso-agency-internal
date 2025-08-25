import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun,
  CheckCircle2,
  Circle,
  Calendar,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MorningRoutineSubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface MorningRoutineItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  logField?: string;
  subTasks?: MorningRoutineSubTask[];
}

const defaultMorningRoutine: MorningRoutineItem[] = [
  { 
    id: '1', 
    title: 'Wake Up', 
    completed: false, 
    description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
    logField: 'Wake up time: ____',
    subTasks: []
  },
  { 
    id: '2', 
    title: 'Get Blood Flowing (5 min)', 
    completed: false, 
    description: 'Max rep push-ups (Target PB: 30) - Physical activation to wake up the body.',
    logField: 'Log reps: ____',
    subTasks: [
      { id: '2a', title: 'Push-ups (PB 30)', completed: false },
      { id: '2b', title: 'Sit-ups', completed: false },
      { id: '2c', title: 'Pull-ups', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Freshen Up (25 min)', 
    completed: false, 
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    subTasks: [
      { id: '3a', title: 'Shit', completed: false },
      { id: '3b', title: 'Brush teeth', completed: false },
      { id: '3c', title: 'Cold shower', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Power Up Brain (5 min)', 
    completed: false, 
    description: 'Hydrate and fuel the body and mind.',
    subTasks: [
      { id: '4a', title: 'Water (5 glasses)', completed: false },
      { id: '4b', title: 'Supplements', completed: false },
      { id: '4c', title: 'Pre-workout', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Plan Day (15 min)', 
    completed: false, 
    description: 'Go through tasks, prioritize, and allocate time slots.',
    subTasks: [
      { id: '5a', title: 'Thought dump', completed: false },
      { id: '5b', title: 'Plan deep work', completed: false },
      { id: '5c', title: 'Plan light work', completed: false },
      { id: '5d', title: 'Set timebox', completed: false }
    ]
  },
  { 
    id: '6', 
    title: 'Meditation (2 min)', 
    completed: false, 
    description: 'Meditate to set an innovative mindset for creating business value.',
    subTasks: []
  }
];

interface MorningRoutineSectionProps {
  todayCard: any;
  onTaskToggle?: (taskId: string) => void;
  onQuickAdd: () => void;
  onCustomTaskAdd?: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
  onViewDetails: (card: any) => void;
}

export const MorningRoutineSection: React.FC<MorningRoutineSectionProps> = ({
  todayCard,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd,
  onViewDetails
}) => {
  const [wakeUpTime, setWakeUpTime] = useState<string>(() => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-wakeUpTime`);
    return saved || '';
  });

  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false);

  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineItem[]>(() => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-morningRoutine`);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Check if data has sub-tasks, if not use defaults
        const hasSubTasks = parsedData.some((item: any) => item.subTasks && item.subTasks.length > 0);
        if (!hasSubTasks) {
          console.log('No sub-tasks found in saved data, using defaults with sub-tasks');
          return defaultMorningRoutine;
        }
        return parsedData;
      } catch (e) {
        console.warn('Failed to parse morning routine data, using defaults');
        return defaultMorningRoutine;
      }
    }
    return defaultMorningRoutine;
  });

  // Save to localStorage whenever morning routine changes
  useEffect(() => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-morningRoutine`, JSON.stringify(morningRoutine));
  }, [morningRoutine]);

  // Save wake-up time to localStorage
  useEffect(() => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-wakeUpTime`, wakeUpTime);
  }, [wakeUpTime]);

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

  const toggleItem = (id: string) => {
    const updatedItems = morningRoutine.map((item: MorningRoutineItem) => {
      if (item.id === id) {
        if (item.subTasks && item.subTasks.length > 0) {
          // For items with sub-tasks, toggle all sub-tasks instead of main task
          const newCompleted = !item.completed;
          const updatedSubTasks = item.subTasks.map(sub => ({ ...sub, completed: newCompleted }));
          return { ...item, completed: newCompleted, subTasks: updatedSubTasks };
        } else {
          // For items without sub-tasks, toggle the main task
          return { ...item, completed: !item.completed };
        }
      }
      return item;
    });
    setMorningRoutine(updatedItems);
  };

  const toggleSubTask = (itemId: string, subTaskId: string) => {
    const updatedItems = morningRoutine.map((item: MorningRoutineItem) => {
      if (item.id === itemId && item.subTasks) {
        const updatedSubTasks = item.subTasks.map(sub => 
          sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
        );
        
        // Check if all sub-tasks are completed to auto-complete main task
        const allSubTasksCompleted = updatedSubTasks.every(sub => sub.completed);
        
        return { 
          ...item, 
          subTasks: updatedSubTasks, 
          completed: allSubTasksCompleted && updatedSubTasks.length > 0
        };
      }
      return item;
    });
    setMorningRoutine(updatedItems);
  };

  const updateItemField = (id: string, field: string, value: string) => {
    const updatedItems = morningRoutine.map((item: MorningRoutineItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setMorningRoutine(updatedItems);
  };

  // Reset function to restore all sub-tasks
  const resetToDefaults = () => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    localStorage.removeItem(`lifelock-${dateKey}-morningRoutine`);
    setMorningRoutine(defaultMorningRoutine);
    console.log('Reset to defaults with all sub-tasks');
  };

  // Calculate progress based on total sub-tasks completed
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    morningRoutine.forEach(item => {
      if (item.subTasks && item.subTasks.length > 0) {
        // Count sub-tasks
        totalTasks += item.subTasks.length;
        completedTasks += item.subTasks.filter(sub => sub.completed).length;
      } else {
        // Count main task if no sub-tasks
        totalTasks += 1;
        if (item.completed) completedTasks += 1;
      }
    });
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };
  
  const morningRoutineProgress = getTotalProgress();

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Morning Routine Card */}
        <Card className="bg-yellow-900/20 border-yellow-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-yellow-400 text-base sm:text-lg">
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              🌅 Morning Routine
            </CardTitle>
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
            {/* Debug Reset Button - Remove in production */}
            <div className="mb-4">
              <button 
                onClick={resetToDefaults}
                className="text-xs text-yellow-400 hover:text-yellow-300 underline"
              >
                Reset & Show All Sub-tasks
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {morningRoutine.map((item) => (
                <div key={item.id} className="group bg-yellow-900/10 border border-yellow-700/30 rounded-xl hover:bg-yellow-900/15 hover:border-yellow-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5">
                  {/* Main Task Header */}
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1 border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-yellow-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                        {item.subTasks && item.subTasks.length > 0 && (
                          <div className="relative">
                            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-400/40 rounded-full px-3 py-1.5 ml-2 shadow-sm">
                              <span className="text-xs text-yellow-300 font-semibold tracking-wide">
                                {item.subTasks.filter(sub => sub.completed).length}/{item.subTasks.length}
                              </span>
                            </div>
                            {/* Progress completion indicator */}
                            {item.subTasks.filter(sub => sub.completed).length === item.subTasks.length && item.subTasks.length > 0 && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg">
                                <div className="absolute inset-0.5 bg-green-300 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.logField && (
                        <div className="mt-2">
                          {item.id === '1' ? (
                            // Special wake-up time interface
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
                          ) : (
                            // Regular log field for other tasks
                            <>
                              <Input
                                placeholder={item.logField}
                                className="bg-yellow-900/20 border-yellow-700/50 text-yellow-100 text-sm placeholder:text-gray-400 focus:border-yellow-600"
                              />
                              <p className="text-xs text-gray-400 mt-1 italic">Log your max reps to track progress toward your 5% weekly increase goal.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Sub-tasks - Enhanced with better visual hierarchy */}
                  {item.subTasks && item.subTasks.length > 0 && (
                    <div className="mt-4 ml-8 space-y-3">
                      {item.subTasks.map((subTask, subIndex) => (
                        <div
                          key={subTask.id}
                          className="group flex items-center space-x-3 p-3 hover:bg-yellow-900/10 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                        >
                          {/* Visual connector line */}
                          <div className="relative">
                            <div className="absolute -left-4 top-1/2 w-3 h-px bg-yellow-500/30"></div>
                            <Checkbox
                              checked={subTask.completed}
                              onCheckedChange={() => toggleSubTask(item.id, subTask.id)}
                              className="h-4 w-4 border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 transition-all duration-200 group-hover:border-yellow-400"
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-medium transition-all duration-200 flex-1",
                            subTask.completed 
                              ? "text-gray-500 line-through" 
                              : "text-yellow-100/90 group-hover:text-yellow-50"
                          )}>
                            {subTask.title}
                          </span>
                          {subTask.completed && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 animate-in zoom-in-50 duration-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
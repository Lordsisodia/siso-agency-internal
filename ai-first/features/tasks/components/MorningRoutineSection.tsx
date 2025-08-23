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
    title: 'Get Blood Flowing', 
    completed: false, 
    description: 'Physical activation to wake up the body.',
    subTasks: [
      { id: '1a', title: 'Push-ups', completed: false },
      { id: '1b', title: 'Sit-ups', completed: false },
      { id: '1c', title: 'Pull-ups', completed: false }
    ]
  },
  { 
    id: '2', 
    title: 'Freshen Up', 
    completed: false, 
    description: 'Personal hygiene and cleanliness.',
    subTasks: [
      { id: '2a', title: 'Shit', completed: false },
      { id: '2b', title: 'Brush teeth', completed: false },
      { id: '2c', title: 'Shower', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Power Up Brain', 
    completed: false, 
    description: 'Mental preparation and nourishment.',
    subTasks: [
      { id: '3a', title: 'Water', completed: false },
      { id: '3b', title: 'Supplements', completed: false },
      { id: '3c', title: 'Meditate', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Plan Day', 
    completed: false, 
    description: 'Strategic planning and task organization.',
    subTasks: [
      { id: '4a', title: 'Thought dump', completed: false },
      { id: '4b', title: 'Plan deep work', completed: false },
      { id: '4c', title: 'Plan light work', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Set Timebox', 
    completed: false, 
    description: 'Time allocation and schedule setup.',
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
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineItem[]>(() => {
    const saved = localStorage.getItem('lifelock-morning-routine');
    return saved ? JSON.parse(saved) : defaultMorningRoutine;
  });

  // Save to localStorage whenever morning routine changes
  useEffect(() => {
    localStorage.setItem('lifelock-morning-routine', JSON.stringify(morningRoutine));
  }, [morningRoutine]);

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
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full w-full">
      {/* Morning Routine Card with Manifestation */}
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
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-yellow-300 mb-2">
              <span>Progress</span>
              <span>{Math.round(morningRoutineProgress)}%</span>
            </div>
            <div className="w-full bg-yellow-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${morningRoutineProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {morningRoutine.map((item) => (
              <div key={item.id} className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg hover:bg-yellow-900/15 transition-colors">
                {/* Main Task */}
                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1 border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                  />
                  <div className="flex-1">
                    <h4 className="text-yellow-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                    {item.description && (
                      <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">{item.description}</p>
                    )}
                    {item.logField && (
                      <div className="mt-2">
                        <Input
                          placeholder={item.logField}
                          className="bg-yellow-900/20 border-yellow-700/50 text-yellow-100 text-sm placeholder:text-gray-400 focus:border-yellow-600"
                        />
                        <p className="text-xs text-gray-400 mt-1 italic">Log your max reps to track progress toward your 5% weekly increase goal.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sub-tasks */}
                {item.subTasks && item.subTasks.length > 0 && (
                  <div className="px-4 pb-3 ml-6">
                    <div className="space-y-2">
                      {item.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={subTask.completed}
                            onCheckedChange={() => toggleSubTask(item.id, subTask.id)}
                            className="h-3 w-3 border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                          />
                          <span className="text-gray-300 text-xs sm:text-sm">{subTask.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <Button 
          onClick={onQuickAdd}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          Complete Morning Routine
        </Button>
        
        <Button 
          onClick={() => onViewDetails?.(todayCard)}
          variant="outline"
          className="flex-1 border-yellow-400/50 text-yellow-300 hover:bg-yellow-500/20 font-semibold py-3 rounded-xl"
        >
          <Calendar className="h-5 w-5 mr-2" />
          View Day Plan
        </Button>
      </motion.div>
    </div>
  );
};
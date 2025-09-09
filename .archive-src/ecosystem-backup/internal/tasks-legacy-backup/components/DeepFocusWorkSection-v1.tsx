import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface DeepWorkSubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface DeepWorkItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  logField?: string;
  subTasks?: DeepWorkSubTask[];
}

const defaultDeepWorkTasks: DeepWorkItem[] = [
  { 
    id: '1', 
    title: 'Environment Setup (10 min)', 
    completed: false, 
    description: 'Create optimal environment for deep focus work.',
    subTasks: [
      { id: '1a', title: 'Clear workspace', completed: false },
      { id: '1b', title: 'Close all distractions', completed: false },
      { id: '1c', title: 'Set phone to Do Not Disturb', completed: false }
    ]
  },
  { 
    id: '2', 
    title: 'Deep Focus Block 1 (2-4 hours)', 
    completed: false, 
    description: 'First major deep work session focused on most important task.',
    logField: 'Log hours worked: ____',
    subTasks: [
      { id: '2a', title: 'Identify primary objective', completed: false },
      { id: '2b', title: 'Work without breaks', completed: false },
      { id: '2c', title: 'Document progress', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Strategic Break (15 min)', 
    completed: false, 
    description: 'Mindful break to recharge and maintain focus quality.',
    subTasks: [
      { id: '3a', title: 'Walk or light movement', completed: false },
      { id: '3b', title: 'Hydrate', completed: false },
      { id: '3c', title: 'Avoid digital stimulation', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Deep Focus Block 2 (2-4 hours)', 
    completed: false, 
    description: 'Second major deep work session for sustained productivity.',
    logField: 'Log hours worked: ____',
    subTasks: [
      { id: '4a', title: 'Resume or switch to next priority', completed: false },
      { id: '4b', title: 'Maintain flow state', completed: false },
      { id: '4c', title: 'Achieve significant progress', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Session Review (10 min)', 
    completed: false, 
    description: 'Reflect on deep work quality and plan next session.',
    subTasks: [
      { id: '5a', title: 'Document accomplishments', completed: false },
      { id: '5b', title: 'Note areas for improvement', completed: false },
      { id: '5c', title: 'Plan next deep work session', completed: false }
    ]
  }
];

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const [deepWorkTasks, setDeepWorkTasks] = useState<DeepWorkItem[]>(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-deepWorkTasks`);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Check if data has sub-tasks, if not use defaults
        const hasSubTasks = parsedData.some((item: any) => item.subTasks && item.subTasks.length > 0);
        if (!hasSubTasks) {
          console.log('No sub-tasks found in saved data, using defaults with sub-tasks');
          return defaultDeepWorkTasks;
        }
        return parsedData;
      } catch (e) {
        console.warn('Failed to parse deep work data, using defaults');
        return defaultDeepWorkTasks;
      }
    }
    return defaultDeepWorkTasks;
  });

  // Save to localStorage whenever deep work tasks change
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-deepWorkTasks`, JSON.stringify(deepWorkTasks));
  }, [deepWorkTasks, selectedDate]);

  const toggleItem = (id: string) => {
    const updatedItems = deepWorkTasks.map((item: DeepWorkItem) => {
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
    setDeepWorkTasks(updatedItems);
  };

  const toggleSubTask = (itemId: string, subTaskId: string) => {
    const updatedItems = deepWorkTasks.map((item: DeepWorkItem) => {
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
    setDeepWorkTasks(updatedItems);
  };

  const updateItemField = (id: string, field: string, value: string) => {
    const updatedItems = deepWorkTasks.map((item: DeepWorkItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setDeepWorkTasks(updatedItems);
  };

  // Reset function to restore all sub-tasks
  const resetToDefaults = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.removeItem(`lifelock-${dateKey}-deepWorkTasks`);
    setDeepWorkTasks(defaultDeepWorkTasks);
    console.log('Reset to defaults with all sub-tasks');
  };

  // Calculate progress based on total sub-tasks completed
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    deepWorkTasks.forEach(item => {
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
  
  const deepWorkProgress = getTotalProgress();

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Deep Work Card */}
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-blue-400 text-base sm:text-lg">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              🧠 Deep Work Sessions
            </CardTitle>
            <div className="border-t border-blue-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Flow State Protocol</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  Deep work sessions require sustained focus without interruption. These blocks are designed for your most 
                  important, cognitively demanding work that creates maximum value.
                </p>
              </div>
              <div className="border-t border-blue-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Deep Work Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• No interruptions or task switching allowed.</li>
                  <li>• Phone on airplane mode or Do Not Disturb.</li>
                  <li>• Work in 2-4 hour focused blocks.</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {/* Debug Reset Button - Remove in production */}
            <div className="mb-4">
              <button 
                onClick={resetToDefaults}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Reset & Show All Sub-tasks
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {deepWorkTasks.map((item) => (
                <div key={item.id} className="group bg-blue-900/10 border border-blue-700/30 rounded-xl hover:bg-blue-900/15 hover:border-blue-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                  {/* Main Task Header */}
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-blue-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                        {item.subTasks && item.subTasks.length > 0 && (
                          <div className="relative">
                            <div className="bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-400/40 rounded-full px-3 py-1.5 ml-2 shadow-sm">
                              <span className="text-xs text-blue-300 font-semibold tracking-wide">
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
                          <Input
                            placeholder={item.logField}
                            className="bg-blue-900/20 border-blue-700/50 text-blue-100 text-sm placeholder:text-gray-400 focus:border-blue-600"
                          />
                          <p className="text-xs text-gray-400 mt-1 italic">Track your deep work hours to measure productivity.</p>
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
                          className="group flex items-center space-x-3 p-3 hover:bg-blue-900/10 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                        >
                          {/* Visual connector line */}
                          <div className="relative">
                            <div className="absolute -left-4 top-1/2 w-3 h-px bg-blue-500/30"></div>
                            <Checkbox
                              checked={subTask.completed}
                              onCheckedChange={() => toggleSubTask(item.id, subTask.id)}
                              className="h-4 w-4 border-blue-400/70 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-all duration-200 group-hover:border-blue-400"
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-medium transition-all duration-200 flex-1",
                            subTask.completed 
                              ? "text-gray-500 line-through" 
                              : "text-blue-100/90 group-hover:text-blue-50"
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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LightWorkSubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface LightWorkItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  logField?: string;
  subTasks?: LightWorkSubTask[];
}

const defaultLightWorkTasks: LightWorkItem[] = [
  { 
    id: '1', 
    title: 'Email & Communications (30 min)', 
    completed: false, 
    description: 'Handle routine communications and administrative tasks.',
    subTasks: [
      { id: '1a', title: 'Check and respond to priority emails', completed: false },
      { id: '1b', title: 'Review messages and notifications', completed: false },
      { id: '1c', title: 'Send follow-up communications', completed: false }
    ]
  },
  { 
    id: '2', 
    title: 'Administrative Tasks (45 min)', 
    completed: false, 
    description: 'Complete necessary administrative and organizational work.',
    subTasks: [
      { id: '2a', title: 'Update project status', completed: false },
      { id: '2b', title: 'Review and organize files', completed: false },
      { id: '2c', title: 'Schedule appointments/meetings', completed: false },
      { id: '2d', title: 'Process invoices or payments', completed: false }
    ]
  },
  { 
    id: '3', 
    title: 'Quick Wins (30 min)', 
    completed: false, 
    description: 'Small tasks that provide immediate value and momentum.',
    subTasks: [
      { id: '3a', title: 'Complete pending small tasks', completed: false },
      { id: '3b', title: 'Make quick decisions on waiting items', completed: false },
      { id: '3c', title: 'Update task lists and priorities', completed: false }
    ]
  },
  { 
    id: '4', 
    title: 'Learning & Research (30 min)', 
    completed: false, 
    description: 'Light research, reading, or skill development activities.',
    logField: 'Log learning topic: ____',
    subTasks: [
      { id: '4a', title: 'Read industry articles or news', completed: false },
      { id: '4b', title: 'Watch educational content', completed: false },
      { id: '4c', title: 'Take notes on key insights', completed: false }
    ]
  },
  { 
    id: '5', 
    title: 'Planning & Review (20 min)', 
    completed: false, 
    description: 'Light planning and review activities for next work sessions.',
    subTasks: [
      { id: '5a', title: 'Review today\'s progress', completed: false },
      { id: '5b', title: 'Plan tomorrow\'s priorities', completed: false },
      { id: '5c', title: 'Adjust weekly goals if needed', completed: false }
    ]
  }
];

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const [lightWorkTasks, setLightWorkTasks] = useState<LightWorkItem[]>(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const saved = localStorage.getItem(`lifelock-${dateKey}-lightWorkTasks`);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Check if data has sub-tasks, if not use defaults
        const hasSubTasks = parsedData.some((item: any) => item.subTasks && item.subTasks.length > 0);
        if (!hasSubTasks) {
          console.log('No sub-tasks found in saved data, using defaults with sub-tasks');
          return defaultLightWorkTasks;
        }
        return parsedData;
      } catch (e) {
        console.warn('Failed to parse light work data, using defaults');
        return defaultLightWorkTasks;
      }
    }
    return defaultLightWorkTasks;
  });

  // Save to localStorage whenever light work tasks change
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-lightWorkTasks`, JSON.stringify(lightWorkTasks));
  }, [lightWorkTasks, selectedDate]);

  const toggleItem = (id: string) => {
    const updatedItems = lightWorkTasks.map((item: LightWorkItem) => {
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
    setLightWorkTasks(updatedItems);
  };

  const toggleSubTask = (itemId: string, subTaskId: string) => {
    const updatedItems = lightWorkTasks.map((item: LightWorkItem) => {
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
    setLightWorkTasks(updatedItems);
  };

  const updateItemField = (id: string, field: string, value: string) => {
    const updatedItems = lightWorkTasks.map((item: LightWorkItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setLightWorkTasks(updatedItems);
  };

  // Reset function to restore all sub-tasks
  const resetToDefaults = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.removeItem(`lifelock-${dateKey}-lightWorkTasks`);
    setLightWorkTasks(defaultLightWorkTasks);
    console.log('Reset to defaults with all sub-tasks');
  };

  // Calculate progress based on total sub-tasks completed
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    lightWorkTasks.forEach(item => {
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
  
  const lightWorkProgress = getTotalProgress();

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Light Work Card */}
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              ☕ Light Work Sessions
            </CardTitle>
            <div className="border-t border-green-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Momentum Building</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  Light work sessions are perfect for administrative tasks, quick wins, and maintaining momentum 
                  when your energy is lower or when you need a mental break from deep focus work.
                </p>
              </div>
              <div className="border-t border-green-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Light Work Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• Perfect for lower energy periods.</li>
                  <li>• Focus on quick wins and administrative tasks.</li>
                  <li>• Keep sessions between 20-45 minutes.</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-green-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {/* Debug Reset Button - Remove in production */}
            <div className="mb-4">
              <button 
                onClick={resetToDefaults}
                className="text-xs text-green-400 hover:text-green-300 underline"
              >
                Reset & Show All Sub-tasks
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {lightWorkTasks.map((item) => (
                <div key={item.id} className="group bg-green-900/10 border border-green-700/30 rounded-xl hover:bg-green-900/15 hover:border-green-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                  {/* Main Task Header */}
                  <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1 border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-green-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                        {item.subTasks && item.subTasks.length > 0 && (
                          <div className="relative">
                            <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-400/40 rounded-full px-3 py-1.5 ml-2 shadow-sm">
                              <span className="text-xs text-green-300 font-semibold tracking-wide">
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
                            className="bg-green-900/20 border-green-700/50 text-green-100 text-sm placeholder:text-gray-400 focus:border-green-600"
                          />
                          <p className="text-xs text-gray-400 mt-1 italic">Track what you learned or researched today.</p>
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
                          className="group flex items-center space-x-3 p-3 hover:bg-green-900/10 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                        >
                          {/* Visual connector line */}
                          <div className="relative">
                            <div className="absolute -left-4 top-1/2 w-3 h-px bg-green-500/30"></div>
                            <Checkbox
                              checked={subTask.completed}
                              onCheckedChange={() => toggleSubTask(item.id, subTask.id)}
                              className="h-4 w-4 border-green-400/70 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all duration-200 group-hover:border-green-400"
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-medium transition-all duration-200 flex-1",
                            subTask.completed 
                              ? "text-gray-500 line-through" 
                              : "text-green-100/90 group-hover:text-green-50"
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
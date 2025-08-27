import React, { useState, useEffect } from 'react';
import { 
  Brain,
  Plus,
  Check,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  X,
  Edit,
  Mic,
  MicOff,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTaskDatabase } from '../../../hooks/useTaskDatabase';

// REFACTORED IMPORTS
import { UnifiedTaskCard, TaskCardTask, TaskCardSubtask } from '@/refactored/components/UnifiedTaskCard';
import { useImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';

// Deep work task management with database integration

// Convert database task to TaskCardTask format
function dbTaskToUnified(dbTask: any): TaskCardTask {
  return {
    id: dbTask.id,
    title: dbTask.title,
    completed: dbTask.completed,
    priority: dbTask.priority,
    status: dbTask.status,
    timeEstimate: dbTask.timeEstimate || dbTask.estimatedDuration,
    subtasks: dbTask.subtasks?.map((st: any): TaskCardSubtask => ({
      id: st.id,
      title: st.title,
      completed: st.completed
    })) || []
  };
}

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
  selectedDate
}) => {
  const {
    tasks: deepWorkTasks,
    loading,
    error,
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addSubtask,
    deleteTask
  } = useTaskDatabase({ selectedDate });

  // Filter for deep work tasks (you can adjust this filter based on your workType system)
  const deepWorkTasksFiltered = deepWorkTasks.filter(task => 
    task.workType === 'DEEP' || 
    task.title.toLowerCase().includes('deep') ||
    task.title.toLowerCase().includes('focus')
  );

  // If no deep work tasks exist, create default ones
  useEffect(() => {
    if (deepWorkTasksFiltered.length === 0 && !loading) {
      const createDefaultTasks = async () => {
        const defaultTasks = [
          {
            title: 'Environment Setup (10 min)',
            workType: 'DEEP' as const,
            priority: 'HIGH' as const,
            currentDate: format(selectedDate, 'yyyy-MM-dd'),
            timeEstimate: '10 min',
            estimatedDuration: 10,
            subtasks: [
              { title: 'Clear workspace', workType: 'DEEP' as const },
              { title: 'Close all distractions', workType: 'DEEP' as const },
              { title: 'Set phone to Do Not Disturb', workType: 'DEEP' as const }
            ]
          },
          {
            title: 'Deep Focus Block 1 (2-4 hours)',
            workType: 'DEEP' as const,
            priority: 'HIGH' as const,
            currentDate: format(selectedDate, 'yyyy-MM-dd'),
            timeEstimate: '3 hours',
            estimatedDuration: 180,
            subtasks: [
              { title: 'Identify primary objective', workType: 'DEEP' as const },
              { title: 'Work without breaks', workType: 'DEEP' as const },
              { title: 'Document progress', workType: 'DEEP' as const }
            ]
          },
          {
            title: 'Strategic Break (15 min)',
            workType: 'DEEP' as const,
            priority: 'MEDIUM' as const,
            currentDate: format(selectedDate, 'yyyy-MM-dd'),
            timeEstimate: '15 min',
            estimatedDuration: 15,
            subtasks: [
              { title: 'Walk or light movement', workType: 'DEEP' as const },
              { title: 'Hydrate', workType: 'DEEP' as const },
              { title: 'Avoid digital stimulation', workType: 'DEEP' as const }
            ]
          },
          {
            title: 'Deep Focus Block 2 (2-4 hours)',
            workType: 'DEEP' as const,
            priority: 'HIGH' as const,
            currentDate: format(selectedDate, 'yyyy-MM-dd'),
            timeEstimate: '3 hours',
            estimatedDuration: 180,
            subtasks: [
              { title: 'Resume or switch to next priority', workType: 'DEEP' as const },
              { title: 'Maintain flow state', workType: 'DEEP' as const },
              { title: 'Achieve significant progress', workType: 'DEEP' as const }
            ]
          },
          {
            title: 'Session Review (10 min)',
            workType: 'DEEP' as const,
            priority: 'MEDIUM' as const,
            currentDate: format(selectedDate, 'yyyy-MM-dd'),
            timeEstimate: '10 min',
            estimatedDuration: 10,
            subtasks: [
              { title: 'Document accomplishments', workType: 'DEEP' as const },
              { title: 'Note areas for improvement', workType: 'DEEP' as const },
              { title: 'Plan next deep work session', workType: 'DEEP' as const }
            ]
          }
        ];

        for (const task of defaultTasks) {
          await createTask(task);
        }
      };

      createDefaultTasks();
    }
  }, [deepWorkTasksFiltered.length, loading, createTask, selectedDate]);


  // Calculate progress based on total sub-tasks completed
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    deepWorkTasksFiltered.forEach(item => {
      if (item.subtasks && item.subtasks.length > 0) {
        // Count sub-tasks
        totalTasks += item.subtasks.length;
        completedTasks += item.subtasks.filter(sub => sub.completed).length;
      } else {
        // Count main task if no sub-tasks
        totalTasks += 1;
        if (item.completed) completedTasks += 1;
      }
    });
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };
  
  const deepWorkProgress = getTotalProgress();

  if (loading) {
    return useImplementation(
      'useUnifiedLoadingState',
      // NEW: Unified loading state (safer, consistent, reusable)
      <LoadingState 
        message="Loading deep work tasks..." 
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
        <div className="text-blue-400">Loading deep work tasks...</div>
      </div>
    );
  }

  if (error) {
    return useImplementation(
      'useUnifiedErrorState',
      // NEW: Unified error state (safer, consistent, reusable)
      <ErrorState 
        title="Error Loading Tasks"
        message={`Could not load deep work tasks: ${error}`}
        type="loading_error"
        className={useImplementation(
          'useUnifiedThemeSystem',
          // NEW: Unified theme system
          `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
          // OLD: Original classes (fallback for safety)
          'min-h-screen w-full bg-gray-900'
        )}
      />,
      // OLD: Original error state (fallback for safety)
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        // NEW: Unified theme system
        `min-h-screen w-full flex items-center justify-center ${theme.backgrounds.solid.gray900}`,
        // OLD: Original classes (fallback for safety)
        'min-h-screen w-full bg-gray-900 flex items-center justify-center'
      )}>
        <div className="text-red-400">Error loading tasks: {error}</div>
      </div>
    );
  }

  return (
    <div className={useImplementation(
      'useUnifiedThemeSystem',
      // NEW: Unified theme system
      `min-h-screen w-full ${theme.backgrounds.solid.gray900}`,
      // OLD: Original classes (fallback for safety)
      'min-h-screen w-full bg-gray-900'
    )}>
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
            
            {/* Clean Task Cards - Same design as Light Work page */}
            <div className="space-y-4">
              {deepWorkTasksFiltered.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200
                    ${task.completed 
                      ? 'bg-green-900/20 border-green-700/50 text-green-100' 
                      : 'bg-blue-900/20 border-blue-700/50 text-blue-100 hover:border-blue-600/50 hover:bg-blue-800/30'
                    }
                  `}
                >
                  {/* Task Header */}
                  <div className="space-y-2">
                    {/* Main task row with checkbox, title, and delete button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {task.completed ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-400 hover:border-blue-400 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h3 
                          className={`text-base font-medium leading-tight ${
                            task.completed ? 'line-through text-green-300/80' : 'text-blue-100'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      
                      {/* Action buttons in top right */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="flex-shrink-0 p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete task"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  
                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {task.subtasks.map((subtask, index) => (
                        <div key={subtask.id} className="flex items-center gap-3 p-2 rounded hover:bg-blue-800/20 transition-colors">
                          <button
                            onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            {subtask.completed ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-400 hover:border-blue-400 transition-colors" />
                            )}
                          </button>
                          <span className={`text-sm ${
                            subtask.completed ? 'line-through text-green-300/80' : 'text-blue-200'
                          }`}>
                            {index + 1}. {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Task Footer - Progress and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-blue-600/20">
                    <div className="flex items-center gap-4 text-sm text-blue-300">
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span>
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                      {task.timeEstimate && (
                        <span>{task.timeEstimate}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
                  <div key={item.id} className="group bg-blue-900/10 border border-blue-700/30 rounded-xl hover:bg-blue-900/15 hover:border-blue-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleTaskCompletion(item.id)}
                        className="mt-1 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-blue-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                          {item.subtasks && item.subtasks.length > 0 && (
                            <div className="relative">
                              <div className="bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-400/40 rounded-full px-3 py-1.5 ml-2 shadow-sm">
                                <span className="text-xs text-blue-300 font-semibold tracking-wide">
                                  {item.subtasks.filter(sub => sub.completed).length}/{item.subtasks.length}
                                </span>
                              </div>
                              {item.subtasks.filter(sub => sub.completed).length === item.subtasks.length && item.subtasks.length > 0 && (
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
                      </div>
                    </div>
                    
                    {item.subtasks && item.subtasks.length > 0 && (
                      <div className="mt-4 ml-8 space-y-3">
                        {item.subtasks.map((subTask, subIndex) => (
                          <div
                            key={subTask.id}
                            className="group flex items-center space-x-3 p-3 hover:bg-blue-900/10 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                          >
                            <div className="relative">
                              <div className="absolute -left-4 top-1/2 w-3 h-px bg-blue-500/30"></div>
                              <Checkbox
                                checked={subTask.completed}
                                onCheckedChange={() => toggleSubtaskCompletion(item.id, subTask.id)}
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
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
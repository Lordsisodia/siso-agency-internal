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
  CheckCircle2,
  Eye
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
  // State for subtask management
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
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

  // DISABLED: Auto-creation of default tasks (user should control task creation)
  // If no deep work tasks exist, show empty state instead of auto-creating
  /*
  useEffect(() => {
    if (deepWorkTasksFiltered.length === 0 && !loading) {
      // Auto-task creation disabled - user should manually add tasks when needed
      const createDefaultTasks = async () => { ... };
      createDefaultTasks();
    }
  }, [deepWorkTasksFiltered.length, loading, createTask, selectedDate]);
  */

  // Helper functions for subtask management
  const startAddingSubtask = (taskId: string) => {
    setAddingSubtaskToId(taskId);
    setNewSubtaskTitle('');
  };

  const saveNewSubtask = async (taskId: string) => {
    if (!newSubtaskTitle.trim()) {
      setAddingSubtaskToId(null);
      return;
    }
    
    try {
      await addSubtask(taskId, newSubtaskTitle.trim());
      setAddingSubtaskToId(null);
      setNewSubtaskTitle('');
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: string, taskId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'newSubtask' && taskId) {
        saveNewSubtask(taskId);
      }
    } else if (e.key === 'Escape') {
      if (type === 'newSubtask') {
        setAddingSubtaskToId(null);
        setNewSubtaskTitle('');
      }
    }
  };

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
            {/* Task Blocks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {deepWorkTasksFiltered.map((task) => (
                <UnifiedTaskCard
                  key={task.id}
                  task={dbTaskToUnified(task)}
                  theme="work" // Deep work theme with blue colors
                  onToggleTask={() => toggleTaskCompletion(task.id)}
                  onDeleteTask={() => deleteTask(task.id)}
                  onToggleSubtask={(subtaskId) => toggleSubtaskCompletion(task.id, subtaskId)}
                  onDeleteSubtask={deleteSubtask}
                  onCreateSubtask={(taskId, title) => {
                    // Handle inline subtask creation
                    if (addingSubtaskToId === taskId) {
                      saveNewSubtask(taskId);
                    } else {
                      startAddingSubtask(taskId);
                    }
                  }}
                  showPriority={true} // 🎯 Enable priority badges - this is what you wanted to see!
                  showTimeEstimate={true}
                  showProgress={true}
                  expanded={true} // Always expanded for deep work
                />
              ))}
            </div>

            {/* Add New Task Button */}
            <div className="mt-6 pt-4 border-t border-blue-600/20">
              <button
                onClick={async () => {
                  const taskTitle = prompt("Enter new deep work task:");
                  if (taskTitle) {
                    await createTask({
                      title: taskTitle,
                      workType: 'DEEP',
                      priority: 'MEDIUM',
                      currentDate: format(selectedDate, 'yyyy-MM-dd'),
                      timeEstimate: '1 hour',
                      estimatedDuration: 60
                    });
                  }
                }}
                className="w-full p-3 border-2 border-dashed border-blue-600/50 rounded-lg text-blue-300 hover:text-blue-200 hover:border-blue-500/70 hover:bg-blue-900/10 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Deep Work Task
              </button>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Check,
  Clock,
  Target,
  X,
  Edit,
  Mic,
  MicOff,
  Eye,
  Calendar,
  Zap,
  Trash,
  Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { TaskActionButtons } from '@/components/tasks/TaskActionButtons';
import { TaskSeparator } from '@/components/tasks/TaskSeparator';
import { TaskProgress } from '@/components/tasks/TaskProgress';
import { SubtaskMetadata } from '@/components/tasks/SubtaskMetadata';
import { TaskHeader } from '@/components/tasks/TaskHeader';
import { SubtaskItem } from '@/components/tasks/SubtaskItem';
import { AddSubtaskInput } from '@/components/tasks/AddSubtaskInput';
import { useTaskEditing } from '@/hooks/useTaskEditing';
import { useThoughtDump } from '@/hooks/useThoughtDump';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import { WORK_THEMES } from '@/config/work-themes';
import { CustomCalendar } from '@/components/ui/CustomCalendar';
import { TaskStatsGrid } from '@/components/tasks/TaskStatsGrid';
import { WorkProtocolCard } from '@/components/tasks/WorkProtocolCard';


export type WorkType = keyof typeof WORK_THEMES;

interface UnifiedWorkSectionProps {
  workType: WorkType;
  selectedDate: Date;
  tasks: any[];
  loading: boolean;
  error: string | null;
  // Task management functions
  createTask: (taskData: any) => Promise<any>;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  analyzeTaskWithAI: (taskId: string) => void;
  pushTaskToAnotherDay: (taskId: string, date: string) => Promise<void>;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  // Optional features (for Light Work)
  showContextModal?: () => void;
  showStats?: boolean;
  statsData?: {
    timeRemaining?: string;
    avgXP?: number;
    expToEarn?: number;
  };
}

export const UnifiedWorkSection: React.FC<UnifiedWorkSectionProps> = ({
  workType,
  selectedDate,
  tasks,
  loading,
  error,
  createTask,
  toggleTaskCompletion,
  toggleSubtaskCompletion,
  addSubtask,
  deleteTask,
  deleteSubtask,
  analyzeTaskWithAI,
  pushTaskToAnotherDay,
  updateTaskTitle,
  showContextModal,
  showStats = false,
  statsData
}) => {
  // Task editing hook
  const {
    editingTaskId,
    editTaskTitle,
    setEditTaskTitle,
    editingSubtaskId,
    editSubtaskTitle,
    setEditSubtaskTitle,
    addingSubtaskToId,
    newSubtaskTitle,
    setNewSubtaskTitle,

    viewingTaskId,
    setViewingTaskId,
    calendarSubtaskId,
    setCalendarSubtaskId,
    startEditingTask,
    saveTaskEdit,
    startEditingSubtask,
    saveSubtaskEdit,
    startAddingSubtask,
    saveNewSubtask,
    cancelAddingSubtask,
    handleDeleteTask,
    handlePushToAnotherDay,
    cancelEdit,
    handleKeyDown
  } = useTaskEditing({
    addSubtask,
    updateTaskTitle,
    deleteTask,
    pushTaskToAnotherDay,
    selectedDate
  });

  // Thought dump hook
  const { recordingTaskId, startThoughtDump } = useThoughtDump();

  // Task filtering hook
  const { filteredAndSortedTasks } = useTaskFiltering({ tasks, workType });

  // Get theme configuration
  const themeConfig = WORK_THEMES[workType];
  const IconComponent = themeConfig.icon;

  // Set body background to dark theme (ensures consistent background across entire page)
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen';
    document.documentElement.className = 'bg-gray-900';
    
    // Cleanup on unmount
    return () => {
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, [workType]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarSubtaskId && !(event.target as Element).closest('.calendar-popup')) {
        setCalendarSubtaskId(null);
      }
    };

    if (calendarSubtaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarSubtaskId]);

  // Task filtering logic moved to useTaskFiltering hook

  // Task editing logic moved to useTaskEditing hook

  // Thought dump logic moved to useThoughtDump hook

  if (loading) {
    return useImplementation(
      'useUnifiedLoadingState',
      <LoadingState 
        message={`Loading ${workType.toLowerCase()} work tasks...`}
        variant="spinner"
        size="lg"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className={themeConfig.colors.text}>Loading {workType.toLowerCase()} work tasks...</div>
      </div>
    );
  }

  if (error) {
    return useImplementation(
      'useUnifiedErrorState',
      <ErrorState 
        title="Error Loading Tasks"
        message={`Could not load ${workType.toLowerCase()} work tasks: ${error}`}
        type="network"
        className="min-h-screen w-full"
      />,
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-red-400">Error loading tasks: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Work Section Content */}
        <Card className={`w-full ${workType === 'DEEP' ? 'bg-blue-900/30 border-blue-500/50' : 'bg-emerald-900/30 border-emerald-500/50'}`}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h2 className={`flex items-center justify-between ${themeConfig.colors.text} text-base sm:text-lg font-semibold`}>
              <div className="flex items-center">
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {themeConfig.emoji} {themeConfig.name}
              </div>
              {showContextModal && (
                <button
                  onClick={showContextModal}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs bg-transparent border ${themeConfig.colors.border} hover:border-${themeConfig.colors.primary}-500 rounded-lg transition-colors ${themeConfig.colors.text} hover:${themeConfig.colors.textSecondary}`}
                  title="Configure AI personal context for better XP analysis"
                >
                  <Settings className="h-3 w-3" />
                  AI Context
                </button>
              )}
            </h2>
            <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-4`}></div>
            
            {/* Stats Section (for Light Work) */}
            <TaskStatsGrid showStats={showStats} statsData={statsData} />
            
            <WorkProtocolCard themeConfig={themeConfig} />
            <div className={`border-t ${themeConfig.colors.border.replace('border-', 'border-').replace('/50', '/50')} my-3 sm:my-4`}></div>
            
            <div className="pt-4">
            {/* Task Blocks */}
            <div className="flex flex-col items-center gap-4">
              {filteredAndSortedTasks.map((task) => {
                const isExpanded = true; // Always expanded
                return (
                  <div
                    key={task.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200 w-full
                      ${task.completed 
                        ? `${themeConfig.colors.completed}` 
                        : task.isPushed
                          ? 'bg-purple-900/20 border-purple-700/50 text-purple-100 hover:border-purple-600/50 hover:bg-purple-800/30'
                          : `bg-gray-800/50 border-gray-700/50 text-gray-100 ${themeConfig.colors.hover}`
                      }
                    `}
                  >
                    {/* Task Header */}
                    <TaskHeader
                      task={task}
                      themeConfig={themeConfig}
                      isEditing={editingTaskId === task.id}
                      editTitle={editTaskTitle}
                      onToggleCompletion={toggleTaskCompletion}
                      onStartEditing={startEditingTask}
                      onEditTitleChange={setEditTaskTitle}
                      onSaveEdit={saveTaskEdit}
                      onKeyDown={handleKeyDown}
                    />

                    {/* First separator line */}
                    <TaskSeparator />

                    {/* Action Icons Row */}
                    <TaskActionButtons
                      task={task}
                      themeConfig={themeConfig}
                      recordingTaskId={recordingTaskId}
                      onAnalyzeWithAI={analyzeTaskWithAI}
                      onStartThoughtDump={startThoughtDump}
                      onPushToAnotherDay={handlePushToAnotherDay}
                      onViewTask={setViewingTaskId}
                      onDeleteTask={handleDeleteTask}
                    />


                    {/* Second separator line */}
                    <TaskSeparator />

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="space-y-3 px-1">
                        {task.subtasks?.map((subtask) => (
                          <SubtaskItem
                            key={subtask.id}
                            subtask={subtask}
                            taskId={task.id}
                            themeConfig={themeConfig}
                            isEditing={editingSubtaskId === subtask.id}
                            editTitle={editSubtaskTitle}
                            calendarSubtaskId={calendarSubtaskId}
                            onToggleCompletion={toggleSubtaskCompletion}
                            onStartEditing={startEditingSubtask}
                            onEditTitleChange={setEditSubtaskTitle}
                            onSaveEdit={saveSubtaskEdit}
                            onKeyDown={handleKeyDown}
                            onCalendarToggle={setCalendarSubtaskId}
                            onDeleteSubtask={deleteSubtask}
                          >
                            {/* Calendar Popup */}
                            <div className="calendar-popup absolute top-full left-0 mt-1 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-[280px]">
                              <div className="mb-3">
                                <h3 className="text-sm font-medium text-white mb-2">Set Due Date</h3>
                                <CustomCalendar
                                  subtask={subtask}
                                  onDateSelect={async (date) => {
                                    try {
                                      const dateString = date ? date.toISOString().split('T')[0] : null;
                                      
                                      const response = await fetch('/api/subtasks/update-date', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                          subtaskId: subtask.id, 
                                          dueDate: dateString 
                                        })
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error('Failed to update due date');
                                      }
                                      
                                      setCalendarSubtaskId(null);
                                      window.location.reload();
                                      
                                    } catch (error) {
                                      console.error('Failed to update due date:', error);
                                      alert('Failed to update due date. Please try again.');
                                    }
                                  }}
                                  onClose={() => setCalendarSubtaskId(null)}
                                />
                              </div>
                            </div>
                          </SubtaskItem>
                        ))}
                        
                        {/* Add Subtask Input/Button */}
                        <AddSubtaskInput
                          taskId={task.id}
                          themeConfig={themeConfig}
                          isAdding={addingSubtaskToId === task.id}
                          newSubtaskTitle={newSubtaskTitle}
                          onStartAdding={startAddingSubtask}
                          onTitleChange={setNewSubtaskTitle}
                          onSave={saveNewSubtask}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    )}
                    
                    {/* Task Footer - Show subtask progress */}
                    <TaskProgress subtasks={task.subtasks || []} />
                  </div>
                );
              })}
            </div>

            {/* Add New Task Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={async () => {
                  try {
                    const newTask = await createTask({
                      title: `New ${workType.toLowerCase()} work task`,
                      workType: workType,
                      priority: 'MEDIUM',
                      currentDate: format(selectedDate, 'yyyy-MM-dd'),
                      timeEstimate: themeConfig.defaultTimeEstimate,
                      estimatedDuration: themeConfig.defaultDuration,
                      subtasks: []
                    });
                    
                    if (newTask) {
                      // Auto-focus on the new task for editing
                      setTimeout(() => startEditingTask(newTask.id, newTask.title), 100);
                      // Auto-analyze with AI after a short delay
                      setTimeout(() => analyzeTaskWithAI(newTask.id), 2000);
                    }
                  } catch (error) {
                    console.error(`Failed to create new ${workType.toLowerCase()} work task:`, error);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed ${themeConfig.colors.button} rounded-lg transition-all duration-200 text-sm font-medium`}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};
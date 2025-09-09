/**
 * LightWorkTab - Upgraded with GitHub Working UI Structure
 * 
 * Direct replacement with individual task cards, 5-button system, and proper spacing
 * This is the pragmatic approach - modify the component that's actually being used
 */

import React, { useState, useEffect } from 'react';
import { TaskHeader } from '@/components/working-ui/TaskHeader';
import { TaskActionButtons } from '@/components/working-ui/TaskActionButtons';
import { TaskSeparator } from '@/components/working-ui/TaskSeparator';
import { Card, CardContent } from '@/shared/ui/card';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { TabProps } from '../../ai-first/features/tasks/DayTabContainer';
import { useLightWorkTasksSupabase, LightWorkTask } from '@/shared/hooks/useLightWorkTasksSupabase';

// Map Supabase task to UnifiedTaskManager format
const mapSupabaseTaskToUnified = (task: LightWorkTask) => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  workType: 'LIGHT' as const,
  aiAnalyzed: false,
  xpReward: 10,
  difficulty: task.priority === 'HIGH' ? 'Hard' : task.priority === 'MEDIUM' ? 'Medium' : 'Easy'
});

export const LightWorkTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd
}) => {
  // Use Supabase hook for real data
  const { 
    tasks: supabaseTasks, 
    loading, 
    error, 
    createTask, 
    toggleTaskCompletion, 
    updateTaskDueDate: updateSupabaseTaskDueDate,
    deleteTask 
  } = useLightWorkTasksSupabase({ selectedDate: new Date() });

  // Map to unified format
  const tasks = supabaseTasks.map(mapSupabaseTaskToUnified);
  const selectedDate = new Date();

  // State for editing
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Set dark theme
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen text-white';
    document.documentElement.className = 'dark bg-gray-900';
    return () => {
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, []);

  // Theme configuration for Light Work (emerald)
  const themeConfig = {
    colors: {
      text: 'text-emerald-400',
      primary: 'emerald',
      border: 'border-emerald-600',
      input: 'border-emerald-600 focus:ring-emerald-500',
      textSecondary: 'text-emerald-300',
      button: 'border-emerald-600 text-emerald-300 hover:bg-emerald-900/30',
      hover: 'hover:border-emerald-600/50 hover:bg-emerald-800/70',
      completed: 'bg-emerald-900/30 border-emerald-800/50 text-emerald-200/60'
    }
  };

  // Action handlers
  const handleAnalyzeWithAI = async (taskId: string) => {
    console.log('🧠 AI Analysis for light work task:', taskId);
    // TODO: Integrate with actual AI analysis system
  };

  const handleStartThoughtDump = (taskId: string) => {
    if (recordingTaskId === taskId) {
      setRecordingTaskId(null);
    } else {
      setRecordingTaskId(taskId);
      setTimeout(() => setRecordingTaskId(null), 120000); // 2 minutes
    }
    console.log('🎤 Thought dump for task:', taskId);
  };

  const handlePushToAnotherDay = async (taskId: string) => {
    console.log('📅 Push to another day:', taskId);
    // TODO: Integrate with task scheduling system
  };

  const handleViewTask = async (taskId: string) => {
    console.log('👁 View task details:', taskId);
    // TODO: Open task details modal/page
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('❌ Delete task:', taskId);
    await deleteTask(taskId);
  };

  const handleToggleTask = async (taskId: string) => {
    console.log('✅ Toggle task completion:', taskId);
    await toggleTaskCompletion(taskId);
    onTaskToggle?.(taskId);
  };

  const handleCreateTask = async () => {
    console.log('➕ Create new light work task');
    const newTask = {
      title: 'New Light Work Task',
      priority: 'MEDIUM' as const,
      timeEstimate: '15m'
    };
    await createTask(newTask);
    onCustomTaskAdd?.(newTask);
  };

  // Editing functions
  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditTaskTitle(currentTitle);
  };

  const saveTaskEdit = (taskId: string) => {
    setEditingTaskId(null);
    // TODO: Update task title in Supabase
    console.log('Save task:', taskId, editTaskTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'task', taskId: string) => {
    if (e.key === 'Enter') {
      saveTaskEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className={themeConfig.colors.text}>Loading light work tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  console.log('🎯 LightWorkTab IS RENDERING WITH GITHUB UI!', { tasksCount: tasks.length });

  return (
    <div className="min-h-screen bg-gray-900">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${themeConfig.colors.text} mb-2`}>
              LIGHT Work - {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <p className="text-gray-400">
              {tasks.length} tasks • GitHub Working UI ✨
            </p>
          </div>

          {/* Task Cards - Individual cards with proper spacing */}
          <div className="flex flex-col items-center gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 rounded-lg border transition-all duration-200 w-full
                  ${task.completed 
                    ? themeConfig.colors.completed
                    : `bg-emerald-800/50 border-emerald-700/50 text-emerald-50 ${themeConfig.colors.hover}`
                  }
                `}
              >
                {/* Task Header */}
                <TaskHeader
                  task={task}
                  themeConfig={themeConfig}
                  isEditing={editingTaskId === task.id}
                  editTitle={editTaskTitle}
                  onToggleCompletion={handleToggleTask}
                  onStartEditing={startEditingTask}
                  onEditTitleChange={setEditTaskTitle}
                  onSaveEdit={saveTaskEdit}
                  onKeyDown={handleKeyDown}
                />

                {/* First separator line */}
                <TaskSeparator />

                {/* Action Icons Row - THE 5 BUTTONS! */}
                <TaskActionButtons
                  task={task}
                  themeConfig={themeConfig}
                  recordingTaskId={recordingTaskId}
                  onAnalyzeWithAI={handleAnalyzeWithAI}
                  onStartThoughtDump={handleStartThoughtDump}
                  onPushToAnotherDay={handlePushToAnotherDay}
                  onViewTask={handleViewTask}
                  onDeleteTask={handleDeleteTask}
                />

                {/* Second separator line */}
                <TaskSeparator />

                {/* Task completion status */}
                {task.completed && (
                  <div className="text-center text-sm text-gray-400 mt-2">
                    ✅ Task completed
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Task Button */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No tasks for today</div>
              <button
                onClick={handleCreateTask}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed ${themeConfig.colors.button} rounded-lg transition-all duration-200 text-sm font-medium mx-auto`}
              >
                <Plus className="h-4 w-4" />
                Add Your First Light Work Task
              </button>
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCreateTask}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed ${themeConfig.colors.button} rounded-lg transition-all duration-200 text-sm font-medium`}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs px-3 py-2 rounded-lg border border-gray-600">
              <div className={`${themeConfig.colors.text} font-medium`}>✅ GITHUB WORKING UI ACTIVE!</div>
              <div className="text-gray-300 text-xs mt-1">
                Direct LightWorkTab Upgrade • 5-Button System
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Tasks: {tasks.length} • Type: LIGHT WORK
              </div>
              {recordingTaskId && (
                <div className="text-red-400 text-xs mt-1 animate-pulse">
                  🎤 Recording: {recordingTaskId.slice(0, 8)}...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
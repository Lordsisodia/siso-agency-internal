/**
 * UnifiedTaskManager - Universal Task Management Component
 * 
 * This is the core task management UI that works for both Light Work and Deep Work.
 * Based on the exact structure from the working GitHub commit:
 * - Individual task cards with proper spacing
 * - TaskHeader component with checkbox and editable title
 * - TaskActionButtons with the 5 buttons (AI, Voice, Calendar, View, Delete)
 * - TaskSeparator lines
 * - Dynamic theming based on work type (Light = emerald, Deep = blue)
 */

import React, { useState, useEffect } from 'react';
import { TaskHeader } from './TaskHeader';
import { TaskActionButtons } from './TaskActionButtons';
import { TaskSeparator } from './TaskSeparator';
import { Card, CardContent } from '@/shared/ui/card';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ProperTask {
  id: string;
  title: string;
  completed: boolean;
  workType: 'LIGHT' | 'DEEP';
  aiAnalyzed?: boolean;
  xpReward?: number;
  difficulty?: string;
  isPushed?: boolean;
}

interface UnifiedTaskManagerProps {
  workType: 'LIGHT' | 'DEEP';
  selectedDate: Date;
  tasks: ProperTask[];
  loading?: boolean;
  error?: string | null;
  onAnalyzeWithAI?: (taskId: string) => void;
  onStartThoughtDump?: (taskId: string) => void;
  onPushToAnotherDay?: (taskId: string) => void;
  onViewTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string) => void;
  onCreateTask?: () => void;
}

export const UnifiedTaskManager: React.FC<UnifiedTaskManagerProps> = ({
  workType,
  selectedDate,
  tasks,
  loading = false,
  error = null,
  onAnalyzeWithAI = () => {},
  onStartThoughtDump = () => {},
  onPushToAnotherDay = () => {},
  onViewTask = () => {},
  onDeleteTask = () => {},
  onToggleTask = () => {},
  onCreateTask = () => {},
}) => {
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

  // Theme configuration based on work type
  const themeConfig = {
    colors: {
      text: workType === 'DEEP' ? 'text-blue-400' : 'text-emerald-400',
      primary: workType === 'DEEP' ? 'blue' : 'emerald',
      border: workType === 'DEEP' ? 'border-blue-600' : 'border-emerald-600',
      input: workType === 'DEEP' ? 'border-blue-600 focus:ring-blue-500' : 'border-emerald-600 focus:ring-emerald-500',
      textSecondary: workType === 'DEEP' ? 'text-blue-300' : 'text-emerald-300',
      button: workType === 'DEEP' ? 'border-blue-600 text-blue-300 hover:bg-blue-900/30' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-900/30',
      hover: workType === 'DEEP' ? 'hover:border-blue-600/50 hover:bg-blue-800/70' : 'hover:border-emerald-600/50 hover:bg-emerald-800/70',
      completed: workType === 'DEEP' ? 'bg-blue-900/30 border-blue-800/50 text-blue-200/60' : 'bg-emerald-900/30 border-emerald-800/50 text-emerald-200/60'
    }
  };

  const handleStartThoughtDump = (taskId: string) => {
    if (recordingTaskId === taskId) {
      setRecordingTaskId(null);
    } else {
      setRecordingTaskId(taskId);
      setTimeout(() => setRecordingTaskId(null), 120000); // 2 minutes
    }
    onStartThoughtDump(taskId);
  };

  const startEditingTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditTaskTitle(currentTitle);
  };

  const saveTaskEdit = (taskId: string) => {
    setEditingTaskId(null);
    // TODO: Save task title
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
        <div className={themeConfig.colors.text}>Loading {workType.toLowerCase()} work tasks...</div>
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

  console.log('🎯 UnifiedTaskManager IS RENDERING!', { workType, tasksCount: tasks.length });

  return (
    <div className="min-h-screen bg-gray-900">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${themeConfig.colors.text} mb-2`}>
              {workType} Work - {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <p className="text-gray-400">
              {tasks.length} tasks • Working UI from GitHub
            </p>
          </div>

          {/* Task Cards */}
          <div className="flex flex-col items-center gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-5 rounded-xl border-2 transition-all duration-200 w-full shadow-lg hover:shadow-xl
                  ${task.completed 
                    ? themeConfig.colors.completed
                    : task.isPushed
                      ? 'bg-purple-900/20 border-purple-700/50 text-purple-100 hover:border-purple-600/50 hover:bg-purple-800/30'
                      : workType === 'DEEP' 
                        ? `bg-blue-800/40 border-blue-600/60 text-blue-50 ${themeConfig.colors.hover} hover:border-blue-500/80`
                        : `bg-emerald-800/40 border-emerald-600/60 text-emerald-50 ${themeConfig.colors.hover} hover:border-emerald-500/80`
                  }
                `}
              >
                {/* Task Header */}
                <TaskHeader
                  task={task}
                  themeConfig={themeConfig}
                  isEditing={editingTaskId === task.id}
                  editTitle={editTaskTitle}
                  onToggleCompletion={onToggleTask}
                  onStartEditing={startEditingTask}
                  onEditTitleChange={setEditTaskTitle}
                  onSaveEdit={saveTaskEdit}
                  onKeyDown={handleKeyDown}
                />

                {/* First separator line */}
                <TaskSeparator />

                {/* Action Icons Row - THE 5 BUTTONS YOU REQUESTED! */}
                <TaskActionButtons
                  task={task}
                  themeConfig={themeConfig}
                  recordingTaskId={recordingTaskId}
                  onAnalyzeWithAI={onAnalyzeWithAI}
                  onStartThoughtDump={handleStartThoughtDump}
                  onPushToAnotherDay={onPushToAnotherDay}
                  onViewTask={onViewTask}
                  onDeleteTask={onDeleteTask}
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
                onClick={onCreateTask}
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed ${themeConfig.colors.button} rounded-lg transition-all duration-200 text-sm font-medium mx-auto`}
              >
                <Plus className="h-4 w-4" />
                Add Your First Task
              </button>
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onCreateTask}
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
              <div className={`${themeConfig.colors.text} font-medium`}>✅ PROPER WORKING UI ACTIVE</div>
              <div className="text-gray-300 text-xs mt-1">
                GitHub Structure • 5-Button System
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Tasks: {tasks.length} • Type: {workType}
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
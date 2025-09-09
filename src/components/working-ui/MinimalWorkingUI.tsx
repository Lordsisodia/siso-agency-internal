/**
 * Minimal Working UI - Simplified Implementation
 * 
 * This is a minimal version of the working UI that only includes the essential parts:
 * - TaskActionButtons (the 5 buttons that were requested)
 * - Basic task card layout
 * - Dark theme with orange accent
 * 
 * Safe to test without breaking existing functionality.
 */

import React, { useState, useEffect } from 'react';
import { TaskActionButtons } from './TaskActionButtons';
import { Card, CardContent } from '@/shared/ui/card';
import { format } from 'date-fns';

interface MinimalTask {
  id: string;
  title: string;
  completed: boolean;
  workType: 'LIGHT' | 'DEEP';
  aiAnalyzed?: boolean;
  xpReward?: number;
  difficulty?: string;
}

interface MinimalWorkingUIProps {
  workType: 'LIGHT' | 'DEEP';
  selectedDate: Date;
  tasks: MinimalTask[];
  loading?: boolean;
  error?: string | null;
  onAnalyzeWithAI?: (taskId: string) => void;
  onStartThoughtDump?: (taskId: string) => void;
  onPushToAnotherDay?: (taskId: string) => void;
  onViewTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string) => void;
}

export const MinimalWorkingUI: React.FC<MinimalWorkingUIProps> = ({
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
}) => {
  const [recordingTaskId, setRecordingTaskId] = useState<string | null>(null);
  
  // Debug: Log rendering
  console.log('🎯 MinimalWorkingUI IS RENDERING!', { workType, tasksCount: tasks.length, selectedDate });

  // Set dark theme on mount
  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen text-white';
    document.documentElement.className = 'dark bg-gray-900';
    return () => {
      // Cleanup on unmount
      document.body.className = '';
      document.documentElement.className = '';
    };
  }, []);

  const themeConfig = {
    colors: {
      text: 'text-orange-400',
      primary: 'orange',
    }
  };

  const handleStartThoughtDump = (taskId: string) => {
    if (recordingTaskId === taskId) {
      // Stop recording
      setRecordingTaskId(null);
      console.log('Stopped recording for task:', taskId);
    } else {
      // Start recording
      setRecordingTaskId(taskId);
      console.log('Started recording for task:', taskId);
      // Auto-stop after 2 minutes (120 seconds)
      setTimeout(() => {
        setRecordingTaskId(null);
        console.log('Auto-stopped recording for task:', taskId);
      }, 120000);
    }
    onStartThoughtDump(taskId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-orange-400">Loading tasks...</div>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-orange-400 mb-2">
          {workType} Work - {format(selectedDate, 'MMMM d, yyyy')}
        </h1>
        <p className="text-gray-400">
          Working UI from GitHub commit - {tasks.length} tasks
        </p>
      </div>

      {/* Task List */}
      <div className="p-6 space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No tasks for today. Add some tasks to get started!
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task.id)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500/50"
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          task.completed 
                            ? 'line-through text-gray-500' 
                            : 'text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                            {task.workType}
                          </span>
                          {task.aiAnalyzed && (
                            <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">
                              {task.xpReward} XP • {task.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - The core functionality we're restoring */}
                  <div className="ml-4">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white text-xs px-3 py-2 rounded-lg border border-gray-600">
          <div className="text-orange-400 font-medium">Working UI Active</div>
          <div className="text-gray-300 text-xs mt-1">
            5-Button System Restored
          </div>
          {recordingTaskId && (
            <div className="text-red-400 text-xs mt-1 animate-pulse">
              Recording: {recordingTaskId.slice(0, 8)}...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
/**
 * TaskActionButtons - Pure UI Component
 * 
 * Extracted from UnifiedWorkSection for reusability
 * Zero state dependencies - just props in, JSX out
 */

import React from 'react';
import { Brain, Mic, MicOff, Calendar, Eye, X, Zap } from 'lucide-react';

interface TaskActionButtonsProps {
  task: {
    id: string;
    aiAnalyzed?: boolean;
    xpReward?: number;
    difficulty?: string;
  };
  themeConfig: {
    colors: {
      text: string;
      primary: string;
    };
  };
  recordingTaskId: string | null;
  onAnalyzeWithAI: (taskId: string) => void;
  onStartThoughtDump: (taskId: string) => void;
  onPushToAnotherDay: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  task,
  themeConfig,
  recordingTaskId,
  onAnalyzeWithAI,
  onStartThoughtDump,
  onPushToAnotherDay,
  onViewTask,
  onDeleteTask
}) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {/* AI Analysis Button */}
      <button
        onClick={(e) => handleClick(e, () => onAnalyzeWithAI(task.id))}
        onTouchStart={handleTouchStart}
        className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
          task.aiAnalyzed 
            ? 'text-yellow-400 hover:text-yellow-300' 
            : 'text-gray-400 hover:text-yellow-400'
        }`}
        title={task.aiAnalyzed ? `AI Analyzed: ${task.xpReward} XP (${task.difficulty})` : 'Analyze with AI for smart XP allocation'}
      >
        {task.aiAnalyzed ? (
          <Zap className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </button>
      
      {/* Thought Dump Button */}
      <button
        onClick={(e) => handleClick(e, () => onStartThoughtDump(task.id))}
        onTouchStart={handleTouchStart}
        className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-gray-700/50 rounded transition-colors ${
          recordingTaskId === task.id
            ? 'text-red-400 animate-pulse'
            : `text-gray-400 hover:${themeConfig.colors.text}`
        }`}
        title="Add thought dump (2min voice note)"
      >
        {recordingTaskId === task.id ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>
      
      {/* Push to Another Day Button */}
      <button
        onClick={(e) => handleClick(e, () => onPushToAnotherDay(task.id))}
        onTouchStart={handleTouchStart}
        className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors`}
        title="Push to another day"
      >
        <Calendar className="h-4 w-4" />
      </button>

      {/* View Task Button */}
      <button
        onClick={(e) => handleClick(e, () => onViewTask(task.id))}
        onTouchStart={handleTouchStart}
        className={`min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-${themeConfig.colors.primary}-900/50 rounded text-gray-400 hover:${themeConfig.colors.text} transition-colors`}
        title="View task details"
      >
        <Eye className="h-4 w-4" />
      </button>
      
      {/* Delete Task Button */}
      <button
        onClick={(e) => handleClick(e, () => onDeleteTask(task.id))}
        onTouchStart={handleTouchStart}
        className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
        title="Delete task"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
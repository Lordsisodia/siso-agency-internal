/**
 * 🎯 SharedTaskCard - Unified Task Card Component
 * 
 * THE SINGLE SOURCE OF TRUTH for task rendering across Deep Work and Light Work.
 * 
 * This component matches the EXACT styling from Deep Work but with theme support:
 * - Deep Work: Blue theme with red hover
 * - Light Work: Green theme with green hover
 * 
 * Both use identical layout, spacing, and functionality.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

export interface TaskData {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  completed: boolean;
  sessionId?: string;
}

export interface SharedTaskCardProps {
  task: TaskData;
  index: number;
  theme: 'deep-work' | 'light-work';
  
  // Event handlers
  onToggleComplete: (taskId: string) => void;
  onStartFocus?: (taskId: string) => void;
  
  // UI state
  showFocusButton?: boolean;
  isEditing?: boolean;
  editValue?: string;
  onEdit?: (taskId: string, title: string) => void;
}

/**
 * Theme configurations matching Deep Work exactly
 */
const THEMES = {
  'deep-work': {
    hoverBorder: 'hover:border-red-400/30',
    focusButton: 'bg-blue-500/20 border border-blue-400/50 text-blue-300 hover:bg-blue-500/30'
  },
  'light-work': {
    hoverBorder: 'hover:border-green-400/30', 
    focusButton: 'bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30'
  }
};

/**
 * Priority color function (same as Deep Work)
 */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400 bg-red-500/20 border-red-400/50';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
    case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-400/50';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
  }
};

/**
 * SharedTaskCard Component - EXACT Deep Work styling
 */
export const SharedTaskCard: React.FC<SharedTaskCardProps> = ({
  task,
  index,
  theme,
  onToggleComplete,
  onStartFocus,
  showFocusButton = true,
  isEditing = false,
  editValue = '',
  onEdit
}) => {
  const themeConfig = THEMES[theme];

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all duration-200
        ${task.completed 
          ? 'bg-green-500/20 border-green-400/50 shadow-md shadow-green-500/10' 
          : `bg-gray-800/40 border-gray-700/50 ${themeConfig.hoverBorder}`
        }
      `}
    >
      <div className="flex items-center space-x-3 flex-1">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <Circle className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEdit?.(task.id, e.target.value)}
              className={`
                w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white 
                focus:outline-none focus:ring-1 
                ${theme === 'light-work' ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
              `}
              autoFocus
            />
          ) : (
            <h4 
              className={`
                font-medium transition-colors cursor-pointer
                ${task.completed ? 'text-green-300 line-through' : 'text-white'}
              `}
              onClick={() => onEdit?.(task.id, task.title)}
            >
              {task.title}
            </h4>
          )}
          <div className="flex items-center space-x-3 mt-1">
            <Badge 
              size="sm"
              className={getPriorityColor(task.priority)}
            >
              {task.priority}
            </Badge>
            <span className="text-xs text-gray-400">
              {task.estimatedTime}
            </span>
          </div>
        </div>
      </div>
      
      {showFocusButton && !task.completed && onStartFocus && (
        <Button
          size="sm"
          onClick={() => onStartFocus(task.id)}
          className={`${themeConfig.focusButton} text-xs`}
        >
          <Play className="h-3 w-3 mr-1" />
          Focus
        </Button>
      )}
    </motion.div>
  );
};

export default SharedTaskCard;
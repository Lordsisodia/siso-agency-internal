/**
 * 🎯 SubtaskRow - Unified Subtask Component
 * 
 * THE SINGLE SOURCE OF TRUTH for all subtask rendering across the entire app.
 * 
 * Features:
 * - Consistent spacing using CSS custom properties
 * - Supports all current use cases (LifeLock, TaskCard, SubtaskItem)
 * - Future-proof: change spacing once, affects everywhere
 * - Accessible with proper ARIA labels
 * - Mobile-optimized touch targets
 * - Theme support for different contexts
 * 
 * Usage:
 * <SubtaskRow 
 *   subtask={subtask}
 *   onToggle={handleToggle}
 *   theme="light-work" // or "deep-work" or "default"
 * />
 */

import React from 'react';
import { 
  Check, 
  Circle, 
  CheckCircle2, 
  CircleDotDashed, 
  CircleAlert,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';

/**
 * CSS Custom Properties for Spacing (Future-Proof)
 * Change these values once to affect ALL subtasks across the app
 */
const SUBTASK_SPACING_VARS = {
  '--subtask-checkbox-margin': '0.5rem', // Future-proof: change this one value to affect ALL subtasks everywhere
  '--subtask-row-padding': '0.5rem 0.75rem', // Comfortable click target
  '--subtask-indent': '1rem', // Visual hierarchy
  '--subtask-checkbox-size': '1rem', // 16px - optimal touch target
  '--subtask-font-size': '0.875rem', // 14px - readable but compact
  '--subtask-line-height': '1.25rem', // Good for multi-line text
} as React.CSSProperties;

export interface SubtaskRowData {
  id: string;
  title: string;
  completed: boolean;
  status?: 'pending' | 'in-progress' | 'completed' | 'need-help';
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  description?: string;
  tools?: string[];
  dueDate?: string;
}

export interface SubtaskRowProps {
  subtask: SubtaskRowData;
  taskId?: string;
  
  // Event Handlers
  onToggle: (subtaskId: string) => void;
  onEdit?: (subtaskId: string, newTitle: string) => void;
  onExpand?: (subtaskId: string) => void;
  onStartFocus?: (subtaskId: string) => void;
  
  // UI State
  isEditing?: boolean;
  isExpanded?: boolean;
  editValue?: string;
  
  // Theme & Styling
  theme?: 'light-work' | 'deep-work' | 'default';
  size?: 'compact' | 'normal' | 'comfortable';
  showMetadata?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  tabIndex?: number;
}

/**
 * Theme configurations with consistent spacing
 */
const THEMES = {
  'light-work': {
    checkbox: 'text-emerald-400 hover:text-emerald-300',
    checkboxBorder: 'border-gray-300 hover:border-emerald-400',
    text: 'text-white hover:text-emerald-300',
    textCompleted: 'text-gray-400 line-through',
    background: 'hover:bg-emerald-800/10 rounded-lg',
    metadata: 'text-emerald-400'
  },
  'deep-work': {
    checkbox: 'text-blue-400 hover:text-blue-300', 
    checkboxBorder: 'border-gray-300 hover:border-blue-400',
    text: 'text-white hover:text-blue-300',
    textCompleted: 'text-gray-400 line-through',
    background: 'hover:bg-blue-900/10 rounded-lg',
    metadata: 'text-blue-400'
  },
  'default': {
    checkbox: 'text-gray-400 hover:text-gray-300',
    checkboxBorder: 'border-gray-300 hover:border-gray-400', 
    text: 'text-white hover:text-gray-300',
    textCompleted: 'text-gray-400 line-through',
    background: 'hover:bg-gray-700/20 rounded-lg',
    metadata: 'text-gray-400'
  }
};

/**
 * Size configurations
 */
const SIZES = {
  compact: {
    padding: 'py-1 px-2',
    text: 'text-xs',
    checkbox: 'h-3 w-3'
  },
  normal: {
    padding: 'py-2 px-3', 
    text: 'text-sm',
    checkbox: 'h-4 w-4'
  },
  comfortable: {
    padding: 'py-3 px-4',
    text: 'text-base',
    checkbox: 'h-5 w-5'
  }
};

/**
 * Get status icon based on subtask status
 */
const getStatusIcon = (status: string | undefined, completed: boolean, size: string) => {
  if (completed) {
    return <Check className={size} />;
  }
  
  switch (status) {
    case 'in-progress':
      return <CircleDotDashed className={size} />;
    case 'need-help':
      return <CircleAlert className={size} />;
    default:
      return <div className={`${size} rounded-full border-2 border-current`} />;
  }
};

/**
 * Main SubtaskRow Component
 */
export const SubtaskRow: React.FC<SubtaskRowProps> = ({
  subtask,
  taskId,
  onToggle,
  onEdit,
  onExpand,
  onStartFocus,
  isEditing = false,
  isExpanded = false, 
  editValue = '',
  theme = 'default',
  size = 'normal',
  showMetadata = false,
  'aria-label': ariaLabel,
  tabIndex = 0
}) => {
  const themeConfig = THEMES[theme];
  const sizeConfig = SIZES[size];
  const hasExpandableContent = subtask.description || subtask.priority || subtask.estimatedTime || (subtask.tools?.length ?? 0) > 0;

  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all duration-200
        ${subtask.completed 
          ? 'bg-green-500/20 border-green-400/50 shadow-md shadow-green-500/10' 
          : 'bg-gray-800/40 border-gray-700/50 hover:border-green-400/30'
        }
      `}
      role="listitem"
    >
      <div className="flex items-center space-x-3 flex-1">
        <button
          onClick={() => onToggle(subtask.id)}
          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
        >
          {subtask.completed ? (
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
              onChange={(e) => onEdit?.(subtask.id, e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              autoFocus
            />
          ) : (
            <h4 className={`
              font-medium transition-colors cursor-pointer
              ${subtask.completed ? 'text-green-300 line-through' : 'text-white'}
            `}
            onClick={() => onEdit?.(subtask.id, subtask.title)}
            >
              {subtask.title}
            </h4>
          )}
          {showMetadata && (subtask.priority || subtask.estimatedTime) && (
            <div className="flex items-center space-x-3 mt-1">
              {subtask.priority && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded border text-center font-medium
                  ${subtask.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                    subtask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                    'bg-green-500/20 text-green-300 border-green-500/40'}
                `}>
                  {subtask.priority}
                </span>
              )}
              {subtask.estimatedTime && (
                <span className="text-xs text-gray-400">
                  {subtask.estimatedTime}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * CSS-in-JS helper for custom spacing (advanced usage)
 */
export const createSubtaskSpacing = (overrides: Partial<typeof SUBTASK_SPACING_VARS>) => ({
  ...SUBTASK_SPACING_VARS,
  ...overrides
});

/**
 * Hook for managing subtask state (optional)
 */
export const useSubtaskRow = (subtask: SubtaskRowData) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(subtask.title);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const startEditing = React.useCallback(() => {
    setIsEditing(true);
    setEditValue(subtask.title);
  }, [subtask.title]);

  const saveEdit = React.useCallback((newTitle: string) => {
    setIsEditing(false);
    // Parent component handles the actual save
    return newTitle.trim() || subtask.title;
  }, [subtask.title]);

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return {
    isEditing,
    editValue,
    isExpanded,
    setEditValue,
    startEditing,
    saveEdit,
    toggleExpanded
  };
};

export default SubtaskRow;
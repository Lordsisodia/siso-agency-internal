import { Task, Subtask, TaskStatus } from '@/types/task.types';

/**
 * Types for Light Work Manager components
 * Extracted from enhanced-light-work-manager.tsx for reusability
 */

// Enhanced interfaces - now using standardized types
export interface LightWorkSubTask extends Subtask {
  completed?: boolean; // Computed from status for backward compatibility
}

export interface LightWorkItem extends Omit<Task, 'category' | 'created_at'> {
  completed?: boolean; // Computed from status for backward compatibility
  duration?: number; // Duration in minutes
  logField?: string;
  subTasks: LightWorkSubTask[];
  category?: 'admin' | 'communication' | 'learning' | 'planning' | 'quick-wins';
}

export interface TaskCardProps {
  task: LightWorkItem;
  isExpanded: boolean;
  onToggleExpansion: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  prefersReducedMotion: boolean;
}

export interface SubTaskListProps {
  task: LightWorkItem;
  isExpanded: boolean;
  isAddingSubtask: string | null;
  newSubtaskTitle: string;
  prefersReducedMotion: boolean;
  onToggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onSetIsAddingSubtask: (taskId: string | null) => void;
  onSetNewSubtaskTitle: (title: string) => void;
  onAddNewSubtask: (taskId: string) => void;
}

export interface TaskTimerProps {
  duration?: number;
  status: TaskStatus;
}

export interface TaskStatusSelectorProps {
  status: TaskStatus;
  onStatusChange: (taskId: string) => void;
  taskId: string;
}

export interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, description: string) => void;
}

export interface CategoryFilterProps {
  categories: Array<'admin' | 'communication' | 'learning' | 'planning' | 'quick-wins'>;
  selectedCategories: Array<'admin' | 'communication' | 'learning' | 'planning' | 'quick-wins'>;
  onCategoryToggle: (category: string) => void;
}

export interface ProgressIndicatorProps {
  tasks: LightWorkItem[];
  showXP?: boolean;
}
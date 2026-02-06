/**
 * Type definitions for TaskDetailModal component tree
 */

export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
  completed: boolean;
  dueDate?: string;
}

export interface TimeboxTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
  description?: string;
  completed: boolean;
  color: string;
  focusIntensity?: 1 | 2 | 3 | 4;
  subtasks?: Subtask[];
  priority?: string;
  clientId?: string;
  timeEstimate?: string;
}

export interface TaskDetailModalProps {
  task: TimeboxTask | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (taskId: string) => void;
  onTaskUpdate?: (updatedTask: TimeboxTask) => void;
  onStartFocusSession?: (taskId: string, subtaskId?: string) => void;
  workType?: 'light' | 'deep';
}

export interface TaskHeaderProps {
  title: string;
  category: TimeboxTask['category'];
  focusIntensity?: 1 | 2 | 3 | 4;
  priority?: string;
  workType: 'light' | 'deep';
  onClose: () => void;
}

export interface TaskFormProps {
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  workType: 'light' | 'deep';
  completed: boolean;
  onDescriptionChange: (description: string) => void;
  onToggleComplete: () => void;
  onStartFocus: () => void;
}

export interface SubtaskListProps {
  subtasks: Subtask[];
  taskId: string;
  workType: 'light' | 'deep';
  onAddSubtask: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onStartFocusSession: (taskId: string, subtaskId?: string) => void;
}

export interface SubtaskItemProps {
  subtask: Subtask;
  taskId: string;
  workType: 'light' | 'deep';
  isEditing: boolean;
  onToggleStatus: () => void;
  onUpdate: (updates: Partial<Subtask>) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onStartFocus: () => void;
}

export interface ActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  workType: 'light' | 'deep';
}

export interface CategoryConfig {
  icon: string;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}

export interface IntensityConfig {
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

export interface PriorityConfig {
  icon: string;
  label: string;
  color: string;
}

export type WorkTypeTheme = {
  color: string;
  bg: string;
  border: string;
  text: string;
  textSecondary: string;
  inputBg: string;
  inputBorder: string;
  button: string;
};

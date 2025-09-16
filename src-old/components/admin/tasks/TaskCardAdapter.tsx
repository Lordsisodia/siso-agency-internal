import React from 'react';
import { LightWorkTaskCard } from './LightWorkTaskCard';
import { Task } from '@/features/tasks/types/task.types';

interface TaskCardAdapterProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  showSubtasksOnHover?: boolean;
  isLast?: boolean;
  onVoiceInput?: () => void;
  onStartTimer?: () => void;
  onQuickPhoto?: () => void;
  onViewDetails?: () => void;
  onQuickAdd?: () => void;
}

export const TaskCardAdapter: React.FC<TaskCardAdapterProps> = ({
  task,
  onToggle,
  onEdit,
  onDateChange,
  isLast,
  onVoiceInput,
  onStartTimer,
  onQuickPhoto,
  onViewDetails,
  onQuickAdd
}) => {
  return (
    <LightWorkTaskCard
      task={task}
      onToggle={onToggle}
      onEdit={onEdit}
      onDateChange={onDateChange}
      onVoiceInput={onVoiceInput}
      onStartTimer={onStartTimer}
      onQuickPhoto={onQuickPhoto}
      onViewDetails={onViewDetails}
      onQuickAdd={onQuickAdd}
      isLast={isLast}
    />
  );
};
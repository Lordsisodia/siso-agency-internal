import React from 'react';
import { motion } from 'framer-motion';
import type { TaskStatusSelectorProps } from '../types';

export const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
  status,
  onStatusChange,
  taskId
}) => {
  // Status badge color mapping
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'need-help': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.span
      className={`rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(status)}`}
      key={status}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onStatusChange(taskId)}
      title="Click to cycle through status options"
    >
      {status}
    </motion.span>
  );
};
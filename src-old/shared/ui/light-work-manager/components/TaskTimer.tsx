import React from 'react';
import { Clock } from 'lucide-react';
import type { TaskTimerProps } from '../types';

export const TaskTimer: React.FC<TaskTimerProps> = ({ duration, status }) => {
  if (!duration) return null;

  const getTimerColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in-progress':
        return 'text-blue-400';
      case 'need-help':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <span className={`ml-2 text-xs ${getTimerColor()} flex items-center`}>
      <Clock className="h-3 w-3 mr-1" />
      ({duration} min)
    </span>
  );
};
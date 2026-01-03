import React from 'react';
import { DailyTasksCard } from '../components/DailyTasksCard';

interface TasksSectionProps {
  selectedDate: Date;
  userId?: string | null;
}

export const TasksSection: React.FC<TasksSectionProps> = ({ selectedDate }) => {
  return (
    <div className="space-y-3 text-amber-100">
      <DailyTasksCard selectedDate={selectedDate} className="w-full" />
    </div>
  );
};

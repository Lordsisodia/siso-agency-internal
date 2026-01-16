import React from 'react';
import TodayTasksList from '../components/TodayTasksList';

interface TasksSectionProps {
  selectedDate: Date;
  userId?: string | null;
}

export const TasksSection: React.FC<TasksSectionProps> = ({ selectedDate }) => {
  return (
    <div className="space-y-3 text-amber-100">
      <TodayTasksList selectedDate={selectedDate} />
    </div>
  );
};

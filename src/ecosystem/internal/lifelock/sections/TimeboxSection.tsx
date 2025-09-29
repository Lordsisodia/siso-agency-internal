import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { TimeBoxCalendar } from '@/components/timebox/TimeBoxCalendar';
import { timeboxApi, DaySchedule } from '@/api/timeboxApi';
import { TaskIntegrationService } from '@/services/taskIntegrationService';

interface TimeboxSectionProps {
  selectedDate: Date;
  userId?: string;
}

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({
  selectedDate,
  userId = 'demo-user'
}) => {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  // Load schedule for the selected date
  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const daySchedule = await timeboxApi.getDaySchedule(dateString);
        setSchedule(daySchedule);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [selectedDate]);

  // Handle schedule changes
  const handleScheduleChange = async () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const updatedSchedule = await timeboxApi.getDaySchedule(dateString);
    setSchedule(updatedSchedule);
  };

  // Handle task completion with bidirectional sync
  const handleTaskComplete = async (taskId: string) => {
    try {
      // Check if this is a unified task (starts with lw_, dw_, or is morning_routine_block)
      if (taskId.startsWith('lw_') || taskId.startsWith('dw_') || taskId === 'morning_routine_block') {
        // Use TaskIntegrationService for bidirectional sync
        await TaskIntegrationService.completeTask(taskId);
      } else {
        // Fallback to original timeboxApi for other tasks
        await timeboxApi.completeTask(taskId);
      }
      
      await handleScheduleChange();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Handle timer start
  const handleStartTimer = (taskId: string) => {
    timeboxApi.startTimer(taskId);
    setActiveTimer(taskId);
  };

  // Handle timer stop
  const handleStopTimer = (taskId: string) => {
    const duration = timeboxApi.stopTimer(taskId);
    setActiveTimer(null);
    console.log(`Task ${taskId} completed in ${duration} minutes`);
  };

  // Handle auto-schedule
  const handleAutoSchedule = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      await timeboxApi.autoScheduleTasks(dateString);
      await handleScheduleChange();
    } catch (error) {
      console.error('Failed to auto-schedule tasks:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-purple-300 text-lg">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black relative">
      <div className="w-full px-2 sm:px-4 py-4 pb-24">
        <TimeBoxCalendar
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
          onTaskComplete={handleTaskComplete}
          onStartTimer={handleStartTimer}
          onStopTimer={handleStopTimer}
          activeTimer={activeTimer}
          onAutoSchedule={handleAutoSchedule}
          className="w-full"
        />
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const TimeboxSection = memo(TimeboxSectionComponent, (prevProps, nextProps) => {
  return format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
});

import { useState, useEffect } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export function useCheckInOut() {
  const { useTaskQuery, useUpdateTask } = useTasks();
  const { data: tasks = [] } = useTaskQuery('daily');
  const updateTaskMutation = useUpdateTask();
  const [checkInStatus, setCheckInStatus] = useState<'pending' | 'completed'>('pending');
  const [checkOutStatus, setCheckOutStatus] = useState<'pending' | 'completed'>('pending');
  const { toast } = useToast();

  // Set default check-in time to 9:00 AM
  const morningCheckInTime = new Date();
  morningCheckInTime.setHours(9, 0, 0, 0);

  // Set default check-out time to 5:45 PM
  const eveningCheckOutTime = new Date();
  eveningCheckOutTime.setHours(17, 45, 0, 0);

  // Check if we should display the morning check-in
  const shouldShowMorningCheckIn = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 8 && currentHour < 12 && checkInStatus === 'pending';
  };

  // Check if we should display the evening check-out
  const shouldShowEveningCheckOut = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 17 && currentHour < 20 && checkOutStatus === 'pending';
  };

  // Handle morning check-in process
  const handleMorningCheckIn = async (notes?: string) => {
    try {
      // Mark check-in as completed
      setCheckInStatus('completed');
      
      // Roll over incomplete tasks from previous day
      await rolloverIncompleteTasks();
      
      toast({
        title: "Morning Check-In Completed",
        description: "Welcome to your day! Incomplete tasks have been rolled over.",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error during morning check-in:', error);
      toast({
        title: "Check-In Failed",
        description: "There was an error processing your check-in.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle evening check-out process
  const handleEveningCheckOut = async (summary: {
    completed: string[];
    blockers: string[];
    plan: string;
  }) => {
    try {
      // Mark check-out as completed
      setCheckOutStatus('completed');
      
      // Log check-out summary for potential future use
      console.log('Evening check-out summary:', summary);
      
      toast({
        title: "Evening Check-Out Completed",
        description: "Great job today! Your day has been summarized.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('Error during evening check-out:', error);
      toast({
        title: "Check-Out Failed",
        description: "There was an error processing your check-out.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Roll over incomplete tasks from the previous day
  const rolloverIncompleteTasks = async () => {
    const incompleteTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      (!task.due_date || new Date(task.due_date) < new Date())
    );
    
    for (const task of incompleteTasks) {
      const today = new Date();
      
      try {
        // Update the task with new due date and mark as rolled over
        await updateTaskMutation.mutateAsync({
          id: task.id,
          due_date: today.toISOString(),
          rolled_over_from: task.id // Reference to itself to track it was rolled over
        });
      } catch (err) {
        console.error(`Error rolling over task ${task.id}:`, err);
      }
    }
    
    if (incompleteTasks.length > 0) {
      console.log(`Rolled over ${incompleteTasks.length} incomplete tasks`);
    }
    
    return incompleteTasks;
  };

  // Reset check-in/out status at midnight
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Reset at midnight
      if (hours === 0 && minutes === 0) {
        setCheckInStatus('pending');
        setCheckOutStatus('pending');
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    shouldShowMorningCheckIn,
    shouldShowEveningCheckOut,
    handleMorningCheckIn,
    handleEveningCheckOut,
    checkInStatus,
    checkOutStatus,
    morningCheckInTime,
    eveningCheckOutTime
  };
}

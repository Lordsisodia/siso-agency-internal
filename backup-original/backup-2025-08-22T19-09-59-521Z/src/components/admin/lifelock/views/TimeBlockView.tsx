import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Sparkles, Settings, RefreshCw } from 'lucide-react';
import { EnhancedTimeBoxCalendar } from '../ui/EnhancedTimeBoxCalendar';
import { enhancedTimeBlockService } from '@/services/enhancedTimeBlockService';
import { DaySchedule, WorkSchedulePreferences } from '@/types/timeblock.types';

interface TimeBlockViewProps {
  currentDate: Date;
  onOpenTimeBoxModal?: () => void;
  morningTasks?: any[];
  deepTasks?: any[];
  lightTasks?: any[];
  workoutTasks?: any[];
  healthTasks?: any[];
}

export function TimeBlockView({ 
  currentDate, 
  onOpenTimeBoxModal, 
  morningTasks = [], 
  deepTasks = [], 
  lightTasks = [], 
  workoutTasks = [], 
  healthTasks = [] 
}: TimeBlockViewProps) {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Default work preferences - could be made configurable
  const defaultPreferences: WorkSchedulePreferences = {
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    workStartTime: '09:00',
    workEndTime: '17:00',
    lunchTime: '12:30',
    lunchDuration: 60,
    deepWorkPeakTimes: [
      { start: '09:00', end: '11:00' },
      { start: '14:00', end: '16:00' }
    ],
    lightWorkWindows: [
      { start: '08:00', end: '09:00' },
      { start: '13:00', end: '14:00' },
      { start: '16:00', end: '17:00' }
    ],
    breakFrequency: 90,
    breakDuration: 15,
    workoutPreferredTime: '18:00',
    energyPattern: {
      morning: 'high',
      afternoon: 'medium', 
      evening: 'low'
    },
    timeZone: 'UTC',
    weeklyWorkHours: 40,
    flexibleLunchTime: true,
    allowInterruptions: false,
    prioritizeDeadlines: true,
    bufferTime: 15
  };

  // Generate schedule when component mounts or tasks change
  useEffect(() => {
    generateOptimalSchedule();
  }, [currentDate, morningTasks, deepTasks, lightTasks, workoutTasks, healthTasks]);

  const generateOptimalSchedule = async () => {
    if (isGeneratingSchedule) return;
    
    setIsGeneratingSchedule(true);
    try {
      const generatedSchedule = await enhancedTimeBlockService.generateOptimalSchedule({
        date: currentDate,
        preferences: defaultPreferences,
        morningTasks: morningTasks || [],
        deepTasks: deepTasks || [],
        lightTasks: lightTasks || [],
        workoutTasks: workoutTasks || [],
        healthTasks: healthTasks || []
      });
      
      setSchedule(generatedSchedule);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleBlockComplete = (blockId: string) => {
    if (!schedule) return;
    
    // Update block completion status
    const updatedBlocks = schedule.timeBlocks.map(block => 
      block.id === blockId ? { ...block, completed: true } : block
    );
    
    setSchedule({
      ...schedule,
      timeBlocks: updatedBlocks
    });
  };

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Calendar View - Full height timeline */}
      <div className="flex-1 overflow-hidden pt-2">
        {schedule ? (
          <EnhancedTimeBoxCalendar
            schedule={schedule}
            onBlockComplete={handleBlockComplete}
            onBlockClick={(block) => {
              // Handle block click - could show details modal
              console.log('Block clicked:', block);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Generating your optimal schedule...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
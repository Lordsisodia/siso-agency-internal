import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { format } from 'date-fns';
import { Sparkles, Settings, RefreshCw } from 'lucide-react';
import { EnhancedTimeBoxCalendar } from '../ui/EnhancedTimeBoxCalendar';
import { enhancedTimeBlockService } from '@/shared/services/task.service';
import { DaySchedule, WorkSchedulePreferences } from '@/types/timeblock.types';
import { supabaseAnon } from '@/shared/lib/supabase-clerk';
import { useUser } from '@clerk/clerk-react';

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
  const { user } = useUser();
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Default work preferences - could be made configurable
  const defaultPreferences: WorkSchedulePreferences = useMemo(() => ({
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
  }), []);

  // Save schedule to localStorage + Supabase
  const saveSchedule = useCallback(async (scheduleToSave: DaySchedule) => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');

    // Always save to localStorage first (instant, works offline)
    try {
      const key = `schedule:${dateKey}`;
      localStorage.setItem(key, JSON.stringify(scheduleToSave));
    } catch (error) {
      console.error('Failed to save schedule to localStorage:', error);
    }

    // Save to Supabase if user is logged in
    if (user?.id) {
      try {
        const { error } = await supabaseAnon
          .from('day_schedules')
          .upsert({
            user_id: user.id,
            date: dateKey,
            schedule_data: scheduleToSave,
            total_work_time: scheduleToSave.totalWorkTime,
            total_focus_time: scheduleToSave.totalFocusTime,
            total_break_time: scheduleToSave.totalBreakTime,
            energy_utilization: scheduleToSave.energyUtilization,
            schedule_efficiency: scheduleToSave.scheduleEfficiency,
            is_optimized: scheduleToSave.isOptimized,
            last_optimized: scheduleToSave.lastOptimized.toISOString(),
            version: scheduleToSave.version
          }, {
            onConflict: 'user_id,date'
          });

        if (error) {
          console.error('Failed to save schedule to Supabase:', error);
        }
      } catch (error) {
        console.error('Failed to sync schedule to Supabase:', error);
      }
    }
  }, [currentDate, user]);

  // Load schedule from Supabase or localStorage
  const loadSchedule = useCallback(async (): Promise<DaySchedule | null> => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');

    // Try Supabase first if user is logged in
    if (user?.id) {
      try {
        const { data, error } = await supabaseAnon
          .from('day_schedules')
          .select('schedule_data')
          .eq('user_id', user.id)
          .eq('date', dateKey)
          .single();

        if (!error && data?.schedule_data) {
          // Convert date strings back to Date objects
          const schedule = data.schedule_data as DaySchedule;
          schedule.date = new Date(schedule.date);
          schedule.lastOptimized = new Date(schedule.lastOptimized);
          schedule.timeBlocks = schedule.timeBlocks.map(block => ({
            ...block,
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt)
          }));

          // Cache to localStorage for offline access
          const key = `schedule:${dateKey}`;
          localStorage.setItem(key, JSON.stringify(schedule));

          return schedule;
        }
      } catch (error) {
        console.error('Failed to load schedule from Supabase:', error);
      }
    }

    // Fallback to localStorage
    try {
      const key = `schedule:${dateKey}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const schedule = JSON.parse(saved) as DaySchedule;
        // Ensure dates are Date objects
        schedule.date = new Date(schedule.date);
        schedule.lastOptimized = new Date(schedule.lastOptimized);
        schedule.timeBlocks = schedule.timeBlocks.map(block => ({
          ...block,
          createdAt: new Date(block.createdAt),
          updatedAt: new Date(block.updatedAt)
        }));
        return schedule;
      }
    } catch (error) {
      console.error('Failed to load schedule from localStorage:', error);
    }

    return null;
  }, [currentDate, user]);

  const generateOptimalSchedule = useCallback(async () => {
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
      await saveSchedule(generatedSchedule);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
    } finally {
      setIsGeneratingSchedule(false);
    }
  }, [currentDate, morningTasks, deepTasks, lightTasks, workoutTasks, healthTasks, isGeneratingSchedule, defaultPreferences, saveSchedule]);

  // Load saved schedule or generate new one
  useEffect(() => {
    const initSchedule = async () => {
      const savedSchedule = await loadSchedule();
      if (savedSchedule) {
        setSchedule(savedSchedule);
      } else {
        await generateOptimalSchedule();
      }
    };

    initSchedule();
  }, [currentDate, loadSchedule, generateOptimalSchedule]);

  const handleBlockComplete = async (blockId: string) => {
    if (!schedule) return;

    // Update block completion status
    const updatedBlocks = schedule.timeBlocks.map(block =>
      block.id === blockId ? { ...block, completed: true } : block
    );

    const updatedSchedule = {
      ...schedule,
      timeBlocks: updatedBlocks
    };

    setSchedule(updatedSchedule);
    await saveSchedule(updatedSchedule); // Persist the change
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
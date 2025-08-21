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
    workStartTime: '09:00',
    workEndTime: '17:00',
    lunchStartTime: '12:00',
    lunchDuration: 60,
    breakDuration: 15,
    workBlockDuration: 90,
    preferredWorkingHours: ['09:00', '10:30', '14:00', '15:30'],
    energyLevels: {
      morning: 'high',
      afternoon: 'medium',
      evening: 'low'
    }
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white">Smart Time Blocks</h2>
          <p className="text-gray-400 text-sm">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={generateOptimalSchedule}
            disabled={isGeneratingSchedule}
            variant="outline"
            size="sm"
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingSchedule ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {onOpenTimeBoxModal && (
            <Button
              onClick={onOpenTimeBoxModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          )}
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden">
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
/**
 * Enhanced AI-Powered Daily Time Boxing Modal
 * Complete 24-hour calendar view with smart task scheduling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Brain, 
  Zap, 
  Target, 
  Coffee, 
  Dumbbell, 
  Moon,
  Sun,
  Timer,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Calendar,
  RefreshCw,
  Settings,
  CheckCircle2,
  Play,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  EnhancedTimeBlock, 
  WorkSchedulePreferences, 
  DaySchedule,
  CalendarViewSettings 
} from '@/types/timeblock.types';
import { enhancedTimeBlockService } from '@/services/enhancedTimeBlockService';
import { EnhancedTimeBoxCalendar } from './ui/EnhancedTimeBoxCalendar';
import { DailyRoutineItem } from '@/services/lifeLockService';
import { EnhancedTask } from '@/services/enhancedTaskService';

interface AITimeBoxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  wakeUpTime?: string;
  
  // Task data from all sections
  morningTasks: DailyRoutineItem[];
  deepTasks: EnhancedTask[];
  lightTasks: any[];
  workoutTasks: any[];
  healthTasks: any[];
  
  // Callbacks
  onScheduleApply?: (schedule: DaySchedule) => void;
  onTaskComplete?: (taskId: string, section: string) => void;
}

export const AITimeBoxModal: React.FC<AITimeBoxModalProps> = ({
  open,
  onOpenChange,
  date,
  wakeUpTime = '07:00',
  morningTasks = [],
  deepTasks = [],
  lightTasks = [],
  workoutTasks = [],
  healthTasks = [],
  onScheduleApply,
  onTaskComplete
}) => {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'preferences'>('calendar');
  const [selectedBlock, setSelectedBlock] = useState<EnhancedTimeBlock | null>(null);
  
  // User preferences for scheduling
  const [preferences, setPreferences] = useState<WorkSchedulePreferences>({
    wakeUpTime: wakeUpTime,
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
      { start: '11:00', end: '12:30' },
      { start: '16:00', end: '17:00' }
    ],
    breakFrequency: 90,
    breakDuration: 15,
    workoutPreferredTime: '18:00',
    workoutDuration: 60,
    workoutFlexibility: 'flexible',
    morningRoutineDuration: 60,
    eveningRoutineDuration: 45,
    transitionBuffer: 5,
    energyProfile: {
      type: 'early-bird',
      peakHours: [
        { start: '08:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ],
      lowEnergyHours: [
        { start: '13:00', end: '14:00' },
        { start: '20:00', end: '23:00' }
      ]
    },
    focusBlocks: [
      {
        category: 'deep-focus',
        preferredTimes: [
          { start: '09:00', end: '11:00' },
          { start: '14:00', end: '16:00' }
        ],
        minimumDuration: 60,
        maximumDuration: 180,
        canInterrupt: false
      }
    ],
    blockedTimeSlots: []
  });

  // Calendar view settings
  const [calendarSettings, setCalendarSettings] = useState<CalendarViewSettings>({
    hourRange: { start: 6, end: 23 },
    timeSlotInterval: 30,
    showWeekends: true,
    showBuffers: true,
    showAlternatives: false,
    compactMode: false,
    showCategoryColors: true,
    showEnergyLevels: true,
    showProgress: true,
    allowDragDrop: true,
    allowInlineEdit: true,
    autoOptimize: false
  });

  // Generate optimal schedule
  const generateSchedule = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🧠 Generating schedule with data:', {
        date: format(date, 'yyyy-MM-dd'),
        morningTasks: morningTasks.length,
        deepTasks: deepTasks.length,
        lightTasks: lightTasks.length,
        workoutTasks: workoutTasks.length,
        healthTasks: healthTasks.length
      });

      const generatedSchedule = await enhancedTimeBlockService.generateOptimalSchedule({
        date,
        preferences,
        morningTasks,
        deepTasks,
        lightTasks,
        workoutTasks,
        healthTasks
      });

      setSchedule(generatedSchedule);
      console.log('✅ Schedule generated successfully');
      
    } catch (error) {
      console.error('❌ Failed to generate schedule:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle block completion
  const handleBlockComplete = (blockId: string) => {
    if (!schedule) return;
    
    const block = schedule.timeBlocks.find(b => b.id === blockId);
    if (!block) return;

    // Update the block completion status
    const newStatus = block.completionStatus === 'completed' ? 'pending' : 'completed';
    enhancedTimeBlockService.updateBlockCompletion(
      blockId, 
      newStatus, 
      newStatus === 'completed' ? format(new Date(), 'HH:mm') : undefined
    );

    // Update local state
    const updatedBlocks = schedule.timeBlocks.map(b => 
      b.id === blockId 
        ? { ...b, completionStatus: newStatus }
        : b
    );
    
    setSchedule({
      ...schedule,
      timeBlocks: updatedBlocks
    });

    // Notify parent about task completion
    if (block.sourceTaskIds.length > 0 && onTaskComplete) {
      onTaskComplete(block.sourceTaskIds[0], block.sourceSection);
    }
  };

  // Handle block click
  const handleBlockClick = (block: EnhancedTimeBlock) => {
    setSelectedBlock(selectedBlock?.id === block.id ? null : block);
  };

  // Apply schedule
  const handleApplySchedule = () => {
    if (schedule && onScheduleApply) {
      onScheduleApply(schedule);
    }
    onOpenChange(false);
  };

  // Update preferences
  const updatePreferences = (updates: Partial<WorkSchedulePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // Generate schedule when modal opens or preferences change
  useEffect(() => {
    if (open && (morningTasks.length > 0 || deepTasks.length > 0 || lightTasks.length > 0)) {
      generateSchedule();
    }
  }, [open, date, preferences.wakeUpTime, preferences.workStartTime, preferences.workEndTime]);

  // Calculate schedule stats
  const stats = useMemo(() => {
    if (!schedule) return null;
    
    const blocks = schedule.timeBlocks;
    const workBlocks = blocks.filter(b => ['deep-focus', 'light-focus'].includes(b.category));
    
    return {
      totalBlocks: blocks.length,
      workBlocks: workBlocks.length,
      totalWorkTime: Math.round(schedule.totalWorkTime / 60 * 10) / 10,
      totalFocusTime: Math.round(schedule.totalFocusTime / 60 * 10) / 10,
      efficiency: Math.round(schedule.scheduleEfficiency),
      energyUtilization: Math.round(schedule.energyUtilization)
    };
  }, [schedule]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Enhanced AI Time Boxing
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(date, 'EEEE, MMMM d, yyyy')} • Intelligent task scheduling
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {stats && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <Brain className="h-3 w-3" />
                    {stats.totalFocusTime}h focus
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.efficiency}% efficient
                  </Badge>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={generateSchedule}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isGenerating ? 'Optimizing...' : 'Regenerate'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="calendar" className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Schedule View
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1 gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="h-full mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                {/* Main Calendar */}
                <div className="lg:col-span-3">
                  <EnhancedTimeBoxCalendar
                    schedule={schedule}
                    onBlockClick={handleBlockClick}
                    onBlockComplete={handleBlockComplete}
                    onOptimizeSchedule={generateSchedule}
                    settings={calendarSettings}
                    className="h-full"
                  />
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {/* Schedule Stats */}
                  {stats && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Schedule Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Blocks:</span>
                          <Badge>{stats.totalBlocks}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Work Time:</span>
                          <Badge variant="outline">{stats.totalWorkTime}h</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Focus Time:</span>
                          <Badge variant="outline">{stats.totalFocusTime}h</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <Badge 
                            variant={stats.efficiency >= 80 ? "default" : "secondary"}
                          >
                            {stats.efficiency}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Block Details */}
                  {selectedBlock && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Block Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">{selectedBlock.title}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {selectedBlock.startTime} - {selectedBlock.endTime}
                        </div>
                        <div className="flex gap-2">
                          <Badge style={{ backgroundColor: `${selectedBlock.color}20`, color: selectedBlock.color }}>
                            {selectedBlock.category}
                          </Badge>
                          <Badge variant="outline">
                            {selectedBlock.priority}
                          </Badge>
                        </div>
                        {selectedBlock.description && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedBlock.description}
                          </p>
                        )}
                        {selectedBlock.aiReasoning && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className="h-3 w-3 text-blue-500" />
                              <span className="font-medium">AI Insight</span>
                            </div>
                            <p className="text-blue-700 dark:text-blue-300">
                              {selectedBlock.aiReasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="h-full mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
                {/* Basic Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Schedule</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="wakeUpTime">Wake Up Time</Label>
                      <Input
                        id="wakeUpTime"
                        type="time"
                        value={preferences.wakeUpTime}
                        onChange={(e) => updatePreferences({ wakeUpTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sleepTime">Sleep Time</Label>
                      <Input
                        id="sleepTime"
                        type="time"
                        value={preferences.sleepTime}
                        onChange={(e) => updatePreferences({ sleepTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="workStartTime">Work Start</Label>
                      <Input
                        id="workStartTime"
                        type="time"
                        value={preferences.workStartTime}
                        onChange={(e) => updatePreferences({ workStartTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workEndTime">Work End</Label>
                      <Input
                        id="workEndTime"
                        type="time"
                        value={preferences.workEndTime}
                        onChange={(e) => updatePreferences({ workEndTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="lunchTime">Lunch Time</Label>
                      <Input
                        id="lunchTime"
                        type="time"
                        value={preferences.lunchTime}
                        onChange={(e) => updatePreferences({ lunchTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workoutTime">Workout Time</Label>
                      <Input
                        id="workoutTime"
                        type="time"
                        value={preferences.workoutPreferredTime}
                        onChange={(e) => updatePreferences({ workoutPreferredTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Peak Times */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Energy & Focus</h3>
                  
                  <div>
                    <Label>Energy Profile</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['early-bird', 'night-owl', 'steady', 'bimodal'].map((type) => (
                        <Button
                          key={type}
                          variant={preferences.energyProfile.type === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updatePreferences({
                            energyProfile: { ...preferences.energyProfile, type: type as any }
                          })}
                          className="capitalize"
                        >
                          {type.replace('-', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="breakFrequency">Break Every (min)</Label>
                      <Input
                        id="breakFrequency"
                        type="number"
                        value={preferences.breakFrequency}
                        onChange={(e) => updatePreferences({ breakFrequency: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="breakDuration">Break Duration (min)</Label>
                      <Input
                        id="breakDuration"
                        type="number"
                        value={preferences.breakDuration}
                        onChange={(e) => updatePreferences({ breakDuration: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {schedule ? (
              `${schedule.timeBlocks.length} blocks scheduled • ${stats?.efficiency}% efficiency`
            ) : (
              'Configure your preferences and generate an optimal schedule'
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplySchedule}
              disabled={!schedule}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Apply Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
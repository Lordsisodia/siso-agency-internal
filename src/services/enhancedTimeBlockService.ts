/**
 * Enhanced TimeBlock Scheduling Service
 * Intelligent calendar-based task scheduling that integrates all LifeLock sections
 */

import { format, addMinutes, parseISO, isAfter, isBefore, differenceInMinutes } from 'date-fns';
import { 
  EnhancedTimeBlock, 
  WorkSchedulePreferences, 
  DaySchedule, 
  TimeBlockCategory,
  TaskSection,
  CompletionStatus,
  SchedulingConflict,
  TimeSlot,
  BlockChange
} from '@/types/timeblock.types';
import { DailyRoutineItem } from '@/services/lifeLockService';
import { EnhancedTask } from '@/services/enhancedTaskService';

export class EnhancedTimeBlockService {
  private static instance: EnhancedTimeBlockService;
  private schedules: Map<string, DaySchedule> = new Map();

  static getInstance(): EnhancedTimeBlockService {
    if (!this.instance) {
      this.instance = new EnhancedTimeBlockService();
    }
    return this.instance;
  }

  /**
   * Create optimal daily schedule from all task sections
   */
  async generateOptimalSchedule(params: {
    date: Date;
    preferences: WorkSchedulePreferences;
    morningTasks: DailyRoutineItem[];
    deepTasks: EnhancedTask[];
    lightTasks: any[];
    workoutTasks: any[];
    healthTasks: any[];
    customTasks?: any[];
  }): Promise<DaySchedule> {
    
    console.log('🧠 Generating optimal schedule for', format(params.date, 'yyyy-MM-dd'));
    
    const { date, preferences } = params;
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Step 1: Convert all tasks to potential time blocks
    const potentialBlocks = await this.convertTasksToTimeBlocks(params);
    
    // Step 2: Create fixed blocks (non-negotiable schedule items)
    const fixedBlocks = this.createFixedBlocks(preferences, date);
    
    // Step 3: Schedule high-priority tasks during peak energy times
    const scheduledBlocks = await this.scheduleWithEnergyOptimization(
      potentialBlocks,
      fixedBlocks,
      preferences
    );
    
    // Step 4: Fill remaining time with flexible tasks
    const finalBlocks = this.fillRemainingSlots(scheduledBlocks, preferences);
    
    // Step 5: Add transitions and buffers
    const optimizedBlocks = this.addTransitionsAndBuffers(finalBlocks, preferences);
    
    // Step 6: Validate and resolve conflicts
    const validatedBlocks = await this.validateAndResolveConflicts(optimizedBlocks);
    
    // Step 7: Calculate analytics
    const analytics = this.calculateScheduleAnalytics(validatedBlocks, preferences);
    
    const schedule: DaySchedule = {
      date,
      preferences,
      timeBlocks: validatedBlocks,
      ...analytics,
      isOptimized: true,
      lastOptimized: new Date(),
      version: 1
    };
    
    // Cache the schedule
    this.schedules.set(dateKey, schedule);
    
    console.log('✅ Generated', validatedBlocks.length, 'time blocks');
    return schedule;
  }

  /**
   * Convert tasks from all sections into potential time blocks
   */
  private async convertTasksToTimeBlocks(params: {
    date: Date;
    morningTasks: DailyRoutineItem[];
    deepTasks: EnhancedTask[];
    lightTasks: any[];
    workoutTasks: any[];
    healthTasks: any[];
    customTasks?: any[];
  }): Promise<EnhancedTimeBlock[]> {
    
    const blocks: EnhancedTimeBlock[] = [];
    const baseDate = format(params.date, 'yyyy-MM-dd');
    
    // Morning Routine Tasks
    params.morningTasks.forEach((task, index) => {
      blocks.push({
        id: `morning-${task.id}`,
        title: task.title,
        description: task.description,
        startTime: '', // Will be scheduled later
        endTime: '',
        duration: this.estimateTaskDuration(task.title, 'morning-routine'),
        category: 'morning-routine',
        sourceTaskIds: [task.id],
        sourceSection: 'morning-routine',
        completionStatus: task.completed ? 'completed' : 'pending',
        energyRequirement: 'medium',
        focusRequirement: 6,
        flexibility: 'fixed', // Morning routine should be sequential
        dependencies: index > 0 ? [`morning-${params.morningTasks[index - 1].id}`] : [],
        canSplit: false,
        color: this.getCategoryColor('morning-routine'),
        priority: 'high',
        tags: ['routine', 'morning'],
        confidence: 95,
        estimatedDifficulty: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Deep Focus Tasks
    params.deepTasks.forEach((task) => {
      blocks.push({
        id: `deep-${task.id}`,
        title: task.title,
        description: task.description,
        startTime: '',
        endTime: '',
        duration: task.estimated_duration || 90,
        category: 'deep-focus',
        sourceTaskIds: [task.id],
        sourceSection: 'deep-focus',
        completionStatus: task.status === 'done' ? 'completed' : 'pending',
        energyRequirement: 'high',
        focusRequirement: 9,
        flexibility: 'flexible',
        dependencies: [],
        canSplit: task.estimated_duration > 120, // Can split if > 2 hours
        color: this.getCategoryColor('deep-focus'),
        priority: this.mapPriorityFromTask(task.priority),
        tags: ['deep-work', task.category || 'general'],
        aiReasoning: `High-focus task requiring peak energy`,
        confidence: 90,
        estimatedDifficulty: task.complexity || 7,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Light Focus Tasks
    params.lightTasks
      .filter(task => task.title && task.title.trim())
      .forEach((task) => {
        blocks.push({
          id: `light-${task.id}`,
          title: task.title,
          description: task.description || '',
          startTime: '',
          endTime: '',
          duration: 30, // Default 30 minutes for light tasks
          category: 'light-focus',
          sourceTaskIds: [task.id],
          sourceSection: 'light-focus',
          completionStatus: task.completed ? 'completed' : 'pending',
          energyRequirement: 'medium',
          focusRequirement: 6,
          flexibility: 'moveable',
          dependencies: [],
          canSplit: false,
          color: this.getCategoryColor('light-focus'),
          priority: 'medium',
          tags: ['light-work', 'admin'],
          aiReasoning: `Light cognitive load, good for mid-energy periods`,
          confidence: 85,
          estimatedDifficulty: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

    // Workout Tasks
    if (params.workoutTasks && params.workoutTasks.length > 0) {
      const workoutDuration = params.workoutTasks.length * 5; // Rough estimate
      blocks.push({
        id: 'workout-session',
        title: `Workout Session (${params.workoutTasks.length} exercises)`,
        description: params.workoutTasks.map((w: any) => w.title).join(', '),
        startTime: '',
        endTime: '',
        duration: Math.max(workoutDuration, 45), // Minimum 45 minutes
        category: 'workout',
        sourceTaskIds: params.workoutTasks.map((w: any) => w.id),
        sourceSection: 'workout',
        completionStatus: params.workoutTasks.every((w: any) => w.completed) ? 'completed' : 'pending',
        energyRequirement: 'high',
        focusRequirement: 7,
        flexibility: 'flexible',
        dependencies: [],
        canSplit: false,
        color: this.getCategoryColor('workout'),
        priority: 'high',
        tags: ['fitness', 'health'],
        aiReasoning: `Physical activity best scheduled when energy is available`,
        confidence: 80,
        estimatedDifficulty: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Health Tasks (grouped)
    if (params.healthTasks && params.healthTasks.length > 0) {
      blocks.push({
        id: 'health-checklist',
        title: `Health & Habits (${params.healthTasks.length} items)`,
        description: 'Daily health tracking and habits',
        startTime: '',
        endTime: '',
        duration: 20,
        category: 'health',
        sourceTaskIds: params.healthTasks.map((h: any) => h.id),
        sourceSection: 'health',
        completionStatus: params.healthTasks.every((h: any) => h.completed) ? 'completed' : 'pending',
        energyRequirement: 'low',
        focusRequirement: 4,
        flexibility: 'moveable',
        dependencies: [],
        canSplit: true,
        color: this.getCategoryColor('health'),
        priority: 'medium',
        tags: ['health', 'tracking'],
        aiReasoning: `Low cognitive load, can be done anytime`,
        confidence: 75,
        estimatedDifficulty: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return blocks;
  }

  /**
   * Create fixed time blocks (meals, sleep, etc.)
   */
  private createFixedBlocks(preferences: WorkSchedulePreferences, date: Date): EnhancedTimeBlock[] {
    const blocks: EnhancedTimeBlock[] = [];
    const baseDate = format(date, 'yyyy-MM-dd');

    // Lunch break
    if (preferences.lunchTime) {
      const lunchStart = preferences.lunchTime;
      const lunchEnd = format(
        addMinutes(parseISO(`${baseDate}T${lunchStart}:00`), preferences.lunchDuration),
        'HH:mm'
      );

      blocks.push({
        id: 'lunch-break',
        title: 'Lunch Break',
        description: 'Midday meal and rest',
        startTime: lunchStart,
        endTime: lunchEnd,
        duration: preferences.lunchDuration,
        category: 'meal',
        sourceTaskIds: [],
        sourceSection: 'custom',
        completionStatus: 'pending',
        energyRequirement: 'low',
        focusRequirement: 2,
        flexibility: 'fixed',
        dependencies: [],
        canSplit: false,
        color: this.getCategoryColor('meal'),
        priority: 'medium',
        tags: ['meal', 'break'],
        aiReasoning: 'Fixed meal time for energy restoration',
        confidence: 100,
        estimatedDifficulty: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return blocks;
  }

  /**
   * Schedule tasks during optimal energy periods
   */
  private async scheduleWithEnergyOptimization(
    potentialBlocks: EnhancedTimeBlock[],
    fixedBlocks: EnhancedTimeBlock[],
    preferences: WorkSchedulePreferences
  ): Promise<EnhancedTimeBlock[]> {
    
    const scheduledBlocks = [...fixedBlocks];
    const remainingBlocks = [...potentialBlocks];

    // Sort by priority and energy requirement
    remainingBlocks.sort((a, b) => {
      const priorityWeight = this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority);
      if (priorityWeight !== 0) return priorityWeight;
      
      const energyWeight = this.getEnergyWeight(a.energyRequirement) - this.getEnergyWeight(b.energyRequirement);
      return energyWeight;
    });

    // Schedule morning routine first (right after wake up)
    const morningBlocks = remainingBlocks.filter(b => b.category === 'morning-routine');
    let currentTime = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${preferences.wakeUpTime}:00`);
    
    for (const block of morningBlocks) {
      block.startTime = format(currentTime, 'HH:mm');
      block.endTime = format(addMinutes(currentTime, block.duration), 'HH:mm');
      scheduledBlocks.push(block);
      currentTime = addMinutes(currentTime, block.duration + preferences.transitionBuffer);
    }

    // Schedule high-energy tasks during peak times
    const highEnergyBlocks = remainingBlocks.filter(
      b => b.energyRequirement === 'high' && b.category !== 'morning-routine'
    );

    for (const block of highEnergyBlocks) {
      const optimalSlot = this.findOptimalTimeSlot(
        block,
        scheduledBlocks,
        preferences,
        preferences.deepWorkPeakTimes
      );
      
      if (optimalSlot) {
        block.startTime = optimalSlot.start;
        block.endTime = optimalSlot.end;
        scheduledBlocks.push(block);
      }
    }

    return scheduledBlocks;
  }

  /**
   * Fill remaining time slots with flexible tasks
   */
  private fillRemainingSlots(
    scheduledBlocks: EnhancedTimeBlock[], 
    preferences: WorkSchedulePreferences
  ): EnhancedTimeBlock[] {
    
    const allBlocks = [...scheduledBlocks];
    const workStart = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${preferences.workStartTime}:00`);
    const workEnd = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${preferences.workEndTime}:00`);
    
    // Find available slots
    const availableSlots = this.findAvailableTimeSlots(allBlocks, workStart, workEnd);
    
    // Get unscheduled blocks
    const unscheduledBlocks = scheduledBlocks.filter(b => !b.startTime);
    
    // Schedule remaining blocks in available slots
    for (const slot of availableSlots) {
      const slotDuration = differenceInMinutes(
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.end}:00`),
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`)
      );
      
      // Find blocks that fit in this slot
      const fittingBlocks = unscheduledBlocks.filter(
        b => b.duration <= slotDuration && !b.startTime
      );
      
      if (fittingBlocks.length > 0) {
        // Take the highest priority block that fits
        const blockToSchedule = fittingBlocks[0];
        blockToSchedule.startTime = slot.start;
        blockToSchedule.endTime = format(
          addMinutes(parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`), blockToSchedule.duration),
          'HH:mm'
        );
        allBlocks.push(blockToSchedule);
      }
    }

    return allBlocks;
  }

  /**
   * Add transition buffers between tasks
   */
  private addTransitionsAndBuffers(
    blocks: EnhancedTimeBlock[], 
    preferences: WorkSchedulePreferences
  ): EnhancedTimeBlock[] {
    
    const enhancedBlocks = [...blocks];
    
    // Add break blocks between intensive tasks
    const sortedBlocks = blocks
      .filter(b => b.startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const current = sortedBlocks[i];
      const next = sortedBlocks[i + 1];
      
      const gap = differenceInMinutes(
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${next.startTime}:00`),
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${current.endTime}:00`)
      );
      
      // Add break if gap is large enough and current task was intensive
      if (gap >= 15 && (current.focusRequirement >= 7 || current.energyRequirement === 'high')) {
        const breakBlock: EnhancedTimeBlock = {
          id: `break-${i}`,
          title: 'Break',
          description: 'Rest and recharge',
          startTime: current.endTime,
          endTime: format(
            addMinutes(parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${current.endTime}:00`), Math.min(gap, 15)),
            'HH:mm'
          ),
          duration: Math.min(gap, 15),
          category: 'break',
          sourceTaskIds: [],
          sourceSection: 'custom',
          completionStatus: 'pending',
          energyRequirement: 'low',
          focusRequirement: 1,
          flexibility: 'fixed',
          dependencies: [],
          canSplit: false,
          color: this.getCategoryColor('break'),
          priority: 'low',
          tags: ['break', 'recovery'],
          aiReasoning: 'Strategic break after intensive work',
          confidence: 80,
          estimatedDifficulty: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        enhancedBlocks.push(breakBlock);
      }
    }

    return enhancedBlocks;
  }

  /**
   * Validate schedule and resolve conflicts
   */
  private async validateAndResolveConflicts(blocks: EnhancedTimeBlock[]): Promise<EnhancedTimeBlock[]> {
    const validBlocks = blocks.filter(b => b.startTime && b.endTime);
    
    // Sort by start time
    validBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Check for overlaps and resolve
    for (let i = 0; i < validBlocks.length - 1; i++) {
      const current = validBlocks[i];
      const next = validBlocks[i + 1];
      
      if (current.endTime > next.startTime) {
        // Overlap detected - adjust end time of current block
        console.warn(`⚠️ Overlap detected between ${current.title} and ${next.title}`);
        current.endTime = next.startTime;
        current.duration = differenceInMinutes(
          parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${current.endTime}:00`),
          parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${current.startTime}:00`)
        );
      }
    }

    return validBlocks;
  }

  /**
   * Calculate schedule analytics
   */
  private calculateScheduleAnalytics(
    blocks: EnhancedTimeBlock[], 
    preferences: WorkSchedulePreferences
  ) {
    const workBlocks = blocks.filter(b => 
      ['deep-focus', 'light-focus'].includes(b.category)
    );
    const focusBlocks = blocks.filter(b => b.focusRequirement >= 7);
    const breakBlocks = blocks.filter(b => b.category === 'break');
    
    return {
      totalWorkTime: workBlocks.reduce((sum, b) => sum + b.duration, 0),
      totalFocusTime: focusBlocks.reduce((sum, b) => sum + b.duration, 0),
      totalBreakTime: breakBlocks.reduce((sum, b) => sum + b.duration, 0),
      energyUtilization: this.calculateEnergyUtilization(blocks, preferences),
      scheduleEfficiency: this.calculateScheduleEfficiency(blocks, preferences)
    };
  }

  // Helper methods
  private estimateTaskDuration(title: string, category: TimeBlockCategory): number {
    const durationMap: Record<string, number> = {
      'wake up': 5,
      'shower': 15,
      'brush teeth': 5,
      'get blood flowing': 10,
      'hydrate': 5,
      'supplements': 5,
      'review & plan': 15,
      'meditation': 10
    };

    const lowerTitle = title.toLowerCase();
    for (const [key, duration] of Object.entries(durationMap)) {
      if (lowerTitle.includes(key)) {
        return duration;
      }
    }

    // Default durations by category
    const categoryDefaults: Record<TimeBlockCategory, number> = {
      'morning-routine': 15,
      'deep-focus': 90,
      'light-focus': 30,
      'workout': 60,
      'health': 20,
      'break': 15,
      'meal': 45,
      'commute': 30,
      'meeting': 60,
      'admin': 30,
      'learning': 60,
      'creative': 90,
      'maintenance': 30,
      'social': 60,
      'sleep': 480,
      'buffer': 10
    };

    return categoryDefaults[category] || 30;
  }

  private getCategoryColor(category: TimeBlockCategory): string {
    const colorMap: Record<TimeBlockCategory, string> = {
      'morning-routine': '#F59E0B',  // Amber
      'deep-focus': '#3B82F6',      // Blue
      'light-focus': '#10B981',     // Green
      'workout': '#EF4444',         // Red
      'health': '#EC4899',          // Pink
      'break': '#6B7280',           // Gray
      'meal': '#8B5CF6',            // Purple
      'commute': '#F97316',         // Orange
      'meeting': '#06B6D4',         // Cyan
      'admin': '#84CC16',           // Lime
      'learning': '#A855F7',        // Violet
      'creative': '#F472B6',        // Pink
      'maintenance': '#78716C',     // Stone
      'social': '#FB7185',          // Rose
      'sleep': '#1E293B',           // Slate
      'buffer': '#D1D5DB'           // Light Gray
    };
    return colorMap[category] || '#6B7280';
  }

  private mapPriorityFromTask(priority: string | undefined): 'critical' | 'high' | 'medium' | 'low' {
    if (!priority) return 'medium';
    
    const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      'urgent': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    
    return priorityMap[priority.toLowerCase()] || 'medium';
  }

  private getPriorityWeight(priority: 'critical' | 'high' | 'medium' | 'low'): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority];
  }

  private getEnergyWeight(energy: 'high' | 'medium' | 'low'): number {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[energy];
  }

  private findOptimalTimeSlot(
    block: EnhancedTimeBlock,
    scheduledBlocks: EnhancedTimeBlock[],
    preferences: WorkSchedulePreferences,
    preferredSlots: TimeSlot[]
  ): { start: string; end: string } | null {
    
    for (const slot of preferredSlots) {
      const slotStart = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`);
      const slotEnd = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.end}:00`);
      const requiredEnd = addMinutes(slotStart, block.duration);
      
      if (isBefore(requiredEnd, slotEnd)) {
        // Check if this time is available
        const isAvailable = !scheduledBlocks.some(scheduled => {
          if (!scheduled.startTime) return false;
          
          const scheduledStart = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${scheduled.startTime}:00`);
          const scheduledEnd = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${scheduled.endTime}:00`);
          
          return (
            (isAfter(slotStart, scheduledStart) && isBefore(slotStart, scheduledEnd)) ||
            (isAfter(requiredEnd, scheduledStart) && isBefore(requiredEnd, scheduledEnd)) ||
            (isBefore(slotStart, scheduledStart) && isAfter(requiredEnd, scheduledEnd))
          );
        });
        
        if (isAvailable) {
          return {
            start: format(slotStart, 'HH:mm'),
            end: format(requiredEnd, 'HH:mm')
          };
        }
      }
    }
    
    return null;
  }

  private findAvailableTimeSlots(
    scheduledBlocks: EnhancedTimeBlock[],
    workStart: Date,
    workEnd: Date
  ): { start: string; end: string }[] {
    
    const slots: { start: string; end: string }[] = [];
    const sortedBlocks = scheduledBlocks
      .filter(b => b.startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    let currentTime = workStart;
    
    for (const block of sortedBlocks) {
      const blockStart = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${block.startTime}:00`);
      
      if (isBefore(currentTime, blockStart)) {
        slots.push({
          start: format(currentTime, 'HH:mm'),
          end: format(blockStart, 'HH:mm')
        });
      }
      
      currentTime = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${block.endTime}:00`);
    }
    
    // Add final slot if there's time left
    if (isBefore(currentTime, workEnd)) {
      slots.push({
        start: format(currentTime, 'HH:mm'),
        end: format(workEnd, 'HH:mm')
      });
    }
    
    return slots.filter(slot => {
      const duration = differenceInMinutes(
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.end}:00`),
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`)
      );
      return duration >= 15; // Only slots of 15+ minutes
    });
  }

  private calculateEnergyUtilization(blocks: EnhancedTimeBlock[], preferences: WorkSchedulePreferences): number {
    // Simplified energy utilization calculation
    const highEnergyBlocks = blocks.filter(b => b.energyRequirement === 'high');
    const peakTimeMinutes = preferences.deepWorkPeakTimes.reduce((sum, slot) => {
      return sum + differenceInMinutes(
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.end}:00`),
        parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`)
      );
    }, 0);
    
    const highEnergyMinutes = highEnergyBlocks.reduce((sum, b) => sum + b.duration, 0);
    
    return Math.min(100, (highEnergyMinutes / peakTimeMinutes) * 100);
  }

  private calculateScheduleEfficiency(blocks: EnhancedTimeBlock[], preferences: WorkSchedulePreferences): number {
    // Simplified efficiency calculation based on proper sequencing and energy alignment
    let efficiency = 100;
    
    // Penalize for poor energy alignment
    blocks.forEach(block => {
      if (block.energyRequirement === 'high') {
        const blockTime = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${block.startTime}:00`);
        const isPeakTime = preferences.deepWorkPeakTimes.some(slot => {
          const slotStart = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.start}:00`);
          const slotEnd = parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${slot.end}:00`);
          return !isBefore(blockTime, slotStart) && isBefore(blockTime, slotEnd);
        });
        
        if (!isPeakTime) {
          efficiency -= 10; // Penalty for high-energy task outside peak time
        }
      }
    });
    
    return Math.max(0, efficiency);
  }

  /**
   * Get schedule for a specific date
   */
  getScheduleForDate(date: Date): DaySchedule | null {
    const dateKey = format(date, 'yyyy-MM-dd');
    return this.schedules.get(dateKey) || null;
  }

  /**
   * Update time block completion status
   */
  updateBlockCompletion(blockId: string, status: CompletionStatus, actualEndTime?: string): void {
    for (const schedule of this.schedules.values()) {
      const block = schedule.timeBlocks.find(b => b.id === blockId);
      if (block) {
        block.completionStatus = status;
        if (actualEndTime) {
          block.actualEndTime = actualEndTime;
        }
        schedule.version += 1;
        break;
      }
    }
  }
}

export const enhancedTimeBlockService = EnhancedTimeBlockService.getInstance();
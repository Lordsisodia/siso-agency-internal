/**
 * Enhanced TimeBlock System Types
 * Comprehensive type definitions for the calendar-based task scheduling system
 */

export interface EnhancedTimeBlock {
  id: string;
  title: string;
  description?: string;
  
  // Time & Duration
  startTime: string;              // "09:00"
  endTime: string;                // "10:30"
  duration: number;               // 90 minutes
  actualStartTime?: string;       // When actually started
  actualEndTime?: string;         // When actually completed
  
  // Category & Classification
  category: TimeBlockCategory;
  subcategory?: string;           // e.g., "email", "planning", "coding"
  
  // Task Integration
  sourceTaskIds: string[];        // Links to actual tasks from sections
  sourceSection: TaskSection;     // Which section this came from
  completionStatus: CompletionStatus;
  
  // Smart Scheduling Properties
  energyRequirement: EnergyLevel;
  focusRequirement: number;       // 1-10 scale
  flexibility: FlexibilityLevel;
  dependencies: string[];         // Task IDs that must come before this
  canSplit: boolean;             // Can this block be broken into smaller parts?
  
  // Visual & UX
  color: string;
  priority: Priority;
  tags: string[];
  
  // AI & Optimization
  aiReasoning?: string;          // Why AI scheduled it here
  confidence: number;            // 0-100 - how confident AI is about this placement
  alternatives?: AlternativeSlot[]; // Other possible time slots
  
  // Tracking & Analytics
  estimatedDifficulty: number;   // 1-10
  actualDifficulty?: number;     // User feedback after completion
  interruptionCount?: number;    // How many times interrupted
  notes?: string;                // User notes
  
  createdAt: Date;
  updatedAt: Date;
}

export type TimeBlockCategory = 
  | 'morning-routine'
  | 'deep-focus' 
  | 'light-focus'
  | 'workout'
  | 'health'
  | 'break'
  | 'meal'
  | 'commute'
  | 'meeting'
  | 'admin'
  | 'learning'
  | 'creative'
  | 'maintenance'
  | 'social'
  | 'sleep'
  | 'buffer';

export type TaskSection = 
  | 'morning-routine'
  | 'deep-focus'
  | 'light-focus'
  | 'workout'
  | 'health'
  | 'nightly-checkout'
  | 'custom';

export type CompletionStatus = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'skipped'
  | 'rescheduled'
  | 'cancelled';

export type EnergyLevel = 'high' | 'medium' | 'low';
export type FlexibilityLevel = 'fixed' | 'flexible' | 'moveable';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface AlternativeSlot {
  startTime: string;
  endTime: string;
  confidence: number;
  reasoning: string;
}

export interface WorkSchedulePreferences {
  // Core Schedule
  wakeUpTime: string;              // "07:00"
  sleepTime: string;               // "23:00"
  workStartTime: string;           // "09:00"
  workEndTime: string;             // "17:00"
  
  // Meals
  breakfastTime?: string;          // "08:00"
  lunchTime: string;               // "12:30"
  lunchDuration: number;           // 60 minutes
  dinnerTime?: string;             // "19:00"
  
  // Work Patterns
  deepWorkPeakTimes: TimeSlot[];   // When you're most focused
  lightWorkWindows: TimeSlot[];    // Good for admin/email tasks
  breakFrequency: number;          // Every X minutes (default: 90)
  breakDuration: number;           // Default break length (default: 15)
  
  // Exercise & Health
  workoutPreferredTime: string;    // "18:00"
  workoutDuration: number;         // 60 minutes
  workoutFlexibility: FlexibilityLevel;
  
  // Personal Preferences
  morningRoutineDuration: number;  // 60 minutes
  eveningRoutineDuration: number;  // 45 minutes
  transitionBuffer: number;        // 5 minutes between tasks
  
  // Energy Management
  energyProfile: EnergyProfile;
  focusBlocks: FocusBlockPreference[];
  
  // Constraints
  noWorkBefore?: string;           // "09:00" - absolute earliest work time
  noWorkAfter?: string;            // "18:00" - absolute latest work time
  blockedTimeSlots: TimeSlot[];    // Recurring unavailable times
}

export interface TimeSlot {
  start: string;    // "09:00"
  end: string;      // "11:00"
  days?: number[];  // [1,2,3,4,5] = weekdays, [0,6] = weekends
}

export interface EnergyProfile {
  type: 'early-bird' | 'night-owl' | 'steady' | 'bimodal';
  peakHours: TimeSlot[];
  lowEnergyHours: TimeSlot[];
  description?: string;
}

export interface FocusBlockPreference {
  category: TimeBlockCategory;
  preferredTimes: TimeSlot[];
  minimumDuration: number;    // minutes
  maximumDuration: number;    // minutes
  canInterrupt: boolean;
}

export interface DaySchedule {
  date: Date;
  preferences: WorkSchedulePreferences;
  timeBlocks: EnhancedTimeBlock[];
  
  // Analytics
  totalWorkTime: number;        // minutes
  totalFocusTime: number;       // minutes
  totalBreakTime: number;       // minutes
  energyUtilization: number;    // 0-100 how well energy was used
  scheduleEfficiency: number;   // 0-100 how optimal the schedule is
  
  // Status
  isOptimized: boolean;
  lastOptimized: Date;
  version: number;              // for conflict resolution
}

export interface SchedulingConflict {
  id: string;
  type: 'overlap' | 'constraint-violation' | 'energy-mismatch' | 'dependency-violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedBlocks: string[];     // TimeBlock IDs
  suggestions: ConflictResolution[];
}

export interface ConflictResolution {
  id: string;
  description: string;
  changes: BlockChange[];
  impact: 'minimal' | 'moderate' | 'significant';
  confidence: number;           // 0-100
}

export interface BlockChange {
  blockId: string;
  type: 'move' | 'resize' | 'split' | 'merge' | 'delete';
  newStartTime?: string;
  newEndTime?: string;
  newDuration?: number;
}

// Events for real-time updates
export interface TimeBlockEvent {
  type: 'created' | 'updated' | 'deleted' | 'completed' | 'started' | 'rescheduled';
  blockId: string;
  timestamp: Date;
  changes?: Partial<EnhancedTimeBlock>;
  source: 'user' | 'ai' | 'system';
}

// Integration with existing task types
export interface TaskIntegrationMapping {
  sourceId: string;
  sourceType: TaskSection;
  timeBlockId: string;
  mappingType: 'direct' | 'grouped' | 'split';
  
  // Sync properties
  bidirectional: boolean;       // Does completion sync both ways?
  lastSynced: Date;
}

// Calendar view settings
export interface CalendarViewSettings {
  hourRange: {
    start: number;              // 6 (for 6 AM)
    end: number;                // 23 (for 11 PM)
  };
  timeSlotInterval: number;     // 15, 30, or 60 minutes
  showWeekends: boolean;
  showBuffers: boolean;
  showAlternatives: boolean;
  
  // Visual preferences
  compactMode: boolean;
  showCategoryColors: boolean;
  showEnergyLevels: boolean;
  showProgress: boolean;
  
  // Interaction
  allowDragDrop: boolean;
  allowInlineEdit: boolean;
  autoOptimize: boolean;
}

export interface CalendarState {
  currentDate: Date;
  viewType: 'day' | 'week' | 'month';
  selectedBlock: string | null;
  draggedBlock: string | null;
  settings: CalendarViewSettings;
  
  // Loading states
  isOptimizing: boolean;
  isLoading: boolean;
  lastError?: string;
}
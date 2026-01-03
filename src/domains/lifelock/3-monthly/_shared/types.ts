/**
 * Monthly View Shared Types
 */

export interface DayData {
  date: Date;
  completionPercentage: number;
  grade: string;
  xpEarned: number;
  habits: {
    morningRoutine: boolean;
    workout: boolean;
    deepWork: boolean;
    checkout: boolean;
  };
  events: Event[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
}

export interface Event {
  id: string;
  title: string;
  type: 'flight' | 'meeting' | 'deadline' | 'birthday' | 'other';
  description?: string;
}

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  averageCompletion: number;
  totalXP: number;
  grade: string;
}

export interface MonthSummary {
  daysCompleted80Plus: number;
  totalDays: number;
  averageGrade: string;
  totalXP: number;
  maxPossibleXP: number;
  longestStreak: number;
  perfectDays: number;
}

export interface MonthlyData {
  month: Date;
  days: DayData[];
  weeklySummaries: WeeklySummary[];
  monthSummary: MonthSummary;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: string;
}

export interface YearlyProgress {
  id: string;
  title: string;
  yearlyTarget: number;
  monthlyContribution: number;
  totalToDate: number;
  unit: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  progress: number;
  deadline?: Date;
}

export interface MonthOverMonthMetric {
  metric: string;
  currentMonth: number;
  lastMonth: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface HabitConsistency {
  habit: string;
  daysCompleted: number;
  totalDays: number;
  percentage: number;
  streak: number;
  emoji: string;
}

export interface MonthlyReflection {
  wins: string[];
  improvements: string[];
  reflection: string;
  nextMonthFocus: string;
}

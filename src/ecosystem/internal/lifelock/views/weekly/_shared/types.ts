/**
 * Weekly View Shared Types
 */

export interface DailyData {
  date: Date;
  grade: string; // A+, A, B+, etc.
  completionPercentage: number;
  xpEarned: number;
  morningRoutine: boolean;
  deepWorkHours: number;
  lightWorkTasks: number;
  workout: boolean;
  sleepHours: number;
  wakeTime: string;
  checkout: boolean;
  energyLevel?: number; // 1-10
  caloriesIntake?: number;
}

export interface StreakData {
  morningRoutine: number;
  deepWork: number;
  workouts: number;
  checkout: number;
}

export interface WeeklySummary {
  totalXP: number;
  averageGrade: string;
  completionPercentage: number;
  streaks: StreakData;
  bestDay: {
    date: Date;
    grade: string;
    xp: number;
  };
  worstDay: {
    date: Date;
    grade: string;
    issues: string[];
  };
}

export interface WeeklyData {
  weekStart: Date;
  weekEnd: Date;
  dailyData: DailyData[];
  summary: WeeklySummary;
}

export interface ProductivityData {
  deepWork: {
    totalHours: number;
    sessions: number;
    dailyBreakdown: { date: Date; hours: number }[];
  };
  lightWork: {
    totalTasks: number;
    completedTasks: number;
    dailyBreakdown: { date: Date; tasks: number }[];
  };
  priorities: {
    p1: { total: number; completed: number };
    p2: { total: number; completed: number };
    p3: { total: number; completed: number };
    p4: { total: number; completed: number };
  };
  weekOverWeek: {
    deepWorkChange: number;
    lightWorkChange: number;
    completionChange: number;
  };
}

export interface WellnessData {
  workouts: {
    total: number;
    types: { type: string; count: number }[];
    totalMinutes: number;
  };
  healthHabits: {
    morningRoutine: boolean[];
    checkout: boolean[];
    water: boolean[];
    meditation: boolean[];
    sleep: boolean[];
  };
  energySleep: {
    averageEnergy: number;
    averageSleep: number;
    sleepQuality: number;
  };
  nutrition: {
    averageCalories: number;
    weightChange: number;
  };
}

export interface TimeAnalysisData {
  sleep: {
    dailyHours: { date: Date; hours: number }[];
    averageHours: number;
    quality: number;
  };
  work: {
    deepWorkHours: number;
    lightWorkHours: number;
    totalHours: number;
  };
  wakeTime: {
    onTimeRate: number;
    averageTime: string;
    justifications: string[];
  };
  utilization: {
    trackedHours: number;
    untrackedHours: number;
    productivePercentage: number;
  };
}

export interface InsightsData {
  wins: string[];
  problems: string[];
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
  }[];
  checkout: {
    reflection: string;
    nextWeekFocus: string;
  };
}

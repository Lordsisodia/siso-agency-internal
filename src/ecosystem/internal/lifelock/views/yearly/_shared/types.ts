/**
 * Yearly View Shared Types
 */

export interface MonthData {
  month: Date;
  name: string; // "January", "February", etc.
  completionPercentage: number;
  grade: string;
  totalXP: number;
  maxXP: number;
  bestWeek: Date;
  worstWeek: Date;
  achievements: Achievement[];
  isCurrent?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'achievement' | 'milestone' | 'record';
  icon: string;
  date: Date;
}

export interface QuarterData {
  quarter: number; // 1-4
  name: string; // "Q1: Foundation", etc.
  months: Date[];
  averageCompletion: number;
  totalXP: number;
  grade: string;
  bestMonth: Date;
  worstMonth: Date;
}

export interface YearSummary {
  totalXP: number;
  maxXP: number;
  averageGrade: string;
  bestMonth: Date;
  worstMonth: Date;
  yearCompletion: number;
  perfectMonths: number;
}

export interface YearlyData {
  year: number;
  months: MonthData[];
  quarters: QuarterData[];
  yearSummary: YearSummary;
}

export interface AnnualGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: 'health' | 'career' | 'financial' | 'personal';
  status: 'active' | 'completed' | 'paused';
  completedDate?: Date;
}

export interface Milestone {
  date: Date;
  title: string;
  description: string;
  type: 'achievement' | 'milestone' | 'record';
  icon: string;
}

export interface LifeBalanceData {
  health: number;
  career: number;
  financial: number;
  relationships: number;
  personal: number;
  overall: number;
  trends: {
    health: number[];
    career: number[];
    financial: number[];
    relationships: number[];
    personal: number[];
  };
}

export interface YearOverYearMetric {
  metric: string;
  currentYear: number;
  lastYear: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface YearlyReflection {
  wins: string[];
  improvements: string[];
  learnings: string[];
  reflection: string;
  nextYearVision: string;
}

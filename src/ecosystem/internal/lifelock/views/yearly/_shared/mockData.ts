/**
 * Mock data for Yearly View development
 */

import { addMonths, startOfYear, format } from 'date-fns';
import type {
  YearlyData,
  MonthData,
  QuarterData,
  AnnualGoal,
  Milestone,
  LifeBalanceData,
  YearOverYearMetric,
  YearlyReflection
} from './types';

const currentYear = new Date().getFullYear();
const yearStart = startOfYear(new Date(currentYear, 0, 1));

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate 12 months of data
const generateMonthsData = (): MonthData[] => {
  return MONTH_NAMES.map((name, idx) => {
    const month = addMonths(yearStart, idx);
    const completion = Math.floor(Math.random() * 30) + 70; // 70-100%
    const grade = 
      completion >= 95 ? 'A+' :
      completion >= 90 ? 'A' :
      completion >= 85 ? 'A-' :
      completion >= 80 ? 'B+' :
      completion >= 75 ? 'B' : 'B-';
    
    return {
      month,
      name,
      completionPercentage: completion,
      grade,
      totalXP: Math.floor(completion * 40),
      maxXP: 4000,
      bestWeek: addMonths(yearStart, idx),
      worstWeek: addMonths(yearStart, idx),
      achievements: [],
      isCurrent: idx === new Date().getMonth(),
    };
  });
};

const monthsData = generateMonthsData();

// Generate quarterly data
const generateQuartersData = (): QuarterData[] => {
  const quarters = [
    { name: 'Q1: Foundation', months: monthsData.slice(0, 3) },
    { name: 'Q2: Growth', months: monthsData.slice(3, 6) },
    { name: 'Q3: Acceleration', months: monthsData.slice(6, 9) },
    { name: 'Q4: Excellence', months: monthsData.slice(9, 12) },
  ];

  return quarters.map((q, idx) => {
    const avgCompletion = Math.round(
      q.months.reduce((sum, m) => sum + m.completionPercentage, 0) / q.months.length
    );
    const totalXP = q.months.reduce((sum, m) => sum + m.totalXP, 0);
    
    return {
      quarter: idx + 1,
      name: q.name,
      months: q.months.map(m => m.month),
      averageCompletion: avgCompletion,
      totalXP,
      grade: avgCompletion >= 90 ? 'A' : avgCompletion >= 80 ? 'B+' : 'B',
      bestMonth: q.months.reduce((best, m) => m.completionPercentage > best.completionPercentage ? m : best).month,
      worstMonth: q.months.reduce((worst, m) => m.completionPercentage < worst.completionPercentage ? m : worst).month,
    };
  });
};

export const mockYearlyData: YearlyData = {
  year: currentYear,
  months: monthsData,
  quarters: generateQuartersData(),
  yearSummary: {
    totalXP: monthsData.reduce((sum, m) => sum + m.totalXP, 0),
    maxXP: 48000,
    averageGrade: 'A-',
    bestMonth: monthsData.reduce((best, m) => m.completionPercentage > best.completionPercentage ? m : best).month,
    worstMonth: monthsData.reduce((worst, m) => m.completionPercentage < worst.completionPercentage ? m : worst).month,
    yearCompletion: Math.round(monthsData.reduce((sum, m) => sum + m.completionPercentage, 0) / monthsData.length),
    perfectMonths: monthsData.filter(m => m.grade.startsWith('A')).length,
  },
};

export const mockAnnualGoals: AnnualGoal[] = [
  {
    id: '1',
    title: 'Launch SISO Production',
    target: 1,
    current: 0.85,
    unit: 'launch',
    category: 'career',
    status: 'active',
  },
  {
    id: '2',
    title: 'Read 52 Books',
    target: 52,
    current: 38,
    unit: 'books',
    category: 'personal',
    status: 'active',
  },
  {
    id: '3',
    title: 'Exercise 200 Times',
    target: 200,
    current: 156,
    unit: 'workouts',
    category: 'health',
    status: 'active',
  },
  {
    id: '4',
    title: 'Save $50,000',
    target: 50000,
    current: 34000,
    unit: 'dollars',
    category: 'financial',
    status: 'active',
  },
  {
    id: '5',
    title: 'Deep Work 1,200 Hours',
    target: 1200,
    current: 892,
    unit: 'hours',
    category: 'career',
    status: 'active',
  },
];

export const mockMilestones: Milestone[] = [
  {
    date: new Date(currentYear, 0, 15),
    title: 'First Client Signed',
    description: 'Landed first major client for SISO',
    type: 'milestone',
    icon: '🎯',
  },
  {
    date: new Date(currentYear, 2, 1),
    title: '100 Workout Streak',
    description: 'Achieved 100-day workout streak',
    type: 'achievement',
    icon: '💪',
  },
  {
    date: new Date(currentYear, 4, 15),
    title: 'SISO MVP Launch',
    description: 'Successfully launched SISO beta',
    type: 'milestone',
    icon: '🚀',
  },
  {
    date: new Date(currentYear, 6, 4),
    title: 'Personal Best: 12h Deep Work',
    description: 'Achieved record 12 hours deep work in single day',
    type: 'record',
    icon: '🏆',
  },
  {
    date: new Date(currentYear, 8, 20),
    title: '$30K Revenue Milestone',
    description: 'Hit first $30K revenue month',
    type: 'milestone',
    icon: '💰',
  },
];

export const mockLifeBalance: LifeBalanceData = {
  health: 82,
  career: 88,
  financial: 75,
  relationships: 68,
  personal: 79,
  overall: 78,
  trends: {
    health: [75, 78, 80, 82, 83, 85, 84, 82, 81, 82, 83, 82],
    career: [70, 75, 78, 82, 85, 87, 88, 89, 88, 87, 88, 88],
    financial: [60, 62, 65, 68, 70, 72, 74, 75, 76, 75, 74, 75],
    relationships: [65, 64, 66, 68, 67, 68, 69, 68, 67, 68, 69, 68],
    personal: [72, 74, 76, 78, 79, 80, 79, 78, 79, 80, 79, 79],
  },
};

export const mockYearOverYear: YearOverYearMetric[] = [
  {
    metric: 'Average Completion',
    currentYear: 85,
    lastYear: 78,
    change: 9,
    trend: 'up',
  },
  {
    metric: 'Total XP',
    currentYear: 42680,
    lastYear: 38200,
    change: 12,
    trend: 'up',
  },
  {
    metric: 'Deep Work Hours',
    currentYear: 892,
    lastYear: 720,
    change: 24,
    trend: 'up',
  },
  {
    metric: 'Workout Frequency',
    currentYear: 156,
    lastYear: 142,
    change: 10,
    trend: 'up',
  },
  {
    metric: 'Books Read',
    currentYear: 38,
    lastYear: 24,
    change: 58,
    trend: 'up',
  },
];

export const mockYearlyReflection: YearlyReflection = {
  wins: [
    '🚀 Successfully launched SISO MVP',
    '💪 Achieved 156 workouts - personal best!',
    '📚 Read 38 books - exceeded target by 73%',
    '💰 Hit $30K revenue month milestone',
    '🏆 Maintained 85% average completion all year',
  ],
  improvements: [
    '⚠️ Relationships score (68%) needs more attention',
    '⚠️ Financial savings fell short of $50K goal',
    '⚠️ Q2 had a dip in consistency',
  ],
  learnings: [
    'Consistency beats intensity every time',
    'Morning routine is the keystone habit',
    'Deep work sessions are most productive 9-11 AM',
    'Need to schedule relationship time deliberately',
  ],
  reflection: '',
  nextYearVision: '',
};

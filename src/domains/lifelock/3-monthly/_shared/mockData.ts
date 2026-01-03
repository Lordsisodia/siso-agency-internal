/**
 * Mock data for Monthly View development
 */

import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import type {
  MonthlyData,
  MonthlyGoal,
  YearlyProgress,
  Project,
  MonthOverMonthMetric,
  HabitConsistency,
  MonthlyReflection,
  DayData,
  WeeklySummary
} from './types';

const today = new Date();
const monthStart = startOfMonth(today);
const monthEnd = endOfMonth(today);
const daysInMonth = monthEnd.getDate();

// Generate daily data for the month
const generateDailyData = (): DayData[] => {
  const days: DayData[] = [];
  
  for (let i = 0; i < daysInMonth; i++) {
    const date = addDays(monthStart, i);
    const completion = Math.floor(Math.random() * 40) + 60; // 60-100%
    const grade = 
      completion >= 95 ? 'A+' :
      completion >= 90 ? 'A' :
      completion >= 85 ? 'A-' :
      completion >= 80 ? 'B+' :
      completion >= 75 ? 'B' :
      completion >= 70 ? 'B-' : 'C+';
    
    days.push({
      date,
      completionPercentage: completion,
      grade,
      xpEarned: Math.floor(completion * 5),
      habits: {
        morningRoutine: Math.random() > 0.2,
        workout: Math.random() > 0.3,
        deepWork: Math.random() > 0.15,
        checkout: Math.random() > 0.25,
      },
      events: [],
      isToday: date.toDateString() === today.toDateString(),
      isCurrentMonth: true,
    });
  }
  
  return days;
};

const dailyData = generateDailyData();

// Generate weekly summaries
const generateWeeklySummaries = (): WeeklySummary[] => {
  const summaries: WeeklySummary[] = [];
  let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  while (weekStart <= monthEnd) {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = dailyData.filter(day => 
      day.date >= weekStart && day.date <= weekEnd
    );
    
    const avgCompletion = Math.round(
      weekDays.reduce((sum, day) => sum + day.completionPercentage, 0) / weekDays.length
    );
    
    summaries.push({
      weekStart,
      weekEnd,
      averageCompletion: avgCompletion,
      totalXP: weekDays.reduce((sum, day) => sum + day.xpEarned, 0),
      grade: avgCompletion >= 90 ? 'A' : avgCompletion >= 80 ? 'B+' : avgCompletion >= 70 ? 'B' : 'C+',
    });
    
    weekStart = addDays(weekStart, 7);
  }
  
  return summaries;
};

export const mockMonthlyData: MonthlyData = {
  month: monthStart,
  days: dailyData,
  weeklySummaries: generateWeeklySummaries(),
  monthSummary: {
    daysCompleted80Plus: dailyData.filter(d => d.completionPercentage >= 80).length,
    totalDays: daysInMonth,
    averageGrade: 'B+',
    totalXP: dailyData.reduce((sum, day) => sum + day.xpEarned, 0),
    maxPossibleXP: daysInMonth * 500,
    longestStreak: 12,
    perfectDays: dailyData.filter(d => d.completionPercentage >= 95).length,
  },
};

export const mockMonthlyGoals: MonthlyGoal[] = [
  {
    id: '1',
    title: 'Complete 100 hours of deep work',
    target: 100,
    current: 78,
    unit: 'hours',
    category: 'productivity',
  },
  {
    id: '2',
    title: 'Exercise 20 times',
    target: 20,
    current: 16,
    unit: 'workouts',
    category: 'health',
  },
  {
    id: '3',
    title: 'Read 4 books',
    target: 4,
    current: 3,
    unit: 'books',
    category: 'learning',
  },
  {
    id: '4',
    title: 'Save $2,000',
    target: 2000,
    current: 1650,
    unit: 'dollars',
    category: 'financial',
  },
];

export const mockYearlyProgress: YearlyProgress[] = [
  {
    id: '1',
    title: 'Annual Income Goal',
    yearlyTarget: 150000,
    monthlyContribution: 12500,
    totalToDate: 87500,
    unit: 'dollars',
  },
  {
    id: '2',
    title: 'Books Read This Year',
    yearlyTarget: 52,
    monthlyContribution: 3,
    totalToDate: 24,
    unit: 'books',
  },
  {
    id: '3',
    title: 'Deep Work Hours',
    yearlyTarget: 1200,
    monthlyContribution: 78,
    totalToDate: 546,
    unit: 'hours',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Launch SISO MVP',
    status: 'on-track',
    progress: 75,
    deadline: addDays(today, 15),
  },
  {
    id: '2',
    title: 'Client Project Alpha',
    status: 'at-risk',
    progress: 45,
    deadline: addDays(today, 8),
  },
  {
    id: '3',
    title: 'Personal Website Redesign',
    status: 'delayed',
    progress: 30,
    deadline: addDays(today, -5),
  },
];

export const mockMonthOverMonth: MonthOverMonthMetric[] = [
  {
    metric: 'Average Completion',
    currentMonth: 83,
    lastMonth: 78,
    change: 5,
    trend: 'up',
  },
  {
    metric: 'Total XP',
    currentMonth: 12840,
    lastMonth: 11590,
    change: 11,
    trend: 'up',
  },
  {
    metric: 'Deep Work Hours',
    currentMonth: 78,
    lastMonth: 72,
    change: 8,
    trend: 'up',
  },
  {
    metric: 'Workout Frequency',
    currentMonth: 16,
    lastMonth: 18,
    change: -11,
    trend: 'down',
  },
  {
    metric: 'Perfect Days',
    currentMonth: 5,
    lastMonth: 4,
    change: 25,
    trend: 'up',
  },
];

export const mockHabitConsistency: HabitConsistency[] = [
  {
    habit: 'Morning Routine',
    daysCompleted: 24,
    totalDays: daysInMonth,
    percentage: Math.round((24 / daysInMonth) * 100),
    streak: 6,
    emoji: '🌅',
  },
  {
    habit: 'Deep Work',
    daysCompleted: 26,
    totalDays: daysInMonth,
    percentage: Math.round((26 / daysInMonth) * 100),
    streak: 8,
    emoji: '🧠',
  },
  {
    habit: 'Workout',
    daysCompleted: 16,
    totalDays: daysInMonth,
    percentage: Math.round((16 / daysInMonth) * 100),
    streak: 3,
    emoji: '💪',
  },
  {
    habit: 'Checkout',
    daysCompleted: 22,
    totalDays: daysInMonth,
    percentage: Math.round((22 / daysInMonth) * 100),
    streak: 5,
    emoji: '✅',
  },
  {
    habit: 'Meditation',
    daysCompleted: 20,
    totalDays: daysInMonth,
    percentage: Math.round((20 / daysInMonth) * 100),
    streak: 4,
    emoji: '🧘',
  },
];

export const mockMonthlyReflection: MonthlyReflection = {
  wins: [
    '🏆 Hit 78 hours of deep work - personal best!',
    '💪 Maintained 6-day morning routine streak',
    '📚 Finished 3 books including "Atomic Habits"',
    '🚀 Launched SISO MVP alpha version',
  ],
  improvements: [
    '⚠️ Workout frequency dropped from 18 to 16',
    '⚠️ Missed checkout 9 times this month',
    '⚠️ Client project slipped behind schedule',
  ],
  reflection: '',
  nextMonthFocus: '',
};

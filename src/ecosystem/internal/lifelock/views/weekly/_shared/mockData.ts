/**
 * Mock data for Weekly View development
 */

import { addDays, startOfWeek } from 'date-fns';
import type { WeeklyData, ProductivityData, WellnessData, TimeAnalysisData, InsightsData } from './types';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

export const mockWeeklyData: WeeklyData = {
  weekStart,
  weekEnd: addDays(weekStart, 6),
  dailyData: [
    {
      date: addDays(weekStart, 0),
      grade: 'A',
      completionPercentage: 92,
      xpEarned: 450,
      morningRoutine: true,
      deepWorkHours: 6,
      lightWorkTasks: 8,
      workout: true,
      sleepHours: 7.5,
      wakeTime: '6:30 AM',
      checkout: true,
      energyLevel: 8,
      caloriesIntake: 2200,
    },
    {
      date: addDays(weekStart, 1),
      grade: 'A-',
      completionPercentage: 88,
      xpEarned: 420,
      morningRoutine: true,
      deepWorkHours: 5,
      lightWorkTasks: 6,
      workout: true,
      sleepHours: 7,
      wakeTime: '7:00 AM',
      checkout: true,
      energyLevel: 7,
      caloriesIntake: 2100,
    },
    {
      date: addDays(weekStart, 2),
      grade: 'B+',
      completionPercentage: 82,
      xpEarned: 380,
      morningRoutine: true,
      deepWorkHours: 4,
      lightWorkTasks: 5,
      workout: false,
      sleepHours: 6.5,
      wakeTime: '7:30 AM',
      checkout: true,
      energyLevel: 6,
      caloriesIntake: 2300,
    },
    {
      date: addDays(weekStart, 3),
      grade: 'A',
      completionPercentage: 94,
      xpEarned: 470,
      morningRoutine: true,
      deepWorkHours: 7,
      lightWorkTasks: 9,
      workout: true,
      sleepHours: 8,
      wakeTime: '6:00 AM',
      checkout: true,
      energyLevel: 9,
      caloriesIntake: 2000,
    },
    {
      date: addDays(weekStart, 4),
      grade: 'B',
      completionPercentage: 75,
      xpEarned: 340,
      morningRoutine: false,
      deepWorkHours: 3,
      lightWorkTasks: 4,
      workout: false,
      sleepHours: 6,
      wakeTime: '8:00 AM',
      checkout: false,
      energyLevel: 5,
      caloriesIntake: 2500,
    },
    {
      date: addDays(weekStart, 5),
      grade: 'A-',
      completionPercentage: 86,
      xpEarned: 410,
      morningRoutine: true,
      deepWorkHours: 5,
      lightWorkTasks: 7,
      workout: true,
      sleepHours: 7,
      wakeTime: '6:45 AM',
      checkout: true,
      energyLevel: 8,
      caloriesIntake: 2100,
    },
    {
      date: addDays(weekStart, 6),
      grade: 'B+',
      completionPercentage: 80,
      xpEarned: 370,
      morningRoutine: true,
      deepWorkHours: 4,
      lightWorkTasks: 5,
      workout: false,
      sleepHours: 8,
      wakeTime: '7:00 AM',
      checkout: true,
      energyLevel: 7,
      caloriesIntake: 2200,
    },
  ],
  summary: {
    totalXP: 2840,
    averageGrade: 'A-',
    completionPercentage: 85,
    streaks: {
      morningRoutine: 6,
      deepWork: 7,
      workouts: 3,
      checkout: 6,
    },
    bestDay: {
      date: addDays(weekStart, 3),
      grade: 'A',
      xp: 470,
    },
    worstDay: {
      date: addDays(weekStart, 4),
      grade: 'B',
      issues: ['Missed morning routine', 'No workout', 'Low deep work hours'],
    },
  },
};

export const mockProductivityData: ProductivityData = {
  deepWork: {
    totalHours: 34,
    sessions: 21,
    dailyBreakdown: mockWeeklyData.dailyData.map(day => ({
      date: day.date,
      hours: day.deepWorkHours,
    })),
  },
  lightWork: {
    totalTasks: 44,
    completedTasks: 38,
    dailyBreakdown: mockWeeklyData.dailyData.map(day => ({
      date: day.date,
      tasks: day.lightWorkTasks,
    })),
  },
  priorities: {
    p1: { total: 12, completed: 11 },
    p2: { total: 15, completed: 13 },
    p3: { total: 10, completed: 8 },
    p4: { total: 7, completed: 6 },
  },
  weekOverWeek: {
    deepWorkChange: 12, // +12% from last week
    lightWorkChange: -5, // -5% from last week
    completionChange: 8, // +8% from last week
  },
};

export const mockWellnessData: WellnessData = {
  workouts: {
    total: 4,
    types: [
      { type: 'Push-ups', count: 3 },
      { type: 'Running', count: 2 },
      { type: 'Weights', count: 1 },
    ],
    totalMinutes: 240,
  },
  healthHabits: {
    morningRoutine: [true, true, true, true, false, true, true],
    checkout: [true, true, true, true, false, true, true],
    water: [true, true, false, true, true, true, false],
    meditation: [true, true, true, true, false, true, true],
    sleep: [true, true, false, true, false, true, true],
  },
  energySleep: {
    averageEnergy: 7.1,
    averageSleep: 7.1,
    sleepQuality: 8,
  },
  nutrition: {
    averageCalories: 2200,
    weightChange: -0.5, // kg
  },
};

export const mockTimeAnalysisData: TimeAnalysisData = {
  sleep: {
    dailyHours: mockWeeklyData.dailyData.map(day => ({
      date: day.date,
      hours: day.sleepHours,
    })),
    averageHours: 7.1,
    quality: 8,
  },
  work: {
    deepWorkHours: 34,
    lightWorkHours: 12,
    totalHours: 46,
  },
  wakeTime: {
    onTimeRate: 86, // 6/7 days on time
    averageTime: '6:58 AM',
    justifications: ['Friday: Stayed up late working on urgent project'],
  },
  utilization: {
    trackedHours: 46,
    untrackedHours: 66,
    productivePercentage: 41,
  },
};

export const mockInsightsData: InsightsData = {
  wins: [
    '🏆 Best day: Wednesday with 470 XP!',
    '💪 Maintained 6-day morning routine streak',
    '🎯 Hit 92% completion rate on Monday',
    '📚 34 hours of deep work - personal best!',
  ],
  problems: [
    '⚠️ Friday was rough - missed morning routine and workout',
    '⚠️ Wednesday had only 6.5 hours of sleep',
    '⚠️ Light work completion dropped 5% from last week',
  ],
  trends: [
    {
      metric: 'Deep Work Hours',
      direction: 'up',
      change: 12,
    },
    {
      metric: 'Sleep Quality',
      direction: 'up',
      change: 5,
    },
    {
      metric: 'Light Work Tasks',
      direction: 'down',
      change: -5,
    },
    {
      metric: 'Average Energy',
      direction: 'stable',
      change: 0,
    },
  ],
  checkout: {
    reflection: '',
    nextWeekFocus: '',
  },
};

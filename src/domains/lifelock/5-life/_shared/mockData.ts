/**
 * Mock data for Life View development
 */

import { addYears } from 'date-fns';
import type {
  LifeVisionData,
  LifeGoal,
  LifetimeStats,
  AllTimeBests,
  FinancialLegacy,
  ImpactMetrics,
  YearTimelineData,
  LifeBalanceScores,
  LifeReview,
  LifePlanning
} from './types';

export const mockLifeVision: LifeVisionData = {
  missionStatement: 'Build technology that helps people achieve their full potential while living a balanced, fulfilling life.',
  coreValues: [
    { value: 'Excellence Over Perfection', description: 'Ship great work, don\'t wait for perfect', importance: 10 },
    { value: 'Discipline = Freedom', description: 'Systems and habits create space for creativity', importance: 9 },
    { value: 'Compound Growth', description: 'Small consistent improvements compound exponentially', importance: 9 },
    { value: 'Health First', description: 'Physical and mental health enable everything else', importance: 8 },
    { value: 'Family & Legacy', description: 'Build something that outlasts me', importance: 10 },
  ],
  fiveYearVision: {
    career: 'SISO is a thriving SaaS company serving 10,000+ users, generating $500K+ ARR',
    health: 'Peak physical condition - sub-10% body fat, running marathons, consistent energy',
    financial: '$500K+ net worth, multiple income streams, financially independent',
    relationships: 'Strong family bonds, thriving marriage, mentor to 10+ people',
    personal: 'Published author, fluent in 2 languages, traveled to 20+ countries',
  },
  lifePhilosophy: 'Life is not measured by the number of breaths we take, but by the moments that take our breath away. Build, create, inspire, and leave the world better than I found it.',
};

export const mockLifeGoals: LifeGoal[] = [
  {
    id: '1',
    title: 'Build SISO to $1M ARR',
    category: 'career',
    target: '$1M annual recurring revenue',
    currentProgress: 340000,
    targetValue: 1000000,
    deadline: new Date(2027, 11, 31),
    milestones: [
      { title: 'Launch MVP', completed: true, completedDate: new Date(2025, 4, 15) },
      { title: 'First 100 users', completed: true, completedDate: new Date(2025, 6, 1) },
      { title: 'First $10K MRR', completed: false },
      { title: 'First $50K MRR', completed: false },
      { title: 'First $100K MRR', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Achieve Financial Independence',
    category: 'financial',
    target: '$2M net worth',
    currentProgress: 450000,
    targetValue: 2000000,
    deadline: new Date(2030, 11, 31),
    milestones: [
      { title: 'Save $100K', completed: true, completedDate: new Date(2023, 5, 1) },
      { title: 'Save $250K', completed: true, completedDate: new Date(2024, 8, 15) },
      { title: 'Save $500K', completed: false },
      { title: 'Save $1M', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Run a Marathon',
    category: 'health',
    target: 'Complete a marathon under 4 hours',
    currentProgress: 65,
    targetValue: 100,
    deadline: new Date(2026, 9, 1),
    milestones: [
      { title: 'Run 5K', completed: true, completedDate: new Date(2024, 2, 1) },
      { title: 'Run 10K', completed: true, completedDate: new Date(2024, 6, 1) },
      { title: 'Run Half Marathon', completed: true, completedDate: new Date(2025, 3, 15) },
      { title: 'Run Full Marathon', completed: false },
    ],
  },
];

export const mockLifetimeStats: LifetimeStats = {
  totalDaysTracked: 847,
  lifetimeXP: 384920,
  bestDay: {
    date: new Date(2025, 5, 12),
    grade: 'A+',
    xp: 520,
  },
  longestStreak: 47,
  totalWorkouts: 412,
  totalDeepWorkHours: 2145.5,
  totalTasksCompleted: 3847,
  perfectDays: 89,
};

export const mockAllTimeBests: AllTimeBests = {
  longestStreak: 47,
  mostXPInDay: 520,
  mostXPInWeek: 3180,
  mostXPInMonth: 13240,
  bestYear: {
    year: 2025,
    totalXP: 42680,
    averageGrade: 'A-',
  },
};

export const mockFinancialLegacy: FinancialLegacy = {
  totalRevenue: 340000,
  totalSaved: 125000,
  totalInvested: 78000,
  netWorth: 450000,
};

export const mockImpactMetrics: ImpactMetrics = {
  projectsShipped: 23,
  clientsHelped: 47,
  peopleMentored: 12,
  contentCreated: 156,
};

export const mockYearTimeline: YearTimelineData[] = [
  {
    year: 2025,
    highlights: [
      '🚀 Launched SISO MVP',
      '💪 Ran first half-marathon',
      '📚 Read 38 books',
      '💰 Hit $30K revenue month',
    ],
    majorEvents: [
      { date: new Date(2025, 4, 15), title: 'SISO MVP Launch', description: 'Publicly launched SISO beta', type: 'career', importance: 10 },
      { date: new Date(2025, 3, 15), title: 'First Half Marathon', description: 'Completed in 1:52:30', type: 'health', importance: 8 },
    ],
    chapter: {
      title: 'The Builder',
      description: 'Building SISO and establishing systems',
      startDate: new Date(2025, 0, 1),
    },
  },
  {
    year: 2024,
    highlights: [
      '💼 Quit job to pursue SISO',
      '📖 Read 24 books',
      '💪 142 workouts',
      '🏠 Moved to new city',
    ],
    majorEvents: [
      { date: new Date(2024, 3, 1), title: 'Quit Corporate Job', description: 'Left to build SISO full-time', type: 'career', importance: 10 },
      { date: new Date(2024, 7, 15), title: 'Relocated', description: 'Moved for better opportunities', type: 'personal', importance: 7 },
    ],
  },
  {
    year: 2023,
    highlights: [
      '💡 Conceived SISO idea',
      '📚 Started serious reading habit',
      '💪 First 100-workout year',
    ],
    majorEvents: [
      { date: new Date(2023, 8, 1), title: 'SISO Conception', description: 'Had the idea for SISO', type: 'career', importance: 9 },
    ],
  },
];

export const mockLifeBalance: LifeBalanceScores = {
  health: 82,
  career: 88,
  financial: 75,
  relationships: 68,
  personal: 79,
  overall: 78,
};

export const mockLifeReviews: LifeReview[] = [
  {
    date: new Date(2025, 9, 1),
    type: 'quarterly',
    satisfactionScore: 85,
    reflections: 'Strong quarter - SISO is gaining traction',
    courseCorrections: ['Need to invest more in relationships', 'Financial runway running low'],
    priorities: ['Ship SISO v2', 'Build revenue to $10K MRR', 'Weekly family calls'],
  },
];

export const mockLifePlanning: LifePlanning = {
  oneYear: {
    focus: 'Get SISO to product-market fit and $10K MRR',
    priorities: [
      'Ship SISO v2 with core features',
      'Acquire 500 paying customers',
      'Build sustainable revenue stream',
    ],
    milestones: [
      { title: 'Launch SISO v2', targetDate: new Date(2026, 2, 1), status: 'in-progress' },
      { title: 'Hit $10K MRR', targetDate: new Date(2026, 5, 1), status: 'pending' },
      { title: 'Hire first employee', targetDate: new Date(2026, 8, 1), status: 'pending' },
    ],
  },
  threeYear: {
    vision: 'SISO is a profitable SaaS company with a small remote team, serving thousands of users globally',
    keyAchievements: [
      'SISO generating $500K+ ARR',
      'Team of 3-5 people',
      'Financially independent',
      'Marathon completed',
    ],
  },
  fiveYear: {
    roadmap: [
      { year: 2026, goals: ['$10K MRR', 'First hire', 'Product-market fit'], metrics: ['500 users', '$120K ARR'] },
      { year: 2027, goals: ['$50K MRR', 'Team of 3', 'First acquisition'], metrics: ['2K users', '$600K ARR'] },
      { year: 2028, goals: ['$100K MRR', 'Profitable', 'International expansion'], metrics: ['5K users', '$1.2M ARR'] },
      { year: 2029, goals: ['Financial independence', 'Team of 5', 'Second product'], metrics: ['10K users', '$2M ARR'] },
      { year: 2030, goals: ['Life optionality', 'Legacy building', 'Mentoring others'], metrics: ['20K users', '$5M ARR'] },
    ],
  },
  tenYear: {
    ultimateVision: 'Leading a profitable tech company that helps millions live better lives, financially free, physically fit, and leaving a lasting legacy',
    legacyGoals: [
      'Built a company that outlives me',
      'Mentored 100+ entrepreneurs',
      'Financially free family for generations',
      'Written a book that inspires thousands',
    ],
    lifeState: 'Operating from a place of abundance, freedom, and purpose - helping others achieve the same',
  },
};

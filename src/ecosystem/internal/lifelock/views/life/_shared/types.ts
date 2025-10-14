/**
 * Life View Shared Types
 */

export interface CoreValue {
  value: string;
  description: string;
  importance: number; // 1-10
}

export interface FiveYearVision {
  career: string;
  health: string;
  financial: string;
  relationships: string;
  personal: string;
}

export interface LifeVisionData {
  missionStatement: string;
  coreValues: CoreValue[];
  fiveYearVision: FiveYearVision;
  lifePhilosophy: string;
}

export interface LifeGoal {
  id: string;
  title: string;
  category: 'health' | 'career' | 'financial' | 'relationships' | 'personal';
  target: string;
  currentProgress: number;
  targetValue: number;
  deadline?: Date;
  milestones: Array<{
    title: string;
    completed: boolean;
    completedDate?: Date;
  }>;
}

export interface LifetimeStats {
  totalDaysTracked: number;
  lifetimeXP: number;
  bestDay: {
    date: Date;
    grade: string;
    xp: number;
  };
  longestStreak: number;
  totalWorkouts: number;
  totalDeepWorkHours: number;
  totalTasksCompleted: number;
  perfectDays: number;
}

export interface AllTimeBests {
  longestStreak: number;
  mostXPInDay: number;
  mostXPInWeek: number;
  mostXPInMonth: number;
  bestYear: {
    year: number;
    totalXP: number;
    averageGrade: string;
  };
}

export interface FinancialLegacy {
  totalRevenue: number;
  totalSaved: number;
  totalInvested: number;
  netWorth: number;
}

export interface ImpactMetrics {
  projectsShipped: number;
  clientsHelped: number;
  peopleMentored: number;
  contentCreated: number;
}

export interface LifeEvent {
  date: Date;
  title: string;
  description: string;
  type: 'career' | 'personal' | 'health' | 'financial';
  importance: number; // 1-10
}

export interface YearTimelineData {
  year: number;
  highlights: string[];
  majorEvents: LifeEvent[];
  chapter?: {
    title: string;
    description: string;
    startDate: Date;
    endDate?: Date;
  };
}

export interface LifeBalanceScores {
  health: number;
  career: number;
  financial: number;
  relationships: number;
  personal: number;
  overall: number;
}

export interface LifeReview {
  date: Date;
  type: 'quarterly' | 'annual';
  satisfactionScore: number;
  reflections: string;
  courseCorrections: string[];
  priorities: string[];
}

export interface LifePlanning {
  oneYear: {
    focus: string;
    priorities: string[];
    milestones: Array<{
      title: string;
      targetDate: Date;
      status: 'pending' | 'in-progress' | 'completed';
    }>;
  };
  threeYear: {
    vision: string;
    keyAchievements: string[];
  };
  fiveYear: {
    roadmap: Array<{
      year: number;
      goals: string[];
      metrics: string[];
    }>;
  };
  tenYear: {
    ultimateVision: string;
    legacyGoals: string[];
    lifeState: string;
  };
}

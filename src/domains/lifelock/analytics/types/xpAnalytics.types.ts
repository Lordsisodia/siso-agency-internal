/**
 * XP Analytics - Type Definitions
 *
 * Complete type system for XP analytics dashboard including:
 * - Daily, weekly, monthly breakdowns
 * - Category analysis with trends
 * - Personal bests and streaks
 * - Productivity patterns
 * - Achievement tracking
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Category breakdown with trend data
 */
export interface XPBreakdown {
  total: number;
  percent: number;
  trend: number; // Percentage change from previous period
  icon: string;
  color: string;
}

/**
 * Trend direction indicator
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * XP category types
 */
export type XPCategory = 'tasks' | 'wellness' | 'morning' | 'focus' | 'habits';

/**
 * Activity session record
 */
export interface XPSession {
  id: string;
  timestamp: Date;
  activityId: string;
  activityName: string;
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  category: XPCategory;
  level: number;
  multipliers: Record<string, number>;
}

// ============================================================================
// DAILY XP DATA
// ============================================================================

/**
 * Today's XP progress
 */
export interface TodayXPData {
  total: number;
  goal: number;
  progress: number; // 0-100
  remaining: number;
  categories: Record<XPCategory, XPBreakdown>;
  sessions: number; // Number of XP-earning sessions today
  peakHour: number; // 0-23 - most productive hour
  trend: {
    yesterday: number;
    difference: number;
    percentChange: number;
  };
}

// ============================================================================
// WEEKLY XP DATA
// ============================================================================

/**
 * Single day breakdown for weekly view
 */
export interface DailyBreakdown {
  date: string;
  dayName: string;
  xp: number;
  goal: number;
  completed: boolean;
  categories: Record<XPCategory, number>;
}

/**
 * Weekly XP summary
 */
export interface WeeklyXPData {
  total: number;
  average: number;
  target: number;
  progress: number; // 0-100
  bestDay: {
    date: string;
    dayName: string;
    xp: number;
  };
  worstDay: {
    date: string;
    dayName: string;
    xp: number;
  };
  dailyBreakdown: DailyBreakdown[];
  trend: TrendDirection;
  trendPercent: number;
  comparisonWithLastWeek: {
    thisWeek: number;
    lastWeek: number;
    difference: number;
    percentChange: number;
  };
}

// ============================================================================
// MONTHLY XP DATA
// ============================================================================

/**
 * Weekly breakdown for monthly view
 */
export interface WeeklyBreakdown {
  week: string;
  startDate: string;
  endDate: string;
  xp: number;
  average: number;
  bestDay: number;
  worstDay: number;
}

/**
 * Monthly XP summary
 */
export interface MonthlyXPData {
  total: number;
  average: number;
  target: number;
  daysCompleted: number;
  totalDays: number;
  bestDay: {
    date: string;
    xp: number;
    dayName: string;
  };
  worstDay: {
    date: string;
    xp: number;
    dayName: string;
  };
  weeklyBreakdown: WeeklyBreakdown[];
  trend: TrendDirection;
  trendPercent: number;
  comparisonWithLastMonth: {
    thisMonth: number;
    lastMonth: number;
    difference: number;
    percentChange: number;
  };
  daysHitGoal: number;
  goalHitPercent: number;
}

// ============================================================================
// PERSONAL BESTS
// ============================================================================

/**
 * Personal best records
 */
export interface PersonalBests {
  day: {
    xp: number;
    date: string;
    dateFormatted: string;
    dayName: string;
  };
  week: {
    xp: number;
    startDate: string;
    endDate: string;
    formatted: string;
  };
  month: {
    xp: number;
    month: string;
    year: number;
    formatted: string;
  };
  total: {
    xp: number;
    sinceDate: string;
    sinceFormatted: string;
  };
}

// ============================================================================
// STREAK DATA
// ============================================================================

/**
 * Calendar day data
 */
export interface CalendarDay {
  date: string;
  completed: boolean;
  xp: number;
  isToday: boolean;
  isPast: boolean;
}

/**
 * Streak information
 */
export interface StreakData {
  current: number;
  best: number;
  bestPeriod: {
    startDate: string;
    endDate: string;
    formatted: string;
  };
  calendarData: CalendarDay[];
  todayCompleted: boolean;
  canExtend: boolean;
  daysInRow: number;
}

// ============================================================================
// TREND DATA
// ============================================================================

/**
 * Single trend data point
 */
export interface TrendPoint {
  date: string;
  xp: number;
  goal?: number;
  level?: number;
  dayName?: string;
}

/**
 * 30-day trend analysis
 */
export interface TrendData {
  points: TrendPoint[];
  average: number;
  maximum: number;
  minimum: number;
  trend: TrendDirection;
  trendPercent: number;
  comparisonWithPrevious: {
    current30Days: number;
    previous30Days: number;
    difference: number;
    percentChange: number;
  };
  rollingAverage: number[];
  bestStreakInPeriod: number;
}

// ============================================================================
// PRODUCTIVITY DATA
// ============================================================================

/**
 * Hourly productivity data
 */
export interface HourlyProductivity {
  hour: number; // 0-23
  xp: number;
  sessions: number;
  label: string; // "6am - 9am"
  percentOfTotal: number;
  isPeak: boolean;
}

/**
 * Peak productivity analysis
 */
export interface PeakProductivityData {
  hourly: HourlyProductivity[];
  bestPeriod: {
    start: number;
    end: number;
    label: string;
    xp: number;
    sessions: number;
  };
  totalXP: number;
  totalSessions: number;
  averageXPPerSession: number;
}

// ============================================================================
// ACHIEVEMENT DATA
// ============================================================================

/**
 * Achievement category
 */
export type AchievementCategory = 'streak' | 'points' | 'completion' | 'consistency';

/**
 * Achievement summary
 */
export interface AchievementSummary {
  id: string;
  name: string;
  badge: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Achievements collection
 */
export interface AchievementsData {
  recent: AchievementSummary[];
  totalUnlocked: number;
  totalAvailable: number;
  completionPercent: number;
  nextToUnlock: AchievementSummary[];
}

// ============================================================================
// LEVEL DATA
// ============================================================================

/**
 * Level progress
 */
export interface LevelProgress {
  current: number;
  next: number;
  currentXP: number;
  totalXP: number;
  xpToNext: number;
  xpForNextLevel: number;
  progress: number; // 0-100
  levelsGainedThisMonth: number;
  estimatedDaysToNextLevel: number;
}

// ============================================================================
// COMPLETE ANALYTICS DATA
// ============================================================================

/**
 * Complete XP analytics data
 */
export interface XPAnalyticsData {
  today: TodayXPData;
  week: WeeklyXPData;
  month: MonthlyXPData;
  personalBests: PersonalBests;
  streaks: StreakData;
  trend: TrendData;
  peakProductivity: PeakProductivityData;
  achievements: AchievementsData;
  level: LevelProgress;
  lastUpdated: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Analytics request options
 */
export interface AnalyticsRequestOptions {
  userId: string;
  date?: string; // YYYY-MM-DD format
  weekStart?: string; // YYYY-MM-DD format
  month?: string; // YYYY-MM format
  trendDays?: number; // Default 30
}

/**
 * API response wrapper
 */
export interface AnalyticsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// DATABASE TYPES (Supabase)
// ============================================================================

/**
 * Daily XP stats record (from Supabase)
 */
export interface DailyXPStatsRecord {
  id: string;
  user_id: string;
  date: string;
  total_xp: number;
  activities_completed: number;
  streak_count: number;
  level_at_day: number;
  category_breakdown: Record<string, number>;
  achievements_unlocked: string[];
  source_breakdown?: Record<string, any>;
  session_count?: number;
  peak_productivity_hour?: number;
  bonus_xp?: number;
  base_xp?: number;
  goal_xp?: number;
  created_at: string;
  updated_at: string;
}

/**
 * XP summary record (from Supabase)
 */
export interface XPSummaryRecord {
  id: string;
  user_id: string;
  period_type: 'week' | 'month' | 'year';
  period_start: string;
  period_end: string;
  total_xp: number;
  base_xp: number;
  bonus_xp: number;
  daily_average: number;
  best_day: string;
  best_day_xp: number;
  worst_day: string;
  worst_day_xp: number;
  category_breakdown: Record<string, number>;
  achievements_unlocked: string[];
  streak_days: number;
  longest_streak_in_period: number;
  level_start: number;
  level_end: number;
  goal_xp: number;
  goal_progress: number;
  total_sessions: number;
  avg_sessions_per_day: number;
  peak_productivity_hour: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hourly XP stats record (from Supabase)
 */
export interface HourlyXPStatsRecord {
  id: string;
  user_id: string;
  date: string;
  hour: number;
  xp_earned: number;
  sessions: number;
  sources: Record<string, number>;
  created_at: string;
}

/**
 * XP session record (from Supabase)
 */
export interface XPSessionRecord {
  id: string;
  user_id: string;
  session_date: string;
  session_hour: number;
  activity_id: string;
  activity_name: string;
  base_xp: number;
  bonus_xp: number;
  total_xp: number;
  multipliers: Record<string, number>;
  category: string;
  source_type: string;
  source_id?: string;
  level_at_time: number;
  created_at: string;
}

/**
 * XP goal record (from Supabase)
 */
export interface XPGoalRecord {
  id: string;
  user_id: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_xp: number;
  start_date: string;
  end_date?: string;
  current_xp: number;
  progress_percent: number;
  completed: boolean;
  completed_at?: string;
  reward_unlocked: boolean;
  reward_xp: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COLOR SCHEME TYPES
// ============================================================================

/**
 * XP category color configuration
 */
export interface XPCategoryColors {
  primary: string;
  gradient: string;
  bg: string;
  text: string;
  border: string;
}

/**
 * Complete color scheme
 */
export interface XPAnalyticsColors {
  categories: Record<XPCategory, XPCategoryColors>;
  success: string;
  warning: string;
  danger: string;
  neutral: string;
  gradients: {
    primary: string;
    gold: string;
    streak: string;
  };
}

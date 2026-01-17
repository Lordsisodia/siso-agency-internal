/**
 * XP Analytics Service
 *
 * Complete service layer for XP analytics including:
 * - Data fetching from Supabase
 * - Calculations for aggregations
 * - Trend analysis
 * - Productivity patterns
 */

import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, differenceInDays, differenceInWeeks } from 'date-fns';
import { supabaseAnon as supabase } from '@/lib/supabase-clerk';
import type {
  XPAnalyticsData,
  TodayXPData,
  WeeklyXPData,
  MonthlyXPData,
  PersonalBests,
  StreakData,
  TrendData,
  PeakProductivityData,
  AchievementsData,
  LevelProgress,
  DailyXPStatsRecord,
  XPSummaryRecord,
  HourlyXPStatsRecord,
  XPSessionRecord,
  XPGoalRecord,
  XPCategory,
  XPBreakdown,
  TrendDirection,
  DailyBreakdown,
  WeeklyBreakdown,
  CalendarDay,
  TrendPoint,
  HourlyProductivity,
  AchievementSummary,
} from '../types/xpAnalytics.types';

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const XP_COLORS: Record<XPCategory, { primary: string; gradient: string; bg: string; text: string; icon: string }> = {
  tasks: { primary: '#3B82F6', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: '📋' },
  wellness: { primary: '#F43F5E', gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-500/10', text: 'text-rose-400', icon: '💪' },
  morning: { primary: '#F59E0B', gradient: 'from-orange-500 to-amber-400', bg: 'bg-orange-500/10', text: 'text-orange-400', icon: '🌅' },
  focus: { primary: '#8B5CF6', gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-500/10', text: 'text-violet-400', icon: '🧠' },
  habits: { primary: '#10B981', gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '✨' },
} as const;

// ============================================================================
// XP ANALYTICS SERVICE CLASS
// ============================================================================

export class XPAnalyticsService {
  // ============================================================================
  // MAIN ENTRY POINT
  // ============================================================================

  /**
   * Get complete XP analytics data
   */
  static async getAnalytics(userId: string, date: Date = new Date()): Promise<XPAnalyticsData> {
    try {
      const [
        today,
        week,
        month,
        personalBests,
        streaks,
        trend,
        peakProductivity,
        achievements,
        level,
      ] = await Promise.all([
        this.getTodayData(userId, date),
        this.getWeeklyData(userId, date),
        this.getMonthlyData(userId, date),
        this.getPersonalBests(userId),
        this.getStreaks(userId, date),
        this.getTrendData(userId, 30, date),
        this.getPeakProductivity(userId, date),
        this.getAchievements(userId),
        this.getLevelProgress(userId),
      ]);

      return {
        today,
        week,
        month,
        personalBests,
        streaks,
        trend,
        peakProductivity,
        achievements,
        level,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching XP analytics:', error);
      throw error;
    }
  }

  // ============================================================================
  // TODAY'S DATA
  // ============================================================================

  /**
   * Get today's XP data
   */
  static async getTodayData(userId: string, date: Date = new Date()): Promise<TodayXPData> {
    const today = format(date, 'yyyy-MM-dd');
    const yesterday = format(subDays(date, 1), 'yyyy-MM-dd');

    // Fetch today and yesterday's stats
    const { data: todayStats, error: todayError } = await supabase
      .from('daily_xp_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    const { data: yesterdayStats } = await supabase
      .from('daily_xp_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .eq('date', yesterday)
      .maybeSingle();

    if (todayError) {
      console.error('Error fetching today stats:', todayError);
    }

    const total = todayStats?.total_xp || 0;
    const yesterdayTotal = yesterdayStats?.total_xp || 0;
    const goal = todayStats?.goal_xp || 500;

    // Calculate category breakdown
    const categoryBreakdown = todayStats?.category_breakdown || {};
    const categories = this.buildCategoryBreakdown(categoryBreakdown, total);

    // Skip hourly_xp_stats query (table doesn't exist) - use defaults
    const peakHour = 9; // Default morning
    const sessions = todayStats?.activities_completed || 0; // Use activities_completed as fallback

    // Calculate trend
    const difference = total - yesterdayTotal;
    const percentChange = yesterdayTotal > 0 ? (difference / yesterdayTotal) * 100 : 0;

    return {
      total,
      goal,
      progress: Math.min(100, Math.max(0, (total / goal) * 100)),
      remaining: Math.max(0, goal - total),
      categories,
      sessions,
      peakHour,
      trend: {
        yesterday: yesterdayTotal,
        difference,
        percentChange,
      },
    };
  }

  // ============================================================================
  // WEEKLY DATA
  // ============================================================================

  /**
   * Get weekly XP data
   */
  static async getWeeklyData(userId: string, date: Date = new Date()): Promise<WeeklyXPData> {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const { data: weekStats, error } = await supabase
      .from('daily_xp_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly stats:', error);
    }

    // Build daily breakdown
    const dailyBreakdown: DailyBreakdown[] = (weekStats || []).map(stat => ({
      date: stat.date,
      dayName: format(new Date(stat.date), 'EEE'),
      xp: stat.total_xp,
      goal: stat.goal_xp || 500,
      completed: stat.total_xp >= (stat.goal_xp || 500),
      categories: stat.category_breakdown as Record<XPCategory, number>,
    }));

    // Fill in missing days
    const filledBreakdown = this.fillMissingDays(dailyBreakdown, weekStart, weekEnd);

    // Calculate totals
    const total = filledBreakdown.reduce((sum, day) => sum + day.xp, 0);
    const average = Math.round(total / 7);
    const target = 500 * 7; // 7 days * 500 XP goal
    const progress = Math.min(100, Math.max(0, (total / target) * 100));

    // Find best and worst days
    const completedDays = filledBreakdown.filter(d => d.xp > 0);
    const bestDay = completedDays.length > 0
      ? completedDays.reduce((best, day) => day.xp > best.xp ? day : best, completedDays[0])
      : { date: format(date, 'yyyy-MM-dd'), dayName: 'Today', xp: 0 };
    const worstDay = completedDays.length > 0
      ? completedDays.reduce((worst, day) => day.xp < worst.xp ? day : worst, completedDays[0])
      : { date: format(date, 'yyyy-MM-dd'), dayName: 'Today', xp: 0 };

    // Get last week's data for comparison
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekEnd, 7);
    const { data: lastWeekStats } = await supabase
      .from('daily_xp_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .gte('date', format(lastWeekStart, 'yyyy-MM-dd'))
      .lte('date', format(lastWeekEnd, 'yyyy-MM-dd'));

    const lastWeekTotal = lastWeekStats?.reduce((sum, s) => sum + s.total_xp, 0) || 0;
    const difference = total - lastWeekTotal;
    const percentChange = lastWeekTotal > 0 ? (difference / lastWeekTotal) * 100 : 0;

    const trend: TrendDirection = difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable';

    return {
      total,
      average,
      target,
      progress,
      bestDay: { date: bestDay.date, dayName: bestDay.dayName, xp: bestDay.xp },
      worstDay: { date: worstDay.date, dayName: worstDay.dayName, xp: worstDay.xp },
      dailyBreakdown: filledBreakdown,
      trend,
      trendPercent: Math.abs(percentChange),
      comparisonWithLastWeek: {
        thisWeek: total,
        lastWeek: lastWeekTotal,
        difference,
        percentChange,
      },
    };
  }

  // ============================================================================
  // MONTHLY DATA
  // ============================================================================

  /**
   * Get monthly XP data
   */
  static async getMonthlyData(userId: string, date: Date = new Date()): Promise<MonthlyXPData> {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const { data: monthStats, error } = await supabase
      .from('daily_xp_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching monthly stats:', error);
    }

    const stats = monthStats || [];
    const total = stats.reduce((sum, s) => sum + s.total_xp, 0);
    const totalDays = stats.length;
    const daysCompleted = stats.filter(s => s.total_xp > 0).length;
    const average = totalDays > 0 ? Math.round(total / totalDays) : 0;
    const target = 500 * totalDays;
    const goalHitPercent = stats.filter(s => s.total_xp >= 500).length / totalDays * 100;

    // Find best and worst days
    const daysWithXP = stats.filter(s => s.total_xp > 0);
    const bestDayStat = daysWithXP.length > 0
      ? daysWithXP.reduce((best, s) => s.total_xp > best.total_xp ? s : best, daysWithXP[0])
      : null;
    const worstDayStat = daysWithXP.length > 0
      ? daysWithXP.reduce((worst, s) => s.total_xp < worst.total_xp ? s : worst, daysWithXP[0])
      : null;

    // Build weekly breakdown
    const weeklyBreakdown = this.buildWeeklyBreakdown(stats, monthStart);

    // Get last month's data for comparison
    const lastMonthStart = subDays(monthStart, monthStart.getDate());
    const lastMonthEnd = subDays(monthEnd, monthEnd.getDate());
    const { data: lastMonthStats } = await supabase
      .from('daily_xp_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .gte('date', format(lastMonthStart, 'yyyy-MM-dd'))
      .lte('date', format(lastMonthEnd, 'yyyy-MM-dd'));

    const lastMonthTotal = lastMonthStats?.reduce((sum, s) => sum + s.total_xp, 0) || 0;
    const difference = total - lastMonthTotal;
    const percentChange = lastMonthTotal > 0 ? (difference / lastMonthTotal) * 100 : 0;

    const trend: TrendDirection = difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable';

    return {
      total,
      average,
      target,
      daysCompleted,
      totalDays,
      bestDay: bestDayStat
        ? { date: bestDayStat.date, xp: bestDayStat.total_xp, dayName: format(new Date(bestDayStat.date), 'EEE') }
        : { date: format(date, 'yyyy-MM-dd'), xp: 0, dayName: 'Today' },
      worstDay: worstDayStat
        ? { date: worstDayStat.date, xp: worstDayStat.total_xp, dayName: format(new Date(worstDayStat.date), 'EEE') }
        : { date: format(date, 'yyyy-MM-dd'), xp: 0, dayName: 'Today' },
      weeklyBreakdown,
      trend,
      trendPercent: Math.abs(percentChange),
      comparisonWithLastMonth: {
        thisMonth: total,
        lastMonth: lastMonthTotal,
        difference,
        percentChange,
      },
      daysHitGoal: stats.filter(s => s.total_xp >= 500).length,
      goalHitPercent,
    };
  }

  // ============================================================================
  // PERSONAL BESTS
  // ============================================================================

  /**
   * Get personal best records
   */
  static async getPersonalBests(userId: string): Promise<PersonalBests> {
    const { data: stats, error } = await supabase
      .from('daily_xp_stats')
      .select('date, total_xp')
      .eq('user_id', userId)
      .order('total_xp', { ascending: false })
      .limit(100);

    if (error || !stats?.length) {
      return this.getEmptyPersonalBests();
    }

    // Best day
    const bestDay = stats[0];

    // Calculate best week and month
    const weeklyTotals = this.calculateWeeklyTotals(stats);
    const monthlyTotals = this.calculateMonthlyTotals(stats);

    const bestWeek = weeklyTotals[0];
    const bestMonth = monthlyTotals[0];

    // Total all time
    const totalXP = stats.reduce((sum, s) => sum + s.total_xp, 0);
    const oldestDate = stats[stats.length - 1]?.date;

    return {
      day: {
        xp: bestDay.total_xp,
        date: bestDay.date,
        dateFormatted: format(new Date(bestDay.date), 'MMM d, yyyy'),
        dayName: format(new Date(bestDay.date), 'EEEE'),
      },
      week: {
        xp: bestWeek.total,
        startDate: bestWeek.startDate,
        endDate: bestWeek.endDate,
        formatted: `${format(new Date(bestWeek.startDate), 'MMM d')} - ${format(new Date(bestWeek.endDate), 'MMM d, yyyy')}`,
      },
      month: {
        xp: bestMonth.total,
        month: format(new Date(bestMonth.month), 'MMMM yyyy'),
        year: parseInt(format(new Date(bestMonth.month), 'yyyy')),
        formatted: format(new Date(bestMonth.month), 'MMMM yyyy'),
      },
      total: {
        xp: totalXP,
        sinceDate: oldestDate,
        sinceFormatted: format(new Date(oldestDate), 'MMM d, yyyy'),
      },
    };
  }

  // ============================================================================
  // STREAK DATA
  // ============================================================================

  /**
   * Get streak information
   */
  static async getStreaks(userId: string, date: Date = new Date()): Promise<StreakData> {
    const { data: progress } = await supabase
      .from('user_gamification_progress')
      .select('current_streak, best_streak')
      .eq('user_id', userId)
      .maybeSingle();

    const current = progress?.current_streak || 0;
    const best = progress?.best_streak || 0;

    // Get last 60 days of stats for calendar
    const startDate = subDays(date, 60);
    const { data: stats } = await supabase
      .from('daily_xp_stats')
      .select('date, total_xp')
      .eq('user_id', userId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(date, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    const todayStr = format(date, 'yyyy-MM-dd');
    const todayStat = stats?.find(s => s.date === todayStr);
    const todayCompleted = (todayStat?.total_xp || 0) >= 200; // Minimum XP for streak

    const calendarData: CalendarDay[] = [];
    const calendarDate = new Date(startDate);

    while (calendarDate <= date) {
      const dateStr = format(calendarDate, 'yyyy-MM-dd');
      const stat = stats?.find(s => s.date === dateStr);
      const completed = (stat?.total_xp || 0) >= 200;

      calendarData.push({
        date: dateStr,
        completed,
        xp: stat?.total_xp || 0,
        isToday: dateStr === todayStr,
        isPast: calendarDate < date,
      });

      calendarDate.setDate(calendarDate.getDate() + 1);
    }

    // Calculate best period
    const bestPeriod = this.calculateBestStreakPeriod(stats || []);

    return {
      current,
      best,
      bestPeriod,
      calendarData,
      todayCompleted,
      canExtend: !todayCompleted && current > 0,
      daysInRow: current,
    };
  }

  // ============================================================================
  // TREND DATA
  // ============================================================================

  /**
   * Get 30-day trend data
   */
  static async getTrendData(userId: string, days: number = 30, date: Date = new Date()): Promise<TrendData> {
    const startDate = subDays(date, days - 1);

    const { data: stats, error } = await supabase
      .from('daily_xp_stats')
      .select('date, total_xp, goal_xp, level_at_day')
      .eq('user_id', userId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(date, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error || !stats?.length) {
      return this.getEmptyTrendData();
    }

    // Build trend points
    const points: TrendPoint[] = stats.map(stat => ({
      date: stat.date,
      xp: stat.total_xp,
      goal: stat.goal_xp || 500,
      level: stat.level_at_day,
      dayName: format(new Date(stat.date), 'EEE'),
    }));

    // Calculate statistics
    const xpValues = stats.map(s => s.total_xp);
    const total = xpValues.reduce((sum, xp) => sum + xp, 0);
    const average = Math.round(total / stats.length);
    const maximum = Math.max(...xpValues);
    const minimum = Math.min(...xpValues);

    // Calculate rolling average (7-day)
    const rollingAverage = this.calculateRollingAverage(xpValues, 7);

    // Compare with previous period
    const previousStartDate = subDays(startDate, days);
    const previousEndDate = subDays(date, days);
    const { data: previousStats } = await supabase
      .from('daily_xp_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .gte('date', format(previousStartDate, 'yyyy-MM-dd'))
      .lte('date', format(previousEndDate, 'yyyy-MM-dd'));

    const previousTotal = previousStats?.reduce((sum, s) => sum + s.total_xp, 0) || 0;
    const difference = total - previousTotal;
    const percentChange = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

    const trend: TrendDirection = difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable';

    // Find best streak in period
    const bestStreakInPeriod = this.calculateLongestStreak(stats);

    return {
      points,
      average,
      maximum,
      minimum,
      trend,
      trendPercent: Math.abs(percentChange),
      comparisonWithPrevious: {
        current30Days: total,
        previous30Days: previousTotal,
        difference,
        percentChange,
      },
      rollingAverage,
      bestStreakInPeriod,
    };
  }

  // ============================================================================
  // PEAK PRODUCTIVITY
  // ============================================================================

  /**
   * Get peak productivity hours
   */
  static async getPeakProductivity(userId: string, date: Date = new Date()): Promise<PeakProductivityData> {
    // Skip hourly_xp_stats query (table doesn't exist) - return empty/default data
    return this.getEmptyPeakProductivity();
  }

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================

  /**
   * Get achievements data
   */
  static async getAchievements(userId: string): Promise<AchievementsData> {
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    if (error || !achievements?.length) {
      return {
        recent: [],
        totalUnlocked: 0,
        totalAvailable: 15, // Based on gamification service
        completionPercent: 0,
        nextToUnlock: [],
      };
    }

    const recent: AchievementSummary[] = achievements
      .filter(a => a.unlocked)
      .slice(0, 5)
      .map(a => ({
        id: a.achievement_id,
        name: a.achievement_name,
        badge: a.achievement_badge,
        description: '',
        unlocked: a.unlocked,
        unlockedAt: a.unlocked_at,
        progress: a.progress,
        maxProgress: a.max_progress,
        category: a.category as any,
        rarity: this.getAchievementRarity(a.achievement_id),
      }));

    const totalUnlocked = achievements.filter(a => a.unlocked).length;

    // Get next to unlock (in progress but not complete)
    const nextToUnlock = achievements
      .filter(a => !a.unlocked && a.progress > 0)
      .slice(0, 3)
      .map(a => ({
        id: a.achievement_id,
        name: a.achievement_name,
        badge: a.achievement_badge,
        description: '',
        unlocked: a.unlocked,
        progress: a.progress,
        maxProgress: a.max_progress,
        category: a.category as any,
        rarity: this.getAchievementRarity(a.achievement_id),
      }));

    return {
      recent,
      totalUnlocked,
      totalAvailable: 15,
      completionPercent: Math.round((totalUnlocked / 15) * 100),
      nextToUnlock,
    };
  }

  // ============================================================================
  // LEVEL PROGRESS
  // ============================================================================

  /**
   * Get level progress
   */
  static async getLevelProgress(userId: string): Promise<LevelProgress> {
    const { data: progress, error } = await supabase
      .from('user_gamification_progress')
      .select('current_level, total_xp')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !progress) {
      return {
        current: 1,
        next: 2,
        currentXP: 0,
        totalXP: 0,
        xpToNext: 1000,
        xpForNextLevel: 1000,
        progress: 0,
        levelsGainedThisMonth: 0,
        estimatedDaysToNextLevel: 0,
      };
    }

    const LEVEL_XP_THRESHOLD = 1000;
    const current = progress.current_level;
    const totalXP = progress.total_xp;
    const currentLevelXP = (current - 1) * LEVEL_XP_THRESHOLD;
    const xpToNext = totalXP - currentLevelXP;
    const xpForNextLevel = LEVEL_XP_THRESHOLD;
    const progressPercent = (xpToNext / xpForNextLevel) * 100;

    // Calculate levels gained this month
    const monthStart = startOfMonth(new Date());
    const { data: monthStats } = await supabase
      .from('daily_xp_stats')
      .select('level_at_day')
      .eq('user_id', userId)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .order('date', { ascending: true })
      .limit(1);

    const levelAtMonthStart = monthStats?.[0]?.level_at_day || current;
    const levelsGainedThisMonth = Math.max(0, current - levelAtMonthStart);

    // Estimate days to next level based on recent average
    const { data: recentStats } = await supabase
      .from('daily_xp_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7);

    const recentAverage = recentStats
      ? Math.round(recentStats.reduce((sum, s) => sum + s.total_xp, 0) / recentStats.length)
      : 0;

    const remainingXP = xpForNextLevel - xpToNext;
    const estimatedDaysToNextLevel = recentAverage > 0 ? Math.ceil(remainingXP / recentAverage) : 0;

    return {
      current,
      next: current + 1,
      currentXP: xpToNext,
      totalXP,
      xpToNext: remainingXP,
      xpForNextLevel,
      progress: Math.min(100, Math.max(0, progressPercent)),
      levelsGainedThisMonth,
      estimatedDaysToNextLevel,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static buildCategoryBreakdown(breakdown: Record<string, number>, total: number): Record<XPCategory, XPBreakdown> {
    const categories: XPCategory[] = ['tasks', 'wellness', 'morning', 'focus', 'habits'];
    const result: Record<XPCategory, XPBreakdown> = {} as any;

    categories.forEach(cat => {
      const catTotal = breakdown[cat] || 0;
      result[cat] = {
        total: catTotal,
        percent: total > 0 ? Math.round((catTotal / total) * 100) : 0,
        trend: 0, // Would need previous period data
        ...XP_COLORS[cat],
      };
    });

    return result;
  }

  private static fillMissingDays(days: DailyBreakdown[], weekStart: Date, weekEnd: Date): DailyBreakdown[] {
    const result: DailyBreakdown[] = [];
    const currentDate = new Date(weekStart);

    while (currentDate <= weekEnd) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const existing = days.find(d => d.date === dateStr);

      result.push(existing || {
        date: dateStr,
        dayName: format(currentDate, 'EEE'),
        xp: 0,
        goal: 500,
        completed: false,
        categories: { tasks: 0, wellness: 0, morning: 0, focus: 0, habits: 0 },
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  private static buildWeeklyBreakdown(stats: DailyXPStatsRecord[], monthStart: Date): WeeklyBreakdown[] {
    const weeks: WeeklyBreakdown[] = [];
    let currentWeek: DailyXPStatsRecord[] = [];
    let weekNumber = 1;

    stats.forEach((stat, index) => {
      currentWeek.push(stat);

      // Check if we should end the week (Sunday or last day)
      const date = new Date(stat.date);
      const isSunday = date.getDay() === 0;
      const isLastDay = index === stats.length - 1;

      if (isSunday || isLastDay) {
        const weekXP = currentWeek.reduce((sum, s) => sum + s.total_xp, 0);
        const weekAvg = Math.round(weekXP / currentWeek.length);
        const weekBest = Math.max(...currentWeek.map(s => s.total_xp));
        const weekWorst = Math.min(...currentWeek.map(s => s.total_xp));

        weeks.push({
          week: `Week ${weekNumber}`,
          startDate: currentWeek[0].date,
          endDate: currentWeek[currentWeek.length - 1].date,
          xp: weekXP,
          average: weekAvg,
          bestDay: weekBest,
          worstDay: weekWorst,
        });

        currentWeek = [];
        weekNumber++;
      }
    });

    return weeks;
  }

  private static calculateWeeklyTotals(stats: DailyXPStatsRecord[]): Array<{ total: number; startDate: string; endDate: string }> {
    // Group by week and calculate totals
    const weeklyMap = new Map<string, number>();

    stats.forEach(stat => {
      const date = new Date(stat.date);
      const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      weeklyMap.set(weekStart, (weeklyMap.get(weekStart) || 0) + stat.total_xp);
    });

    return Array.from(weeklyMap.entries()).map(([weekStart, total]) => ({
      total,
      startDate: weekStart,
      endDate: format(new Date(weekStart), 'yyyy-MM-dd'), // Simplified
    })).sort((a, b) => b.total - a.total);
  }

  private static calculateMonthlyTotals(stats: DailyXPStatsRecord[]): Array<{ total: number; month: string }> {
    const monthlyMap = new Map<string, number>();

    stats.forEach(stat => {
      const month = format(new Date(stat.date), 'yyyy-MM');
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + stat.total_xp);
    });

    return Array.from(monthlyMap.entries()).map(([month, total]) => ({
      total,
      month,
    })).sort((a, b) => b.total - a.total);
  }

  private static calculateBestStreakPeriod(stats: DailyXPStatsRecord[]): { startDate: string; endDate: string; formatted: string } {
    // Find longest consecutive streak
    let bestStreak = 0;
    let bestStart = '';
    let bestEnd = '';
    let currentStreak = 0;
    let currentStart = '';

    stats.forEach((stat, index) => {
      const completed = stat.total_xp >= 200;

      if (completed) {
        if (currentStreak === 0) {
          currentStart = stat.date;
        }
        currentStreak++;

        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          bestStart = currentStart;
          bestEnd = stat.date;
        }
      } else {
        currentStreak = 0;
      }
    });

    return {
      startDate: bestStart,
      endDate: bestEnd,
      formatted: bestStart ? `${format(new Date(bestStart), 'MMM d')} - ${format(new Date(bestEnd), 'MMM d, yyyy')}` : 'No streak',
    };
  }

  private static calculateRollingAverage(values: number[], window: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = values.slice(start, i + 1);
      const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
      result.push(Math.round(avg));
    }

    return result;
  }

  private static calculateLongestStreak(stats: DailyXPStatsRecord[]): number {
    let longestStreak = 0;
    let currentStreak = 0;

    stats.forEach(stat => {
      if (stat.total_xp >= 200) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return longestStreak;
  }

  private static findBestProductivityPeriod(hourlyMap: Map<number, { xp: number; sessions: number }>): {
    start: number;
    end: number;
    label: string;
    xp: number;
    sessions: number;
  } {
    let bestXP = 0;
    let bestStart = 0;
    let bestEnd = 2;
    let bestSessions = 0;

    for (let start = 0; start <= 21; start++) {
      const end = start + 2;
      let periodXP = 0;
      let periodSessions = 0;

      for (let h = start; h <= end; h++) {
        const data = hourlyMap.get(h);
        if (data) {
          periodXP += data.xp;
          periodSessions += data.sessions;
        }
      }

      if (periodXP > bestXP) {
        bestXP = periodXP;
        bestStart = start;
        bestEnd = end;
        bestSessions = periodSessions;
      }
    }

    return {
      start: bestStart,
      end: bestEnd,
      label: `${this.getHourLabel(bestStart)} - ${this.getHourLabel(bestEnd)}`,
      xp: bestXP,
      sessions: bestSessions,
    };
  }

  private static getHourLabel(hour: number): string {
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  }

  private static getAchievementRarity(id: string): 'common' | 'rare' | 'epic' | 'legendary' {
    if (id.includes('100')) return 'legendary';
    if (id.includes('50') || id.includes('30')) return 'epic';
    if (id.includes('10') || id.includes('7')) return 'rare';
    return 'common';
  }

  private static getEmptyPersonalBests(): PersonalBests {
    return {
      day: { xp: 0, date: format(new Date(), 'yyyy-MM-dd'), dateFormatted: 'Today', dayName: 'Today' },
      week: { xp: 0, startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), formatted: 'This week' },
      month: { xp: 0, month: format(new Date(), 'MMMM yyyy'), year: new Date().getFullYear(), formatted: format(new Date(), 'MMMM yyyy') },
      total: { xp: 0, sinceDate: format(new Date(), 'yyyy-MM-dd'), sinceFormatted: 'Today' },
    };
  }

  private static getEmptyTrendData(): TrendData {
    return {
      points: [],
      average: 0,
      maximum: 0,
      minimum: 0,
      trend: 'stable',
      trendPercent: 0,
      comparisonWithPrevious: { current30Days: 0, previous30Days: 0, difference: 0, percentChange: 0 },
      rollingAverage: [],
      bestStreakInPeriod: 0,
    };
  }

  private static getEmptyPeakProductivity(): PeakProductivityData {
    return {
      hourly: [],
      bestPeriod: { start: 9, end: 11, label: '9am - 11am', xp: 0, sessions: 0 },
      totalXP: 0,
      totalSessions: 0,
      averageXPPerSession: 0,
    };
  }
}

export const xpAnalyticsService = XPAnalyticsService;

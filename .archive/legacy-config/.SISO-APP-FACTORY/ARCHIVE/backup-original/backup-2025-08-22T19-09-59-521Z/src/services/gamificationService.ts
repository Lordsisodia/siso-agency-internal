/**
 * Gamification Service - XP Points, Badges, Streaks & Achievements
 * Transforms daily productivity into an engaging game-like experience
 */

export interface XPActivity {
  id: string;
  name: string;
  basePoints: number;
  category: 'routine' | 'task' | 'health' | 'focus' | 'habit';
  multiplier?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge: string;
  requirement: number;
  category: 'streak' | 'points' | 'completion' | 'consistency';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface DailyStats {
  date: string;
  totalXP: number;
  activitiesCompleted: number;
  streakCount: number;
  level: number;
  achievements: string[];
  categories: {
    routine: number;
    task: number;
    health: number;
    focus: number;
    habit: number;
  };
}

export interface UserProgress {
  currentLevel: number;
  totalXP: number;
  dailyXP: number;
  currentStreak: number;
  bestStreak: number;
  achievements: Achievement[];
  dailyStats: Record<string, DailyStats>;
  weeklyChallenge?: WeeklyChallenge;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

export class GamificationService {
  private static readonly STORAGE_KEY = 'siso_gamification_data';
  private static readonly LEVEL_XP_THRESHOLD = 1000; // XP needed per level

  // XP Activities Configuration
  private static readonly XP_ACTIVITIES: XPActivity[] = [
    // Morning Routine (50-100 XP)
    { id: 'wake_up_tracked', name: 'Wake Up Time Tracked', basePoints: 50, category: 'routine' },
    { id: 'morning_routine_complete', name: 'Morning Routine Complete', basePoints: 100, category: 'routine' },
    { id: 'daily_quote_read', name: 'Daily Quote Read', basePoints: 25, category: 'routine' },
    
    // Tasks (20-150 XP)
    { id: 'light_task_complete', name: 'Light Task Complete', basePoints: 20, category: 'task' },
    { id: 'deep_task_complete', name: 'Deep Task Complete', basePoints: 75, category: 'task' },
    { id: 'critical_task_complete', name: 'Critical Task Complete', basePoints: 150, category: 'task' },
    { id: 'all_tasks_complete', name: 'All Daily Tasks Complete', basePoints: 200, category: 'task' },
    
    // Health & Fitness (30-80 XP)
    { id: 'workout_complete', name: 'Workout Complete', basePoints: 80, category: 'health' },
    { id: 'water_goal_met', name: 'Water Goal Met', basePoints: 30, category: 'health' },
    { id: 'healthy_meal', name: 'Healthy Meal Logged', basePoints: 40, category: 'health' },
    
    // Focus & Deep Work (40-120 XP)
    { id: 'deep_work_session', name: 'Deep Work Session (25min)', basePoints: 60, category: 'focus' },
    { id: 'no_phone_hour', name: 'Phone-Free Hour', basePoints: 40, category: 'focus' },
    { id: 'flow_state', name: 'Flow State Achieved', basePoints: 120, category: 'focus' },
    
    // Habits (25-100 XP)
    { id: 'habit_chain_complete', name: 'Habit Chain Complete', basePoints: 100, category: 'habit' },
    { id: 'reflection_complete', name: 'Daily Reflection Complete', basePoints: 50, category: 'habit' },
    { id: 'gratitude_practice', name: 'Gratitude Practice', basePoints: 35, category: 'habit' },
  ];

  // Achievement Definitions
  private static readonly ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    // Streak Achievements
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', badge: '🔥', requirement: 7, category: 'streak', maxProgress: 7 },
    { id: 'streak_30', name: 'Month Master', description: '30-day streak', badge: '💎', requirement: 30, category: 'streak', maxProgress: 30 },
    { id: 'streak_100', name: 'Century Sage', description: '100-day streak', badge: '👑', requirement: 100, category: 'streak', maxProgress: 100 },
    
    // XP Achievements
    { id: 'xp_1000', name: 'Rising Star', description: '1,000 total XP', badge: '⭐', requirement: 1000, category: 'points', maxProgress: 1000 },
    { id: 'xp_10000', name: 'Power Player', description: '10,000 total XP', badge: '🚀', requirement: 10000, category: 'points', maxProgress: 10000 },
    { id: 'xp_50000', name: 'Legend', description: '50,000 total XP', badge: '🏆', requirement: 50000, category: 'points', maxProgress: 50000 },
    
    // Completion Achievements
    { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all sections in one day', badge: '✨', requirement: 1, category: 'completion', maxProgress: 1 },
    { id: 'perfect_week', name: 'Perfect Week', description: '7 perfect days in a row', badge: '🌟', requirement: 7, category: 'completion', maxProgress: 7 },
    { id: 'task_master', name: 'Task Master', description: 'Complete 100 tasks', badge: '📋', requirement: 100, category: 'completion', maxProgress: 100 },
    
    // Consistency Achievements
    { id: 'early_bird', name: 'Early Bird', description: 'Track wake-up time 30 days', badge: '🐦', requirement: 30, category: 'consistency', maxProgress: 30 },
    { id: 'deep_thinker', name: 'Deep Thinker', description: '50 deep work sessions', badge: '🧠', requirement: 50, category: 'consistency', maxProgress: 50 },
    { id: 'wellness_warrior', name: 'Wellness Warrior', description: '30 workouts completed', badge: '💪', requirement: 30, category: 'consistency', maxProgress: 30 },
  ];

  /**
   * Get current user progress data
   */
  public static getUserProgress(): UserProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure achievements have proper structure
      data.achievements = data.achievements?.map((a: any) => ({
        ...a,
        progress: a.progress || 0,
        maxProgress: a.maxProgress || 1
      })) || this.initializeAchievements();
      return data;
    }

    return {
      currentLevel: 1,
      totalXP: 0,
      dailyXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: this.initializeAchievements(),
      dailyStats: {},
      weeklyChallenge: this.generateWeeklyChallenge()
    };
  }

  /**
   * Award XP for completing an activity
   */
  public static awardXP(activityId: string, multiplier: number = 1): number {
    const activity = this.XP_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return 0;

    const points = Math.round(activity.basePoints * multiplier);
    const progress = this.getUserProgress();
    const today = new Date().toISOString().split('T')[0];

    // Update daily XP
    progress.dailyXP += points;
    progress.totalXP += points;

    // Update daily stats
    if (!progress.dailyStats[today]) {
      progress.dailyStats[today] = {
        date: today,
        totalXP: 0,
        activitiesCompleted: 0,
        streakCount: progress.currentStreak,
        level: progress.currentLevel,
        achievements: [],
        categories: { routine: 0, task: 0, health: 0, focus: 0, habit: 0 }
      };
    }

    progress.dailyStats[today].totalXP += points;
    progress.dailyStats[today].activitiesCompleted++;
    progress.dailyStats[today].categories[activity.category] += points;

    // Check for level up
    const newLevel = Math.floor(progress.totalXP / this.LEVEL_XP_THRESHOLD) + 1;
    if (newLevel > progress.currentLevel) {
      progress.currentLevel = newLevel;
      this.triggerLevelUpNotification(newLevel);
    }

    // Check achievements
    this.checkAchievements(progress);

    // Save progress
    this.saveUserProgress(progress);

    return points;
  }

  /**
   * Update streak based on daily completion
   */
  public static updateStreak(completed: boolean): void {
    const progress = this.getUserProgress();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (completed) {
      // Check if yesterday was completed to continue streak
      const yesterdayStats = progress.dailyStats[yesterday];
      const yesterdayCompleted = yesterdayStats && yesterdayStats.totalXP > 200; // Minimum XP for streak

      if (yesterdayCompleted || progress.currentStreak === 0) {
        progress.currentStreak++;
        if (progress.currentStreak > progress.bestStreak) {
          progress.bestStreak = progress.currentStreak;
        }
      } else {
        progress.currentStreak = 1; // Reset but start new streak
      }
    } else {
      progress.currentStreak = 0;
    }

    // Update today's stats
    if (progress.dailyStats[today]) {
      progress.dailyStats[today].streakCount = progress.currentStreak;
    }

    this.checkAchievements(progress);
    this.saveUserProgress(progress);
  }

  /**
   * Get daily XP breakdown
   */
  public static getDailyXPBreakdown(date: Date = new Date()): DailyStats | null {
    const progress = this.getUserProgress();
    const dateKey = date.toISOString().split('T')[0];
    return progress.dailyStats[dateKey] || null;
  }

  /**
   * Get current level info
   */
  public static getLevelInfo(): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
    const progress = this.getUserProgress();
    const currentLevelXP = (progress.currentLevel - 1) * this.LEVEL_XP_THRESHOLD;
    const nextLevelXP = progress.currentLevel * this.LEVEL_XP_THRESHOLD;
    const currentXP = progress.totalXP - currentLevelXP;
    const progressPercent = (currentXP / this.LEVEL_XP_THRESHOLD) * 100;

    return {
      level: progress.currentLevel,
      currentXP,
      nextLevelXP: this.LEVEL_XP_THRESHOLD,
      progress: Math.min(100, progressPercent)
    };
  }

  /**
   * Reset daily XP (call at start of new day)
   */
  public static resetDailyXP(): void {
    const progress = this.getUserProgress();
    progress.dailyXP = 0;
    this.saveUserProgress(progress);
  }

  /**
   * Get available XP activities
   */
  public static getXPActivities(): XPActivity[] {
    return [...this.XP_ACTIVITIES];
  }

  /**
   * Get achievement progress
   */
  public static getAchievements(): Achievement[] {
    const progress = this.getUserProgress();
    return progress.achievements;
  }

  /**
   * Generate weekly challenge
   */
  private static generateWeeklyChallenge(): WeeklyChallenge {
    const challenges = [
      { name: 'XP Hunter', description: 'Earn 3,000 XP this week', target: 3000, reward: '🏅 XP Master Badge' },
      { name: 'Streak Builder', description: 'Maintain 7-day streak', target: 7, reward: '🔥 Streak Champion' },
      { name: 'Task Crusher', description: 'Complete 50 tasks', target: 50, reward: '📋 Productivity Pro' },
      { name: 'Deep Focus', description: '20 deep work sessions', target: 20, reward: '🧠 Focus Master' },
      { name: 'Wellness Week', description: '7 workouts completed', target: 7, reward: '💪 Fitness Champion' },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // End of week

    return {
      id: `challenge_${Date.now()}`,
      ...challenge,
      current: 0,
      startDate,
      endDate,
      completed: false
    };
  }

  /**
   * Initialize achievements array
   */
  private static initializeAchievements(): Achievement[] {
    return this.ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: false,
      progress: 0
    }));
  }

  /**
   * Check and unlock achievements
   */
  private static checkAchievements(progress: UserProgress): void {
    progress.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let currentProgress = 0;

      switch (achievement.category) {
        case 'streak':
          currentProgress = progress.currentStreak;
          break;
        case 'points':
          currentProgress = progress.totalXP;
          break;
        case 'completion':
          if (achievement.id === 'task_master') {
            currentProgress = Object.values(progress.dailyStats)
              .reduce((sum, day) => sum + day.activitiesCompleted, 0);
          }
          break;
        case 'consistency':
          // Count specific activity completions
          currentProgress = Object.values(progress.dailyStats).length; // Simplified for now
          break;
      }

      achievement.progress = Math.min(currentProgress, achievement.maxProgress);

      if (currentProgress >= achievement.requirement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.triggerAchievementNotification(achievement);
      }
    });
  }

  /**
   * Save user progress to localStorage
   */
  private static saveUserProgress(progress: UserProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  /**
   * Trigger level up notification
   */
  private static triggerLevelUpNotification(level: number): void {
    // Could integrate with toast notifications or custom modal
    console.log(`🎉 LEVEL UP! You're now level ${level}!`);
  }

  /**
   * Trigger achievement notification
   */
  private static triggerAchievementNotification(achievement: Achievement): void {
    console.log(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.badge} ${achievement.name}!`);
  }

  /**
   * Get personal best stats
   */
  public static getPersonalBests(): Record<string, { value: number; date: string }> {
    const progress = this.getUserProgress();
    const dailyStats = Object.values(progress.dailyStats);

    return {
      highestDailyXP: this.getMaxStat(dailyStats, 'totalXP'),
      mostTasksInDay: this.getMaxStat(dailyStats, 'activitiesCompleted'),
      longestStreak: { value: progress.bestStreak, date: 'All time' },
      currentLevel: { value: progress.currentLevel, date: 'Current' }
    };
  }

  /**
   * Helper to get maximum stat across all days
   */
  private static getMaxStat(dailyStats: DailyStats[], field: keyof DailyStats): { value: number; date: string } {
    const max = dailyStats.reduce((max, day) => {
      const value = day[field] as number;
      return value > max.value ? { value, date: day.date } : max;
    }, { value: 0, date: 'N/A' });

    return max;
  }
}

// Export singleton for easy usage
export const gamificationService = GamificationService;
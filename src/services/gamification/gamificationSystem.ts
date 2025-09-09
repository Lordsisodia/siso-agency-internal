/**
 * 🎮 Advanced Gamification System
 * Levels, achievements, streaks, combos, and progression
 */

export interface UserGameStats {
  // Core progression
  totalXP: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  
  // Streaks and consistency
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  
  // Daily stats
  tasksCompletedToday: number;
  xpEarnedToday: number;
  perfectDays: number; // Days with 5+ tasks
  
  // Achievements
  unlockedAchievements: Achievement[];
  totalAchievementPoints: number;
  
  // Advanced metrics
  averageTaskDifficulty: number;
  productiveHours: number;
  weeklyGoalProgress: number;
  
  // Gamification state
  activeBoosts: GameBoost[];
  comboCount: number;
  lastCompletionTime?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'STREAK' | 'VOLUME' | 'DIFFICULTY' | 'LEARNING' | 'CONSISTENCY' | 'SPECIAL';
  points: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

export interface GameBoost {
  id: string;
  name: string;
  emoji: string;
  multiplier: number;
  expiresAt: Date;
  source: string;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  bonusReward?: string;
  expiresAt: Date;
  completed: boolean;
}

/**
 * 🏆 Achievement System
 * Comprehensive achievement tracking with progression
 */
export class AchievementSystem {
  
  private static readonly ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlockedAt' | 'progress'>> = {
    // STREAK ACHIEVEMENTS
    'first-steps': {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first task',
      emoji: '👶',
      category: 'STREAK',
      points: 10,
      rarity: 'COMMON'
    },
    'getting-started': {
      id: 'getting-started',
      name: 'Getting Started', 
      description: 'Complete tasks for 3 days in a row',
      emoji: '🔥',
      category: 'STREAK',
      points: 50,
      rarity: 'COMMON'
    },
    'weekly-warrior': {
      id: 'weekly-warrior',
      name: 'Weekly Warrior',
      description: 'Maintain a 7-day streak',
      emoji: '⚡',
      category: 'STREAK', 
      points: 100,
      rarity: 'RARE'
    },
    'unstoppable': {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Achieve a 30-day streak',
      emoji: '💎',
      category: 'STREAK',
      points: 300,
      rarity: 'EPIC'
    },
    'legend': {
      id: 'legend',
      name: 'Legend',
      description: 'Maintain a 100-day streak',
      emoji: '👑',
      category: 'STREAK',
      points: 1000,
      rarity: 'LEGENDARY'
    },
    
    // VOLUME ACHIEVEMENTS
    'task-crusher': {
      id: 'task-crusher',
      name: 'Task Crusher',
      description: 'Complete 100 tasks total',
      emoji: '💪',
      category: 'VOLUME',
      points: 150,
      rarity: 'RARE'
    },
    'productivity-beast': {
      id: 'productivity-beast',
      name: 'Productivity Beast',
      description: 'Complete 10 tasks in a single day',
      emoji: '🚀',
      category: 'VOLUME',
      points: 100,
      rarity: 'RARE'
    },
    'marathon-runner': {
      id: 'marathon-runner',
      name: 'Marathon Runner',
      description: 'Complete 1000 tasks total',
      emoji: '🏃‍♂️',
      category: 'VOLUME',
      points: 500,
      rarity: 'EPIC'
    },
    
    // DIFFICULTY ACHIEVEMENTS
    'expert-crusher': {
      id: 'expert-crusher',
      name: 'Expert Crusher',
      description: 'Complete 10 expert-level tasks',
      emoji: '🧠',
      category: 'DIFFICULTY',
      points: 200,
      rarity: 'RARE'
    },
    'complexity-master': {
      id: 'complexity-master',
      name: 'Complexity Master',
      description: 'Complete tasks with average complexity > 8',
      emoji: '🎯',
      category: 'DIFFICULTY',
      points: 250,
      rarity: 'EPIC'
    },
    
    // LEARNING ACHIEVEMENTS
    'knowledge-hunter': {
      id: 'knowledge-hunter',
      name: 'Knowledge Hunter',
      description: 'Complete 20 high-learning-value tasks',
      emoji: '📚',
      category: 'LEARNING',
      points: 180,
      rarity: 'RARE'
    },
    'skill-builder': {
      id: 'skill-builder',
      name: 'Skill Builder',
      description: 'Focus on learning for a full week',
      emoji: '🎓',
      category: 'LEARNING',
      points: 220,
      rarity: 'EPIC'
    },
    
    // CONSISTENCY ACHIEVEMENTS
    'morning-person': {
      id: 'morning-person',
      name: 'Morning Person',
      description: 'Complete 20 morning tasks',
      emoji: '🌅',
      category: 'CONSISTENCY',
      points: 120,
      rarity: 'COMMON'
    },
    'weekend-warrior': {
      id: 'weekend-warrior',
      name: 'Weekend Warrior',
      description: 'Stay productive on weekends for 4 weeks',
      emoji: '💼',
      category: 'CONSISTENCY',
      points: 200,
      rarity: 'RARE'
    },
    
    // SPECIAL ACHIEVEMENTS
    'perfectionist': {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Have 10 perfect days (5+ tasks each)',
      emoji: '✨',
      category: 'SPECIAL',
      points: 300,
      rarity: 'EPIC'
    },
    'deep-worker': {
      id: 'deep-worker',
      name: 'Deep Worker',
      description: 'Complete 50 deep work sessions',
      emoji: '🧘',
      category: 'SPECIAL',
      points: 250,
      rarity: 'EPIC'
    },
    'strategic-thinker': {
      id: 'strategic-thinker',
      name: 'Strategic Thinker',
      description: 'Focus on high-strategic-value tasks for a month',
      emoji: '♟️',
      category: 'SPECIAL',
      points: 400,
      rarity: 'LEGENDARY'
    }
  };
  
  /**
   * Check which achievements the user has unlocked
   */
  static checkAchievements(stats: UserGameStats, taskContext?: any): Achievement[] {
    const newAchievements: Achievement[] = [];
    const existingIds = stats.unlockedAchievements.map(a => a.id);
    
    // Check each achievement
    Object.values(this.ACHIEVEMENTS).forEach(achievement => {
      if (!existingIds.includes(achievement.id) && this.isAchievementUnlocked(achievement.id, stats, taskContext)) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    });
    
    return newAchievements;
  }
  
  private static isAchievementUnlocked(achievementId: string, stats: UserGameStats, taskContext?: any): boolean {
    switch (achievementId) {
      case 'first-steps':
        return stats.totalTasksCompleted >= 1;
      case 'getting-started':
        return stats.currentStreak >= 3;
      case 'weekly-warrior':
        return stats.currentStreak >= 7;
      case 'unstoppable':
        return stats.currentStreak >= 30;
      case 'legend':
        return stats.currentStreak >= 100;
      case 'task-crusher':
        return stats.totalTasksCompleted >= 100;
      case 'productivity-beast':
        return stats.tasksCompletedToday >= 10;
      case 'marathon-runner':
        return stats.totalTasksCompleted >= 1000;
      case 'perfectionist':
        return stats.perfectDays >= 10;
      // Add more achievement checks...
      default:
        return false;
    }
  }
  
  /**
   * Get achievement progress for display
   */
  static getAchievementProgress(achievementId: string, stats: UserGameStats): { current: number, max: number, percentage: number } {
    let current = 0;
    let max = 1;
    
    switch (achievementId) {
      case 'getting-started':
        current = Math.min(stats.currentStreak, 3);
        max = 3;
        break;
      case 'weekly-warrior':
        current = Math.min(stats.currentStreak, 7);
        max = 7;
        break;
      case 'task-crusher':
        current = Math.min(stats.totalTasksCompleted, 100);
        max = 100;
        break;
      case 'productivity-beast':
        current = Math.min(stats.tasksCompletedToday, 10);
        max = 10;
        break;
      // Add more progress tracking...
    }
    
    return { current, max, percentage: Math.round((current / max) * 100) };
  }
}

/**
 * 🎯 Daily Challenge System
 * Dynamic challenges to maintain engagement
 */
export class DailyChallengeSystem {
  
  /**
   * Generate daily challenges based on user patterns
   */
  static generateDailyChallenge(userStats: UserGameStats, date: Date): DailyChallenge {
    const challenges = [
      {
        name: 'Morning Momentum',
        description: 'Complete 3 tasks before noon',
        emoji: '🌅',
        targetValue: 3,
        xpReward: 50,
        bonusReward: '2x XP boost for next task'
      },
      {
        name: 'Deep Focus',
        description: 'Complete 2 deep work tasks',
        emoji: '🧘',
        targetValue: 2,
        xpReward: 75,
        bonusReward: 'Focus Master badge'
      },
      {
        name: 'Task Marathon', 
        description: 'Complete 8 tasks today',
        emoji: '🏃‍♂️',
        targetValue: 8,
        xpReward: 100,
        bonusReward: 'Productivity boost for tomorrow'
      },
      {
        name: 'Complexity Challenge',
        description: 'Complete a hard or expert task',
        emoji: '🧠',
        targetValue: 1,
        xpReward: 80,
        bonusReward: 'Intelligence bonus for next difficult task'
      }
    ];
    
    // Pick challenge based on user's typical performance
    const baseChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      id: `challenge-${date.toISOString().split('T')[0]}`,
      ...baseChallenge,
      currentProgress: 0,
      expiresAt: new Date(date.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      completed: false
    };
  }
  
  /**
   * Update challenge progress
   */
  static updateChallengeProgress(
    challenge: DailyChallenge, 
    taskCompleted: any
  ): { updatedChallenge: DailyChallenge, bonusXP: number } {
    let bonusXP = 0;
    const updatedChallenge = { ...challenge };
    
    // Update progress based on challenge type
    if (challenge.name === 'Morning Momentum' && new Date().getHours() < 12) {
      updatedChallenge.currentProgress++;
    } else if (challenge.name === 'Deep Focus' && taskCompleted.workType === 'DEEP') {
      updatedChallenge.currentProgress++;
    } else if (challenge.name === 'Task Marathon') {
      updatedChallenge.currentProgress++;
    } else if (challenge.name === 'Complexity Challenge' && 
               ['HARD', 'EXPERT'].includes(taskCompleted.difficulty)) {
      updatedChallenge.currentProgress++;
    }
    
    // Check if completed
    if (updatedChallenge.currentProgress >= updatedChallenge.targetValue && !updatedChallenge.completed) {
      updatedChallenge.completed = true;
      bonusXP = updatedChallenge.xpReward;
    }
    
    return { updatedChallenge, bonusXP };
  }
}

/**
 * 🎮 Main Gamification Engine
 * Orchestrates all gamification systems
 */
export class GamificationEngine {
  
  /**
   * Process task completion through all gamification systems
   */
  static processTaskCompletion(
    userStats: UserGameStats,
    taskContext: any,
    xpEarned: number
  ): {
    updatedStats: UserGameStats;
    newAchievements: Achievement[];
    levelUp: boolean;
    bonusXP: number;
    notifications: string[];
  } {
    const notifications: string[] = [];
    let bonusXP = 0;
    
    // Update core stats
    const updatedStats: UserGameStats = {
      ...userStats,
      totalXP: userStats.totalXP + xpEarned,
      totalTasksCompleted: userStats.totalTasksCompleted + 1,
      tasksCompletedToday: userStats.tasksCompletedToday + 1,
      xpEarnedToday: userStats.xpEarnedToday + xpEarned
    };
    
    // Check for level up
    const levelInfo = this.calculateLevel(updatedStats.totalXP);
    const levelUp = levelInfo.level > userStats.level;
    updatedStats.level = levelInfo.level;
    updatedStats.xpInCurrentLevel = levelInfo.xpInLevel;
    updatedStats.xpForNextLevel = levelInfo.xpForNextLevel;
    
    if (levelUp) {
      notifications.push(`🎉 Level Up! You're now level ${levelInfo.level}!`);
      bonusXP += levelInfo.level * 10; // Level up bonus
    }
    
    // Check achievements
    const newAchievements = AchievementSystem.checkAchievements(updatedStats, taskContext);
    updatedStats.unlockedAchievements = [...updatedStats.unlockedAchievements, ...newAchievements];
    updatedStats.totalAchievementPoints = updatedStats.unlockedAchievements
      .reduce((sum, ach) => sum + ach.points, 0);
    
    if (newAchievements.length > 0) {
      newAchievements.forEach(ach => {
        notifications.push(`🏆 Achievement unlocked: ${ach.emoji} ${ach.name}!`);
        bonusXP += ach.points;
      });
    }
    
    // Update combo system
    const now = new Date();
    const lastCompletion = userStats.lastCompletionTime;
    
    if (lastCompletion && (now.getTime() - lastCompletion.getTime()) < 60 * 60 * 1000) {
      // Within 1 hour = combo continues
      updatedStats.comboCount = (userStats.comboCount || 0) + 1;
      if (updatedStats.comboCount >= 3) {
        notifications.push(`🔥 ${updatedStats.comboCount}x Combo! +${updatedStats.comboCount * 5} bonus XP!`);
        bonusXP += updatedStats.comboCount * 5;
      }
    } else {
      updatedStats.comboCount = 1;
    }
    
    updatedStats.lastCompletionTime = now;
    updatedStats.totalXP += bonusXP;
    updatedStats.xpEarnedToday += bonusXP;
    
    return {
      updatedStats,
      newAchievements,
      levelUp,
      bonusXP,
      notifications
    };
  }
  
  /**
   * Calculate level from XP (same as IntelligentXPService)
   */
  private static calculateLevel(totalXP: number): { level: number, xpInLevel: number, xpForNextLevel: number } {
    let level = 1;
    let totalRequired = 0;
    
    while (true) {
      const levelRequired = 100 + (level - 1) * 200 + Math.pow(level - 1, 2) * 50;
      if (totalXP < totalRequired + levelRequired) {
        break;
      }
      totalRequired += levelRequired;
      level++;
    }
    
    const currentLevelRequired = 100 + (level - 1) * 200 + Math.pow(level - 1, 2) * 50;
    const xpInLevel = totalXP - totalRequired;
    const xpForNextLevel = currentLevelRequired - xpInLevel;
    
    return { level, xpInLevel, xpForNextLevel };
  }
}
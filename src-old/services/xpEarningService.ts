/**
 * XP Earning Service
 * Calculates XP awards based on task types, difficulty, and psychology bonuses
 */

export interface XPCalculation {
  baseXP: number;
  taskTypeMultiplier: number;
  difficultyMultiplier: number;
  streakBonus: number;
  timeBonus: number;
  finalXP: number;
  breakdown: string[];
}

export interface TaskContext {
  taskType?: 'quick' | 'focus' | 'deep' | 'creative' | 'admin';
  difficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'expert';
  estimatedMinutes?: number;
  completedInSession?: boolean;
  streakDays?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  isWeekend?: boolean;
}

/**
 * XP Earning System - Balanced for Reward Economy
 * 
 * Base Philosophy:
 * - 30min downtime (25 XP) should be earned with ~15-20min of work
 * - 1 hour downtime (50 XP) should be earned with ~30-40min of work  
 * - Major rewards (400+ XP) require sustained effort over days
 */
export class XPEarningService {
  
  /**
   * Calculate XP for task completion with psychology bonuses
   */
  static calculateTaskXP(context: TaskContext = {}): XPCalculation {
    // Base XP amounts by task type (designed for time-reward balance)
    const baseXPByType: Record<string, number> = {
      'quick': 15,    // 5-15min tasks → earn 30min downtime in ~1 hour
      'focus': 35,    // 20-45min tasks → earn 1hr downtime in ~1.5 hours  
      'deep': 60,     // 60-120min tasks → earn 2hr session with 1-2 tasks
      'creative': 45, // 30-90min tasks → variable duration, good XP rate
      'admin': 20     // 10-30min tasks → lower reward, necessary work
    };

    const baseXP = baseXPByType[context.taskType || 'focus'] || 35;

    // Difficulty multipliers (1.0 = normal, 1.5 = expert)
    const difficultyMultipliers: Record<string, number> = {
      'trivial': 0.8,  // Easier tasks worth less
      'easy': 0.9,
      'medium': 1.0,   // Base multiplier
      'hard': 1.2,
      'expert': 1.5    // Expert tasks worth 50% more
    };

    const difficultyMultiplier = difficultyMultipliers[context.difficulty || 'medium'] || 1.0;

    // Task type multipliers for psychology
    const taskTypeMultiplier = this.getTaskTypeMultiplier(context.taskType);

    // Streak bonus (compound daily productivity)
    const streakBonus = this.calculateStreakBonus(context.streakDays || 0);

    // Time-based bonuses
    const timeBonus = this.calculateTimeBonus(context);

    // Calculate final XP
    const finalXP = Math.round(
      baseXP * difficultyMultiplier * taskTypeMultiplier + streakBonus + timeBonus
    );

    // Generate breakdown for user understanding
    const breakdown = this.generateBreakdown({
      baseXP,
      taskTypeMultiplier,
      difficultyMultiplier,
      streakBonus,
      timeBonus,
      finalXP,
      context
    });

    return {
      baseXP,
      taskTypeMultiplier,
      difficultyMultiplier,
      streakBonus,
      timeBonus,
      finalXP,
      breakdown
    };
  }

  /**
   * Get multiplier based on task type psychology
   */
  private static getTaskTypeMultiplier(taskType?: string): number {
    switch (taskType) {
      case 'deep': return 1.1;     // Deep work gets 10% bonus (most valuable)
      case 'creative': return 1.05; // Creative work gets 5% bonus
      case 'focus': return 1.0;     // Standard focused work
      case 'admin': return 0.9;     // Admin tasks get 10% less (less rewarding)
      case 'quick': return 1.0;     // Quick tasks at base rate
      default: return 1.0;
    }
  }

  /**
   * Calculate streak bonus (logarithmic growth prevents exploitation)
   */
  private static calculateStreakBonus(streakDays: number): number {
    if (streakDays <= 0) return 0;
    
    // Logarithmic bonus that caps at reasonable levels
    // Day 1: +3, Day 3: +6, Day 7: +10, Day 14: +15, Day 30: +20
    const bonusBase = Math.log(streakDays + 1) * 4;
    return Math.min(Math.round(bonusBase), 25); // Cap at 25 XP bonus
  }

  /**
   * Calculate time-based bonuses for psychology
   */
  private static calculateTimeBonus(context: TaskContext): number {
    let bonus = 0;

    // Morning bonus (reward early productivity)
    if (context.timeOfDay === 'morning') {
      bonus += 5; // Small bonus for morning work
    }

    // Session completion bonus
    if (context.completedInSession) {
      bonus += 8; // Bonus for focused work sessions
    }

    // Weekend work bonus (optional productivity)
    if (context.isWeekend) {
      bonus += 10; // Higher bonus for weekend work
    }

    return bonus;
  }

  /**
   * Generate human-readable breakdown
   */
  private static generateBreakdown({
    baseXP,
    taskTypeMultiplier,
    difficultyMultiplier,
    streakBonus,
    timeBonus,
    finalXP,
    context
  }: {
    baseXP: number;
    taskTypeMultiplier: number;
    difficultyMultiplier: number;
    streakBonus: number;
    timeBonus: number;
    finalXP: number;
    context: TaskContext;
  }): string[] {
    const breakdown = [];
    
    breakdown.push(`Base XP: ${baseXP} (${context.taskType || 'focus'} task)`);
    
    if (difficultyMultiplier !== 1.0) {
      const difficultyXP = Math.round(baseXP * difficultyMultiplier) - baseXP;
      breakdown.push(`Difficulty bonus: +${difficultyXP} (${context.difficulty})`);
    }
    
    if (taskTypeMultiplier !== 1.0) {
      const typeXP = Math.round(baseXP * taskTypeMultiplier) - baseXP;
      breakdown.push(`Task type bonus: +${typeXP} (${context.taskType})`);
    }
    
    if (streakBonus > 0) {
      breakdown.push(`Streak bonus: +${streakBonus} (${context.streakDays} days)`);
    }
    
    if (timeBonus > 0) {
      const bonuses = [];
      if (context.timeOfDay === 'morning') bonuses.push('morning');
      if (context.completedInSession) bonuses.push('session');
      if (context.isWeekend) bonuses.push('weekend');
      breakdown.push(`Time bonus: +${timeBonus} (${bonuses.join(', ')})`);
    }
    
    breakdown.push(`Total: ${finalXP} XP`);
    
    return breakdown;
  }

  /**
   * Get recommended task XP for specific reward targets
   */
  static getRewardEarningGuide(): Record<string, { tasks: number, timeEstimate: string, suggestions: string[] }> {
    return {
      '30min downtime (25 XP)': {
        tasks: 1,
        timeEstimate: '15-20 minutes',
        suggestions: ['1 quick task', '1 admin task with bonus', 'Part of a larger task']
      },
      '1 hour downtime (50 XP)': {
        tasks: 1,
        timeEstimate: '30-40 minutes', 
        suggestions: ['1 focus task', '1 creative task', '2 quick tasks']
      },
      '2 hour session (100 XP)': {
        tasks: 2,
        timeEstimate: '60-90 minutes',
        suggestions: ['1 deep work task + 1 quick', '2 focus tasks', '3 quick tasks + bonuses']
      },
      'Quick smoke (75 XP)': {
        tasks: 2,
        timeEstimate: '45-60 minutes',
        suggestions: ['1 deep task', '2 focus tasks', 'Mix of tasks with streak bonus']
      },
      'Movie experience (120 XP)': {
        tasks: 3,
        timeEstimate: '90-120 minutes',
        suggestions: ['2 focus + 1 creative', '1 deep + 2 quick', 'Focus session with bonuses']
      },
      'Full day off (500 XP)': {
        tasks: 10,
        timeEstimate: '6-8 hours over multiple days',
        suggestions: ['Week of consistent productivity', 'Mix of deep and focus work', 'Maintain streak bonuses']
      }
    };
  }

  /**
   * Psychology feature: Calculate "almost earned" notifications
   */
  static getNearEarnedRewards(currentXP: number, targetRewards: Array<{name: string, price: number}>): Array<{
    reward: string;
    price: number;
    xpNeeded: number;
    tasksNeeded: number;
    timeEstimate: string;
  }> {
    const nearEarned = targetRewards
      .filter(reward => {
        const needed = reward.price - currentXP;
        return needed > 0 && needed <= 100; // Within 100 XP
      })
      .map(reward => {
        const xpNeeded = reward.price - currentXP;
        const tasksNeeded = Math.ceil(xpNeeded / 35); // Assume focus tasks
        const timeEstimate = `${tasksNeeded * 30}-${tasksNeeded * 45} minutes`;
        
        return {
          reward: reward.name,
          price: reward.price,
          xpNeeded,
          tasksNeeded,
          timeEstimate
        };
      })
      .sort((a, b) => a.xpNeeded - b.xpNeeded);

    return nearEarned;
  }
}
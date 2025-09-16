/**
 * 🎯 XP Preview Service
 * Shows XP potential BEFORE starting tasks for better motivation and prioritization
 */

import { IntelligentXPService, TaskImportanceDetector, type TaskXPContext } from './intelligentXPService';
import { type TaskWithSubtasks } from '@/features/services/task-database-service-fixed';

export interface XPPreview {
  estimatedXP: number;
  minXP: number;
  maxXP: number;
  confidence: number;
  breakdown: string[];
  motivationMessage: string;
  priorityReason: string;
  bonusOpportunities: string[];
}

export interface UserXPContext {
  currentStreak?: number;
  tasksCompletedToday?: number;
  userLevel?: number;
  recentTaskCompletions?: number; // For combo potential
}

/**
 * 🎯 XP Preview Engine
 * Estimates XP potential before task execution
 */
export class XPPreviewService {
  
  /**
   * Generate XP preview for a task
   */
  static generateTaskPreview(
    task: TaskWithSubtasks | Partial<TaskWithSubtasks>,
    userContext?: UserXPContext
  ): XPPreview {
    
    // Get or analyze task properties
    const taskAnalysis = task.aiAnalyzed ? {
      priority: task.priority || 'MEDIUM',
      complexity: task.complexity || 5,
      learningValue: task.learningValue || 5,
      strategicImportance: task.strategicImportance || 5
    } : TaskImportanceDetector.analyzeImportance(
      task.title || 'Task',
      task.description
    );
    
    // Build base XP context
    const baseContext: TaskXPContext = {
      title: task.title || 'Task',
      description: task.description,
      priority: taskAnalysis.priority,
      workType: task.workType || 'LIGHT',
      difficulty: task.difficulty || 'MODERATE',
      estimatedDuration: task.estimatedDuration,
      complexity: taskAnalysis.complexity,
      learningValue: taskAnalysis.learningValue,
      strategicImportance: taskAnalysis.strategicImportance,
      currentStreak: userContext?.currentStreak || 0,
      tasksCompletedToday: userContext?.tasksCompletedToday || 0,
      userLevel: userContext?.userLevel || 1,
      timeOfDay: this.getCurrentTimeOfDay(),
      isWeekend: this.isWeekend(),
      completedInFocusSession: false, // Estimate without focus bonus initially
      recentCompletion: (userContext?.recentTaskCompletions || 0) > 0
    };
    
    // Calculate base XP
    const baseXP = IntelligentXPService.calculateIntelligentXP(baseContext);
    
    // Calculate min/max scenarios
    const minContext = { ...baseContext, completedInFocusSession: false };
    const maxContext = { 
      ...baseContext, 
      completedInFocusSession: true,
      timeOfDay: 'morning' as const,
      recentCompletion: true
    };
    
    const minXP = IntelligentXPService.calculateIntelligentXP(minContext);
    const maxXP = IntelligentXPService.calculateIntelligentXP(maxContext);
    
    // Generate motivation and bonus opportunities
    const motivationMessage = this.generateMotivationMessage(baseXP.finalXP, taskAnalysis);
    const bonusOpportunities = this.identifyBonusOpportunities(baseContext, userContext);
    const priorityReason = this.generatePriorityReason(taskAnalysis);
    
    return {
      estimatedXP: baseXP.finalXP,
      minXP: minXP.finalXP,
      maxXP: maxXP.finalXP,
      confidence: baseXP.confidenceScore,
      breakdown: baseXP.breakdown,
      motivationMessage,
      priorityReason,
      bonusOpportunities
    };
  }
  
  /**
   * Generate previews for multiple tasks (for prioritization)
   */
  static generateTaskListPreview(
    tasks: (TaskWithSubtasks | Partial<TaskWithSubtasks>)[],
    userContext?: UserXPContext
  ): Array<XPPreview & { taskId?: string; title: string }> {
    return tasks.map(task => ({
      taskId: task.id,
      title: task.title || 'Untitled Task',
      ...this.generateTaskPreview(task, userContext)
    }));
  }
  
  /**
   * Calculate XP potential for creating new task with given properties
   */
  static estimateNewTaskXP(
    title: string,
    description?: string,
    workType: 'DEEP' | 'LIGHT' | 'MORNING' = 'LIGHT',
    estimatedMinutes?: number,
    userContext?: UserXPContext
  ): XPPreview {
    
    const taskData = {
      title,
      description,
      workType,
      estimatedDuration: estimatedMinutes
    };
    
    return this.generateTaskPreview(taskData, userContext);
  }
  
  /**
   * Get XP preview for task at different times/contexts
   */
  static getContextualPreviews(
    task: TaskWithSubtasks | Partial<TaskWithSubtasks>,
    userContext?: UserXPContext
  ): {
    now: XPPreview;
    morning: XPPreview;
    inFocus: XPPreview;
    withStreak: XPPreview;
  } {
    const baseUserContext = userContext || {};
    
    return {
      now: this.generateTaskPreview(task, baseUserContext),
      morning: this.generateTaskPreview(task, {
        ...baseUserContext,
        // Simulate morning completion
      }),
      inFocus: this.generateTaskPreview(task, baseUserContext),
      withStreak: this.generateTaskPreview(task, {
        ...baseUserContext,
        currentStreak: (baseUserContext.currentStreak || 0) + 1
      })
    };
  }
  
  // PRIVATE HELPER METHODS
  
  private static getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
  
  private static isWeekend(): boolean {
    return [0, 6].includes(new Date().getDay());
  }
  
  private static generateMotivationMessage(xp: number, analysis: any): string {
    if (xp >= 200) {
      return `🚀 HIGH VALUE! This ${analysis.priority.toLowerCase()} priority task is worth serious XP!`;
    } else if (xp >= 100) {
      return `💪 SOLID REWARD! Good XP potential for this task`;
    } else if (xp >= 50) {
      return `✨ STEADY PROGRESS! Decent XP to keep momentum going`;
    } else {
      return `📈 QUICK WIN! Easy XP to build your streak`;
    }
  }
  
  private static generatePriorityReason(analysis: any): string {
    const reasons = [];
    
    if (analysis.priority === 'CRITICAL') {
      reasons.push('🚨 Critical priority detected');
    } else if (analysis.priority === 'HIGH') {
      reasons.push('⚡ High importance identified');
    } else if (analysis.priority === 'LOW') {
      reasons.push('📝 Routine task - lower priority');
    }
    
    if (analysis.complexity > 7) {
      reasons.push('🧠 High complexity task');
    } else if (analysis.complexity < 4) {
      reasons.push('⚡ Simple, straightforward task');
    }
    
    if (analysis.learningValue > 7) {
      reasons.push('📚 Great learning opportunity');
    }
    
    if (analysis.strategicImportance > 7) {
      reasons.push('🎯 High strategic value');
    }
    
    return reasons.length > 0 ? reasons.join(' • ') : 'Standard task classification';
  }
  
  private static identifyBonusOpportunities(
    context: TaskXPContext, 
    userContext?: UserXPContext
  ): string[] {
    const opportunities = [];
    
    // Time-based opportunities
    if (context.timeOfDay !== 'morning') {
      opportunities.push('🌅 +8 XP if completed in the morning');
    }
    
    if (!context.isWeekend && this.isWeekend()) {
      opportunities.push('💼 +12 XP for weekend productivity');
    }
    
    // Focus session opportunity
    opportunities.push('🧘 +10 XP if completed in a focus session');
    
    // Streak opportunities
    if ((userContext?.currentStreak || 0) === 0) {
      opportunities.push('🔥 Start a streak for growing daily bonuses');
    } else if ((userContext?.currentStreak || 0) === 6) {
      opportunities.push('⚡ One more day to unlock "Weekly Warrior" achievement!');
    }
    
    // Combo opportunities
    if ((userContext?.recentTaskCompletions || 0) >= 1) {
      opportunities.push(`💥 +${(userContext?.recentTaskCompletions || 1) * 5} XP combo bonus available`);
    }
    
    // Daily challenge opportunities
    const hour = new Date().getHours();
    if (hour < 12 && (userContext?.tasksCompletedToday || 0) < 3) {
      opportunities.push('🎯 Complete 3 morning tasks for daily challenge bonus');
    }
    
    if (context.workType === 'DEEP') {
      opportunities.push('🧠 Deep work contributes to daily focus challenge');
    }
    
    return opportunities;
  }
}

/**
 * 🎨 XP Preview UI Helpers
 * Helper functions for displaying XP previews in the UI
 */
export class XPPreviewUIHelpers {
  
  /**
   * Get color theme based on XP amount
   */
  static getXPColorTheme(xp: number): {
    color: string;
    bgColor: string;
    borderColor: string;
    emoji: string;
  } {
    if (xp >= 200) {
      return {
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        emoji: '💎'
      };
    } else if (xp >= 100) {
      return {
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        emoji: '🚀'
      };
    } else if (xp >= 50) {
      return {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        emoji: '✨'
      };
    } else {
      return {
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        emoji: '📈'
      };
    }
  }
  
  /**
   * Format XP range display
   */
  static formatXPRange(min: number, max: number, estimated: number): string {
    if (min === max) {
      return `${estimated} XP`;
    }
    return `${min}-${max} XP (est. ${estimated})`;
  }
  
  /**
   * Get priority badge styling
   */
  static getPriorityBadgeStyle(priority: string): {
    color: string;
    bgColor: string;
    text: string;
  } {
    switch (priority) {
      case 'CRITICAL':
        return {
          color: 'text-red-800',
          bgColor: 'bg-red-100',
          text: 'Critical'
        };
      case 'HIGH':
        return {
          color: 'text-orange-800',
          bgColor: 'bg-orange-100',
          text: 'High'
        };
      case 'MEDIUM':
        return {
          color: 'text-blue-800',
          bgColor: 'bg-blue-100',
          text: 'Medium'
        };
      case 'LOW':
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-100',
          text: 'Low'
        };
      default:
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-100',
          text: 'Normal'
        };
    }
  }
  
  /**
   * Generate progress bar width for XP relative to daily goal
   */
  static getXPProgressWidth(xp: number, dailyGoal: number = 300): number {
    return Math.min(100, (xp / dailyGoal) * 100);
  }
}
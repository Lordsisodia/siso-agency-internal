import { FlowSession, FlowStats, TaskContext, FocusIntensity } from '@/ecosystem/internal/tasks/ui/FlowStateTimer';

export class FlowStatsService {
  private static readonly STORAGE_KEY = 'lifelock-flow-stats';
  private static readonly SESSIONS_KEY = 'lifelock-flow-sessions';

  /**
   * Save a completed flow session
   */
  static saveFlowSession(session: FlowSession): void {
    try {
      const sessions = this.getAllSessions();
      sessions.push(session);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      
      // Update stats
      this.updateFlowStats(session);
      
      console.log('💫 Flow session saved:', session);
    } catch (error) {
      console.error('Failed to save flow session:', error);
    }
  }

  /**
   * Get all flow sessions
   */
  static getAllSessions(): FlowSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load flow sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions for a specific date
   */
  static getSessionsForDate(date: Date): FlowSession[] {
    const sessions = this.getAllSessions();
    const targetDate = date.toDateString();
    
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === targetDate
    );
  }

  /**
   * Get sessions for a specific task
   */
  static getSessionsForTask(taskId: string): FlowSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(session => session.taskId === taskId);
  }

  /**
   * Get current flow stats
   */
  static getFlowStats(): FlowStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Calculate initial stats from sessions
      return this.calculateStatsFromSessions();
    } catch (error) {
      console.error('Failed to load flow stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Update flow stats after a new session
   */
  private static updateFlowStats(newSession: FlowSession): void {
    const currentStats = this.getFlowStats();
    const sessions = this.getAllSessions();
    
    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const todaySessions = sessions.filter(s => 
      new Date(s.startTime).toDateString() === today && s.duration >= 25
    );
    
    const yesterdaySessions = sessions.filter(s => 
      new Date(s.startTime).toDateString() === yesterday && s.duration >= 25
    );

    if (todaySessions.length > 0) {
      if (yesterdaySessions.length > 0 || currentStats.currentStreak === 0) {
        currentStats.currentStreak += 1;
      } else {
        currentStats.currentStreak = 1;
      }
    }

    // Update longest streak
    currentStats.longestStreak = Math.max(currentStats.longestStreak, currentStats.currentStreak);

    // Update total flow time
    currentStats.totalFlowTime += newSession.duration;

    // Update average session length
    const validSessions = sessions.filter(s => s.duration >= 5);
    currentStats.averageSessionLength = validSessions.length > 0 
      ? validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length 
      : 0;

    // Update best flow day
    const sessionsByDay = this.groupSessionsByDay(sessions);
    let bestDay = '';
    let bestDayTime = 0;
    
    Object.entries(sessionsByDay).forEach(([day, daySessions]) => {
      const dayTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
      if (dayTime > bestDayTime) {
        bestDayTime = dayTime;
        bestDay = day;
      }
    });
    
    currentStats.bestFlowDay = bestDay;

    // Calculate context switch penalty
    currentStats.contextSwitchPenalty = this.calculateContextSwitchPenalty(sessions);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentStats));
  }

  /**
   * Calculate context switching penalty
   */
  static calculateContextSwitchPenalty(sessions: FlowSession[]): number {
    const recentSessions = sessions
      .filter(s => new Date(s.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (recentSessions.length < 2) return 0;

    let totalPenalty = 0;
    let switches = 0;

    for (let i = 1; i < recentSessions.length; i++) {
      const prevSession = recentSessions[i - 1];
      const currentSession = recentSessions[i];
      
      // Check if sessions are within context-switching timeframe (same day, within 4 hours)
      const timeDiff = new Date(currentSession.startTime).getTime() - new Date(prevSession.endTime || prevSession.startTime).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff <= 4 && prevSession.context !== currentSession.context) {
        const penalty = this.getContextSwitchPenalty(prevSession.context, currentSession.context);
        totalPenalty += penalty;
        switches++;
      }
    }

    return switches > 0 ? totalPenalty / switches : 0;
  }

  /**
   * Get context switch penalty between two contexts
   */
  private static getContextSwitchPenalty(from: TaskContext, to: TaskContext): number {
    const penalties: Record<TaskContext, Record<TaskContext, number>> = {
      'coding': { 'writing': 15, 'design': 10, 'research': 8, 'planning': 12, 'communication': 20, 'learning': 5, 'creative': 18 },
      'writing': { 'coding': 15, 'design': 8, 'research': 5, 'planning': 3, 'communication': 10, 'learning': 7, 'creative': 12 },
      'design': { 'coding': 12, 'writing': 8, 'research': 10, 'planning': 15, 'communication': 18, 'learning': 10, 'creative': 5 },
      'research': { 'coding': 10, 'writing': 5, 'design': 8, 'planning': 7, 'communication': 12, 'learning': 3, 'creative': 15 },
      'planning': { 'coding': 12, 'writing': 3, 'design': 10, 'research': 5, 'communication': 8, 'learning': 10, 'creative': 18 },
      'communication': { 'coding': 25, 'writing': 10, 'design': 15, 'research': 12, 'planning': 8, 'learning': 15, 'creative': 20 },
      'learning': { 'coding': 8, 'writing': 7, 'design': 10, 'research': 3, 'planning': 12, 'communication': 15, 'creative': 12 },
      'creative': { 'coding': 20, 'writing': 12, 'design': 5, 'research': 15, 'planning': 18, 'communication': 22, 'learning': 10 }
    };

    return penalties[from]?.[to] || 0;
  }

  /**
   * Get smart task grouping suggestions
   */
  static getTaskGroupingSuggestions(tasks: Array<{id: string, title: string, context?: TaskContext}>): Array<{
    context: TaskContext;
    tasks: Array<{id: string, title: string}>;
    penalty: number;
  }> {
    // Group tasks by context
    const grouped = tasks.reduce((acc, task) => {
      const context = task.context || this.inferTaskContext(task.title);
      if (!acc[context]) {
        acc[context] = [];
      }
      acc[context].push(task);
      return acc;
    }, {} as Record<TaskContext, Array<{id: string, title: string}>>);

    // Convert to suggestions with penalty calculation
    return Object.entries(grouped).map(([context, contextTasks]) => ({
      context: context as TaskContext,
      tasks: contextTasks,
      penalty: this.calculateGroupPenalty(context as TaskContext, Object.keys(grouped) as TaskContext[])
    })).sort((a, b) => a.penalty - b.penalty);
  }

  /**
   * Infer task context from title using keywords
   */
  private static inferTaskContext(title: string): TaskContext {
    const keywords: Record<TaskContext, string[]> = {
      'coding': ['code', 'dev', 'bug', 'fix', 'implement', 'api', 'database', 'function', 'debug'],
      'writing': ['write', 'blog', 'content', 'article', 'documentation', 'copy', 'email', 'proposal'],
      'design': ['design', 'ui', 'ux', 'mockup', 'wireframe', 'prototype', 'visual', 'layout'],
      'research': ['research', 'analyze', 'study', 'investigate', 'explore', 'survey', 'data'],
      'planning': ['plan', 'strategy', 'roadmap', 'schedule', 'organize', 'outline', 'structure'],
      'communication': ['meeting', 'call', 'discuss', 'present', 'review', 'feedback', 'sync'],
      'learning': ['learn', 'course', 'tutorial', 'study', 'training', 'skill', 'practice'],
      'creative': ['creative', 'brainstorm', 'ideate', 'concept', 'innovation', 'art', 'video']
    };

    const lowerTitle = title.toLowerCase();
    
    for (const [context, words] of Object.entries(keywords)) {
      if (words.some(word => lowerTitle.includes(word))) {
        return context as TaskContext;
      }
    }

    return 'planning'; // default
  }

  /**
   * Calculate penalty for switching between contexts in a group
   */
  private static calculateGroupPenalty(primaryContext: TaskContext, allContexts: TaskContext[]): number {
    const otherContexts = allContexts.filter(c => c !== primaryContext);
    return otherContexts.reduce((sum, context) => 
      sum + this.getContextSwitchPenalty(primaryContext, context), 0
    ) / Math.max(otherContexts.length, 1);
  }

  /**
   * Calculate initial stats from existing sessions
   */
  private static calculateStatsFromSessions(): FlowStats {
    const sessions = this.getAllSessions();
    
    if (sessions.length === 0) {
      return this.getDefaultStats();
    }

    const validSessions = sessions.filter(s => s.duration >= 5);
    const totalTime = validSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageLength = validSessions.length > 0 ? totalTime / validSessions.length : 0;

    // Calculate streak
    const streak = this.calculateCurrentStreak(sessions);
    const longestStreak = this.calculateLongestStreak(sessions);

    // Find best day
    const sessionsByDay = this.groupSessionsByDay(sessions);
    let bestDay = '';
    let bestDayTime = 0;
    
    Object.entries(sessionsByDay).forEach(([day, daySessions]) => {
      const dayTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
      if (dayTime > bestDayTime) {
        bestDayTime = dayTime;
        bestDay = day;
      }
    });

    const stats: FlowStats = {
      currentStreak: streak,
      longestStreak: longestStreak,
      totalFlowTime: totalTime,
      averageSessionLength: averageLength,
      bestFlowDay: bestDay,
      contextSwitchPenalty: this.calculateContextSwitchPenalty(sessions)
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    return stats;
  }

  /**
   * Calculate current streak
   */
  private static calculateCurrentStreak(sessions: FlowSession[]): number {
    const sessionsByDay = this.groupSessionsByDay(sessions);
    const sortedDays = Object.keys(sessionsByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const today = new Date().toDateString();
    let streak = 0;
    
    for (const day of sortedDays) {
      const dayTime = sessionsByDay[day].reduce((sum, s) => sum + s.duration, 0);
      if (dayTime >= 25) { // At least 25 minutes of flow work
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak
   */
  private static calculateLongestStreak(sessions: FlowSession[]): number {
    const sessionsByDay = this.groupSessionsByDay(sessions);
    const sortedDays = Object.keys(sessionsByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const day of sortedDays) {
      const dayTime = sessionsByDay[day].reduce((sum, s) => sum + s.duration, 0);
      if (dayTime >= 25) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  /**
   * Group sessions by day
   */
  private static groupSessionsByDay(sessions: FlowSession[]): Record<string, FlowSession[]> {
    return sessions.reduce((acc, session) => {
      const day = new Date(session.startTime).toDateString();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(session);
      return acc;
    }, {} as Record<string, FlowSession[]>);
  }

  /**
   * Get default stats
   */
  private static getDefaultStats(): FlowStats {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalFlowTime: 0,
      averageSessionLength: 0,
      bestFlowDay: '',
      contextSwitchPenalty: 0
    };
  }

  /**
   * Clear all flow data (for testing/reset)
   */
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSIONS_KEY);
  }

  /**
   * Export flow data
   */
  static exportData(): { stats: FlowStats; sessions: FlowSession[] } {
    return {
      stats: this.getFlowStats(),
      sessions: this.getAllSessions()
    };
  }
}
/**
 * AI-Powered Eisenhower Matrix Task Organizer
 * 
 * Analyzes tasks using AI and categorizes them into the four quadrants:
 * - Quadrant 1: Urgent + Important (Do First) 
 * - Quadrant 2: Not Urgent + Important (Schedule)
 * - Quadrant 3: Urgent + Not Important (Delegate)
 * - Quadrant 4: Not Urgent + Not Important (Eliminate)
 */

import { personalTaskService, PersonalTask } from './personalTaskService';

export type EisenhowerQuadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate';

export interface EisenhowerAnalysis {
  quadrant: EisenhowerQuadrant;
  urgentScore: number; // 1-10 scale
  importanceScore: number; // 1-10 scale
  reasoning: string;
  recommendations: string[];
}

export interface TaskWithAnalysis extends PersonalTask {
  eisenhowerAnalysis: EisenhowerAnalysis;
  originalPosition?: number;
}

export interface EisenhowerMatrixResult {
  doFirst: TaskWithAnalysis[]; // Q1: Urgent + Important
  schedule: TaskWithAnalysis[]; // Q2: Important + Not Urgent  
  delegate: TaskWithAnalysis[]; // Q3: Urgent + Not Important
  eliminate: TaskWithAnalysis[]; // Q4: Not Urgent + Not Important
  totalTasks: number;
  analysisTimestamp: Date;
  summary: {
    doFirstCount: number;
    scheduleCount: number;
    delegateCount: number;
    eliminateCount: number;
    averageUrgency: number;
    averageImportance: number;
    recommendations: string[];
  };
}

export class EisenhowerMatrixOrganizer {
  
  /**
   * Analyze all personal tasks and organize them into Eisenhower Matrix quadrants
   */
  public static async organizeTasks(date: Date = new Date()): Promise<EisenhowerMatrixResult> {
    console.log('🎯 [EISENHOWER MATRIX] Starting task analysis for date:', date);
    
    // Get all tasks for the specified date
    const taskCard = personalTaskService.getTasksForDate(date);
    const tasks = taskCard.tasks;
    
    if (tasks.length === 0) {
      return this.createEmptyResult();
    }

    console.log(`📊 [EISENHOWER MATRIX] Analyzing ${tasks.length} tasks...`);
    
    // Analyze each task using AI
    const tasksWithAnalysis: TaskWithAnalysis[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      console.log(`🧠 [EISENHOWER MATRIX] Analyzing task ${i + 1}/${tasks.length}: "${task.title}"`);
      
      const analysis = await this.analyzeTaskIntelligently(task, tasks);
      const taskWithAnalysis: TaskWithAnalysis = {
        ...task,
        eisenhowerAnalysis: analysis,
        originalPosition: i
      };
      
      tasksWithAnalysis.push(taskWithAnalysis);
    }
    
    // Categorize tasks into quadrants
    const result = this.categorizeIntoQuadrants(tasksWithAnalysis);
    
    console.log('✅ [EISENHOWER MATRIX] Analysis complete!', {
      doFirst: result.doFirst.length,
      schedule: result.schedule.length, 
      delegate: result.delegate.length,
      eliminate: result.eliminate.length
    });
    
    return result;
  }

  /**
   * Intelligently analyze a task using AI-powered heuristics
   */
  private static async analyzeTaskIntelligently(task: PersonalTask, allTasks: PersonalTask[]): Promise<EisenhowerAnalysis> {
    const title = task.title.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    const workType = task.workType;
    const priority = task.priority;
    
    // Calculate urgency score (1-10)
    let urgentScore = this.calculateUrgencyScore(task, allTasks);
    
    // Calculate importance score (1-10)  
    let importanceScore = this.calculateImportanceScore(task, allTasks);
    
    // Determine quadrant based on scores
    const quadrant = this.determineQuadrant(urgentScore, importanceScore);
    
    // Generate AI reasoning
    const reasoning = this.generateReasoning(task, urgentScore, importanceScore, quadrant);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(task, quadrant);
    
    return {
      quadrant,
      urgentScore,
      importanceScore,
      reasoning,
      recommendations
    };
  }

  /**
   * Calculate urgency score using AI heuristics (1-10 scale)
   */
  private static calculateUrgencyScore(task: PersonalTask, allTasks: PersonalTask[]): number {
    const title = task.title.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    let score = 5; // Base score
    
    // Time-sensitive keywords (+3 points)
    const urgentKeywords = [
      'urgent', 'asap', 'immediately', 'now', 'today', 'deadline',
      'due', 'overdue', 'critical', 'emergency', 'fix', 'bug', 'broken',
      'down', 'issue', 'problem', 'error', 'failing', 'stuck'
    ];
    
    urgentKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 2;
      }
    });
    
    // Priority-based scoring
    switch (task.priority) {
      case 'critical': score += 4; break;
      case 'high': score += 2; break;  
      case 'medium': score += 0; break;
      case 'low': score -= 2; break;
    }
    
    // Work type urgency
    if (task.workType === 'deep') {
      score += 1; // Deep work often has deadlines
    }
    
    // Time-based urgency (older incomplete tasks become more urgent)
    const rolloverUrgency = Math.min(task.rollovers * 1.5, 3);
    score += rolloverUrgency;
    
    // Client/business critical tasks
    const businessKeywords = ['client', 'customer', 'revenue', 'launch', 'release', 'demo', 'presentation'];
    businessKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 1.5;
      }
    });
    
    // Blocking other tasks
    const blockingKeywords = ['blocking', 'dependency', 'prerequisite', 'required for', 'needed by'];
    blockingKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 2;
      }
    });
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Calculate importance score using AI heuristics (1-10 scale)
   */
  private static calculateImportanceScore(task: PersonalTask, allTasks: PersonalTask[]): number {
    const title = task.title.toLowerCase();
    const description = task.description?.toLowerCase() || '';  
    let score = 5; // Base score
    
    // Strategic/long-term keywords (+2-3 points)
    const strategicKeywords = [
      'strategy', 'planning', 'roadmap', 'architecture', 'design',
      'framework', 'foundation', 'infrastructure', 'system',
      'scalability', 'performance', 'optimization', 'improvement',
      'growth', 'expansion', 'research', 'analysis'
    ];
    
    strategicKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 2;
      }
    });
    
    // Business impact keywords (+2-3 points)
    const businessImpactKeywords = [
      'revenue', 'profit', 'customer', 'user experience', 'conversion',
      'retention', 'acquisition', 'growth', 'market', 'competitive',
      'partnership', 'integration', 'launch', 'product', 'feature'
    ];
    
    businessImpactKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 2.5;
      }
    });
    
    // Core functionality keywords (+2 points)
    const coreKeywords = [
      'authentication', 'security', 'database', 'api', 'core',
      'essential', 'fundamental', 'critical path', 'main feature',
      'primary', 'key', 'important', 'crucial', 'vital'
    ];
    
    coreKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 2;
      }
    });
    
    // Work type importance
    if (task.workType === 'deep') {
      score += 1.5; // Deep work is typically more important
    }
    
    // Priority-based scoring  
    switch (task.priority) {
      case 'critical': score += 3; break;
      case 'high': score += 1.5; break;
      case 'medium': score += 0; break; 
      case 'low': score -= 1; break;
    }
    
    // Skills development and learning (+1 point)
    const learningKeywords = ['learn', 'study', 'research', 'skill', 'training', 'course', 'tutorial'];
    learningKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score += 1;
      }
    });
    
    // Technical debt and maintenance (-0.5 for mundane tasks)
    const maintenanceKeywords = ['cleanup', 'refactor', 'maintenance', 'update dependencies', 'housekeeping'];
    maintenanceKeywords.forEach(keyword => {
      if (title.includes(keyword) || description.includes(keyword)) {
        score -= 0.5;
      }
    });
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Determine Eisenhower quadrant based on urgency and importance scores
   */
  private static determineQuadrant(urgentScore: number, importanceScore: number): EisenhowerQuadrant {
    const isUrgent = urgentScore >= 6;
    const isImportant = importanceScore >= 6;
    
    if (isUrgent && isImportant) {
      return 'do-first'; // Quadrant 1
    } else if (!isUrgent && isImportant) {
      return 'schedule'; // Quadrant 2
    } else if (isUrgent && !isImportant) {
      return 'delegate'; // Quadrant 3
    } else {
      return 'eliminate'; // Quadrant 4
    }
  }

  /**
   * Generate AI reasoning for the quadrant assignment
   */
  private static generateReasoning(
    task: PersonalTask, 
    urgentScore: number, 
    importanceScore: number, 
    quadrant: EisenhowerQuadrant
  ): string {
    const reasonings = {
      'do-first': [
        `This task scores high on both urgency (${urgentScore}/10) and importance (${importanceScore}/10), making it a top priority that requires immediate attention.`,
        `Critical task that needs immediate action due to high urgency and strategic importance.`,
        `Time-sensitive and business-critical - should be handled first to prevent escalation.`
      ],
      'schedule': [
        `Important task (${importanceScore}/10) but not urgent (${urgentScore}/10) - perfect for scheduled deep work sessions.`,
        `High strategic value with flexible timing - ideal for dedicated focus blocks.`,
        `Significant long-term impact but can be planned and executed thoughtfully.`
      ],
      'delegate': [
        `Urgent (${urgentScore}/10) but low importance (${importanceScore}/10) - consider delegating or automating if possible.`,
        `Time-sensitive but routine work that could be handled by others or tools.`,
        `Demands quick action but doesn't require your specific expertise or strategic input.`
      ],
      'eliminate': [
        `Low urgency (${urgentScore}/10) and importance (${importanceScore}/10) - consider if this task is truly necessary.`,
        `Neither time-sensitive nor strategically valuable - question its necessity.`,
        `May be busy work that doesn't contribute to your core objectives.`
      ]
    };
    
    const options = reasonings[quadrant];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate actionable recommendations based on quadrant
   */
  private static generateRecommendations(task: PersonalTask, quadrant: EisenhowerQuadrant): string[] {
    const recommendations = {
      'do-first': [
        'Schedule this for your next available time slot',
        'Block calendar time immediately to complete this task',
        'Consider if any preparation is needed before starting',
        'Set up focus environment to minimize interruptions',
        'If complex, break into smaller actionable steps'
      ],
      'schedule': [
        'Add to your weekly deep work planning session',
        'Schedule dedicated focus blocks in your calendar', 
        'Consider batching with similar important tasks',
        'Set a realistic deadline to maintain momentum',
        'Plan any research or preparation needed'
      ],
      'delegate': [
        'Identify team members or tools that could handle this',
        'Consider automating if this is a recurring task',
        'Provide clear instructions if delegating to others',
        'Set up monitoring to ensure quality delivery',
        'Look for ways to streamline or eliminate steps'
      ],
      'eliminate': [
        'Question whether this task is truly necessary',
        'Consider if the outcome justifies the time investment',
        'Look for ways to simplify or remove entirely',
        'Ask if this aligns with your current priorities',
        'Consider postponing until more important work is done'
      ]
    };
    
    const quadrantRecs = recommendations[quadrant];
    
    // Return 2-3 most relevant recommendations
    const selectedRecs = [];
    selectedRecs.push(quadrantRecs[0]); // Always include first recommendation
    
    // Add contextual recommendations based on task properties
    if (task.workType === 'deep' && quadrant === 'schedule') {
      selectedRecs.push('Schedule during your peak energy hours for deep work');
    } else if (task.rollovers > 0 && quadrant === 'do-first') {
      selectedRecs.push('This task has been rolling over - prioritize to prevent further delays');
    } else {
      selectedRecs.push(quadrantRecs[Math.floor(Math.random() * (quadrantRecs.length - 1)) + 1]);
    }
    
    return selectedRecs;
  }

  /**
   * Categorize analyzed tasks into Eisenhower quadrants
   */
  private static categorizeIntoQuadrants(tasksWithAnalysis: TaskWithAnalysis[]): EisenhowerMatrixResult {
    const doFirst = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'do-first');
    const schedule = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'schedule');
    const delegate = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'delegate');
    const eliminate = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'eliminate');
    
    // Sort each quadrant by scores (highest urgency/importance first)
    doFirst.sort((a, b) => (b.eisenhowerAnalysis.urgentScore + b.eisenhowerAnalysis.importanceScore) - 
                          (a.eisenhowerAnalysis.urgentScore + a.eisenhowerAnalysis.importanceScore));
    
    schedule.sort((a, b) => b.eisenhowerAnalysis.importanceScore - a.eisenhowerAnalysis.importanceScore);
    
    delegate.sort((a, b) => b.eisenhowerAnalysis.urgentScore - a.eisenhowerAnalysis.urgentScore);
    
    eliminate.sort((a, b) => a.eisenhowerAnalysis.importanceScore - b.eisenhowerAnalysis.importanceScore);
    
    // Calculate summary statistics
    const totalTasks = tasksWithAnalysis.length;
    const avgUrgency = tasksWithAnalysis.reduce((sum, t) => sum + t.eisenhowerAnalysis.urgentScore, 0) / totalTasks;
    const avgImportance = tasksWithAnalysis.reduce((sum, t) => sum + t.eisenhowerAnalysis.importanceScore, 0) / totalTasks;
    
    // Generate overall recommendations
    const overallRecommendations = this.generateOverallRecommendations(doFirst, schedule, delegate, eliminate);
    
    return {
      doFirst,
      schedule, 
      delegate,
      eliminate,
      totalTasks,
      analysisTimestamp: new Date(),
      summary: {
        doFirstCount: doFirst.length,
        scheduleCount: schedule.length,
        delegateCount: delegate.length,
        eliminateCount: eliminate.length,
        averageUrgency: Math.round(avgUrgency * 10) / 10,
        averageImportance: Math.round(avgImportance * 10) / 10,
        recommendations: overallRecommendations
      }
    };
  }

  /**
   * Generate overall recommendations based on quadrant distribution
   */
  private static generateOverallRecommendations(
    doFirst: TaskWithAnalysis[],
    schedule: TaskWithAnalysis[], 
    delegate: TaskWithAnalysis[],
    eliminate: TaskWithAnalysis[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (doFirst.length > 5) {
      recommendations.push('🚨 High crisis load detected - consider what can be delegated or postponed');
    } else if (doFirst.length === 0) {
      recommendations.push('✅ No urgent crises - great opportunity to focus on important strategic work');
    }
    
    if (schedule.length > doFirst.length) {
      recommendations.push('🎯 Good balance - most tasks are important but not urgent, allowing for planned execution');
    }
    
    if (delegate.length > 3) {
      recommendations.push('📤 Consider delegation opportunities - many urgent but non-critical tasks detected');
    }
    
    if (eliminate.length > 2) {
      recommendations.push('🗑️ Review elimination candidates - some tasks may not be worth pursuing');
    }
    
    if (schedule.length < 2) {
      recommendations.push('📈 Consider adding more strategic/important tasks to your pipeline');
    }
    
    // Always add a productivity tip
    const productivityTips = [
      '⏰ Schedule your Do First tasks during your peak energy hours',
      '📅 Block specific time slots for Quadrant 2 (Schedule) activities',
      '🎯 Focus on completing Quadrant 1 tasks before moving to others', 
      '🔄 Review and reorganize tasks weekly to maintain proper prioritization'
    ];
    
    recommendations.push(productivityTips[Math.floor(Math.random() * productivityTips.length)]);
    
    return recommendations;
  }

  /**
   * Apply the organized task order back to personal task service
   */
  public static async applyOrganizedOrder(matrixResult: EisenhowerMatrixResult, date: Date = new Date()): Promise<void> {
    console.log('🔄 [EISENHOWER MATRIX] Applying organized task order...');
    
    // Create new ordered task list based on Eisenhower priority
    const orderedTasks: PersonalTask[] = [
      ...matrixResult.doFirst,
      ...matrixResult.schedule,
      ...matrixResult.delegate,
      ...matrixResult.eliminate
    ];
    
    // Update task priorities based on quadrant
    const updatedTasks = orderedTasks.map(task => ({
      ...task,
      priority: this.mapQuadrantToPriority(task.eisenhowerAnalysis.quadrant),
      // Remove analysis to avoid storage bloat
      eisenhowerAnalysis: undefined
    })) as PersonalTask[];
    
    // Replace tasks in personal task service
    personalTaskService.replaceTasks(updatedTasks, date);
    
    console.log('✅ [EISENHOWER MATRIX] Task order applied successfully!');
  }

  /**
   * Map Eisenhower quadrant to task priority
   */
  private static mapQuadrantToPriority(quadrant: EisenhowerQuadrant): 'critical' | 'high' | 'medium' | 'low' {
    const mapping = {
      'do-first': 'critical' as const,
      'schedule': 'high' as const,
      'delegate': 'medium' as const,
      'eliminate': 'low' as const
    };
    
    return mapping[quadrant];
  }

  /**
   * Create empty result when no tasks available
   */
  private static createEmptyResult(): EisenhowerMatrixResult {
    return {
      doFirst: [],
      schedule: [],
      delegate: [],
      eliminate: [],
      totalTasks: 0,
      analysisTimestamp: new Date(),
      summary: {
        doFirstCount: 0,
        scheduleCount: 0,
        delegateCount: 0,
        eliminateCount: 0,
        averageUrgency: 0,
        averageImportance: 0,
        recommendations: ['No tasks to analyze - add some tasks to get started!']
      }
    };
  }
  
  /**
   * Get a quick preview of task organization without full analysis
   */
  public static getQuickPreview(date: Date = new Date()): { taskCount: number; estimatedQuadrants: Record<EisenhowerQuadrant, number> } {
    const taskCard = personalTaskService.getTasksForDate(date);
    const tasks = taskCard.tasks;
    
    // Quick heuristic estimation without full AI analysis
    const estimatedQuadrants: Record<EisenhowerQuadrant, number> = {
      'do-first': 0,
      'schedule': 0, 
      'delegate': 0,
      'eliminate': 0
    };
    
    tasks.forEach(task => {
      const isHighPriority = task.priority === 'critical' || task.priority === 'high';
      const hasUrgentKeywords = /urgent|asap|today|deadline|fix|bug|issue/.test(task.title.toLowerCase());
      
      if (hasUrgentKeywords && isHighPriority) {
        estimatedQuadrants['do-first']++;
      } else if (!hasUrgentKeywords && isHighPriority) {
        estimatedQuadrants['schedule']++;
      } else if (hasUrgentKeywords && !isHighPriority) {
        estimatedQuadrants['delegate']++;
      } else {
        estimatedQuadrants['eliminate']++;
      }
    });
    
    return {
      taskCount: tasks.length,
      estimatedQuadrants
    };
  }
}

// Export singleton for easy usage
export const eisenhowerMatrixOrganizer = EisenhowerMatrixOrganizer;
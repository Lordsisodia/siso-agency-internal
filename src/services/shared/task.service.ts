/**
 * Minimal task service for build compatibility
 * Provides stub implementations for eisenhowerMatrixOrganizer
 */

export type EisenhowerQuadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate';

export interface EisenhowerAnalysis {
  quadrant: EisenhowerQuadrant;
  urgentScore: number;
  importanceScore: number;
  reasoning: string;
  recommendations: string[];
}

export interface TaskWithAnalysis {
  id: string;
  title: string;
  eisenhowerAnalysis: EisenhowerAnalysis;
  originalPosition?: number;
  [key: string]: any;
}

export interface EisenhowerMatrixResult {
  doFirst: TaskWithAnalysis[];
  schedule: TaskWithAnalysis[];
  delegate: TaskWithAnalysis[];
  eliminate: TaskWithAnalysis[];
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

class EisenhowerMatrixOrganizer {
  async organizeTasks(tasks: any[]): Promise<EisenhowerMatrixResult> {
    console.log('🎯 [EISENHOWER MATRIX] Analyzing tasks...');
    
    if (!tasks || tasks.length === 0) {
      return this.createEmptyResult();
    }

    // Simple heuristic-based analysis
    const tasksWithAnalysis: TaskWithAnalysis[] = tasks.map((task, index) => {
      const analysis = this.analyzeTask(task);
      return {
        ...task,
        eisenhowerAnalysis: analysis,
        originalPosition: index
      };
    });

    return this.categorizeIntoQuadrants(tasksWithAnalysis);
  }

  private analyzeTask(task: any): EisenhowerAnalysis {
    const title = task.title?.toLowerCase() || '';
    const priority = task.priority || 'medium';
    
    // Simple urgency scoring
    let urgentScore = 5;
    if (title.includes('urgent') || title.includes('asap') || title.includes('bug')) urgentScore += 3;
    if (priority === 'high' || priority === 'critical') urgentScore += 2;
    
    // Simple importance scoring
    let importanceScore = 5;
    if (priority === 'high' || priority === 'critical') importanceScore += 3;
    if (title.includes('important') || title.includes('critical')) importanceScore += 2;
    
    urgentScore = Math.max(1, Math.min(10, urgentScore));
    importanceScore = Math.max(1, Math.min(10, importanceScore));
    
    const quadrant = this.determineQuadrant(urgentScore, importanceScore);
    
    return {
      quadrant,
      urgentScore,
      importanceScore,
      reasoning: `Urgency: ${urgentScore}/10, Importance: ${importanceScore}/10`,
      recommendations: ['Review and prioritize accordingly']
    };
  }

  private determineQuadrant(urgentScore: number, importanceScore: number): EisenhowerQuadrant {
    const isUrgent = urgentScore >= 6;
    const isImportant = importanceScore >= 6;
    
    if (isUrgent && isImportant) return 'do-first';
    if (!isUrgent && isImportant) return 'schedule';
    if (isUrgent && !isImportant) return 'delegate';
    return 'eliminate';
  }

  private categorizeIntoQuadrants(tasksWithAnalysis: TaskWithAnalysis[]): EisenhowerMatrixResult {
    const doFirst = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'do-first');
    const schedule = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'schedule');
    const delegate = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'delegate');
    const eliminate = tasksWithAnalysis.filter(t => t.eisenhowerAnalysis.quadrant === 'eliminate');
    
    const totalTasks = tasksWithAnalysis.length;
    const avgUrgency = tasksWithAnalysis.reduce((sum, t) => sum + t.eisenhowerAnalysis.urgentScore, 0) / totalTasks;
    const avgImportance = tasksWithAnalysis.reduce((sum, t) => sum + t.eisenhowerAnalysis.importanceScore, 0) / totalTasks;
    
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
        recommendations: []
      }
    };
  }

  private createEmptyResult(): EisenhowerMatrixResult {
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
        recommendations: ['No tasks to analyze']
      }
    };
  }
}

export const eisenhowerMatrixOrganizer = new EisenhowerMatrixOrganizer();

// Stub classes for compatibility
class AITaskAgent {
  async processThoughtDump(input: string): Promise<any> {
    console.log('🤖 [AI] Processing thought dump...');
    return { tasks: [], analysis: '' };
  }
}

class GrokTaskService {
  async analyzeTask(task: any): Promise<any> {
    console.log('🧠 [GROK] Analyzing task...');
    return { insights: [] };
  }
}

export const aiTaskAgent = new AITaskAgent();
export const grokTaskService = new GrokTaskService();

// Additional stub classes and types
export interface ProjectTaskSummary {
  projectId: string;
  projectName: string;
  taskCount: number;
  completedCount: number;
}

export interface WorkTypeTaskSummary {
  workType: string;
  taskCount: number;
  completedCount: number;
}

export interface TaskRecommendation {
  task: any;
  reason: string;
  priority: number;
}

export interface DailyWorkflowSummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  recommendations: TaskRecommendation[];
}

export interface DailyRoutineItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface DailyRoutine {
  items: DailyRoutineItem[];
}

export interface DailyWorkout {
  exercises: any[];
}

export interface DailyHealth {
  metrics: any[];
}

export interface DailyHabits {
  habits: any[];
}

export interface DailyReflections {
  reflections: string[];
}

export interface DeepWorkSession {
  id: string;
  startTime: Date;
  duration: number;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodayTask {
  id: string;
  title: string;
}

export interface PersonalTaskCard {
  tasks: any[];
}

export type FocusIntensity = 'light' | 'deep';
export type TaskContext = any;

class ProjectBasedTaskAgent {
  constructor(userId?: string) {
    console.log('🎯 [PROJECT] ProjectBasedTaskAgent initialized');
  }
  
  async getProjectSummaries(): Promise<ProjectTaskSummary[]> {
    return [];
  }
  
  async getWorkTypeSummaries(): Promise<WorkTypeTaskSummary[]> {
    return [];
  }
}

class TaskManagementAgent {
  async getDailyWorkflow(): Promise<DailyWorkflowSummary> {
    return {
      date: new Date().toISOString(),
      totalTasks: 0,
      completedTasks: 0,
      recommendations: []
    };
  }
}

class EnhancedTaskService {
  async getEnhancedTasks(): Promise<EnhancedTask[]> {
    return [];
  }
}

class HybridTaskService {
  async getTasks(): Promise<any[]> {
    return [];
  }
}

class HybridUsageTracker {
  async trackUsage(): Promise<void> {
    console.log('📊 [USAGE] Tracking usage...');
  }
}

class LifeLockService {
  async getRoutine(): Promise<DailyRoutine> {
    return { items: [] };
  }
}

class TodayTasksService {
  async getTodayTasks(): Promise<TodayTask[]> {
    return [];
  }
}

class EnhancedTimeBlockService {
  async getTimeBlocks(): Promise<any[]> {
    return [];
  }
}

export { ProjectBasedTaskAgent };
export default TaskManagementAgent;
export const enhancedTaskService = new EnhancedTaskService();
export const hybridTaskService = new HybridTaskService();
export const enhancedTimeBlockService = new EnhancedTimeBlockService();

// Re-export from workTypeApiClient for compatibility
export { personalTaskService } from '@/domains/task-ui/services/workTypeApiClient';

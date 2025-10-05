// LifeLock Voice Task Processor
// Converts thought dumps into organized Deep vs Light work tasks
import { aiTaskAgent } from './aiTaskAgent';
import { grokTaskService } from './grokTaskService';

export interface LifeLockTask {
  id: string;
  title: string;
  description?: string;
  workType: 'deep' | 'light';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration?: number; // minutes
  subtasks?: LifeLockSubtask[];
  tags?: string[];
  category?: string;
}

export interface LifeLockSubtask {
  id: string;
  title: string;
  completed: boolean;
  workType: 'deep' | 'light';
}

export interface ThoughtDumpResult {
  success: boolean;
  message: string;
  deepTasks: LifeLockTask[];
  lightTasks: LifeLockTask[];
  totalTasks: number;
  processingNotes?: string;
}

export class LifeLockVoiceTaskProcessor {
  
  /**
   * Main entry point for processing thought dumps
   */
  public static async processThoughtDump(voiceInput: string): Promise<ThoughtDumpResult> {
    console.log('🧠 [LIFELOCK PROCESSOR] Processing thought dump:', voiceInput);
    
    try {
      // Step 1: Parse and split the thought dump into individual tasks
      const parsedTasks = await this.parseThoughtDump(voiceInput);
      
      // Step 2: Categorize each task as Deep or Light work
      const categorizedTasks = await this.categorizeTasksByWorkType(parsedTasks);
      
      // Step 3: Organize into Deep vs Light buckets
      const deepTasks = categorizedTasks.filter(task => task.workType === 'deep');
      const lightTasks = categorizedTasks.filter(task => task.workType === 'light');
      
      const result: ThoughtDumpResult = {
        success: true,
        message: this.generateSuccessMessage(deepTasks.length, lightTasks.length),
        deepTasks,
        lightTasks,
        totalTasks: categorizedTasks.length,
        processingNotes: this.generateProcessingNotes(voiceInput, categorizedTasks)
      };
      
      console.log('✅ [LIFELOCK PROCESSOR] Successfully processed thought dump:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [LIFELOCK PROCESSOR] Error processing thought dump:', error);
      return {
        success: false,
        message: 'Failed to process your thought dump. Please try again.',
        deepTasks: [],
        lightTasks: [],
        totalTasks: 0
      };
    }
  }
  
  /**
   * Parse thought dump and split into individual tasks using AI
   */
  private static async parseThoughtDump(input: string): Promise<Partial<LifeLockTask>[]> {
    console.log('🔍 [LIFELOCK PARSER] Parsing thought dump...');
    
    // Use existing AI Task Agent for intelligent parsing
    const commands = aiTaskAgent.parseCommand(input);
    const commandArray = Array.isArray(commands) ? commands : [commands];
    
    const tasks: Partial<LifeLockTask>[] = [];
    
    for (const command of commandArray) {
      if (command.action === 'create' && command.content) {
        const task: Partial<LifeLockTask> = {
          id: this.generateTaskId(),
          title: command.content.title || 'Untitled Task',
          description: command.content.description,
          priority: this.mapPriority(command.content.priority),
          estimatedDuration: command.content.estimatedHours ? command.content.estimatedHours * 60 : undefined,
          category: command.content.category
        };
        
        tasks.push(task);
      }
    }
    
    // If AI Task Agent didn't parse tasks, use Grok for more complex processing
    if (tasks.length === 0) {
      const grokResult = await grokTaskService.chatWithGrok({
        message: `Please break down this thought dump into individual, actionable tasks: "${input}"`,
        tasks: [],
        action: 'create'
      });
      
      if (grokResult.tasks) {
        for (const grokTask of grokResult.tasks) {
          tasks.push({
            id: this.generateTaskId(),
            title: grokTask.title,
            description: grokTask.description,
            priority: this.mapPriority(grokTask.priority),
            estimatedDuration: grokTask.estimatedHours ? grokTask.estimatedHours * 60 : undefined,
            category: grokTask.category
          });
        }
      }
    }
    
    // Fallback: Simple task extraction if AI fails
    if (tasks.length === 0) {
      tasks.push({
        id: this.generateTaskId(),
        title: this.cleanupTaskText(input),
        description: `Task created from thought dump: "${input}"`,
        priority: 'medium'
      });
    }
    
    console.log(`🔍 [LIFELOCK PARSER] Extracted ${tasks.length} tasks`);
    return tasks;
  }
  
  /**
   * Categorize tasks as Deep vs Light work
   */
  private static async categorizeTasksByWorkType(tasks: Partial<LifeLockTask>[]): Promise<LifeLockTask[]> {
    console.log('🏷️ [LIFELOCK CATEGORIZER] Categorizing tasks by work type...');
    
    const categorizedTasks: LifeLockTask[] = [];
    
    for (const task of tasks) {
      const workType = this.determineWorkType(task.title || '', task.description || '');
      
      // Break down into subtasks if the task is complex
      const subtasks = this.extractSubtasks(task.title || '', task.description || '');
      
      const categorizedTask: LifeLockTask = {
        id: task.id || this.generateTaskId(),
        title: task.title || 'Untitled Task',
        description: task.description,
        workType,
        priority: task.priority || 'medium',
        estimatedDuration: task.estimatedDuration || this.estimateDuration(workType, task.title || ''),
        subtasks,
        tags: this.generateTags(task.title || '', task.description || ''),
        category: task.category
      };
      
      categorizedTasks.push(categorizedTask);
    }
    
    console.log(`🏷️ [LIFELOCK CATEGORIZER] Categorized ${categorizedTasks.length} tasks`);
    return categorizedTasks;
  }
  
  /**
   * Determine if a task is Deep or Light work
   */
  private static determineWorkType(title: string, description: string): 'deep' | 'light' {
    const content = (title + ' ' + (description || '')).toLowerCase();
    
    // Deep work indicators
    const deepWorkKeywords = [
      // Cognitive intensive
      'design', 'architect', 'research', 'analyze', 'develop', 'code', 'program',
      'write', 'create', 'build', 'implement', 'debug', 'solve', 'plan',
      'strategy', 'algorithm', 'complex', 'difficult', 'focus', 'concentrate',
      // Time intensive
      'deep', 'thorough', 'comprehensive', 'detailed', 'in-depth', 'extensive',
      // Creative work
      'brainstorm', 'innovate', 'creative', 'concept', 'ideate', 'prototype',
      // Learning/thinking
      'learn', 'study', 'understand', 'figure out', 'think through', 'problem solving'
    ];
    
    // Light work indicators  
    const lightWorkKeywords = [
      // Administrative
      'email', 'message', 'call', 'meeting', 'schedule', 'organize', 'file',
      'update', 'check', 'review', 'approve', 'confirm', 'respond',
      // Quick tasks
      'quick', 'simple', 'easy', 'fast', 'brief', 'short', 'minor',
      // Communication
      'text', 'phone', 'chat', 'slack', 'teams', 'zoom', 'discuss',
      // Routine tasks
      'backup', 'sync', 'upload', 'download', 'copy', 'paste', 'move',
      'delete', 'clean', 'tidy', 'sort', 'list', 'bookmark'
    ];
    
    const deepScore = deepWorkKeywords.filter(keyword => content.includes(keyword)).length;
    const lightScore = lightWorkKeywords.filter(keyword => content.includes(keyword)).length;
    
    // Default to deep work if unclear - better to overestimate complexity
    return lightScore > deepScore ? 'light' : 'deep';
  }
  
  /**
   * Extract subtasks from task description
   */
  private static extractSubtasks(title: string, description: string): LifeLockSubtask[] {
    const content = title + ' ' + (description || '');
    const subtasks: LifeLockSubtask[] = [];
    
    // Look for common patterns that indicate subtasks
    const subtaskPatterns = [
      /(?:then|and then|after that|next|also|plus)\s+([^.!?]+)/gi,
      /(?:step \d+[:.]?)\s*([^.!?]+)/gi,
      /(?:\d+[.)])\s*([^.!?]+)/gi,
      /(?:first|second|third|finally|lastly)\s+([^.!?]+)/gi
    ];
    
    for (const pattern of subtaskPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const subtaskTitle = match[1].trim();
        if (subtaskTitle.length > 5 && subtaskTitle.length < 100) {
          const workType = this.determineWorkType(subtaskTitle, '');
          subtasks.push({
            id: this.generateTaskId(),
            title: this.cleanupTaskText(subtaskTitle),
            completed: false,
            workType
          });
        }
      }
    }
    
    return subtasks;
  }
  
  /**
   * Estimate task duration based on work type and complexity
   */
  private static estimateDuration(workType: 'deep' | 'light', title: string): number {
    const titleLength = title.length;
    const complexityIndicators = ['complex', 'difficult', 'comprehensive', 'detailed', 'thorough'];
    const isComplex = complexityIndicators.some(indicator => title.toLowerCase().includes(indicator));
    
    if (workType === 'deep') {
      // Deep work: 60-240 minutes
      if (isComplex || titleLength > 50) return 180; // 3 hours
      if (titleLength > 30) return 120; // 2 hours
      return 90; // 1.5 hours default
    } else {
      // Light work: 5-60 minutes
      if (isComplex || titleLength > 40) return 45; // 45 minutes
      if (titleLength > 20) return 30; // 30 minutes
      return 15; // 15 minutes default
    }
  }
  
  /**
   * Generate relevant tags for the task
   */
  private static generateTags(title: string, description: string): string[] {
    const content = (title + ' ' + (description || '')).toLowerCase();
    const tags: string[] = [];
    
    // Project tags
    if (content.includes('siso') || content.includes('agency')) tags.push('siso-agency');
    if (content.includes('ubahcrypt') || content.includes('crypto') || content.includes('trading')) tags.push('ubahcrypt');
    if (content.includes('lifelock') || content.includes('life lock')) tags.push('lifelock');
    
    // Technology tags
    if (content.includes('react') || content.includes('typescript') || content.includes('javascript')) tags.push('frontend');
    if (content.includes('api') || content.includes('backend') || content.includes('server')) tags.push('backend');
    if (content.includes('database') || content.includes('supabase') || content.includes('sql')) tags.push('database');
    
    // Work type tags
    if (content.includes('bug') || content.includes('fix') || content.includes('error')) tags.push('bugfix');
    if (content.includes('feature') || content.includes('new') || content.includes('add')) tags.push('feature');
    if (content.includes('improve') || content.includes('optimize') || content.includes('enhance')) tags.push('improvement');
    
    return tags;
  }
  
  /**
   * Utility functions
   */
  private static generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private static mapPriority(priority?: string): 'urgent' | 'high' | 'medium' | 'low' {
    if (!priority) return 'medium';
    const p = priority.toLowerCase();
    if (p === 'urgent' || p === 'critical') return 'urgent';
    if (p === 'high' || p === 'important') return 'high';
    if (p === 'low' || p === 'optional') return 'low';
    return 'medium';
  }
  
  private static cleanupTaskText(text: string): string {
    return text
      .trim()
      .replace(/^(i need to|we need to|should|must|have to|need to)\s+/i, '')
      .replace(/\s+/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }
  
  private static generateSuccessMessage(deepCount: number, lightCount: number): string {
    const total = deepCount + lightCount;
    if (total === 0) return 'No tasks were extracted from your thought dump.';
    if (total === 1) return `Created 1 task: ${deepCount ? '1 deep work task' : '1 light work task'}`;
    
    const parts: string[] = [];
    if (deepCount > 0) parts.push(`${deepCount} deep work task${deepCount > 1 ? 's' : ''}`);
    if (lightCount > 0) parts.push(`${lightCount} light work task${lightCount > 1 ? 's' : ''}`);
    
    return `Created ${total} tasks: ${parts.join(' and ')}`;
  }
  
  private static generateProcessingNotes(input: string, tasks: LifeLockTask[]): string {
    const notes: string[] = [];
    
    if (input.length > 200) {
      notes.push('Long thought dump - broke down into multiple focused tasks');
    }
    
    const deepTasks = tasks.filter(t => t.workType === 'deep').length;
    const lightTasks = tasks.filter(t => t.workType === 'light').length;
    
    if (deepTasks > lightTasks) {
      notes.push('Mostly complex work detected - schedule deep focus time');
    } else if (lightTasks > deepTasks) {
      notes.push('Mostly quick tasks - good for low-energy periods');
    }
    
    const hasSubtasks = tasks.some(t => t.subtasks && t.subtasks.length > 0);
    if (hasSubtasks) {
      notes.push('Some tasks were broken down into subtasks');
    }
    
    return notes.join('. ');
  }
}

// Export singleton instance
export const lifeLockVoiceTaskProcessor = LifeLockVoiceTaskProcessor;
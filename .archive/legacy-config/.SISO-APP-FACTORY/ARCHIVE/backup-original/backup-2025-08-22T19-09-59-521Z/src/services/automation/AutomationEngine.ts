import { supabase } from '@/integrations/supabase/client';
import { RateLimitManager } from './RateLimitManager';
import { TokenUsageTracker } from './TokenUsageTracker';
// NOTE: ClaudeCodeIntegration uses Node.js modules and cannot be imported in browser
// import { ClaudeCodeIntegration } from './ClaudeCodeIntegration';

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'testing' | 'deployment' | 'analysis' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  prompt: string;
  allowedTools: string[];
  estimatedTokens: number;
  actualTokens?: number;
  executionTimeMs?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface AutomationJob {
  id: string;
  taskId: string;
  claudeProcess?: any;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

export class AutomationEngine {
  private rateLimitManager: RateLimitManager;
  private tokenTracker: TokenUsageTracker;
  // private claudeIntegration: ClaudeCodeIntegration;
  private activeJobs: Map<string, AutomationJob> = new Map();
  private jobQueue: AutomationTask[] = [];
  private isProcessing = false;

  constructor() {
    this.rateLimitManager = new RateLimitManager();
    this.tokenTracker = new TokenUsageTracker();
    // ClaudeCodeIntegration cannot be used in browser environment
    // this.claudeIntegration = new ClaudeCodeIntegration();
    
    // Start processing queue
    this.processQueue();
  }

  /**
   * Submit a new automation task
   */
  async submitTask(task: Omit<AutomationTask, 'id' | 'createdAt' | 'status'>): Promise<string> {
    // Check rate limits before adding to queue
    const canExecute = await this.rateLimitManager.checkLimit(
      task.category,
      task.estimatedTokens
    );

    if (!canExecute) {
      throw new Error(`Rate limit exceeded for category: ${task.category}`);
    }

    const taskId = crypto.randomUUID();
    const automationTask: AutomationTask = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date()
    };

    // Save task to database
    await this.saveTaskToDatabase(automationTask);
    
    // Add to queue
    this.jobQueue.push(automationTask);
    
    // Sort queue by priority
    this.jobQueue.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log(`🎯 Task submitted: ${task.name} (ID: ${taskId})`);
    return taskId;
  }

  /**
   * Get current automation status
   */
  getAutomationStatus() {
    return {
      queueLength: this.jobQueue.length,
      activeJobs: Array.from(this.activeJobs.values()),
      isProcessing: this.isProcessing,
      rateLimits: this.rateLimitManager.getCurrentLimits(),
      tokenUsage: this.tokenTracker.getCurrentUsage()
    };
  }

  /**
   * Get detailed task information
   */
  async getTask(taskId: string): Promise<AutomationTask | null> {
    const { data, error } = await supabase
      .from('automation_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !data) return null;
    return this.mapDatabaseToTask(data);
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const job = this.activeJobs.get(taskId);
    if (job && job.status === 'running') {
      // Stop the Claude process
      if (job.claudeProcess) {
        // TODO: Implement server-side Claude process management
        console.log('Would stop Claude process:', job.claudeProcess);
      }
      
      job.status = 'cancelled';
      job.endTime = new Date();
      this.activeJobs.delete(taskId);
      
      // Update database
      await this.updateTaskStatus(taskId, 'failed', 'Task cancelled by user');
      
      console.log(`❌ Task cancelled: ${taskId}`);
      return true;
    }
    
    // Remove from queue if pending
    const queueIndex = this.jobQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.jobQueue.splice(queueIndex, 1);
      await this.updateTaskStatus(taskId, 'failed', 'Task cancelled before execution');
      return true;
    }
    
    return false;
  }

  /**
   * Process the task queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (true) {
      // Wait for next task in queue
      if (this.jobQueue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const task = this.jobQueue.shift()!;
      
      // Check if we can execute this task (rate limits, token limits)
      const canExecute = await this.rateLimitManager.checkLimit(
        task.category,
        task.estimatedTokens
      );

      if (!canExecute) {
        // Put task back at end of queue and wait
        this.jobQueue.push(task);
        console.log(`⏳ Rate limit reached, delaying task: ${task.name}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      // Execute the task
      await this.executeTask(task);
      
      // Wait between tasks to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Execute a single automation task
   */
  private async executeTask(task: AutomationTask) {
    const jobId = task.id;
    const job: AutomationJob = {
      id: jobId,
      taskId: task.id,
      status: 'running',
      progress: 0,
      logs: [],
      startTime: new Date()
    };

    this.activeJobs.set(jobId, job);
    
    try {
      console.log(`🚀 Starting task: ${task.name}`);
      
      // Update task status
      await this.updateTaskStatus(task.id, 'running');
      task.startedAt = new Date();
      
      // Record rate limit usage
      await this.rateLimitManager.recordUsage(task.category, task.estimatedTokens);
      
      // Execute with Claude Code (Mock implementation for browser)
      // TODO: Implement server-side Claude Code execution
      
      // Simulate progress updates
      job.progress = 10;
      job.logs.push(`[${new Date().toISOString()}] Starting task execution...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      job.progress = 50;
      job.logs.push(`[${new Date().toISOString()}] Processing request...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      job.progress = 90;
      job.logs.push(`[${new Date().toISOString()}] Finalizing results...`);
      
      const result = {
        success: true,
        output: `Mock execution result for: ${task.name}\n\nTask would execute with prompt:\n${task.prompt.substring(0, 200)}...`,
        tokenUsage: task.estimatedTokens,
        executionTimeMs: Math.random() * 3000 + 2000,
        logs: [`Task ${task.name} completed successfully (mock implementation)`]
      };
      
      /* Real implementation for server-side:
      const result = await this.claudeIntegration.executeTask({
        prompt: task.prompt,
        allowedTools: task.allowedTools,
        onProgress: (progress: number, log: string) => {
          job.progress = progress;
          job.logs.push(`[${new Date().toISOString()}] ${log}`);
          console.log(`📊 ${task.name}: ${progress}% - ${log}`);
        }
      });
      */

      // Record actual token usage
      if (result.tokenUsage) {
        await this.tokenTracker.recordUsage(
          'claude-code',
          result.tokenUsage,
          task.category,
          {
            taskId: task.id,
            taskName: task.name,
            prompt: task.prompt.substring(0, 100) + '...'
          }
        );
        task.actualTokens = result.tokenUsage;
      }

      // Update completion
      task.completedAt = new Date();
      task.executionTimeMs = task.completedAt.getTime() - task.startedAt!.getTime();
      task.result = result.output;
      
      job.status = 'completed';
      job.endTime = new Date();
      job.progress = 100;
      job.logs.push(`✅ Task completed successfully`);
      
      await this.updateTaskStatus(task.id, 'completed', undefined, {
        result: result.output,
        tokenUsage: result.tokenUsage,
        executionTimeMs: task.executionTimeMs
      });
      
      console.log(`✅ Task completed: ${task.name} (${task.executionTimeMs}ms, ${result.tokenUsage} tokens)`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      task.error = errorMessage;
      job.status = 'failed';
      job.endTime = new Date();
      job.logs.push(`❌ Task failed: ${errorMessage}`);
      
      await this.updateTaskStatus(task.id, 'failed', errorMessage);
      
      console.error(`❌ Task failed: ${task.name} - ${errorMessage}`);
    }
    
    // Clean up job after 5 minutes
    setTimeout(() => {
      this.activeJobs.delete(jobId);
    }, 5 * 60 * 1000);
  }

  /**
   * Save task to database
   */
  private async saveTaskToDatabase(task: AutomationTask) {
    const { error } = await supabase
      .from('automation_tasks')
      .insert([{
        id: task.id,
        name: task.name,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        prompt: task.prompt,
        allowed_tools: task.allowedTools,
        estimated_tokens: task.estimatedTokens,
        created_by: task.createdBy,
        metadata: task.metadata || {}
      }]);

    if (error) {
      throw new Error(`Failed to save task: ${error.message}`);
    }
  }

  /**
   * Update task status in database
   */
  private async updateTaskStatus(
    taskId: string, 
    status: AutomationTask['status'], 
    error?: string,
    additionalData?: Record<string, any>
  ) {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (error) updateData.error = error;
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    const { error: dbError } = await supabase
      .from('automation_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (dbError) {
      console.error(`Failed to update task status: ${dbError.message}`);
    }
  }

  /**
   * Map database record to AutomationTask
   */
  private mapDatabaseToTask(data: any): AutomationTask {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      prompt: data.prompt,
      allowedTools: data.allowed_tools || [],
      estimatedTokens: data.estimated_tokens,
      actualTokens: data.actual_tokens,
      executionTimeMs: data.execution_time_ms,
      result: data.result,
      error: data.error,
      createdAt: new Date(data.created_at),
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdBy: data.created_by,
      metadata: data.metadata || {}
    };
  }

  /**
   * Get automation analytics
   */
  async getAnalytics(timeRange: 'day' | 'week' | 'month' = 'week') {
    let dateFilter = '';
    const now = new Date();
    
    switch (timeRange) {
      case 'day':
        dateFilter = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
        break;
    }

    const { data, error } = await supabase
      .from('automation_tasks')
      .select('*')
      .gte('created_at', dateFilter);

    if (error) throw error;

    const tasks = data.map(this.mapDatabaseToTask);
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      averageExecutionTime: this.calculateAverageExecutionTime(tasks),
      totalTokensUsed: tasks.reduce((sum, t) => sum + (t.actualTokens || 0), 0),
      tasksByCategory: this.groupTasksByCategory(tasks),
      tasksByPriority: this.groupTasksByPriority(tasks)
    };
  }

  private calculateAverageExecutionTime(tasks: AutomationTask[]): number {
    const completedTasks = tasks.filter(t => t.executionTimeMs);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, t) => sum + (t.executionTimeMs || 0), 0);
    return Math.round(totalTime / completedTasks.length);
  }

  private groupTasksByCategory(tasks: AutomationTask[]) {
    return tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTasksByPriority(tasks: AutomationTask[]) {
    return tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();
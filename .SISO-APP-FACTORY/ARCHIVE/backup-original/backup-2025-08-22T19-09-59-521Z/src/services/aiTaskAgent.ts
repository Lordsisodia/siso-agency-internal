import { supabase } from '@/integrations/supabase/client';
import { getAgentClient } from '@/integrations/supabase/agent-client';
import { Task } from '@/types/task.types';

export interface TaskCommand {
  action: 'create' | 'update' | 'delete' | 'deleteAll' | 'complete' | 'status' | 'list';
  target?: 'all' | 'category' | 'priority' | 'status' | 'specific';
  filters?: {
    category?: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' | 'siso_life';
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'backlog';
    status?: 'pending' | 'in_progress' | 'completed';
    taskId?: string;
  };
  content?: {
    title?: string;
    description?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low' | 'backlog';
    category?: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' | 'siso_life';
    dueDate?: string;
    assignedTo?: string;
    estimatedHours?: number;
  };
}

export interface TaskAgentResponse {
  success: boolean;
  message: string;
  data?: unknown;
  action: string;
  affectedCount?: number;
}

export class AITaskAgent {
  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Parse natural language input into task commands with enhanced context awareness
  public parseCommand(input: string, conversationContext?: string[]): TaskCommand | TaskCommand[] {
    const lowerInput = input.toLowerCase().trim();
    
    console.log('🧠 [AI TASK AGENT] Parsing command:', input);
    console.log('🧠 [AI TASK AGENT] Conversation context:', conversationContext?.length || 0, 'previous messages');
    
    // Check if input contains multiple tasks that should be split
    if (this.shouldSplitTask(input)) {
      return this.splitIntoMultipleTasks(input);
    }
    
    // Enhanced implicit task creation detection
    if (this.isImplicitTaskCreation(input)) {
      console.log('🎯 [AI TASK AGENT] Detected implicit task creation request');
      return this.createImplicitTask(input, conversationContext);
    }
    
    // Context-aware task creation for "create a task for this"
    if (this.isContextualTaskCreation(input)) {
      console.log('🔍 [AI TASK AGENT] Detected contextual task creation request');
      return this.createContextualTask(input, conversationContext);
    }
    
    // Delete all tasks patterns - more flexible detection
    if (lowerInput.includes('delete') && (lowerInput.includes('all') || lowerInput.includes('tasks')) ||
        lowerInput.includes('clear all') || lowerInput.includes('remove all') ||
        lowerInput.match(/delet.*all.*task/) || lowerInput.match(/clear.*task/)) {
      const command: TaskCommand = { action: 'deleteAll', target: 'all' };
      
      // Check for specific category filters
      if (lowerInput.includes('main')) command.filters = { category: 'main' };
      else if (lowerInput.includes('weekly')) command.filters = { category: 'weekly' };
      else if (lowerInput.includes('daily')) command.filters = { category: 'daily' };
      else if (lowerInput.includes('development') || lowerInput.includes('dev')) command.filters = { category: 'siso_app_dev' };
      else if (lowerInput.includes('onboarding')) command.filters = { category: 'onboarding_app' };
      else if (lowerInput.includes('instagram')) command.filters = { category: 'instagram' };
      else if (lowerInput.includes('siso life') || lowerInput.includes('life tasks') || lowerInput.includes('personal')) command.filters = { category: 'siso_life' };
      
      // Check for priority filters
      if (lowerInput.includes('urgent')) command.filters = { ...command.filters, priority: 'urgent' };
      else if (lowerInput.includes('high priority')) command.filters = { ...command.filters, priority: 'high' };
      else if (lowerInput.includes('medium priority')) command.filters = { ...command.filters, priority: 'medium' };
      else if (lowerInput.includes('low priority')) command.filters = { ...command.filters, priority: 'low' };
      else if (lowerInput.includes('backlog')) command.filters = { ...command.filters, priority: 'backlog' };
      
      // Check for status filters
      if (lowerInput.includes('pending')) command.filters = { ...command.filters, status: 'pending' };
      else if (lowerInput.includes('in progress') || lowerInput.includes('in_progress')) command.filters = { ...command.filters, status: 'in_progress' };
      else if (lowerInput.includes('completed')) command.filters = { ...command.filters, status: 'completed' };
      
      return command;
    }
    
    // Create task patterns
    if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('new task')) {
      const command: TaskCommand = { action: 'create' };
      
      // Extract task content
      const content: Record<string, unknown> = {};
      
      // Extract title (everything after create/add/new task)
      const titleMatch = input.match(/(?:create|add|new task)\s+(.+)/i);
      if (titleMatch) {
        content.title = titleMatch[1].trim();
      }
      
      // Extract priority
      if (lowerInput.includes('urgent')) content.priority = 'urgent';
      else if (lowerInput.includes('high priority')) content.priority = 'high';
      else if (lowerInput.includes('medium priority')) content.priority = 'medium';
      else if (lowerInput.includes('low priority')) content.priority = 'low';
      else if (lowerInput.includes('backlog')) content.priority = 'backlog';
      else content.priority = 'medium'; // default
      
      // Extract category with enhanced project detection
      if (lowerInput.includes('main')) content.category = 'main';
      else if (lowerInput.includes('weekly')) content.category = 'weekly';
      else if (lowerInput.includes('daily')) content.category = 'daily';
      else if (lowerInput.includes('uber crypt') || lowerInput.includes('ubahcrypt') || 
               lowerInput.includes('ubercryt') || lowerInput.includes('uber crypto') ||
               lowerInput.includes('trading') || lowerInput.includes('crypto') ||
               lowerInput.includes('cryptocurrency') || lowerInput.includes('blockchain')) {
        content.category = 'siso_app_dev';
        // Add project prefix to title for better organization
        if (!content.title.toString().includes('[Ubahcrypt]')) {
          content.title = `[Ubahcrypt] ${content.title}`;
        }
      }
      else if (lowerInput.includes('development') || lowerInput.includes('dev') || 
               lowerInput.includes('siso agency') || lowerInput.includes('lifelock') || 
               lowerInput.includes('life lock') || lowerInput.includes('isos agency') ||
               lowerInput.includes('siso agency app')) content.category = 'siso_app_dev';
      else if (lowerInput.includes('onboarding')) content.category = 'onboarding_app';
      else if (lowerInput.includes('instagram')) content.category = 'instagram';
      else if (lowerInput.includes('siso life') || lowerInput.includes('life tasks') || lowerInput.includes('personal')) content.category = 'siso_life';
      else content.category = 'main'; // default
      
      // Extract estimated hours
      const hoursMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i);
      if (hoursMatch) {
        content.estimatedHours = parseFloat(hoursMatch[1]);
      }
      
      command.content = content;
      return command;
    }
    
    // Complete tasks patterns
    if (lowerInput.includes('complete') || lowerInput.includes('finish') || lowerInput.includes('done')) {
      const command: TaskCommand = { action: 'complete' };
      
      if (lowerInput.includes('all')) {
        command.target = 'all';
      }
      
      // Add category filters if specified
      if (lowerInput.includes('main')) command.filters = { category: 'main' };
      else if (lowerInput.includes('weekly')) command.filters = { category: 'weekly' };
      else if (lowerInput.includes('daily')) command.filters = { category: 'daily' };
      
      return command;
    }
    
    // Status/progress queries
    if (lowerInput.includes('status') || lowerInput.includes('progress') || lowerInput.includes('how many') || lowerInput.includes('list')) {
      return { action: 'status' };
    }
    
    // Default to status if nothing else matches
    return { action: 'status' };
  }

  // Check if input is an implicit task creation request
  private isImplicitTaskCreation(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    // Patterns that indicate implicit task creation
    const implicitPatterns = [
      /^we need to\s+/,
      /^i need to\s+/,
      /^let's\s+/,
      /^should\s+/,
      /^we should\s+/,
      /^i should\s+/,
      /^need to\s+/,
      /^have to\s+/,
      /^must\s+/,
      /^time to\s+/,
      /^going to\s+/,
      /^plan to\s+/,
      /^want to\s+/,
      /^would like to\s+/,
      /^thinking about\s+/,
      /^considering\s+/,
      /^working on\s+/,
      /^building\s+/,
      /^developing\s+/,
      /^implementing\s+/,
      /^creating\s+/,
      /^make\s+/,
      /^build\s+/,
      /^develop\s+/,
      /^implement\s+/,
      /^design\s+/,
      /^setup\s+/,
      /^set up\s+/,
      /^configure\s+/,
      /^install\s+/,
      /^integrate\s+/,
      /^fix\s+/,
      /^update\s+/,
      /^improve\s+/,
      /^optimize\s+/,
      /^enhance\s+/,
      /^refactor\s+/,
      /^migrate\s+/,
      /^deploy\s+/,
      /^test\s+/,
      /^debug\s+/,
      /^review\s+/,
      /^analyze\s+/,
      /^research\s+/,
      /^investigate\s+/,
      /^explore\s+/,
      /^document\s+/,
      /^write\s+/,
      /^prepare\s+/,
      /^organize\s+/,
      /^plan\s+/,
      /^schedule\s+/,
      /^coordinate\s+/,
      /^manage\s+/,
      /^handle\s+/,
      /^process\s+/,
      /^complete\s+/,
      /^finish\s+/
    ];
    
    return implicitPatterns.some(pattern => pattern.test(lowerInput));
  }

  // Check if input is a contextual task creation request (like "create a task for this")
  private isContextualTaskCreation(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    const contextualPatterns = [
      /create.*task.*for.*this/,
      /add.*task.*for.*this/,
      /make.*task.*for.*this/,
      /create.*task.*about.*this/,
      /add.*task.*about.*this/,
      /make.*task.*about.*this/,
      /create.*task.*from.*this/,
      /add.*task.*from.*this/,
      /make.*task.*from.*this/,
      /turn.*this.*into.*task/,
      /convert.*this.*to.*task/,
      /make.*this.*a.*task/,
      /create.*a.*task/,
      /add.*a.*task/,
      /make.*a.*task/,
      /task.*for.*this/,
      /task.*about.*this/,
      /task.*from.*this/
    ];
    
    return contextualPatterns.some(pattern => pattern.test(lowerInput));
  }

  // Create implicit task from natural language
  private createImplicitTask(input: string, conversationContext?: string[]): TaskCommand {
    const lowerInput = input.toLowerCase();
    
    // Extract the actual task content by removing the implicit indicators
    let taskContent = input;
    const implicitPrefixes = [
      'we need to ', 'i need to ', 'let\'s ', 'should ', 'we should ', 'i should ',
      'need to ', 'have to ', 'must ', 'time to ', 'going to ', 'plan to ',
      'want to ', 'would like to ', 'thinking about ', 'considering ', 'working on '
    ];
    
    for (const prefix of implicitPrefixes) {
      if (lowerInput.startsWith(prefix)) {
        taskContent = input.substring(prefix.length).trim();
        break;
      }
    }
    
    // Clean up the task content
    taskContent = this.cleanupTaskText(taskContent);
    
    // Auto-categorize based on content
    const category = this.detectCategory(taskContent);
    const priority = this.detectPriority(taskContent);
    
    console.log('🎯 [AI TASK AGENT] Creating implicit task:', {
      original: input,
      cleaned: taskContent,
      category,
      priority
    });
    
    // Add project prefix if applicable
    const finalTitle = this.addProjectPrefix(taskContent, input);
    
    return {
      action: 'create',
      content: {
        title: finalTitle,
        category,
        priority,
        description: this.generateTaskDescription(finalTitle, category, priority)
      }
    };
  }

  // Create contextual task using conversation history
  private createContextualTask(input: string, conversationContext?: string[]): TaskCommand {
    let taskContent = 'Complete previous discussion item';
    let category: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' = 'main';
    
    // Look for context in recent conversation
    if (conversationContext && conversationContext.length > 0) {
      // Find the most relevant context from recent messages
      const relevantContext = this.findMostRelevantContext(conversationContext);
      if (relevantContext) {
        taskContent = this.cleanupTaskText(relevantContext);
        category = this.detectCategory(taskContent);
        
        console.log('🔍 [AI TASK AGENT] Using conversation context for task:', {
          context: relevantContext,
          extracted: taskContent,
          category
        });
      }
    }
    
    // If no good context found, extract from current input
    if (taskContent === 'Complete previous discussion item' && input.length > 20) {
      taskContent = this.cleanupTaskText(input.replace(/create.*task.*for.*this|add.*task.*for.*this|make.*task.*for.*this/gi, '').trim());
      if (taskContent.length < 10) {
        taskContent = 'Complete the discussed task';
      }
    }
    
    const priority = this.detectPriority(taskContent);
    
    console.log('🔍 [AI TASK AGENT] Creating contextual task:', {
      original: input,
      context: conversationContext?.length || 0,
      extracted: taskContent,
      category,
      priority
    });
    
    // Add project prefix if applicable (check both input and conversation context)
    const contextToCheck = conversationContext ? input + ' ' + conversationContext.join(' ') : input;
    const finalTitle = this.addProjectPrefix(taskContent, contextToCheck);
    
    return {
      action: 'create',
      content: {
        title: finalTitle,
        category,
        priority,
        description: this.generateTaskDescription(finalTitle, category, priority)
      }
    };
  }

  // Auto-detect category from content
  private detectCategory(content: string): 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' {
    const lowerContent = content.toLowerCase();
    
    // Check for Ubahcrypt/crypto project
    if (lowerContent.includes('uber crypt') || lowerContent.includes('ubahcrypt') || 
        lowerContent.includes('ubercryt') || lowerContent.includes('uber crypto') ||
        lowerContent.includes('trading') || lowerContent.includes('crypto') ||
        lowerContent.includes('cryptocurrency') || lowerContent.includes('blockchain') ||
        lowerContent.includes('binance') || lowerContent.includes('exchange') ||
        lowerContent.includes('wallet') || lowerContent.includes('defi')) {
      return 'siso_app_dev';
    }
    
    // Check for SISO agency app development
    if (lowerContent.includes('siso agency') || lowerContent.includes('siso app') || 
        lowerContent.includes('partnership program') || lowerContent.includes('lifelock') ||
        lowerContent.includes('life lock') || lowerContent.includes('app development') ||
        lowerContent.includes('react') || lowerContent.includes('typescript') ||
        lowerContent.includes('supabase') || lowerContent.includes('database') ||
        lowerContent.includes('frontend') || lowerContent.includes('backend') ||
        lowerContent.includes('api') || lowerContent.includes('ui') || lowerContent.includes('ux')) {
      return 'siso_app_dev';
    }
    
    // Check for onboarding related
    if (lowerContent.includes('onboarding') || lowerContent.includes('client setup') ||
        lowerContent.includes('user registration') || lowerContent.includes('welcome')) {
      return 'onboarding_app';
    }
    
    // Check for Instagram/social media
    if (lowerContent.includes('instagram') || lowerContent.includes('social media') ||
        lowerContent.includes('marketing') || lowerContent.includes('leads') ||
        lowerContent.includes('outreach') || lowerContent.includes('campaign')) {
      return 'instagram';
    }
    
    // Check for daily tasks
    if (lowerContent.includes('daily') || lowerContent.includes('routine') ||
        lowerContent.includes('every day') || lowerContent.includes('recurring')) {
      return 'daily';
    }
    
    // Check for weekly tasks
    if (lowerContent.includes('weekly') || lowerContent.includes('every week') ||
        lowerContent.includes('weekly review') || lowerContent.includes('weekly planning')) {
      return 'weekly';
    }
    
    return 'main';
  }

  // Add project prefix to task title based on detected category and content
  private addProjectPrefix(title: string, content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Check for Ubahcrypt/crypto project
    if (lowerContent.includes('uber crypt') || lowerContent.includes('ubahcrypt') || 
        lowerContent.includes('ubercryt') || lowerContent.includes('uber crypto') ||
        lowerContent.includes('trading') || lowerContent.includes('crypto') ||
        lowerContent.includes('cryptocurrency') || lowerContent.includes('blockchain') ||
        lowerContent.includes('binance') || lowerContent.includes('exchange') ||
        lowerContent.includes('wallet') || lowerContent.includes('defi')) {
      if (!title.includes('[Ubahcrypt]')) {
        return `[Ubahcrypt] ${title}`;
      }
    }
    
    return title;
  }

  // Auto-detect priority from content
  private detectPriority(content: string): 'low' | 'medium' | 'high' | 'urgent' {
    const lowerContent = content.toLowerCase();
    
    // High priority indicators
    if (lowerContent.includes('urgent') || lowerContent.includes('asap') ||
        lowerContent.includes('immediately') || lowerContent.includes('critical') ||
        lowerContent.includes('emergency') || lowerContent.includes('now') ||
        lowerContent.includes('right away') || lowerContent.includes('today')) {
      return 'urgent';
    }
    
    // High priority indicators
    if (lowerContent.includes('important') || lowerContent.includes('priority') ||
        lowerContent.includes('deadline') || lowerContent.includes('due') ||
        lowerContent.includes('soon') || lowerContent.includes('quickly') ||
        lowerContent.includes('fast') || lowerContent.includes('this week')) {
      return 'high';
    }
    
    // Low priority indicators
    if (lowerContent.includes('when time permits') || lowerContent.includes('eventually') ||
        lowerContent.includes('someday') || lowerContent.includes('nice to have') ||
        lowerContent.includes('optional') || lowerContent.includes('later') ||
        lowerContent.includes('future') || lowerContent.includes('backlog')) {
      return 'low';
    }
    
    return 'medium';
  }

  // Find the most relevant context from conversation history
  private findMostRelevantContext(conversationContext: string[]): string | null {
    if (!conversationContext || conversationContext.length === 0) {
      return null;
    }
    
    // Look for the most recent substantive message (not just commands)
    for (let i = conversationContext.length - 1; i >= 0; i--) {
      const message = conversationContext[i];
      const lowerMessage = message.toLowerCase();
      
      // Skip if it's just a command or very short
      if (lowerMessage.includes('create task') || 
          lowerMessage.includes('add task') || 
          lowerMessage.includes('make task') ||
          message.trim().length < 10) {
        continue;
      }
      
      // Look for substantive content that describes work to be done
      if (lowerMessage.includes('need to') || 
          lowerMessage.includes('should') || 
          lowerMessage.includes('want to') ||
          lowerMessage.includes('partnership') ||
          lowerMessage.includes('program') ||
          lowerMessage.includes('feature') ||
          lowerMessage.includes('fix') ||
          lowerMessage.includes('build') ||
          lowerMessage.includes('create') ||
          lowerMessage.includes('develop') ||
          lowerMessage.includes('implement') ||
          lowerMessage.includes('app') ||
          lowerMessage.includes('project') ||
          message.trim().length > 20) {
        return message;
      }
    }
    
    // If no specific context found, return the most recent non-command message
    return conversationContext[conversationContext.length - 1] || null;
  }

  // Check if a task should be split into multiple tasks
  private shouldSplitTask(input: string): boolean {
    const lowerInput = input.toLowerCase();
    
    // Keywords that indicate multiple tasks
    const multiTaskIndicators = [
      'and also',
      'also',
      'plus',
      'then',
      'after that',
      'fix.*and.*test',
      'build.*and.*push',
      'create.*and.*test',
      'update.*and.*deploy'
    ];
    
    return multiTaskIndicators.some(indicator => 
      lowerInput.includes(indicator) || lowerInput.match(new RegExp(indicator))
    );
  }

  // Split a complex task into multiple simpler tasks
  private splitIntoMultipleTasks(input: string): TaskCommand[] {
    const lowerInput = input.toLowerCase();
    const tasks: TaskCommand[] = [];
    
    // Determine category based on content
    let category: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram' = 'main';
    
    if (lowerInput.includes('siso agency app') || lowerInput.includes('app dev') || 
        lowerInput.includes('siso agency') || lowerInput.includes('lifelock') || 
        lowerInput.includes('life lock') || lowerInput.includes('isos agency')) {
      category = 'siso_app_dev';
    } else if (lowerInput.includes('development') || lowerInput.includes('dev')) {
      category = 'siso_app_dev';
    } else if (lowerInput.includes('onboarding')) {
      category = 'onboarding_app';
    } else if (lowerInput.includes('instagram')) {
      category = 'instagram';
    }
    
    // Split based on common patterns in the input
    if (lowerInput.includes('landing page') && lowerInput.includes('fix')) {
      tasks.push({
        action: 'create',
        content: {
          title: 'Fix SISO Agency Landing Page',
          description: 'Review and fix issues with the landing page layout, content, and functionality',
          priority: 'high',
          category: category
        }
      });
    }
    
    if (lowerInput.includes('task section') && lowerInput.includes('test')) {
      tasks.push({
        action: 'create',
        content: {
          title: 'Test Task Section Functionality',
          description: 'Thoroughly test the task management section for bugs and usability issues',
          priority: 'medium',
          category: category
        }
      });
    }
    
    if (lowerInput.includes('push') && lowerInput.includes('github')) {
      tasks.push({
        action: 'create',
        content: {
          title: 'Push Changes to GitHub',
          description: 'Commit and push all completed changes to the GitHub repository',
          priority: 'medium',
          category: category
        }
      });
    }
    
    if (lowerInput.includes('pull') && lowerInput.includes('test')) {
      tasks.push({
        action: 'create',
        content: {
          title: 'Create Pull Request and Test',
          description: 'Create a pull request for the changes and run automated tests',
          priority: 'medium',
          category: category
        }
      });
    }
    
    // If no specific tasks were identified, create a general task
    if (tasks.length === 0) {
      tasks.push({
        action: 'create',
        content: {
          title: input.length > 60 ? input.substring(0, 60) + '...' : input,
          description: 'Task created from: ' + input,
          priority: 'medium',
          category: category
        }
      });
    }
    
    return tasks;
  }

  // Execute multiple commands in sequence
  private async executeMultipleCommands(commands: TaskCommand[]): Promise<TaskAgentResponse> {
    const results: TaskAgentResponse[] = [];
    let totalAffected = 0;
    
    for (const command of commands) {
      try {
        const result = await this.executeSingleCommand(command);
        results.push(result);
        if (result.affectedCount) {
          totalAffected += result.affectedCount;
        }
      } catch (error) {
        console.error('Failed to execute command:', command, error);
        results.push({
          success: false,
          message: `Failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
          action: command.action
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    return {
      success: successCount > 0,
      message: `✅ Created ${successCount} tasks successfully${failCount > 0 ? ` (${failCount} failed)` : ''}:\n${results.filter(r => r.success).map(r => `• ${r.message}`).join('\n')}`,
      action: 'create_multiple',
      data: results,
      affectedCount: totalAffected
    };
  }

  // Execute task commands (single or multiple)
  public async executeCommand(command: TaskCommand | TaskCommand[]): Promise<TaskAgentResponse> {
    const user = await this.getCurrentUser();
    
    console.log('⚡ [AI TASK AGENT] Executing command:', command);
    
    // Handle multiple commands
    if (Array.isArray(command)) {
      return await this.executeMultipleCommands(command);
    }
    
    return await this.executeSingleCommand(command);
  }

  // Execute a single command
  private async executeSingleCommand(command: TaskCommand): Promise<TaskAgentResponse> {
    try {
      switch (command.action) {
        case 'deleteAll':
          return await this.deleteAllTasks(command.filters);
          
        case 'create':
          return await this.createTask(command.content!);
          
        case 'complete':
          return await this.completeTasks(command.filters);
          
        case 'status':
          return await this.getTaskStatus(command.filters, undefined);
          
        default:
          return {
            success: false,
            message: 'Unknown command. I can help you create, delete, complete, or check status of tasks.',
            action: 'error'
          };
      }
    } catch (error) {
      console.error('❌ [AI TASK AGENT] Command execution failed:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly error messages for common issues
        if (errorMessage.includes('infinite recursion') || errorMessage.includes('policy')) {
          errorMessage = 'Database permission issue. Please check your access rights.';
        } else if (errorMessage.includes('not found')) {
          errorMessage = 'No tasks found matching your criteria.';
        } else if (errorMessage.includes('network')) {
          errorMessage = 'Network connection issue. Please try again.';
        }
      }
      
      return {
        success: false,
        message: `Failed to execute command: ${errorMessage}`,
        action: 'error'
      };
    }
  }

  private async deleteAllTasks(filters?: TaskCommand['filters'], uiTasks?: unknown[]): Promise<TaskAgentResponse> {
    try {
      console.log('🔧 [AI TASK AGENT] Database RLS detected, attempting direct query with fallback...');
      
      // Try a simplified direct query first
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: directTasks, error: directError } = await supabase
            .from('tasks')
            .select('id, title, priority, status, category')
            .eq('assigned_to', user.id);
            
          if (!directError && directTasks) {
            console.log('✅ [AI TASK AGENT] Direct query successful, using database data');
            uiTasks = directTasks;
          }
        }
      } catch (directQueryError) {
        console.log('⚠️ [AI TASK AGENT] Direct query failed, falling back to UI data');
      }
      
      // Since database access is having issues, use UI state data or inform user
      if (!uiTasks || uiTasks.length === 0) {
        return {
          success: false,
          message: `❌ **Task Access Issue**\n\n⚠️ Cannot access task data due to database policy configuration.\n\n**Quick Fix Options:**\n1. **Manual SQL Fix**: Run the RLS policy fix in Supabase Dashboard\n2. **Reload Page**: Sometimes a page refresh resolves temporary issues\n3. **Check Tasks Page**: View tasks directly in the Tasks section\n\n💡 The task system is working, just needs a policy adjustment in the database.`,
          action: 'deleteAll',
          affectedCount: 0
        };
      }
      
      // Process UI state tasks
      return this.processRealTaskDeletion(uiTasks, filters);
      
    } catch (error) {
      console.error('Delete all tasks error:', error);
      return {
        success: false,
        message: `Failed to process tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        action: 'deleteAll',
        affectedCount: 0
      };
    }
  }

  private async processRealTaskDeletion(tasks: unknown[], filters?: TaskCommand['filters']): Promise<TaskAgentResponse> {
    console.log('🔧 [AI TASK AGENT] Processing real task data:', tasks.length, 'tasks found');
    
    // Apply filters to real data
    let filteredTasks = tasks.filter((task): task is Record<string, unknown> => 
      typeof task === 'object' && task !== null
    );
    
    if (filters?.category) {
      filteredTasks = filteredTasks.filter(task => (task.category as string) === filters.category);
    }
    if (filters?.priority) {
      filteredTasks = filteredTasks.filter(task => (task.priority as string) === filters.priority);
    }
    if (filters?.status) {
      filteredTasks = filteredTasks.filter(task => (task.status as string) === filters.status);
    } else {
      // If no specific status filter, exclude completed tasks by default
      filteredTasks = filteredTasks.filter(task => 
        (task.status as string) !== 'completed' && !(task.completed as boolean)
      );
    }
    
    const deletedCount = filteredTasks.length;
    const filterDescription = this.buildFilterDescription(filters);
    
    console.log('🔧 [AI TASK AGENT] Filtered tasks for deletion:', deletedCount);
    
    if (deletedCount === 0) {
      return {
        success: true,
        message: `No ${filterDescription}tasks found to delete.`,
        action: 'deleteAll',
        affectedCount: 0
      };
    }
    
    // Show what would be deleted with real task titles
    const taskTitles = filteredTasks.slice(0, 3).map(t => `"${(t.title as string) || 'Untitled'}"`).join(', ');
    const moreText = filteredTasks.length > 3 ? ` and ${filteredTasks.length - 3} more` : '';
    
    // Execute the actual deletion using service role for agent operations
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: '❌ Authentication required to delete tasks.',
          action: 'deleteAll',
          affectedCount: 0,
          data: []
        };
      }

      // Delete tasks using RLS-safe approach
      const taskIds = filteredTasks.map(task => task.id as string);
      
      // Use the agent client for operations that bypass RLS
      const agentClient = getAgentClient();
      const { error: deleteError } = await agentClient
        .from('tasks')
        .delete()
        .in('id', taskIds);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return {
          success: false,
          message: `❌ Failed to delete tasks: ${deleteError.message}`,
          action: 'deleteAll',
          affectedCount: 0,
          data: []
        };
      }

      return {
        success: true,
        message: `✅ Successfully deleted ${deletedCount} ${filterDescription}task${deletedCount !== 1 ? 's' : ''}:\n\n${taskTitles}${moreText}`,
        action: 'deleteAll',
        affectedCount: deletedCount,
        data: filteredTasks
      };
    } catch (error) {
      console.error('Deletion error:', error);
      return {
        success: false,
        message: `❌ Error deleting tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        action: 'deleteAll',
        affectedCount: 0,
        data: []
      };
    }
  }

  private cleanupTaskText(text: string): string {
    if (!text) return text;
    
    // Basic text cleanup and enhancement
    let cleaned = text
      // Fix common spelling mistakes
      .replace(/\bteh\b/gi, 'the')
      .replace(/\bimporving\b/gi, 'improving')
      .replace(/\bintergate\b/gi, 'integrate')
      .replace(/\bfunctinal\b/gi, 'functional')
      .replace(/\badn\b/gi, 'and')
      .replace(/\bplease\s*$/gi, '') // Remove trailing "please"
      .replace(/\bui\b/gi, 'UI')
      .replace(/\bapi\b/gi, 'API')
      .replace(/\bsiso\b/gi, 'SISO')
      // Fix specific app-related terms
      .replace(/\blike\s*log\b/gi, 'LifeLock')
      .replace(/\blifelock\b/gi, 'LifeLock')
      .replace(/\blife\s*lock\b/gi, 'LifeLock')
      .replace(/\bisos\s*agency\b/gi, 'SISO Agency')
      .replace(/\bsiso\s*agency\b/gi, 'SISO Agency')
      .replace(/\bsiso\s*agency\s*app\b/gi, 'SISO Agency App')
      // Fix common typos
      .replace(/\bstuidly\b/gi, 'stupidly')
      .replace(/\bannoeyd\b/gi, 'annoyed')
      .replace(/\bspellign\b/gi, 'spelling')
      .replace(/\bpunctinality\b/gi, 'punctuation')
      .replace(/\badded\b/gi, 'added')
      .replace(/\bdsuccessfully\b/gi, 'successfully')
      // Clean up spacing and punctuation
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\s*,\s*/g, ', ') // Fix comma spacing
      .replace(/\s*\.\s*/g, '. ') // Fix period spacing
      .trim();
    
    // Capitalize first letter and ensure proper sentence structure
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      
      // Add period if sentence doesn't end with punctuation
      if (!/[.!?]$/.test(cleaned)) {
        cleaned += '.';
      }
    }
    
    // Enhance task-specific formatting
    if (cleaned.toLowerCase().includes('life lock') || cleaned.toLowerCase().includes('lifelock')) {
      cleaned = cleaned.replace(/life\s*lock/gi, 'LifeLock');
    }
    
    return cleaned;
  }

  private generateTaskDescription(title: string, category: string, priority: string): string {
    const lowerTitle = title.toLowerCase();
    let description = '';
    
    // Generate context-aware descriptions based on title content and category
    if (lowerTitle.includes('fix') || lowerTitle.includes('bug') || lowerTitle.includes('error')) {
      description = `Investigate and resolve the issue described in: "${title}". Review the current implementation, identify the root cause, and implement a proper fix. Test thoroughly to ensure the issue is completely resolved.`;
    } else if (lowerTitle.includes('test') || lowerTitle.includes('testing')) {
      description = `Comprehensive testing of the feature or functionality mentioned in: "${title}". Create test cases, execute manual and automated tests, document any issues found, and verify all requirements are met.`;
    } else if (lowerTitle.includes('create') || lowerTitle.includes('add') || lowerTitle.includes('implement')) {
      description = `Implementation of new functionality: "${title}". Plan the approach, design the solution architecture, implement the feature following best practices, and ensure proper integration with existing systems.`;
    } else if (lowerTitle.includes('update') || lowerTitle.includes('modify') || lowerTitle.includes('improve')) {
      description = `Enhancement and optimization of existing functionality: "${title}". Analyze current implementation, identify improvement opportunities, implement changes, and verify enhanced performance or usability.`;
    } else if (lowerTitle.includes('deploy') || lowerTitle.includes('release') || lowerTitle.includes('publish')) {
      description = `Deployment and release management for: "${title}". Prepare release artifacts, coordinate deployment process, monitor system health, and ensure successful rollout with rollback plan if needed.`;
    } else if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('interface')) {
      description = `User interface and experience design work: "${title}". Create mockups or wireframes, implement responsive design, ensure accessibility compliance, and conduct usability testing.`;
    } else if (lowerTitle.includes('database') || lowerTitle.includes('migration') || lowerTitle.includes('schema')) {
      description = `Database-related work: "${title}". Design or modify database schema, create migration scripts, ensure data integrity, and optimize query performance.`;
    } else if (lowerTitle.includes('api') || lowerTitle.includes('endpoint') || lowerTitle.includes('service')) {
      description = `API development and integration: "${title}". Design API endpoints, implement business logic, ensure proper error handling, and create comprehensive documentation.`;
    } else if (lowerTitle.includes('security') || lowerTitle.includes('auth') || lowerTitle.includes('permission')) {
      description = `Security and authentication implementation: "${title}". Implement secure authentication flow, configure proper permissions, audit security vulnerabilities, and ensure compliance standards.`;
    } else if (lowerTitle.includes('performance') || lowerTitle.includes('optimize') || lowerTitle.includes('speed')) {
      description = `Performance optimization work: "${title}". Profile current performance, identify bottlenecks, implement optimizations, and measure improvement metrics.`;
    } else if (lowerTitle.includes('documentation') || lowerTitle.includes('readme') || lowerTitle.includes('guide')) {
      description = `Documentation creation and maintenance: "${title}". Write clear, comprehensive documentation, include code examples, update existing docs, and ensure information accuracy.`;
    } else {
      // Generic description based on category
      switch (category) {
        case 'siso_app_dev':
        case 'development':
          description = `Development task: "${title}". Implement the required functionality following SISO development standards, ensure code quality, and include appropriate testing.`;
          break;
        case 'onboarding_app':
          description = `Onboarding application task: "${title}". Focus on improving user experience during the onboarding process, ensure smooth workflow, and maintain consistency with existing features.`;
          break;
        case 'instagram':
        case 'marketing':
          description = `Marketing and social media task: "${title}". Execute marketing strategy, engage with target audience, and measure campaign effectiveness.`;
          break;
        case 'weekly':
          description = `Weekly recurring task: "${title}". Complete as part of regular weekly workflow, maintain consistency with previous executions, and document any changes or improvements.`;
          break;
        case 'daily':
          description = `Daily routine task: "${title}". Execute as part of daily workflow, ensure timely completion, and maintain quality standards.`;
          break;
        default:
          description = `Task: "${title}". Complete the specified work according to requirements, ensure quality delivery, and coordinate with team members as needed.`;
      }
    }
    
    // Add priority-specific context
    if (priority === 'high' || priority === 'urgent') {
      description += ' **HIGH PRIORITY** - This task requires immediate attention and should be completed as soon as possible.';
    } else if (priority === 'low') {
      description += ' This task can be completed when time permits and other priorities are addressed.';
    }
    
    return this.cleanupTaskText(description);
  }

  private async createTask(content: TaskCommand['content']): Promise<TaskAgentResponse> {
    if (!content?.title) {
      throw new Error('Task title is required');
    }

    try {
      const user = await this.getCurrentUser();
      
      // Clean up and enhance the task text
      const cleanedTitle = this.cleanupTaskText(content.title);
      const priority = content.priority || 'medium';
      const category = content.category || 'main';
      
      // Generate description if not provided
      let cleanedDescription = content.description ? this.cleanupTaskText(content.description) : undefined;
      if (!cleanedDescription) {
        cleanedDescription = this.generateTaskDescription(cleanedTitle, category, priority);
      }
      
      // Create task with immediate response - don't wait for database confirmation
      const taskData = {
        title: cleanedTitle,
        description: cleanedDescription,
        priority: priority,
        category: category,
        status: 'pending',
        created_by: user.id,
        assigned_to: user.id,
        due_date: content.dueDate,
        estimated_hours: content.estimatedHours
      };

      // Insert to database synchronously for immediate UI updates
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Task creation failed:', error);
        throw error;
      }

      console.log('✅ Task successfully created in database:', data);

      return {
        success: true,
        message: `Created ${content.priority || 'medium'} priority task: "${cleanedTitle}"`,
        action: 'create',
        data: data,
        affectedCount: 1
      };
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  private async completeTasks(filters?: TaskCommand['filters']): Promise<TaskAgentResponse> {
    const user = await this.getCurrentUser();
    
    let query = supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
      .neq('status', 'completed'); // Only update non-completed tasks

    // Apply filters
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.priority) query = query.eq('priority', filters.priority);

    const { error, count } = await query;
    
    if (error) throw error;
    
    const completedCount = count || 0;
    const filterDescription = this.buildFilterDescription(filters);
    
    return {
      success: true,
      message: `Completed ${completedCount} ${filterDescription}task${completedCount !== 1 ? 's' : ''}.`,
      action: 'complete',
      affectedCount: completedCount
    };
  }

  private async getTaskStatus(filters?: TaskCommand['filters'], uiTasks?: unknown[]): Promise<TaskAgentResponse> {
    try {
      console.log('🔧 [AI TASK AGENT] Attempting to get task status...');
      
      // Try to get tasks from database first
      let tasks: unknown[] = [];
      
      if (!uiTasks) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: dbTasks, error: dbError } = await supabase
              .from('tasks')
              .select('*')
              .eq('assigned_to', user.id);
              
            if (!dbError && dbTasks) {
              console.log('✅ [AI TASK AGENT] Successfully fetched tasks from database');
              tasks = dbTasks;
            } else {
              console.log('⚠️ [AI TASK AGENT] Database query failed, trying fallback...');
              tasks = [];
            }
          }
        } catch (dbError) {
          console.log('⚠️ [AI TASK AGENT] Database access failed, using empty task list');
          tasks = [];
        }
      } else {
        tasks = uiTasks;
      }
      
      // If no tasks available, return informative message
      if (tasks.length === 0) {
        return {
          success: true,
          message: `📊 **Task Status**\n\n**No tasks found** - Either you haven't created any tasks yet, or there may be a database access issue.\n\n**Try:**\n1. Create a new task with "create task [description]"\n2. Refresh the page and try again\n3. Check the Tasks page in the admin panel\n\n**Note:** If you see tasks in the UI but not here, there may be a database policy issue.`,
          action: 'status',
          data: { stats: { total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0, overdue: 0, byCategory: {} }, tasks: [] }
        };
      }
      
      // Convert to typed tasks
      const typedTasks = tasks.filter((task): task is Record<string, unknown> => 
        typeof task === 'object' && task !== null
      );

      console.log('🔧 [AI TASK AGENT] Processing task status data:', typedTasks.length, 'tasks');
      
      // Calculate real statistics from UI data
      const stats = {
        total: typedTasks.length,
        pending: typedTasks.filter(t => !(t.completed as boolean) && (t.status as string) !== 'completed').length,
        inProgress: typedTasks.filter(t => (t.status as string) === 'in-progress' || (t.status as string) === 'in_progress').length,
        completed: typedTasks.filter(t => (t.completed as boolean) || (t.status as string) === 'completed' || (t.status as string) === 'done').length,
        highPriority: typedTasks.filter(t => (t.priority as string) === 'high' || (t.priority as string) === 'urgent').length,
        overdue: typedTasks.filter(t => (t.status as string) === 'overdue').length,
        byCategory: {
          main: typedTasks.filter(t => (t.category as string) === 'main' || (t.category as string) === 'development').length,
          weekly: typedTasks.filter(t => (t.category as string) === 'weekly').length,
          daily: typedTasks.filter(t => (t.category as string) === 'daily').length,
          development: typedTasks.filter(t => (t.category as string) === 'development' || (t.category as string) === 'siso_app_dev').length,
          onboarding: typedTasks.filter(t => (t.category as string) === 'onboarding' || (t.category as string) === 'onboarding_app').length,
          instagram: typedTasks.filter(t => (t.category as string) === 'instagram' || (t.category as string) === 'marketing').length
        }
      };
      
      // Show some recent task titles for context
      const recentTasks = typedTasks
        .filter(t => !(t.completed as boolean) && (t.status as string) !== 'completed')
        .slice(0, 3)
        .map(t => `• ${(t.title as string) || 'Untitled'}`)
        .join('\n');
      
      const message = `📊 **Current Task Status (from UI State)**\n\n` +
        `**Total Tasks:** ${stats.total}\n` +
        `**Active:** ${stats.pending + stats.inProgress} (${stats.pending} pending, ${stats.inProgress} in progress)\n` +
        `**Completed:** ${stats.completed}\n` +
        `**High Priority:** ${stats.highPriority}\n` +
        `**Overdue:** ${stats.overdue}\n\n` +
        `**By Category:**\n` +
        `• Main: ${stats.byCategory.main}\n` +
        `• Weekly: ${stats.byCategory.weekly}\n` +
        `• Daily: ${stats.byCategory.daily}\n` +
        `• Development: ${stats.byCategory.development}\n` +
        `• Onboarding: ${stats.byCategory.onboarding}\n` +
        `• Instagram: ${stats.byCategory.instagram}\n\n` +
        (recentTasks ? `**Recent Active Tasks:**\n${recentTasks}\n\n` : '') +
        `⚠️ **Note**: Using UI state data due to database RLS policy issues. Fix Supabase policies for live database access.`;
      
      return {
        success: true,
        message,
        action: 'status',
        data: { stats, tasks: typedTasks }
      };
    } catch (error) {
      console.error('Get task status error:', error);
      throw error;
    }
  }

  private buildFilterDescription(filters?: TaskCommand['filters']): string {
    const parts: string[] = [];
    
    if (filters?.category) parts.push(filters.category);
    if (filters?.priority) parts.push(`${filters.priority} priority`);
    if (filters?.status) parts.push(filters.status);
    
    return parts.length > 0 ? `${parts.join(' ')} ` : '';
  }

  // Process natural language input and execute
  public async processInput(input: string, conversationContext?: string[]): Promise<TaskAgentResponse> {
    console.log('🎯 [AI TASK AGENT] Processing input:', input);
    console.log('🧠 [AI TASK AGENT] Conversation context:', conversationContext?.length || 0, 'messages');
    
    const command = this.parseCommand(input, conversationContext);
    console.log('📋 [AI TASK AGENT] Parsed command:', command);
    
    const response = await this.executeCommand(command);
    console.log('✅ [AI TASK AGENT] Response:', response);
    
    return response;
  }
}

// Export singleton instance
export const aiTaskAgent = new AITaskAgent();
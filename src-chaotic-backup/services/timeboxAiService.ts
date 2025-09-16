/**
 * TimeBox AI Service - Real AI integration with task management capabilities
 * Connects to OpenAI/Groq APIs and has full Supabase task CRUD operations
 */

import { hybridLifelockApi } from '@/api/hybridLifelockApi';
import { timeboxApi, TimeBoxTask, DaySchedule } from '@/api/timeboxApi';
import { format, addDays } from 'date-fns';

// Environment variables for API keys
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY;

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  actions?: TaskAction[];
  suggestions?: TaskSuggestion[];
  taskData?: TimeBoxTask[];
}

export interface TaskAction {
  type: 'schedule' | 'create' | 'complete' | 'auto_schedule' | 'view_tasks';
  taskId?: string;
  taskTitle?: string;
  taskType?: 'light_work' | 'deep_work';
  timeSlot?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedDuration?: number;
  description?: string;
  confidence: number;
  actionDescription: string;
}

export interface TaskSuggestion {
  task: TimeBoxTask;
  suggestedTime: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ConversationContext {
  availableTasks: TimeBoxTask[];
  scheduledTasks: TimeBoxTask[];
  schedule: DaySchedule | null;
  recentActions: TaskAction[];
  userPreferences: {
    preferredWorkHours: { start: string; end: string };
    deepWorkPreference: 'morning' | 'afternoon' | 'evening';
    breakFrequency: number; // minutes
  };
}

class TimeBoxAIService {
  private conversationHistory: ChatMessage[] = [];
  private context: ConversationContext | null = null;

  // ===== INITIALIZATION =====

  async initializeContext(date?: string): Promise<ConversationContext> {
    try {
      const targetDate = date || format(new Date(), 'yyyy-MM-dd');
      
      // Get current schedule and tasks
      const schedule = await timeboxApi.getDaySchedule(targetDate);
      const { lightWork, deepWork } = await hybridLifelockApi.getAllTasksForDate(targetDate);
      
      // Convert to TimeBox format
      const allTasks = await timeboxApi.getTasksForTimeBox(targetDate);
      
      this.context = {
        availableTasks: schedule.unscheduledTasks,
        scheduledTasks: schedule.scheduledTasks,
        schedule,
        recentActions: [],
        userPreferences: {
          preferredWorkHours: { start: '09:00', end: '17:00' },
          deepWorkPreference: 'morning',
          breakFrequency: 90
        }
      };
      
      return this.context;
    } catch (error) {
      console.error('Failed to initialize AI context:', error);
      throw error;
    }
  }

  // ===== REAL AI INTEGRATION =====

  async processUserMessage(message: string): Promise<ChatMessage> {
    if (!this.context) {
      await this.initializeContext();
    }

    // Add user message to history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };
    this.conversationHistory.push(userMessage);

    try {
      // Use real AI API to process the message
      const aiResponse = await this.callAIAPI(message);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        type: 'assistant',
        timestamp: new Date(),
        actions: aiResponse.actions,
        suggestions: aiResponse.suggestions,
        taskData: aiResponse.showTasks ? this.context?.availableTasks : undefined
      };

      this.conversationHistory.push(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('AI processing error:', error);
      return this.createErrorMessage();
    }
  }

  private async callAIAPI(userMessage: string): Promise<{
    content: string;
    actions?: TaskAction[];
    suggestions?: TaskSuggestion[];
    showTasks?: boolean;
  }> {
    const systemPrompt = this.buildSystemPrompt();
    const conversationContext = this.buildConversationContext();

    // Try OpenAI first, fallback to Groq
    if (OPENAI_API_KEY) {
      return await this.callOpenAI(systemPrompt, conversationContext, userMessage);
    } else if (GROQ_API_KEY) {
      return await this.callGroq(systemPrompt, conversationContext, userMessage);
    } else {
      // Fallback to enhanced mock processing
      return await this.enhancedMockProcessing(userMessage);
    }
  }

  private async callOpenAI(systemPrompt: string, context: string, userMessage: string) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context: ${context}\n\nUser: ${userMessage}` }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private async callGroq(systemPrompt: string, context: string, userMessage: string) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context: ${context}\n\nUser: ${userMessage}` }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  // ===== TASK MANAGEMENT OPERATIONS =====

  async createTask(
    title: string, 
    taskType: 'light_work' | 'deep_work', 
    priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
    estimatedDuration: number = 30,
    description?: string
  ): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      // Create task via hybrid API
      const taskData = {
        title,
        description: description || '',
        priority,
        estimated_duration: estimatedDuration,
        xp_reward: taskType === 'deep_work' ? 20 : 10,
        task_type: taskType
      };

      let newTask;
      if (taskType === 'light_work') {
        newTask = await hybridLifelockApi.createLightWorkTask(taskData);
      } else {
        newTask = await hybridLifelockApi.createDeepWorkTask(taskData);
      }

      // Refresh context
      await this.initializeContext();

      return { 
        success: true, 
        taskId: newTask.id,
      };
    } catch (error) {
      console.error('Failed to create task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async completeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find task in our context
      const task = [...(this.context?.availableTasks || []), ...(this.context?.scheduledTasks || [])]
        .find(t => t.id === taskId || t.originalTaskId === taskId);

      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Complete via timeboxApi
      await timeboxApi.completeTask(task.id);
      
      // Refresh context
      await this.initializeContext();

      return { success: true };
    } catch (error) {
      console.error('Failed to complete task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async scheduleTask(taskId: string, timeSlot: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a time slot object
      const slot = {
        id: `slot-${Date.now()}`,
        startTime: timeSlot,
        endTime: this.addMinutesToTime(timeSlot, 30),
        duration: 30,
        date: format(new Date(), 'yyyy-MM-dd')
      };

      await timeboxApi.scheduleTask(taskId, slot);
      
      // Refresh context
      await this.initializeContext();

      return { success: true };
    } catch (error) {
      console.error('Failed to schedule task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async autoScheduleAllTasks(): Promise<{ success: boolean; scheduledCount?: number; error?: string }> {
    try {
      const newSchedule = await timeboxApi.autoScheduleTasks();
      await this.initializeContext();
      
      return { 
        success: true, 
        scheduledCount: newSchedule.scheduledTasks.length 
      };
    } catch (error) {
      console.error('Failed to auto-schedule tasks:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // ===== CONVERSATION HISTORY MANAGEMENT =====

  saveConversationHistory(): void {
    try {
      const historyData = {
        messages: this.conversationHistory,
        context: this.context,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('timebox-ai-history', JSON.stringify(historyData));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  loadConversationHistory(): ChatMessage[] {
    try {
      const savedData = localStorage.getItem('timebox-ai-history');
      if (savedData) {
        const historyData = JSON.parse(savedData);
        this.conversationHistory = historyData.messages || [];
        return this.conversationHistory;
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
    return [];
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
    localStorage.removeItem('timebox-ai-history');
  }

  // ===== UTILITY METHODS =====

  private buildSystemPrompt(): string {
    return `You are a TimeBox AI assistant that helps users manage their tasks and schedule. You can:

1. VIEW TASKS: See all user's current tasks from Supabase
2. CREATE TASKS: Create new light work or deep work tasks
3. COMPLETE TASKS: Mark tasks as completed
4. SCHEDULE TASKS: Assign tasks to specific time slots
5. AUTO-SCHEDULE: Optimize all unscheduled tasks

Current context:
- Available tasks: ${this.context?.availableTasks.length || 0}
- Scheduled tasks: ${this.context?.scheduledTasks.length || 0}
- Date: ${format(new Date(), 'yyyy-MM-dd')}

Respond naturally and offer specific actions. When users request task operations, provide clear action buttons.

Response format: Provide helpful text, and when appropriate, include JSON action objects like:
ACTION: {"type": "create", "taskTitle": "Task name", "taskType": "deep_work", "priority": "HIGH"}
ACTION: {"type": "complete", "taskId": "task-123"}
ACTION: {"type": "schedule", "taskId": "task-123", "timeSlot": "09:00"}`;
  }

  private buildConversationContext(): string {
    if (!this.context) return 'No context available';
    
    const taskList = this.context.availableTasks.map(task => 
      `- ${task.title} (${task.taskType}, ${task.priority}, ${task.estimatedDuration}min)`
    ).join('\n');

    return `
Available Tasks:
${taskList}

Scheduled Tasks: ${this.context.scheduledTasks.length}
Recent conversation: ${this.conversationHistory.slice(-3).map(m => `${m.type}: ${m.content}`).join('\n')}
`;
  }

  private parseAIResponse(response: string): {
    content: string;
    actions?: TaskAction[];
    suggestions?: TaskSuggestion[];
    showTasks?: boolean;
  } {
    const actions: TaskAction[] = [];
    let cleanedResponse = response;

    // Extract action commands from AI response
    const actionRegex = /ACTION:\s*({[^}]+})/g;
    let match;
    
    while ((match = actionRegex.exec(response)) !== null) {
      try {
        const actionData = JSON.parse(match[1]);
        actions.push({
          ...actionData,
          confidence: 0.9,
          actionDescription: this.getActionDescription(actionData)
        });
        cleanedResponse = cleanedResponse.replace(match[0], '');
      } catch (error) {
        console.error('Failed to parse action:', error);
      }
    }

    const showTasks = response.toLowerCase().includes('show tasks') || 
                     response.toLowerCase().includes('view tasks') ||
                     response.toLowerCase().includes('list tasks');

    return {
      content: cleanedResponse.trim(),
      actions: actions.length > 0 ? actions : undefined,
      showTasks
    };
  }

  private getActionDescription(action: any): string {
    switch (action.type) {
      case 'create': return `Create "${action.taskTitle}" task`;
      case 'complete': return `Mark task as completed`;
      case 'schedule': return `Schedule for ${action.timeSlot}`;
      case 'auto_schedule': return `Auto-schedule all tasks`;
      case 'view_tasks': return `Show all tasks`;
      default: return 'Perform action';
    }
  }

  private async enhancedMockProcessing(userMessage: string): Promise<{
    content: string;
    actions?: TaskAction[];
    suggestions?: TaskSuggestion[];
    showTasks?: boolean;
  }> {
    const lowercaseInput = userMessage.toLowerCase();
    
    // Task creation requests
    if (lowercaseInput.includes('create') || lowercaseInput.includes('add task')) {
      return {
        content: "I can help you create a new task! What type of task would you like to create?",
        actions: [{
          type: 'create',
          taskTitle: 'New Task',
          taskType: 'light_work',
          priority: 'MEDIUM',
          estimatedDuration: 30,
          confidence: 0.8,
          actionDescription: 'Create new task'
        }]
      };
    }

    // View tasks requests
    if (lowercaseInput.includes('show') || lowercaseInput.includes('list') || lowercaseInput.includes('see tasks')) {
      return {
        content: `📋 Here are your current tasks:\n\n${this.formatTaskList()}`,
        showTasks: true
      };
    }

    // Task completion requests
    if (lowercaseInput.includes('complete') || lowercaseInput.includes('done') || lowercaseInput.includes('finish')) {
      return {
        content: "Which task would you like to mark as completed?",
        taskData: this.context?.availableTasks
      };
    }

    // Default enhanced response
    return {
      content: `🤖 I can help you with:

• **Create tasks**: "Create a deep work task for coding"
• **View tasks**: "Show me all my tasks" 
• **Complete tasks**: "Mark [task] as done"
• **Schedule tasks**: "Schedule my high priority tasks"
• **Auto-schedule**: "Optimize my entire day"

You have ${this.context?.availableTasks.length || 0} unscheduled tasks. What would you like to do?`,
      actions: [{
        type: 'auto_schedule',
        confidence: 0.7,
        actionDescription: 'Auto-schedule all tasks'
      }]
    };
  }

  private formatTaskList(): string {
    if (!this.context?.availableTasks.length) {
      return "No unscheduled tasks found.";
    }

    return this.context.availableTasks.map((task, index) => 
      `${index + 1}. **${task.title}** (${task.taskType}, ${task.priority}, ${task.estimatedDuration}min)`
    ).join('\n');
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  private createErrorMessage(): ChatMessage {
    return {
      id: Date.now().toString(),
      content: "I'm having trouble processing that request. Please try again or ask me to show your tasks.",
      type: 'assistant',
      timestamp: new Date()
    };
  }

  // ===== PUBLIC GETTERS =====

  getContext(): ConversationContext | null {
    return this.context;
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
}

// Export singleton instance
export const timeboxAiService = new TimeBoxAIService();

// Export types
export type { ConversationContext, TaskAction, TaskSuggestion };
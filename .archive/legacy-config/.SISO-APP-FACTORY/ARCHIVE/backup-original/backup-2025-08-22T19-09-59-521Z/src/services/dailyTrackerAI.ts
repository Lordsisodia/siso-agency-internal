// Enhanced AI Assistant for Daily Tracker with Task Management Commands
import { grokTaskService } from './grokTaskService';

interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: 'deep_focus' | 'light_focus' | 'morning_routine' | 'workout' | 'health';
  notes?: string;
}

interface AICommand {
  action: 'add' | 'delete' | 'complete' | 'clear' | 'search' | 'help';
  target: 'all' | 'deep_focus' | 'light_focus' | 'morning_routine' | 'workout' | 'health';
  content?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface AIResponse {
  success: boolean;
  message: string;
  actions?: Array<{
    type: string;
    description: string;
    executed: boolean;
  }>;
  tasks?: DailyTask[];
}

export class DailyTrackerAI {
  private isGrokReady: boolean;

  constructor() {
    this.isGrokReady = grokTaskService.isReady();
  }

  // Main AI command processor
  async processCommand(userInput: string, currentTasks: {
    deepFocus: DailyTask[];
    lightFocus: DailyTask[];
    morningRoutine: DailyTask[];
    workout: DailyTask[];
    health: DailyTask[];
  }): Promise<AIResponse> {
    try {
      // Parse the user input into a structured command
      const command = await this.parseUserInput(userInput);
      
      // Execute the command
      const result = await this.executeCommand(command, currentTasks);
      
      return result;
    } catch (error) {
      console.error('AI Command Processing Error:', error);
      return {
        success: false,
        message: "I encountered an error processing your request. Please try again or rephrase your command."
      };
    }
  }

  // Intelligent command parsing using Grok AI
  private async parseUserInput(userInput: string): Promise<AICommand> {
    if (!this.isGrokReady) {
      return this.fallbackParsing(userInput);
    }

    try {
      const prompt = `
        Parse this user command for a daily task tracker into a structured command:
        User input: "${userInput}"
        
        Available actions: add, delete, complete, clear, search, help
        Available targets: all, deep_focus, light_focus, morning_routine, workout, health
        Available priorities: high, medium, low
        
        Respond with JSON only:
        {
          "action": "add|delete|complete|clear|search|help",
          "target": "all|deep_focus|light_focus|morning_routine|workout|health",
          "content": "task description if adding",
          "priority": "high|medium|low if adding"
        }
        
        Examples:
        - "delete all deep focus tasks" -> {"action": "delete", "target": "deep_focus"}
        - "add high priority task to review client proposals" -> {"action": "add", "target": "deep_focus", "content": "review client proposals", "priority": "high"}
        - "complete all morning routine" -> {"action": "complete", "target": "morning_routine"}
        - "clear all tasks" -> {"action": "clear", "target": "all"}
      `;

      const response = await grokTaskService.chatWithGrok({
        message: prompt,
        tasks: [],
        action: 'analyze'
      });

      // Extract JSON from response
      const jsonMatch = response.message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'help',
          target: parsed.target || 'all',
          content: parsed.content,
          priority: parsed.priority
        };
      }
    } catch (error) {
      console.error('Grok parsing failed:', error);
    }

    return this.fallbackParsing(userInput);
  }

  // Fallback parsing for when Grok is not available
  private fallbackParsing(userInput: string): AICommand {
    const input = userInput.toLowerCase();
    
    // Determine action
    let action: AICommand['action'] = 'help';
    if (input.includes('add') || input.includes('create')) action = 'add';
    else if (input.includes('delete') || input.includes('remove') || input.includes('clear')) {
      action = input.includes('all') ? 'clear' : 'delete';
    }
    else if (input.includes('complete') || input.includes('finish') || input.includes('done')) action = 'complete';
    else if (input.includes('search') || input.includes('find')) action = 'search';

    // Determine target
    let target: AICommand['target'] = 'all';
    if (input.includes('deep focus') || input.includes('deep work')) target = 'deep_focus';
    else if (input.includes('light focus') || input.includes('light work')) target = 'light_focus';
    else if (input.includes('morning') || input.includes('routine')) target = 'morning_routine';
    else if (input.includes('workout') || input.includes('exercise')) target = 'workout';
    else if (input.includes('health') || input.includes('supplement')) target = 'health';

    // Extract content for add commands
    let content: string | undefined;
    if (action === 'add') {
      const addMatch = input.match(/add\s+(.*?)(?:\s+to|$)/);
      content = addMatch ? addMatch[1] : userInput.replace(/add\s*/, '');
    }

    // Determine priority
    let priority: AICommand['priority'] | undefined;
    if (input.includes('high priority') || input.includes('urgent')) priority = 'high';
    else if (input.includes('low priority') || input.includes('later')) priority = 'low';
    else if (action === 'add') priority = 'medium';

    return { action, target, content, priority };
  }

  // Execute the parsed command
  private async executeCommand(command: AICommand, currentTasks: {
    deepFocus: DailyTask[];
    lightFocus: DailyTask[];
    morningRoutine: DailyTask[];
    workout: DailyTask[];
    health: DailyTask[];
  }): Promise<AIResponse> {
    const actions: Array<{ type: string; description: string; executed: boolean }> = [];

    switch (command.action) {
      case 'add':
        return this.handleAddTask(command, currentTasks);
      
      case 'delete':
        return this.handleDeleteTasks(command, currentTasks);
      
      case 'complete':
        return this.handleCompleteTasks(command, currentTasks);
      
      case 'clear':
        return this.handleClearTasks(command, currentTasks);
      
      case 'search':
        return this.handleSearchTasks(command, currentTasks);
      
      case 'help':
      default:
        return this.handleHelp();
    }
  }

  private async handleAddTask(command: AICommand, currentTasks: any): Promise<AIResponse> {
    if (!command.content) {
      return {
        success: false,
        message: "Please specify what task you'd like to add."
      };
    }

    const newTask: DailyTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: command.content,
      completed: false,
      priority: command.priority || 'medium',
      category: command.target as any
    };

    // If using Grok, enhance the task
    if (this.isGrokReady && command.target === 'deep_focus') {
      try {
        const enhanced = await grokTaskService.createTasksFromDescription(command.content, []);
        if (enhanced.tasks && enhanced.tasks.length > 0) {
          return {
            success: true,
            message: `I've created ${enhanced.tasks.length} enhanced task(s) for deep focus work.`,
            tasks: enhanced.tasks.map(t => ({
              id: t.id,
              title: t.title,
              completed: false,
              priority: t.priority,
              category: 'deep_focus' as const,
              notes: t.description
            }))
          };
        }
      } catch (error) {
        console.error('Grok task enhancement failed:', error);
      }
    }

    return {
      success: true,
      message: `Added "${command.content}" to ${command.target.replace('_', ' ')} tasks with ${command.priority} priority.`,
      tasks: [newTask]
    };
  }

  private handleDeleteTasks(command: AICommand, currentTasks: any): Promise<AIResponse> {
    const targetSection = command.target === 'all' ? 'all sections' : command.target.replace('_', ' ');
    
    return Promise.resolve({
      success: true,
      message: `Cleared all tasks from ${targetSection}.`,
      actions: [{
        type: 'clear_tasks',
        description: `Clear ${targetSection}`,
        executed: true
      }]
    });
  }

  private handleCompleteTasks(command: AICommand, currentTasks: any): Promise<AIResponse> {
    const targetSection = command.target === 'all' ? 'all sections' : command.target.replace('_', ' ');
    
    return Promise.resolve({
      success: true,
      message: `Marked all tasks in ${targetSection} as completed! 🎉`,
      actions: [{
        type: 'complete_tasks',
        description: `Complete all tasks in ${targetSection}`,
        executed: true
      }]
    });
  }

  private handleClearTasks(command: AICommand, currentTasks: any): Promise<AIResponse> {
    const targetSection = command.target === 'all' ? 'all sections' : command.target.replace('_', ' ');
    
    return Promise.resolve({
      success: true,
      message: `Cleared all tasks from ${targetSection}.`,
      actions: [{
        type: 'clear_tasks',
        description: `Clear all tasks from ${targetSection}`,
        executed: true
      }]
    });
  }

  private handleSearchTasks(command: AICommand, currentTasks: any): Promise<AIResponse> {
    // Basic search implementation - can be enhanced later
    const allTasks = [
      ...currentTasks.deepFocus,
      ...currentTasks.lightFocus,
      ...currentTasks.morningRoutine,
      ...currentTasks.workout,
      ...currentTasks.health
    ];

    const searchTerm = command.content?.toLowerCase() || '';
    const matching = allTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.notes?.toLowerCase().includes(searchTerm)
    );

    return Promise.resolve({
      success: true,
      message: `Found ${matching.length} tasks matching your search.`,
      tasks: matching
    });
  }

  private handleHelp(): Promise<AIResponse> {
    const helpMessage = `
🤖 **Daily Tracker AI Assistant Commands:**

**Add Tasks:**
- "Add high priority task review client proposals"
- "Create deep focus task for coding the new feature"
- "Add workout push-ups to routine"

**Complete Tasks:**
- "Complete all morning routine"
- "Mark all deep focus tasks as done"
- "Finish all workout tasks"

**Delete/Clear:**
- "Delete all deep focus tasks"  
- "Clear all light focus work"
- "Remove all tasks"

**Search:**
- "Search for client tasks"
- "Find all high priority items"

**Task Categories:**
- **Deep Focus:** Important work requiring high concentration
- **Light Focus:** Easier tasks, administrative work
- **Morning Routine:** Daily startup activities
- **Workout:** Exercise and fitness tasks
- **Health:** Supplements, nutrition, wellness

Just speak naturally! I'll understand and execute your commands.
    `;

    return Promise.resolve({
      success: true,
      message: helpMessage.trim()
    });
  }

  // Quick command shortcuts
  async quickComplete(category: string): Promise<AIResponse> {
    return this.handleCompleteTasks({ action: 'complete', target: category as any }, {});
  }

  async quickClear(category: string): Promise<AIResponse> {
    return this.handleClearTasks({ action: 'clear', target: category as any }, {});
  }

  async quickAdd(category: string, taskTitle: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<AIResponse> {
    return this.handleAddTask({ 
      action: 'add', 
      target: category as any, 
      content: taskTitle, 
      priority 
    }, {});
  }

  // Check if the AI service is ready
  isReady(): boolean {
    return true; // Always ready with fallback parsing
  }

  getServiceStatus(): { grokReady: boolean; fallbackReady: boolean } {
    return {
      grokReady: this.isGrokReady,
      fallbackReady: true
    };
  }
}

export const dailyTrackerAI = new DailyTrackerAI();
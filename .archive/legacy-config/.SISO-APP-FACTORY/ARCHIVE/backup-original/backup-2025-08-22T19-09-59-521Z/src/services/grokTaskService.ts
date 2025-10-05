// Groq API Integration for Task Management
import Groq from 'groq-sdk';

// Simple types to avoid import conflicts
interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  description?: string;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface GrokTaskRequest {
  message: string;
  tasks: Task[];
  action?: 'create' | 'analyze' | 'prioritize' | 'plan' | 'optimize';
}

interface GrokResponse {
  message: string;
  tasks?: Task[];
  suggestions?: string[];
  analysis?: {
    workloadSummary: string;
    recommendations: string[];
    priorityTasks: string[];
  };
}

export class GrokTaskService {
  private groq: Groq;
  private isConfigured: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.isConfigured = !!apiKey;
    
    if (this.isConfigured) {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async chatWithGrok(request: GrokTaskRequest): Promise<GrokResponse> {
    if (!this.isConfigured) {
      return {
        message: "Groq API is not configured. Please add VITE_GROQ_API_KEY to your environment variables."
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || "No response generated";
      
      // Parse the response and extract tasks/analysis
      return this.parseGrokResponse(response, request);
    } catch (error) {
      console.error('Groq API Error:', error);
      return {
        message: "Sorry, I encountered an error while processing your request. Please try again."
      };
    }
  }

  private buildSystemPrompt(request: GrokTaskRequest): string {
    return `You are an AI task management assistant for SISO Agency. You help with:
1. Creating tasks from natural language descriptions
2. Analyzing workloads and productivity
3. Prioritizing tasks based on deadlines and importance
4. Creating project plans with multiple tasks
5. Optimizing schedules and workflows

Current task context:
- Total tasks: ${request.tasks.length}
- Active tasks: ${request.tasks.filter(t => !t.completed).length}
- Overdue tasks: ${request.tasks.filter(t => t.status === 'overdue').length}

Available categories: development, design, marketing, client, admin
Available priorities: high, medium, low
Available statuses: not-started, in-progress, blocked, done, overdue, due-today, upcoming

TASK CREATION GUIDELINES:
- When users ask to create tasks, ALWAYS respond with properly formatted JSON
- Break down complex requests into multiple specific tasks
- Assign appropriate categories based on task content
- Set realistic priorities and due dates
- Include descriptions and subtasks when helpful
- Generate unique IDs using timestamp + random

JSON RESPONSE FORMAT for creating tasks:
{
  "message": "I've created [X] tasks for you:",
  "tasks": [
    {
      "id": "task-[timestamp]-[random]",
      "title": "Clear, actionable task title",
      "completed": false,
      "status": "not-started",
      "priority": "high|medium|low",
      "category": "development|design|marketing|client|admin",
      "description": "Detailed description of what needs to be done",
      "estimatedHours": [number],
      "dueDate": "YYYY-MM-DD" (if mentioned or can be inferred),
      "tags": ["relevant", "tags"],
      "subtasks": [
        {
          "id": "subtask-[timestamp]-[random]",
          "title": "Specific subtask",
          "completed": false
        }
      ]
    }
  ]
}

INTELLIGENT CATEGORIZATION:
- "development", "coding", "programming", "bug", "feature" → development
- "design", "ui", "ux", "mockup", "wireframe", "logo" → design  
- "marketing", "social media", "content", "seo", "campaign" → marketing
- "client", "meeting", "call", "presentation", "proposal" → client
- "admin", "documentation", "planning", "organization" → admin

PRIORITY ASSIGNMENT:
- high: urgent, deadline soon, critical, important, asap
- medium: normal timeline, moderate importance
- low: nice-to-have, future, when time permits

Always be helpful, specific, and create actionable tasks that move projects forward.`;
  }

  private buildUserPrompt(request: GrokTaskRequest): string {
    let prompt = `User request: "${request.message}"`;
    
    if (request.action) {
      prompt += `\nAction type: ${request.action}`;
    }

    if (request.tasks.length > 0) {
      prompt += `\n\nCurrent tasks:\n`;
      request.tasks.slice(0, 5).forEach(task => {
        prompt += `- ${task.title} (${task.status}, ${task.priority} priority, ${task.category})\n`;
      });
      
      if (request.tasks.length > 5) {
        prompt += `... and ${request.tasks.length - 5} more tasks\n`;
      }
    }

    // Add context about task creation patterns
    if (this.isTaskCreationRequest(request.message)) {
      prompt += `\n\nThis appears to be a task creation request. Please create specific, actionable tasks with proper categorization and respond in JSON format.`;
    }

    return prompt;
  }

  private isTaskCreationRequest(message: string): boolean {
    const creationKeywords = [
      'create', 'add', 'make', 'build', 'develop', 'design', 'implement',
      'task', 'todo', 'need to', 'should', 'must', 'have to',
      'project', 'feature', 'fix', 'update', 'improve'
    ];
    
    const lowerMessage = message.toLowerCase();
    return creationKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private parseGrokResponse(response: string, request: GrokTaskRequest): GrokResponse {
    try {
      // Try to parse JSON response first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and enhance task objects
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          parsed.tasks = parsed.tasks.map((task: any) => this.validateAndEnhanceTask(task));
        }
        
        return {
          message: parsed.message || response,
          tasks: parsed.tasks || undefined,
          analysis: parsed.analysis || undefined
        };
      }
    } catch (e) {
      console.warn('JSON parsing failed, falling back to text extraction:', e);
    }

    // Enhanced text parsing for task extraction
    const tasks = this.extractTasksFromText(response, request.message);
    
    return {
      message: response,
      tasks: tasks.length > 0 ? tasks : undefined
    };
  }

  private validateAndEnhanceTask(task: any): Task {
    const now = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return {
      id: task.id || `task-${now}-${randomSuffix}`,
      title: task.title || 'Untitled Task',
      completed: false,
      status: task.status || 'not-started',
      priority: task.priority || 'medium',
      category: task.category || this.inferCategory(task.title || ''),
      description: task.description || '',
      estimatedHours: task.estimatedHours || undefined,
      dueDate: task.dueDate || undefined,
      tags: task.tags || [],
      subtasks: task.subtasks || []
    };
  }

  private inferCategory(title: string): Task['category'] {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.match(/\b(code|coding|program|develop|bug|feature|api|database|frontend|backend)\b/)) {
      return 'development';
    }
    if (lowerTitle.match(/\b(design|ui|ux|mockup|wireframe|logo|brand|visual)\b/)) {
      return 'design';
    }
    if (lowerTitle.match(/\b(marketing|social|content|seo|campaign|promotion|ads)\b/)) {
      return 'marketing';
    }
    if (lowerTitle.match(/\b(client|meeting|call|presentation|proposal|demo)\b/)) {
      return 'client';
    }
    
    return 'admin';
  }

  private extractTasksFromText(text: string, originalMessage: string): Task[] {
    const tasks: Task[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      // Enhanced pattern matching for tasks
      const taskPatterns = [
        /^[\s]*[-*•]\s*(.+)$/,           // Bullet points
        /^[\s]*\d+[\.)]\s*(.+)$/,       // Numbered lists
        /^[\s]*Task:\s*(.+)$/i,         // "Task:" prefix
        /^[\s]*TODO:\s*(.+)$/i,         // "TODO:" prefix
        /^[\s]*-\s*\[[ x]\]\s*(.+)$/,   // Checkbox format
      ];
      
      for (const pattern of taskPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const title = match[1].trim();
          if (title.length > 3 && title.length < 150) {
            const now = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            
            tasks.push({
              id: `extracted-${now}-${index}-${randomSuffix}`,
              title: title,
              completed: false,
              status: 'not-started',
              priority: this.inferPriority(title, originalMessage),
              category: this.inferCategory(title),
              description: `Extracted from: "${originalMessage}"`,
              tags: this.extractTags(title)
            });
            break; // Only match first pattern per line
          }
        }
      }
    });

    return tasks;
  }

  private inferPriority(title: string, context: string): Task['priority'] {
    const combined = `${title} ${context}`.toLowerCase();
    
    if (combined.match(/\b(urgent|critical|asap|immediately|high|important|priority)\b/)) {
      return 'high';
    }
    if (combined.match(/\b(low|later|someday|nice|optional|when time)\b/)) {
      return 'low';
    }
    
    return 'medium';
  }

  private extractTags(title: string): string[] {
    const tags: string[] = [];
    const lowerTitle = title.toLowerCase();
    
    // Technology tags
    if (lowerTitle.includes('react')) tags.push('react');
    if (lowerTitle.includes('ui') || lowerTitle.includes('interface')) tags.push('ui');
    if (lowerTitle.includes('api')) tags.push('api');
    if (lowerTitle.includes('mobile')) tags.push('mobile');
    if (lowerTitle.includes('web')) tags.push('web');
    
    return tags;
  }

  // Specialized methods for different AI actions
  async analyzeWorkload(tasks: Task[]): Promise<GrokResponse> {
    return this.chatWithGrok({
      message: "Please analyze my current workload and provide insights on productivity, task distribution, and recommendations for improvement.",
      tasks,
      action: 'analyze'
    });
  }

  async suggestTaskPriorities(tasks: Task[]): Promise<GrokResponse> {
    return this.chatWithGrok({
      message: "Help me prioritize these tasks based on deadlines, importance, and dependencies. Suggest which tasks I should focus on first.",
      tasks,
      action: 'prioritize'
    });
  }

  async createProjectPlan(projectDescription: string, tasks: Task[]): Promise<GrokResponse> {
    return this.chatWithGrok({
      message: `Create a detailed project plan for: ${projectDescription}. Break it down into specific, actionable tasks with priorities, categories, and estimated timelines.`,
      tasks,
      action: 'plan'
    });
  }

  async optimizeSchedule(tasks: Task[]): Promise<GrokResponse> {
    return this.chatWithGrok({
      message: "Analyze my current tasks and suggest ways to optimize my schedule for better productivity and time management.",
      tasks,
      action: 'optimize'
    });
  }

  // New method for intelligent task creation
  async createTasksFromDescription(description: string, tasks: Task[]): Promise<GrokResponse> {
    return this.chatWithGrok({
      message: `Create specific, actionable tasks for: ${description}. Include proper categorization, priorities, and break down complex work into manageable tasks.`,
      tasks,
      action: 'create'
    });
  }

  // Check if the service is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }
}

export const grokTaskService = new GrokTaskService();
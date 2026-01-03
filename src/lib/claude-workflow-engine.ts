// Claude-Managed Workflow Engine
// This system allows Claude to programmatically create, modify, and execute workflows

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface WorkflowStep {
  id: string
  type: 'telegram' | 'groq' | 'github' | 'supabase' | 'claude' | 'notification' | 'router' | 'webhook'
  config: Record<string, any>
  onSuccess?: string // Next step ID
  onError?: string   // Error handler step ID
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: 'telegram_message' | 'telegram_voice' | 'scheduled' | 'webhook'
  steps: WorkflowStep[]
  active: boolean
  created_at: string
  updated_at: string
}

interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed'
  input: any
  output: any
  steps_completed: string[]
  error?: string
  started_at: string
  completed_at?: string
}

export interface CodeRequest {
  type: 'generate' | 'modify' | 'analyze' | 'review';
  description: string;
  files?: string[];
  context?: string;
  requirements?: string[];
}

export interface TaskStatus {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  created: Date;
  updated: Date;
  estimatedHours?: number;
  actualHours?: number;
  files: string[];
  dependencies?: string[];
}

export interface ProjectStatus {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionPercentage: number;
  estimatedCompletion: Date;
  recentActivity: TaskStatus[];
  codeStats: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
    lastCommit: string;
  };
}

export class ClaudeWorkflowEngine {
  private supabase: any
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private claude: Anthropic
  private projectRoot: string
  private tasks: Map<string, TaskStatus> = new Map()
  private maxTokens: number
  private tokenUsage: number = 0
  private rateLimitPerHour: number

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
    this.projectRoot = process.cwd()
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '100000')
    this.rateLimitPerHour = parseInt(process.env.CLAUDE_RATE_LIMIT || '1000')
    
    this.loadWorkflows()
    this.loadExistingTasks()
  }

  // Claude can call this to create new workflows
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.workflows.set(id, newWorkflow)
    await this.saveWorkflow(newWorkflow)
    
    console.log(`✅ Claude created workflow: ${workflow.name}`)
    return id
  }

  // Claude can modify existing workflows
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<boolean> {
    const workflow = this.workflows.get(id)
    if (!workflow) return false

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updated_at: new Date().toISOString()
    }

    this.workflows.set(id, updatedWorkflow)
    await this.saveWorkflow(updatedWorkflow)
    
    console.log(`🔄 Claude updated workflow: ${workflow.name}`)
    return true
  }

  // Execute a workflow (called by Telegram webhook)
  async executeWorkflow(triggerType: string, input: any): Promise<WorkflowExecution> {
    const workflow = Array.from(this.workflows.values())
      .find(w => w.trigger === triggerType && w.active)

    if (!workflow) {
      throw new Error(`No active workflow found for trigger: ${triggerType}`)
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflow_id: workflow.id,
      status: 'running',
      input,
      output: {},
      steps_completed: [],
      started_at: new Date().toISOString()
    }

    this.executions.set(execution.id, execution)

    try {
      await this.runWorkflowSteps(workflow, execution)
      execution.status = 'completed'
      execution.completed_at = new Date().toISOString()
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : String(error)
      execution.completed_at = new Date().toISOString()
    }

    await this.saveExecution(execution)
    return execution
  }

  private async runWorkflowSteps(workflow: Workflow, execution: WorkflowExecution) {
    let currentStepId = workflow.steps[0]?.id
    let stepData = execution.input

    while (currentStepId) {
      const step = workflow.steps.find(s => s.id === currentStepId)
      if (!step) break

      console.log(`🔄 Executing step: ${step.type} (${step.id})`)

      try {
        stepData = await this.executeStep(step, stepData, execution)
        execution.steps_completed.push(step.id)
        currentStepId = step.onSuccess
      } catch (error) {
        console.error(`❌ Step failed: ${step.id}`, error)
        currentStepId = step.onError
        if (!currentStepId) throw error
      }
    }

    execution.output = stepData
  }

  private async executeStep(step: WorkflowStep, data: any, execution: WorkflowExecution): Promise<any> {
    switch (step.type) {
      case 'telegram':
        return await this.executeTelegramStep(step, data)
      
      case 'groq':
        return await this.executeGroqStep(step, data)
      
      case 'github':
        return await this.executeGithubStep(step, data)
      
      case 'supabase':
        return await this.executeSupabaseStep(step, data)
      
      case 'claude':
        return await this.executeClaudeStep(step, data)
      
      case 'notification':
        return await this.executeNotificationStep(step, data)
      
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  private async executeTelegramStep(step: WorkflowStep, data: any): Promise<any> {
    const { action, chat_id, text, bot_token } = step.config

    if (action === 'send_message') {
      const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text })
      })
      return await response.json()
    }

    if (action === 'get_file') {
      const fileResponse = await fetch(`https://api.telegram.org/bot${bot_token}/getFile?file_id=${data.file_id}`)
      const fileInfo = await fileResponse.json()
      
      if (fileInfo.ok) {
        const fileUrl = `https://api.telegram.org/file/bot${bot_token}/${fileInfo.result.file_path}`
        const audioResponse = await fetch(fileUrl)
        const audioBuffer = await audioResponse.arrayBuffer()
        return { audio_data: audioBuffer, file_path: fileInfo.result.file_path }
      }
    }

    return data
  }

  private async executeGroqStep(step: WorkflowStep, data: any): Promise<any> {
    const { api_key, model, action } = step.config

    if (action === 'transcribe_audio' && data.audio_data) {
      const formData = new FormData()
      formData.append('file', new Blob([data.audio_data]), 'audio.ogg')
      formData.append('model', 'whisper-large-v3')

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${api_key}` },
        body: formData
      })

      const result = await response.json()
      return { ...data, transcription: result.text }
    }

    if (action === 'parse_feedback') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `Parse this feedback and categorize it. Return JSON with:
              {
                "type": "bug" | "feature" | "todo" | "question",
                "priority": "low" | "medium" | "high" | "urgent",
                "title": "brief title",
                "description": "detailed description",
                "component": "estimated component/area",
                "action": "github" | "todo" | "claude" | "direct_response"
              }`
            },
            {
              role: 'user',
              content: data.transcription || data.text || data.message
            }
          ]
        })
      })

      const result = await response.json()
      const parsed = JSON.parse(result.choices[0].message.content)
      return { ...data, parsed_feedback: parsed }
    }

    return data
  }

  private async executeGithubStep(step: WorkflowStep, data: any): Promise<any> {
    const { token, owner, repo, action } = step.config
    const feedback = data.parsed_feedback

    if (action === 'create_issue' && feedback) {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: feedback.title,
          body: `${feedback.description}\n\n**Component:** ${feedback.component}\n**Priority:** ${feedback.priority}\n\n*Created by Telegram Voice Assistant*`,
          labels: [feedback.type, feedback.priority]
        })
      })

      const issue = await response.json()
      return { ...data, github_issue: issue }
    }

    return data
  }

  private async executeSupabaseStep(step: WorkflowStep, data: any): Promise<any> {
    const { table, action, fields } = step.config
    const feedback = data.parsed_feedback

    if (action === 'insert' && feedback) {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert({
          title: feedback.title,
          description: feedback.description,
          priority: feedback.priority,
          category: feedback.type,
          status: 'pending',
          metadata: {
            source: 'telegram',
            component: feedback.component,
            original_message: data.transcription || data.text
          }
        })

      if (error) throw error
      return { ...data, supabase_record: result }
    }

    return data
  }

  private async executeClaudeStep(step: WorkflowStep, data: any): Promise<any> {
    const { action, file_path } = step.config
    const feedback = data.parsed_feedback

    if (action === 'save_task' && feedback) {
      const task = {
        id: `claude_task_${Date.now()}`,
        title: feedback.title,
        description: feedback.description,
        priority: feedback.priority,
        component: feedback.component,
        prompt: `Implement: ${feedback.title}\n\nDescription: ${feedback.description}\n\nComponent: ${feedback.component}\n\nPriority: ${feedback.priority}`,
        created_at: new Date().toISOString(),
        status: 'pending'
      }

      // Save to file system for Claude to pick up
      const fs = await import('fs/promises')
      const tasksFile = file_path || './claude-tasks.json'
      
      let tasks = []
      try {
        const existing = await fs.readFile(tasksFile, 'utf-8')
        tasks = JSON.parse(existing)
      } catch (e) {
        // File doesn't exist, start with empty array
      }

      tasks.push(task)
      await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2))

      return { ...data, claude_task: task }
    }

    return data
  }

  private async executeNotificationStep(step: WorkflowStep, data: any): Promise<any> {
    const { type, message, chat_id, bot_token } = step.config

    if (type === 'telegram_confirmation') {
      const feedback = data.parsed_feedback
      const confirmationMessage = this.buildConfirmationMessage(feedback, data)

      await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: confirmationMessage,
          parse_mode: 'Markdown'
        })
      })
    }

    return data
  }

  private buildConfirmationMessage(feedback: any, data: any): string {
    const icons = {
      bug: '🐛',
      feature: '✨',
      todo: '📝',
      question: '❓'
    }

    const priorities = {
      low: '🟢',
      medium: '🟡',
      high: '🔴',
      urgent: '🚨'
    }

    let message = `${icons[feedback.type]} *${feedback.title}* ${priorities[feedback.priority]}\n`
    message += `${feedback.description}\n`
    message += `📁 ${feedback.component} | 🎯 ${feedback.action}\n\n`

    if (data.github_issue) {
      message += `✅ *GitHub Issue Created!*\n`
      message += `Issue #${data.github_issue.number}: ${data.github_issue.html_url}`
    } else if (data.claude_task) {
      message += `🤖 *Saved for Claude Code!*\n`
      message += `Task ID: ${data.claude_task.id}`
    } else if (data.supabase_record) {
      message += `📝 *Added to Todo List!*`
    }

    return message
  }

  private async loadWorkflows() {
    // Load workflows from database or file system
    // For now, we'll start with empty and let Claude populate
  }

  private async saveWorkflow(workflow: Workflow) {
    // Save to database or file system
    const { error } = await this.supabase
      .from('claude_workflows')
      .upsert(workflow)

    if (error) console.error('Failed to save workflow:', error)
  }

  private async saveExecution(execution: WorkflowExecution) {
    // Save execution history
    const { error } = await this.supabase
      .from('claude_executions')
      .upsert(execution)

    if (error) console.error('Failed to save execution:', error)
  }

  // Claude can call this to get workflow status
  async getWorkflowStatus(workflowId?: string) {
    if (workflowId) {
      return {
        workflow: this.workflows.get(workflowId),
        recent_executions: Array.from(this.executions.values())
          .filter(e => e.workflow_id === workflowId)
          .slice(-10)
      }
    }

    return {
      total_workflows: this.workflows.size,
      active_workflows: Array.from(this.workflows.values()).filter(w => w.active).length,
      recent_executions: Array.from(this.executions.values()).slice(-20)
    }
  }

  // 🤖 CORE CLAUDE INTEGRATION
  async processCodeRequest(request: CodeRequest, userMessage: string): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const contextData = await this.gatherProjectContext(request.files);
      
      const response = await this.claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `${userMessage}\n\nProject Context:\n${contextData}\n\nRequest Details:\n${JSON.stringify(request, null, 2)}`
        }]
      });

      this.trackTokenUsage(response.usage?.input_tokens, response.usage?.output_tokens);
      
      return await this.processClaudeResponse(response.content[0].text, request);
    } catch (error) {
      console.error('Claude API Error:', error);
      return `❌ Error processing request: ${error.message}`;
    }
  }

  private buildSystemPrompt(request: CodeRequest): string {
    return `You are a senior software engineer working on the SISO project. You have access to the codebase and can:

1. **Generate Code**: Create new files, components, APIs, and features
2. **Modify Code**: Update existing files with improvements or fixes
3. **Analyze Code**: Review code quality, performance, and best practices
4. **Manage Tasks**: Track development progress and create task lists

**Project Context:**
- Tech Stack: React, TypeScript, Next.js, Supabase, Tailwind CSS
- Architecture: Component-based with admin dashboard, integrations, and automation
- Current Features: Telegram bot, WhatsApp integration, Notion sync, GitHub integration

**Code Generation Rules:**
1. Always include proper TypeScript types
2. Follow existing code patterns and conventions
3. Add comprehensive error handling
4. Include JSDoc comments for functions
5. Use existing UI components when possible
6. Ensure responsive design with Tailwind CSS
7. Add proper validation and security measures

**File Operations:**
- When creating files, provide the complete file content
- When modifying files, show the specific changes needed
- Always backup important files before modifications
- Use proper file naming conventions

**Task Management:**
- Create specific, actionable tasks
- Estimate effort in hours
- Set appropriate priorities
- Track dependencies between tasks

**Response Format:**
Provide responses in this structure:
\`\`\`json
{
  "action": "generate|modify|analyze|task",
  "files": [{"path": "file/path", "content": "file content"}],
  "tasks": [{"title": "task", "description": "desc", "priority": "high"}],
  "summary": "What was accomplished",
  "nextSteps": ["step 1", "step 2"]
}
\`\`\`

Always be specific, actionable, and provide complete working code.`;
  }

  // 📁 PROJECT CONTEXT GATHERING
  private async gatherProjectContext(files?: string[]): Promise<string> {
    let context = '';
    
    try {
      // Get project structure
      const structure = await this.getProjectStructure();
      context += `Project Structure:\n${structure}\n\n`;
      
      // Get recent git activity
      const gitActivity = this.getRecentGitActivity();
      context += `Recent Git Activity:\n${gitActivity}\n\n`;
      
      // Get specific file contents if requested
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const content = await fs.readFile(path.join(this.projectRoot, file), 'utf-8');
            context += `File: ${file}\n\`\`\`\n${content.substring(0, 2000)}\n\`\`\`\n\n`;
          } catch (error) {
            context += `File: ${file} - Not found or inaccessible\n\n`;
          }
        }
      }
      
      // Get current tasks
      const taskSummary = this.getTaskSummary();
      context += `Current Tasks:\n${taskSummary}\n\n`;
      
    } catch (error) {
      context += `Error gathering context: ${error.message}\n`;
    }
    
    return context;
  }

  private async getProjectStructure(): Promise<string> {
    try {
      const result = execSync('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -20', 
        { encoding: 'utf-8', cwd: this.projectRoot });
      return result;
    } catch (error) {
      return 'Unable to get project structure';
    }
  }

  private getRecentGitActivity(): string {
    try {
      const result = execSync('git log --oneline -10', 
        { encoding: 'utf-8', cwd: this.projectRoot });
      return result;
    } catch (error) {
      return 'No git activity found';
    }
  }

  // 🔧 CODE EXECUTION AND FILE OPERATIONS
  private async processClaudeResponse(response: string, request: CodeRequest): Promise<string> {
    try {
      // Extract JSON from Claude's response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        return response; // Return raw response if no JSON found
      }

      const action = JSON.parse(jsonMatch[1]);
      let result = '';

      // Process file operations
      if (action.files && action.files.length > 0) {
        for (const file of action.files) {
          const success = await this.handleFileOperation(file, request.type);
          result += success ? `✅ ${file.path}\n` : `❌ Failed: ${file.path}\n`;
        }
      }

      // Process task creation
      if (action.tasks && action.tasks.length > 0) {
        for (const task of action.tasks) {
          const taskId = await this.createTask(task);
          result += `📋 Created task: ${task.title} (${taskId})\n`;
        }
      }

      // Build summary response
      result += `\n📊 **Summary**: ${action.summary}\n`;
      if (action.nextSteps && action.nextSteps.length > 0) {
        result += `\n🚀 **Next Steps**:\n${action.nextSteps.map(step => `• ${step}`).join('\n')}`;
      }

      return result;
    } catch (error) {
      console.error('Error processing Claude response:', error);
      return response; // Return raw response on error
    }
  }

  private async handleFileOperation(file: { path: string; content: string }, operationType: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.projectRoot, file.path);
      const dir = path.dirname(fullPath);

      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });

      // Backup existing file if modifying
      if (operationType === 'modify' && await this.fileExists(fullPath)) {
        await fs.copyFile(fullPath, `${fullPath}.backup`);
      }

      // Write the file
      await fs.writeFile(fullPath, file.content, 'utf-8');
      
      // Git add the file
      try {
        execSync(`git add "${file.path}"`, { cwd: this.projectRoot });
      } catch (gitError) {
        console.log('Git add failed (non-critical):', gitError.message);
      }

      return true;
    } catch (error) {
      console.error(`File operation failed for ${file.path}:`, error);
      return false;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // 📋 TASK MANAGEMENT
  async createTask(taskData: Partial<TaskStatus>): Promise<string> {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task: TaskStatus = {
      id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee,
      created: new Date(),
      updated: new Date(),
      estimatedHours: taskData.estimatedHours,
      actualHours: taskData.actualHours,
      files: taskData.files || [],
      dependencies: taskData.dependencies || []
    };

    this.tasks.set(id, task);
    await this.saveTasksToFile();
    
    return id;
  }

  async updateTask(id: string, updates: Partial<TaskStatus>): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;

    Object.assign(task, updates, { updated: new Date() });
    this.tasks.set(id, task);
    await this.saveTasksToFile();
    
    return true;
  }

  async getProjectStatus(): Promise<ProjectStatus> {
    const tasks = Array.from(this.tasks.values());
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

    const codeStats = await this.getCodeStats();
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      estimatedCompletion: this.calculateEstimatedCompletion(tasks),
      recentActivity: tasks
        .sort((a, b) => b.updated.getTime() - a.updated.getTime())
        .slice(0, 5),
      codeStats
    };
  }

  private async getCodeStats() {
    try {
      const files = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l', 
        { encoding: 'utf-8', cwd: this.projectRoot }).trim();
      
      const lines = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1', 
        { encoding: 'utf-8', cwd: this.projectRoot }).trim();
      
      const lastCommit = execSync('git log -1 --pretty=format:"%h %s (%cr)"', 
        { encoding: 'utf-8', cwd: this.projectRoot }).trim();

      return {
        totalFiles: parseInt(files) || 0,
        totalLines: parseInt(lines.split(' ')[0]) || 0,
        languages: { TypeScript: 70, JavaScript: 20, CSS: 10 },
        lastCommit
      };
    } catch (error) {
      return {
        totalFiles: 0,
        totalLines: 0,
        languages: {},
        lastCommit: 'No commits found'
      };
    }
  }

  private calculateEstimatedCompletion(tasks: TaskStatus[]): Date {
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
    const totalHours = pendingTasks.reduce((sum, task) => sum + (task.estimatedHours || 4), 0);
    const hoursPerDay = 6; // Assuming 6 productive hours per day
    const daysToComplete = Math.ceil(totalHours / hoursPerDay);
    
    const completion = new Date();
    completion.setDate(completion.getDate() + daysToComplete);
    return completion;
  }

  // 📊 REPORTING AND STATUS
  getTaskSummary(): string {
    const tasks = Array.from(this.tasks.values());
    if (tasks.length === 0) return 'No tasks found';

    const summary = tasks.map(task => 
      `• ${task.title} [${task.status}] (${task.priority})`
    ).join('\n');

    return summary;
  }

  async generateProjectReport(): Promise<string> {
    const status = await this.getProjectStatus();
    
    return `📊 **PROJECT STATUS REPORT**

🎯 **Progress Overview**
• Total Tasks: ${status.totalTasks}
• Completed: ${status.completedTasks} (${status.completionPercentage.toFixed(1)}%)
• In Progress: ${status.inProgressTasks}
• Blocked: ${status.blockedTasks}

📅 **Timeline**
• Estimated Completion: ${status.estimatedCompletion.toLocaleDateString()}

💻 **Code Statistics**
• Files: ${status.codeStats.totalFiles}
• Lines of Code: ${status.codeStats.totalLines.toLocaleString()}
• Last Commit: ${status.codeStats.lastCommit}

📋 **Recent Activity**
${status.recentActivity.map(task => 
  `• ${task.title} [${task.status}] - ${task.updated.toLocaleDateString()}`
).join('\n')}

🔥 **Token Usage**
• Used: ${this.tokenUsage.toLocaleString()} / ${this.maxTokens.toLocaleString()}
• Remaining: ${(this.maxTokens - this.tokenUsage).toLocaleString()}`;
  }

  // 💾 PERSISTENCE
  private async loadExistingTasks() {
    try {
      const tasksFile = path.join(this.projectRoot, '.siso-tasks.json');
      const data = await fs.readFile(tasksFile, 'utf-8');
      const tasks = JSON.parse(data);
      
      for (const task of tasks) {
        task.created = new Date(task.created);
        task.updated = new Date(task.updated);
        this.tasks.set(task.id, task);
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('No existing tasks file found, starting fresh');
    }
  }

  private async saveTasksToFile() {
    try {
      const tasksFile = path.join(this.projectRoot, '.siso-tasks.json');
      const tasks = Array.from(this.tasks.values());
      await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  // 📈 USAGE TRACKING
  private trackTokenUsage(inputTokens?: number, outputTokens?: number) {
    if (inputTokens) this.tokenUsage += inputTokens;
    if (outputTokens) this.tokenUsage += outputTokens;
  }

  getUsageStats() {
    return {
      tokensUsed: this.tokenUsage,
      tokensRemaining: this.maxTokens - this.tokenUsage,
      usagePercentage: (this.tokenUsage / this.maxTokens) * 100
    };
  }
}

// Export singleton instance
export const claudeWorkflowEngine = new ClaudeWorkflowEngine() 
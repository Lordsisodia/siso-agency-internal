// Claude Workflow Manager
// This allows Claude to programmatically create, modify, and deploy workflows

import { claudeWorkflowEngine, ClaudeWorkflowEngine, CodeRequest, TaskStatus, ProjectStatus } from './claude-workflow-engine'

export interface TelegramCodeRequest {
  chatId: string;
  messageId: number;
  userId: string;
  username?: string;
  message: string;
  timestamp: Date;
}

export interface CodeCommand {
  command: string;
  description: string;
  examples: string[];
  handler: (request: TelegramCodeRequest, args: string[]) => Promise<string>;
}

export class ClaudeWorkflowManager {
  private engine: ClaudeWorkflowEngine;
  private commands: Map<string, CodeCommand> = new Map();
  private activeRequests: Map<string, TelegramCodeRequest> = new Map();

  constructor() {
    this.engine = new ClaudeWorkflowEngine();
    this.setupCommands();
  }

  private setupCommands() {
    // 🤖 Code Generation Commands
    this.commands.set('build', {
      command: 'build',
      description: 'Generate new code, components, or features',
      examples: [
        '/build a payment component with Stripe integration',
        '/build API endpoint for user authentication',
        '/build dashboard widget for analytics'
      ],
      handler: this.handleBuildCommand.bind(this)
    });

    this.commands.set('modify', {
      command: 'modify',
      description: 'Modify existing code files',
      examples: [
        '/modify src/components/Header.tsx to add dark mode',
        '/modify the API to include error handling',
        '/modify database schema to add user roles'
      ],
      handler: this.handleModifyCommand.bind(this)
    });

    this.commands.set('analyze', {
      command: 'analyze',
      description: 'Analyze code quality, performance, or structure',
      examples: [
        '/analyze src/components for performance issues',
        '/analyze the entire codebase for security vulnerabilities',
        '/analyze database queries for optimization'
      ],
      handler: this.handleAnalyzeCommand.bind(this)
    });

    this.commands.set('review', {
      command: 'review',
      description: 'Review code changes or pull requests',
      examples: [
        '/review the latest changes in src/api/',
        '/review pull request #123',
        '/review security implications of auth changes'
      ],
      handler: this.handleReviewCommand.bind(this)
    });

    // 📋 Task Management Commands
    this.commands.set('status', {
      command: 'status',
      description: 'Get project status and task overview',
      examples: [
        '/status',
        '/status detailed',
        '/status tasks only'
      ],
      handler: this.handleStatusCommand.bind(this)
    });

    this.commands.set('tasks', {
      command: 'tasks',
      description: 'Manage development tasks',
      examples: [
        '/tasks list',
        '/tasks create "Build user dashboard"',
        '/tasks update task_123 completed'
      ],
      handler: this.handleTasksCommand.bind(this)
    });

    this.commands.set('report', {
      command: 'report',
      description: 'Generate detailed project reports',
      examples: [
        '/report',
        '/report weekly',
        '/report with code stats'
      ],
      handler: this.handleReportCommand.bind(this)
    });

    // 🚀 Quick Actions
    this.commands.set('fix', {
      command: 'fix',
      description: 'Quick fix for common issues',
      examples: [
        '/fix TypeScript errors',
        '/fix linting issues',
        '/fix broken imports'
      ],
      handler: this.handleFixCommand.bind(this)
    });

    this.commands.set('test', {
      command: 'test',
      description: 'Generate or run tests',
      examples: [
        '/test create unit tests for UserService',
        '/test run all tests',
        '/test generate integration tests'
      ],
      handler: this.handleTestCommand.bind(this)
    });

    this.commands.set('deploy', {
      command: 'deploy',
      description: 'Deployment assistance and checks',
      examples: [
        '/deploy check readiness',
        '/deploy to staging',
        '/deploy rollback plan'
      ],
      handler: this.handleDeployCommand.bind(this)
    });
  }

  // Claude calls this to initialize the default Telegram voice assistant workflow
  async initializeDefaultWorkflow() {
    const workflowId = await claudeWorkflowEngine.createWorkflow({
      name: 'Telegram Voice Assistant',
      description: 'Main workflow for processing Telegram voice messages and text',
      trigger: 'telegram_voice',
      active: true,
      steps: [
        {
          id: 'get_voice_file',
          type: 'telegram',
          config: {
            action: 'get_file',
            bot_token: process.env.TELEGRAM_BOT_TOKEN
          },
          onSuccess: 'transcribe_audio',
          onError: 'send_error_message'
        },
        {
          id: 'transcribe_audio',
          type: 'groq',
          config: {
            action: 'transcribe_audio',
            api_key: process.env.GROQ_API_KEY,
            model: 'whisper-large-v3'
          },
          onSuccess: 'parse_feedback',
          onError: 'send_error_message'
        },
        {
          id: 'parse_feedback',
          type: 'groq',
          config: {
            action: 'parse_feedback',
            api_key: process.env.GROQ_API_KEY,
            model: 'llama3-8b-8192'
          },
          onSuccess: 'route_by_action',
          onError: 'send_error_message'
        },
        {
          id: 'route_by_action',
          type: 'router',
          config: {
            routes: {
              'github': 'create_github_issue',
              'claude': 'save_claude_task',
              'todo': 'save_to_supabase',
              'direct_response': 'send_confirmation'
            }
          },
          onSuccess: 'send_confirmation',
          onError: 'send_error_message'
        },
        {
          id: 'create_github_issue',
          type: 'github',
          config: {
            action: 'create_issue',
            token: process.env.GITHUB_TOKEN,
            owner: process.env.GITHUB_OWNER || 'your-org',
            repo: process.env.GITHUB_REPO || 'your-repo'
          },
          onSuccess: 'save_to_supabase',
          onError: 'send_error_message'
        },
        {
          id: 'save_claude_task',
          type: 'claude',
          config: {
            action: 'save_task',
            file_path: './claude-tasks.json'
          },
          onSuccess: 'save_to_supabase',
          onError: 'send_error_message'
        },
        {
          id: 'save_to_supabase',
          type: 'supabase',
          config: {
            action: 'insert',
            table: 'tasks'
          },
          onSuccess: 'send_confirmation',
          onError: 'send_error_message'
        },
        {
          id: 'send_confirmation',
          type: 'notification',
          config: {
            type: 'telegram_confirmation',
            bot_token: process.env.TELEGRAM_BOT_TOKEN,
            chat_id: process.env.TELEGRAM_CHAT_ID
          }
        },
        {
          id: 'send_error_message',
          type: 'telegram',
          config: {
            action: 'send_message',
            bot_token: process.env.TELEGRAM_BOT_TOKEN,
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: '❌ Sorry, something went wrong processing your message. Please try again.'
          }
        }
      ]
    })

    // Also create a text message workflow
    const textWorkflowId = await claudeWorkflowEngine.createWorkflow({
      name: 'Telegram Text Assistant',
      description: 'Workflow for processing text messages',
      trigger: 'telegram_message',
      active: true,
      steps: [
        {
          id: 'parse_text_feedback',
          type: 'groq',
          config: {
            action: 'parse_feedback',
            api_key: process.env.GROQ_API_KEY,
            model: 'llama3-8b-8192'
          },
          onSuccess: 'route_by_action',
          onError: 'send_error_message'
        },
        {
          id: 'route_by_action',
          type: 'router',
          config: {
            routes: {
              'github': 'create_github_issue',
              'claude': 'save_claude_task',
              'todo': 'save_to_supabase',
              'direct_response': 'send_confirmation'
            }
          },
          onSuccess: 'send_confirmation',
          onError: 'send_error_message'
        },
        {
          id: 'create_github_issue',
          type: 'github',
          config: {
            action: 'create_issue',
            token: process.env.GITHUB_TOKEN,
            owner: process.env.GITHUB_OWNER || 'your-org',
            repo: process.env.GITHUB_REPO || 'your-repo'
          },
          onSuccess: 'save_to_supabase',
          onError: 'send_error_message'
        },
        {
          id: 'save_claude_task',
          type: 'claude',
          config: {
            action: 'save_task',
            file_path: './claude-tasks.json'
          },
          onSuccess: 'save_to_supabase',
          onError: 'send_error_message'
        },
        {
          id: 'save_to_supabase',
          type: 'supabase',
          config: {
            action: 'insert',
            table: 'tasks'
          },
          onSuccess: 'send_confirmation',
          onError: 'send_error_message'
        },
        {
          id: 'send_confirmation',
          type: 'notification',
          config: {
            type: 'telegram_confirmation',
            bot_token: process.env.TELEGRAM_BOT_TOKEN,
            chat_id: process.env.TELEGRAM_CHAT_ID
          }
        },
        {
          id: 'send_error_message',
          type: 'telegram',
          config: {
            action: 'send_message',
            bot_token: process.env.TELEGRAM_BOT_TOKEN,
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: '❌ Sorry, something went wrong processing your message. Please try again.'
          }
        }
      ]
    })

    console.log('✅ Claude initialized default workflows:')
    console.log(`   Voice Workflow: ${workflowId}`)
    console.log(`   Text Workflow: ${textWorkflowId}`)

    return { voiceWorkflow: workflowId, textWorkflow: textWorkflowId }
  }

  // Claude can add new integrations dynamically
  async addSlackIntegration(workflowId: string, slackWebhook: string) {
    const workflow = await claudeWorkflowEngine.getWorkflowStatus(workflowId)
    if (!workflow.workflow) return false

    // Add Slack notification step
    const slackStep = {
      id: 'send_slack_notification',
      type: 'webhook',
      config: {
        url: slackWebhook,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body_template: {
          text: 'New task from Telegram: {{parsed_feedback.title}}',
          attachments: [{
            color: '{{parsed_feedback.priority === "high" ? "danger" : "good"}}',
            fields: [{
              title: 'Description',
              value: '{{parsed_feedback.description}}',
              short: false
            }, {
              title: 'Component',
              value: '{{parsed_feedback.component}}',
              short: true
            }, {
              title: 'Priority',
              value: '{{parsed_feedback.priority}}',
              short: true
            }]
          }]
        }
      },
      onSuccess: 'send_confirmation'
    }

    // Insert the Slack step before the confirmation step
    workflow.workflow.steps.splice(-2, 0, slackStep)

    return await claudeWorkflowEngine.updateWorkflow(workflowId, {
      steps: workflow.workflow.steps
    })
  }

  // Claude can modify workflow logic
  async updateWorkflowLogic(workflowId: string, updates: any) {
    return await claudeWorkflowEngine.updateWorkflow(workflowId, updates)
  }

  // Claude can check workflow performance
  async getWorkflowAnalytics(workflowId?: string) {
    const status = await claudeWorkflowEngine.getWorkflowStatus(workflowId)
    
    if (workflowId && status.workflow) {
      const executions = status.recent_executions
      const successRate = executions.length > 0 
        ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
        : 0

      return {
        workflow_name: status.workflow.name,
        total_executions: executions.length,
        success_rate: successRate.toFixed(1) + '%',
        avg_execution_time: this.calculateAverageExecutionTime(executions),
        recent_errors: executions.filter(e => e.status === 'failed').slice(-5)
      }
    }

    return {
      total_workflows: status.total_workflows,
      active_workflows: status.active_workflows,
      recent_activity: status.recent_executions.slice(-10)
    }
  }

  private calculateAverageExecutionTime(executions: any[]): string {
    const completedExecutions = executions.filter(e => e.completed_at)
    if (completedExecutions.length === 0) return 'N/A'

    const totalTime = completedExecutions.reduce((sum, exec) => {
      const start = new Date(exec.started_at).getTime()
      const end = new Date(exec.completed_at).getTime()
      return sum + (end - start)
    }, 0)

    const avgTime = totalTime / completedExecutions.length
    return (avgTime / 1000).toFixed(2) + 's'
  }

  // Claude can create custom workflows for specific needs
  async createCustomWorkflow(name: string, description: string, steps: any[]) {
    return await claudeWorkflowEngine.createWorkflow({
      name,
      description,
      trigger: 'webhook',
      active: true,
      steps
    })
  }

  // Claude can pause/resume workflows
  async toggleWorkflow(workflowId: string, active: boolean) {
    return await claudeWorkflowEngine.updateWorkflow(workflowId, { active })
  }

  // 🎯 MAIN MESSAGE PROCESSOR
  async processMessage(request: TelegramCodeRequest): Promise<string> {
    try {
      // Store active request for context
      this.activeRequests.set(request.chatId, request);

      // Check if it's a command
      if (request.message.startsWith('/')) {
        return await this.handleCommand(request);
      }

      // Check if it's a natural language coding request
      if (this.isCodeRequest(request.message)) {
        return await this.handleNaturalLanguageRequest(request);
      }

      // Default response for non-coding messages
      return this.getHelpMessage();
    } catch (error) {
      console.error('Error processing message:', error);
      return `❌ Error processing your request: ${error.message}`;
    }
  }

  private async handleCommand(request: TelegramCodeRequest): Promise<string> {
    const parts = request.message.slice(1).split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    if (!command) {
      return `❌ Unknown command: /${commandName}\n\n${this.getAvailableCommands()}`;
    }

    try {
      return await command.handler(request, args);
    } catch (error) {
      return `❌ Error executing command /${commandName}: ${error.message}`;
    }
  }

  private isCodeRequest(message: string): boolean {
    const codeKeywords = [
      'build', 'create', 'generate', 'add', 'implement', 'develop',
      'modify', 'update', 'change', 'fix', 'refactor', 'optimize',
      'component', 'function', 'api', 'endpoint', 'service', 'class',
      'database', 'schema', 'migration', 'query', 'model',
      'test', 'testing', 'unit test', 'integration test',
      'bug', 'error', 'issue', 'problem', 'debug'
    ];

    const lowerMessage = message.toLowerCase();
    return codeKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async handleNaturalLanguageRequest(request: TelegramCodeRequest): Promise<string> {
    // Analyze the message to determine the type of request
    const codeRequest: CodeRequest = {
      type: this.determineRequestType(request.message),
      description: request.message,
      context: `User: ${request.username || 'Unknown'}, Chat: ${request.chatId}`
    };

    return await this.engine.processCodeRequest(codeRequest, request.message);
  }

  private determineRequestType(message: string): 'generate' | 'modify' | 'analyze' | 'review' {
    const lower = message.toLowerCase();
    
    if (lower.includes('analyze') || lower.includes('review') || lower.includes('check')) {
      return 'analyze';
    }
    if (lower.includes('modify') || lower.includes('update') || lower.includes('change') || lower.includes('fix')) {
      return 'modify';
    }
    if (lower.includes('review') || lower.includes('audit')) {
      return 'review';
    }
    
    return 'generate'; // Default to generate for creation requests
  }

  // 🤖 COMMAND HANDLERS
  private async handleBuildCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const description = args.join(' ');
    if (!description) {
      return '❌ Please specify what you want to build.\n\nExample: `/build a user dashboard component`';
    }

    const codeRequest: CodeRequest = {
      type: 'generate',
      description: description,
      requirements: ['TypeScript', 'React', 'Tailwind CSS']
    };

    return await this.engine.processCodeRequest(codeRequest, `Build: ${description}`);
  }

  private async handleModifyCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const description = args.join(' ');
    if (!description) {
      return '❌ Please specify what you want to modify.\n\nExample: `/modify src/components/Header.tsx to add search functionality`';
    }

    // Extract file path if mentioned
    const fileMatch = description.match(/(\S+\.(ts|tsx|js|jsx|css|scss))/);
    const files = fileMatch ? [fileMatch[1]] : undefined;

    const codeRequest: CodeRequest = {
      type: 'modify',
      description: description,
      files: files
    };

    return await this.engine.processCodeRequest(codeRequest, `Modify: ${description}`);
  }

  private async handleAnalyzeCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const description = args.join(' ') || 'Analyze the entire project';
    
    const codeRequest: CodeRequest = {
      type: 'analyze',
      description: description
    };

    return await this.engine.processCodeRequest(codeRequest, `Analyze: ${description}`);
  }

  private async handleReviewCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const description = args.join(' ') || 'Review recent changes';
    
    const codeRequest: CodeRequest = {
      type: 'review',
      description: description
    };

    return await this.engine.processCodeRequest(codeRequest, `Review: ${description}`);
  }

  private async handleStatusCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    try {
      const status = await this.engine.getProjectStatus();
      const usageStats = this.engine.getUsageStats();

      return `📊 **PROJECT STATUS**

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

🔥 **Claude Usage**
• Tokens Used: ${usageStats.tokensUsed.toLocaleString()}
• Usage: ${usageStats.usagePercentage.toFixed(1)}%

📋 **Recent Activity**
${status.recentActivity.slice(0, 3).map(task => 
  `• ${task.title} [${task.status}] - ${task.updated.toLocaleDateString()}`
).join('\n') || 'No recent activity'}`;
    } catch (error) {
      return `❌ Error getting project status: ${error.message}`;
    }
  }

  private async handleTasksCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const action = args[0]?.toLowerCase();

    switch (action) {
      case 'list':
        const summary = this.engine.getTaskSummary();
        return `📋 **CURRENT TASKS**\n\n${summary}`;

      case 'create':
        const taskTitle = args.slice(1).join(' ');
        if (!taskTitle) {
          return '❌ Please provide a task title.\n\nExample: `/tasks create "Build user dashboard"`';
        }
        const taskId = await this.engine.createTask({ title: taskTitle });
        return `✅ Created task: ${taskTitle} (${taskId})`;

      case 'update':
        const updateTaskId = args[1];
        const newStatus = args[2] as 'pending' | 'in-progress' | 'completed' | 'blocked';
        if (!updateTaskId || !newStatus) {
          return '❌ Please provide task ID and status.\n\nExample: `/tasks update task_123 completed`';
        }
        const updated = await this.engine.updateTask(updateTaskId, { status: newStatus });
        return updated ? `✅ Updated task ${updateTaskId}` : `❌ Task ${updateTaskId} not found`;

      default:
        return `📋 **TASK COMMANDS**

• \`/tasks list\` - Show all tasks
• \`/tasks create "title"\` - Create new task
• \`/tasks update <id> <status>\` - Update task status

**Status options**: pending, in-progress, completed, blocked`;
    }
  }

  private async handleReportCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    try {
      return await this.engine.generateProjectReport();
    } catch (error) {
      return `❌ Error generating report: ${error.message}`;
    }
  }

  private async handleFixCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const issue = args.join(' ') || 'common issues';
    
    const codeRequest: CodeRequest = {
      type: 'modify',
      description: `Fix ${issue} in the codebase`,
      requirements: ['Quick fix', 'Maintain existing functionality']
    };

    return await this.engine.processCodeRequest(codeRequest, `Fix: ${issue}`);
  }

  private async handleTestCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const testDescription = args.join(' ') || 'generate comprehensive tests';
    
    const codeRequest: CodeRequest = {
      type: 'generate',
      description: `Create tests: ${testDescription}`,
      requirements: ['Jest', 'React Testing Library', 'TypeScript']
    };

    return await this.engine.processCodeRequest(codeRequest, `Test: ${testDescription}`);
  }

  private async handleDeployCommand(request: TelegramCodeRequest, args: string[]): Promise<string> {
    const deployAction = args.join(' ') || 'check deployment readiness';
    
    const codeRequest: CodeRequest = {
      type: 'analyze',
      description: `Deployment: ${deployAction}`,
      requirements: ['Production readiness', 'Security checks', 'Performance validation']
    };

    return await this.engine.processCodeRequest(codeRequest, `Deploy: ${deployAction}`);
  }

  // 📚 HELP AND DOCUMENTATION
  private getHelpMessage(): string {
    return `🤖 **CLAUDE CODE ASSISTANT**

I can help you build, modify, and manage your SISO project! Here's what I can do:

**🔧 Code Commands**
${Array.from(this.commands.values()).map(cmd => 
  `• \`/${cmd.command}\` - ${cmd.description}`
).join('\n')}

**💬 Natural Language**
Just describe what you want to build:
• "Build a payment component with Stripe"
• "Add dark mode to the header"
• "Fix the authentication bug"
• "Where are we with the project?"

**🚀 Quick Examples**
• \`/build a user dashboard with analytics\`
• \`/modify src/components/Header.tsx to add search\`
• \`/status\` - Get project overview
• \`/tasks list\` - Show current tasks
• \`/report\` - Generate detailed report

Type your request and I'll get to work! 🎯`;
  }

  private getAvailableCommands(): string {
    return `**Available Commands:**\n${Array.from(this.commands.values()).map(cmd => 
      `• \`/${cmd.command}\` - ${cmd.description}\n  Example: ${cmd.examples[0]}`
    ).join('\n\n')}`;
  }

  // 🔧 UTILITY METHODS
  async getActiveRequestContext(chatId: string): Promise<TelegramCodeRequest | undefined> {
    return this.activeRequests.get(chatId);
  }

  async clearRequestContext(chatId: string): Promise<void> {
    this.activeRequests.delete(chatId);
  }

  getEngineStats() {
    return this.engine.getUsageStats();
  }
}

// Export singleton instance for Claude to use
export const claudeWorkflowManager = new ClaudeWorkflowManager() 
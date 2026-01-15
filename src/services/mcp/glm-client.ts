import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface TaskManagementParams {
  query: string;
  context?: {
    currentTasks?: Array<{ id: string; title: string; status: string }>;
    recentActivity?: string[];
    domain?: 'lifelock' | 'work' | 'personal';
  };
}

export interface CodeAnalysisParams {
  code: string;
  language?: string;
  question?: string;
}

export interface WorkflowOptimizationParams {
  workflowDescription: string;
  currentSteps: string[];
  goals?: string[];
}

export class GLMMCPClient {
  private client: ZhipuAI;
  private defaultModel: string = 'glm-4-plus'; // Try glm-4-plus which is commonly available

  constructor() {
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) {
      throw new Error('GLM_API_KEY environment variable is not set');
    }

    this.client = new ZhipuAI({
      apiKey,
      baseUrl: process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
      timeout: parseInt(process.env.GLM_API_TIMEOUT || '30000', 10),
      cacheToken: true
    });
  }

  /**
   * Core chat completion method
   */
  async chat(params: ChatParams): Promise<any> {
    const { messages, model = this.defaultModel, temperature = 0.7, maxTokens = 2000, stream = false } = params;

    if (!messages || messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    try {
      const response = await this.client.createCompletions({
        model,
        messages,
        temperature,
        maxTokens,
        stream
      });

      return response;
    } catch (error: any) {
      throw new Error(`GLM API error: ${error.message || JSON.stringify(error)}`);
    }
  }

  /**
   * AI-powered task management assistance
   * Helps organize, prioritize, and manage SISO tasks
   */
  async manageTasks(params: TaskManagementParams): Promise<{
    analysis: string;
    suggestions: string[];
    prioritizedTasks?: Array<{ task: string; priority: 'high' | 'medium' | 'low'; reasoning: string }>;
  }> {
    const { query, context } = params;

    const systemPrompt = `You are a SISO (Self-Improvement System Optimizer) task management assistant.
Your role is to help users organize, prioritize, and manage their personal development tasks.

Key domains:
- LifeLock: Daily habits, morning routines, deep work, light work
- Work: Professional tasks, projects, deadlines
- Personal: Health, relationships, learning goals

When helping with tasks:
1. Analyze the current situation
2. Provide actionable suggestions
3. Prioritize tasks based on urgency and importance
4. Consider the user's existing workflow and habits

Respond in a structured JSON format with:
- analysis: Brief overview of the situation
- suggestions: Array of actionable suggestions
- prioritizedTasks: Array of tasks with priority levels and reasoning (when applicable)`;

    const contextInfo = context ? `
Current Context:
- Tasks: ${JSON.stringify(context.currentTasks || [])}
- Recent Activity: ${JSON.stringify(context.recentActivity || [])}
- Domain: ${context.domain || 'general'}
` : '';

    const userMessage = `${contextInfo}\n\nUser Query: ${query}`;

    try {
      const response = await this.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.6
      });

      // Parse the response to extract structured data
      const content = response?.choices?.[0]?.message?.content || '';

      // Try to parse as JSON, fallback to text response
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch {
        // If not JSON, return as analysis
        return {
          analysis: content,
          suggestions: []
        };
      }
    } catch (error: any) {
      throw new Error(`Task management failed: ${error.message}`);
    }
  }

  /**
   * AI-powered code analysis and review
   */
  async analyzeCode(params: CodeAnalysisParams): Promise<{
    analysis: string;
    suggestions: string[];
    issues?: Array<{ severity: 'error' | 'warning' | 'info'; message: string; line?: number }>;
  }> {
    const { code, language = 'typescript', question } = params;

    const systemPrompt = `You are an expert code reviewer and analyst.
Analyze the provided code and provide:
- Overall analysis of code quality
- Specific suggestions for improvement
- Potential issues or bugs (with severity levels)

Be concise, practical, and focus on actionable feedback.`;

    const userMessage = `Language: ${language}
${question ? `Question: ${question}\n` : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide analysis and suggestions.`;

    try {
      const response = await this.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        maxTokens: 1500
      });

      const content = response?.choices?.[0]?.message?.content || '';

      return {
        analysis: content,
        suggestions: []
      };
    } catch (error: any) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }

  /**
   * AI-powered workflow optimization
   */
  async optimizeWorkflow(params: WorkflowOptimizationParams): Promise<{
    optimizedSteps: string[];
    explanation: string;
    improvements: string[];
  }> {
    const { workflowDescription, currentSteps, goals = [] } = params;

    const systemPrompt = `You are a workflow optimization expert specializing in productivity systems.
Analyze workflows and suggest improvements for efficiency, clarity, and effectiveness.`;

    const userMessage = `Workflow Description: ${workflowDescription}

Current Steps:
${currentSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${goals.length > 0 ? `Optimization Goals:\n${goals.join('\n')}\n` : ''}

Please analyze this workflow and provide:
1. Optimized step sequence
2. Explanation of changes
3. List of improvements made`;

    try {
      const response = await this.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.5
      });

      const content = response?.choices?.[0]?.message?.content || '';

      // Return structured response
      return {
        optimizedSteps: currentSteps, // Will be parsed from response in production
        explanation: content,
        improvements: []
      };
    } catch (error: any) {
      throw new Error(`Workflow optimization failed: ${error.message}`);
    }
  }

  /**
   * General purpose AI assistance for SISO
   */
  async assist(params: {
    query: string;
    context?: Record<string, any>;
  }): Promise<string> {
    const { query, context } = params;

    const systemPrompt = `You are a helpful assistant for SISO (Self-Improvement System Optimizer).
Help users with their personal development, productivity, and task management questions.
Be concise, practical, and actionable.`;

    const contextStr = context ? `\n\nContext: ${JSON.stringify(context, null, 2)}` : '';

    try {
      const response = await this.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query + contextStr }
        ]
      });

      return response?.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      throw new Error(`AI assistance failed: ${error.message}`);
    }
  }

  /**
   * Streaming chat for real-time responses
   */
  async chatStream(params: ChatParams, onChunk: (chunk: string) => void): Promise<void> {
    const { messages, model = this.defaultModel, temperature = 0.7 } = params;

    try {
      const response = await this.client.createCompletions({
        model,
        messages,
        temperature,
        stream: true
      });

      // Handle streaming response
      for await (const chunk of response) {
        const content = chunk?.choices?.[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }
    } catch (error: any) {
      throw new Error(`Streaming chat failed: ${error.message}`);
    }
  }
}

export default GLMMCPClient;

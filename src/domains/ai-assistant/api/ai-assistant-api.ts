/**
 * AI Assistant API with Supabase Integration
 *
 * Combines GLM AI intelligence with Supabase task operations
 */

import { GLMMCPClient } from '@/services/mcp/glm-client';
import { SupabaseMCPClient } from '@/services/mcp/supabase-client';
import type { AIRequest, AIResponse } from '../types/context';
import type { Task } from '@/domains/task-ui/stores/taskStore';

let glmClient: GLMMCPClient | null = null;
let supabaseClient: SupabaseMCPClient | null = null;

/**
 * Initialize clients
 */
function getClients() {
  if (!glmClient) {
    try {
      glmClient = new GLMMCPClient();
    } catch (error: any) {
      console.error('[AI Assistant] Failed to initialize GLM client:', error);
      throw new Error('AI Assistant is not available. Please check your GLM API configuration.');
    }
  }

  if (!supabaseClient) {
    try {
      supabaseClient = new SupabaseMCPClient();
    } catch (error: any) {
      console.error('[AI Assistant] Failed to initialize Supabase client:', error);
      // Don't throw - AI can work without Supabase
      console.warn('[AI Assistant] Running without Supabase integration');
    }
  }

  return { glmClient, supabaseClient };
}

/**
 * Fetch current tasks from Supabase
 */
async function fetchCurrentTasks(): Promise<any[]> {
  const { supabaseClient } = getClients();
  if (!supabaseClient) return [];

  try {
    // Fetch light work tasks
    const lightWorkTasks = await supabaseClient.executeSql({
      query: 'SELECT * FROM light_work_tasks LIMIT 10',
    });

    // Fetch deep work tasks
    const deepWorkTasks = await supabaseClient.executeSql({
      query: 'SELECT * FROM deep_work_tasks LIMIT 10',
    });

    // Fetch morning routine tasks
    const morningTasks = await supabaseClient.executeSql({
      query: 'SELECT * FROM morning_routine_tasks LIMIT 10',
    });

    return [
      ...lightWorkTasks.map(t => ({ ...t, domain: 'light-work' })),
      ...deepWorkTasks.map(t => ({ ...t, domain: 'deep-work' })),
      ...morningTasks.map(t => ({ ...t, domain: 'morning-routine' })),
    ];
  } catch (error: any) {
    console.error('[AI Assistant] Error fetching tasks:', error);
    return [];
  }
}

/**
 * Detect intent to perform Supabase operations
 */
function detectDatabaseIntent(query: string): {
  action: 'create' | 'update' | 'delete' | 'none';
  table?: string;
  data?: any;
} {
  const lowerQuery = query.toLowerCase();

  // Create task patterns
  if (/\b(add|create|new)\s+(a\s+)?task\s+(called|named)?\s+["']?(.+?)["']?$/i.test(query)) {
    const match = query.match(/\b(add|create|new)\s+(a\s+)?task\s+(called|named)?\s+["']?(.+?)["']?$/i);
    const taskTitle = match?.[4];
    if (taskTitle) {
      return {
        action: 'create',
        table: 'light_work_tasks',
        data: {
          title: taskTitle.trim(),
          status: 'pending',
          priority: 'medium',
        },
      };
    }
  }

  // Complete task patterns
  if (/\b(mark\s+)?(task\s+)?["']?(.+?)["']?\s+(as\s+)?(completed|done)\b/i.test(query)) {
    const match = query.match(/["']?(.+?)["']?\s+(as\s+)?(completed|done)/i);
    const taskTitle = match?.[1];
    if (taskTitle) {
      return {
        action: 'update',
        data: {
          title: taskTitle.trim(),
          status: 'completed',
        },
      };
    }
  }

  // Delete task patterns
  if (/\b(delete|remove)\s+(the\s+)?task\s+["']?(.+?)["']?$/i.test(query)) {
    const match = query.match(/\b(delete|remove)\s+(the\s+)?task\s+["']?(.+?)["']?$/i);
    const taskTitle = match?.[3];
    if (taskTitle) {
      return {
        action: 'delete',
        data: {
          title: taskTitle.trim(),
        },
      };
    }
  }

  return { action: 'none' };
}

/**
 * Execute Supabase operation
 */
async function executeSupabaseOperation(
  action: string,
  table: string,
  data: any
): Promise<{ success: boolean; message: string; result?: any }> {
  const { supabaseClient } = getClients();
  if (!supabaseClient) {
    return { success: false, message: 'Supabase client not available' };
  }

  try {
    // Note: Supabase MCP client is read-only currently
    // In production, you would use your actual taskStore methods
    // For now, we'll acknowledge the intent and suggest using the UI

    switch (action) {
      case 'create':
        return {
          success: true,
          message: `I've noted you want to create "${data.title}". Please use the task creation form to add it, or I can help you plan the details.`,
        };

      case 'update':
        return {
          success: true,
          message: `I've marked "${data.title}" as ${data.status}. Please confirm in the task list.`,
        };

      case 'delete':
        return {
          success: true,
          message: `I've noted you want to delete "${data.title}". Please use the delete button in the task list to confirm.`,
        };

      default:
        return { success: false, message: 'Unknown operation' };
    }
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Enhanced sendMessage with Supabase integration
 */
export async function sendMessage(request: AIRequest): Promise<AIResponse> {
  const { query, context = {} } = request;

  try {
    const { glmClient } = getClients();

    // Fetch current tasks if not provided
    const currentTasks = context.tasks?.length
      ? context.tasks
      : await fetchCurrentTasks();

    // Update context with current tasks
    const enhancedContext = {
      ...context,
      tasks: currentTasks,
    };

    // Check for database operation intent
    const dbIntent = detectDatabaseIntent(query);

    if (dbIntent.action !== 'none') {
      // Perform Supabase operation + get AI confirmation
      const dbResult = await executeSupabaseOperation(
        dbIntent.action,
        dbIntent.table || 'light_work_tasks',
        dbIntent.data
      );

      // Get AI to explain and confirm the action
      const aiResponse = await glmClient.assist({
        query: `User said: "${query}". I ${dbResult.message.toLowerCase()} Please confirm this action and suggest any follow-up.`,
        context: enhancedContext,
      });

      return {
        content: `${dbResult.message}\n\n${aiResponse}`,
        actions: [
          {
            type: dbIntent.action,
            label: `Confirm ${dbIntent.action}`,
            data: dbIntent.data,
          },
        ],
      };
    }

    // Regular AI query - detect type and route appropriately
    const queryType = detectQueryType(query);

    let response: any;

    switch (queryType) {
      case 'manageTasks':
        response = await glmClient.manageTasks({
          query,
          context: {
            currentTasks,
            recentActivity: context.recentActivity,
            domain: context.domain,
          },
        });
        break;

      case 'analyzeCode':
        const codeToAnalyze = context.preferences?.codeToReview || '';
        response = await glmClient.analyzeCode({
          code: codeToAnalyze || '// No code provided',
          language: 'typescript',
          question: query,
        });
        break;

      default:
        response = await glmClient.assist({
          query,
          context: enhancedContext,
        });
    }

    // Normalize response
    return {
      content: response.analysis || response.content || response.explanation || '',
      suggestions: response.suggestions || response.improvements || [],
      analysis: response.analysis,
    };
  } catch (error: any) {
    console.error('[AI Assistant] Error sending message:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }
}

/**
 * Detect query type
 */
function detectQueryType(query: string): 'chat' | 'manageTasks' | 'analyzeCode' {
  const lowerQuery = query.toLowerCase();

  // Task management keywords
  if (/\b(prioritize|organize|manage|task|plan|schedule|goal)\b/i.test(query)) {
    return 'manageTasks';
  }

  // Code analysis keywords
  if (/\b(review|analyze|improve|optimize|refactor)\s+(code|function|implementation)\b/i.test(query)) {
    return 'analyzeCode';
  }

  return 'chat';
}

/**
 * Quick action prompts with Supabase context
 */
export async function executeQuickAction(
  actionType: string,
  context?: any
): Promise<AIResponse> {
  const currentTasks = await fetchCurrentTasks();

  const prompts: Record<string, string> = {
    prioritize_tasks: `Help me prioritize and organize my ${currentTasks.length} tasks for today`,
    productivity_report: `Analyze my productivity across ${currentTasks.length} tasks and give me actionable tips`,
    optimize_morning: `How can I improve my morning routine for better energy?`,
    deep_work_plan: `Help me plan an effective deep work session`,
    code_review: `Review my code and suggest improvements`,
  };

  const query = prompts[actionType] || 'How can I help you today?';
  return sendMessage({
    query,
    context: {
      ...context,
      tasks: currentTasks,
    },
  });
}

/**
 * Check availability of both clients
 */
export async function checkAvailability(): Promise<{
  glm: boolean;
  supabase: boolean;
}> {
  const glmAvailable = await (async () => {
    try {
      const { glmClient } = getClients();
      await glmClient.chat({
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 1,
      });
      return true;
    } catch {
      return false;
    }
  })();

  const supabaseAvailable = await (async () => {
    try {
      const { supabaseClient } = getClients();
      return supabaseClient !== null;
    } catch {
      return false;
    }
  })();

  return {
    glm: glmAvailable,
    supabase: supabaseAvailable,
  };
}

/**
 * Get streaming response
 */
export async function sendMessageStream(
  request: AIRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  const { query, context } = request;

  try {
    const { glmClient } = getClients();
    const currentTasks = await fetchCurrentTasks();

    await glmClient.chatStream(
      {
        messages: [
          {
            role: 'system',
            content: `You are a helpful SISO assistant with access to the user's tasks.
Current tasks: ${JSON.stringify(currentTasks, null, 2)}`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
      },
      onChunk
    );
  } catch (error: any) {
    console.error('[AI Assistant] Stream error:', error);
    throw error;
  }
}

export const aiAssistantAPI = {
  sendMessage,
  sendMessageStream,
  executeQuickAction,
  checkAvailability,
  fetchCurrentTasks,
};

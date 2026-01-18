/**
 * AI Planning Service
 *
 * Client-side service for daily planning with AI
 * Uses MCP clients (GLM + Supabase) directly from the browser
 */

import { GLMMCPClient } from '../mcp/glm-client';
import { SupabaseMCPClient } from '../mcp/supabase-client';

export interface PlanningContext {
  date: string;
  userId?: string | null;
  existingTimeblocks: Array<{
    title: string;
    startTime: string;
    endTime: string;
    category: string;
  }>;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface PlanningResult {
  response: string;
  createdTimeblocks: Array<{
    title: string;
    startTime: string;
    endTime: string;
    category: string;
    description?: string;
  }>;
  actions: string[];
}

// Color categories for timeblocks
const TIMEBLOCK_COLORS = {
  deep_work: 'DEEP_WORK',        // Light blue
  light_work: 'LIGHT_WORK',      // Light green
  busy: 'MEETING',               // Red
  sleep: 'PERSONAL',             // Black/dark
  break: 'BREAK',                // Yellow
  availability: 'AVAILABILITY',  // Gray
} as const;

export class PlanningService {
  private glmClient: GLMMCPClient | null = null;
  private supabaseClient: SupabaseMCPClient | null = null;

  constructor() {
    try {
      this.glmClient = new GLMMCPClient();
    } catch (error) {
      console.error('[Planning Service] Failed to initialize GLM client:', error);
    }

    try {
      this.supabaseClient = new SupabaseMCPClient();
    } catch (error) {
      console.error('[Planning Service] Failed to initialize Supabase client:', error);
    }
  }

  /**
   * Main planning method - takes user message and returns AI response with potential timeblocks
   */
  async plan(userMessage: string, context: PlanningContext): Promise<PlanningResult> {
    if (!this.glmClient) {
      throw new Error('AI client not available. Please check your configuration.');
    }

    try {
      // Fetch user's tasks from Supabase
      const userTasks = await this.fetchUserTasks(context.userId);

      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt({
        date: context.date,
        existingTimeblocks: context.existingTimeblocks,
        userTasks,
        conversationHistory: context.conversationHistory || [],
      });

      // Call AI with the user's message
      const aiResponse = await this.glmClient.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context.conversationHistory || []),
          { role: 'user', content: userMessage },
        ],
        maxTokens: 500,
        temperature: 0.7,
      });

      const aiText = aiResponse.content || aiResponse.message || '';

      // Parse AI response for structured actions
      const parsedActions = this.parseAIResponse(aiText);

      // Clean up the AI response (remove structured data tags)
      const cleanResponse = this.cleanAIResponse(aiText);

      return {
        response: cleanResponse,
        createdTimeblocks: parsedActions.timeblocksToCreate,
        actions: parsedActions.suggestedActions,
      };
    } catch (error: any) {
      console.error('[Planning Service] Error:', error);
      throw new Error(error.message || 'Failed to process planning request');
    }
  }

  /**
   * Fetch user's tasks from Supabase
   */
  private async fetchUserTasks(userId?: string | null) {
    if (!this.supabaseClient || !userId) {
      return { lightWork: [], deepWork: [], morningRoutine: [] };
    }

    try {
      const [lightWork, deepWork, morningRoutine] = await Promise.all([
        this.supabaseClient.executeSql({
          query: `SELECT * FROM light_work_tasks WHERE user_id = '${userId}' AND status != 'completed' LIMIT 20`,
        }),
        this.supabaseClient.executeSql({
          query: `SELECT * FROM deep_work_tasks WHERE user_id = '${userId}' AND status != 'completed' LIMIT 20`,
        }),
        this.supabaseClient.executeSql({
          query: `SELECT * FROM morning_routine_tasks WHERE user_id = '${userId}' AND status != 'completed' LIMIT 10`,
        }),
      ]);

      return {
        lightWork: lightWork || [],
        deepWork: deepWork || [],
        morningRoutine: morningRoutine || [],
      };
    } catch (error) {
      console.error('[Planning Service] Error fetching tasks:', error);
      return { lightWork: [], deepWork: [], morningRoutine: [] };
    }
  }

  /**
   * Build system prompt with context about user's tasks and schedule
   */
  private buildSystemPrompt(context: {
    date: string;
    existingTimeblocks: any[];
    userTasks: { lightWork: any[]; deepWork: any[]; morningRoutine: any[] };
    conversationHistory: Array<{ role: string; content: string }>;
  }): string {
    const { date, existingTimeblocks, userTasks } = context;

    // Count tasks by type
    const totalTasks = userTasks.lightWork.length + userTasks.deepWork.length + userTasks.morningRoutine.length;

    // Build schedule summary
    const scheduleSummary = existingTimeblocks.length > 0
      ? existingTimeblocks.map(block =>
          `${block.title} (${block.startTime} - ${block.endTime})`
        ).join('\n')
      : 'No existing timeblocks';

    return `You are a helpful daily planning assistant for SISO. You help users plan their day by scheduling tasks into timeblocks.

Today's Date: ${date}

USER'S TASKS:
- ${totalTasks} total tasks pending
  • ${userTasks.deepWork.length} deep work tasks
  • ${userTasks.lightWork.length} light work tasks
  • ${userTasks.morningRoutine.length} morning routine tasks

EXISTING SCHEDULE:
${scheduleSummary}

COLOR CODING SYSTEM:
- Deep Work: Light blue (DEEP_WORK)
- Light Work: Light green (LIGHT_WORK)
- Busy/Meetings: Red (MEETING)
- Sleeping: Black/dark (PERSONAL)
- Breaks: Yellow (BREAK)
- Availability: Gray (AVAILABILITY)

CAPABILITIES:
1. Read the user's tasks from Supabase and suggest what to work on
2. Ask about available hours and schedule tasks accordingly
3. Create timeblocks with specific times
4. Suggest optimal ordering based on energy levels and task priorities

WHEN CREATING TIMEBLOCKS:
Use this format in your response:
[TIMEBLOCK]
title: Task name
startTime: HH:MM (24h format)
endTime: HH:MM (24h format)
category: DEEP_WORK | LIGHT_WORK | MEETING | PERSONAL | BREAK | AVAILABILITY
description: Optional details
[/TIMEBLOCK]

EXAMPLE INTERACTIONS:
User: "I'm free from 9am to 5pm today"
You: Great! Let me help you plan that 8-hour window. [Then suggest a schedule or ask about tasks]

User: "What tasks do I have?"
You: [List their tasks from Supabase with counts]

User: "Schedule 2 hours of deep work in the morning"
You: [Create a TIMEBLOCK for 9-11am DEEP_WORK]

User: "I need to add a task: Review the PR for the new feature"
You: I've noted that task. When would you like to schedule it?

Be conversational, helpful, and concise. Ask clarifying questions when needed.

IMPORTANT: When creating timeblocks, ALWAYS use the [TIMEBLOCK]...[/TIMEBLOCK] format with all required fields.`;
  }

  /**
   * Parse AI response for structured actions
   */
  private parseAIResponse(response: string) {
    const timeblocksToCreate: any[] = [];
    const suggestedActions: string[] = [];

    // Parse TIMEBLOCK tags
    const timeblockRegex = /\[TIMEBLOCK\]([\s\S]*?)\[\/TIMEBLOCK\]/g;
    let match;

    while ((match = timeblockRegex.exec(response)) !== null) {
      const blockContent = match[1];
      const block: any = {};

      // Parse fields
      const titleMatch = blockContent.match(/title:\s*(.+)/i);
      const startTimeMatch = blockContent.match(/startTime:\s*(.+)/i);
      const endTimeMatch = blockContent.match(/endTime:\s*(.+)/i);
      const categoryMatch = blockContent.match(/category:\s*(.+)/i);
      const descriptionMatch = blockContent.match(/description:\s*(.+)/i);

      if (titleMatch) block.title = titleMatch[1].trim();
      if (startTimeMatch) block.startTime = startTimeMatch[1].trim();
      if (endTimeMatch) block.endTime = endTimeMatch[1].trim();
      if (categoryMatch) {
        const cat = categoryMatch[1].trim();
        block.category = Object.values(TIMEBLOCK_COLORS).includes(cat as any)
          ? cat
          : 'LIGHT_WORK';
      }
      if (descriptionMatch) block.description = descriptionMatch[1].trim();

      // Validate required fields
      if (block.title && block.startTime && block.endTime && block.category) {
        timeblocksToCreate.push(block);
        suggestedActions.push(`Create timeblock: ${block.title}`);
      }
    }

    return { timeblocksToCreate, suggestedActions };
  }

  /**
   * Remove TIMEBLOCK tags from response for cleaner display
   */
  private cleanAIResponse(response: string): string {
    return response
      .replace(/\[TIMEBLOCK\][\s\S]*?\[\/TIMEBLOCK\]/g, '') // Remove timeblock definitions
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim();
  }
}

// Singleton instance
let planningServiceInstance: PlanningService | null = null;

export function getPlanningService(): PlanningService {
  if (!planningServiceInstance) {
    planningServiceInstance = new PlanningService();
  }
  return planningServiceInstance;
}

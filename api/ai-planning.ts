/**
 * Vercel Serverless Function for AI Planning
 *
 * This function runs on Vercel's serverless infrastructure
 * and handles AI-powered daily planning requests.
 *
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key for server operations
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Types
interface PlanningRequest {
  message: string;
  context: {
    date: string;
    userId?: string;
    existingTimeblocks: Array<{
      title: string;
      startTime: string;
      endTime: string;
      category: string;
    }>;
    conversationHistory?: Array<{ role: string; content: string }>;
  };
}

interface PlanningResponse {
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

// Timeblock categories
const TIMEBLOCK_CATEGORIES = {
  DEEP_WORK: 'DEEP_WORK',
  LIGHT_WORK: 'LIGHT_WORK',
  MEETING: 'MEETING',
  PERSONAL: 'PERSONAL',
  BREAK: 'BREAK',
  AVAILABILITY: 'AVAILABILITY',
} as const;

/**
 * Map Clerk user ID to Supabase UUID
 */
async function mapClerkToSupabaseId(supabase: any, clerkUserId: string): Promise<string | null> {
  if (!clerkUserId) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('[AI Planning] Error mapping user ID:', error);
      return null;
    }

    console.log(`[AI Planning] Mapped Clerk user ${clerkUserId} to UUID ${data?.id}`);
    return data?.id || null;
  } catch (error) {
    console.error('[AI Planning] Error mapping user ID:', error);
    return null;
  }
}

/**
 * Main handler for Vercel serverless function
 */
export default async function handler(req: Request, res: any): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: PlanningRequest = await req.json();
    const { message, context } = body;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's tasks from Supabase
    const userTasks = await fetchUserTasks(context.userId);

    // Build system prompt with full context
    const systemPrompt = buildSystemPrompt({
      date: context.date,
      existingTimeblocks: context.existingTimeblocks,
      userTasks,
      conversationHistory: context.conversationHistory || [],
    });

    // Call OpenAI API
    const aiResponse = await callOpenAIAPI({
      systemPrompt,
      userMessage: message,
      conversationHistory: context.conversationHistory || [],
    });

    // Parse AI response for structured actions
    const parsedActions = parseAIResponse(aiResponse);

    // Create timeblocks if needed
    const createdTimeblocks: any[] = [];
    if (parsedActions.timeblocksToCreate.length > 0 && context.userId) {
      for (const blockData of parsedActions.timeblocksToCreate) {
        const created = await createTimeblock(blockData, context.userId, context.date);
        if (created) {
          createdTimeblocks.push(created);
        }
      }
    }

    // Clean up AI response
    const cleanResponse = cleanAIResponse(aiResponse);

    const response: PlanningResponse = {
      response: cleanResponse,
      createdTimeblocks,
      actions: parsedActions.suggestedActions,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[AI Planning API] Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to process planning request',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Call OpenAI API directly (server-side)
 */
async function callOpenAIAPI(params: {
  systemPrompt: string;
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({ apiKey });

  const messages = [
    { role: 'system', content: params.systemPrompt },
    ...params.conversationHistory,
    { role: 'user', content: params.userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Fetch user's tasks from Supabase
 */
async function fetchUserTasks(userId?: string) {
  if (!userId) {
    return { lightWork: [], deepWork: [], morningRoutine: [] };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[AI Planning] Supabase credentials not configured');
    return { lightWork: [], deepWork: [], morningRoutine: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Map Clerk user ID to Supabase UUID if needed
  const supabaseUserId = await mapClerkToSupabaseId(supabase, userId);
  if (!supabaseUserId) {
    console.warn('[AI Planning] Could not map user ID, returning empty tasks');
    return { lightWork: [], deepWork: [], morningRoutine: [] };
  }

  try {
    const [lightWork, deepWork] = await Promise.all([
      supabase
        .from('light_work_tasks')
        .select('*')
        .eq('user_id', supabaseUserId)
        .neq('completed', true)
        .limit(20),
      supabase
        .from('deep_work_tasks')
        .select('*')
        .eq('user_id', supabaseUserId)
        .neq('completed', true)
        .limit(20),
    ]);

    return {
      lightWork: lightWork.data || [],
      deepWork: deepWork.data || [],
      morningRoutine: [],
    };
  } catch (error) {
    console.error('[AI Planning] Error fetching tasks:', error);
    return { lightWork: [], deepWork: [], morningRoutine: [] };
  }
}

/**
 * Create a timeblock in Supabase
 */
async function createTimeblock(
  blockData: any,
  userId: string,
  date: string
): Promise<any | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[AI Planning] Supabase credentials not configured');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Map Clerk user ID to Supabase UUID if needed
  const supabaseUserId = await mapClerkToSupabaseId(supabase, userId);
  if (!supabaseUserId) {
    console.error('[AI Planning] Could not map user ID for timeblock creation');
    return null;
  }

  try {
    // Map category names to database enum values
    const categoryMap: { [key: string]: string } = {
      'DEEP_WORK': 'deep_focus',
      'LIGHT_WORK': 'light_focus',
      'MEETING': 'meeting',
      'PERSONAL': 'personal',
      'BREAK': 'break',
      'AVAILABILITY': 'work',
    };

    const { data, error } = await supabase
      .from('time_blocks')
      .insert({
        user_id: supabaseUserId,
        date,
        title: blockData.title,
        start_time: blockData.startTime,
        end_time: blockData.endTime,
        type: categoryMap[blockData.category] || 'work',
        description: blockData.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[AI Planning] Error creating timeblock:', error);
    return null;
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context: {
  date: string;
  existingTimeblocks: any[];
  userTasks: { lightWork: any[]; deepWork: any[]; morningRoutine: any[] };
  conversationHistory: Array<{ role: string; content: string }>;
}): string {
  const { date, existingTimeblocks, userTasks } = context;
  const totalTasks = userTasks.lightWork.length + userTasks.deepWork.length + userTasks.morningRoutine.length;

  const scheduleSummary = existingTimeblocks.length > 0
    ? existingTimeblocks.map(block => `${block.title} (${block.startTime} - ${block.endTime})`).join('\n')
    : 'No existing timeblocks';

  // Build detailed task list
  let taskList = '';
  if (userTasks.deepWork.length > 0) {
    taskList += '\n🔵 DEEP WORK TASKS:\n' + userTasks.deepWork.map((t: any, i: number) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
  }
  if (userTasks.lightWork.length > 0) {
    taskList += '\n🟢 LIGHT WORK TASKS:\n' + userTasks.lightWork.map((t: any, i: number) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
  }
  if (userTasks.morningRoutine.length > 0) {
    taskList += '\n🌅 MORNING ROUTINE TASKS:\n' + userTasks.morningRoutine.map((t: any, i: number) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
  }

  if (totalTasks === 0) {
    taskList = '\n✅ No pending tasks - you\'re all caught up!';
  }

  const today = new Date().toISOString().split('T')[0];

  return `You are a helpful daily planning assistant for SISO. You help users plan their day by scheduling tasks into timeblocks.

📅 **IMPORTANT DATE INFORMATION:**
- Today's actual date: ${today}
- User is planning for: ${date}
- ALWAYS use the user's planning date (${date}) when creating timeblocks, NOT today's date (${today})

📋 **USER'S PENDING TASKS:**${taskList}

📅 **EXISTING SCHEDULE:**
${scheduleSummary}

🎨 **COLOR CODING:**
- 🔵 Deep Work → DEEP_WORK (blue)
- 🟢 Light Work → LIGHT_WORK (green)
- 🔴 Meetings → MEETING (red)
- ⚫ Personal/Sleep → PERSONAL (black)
- 🟡 Breaks → BREAK (yellow)
- ⚪ Available → AVAILABILITY (gray)

🎯 **YOUR GOAL:**
Help the user plan their day by:
1. Reading their pending tasks (listed above)
2. Asking about their availability
3. Suggesting which tasks to schedule when
4. Creating timeblocks with the [TIMEBLOCK] format

⚠️ **CRITICAL: ALWAYS USE THE USER'S PLANNING DATE (${date}) FOR TIMEBLOCKS - NOT TODAY (${today})**

[TIMEBLOCK] FORMAT:
[TIMEBLOCK]
title: Task name
startTime: HH:MM (24h format)
endTime: HH:MM (24h format)
category: DEEP_WORK | LIGHT_WORK | MEETING | PERSONAL | BREAK | AVAILABILITY
description: Optional details
[/TIMEBLOCK]

💬 **BE PROACTIVE:**
- If they have pending tasks, suggest scheduling them!
- Ask: "I see you have ${totalTasks} tasks. Want me to help schedule them?"
- Suggest optimal ordering: deep work in morning, light work afternoon
- Always create TIMEBLOCKs when they ask to schedule something

🚨 **CRITICAL INSTRUCTIONS:**
- ALWAYS use the user's planning date (${date}) when creating timeblocks - NEVER use today's date (${today})
- When user asks to schedule/create/block out time, you MUST create [TIMEBLOCK]s
- Use 24-hour format: 09:00, 14:30, 23:45 (NEVER use 12-hour format)
- Include ALL required fields: title, startTime, endTime, category`;
}

/**
 * Parse AI response for structured actions
 */
function parseAIResponse(response: string) {
  const timeblocksToCreate: any[] = [];
  const suggestedActions: string[] = [];

  const timeblockRegex = /\[TIMEBLOCK\]([\s\S]*?)\[\/TIMEBLOCK\]/g;
  let match;

  while ((match = timeblockRegex.exec(response)) !== null) {
    const blockContent = match[1];
    const block: any = {};

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
      block.category = Object.values(TIMEBLOCK_CATEGORIES).includes(cat as any) ? cat : 'LIGHT_WORK';
    }
    if (descriptionMatch) block.description = descriptionMatch[1].trim();

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
function cleanAIResponse(response: string): string {
  return response
    .replace(/\[TIMEBLOCK\][\s\S]*?\[\/TIMEBLOCK\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Vercel serverless function configuration
export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

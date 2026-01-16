/**
 * Local Development Server for AI Planning API
 *
 * Run this with: node api/local-server.js
 *
 * This provides a local API endpoint that works like Vercel serverless functions
 * for development purposes.
 */

import http from 'http';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables - force only .env file
config({ path: resolve('.env') });

// Require environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set');
  console.error('Add your OpenAI API key to .env file');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials are not set');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('[DEBUG] Supabase initialized:', {
  url: SUPABASE_URL?.substring(0, 30) + '...',
  hasKey: !!SUPABASE_ANON_KEY
});

// Timeblock categories
const TIMEBLOCK_CATEGORIES = {
  DEEP_WORK: 'DEEP_WORK',
  LIGHT_WORK: 'LIGHT_WORK',
  MEETING: 'MEETING',
  PERSONAL: 'PERSONAL',
  BREAK: 'BREAK',
  AVAILABILITY: 'AVAILABILITY',
};

/**
 * Map Clerk user ID to Supabase UUID
 */
async function mapClerkToSupabaseId(clerkUserId) {
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
 * Fetch user's tasks from Supabase
 */
async function fetchUserTasks(userId) {
  if (!userId) {
    return { lightWork: [], deepWork: [], morningRoutine: [] };
  }

  // Map Clerk user ID to Supabase UUID if needed
  const supabaseUserId = await mapClerkToSupabaseId(userId);
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
 * Call OpenAI API
 */
async function callOpenAIAPI(params) {
  const { systemPrompt, userMessage, conversationHistory } = params;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Create a timeblock in Supabase
 */
async function createTimeblock(blockData, userId, date) {
  try {
    console.log('[DEBUG] Creating timeblock:', { blockData, userId, date });

    // Map Clerk user ID to Supabase UUID if needed
    const supabaseUserId = await mapClerkToSupabaseId(userId);
    if (!supabaseUserId) {
      console.error('[AI Planning] Could not map user ID for timeblock creation');
      return null;
    }

    // Map category names to database enum values
    const categoryMap = {
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

    if (error) {
      console.error('[AI Planning] Supabase error:', JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('[DEBUG] Timeblock created successfully:', data);
    return data;
  } catch (error) {
    console.error('[AI Planning] Error creating timeblock:', error.message);
    console.error('[AI Planning] Full error:', error);
    return null;
  }
}

/**
 * Build system prompt
 */
function buildSystemPrompt(context) {
  const { date, existingTimeblocks, userTasks } = context;
  const totalTasks = userTasks.lightWork.length + userTasks.deepWork.length + userTasks.morningRoutine.length;

  const scheduleSummary = existingTimeblocks.length > 0
    ? existingTimeblocks.map(block => `${block.title} (${block.startTime} - ${block.endTime})`).join('\n')
    : 'No existing timeblocks';

  // Build detailed task list
  let taskList = '';
  if (userTasks.deepWork.length > 0) {
    taskList += '\n🔵 DEEP WORK TASKS:\n' + userTasks.deepWork.map((t, i) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
  }
  if (userTasks.lightWork.length > 0) {
    taskList += '\n🟢 LIGHT WORK TASKS:\n' + userTasks.lightWork.map((t, i) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
  }
  if (userTasks.morningRoutine.length > 0) {
    taskList += '\n🌅 MORNING ROUTINE TASKS:\n' + userTasks.morningRoutine.map((t, i) => `  ${i + 1}. ${t.title || t.name || 'Untitled'}`).join('\n');
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
 * Parse AI response for timeblocks
 */
function parseAIResponse(response) {
  const timeblocksToCreate = [];
  const suggestedActions = [];

  const timeblockRegex = /\[TIMEBLOCK\]([\s\S]*?)\[\/TIMEBLOCK\]/g;
  let match;

  while ((match = timeblockRegex.exec(response)) !== null) {
    const blockContent = match[1];
    const block = {};

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
      block.category = Object.values(TIMEBLOCK_CATEGORIES).includes(cat) ? cat : 'LIGHT_WORK';
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
 * Clean AI response
 */
function cleanAIResponse(response) {
  return response
    .replace(/\[TIMEBLOCK\][\s\S]*?\[\/TIMEBLOCK\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Main API handler
 */
async function handleAPIRequest(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { message, context } = JSON.parse(body);

      if (!message || typeof message !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message is required' }));
        return;
      }

      // Fetch user's tasks
      const userTasks = await fetchUserTasks(context.userId);

      // Build system prompt
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

      console.log('[DEBUG] AI Response:', aiResponse);

      // Parse AI response
      const parsedActions = parseAIResponse(aiResponse);
      console.log('[DEBUG] Parsed timeblocks:', parsedActions.timeblocksToCreate);

      // Create timeblocks
      const createdTimeblocks = [];
      const pendingTimeblocks = [];

      if (parsedActions.timeblocksToCreate.length > 0) {
        for (const blockData of parsedActions.timeblocksToCreate) {
          if (context.userId) {
            const created = await createTimeblock(blockData, context.userId, context.date);
            if (created) {
              createdTimeblocks.push(created);
            } else {
              // Supabase failed, but we still have the parsed data
              pendingTimeblocks.push(blockData);
            }
          } else {
            // No userId, add to pending
            pendingTimeblocks.push(blockData);
          }
        }
      }

      // Clean response
      const cleanResponse = cleanAIResponse(aiResponse);

      const response = {
        response: cleanResponse,
        createdTimeblocks,
        pendingTimeblocks, // Timeblocks that were parsed but couldn't be saved to Supabase
        actions: parsedActions.suggestedActions,
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('[AI Planning API] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message || 'Failed to process planning request' }));
    }
  });
}

/**
 * Start server
 */
const PORT = 3001;

const server = http.createServer((req, res) => {
  // Only handle /api/ai-planning requests
  if (req.url === '/api/ai-planning') {
    handleAPIRequest(req, res);
  } else {
    // For development, proxy other requests to Vite dev server
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. This server only handles /api/ai-planning' }));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 AI Planning API Server running!');
  console.log('⚡ Powered by OpenAI (GPT-4o)');
  console.log('');
  console.log(`   Local: http://localhost:${PORT}/api/ai-planning`);
  console.log('');
  console.log('📝 Usage:');
  console.log('   POST http://localhost:3001/api/ai-planning');
  console.log('   Content-Type: application/json');
  console.log('   {');
  console.log('     "message": "What tasks do I have?",');
  console.log('     "context": { "date": "2025-01-16", "userId": "...", "existingTimeblocks": [] }');
  console.log('   }');
  console.log('');
  console.log('✅ Server ready to handle Planning Assistant requests!');
  console.log('');
});

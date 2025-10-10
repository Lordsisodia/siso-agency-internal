# 🎯 Morning AI - What's Missing for Full Functionality

**Date**: October 9, 2025
**Current Status**: 80% complete
**Missing**: 20% (critical pieces)

---

## ✅ WHAT WORKS NOW

1. ✅ Chat UI (clean iMessage style)
2. ✅ Voice input (Web Speech API)
3. ✅ Voice output (TTS talks back)
4. ✅ GPT-5 Nano integration
5. ✅ 14 function calling tools
6. ✅ Supabase queries (read tasks)
7. ✅ Supabase updates (write durations/dates)

---

## ❌ WHAT'S MISSING

### 1. **Supabase Table: `agent_conversations`** ⚠️ CRITICAL

**Problem**: Transcript saving will fail if table doesn't exist

**Need to create**:
```sql
CREATE TABLE agent_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  telegram_chat_id INTEGER,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON agent_conversations FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own conversations"
  ON agent_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own conversations"
  ON agent_conversations FOR UPDATE
  USING (user_id = auth.uid()::text);
```

**Without this**: Conversation won't save (but AI will still work!)

---

### 2. **AI System Prompt** ⚠️ NEEDED

**Problem**: AI doesn't have personality/instructions yet

**Need to add**:
```typescript
// In SimpleThoughtDumpPage.tsx, before calling GPT:
const systemPrompt = {
  role: 'system',
  content: `You are a morning routine planning assistant. Your job:

1. UNDERSTAND CONTEXT
   - User has existing tasks in Supabase (deep work + light work)
   - Use tools to fetch task data ONLY when needed
   - Remember: Most work is in SUBTASKS, not main tasks

2. ASK SMART QUESTIONS
   - "When do you have your best focus time?"
   - "Is this urgent or can it wait?"
   - "How long do you think this will take?"
   - "Want me to break this into smaller chunks?"

3. HELP ORGANIZE
   - Set task durations based on user estimates
   - Schedule tasks to optimal times
   - Prioritize based on urgency + energy levels
   - Suggest timebox structure

4. BE CONVERSATIONAL
   - Keep responses under 2 sentences
   - Ask ONE question at a time
   - Confirm before updating anything
   - Sound helpful, not robotic

5. TOOL USAGE
   - Call get_todays_tasks() when user asks "what do I have?"
   - Call update_task_duration() when user says "X will take Y hours"
   - Call schedule_task_to_timebox() when user says "schedule at X time"
   - ALWAYS get task ID first before updating

Current date: ${new Date().toLocaleDateString()}
User's focus hours: Usually 10am-12pm (ask to confirm)`
};
```

**Without this**: AI won't know how to behave properly

---

### 3. **Second AI Agent: Transcript → Timebox** ❌ NOT BUILT

**Problem**: You wanted a 2-stage system:
- Stage 1: Conversational AI (✅ done)
- Stage 2: Process transcript → structured timebox JSON (❌ missing)

**Need to build**:
```typescript
// After conversation ends, call this:
async function processTranscriptToTimebox(conversationHistory: Message[]) {
  const fullTranscript = conversationHistory.map(m =>
    `${m.role}: ${m.content}`
  ).join('\n');

  // Call second AI (GPT-5 Nano)
  const response = await gpt5NanoService.chat({
    messages: [
      {
        role: 'system',
        content: `You are a timebox scheduler. Read this conversation and extract:
        1. Which tasks were discussed
        2. What times were agreed upon
        3. How long each task should take

        Return JSON:
        {
          "timeblocks": [
            { "taskId": "...", "startTime": "10:00", "duration": 90 },
            { "taskId": "...", "startTime": "14:00", "duration": 120 }
          ]
        }`
      },
      {
        role: 'user',
        content: fullTranscript
      }
    ]
  });

  const schedule = JSON.parse(response.choices[0].message.content);

  // Save to day_schedules table
  await saveScheduleToSupabase(schedule);
}
```

**Without this**: User has to manually click schedule for each task

---

### 4. **Timebox UI Integration** ❌ NOT CONNECTED

**Problem**: Scheduled tasks don't show in timebox automatically

**Need to add**:
```typescript
// After AI schedules tasks, refresh timebox
const refreshTimebox = () => {
  // Trigger timebox page to reload from day_schedules
  window.dispatchEvent(new CustomEvent('timebox-updated'));
};

// In TimeboxSection.tsx, listen for event:
useEffect(() => {
  const handleUpdate = () => {
    loadScheduleFromSupabase();
  };
  window.addEventListener('timebox-updated', handleUpdate);
  return () => window.removeEventListener('timebox-updated', handleUpdate);
}, []);
```

**Without this**: User won't see scheduled tasks in timebox

---

### 5. **Error Handling** ⚠️ BASIC ONLY

**Current**: Basic try/catch
**Missing**:
- What if OpenAI API key is invalid?
- What if Supabase query fails?
- What if user has no tasks?
- What if voice permissions denied?

**Need to add**:
```typescript
// Graceful degradation
if (!gpt5NanoService.isConfigured()) {
  return fallbackToBasicMode(); // Use Grok or text-only
}

// User-friendly errors
catch (error) {
  if (error.message.includes('API key')) {
    showError("AI service not configured. Please contact support.");
  } else if (error.message.includes('network')) {
    showError("Connection lost. Your conversation is saved - you can continue later.");
  }
}
```

---

### 6. **Task Context Loading** ⚠️ OPTIMIZATION

**Current**: AI calls get_todays_tasks() every time
**Better**: Load once at start, cache in memory

```typescript
const [taskCache, setTaskCache] = useState(null);

// On first message, load tasks
if (!taskCache && userMessage.includes('today')) {
  const tasks = await tools.getTodaysTasks();
  setTaskCache(tasks); // Cache for conversation
}

// Give AI cached context instead of calling tool
const systemContext = taskCache ? `
You already know the user has:
${JSON.stringify(taskCache, null, 2)}
` : '';
```

**Without this**: Extra API calls for same data

---

### 7. **Conversation Flow Structure** ❌ NO SCRIPT

**Problem**: AI doesn't follow a structured flow

**Need**: Conversation phases
```typescript
const CONVERSATION_PHASES = {
  GREETING: {
    aiPrompt: "What's on your mind today?",
    nextPhase: 'DISCOVERY'
  },
  DISCOVERY: {
    aiPrompt: "Let me see what you have... [calls get_todays_tasks]",
    questions: [
      "What's your top priority?",
      "When do you have focus time?",
      "Any hard deadlines today?"
    ],
    nextPhase: 'ORGANIZATION'
  },
  ORGANIZATION: {
    aiPrompt: "Let me organize this for you...",
    actions: [
      'update_task_duration',
      'update_task_priority',
      'schedule_task_to_timebox'
    ],
    nextPhase: 'CONFIRMATION'
  },
  CONFIRMATION: {
    aiPrompt: "Here's your plan: ...",
    question: "Sound good?",
    nextPhase: 'COMPLETE'
  }
};
```

**Without this**: Conversation might be unfocused

---

### 8. **Testing Setup** ❌ NO VALIDATION

**Missing**:
- Unit tests for each tool function
- Integration test (full conversation flow)
- Mock OpenAI responses for testing

**Need**:
```typescript
// __tests__/morningAI.test.ts
describe('Morning AI System', () => {
  it('fetches real tasks from Supabase', async () => {
    const tools = new TaskQueryTools(userId, new Date());
    const result = await tools.getTodaysTasks();
    expect(result.deepWorkTasks).toBeDefined();
  });

  it('updates task duration in Supabase', async () => {
    const updateTools = new TaskUpdateTools(userId, new Date());
    const result = await updateTools.updateTaskDuration('task-123', 120);
    expect(result.success).toBe(true);
  });

  it('handles full conversation', async () => {
    // Mock OpenAI response
    // Test conversation flow
    // Verify all tools called correctly
  });
});
```

---

## 🎯 PRIORITY ORDER

### **P0 - Must Have** (Blocker if missing):
1. ✅ Create `agent_conversations` table (transcript saving)
2. ✅ Add AI system prompt (behavior instructions)
3. ✅ Test OpenAI API key works

### **P1 - Should Have** (Degraded without):
4. ✅ Add second AI agent (transcript → timebox JSON)
5. ✅ Connect timebox refresh
6. ✅ Better error handling

### **P2 - Nice to Have** (Can add later):
7. ⏸️ Conversation phase structure
8. ⏸️ Task context caching
9. ⏸️ Unit tests

---

## 📋 IMMEDIATE NEXT STEPS

### Step 1: Create Supabase Table (5 min)
Run this SQL in Supabase:
```sql
CREATE TABLE agent_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  telegram_chat_id INTEGER,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own conversations"
  ON agent_conversations
  FOR ALL
  USING (user_id = auth.uid()::text);
```

### Step 2: Add System Prompt (10 min)
I'll add the personality/instructions to GPT calls

### Step 3: Test Live (5 min)
- Refresh browser
- Try conversation
- Watch console for errors

### Step 4: Build Second AI Agent (30 min)
Process full transcript into structured timebox schedule

---

## 🚀 ESTIMATED TIME TO FULL FUNCTIONALITY

- **P0 items**: 30 minutes
- **P1 items**: 1 hour
- **P2 items**: 2 hours (optional)

**Total for MVP**: ~1.5 hours to get fully working

---

**Want me to**:
1. Create the Supabase table migration?
2. Add the system prompt?
3. Build the second AI agent?
4. All of the above?

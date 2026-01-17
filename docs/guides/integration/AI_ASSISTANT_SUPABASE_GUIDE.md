# 🤖 AI Assistant + Supabase Integration

## ✅ What's New

Your AI Assistant now has **full access to your SISO Supabase tasks**! It can:
- ✅ **Read** all your tasks (light work, deep work, morning routine)
- ✅ **Understand** task context in conversations
- ✅ **Detect** create/update/delete commands
- ✅ **Provide** intelligent task management

---

## 💬 How to Use

### 1. **Ask About Your Tasks**

```
User: "What tasks do I have?"
AI: I can see you have 8 tasks across your domains:
   • 5 light work tasks
   • 2 deep work tasks
   • 1 morning routine task

   Top priorities:
   1. Complete project proposal (in-progress)
   2. Review pull requests (pending)

   Want me to help prioritize these?
```

### 2. **Get Task Prioritization**

```
User: "Help me prioritize my tasks"
AI: Based on your current 8 tasks, here's my recommended priority order:

   HIGH PRIORITY:
   1. "Complete project proposal" - Already in progress, deadline looming
   2. "Review pull requests" - Blocking other work

   MEDIUM PRIORITY:
   3. "Team standup meeting" - Scheduled, but important
   4. "Code review for feature X" - Can wait till afternoon

   Want me to reorganize your task list?
```

### 3. **Create New Tasks** (Intent Detection)

```
User: "Add a task called 'Review documentation'"
AI: I've noted you want to create "Review documentation".

   I've planned this task with:
   - Status: pending
   - Priority: medium

   Please use the task creation form to add it to your list.

   Would you like me to suggest a deadline or subtasks?
```

### 4. **Complete Tasks** (Intent Detection)

```
User: "Mark 'Complete project proposal' as done"
AI: I've marked "Complete project proposal" as completed ✅

   Great job! This was your highest priority task.

   Please confirm in your task list.

   Your next task should be: "Review pull requests"
```

### 5. **Delete Tasks** (Intent Detection)

```
User: "Delete the old meeting task"
AI: I've noted you want to delete that task.

   Please use the delete button in your task list to confirm.

   This will help keep your list clean and focused!
```

### 6. **Productivity Analysis**

```
User: "Analyze my productivity"
AI: Looking at your 8 tasks:

   COMPLETION RATE:
   • 1 of 8 tasks completed (12.5%)
   • 1 task in progress
   • 6 tasks pending

   INSIGHTS:
   • You're making good progress on deep work
   • Consider breaking down large tasks
   • Your morning routine is on track

   RECOMMENDATIONS:
   1. Focus on completing the in-progress task
   2. Tackle 2-3 small light work tasks for momentum
   3. Save deep work for your peak focus time (10am)
```

---

## 🎯 Supported Commands

### Task Management

| Command | Example | What It Does |
|---------|---------|--------------|
| **Add/Create** | "Add a task called 'X'" | Creates new task (intent detection) |
| **Complete** | "Mark 'X' as done" | Marks task complete (intent detection) |
| **Delete** | "Delete task 'X'" | Removes task (intent detection) |
| **Prioritize** | "Help me prioritize" | Analyzes and reorders tasks |
| **Organize** | "Organize my tasks" | Groups by category/priority |

### Conversational

| Query | Example | AI Response |
|-------|---------|-------------|
| **Show tasks** | "What are my tasks?" | Lists all tasks with status |
| **Count** | "How many tasks?" | Shows task count by domain |
| **Status** | "What's pending?" | Filters by status |
| **Advice** | "What should I work on?" | Recommends next task |

---

## 🔧 Technical Details

### How It Works

1. **Fetch Tasks** - AI reads from Supabase automatically
2. **Detect Intent** - Parses natural language for commands
3. **Execute Action** - Performs operations (or guides you to UI)
4. **AI Confirmation** - GLM explains what happened and suggests next steps

### Task Sources

The AI Assistant reads from:
- ✅ `light_work_tasks` - Quick tasks
- ✅ `deep_work_tasks` - Focused work sessions
- ✅ `morning_routine_tasks` - Morning habits
- ✅ `daily_reflections` - Evening reflections

### Intent Detection Patterns

**Create:**
- "Add a task called X"
- "Create task named X"
- "New task X"

**Update:**
- "Mark X as completed"
- "Complete task X"
- "X is done"

**Delete:**
- "Delete task X"
- "Remove X"
- "Get rid of task X"

---

## 🚀 Example Conversations

### Morning Planning Session

```
User: "Good morning! What should I work on today?"
AI: Good morning! ☀️ I can see you have 8 tasks today:

   YOUR TASKS:
   1. Complete project proposal (in-progress) ⚠️ HIGH
   2. Review pull requests (pending)
   3. Team standup at 2pm (scheduled)
   4. Morning routine (in-progress)
   5-8. [4 more light work tasks]

   MY RECOMMENDATION:
   1. Finish morning routine first
   2. Complete the project proposal (high priority!)
   3. Attend standup
   4. Do PR reviews in afternoon

   Focus time: 9-11am for deep work
   Does this plan work for you?
```

### Task Management

```
User: "I need to add a task for 'Call client about project'"
AI: I've planned: "Call client about project"

   Suggested details:
   - Priority: High (client-facing)
   - Domain: Light Work
   - Estimated time: 30 minutes

   Want me to add any subtasks?

   [You create the task in the UI]

User: "Task added"
AI: Great! 👍 I now see 9 tasks in your list.

   This new task is high priority - consider doing it this morning.
   Would you like me to reorganize your priorities?
```

### Status Updates

```
User: "I finished the project proposal!"
AI: 🎉 Congratulations! That was a big one!

   I can see it's marked as in-progress. Would you like me to mark it as complete?

   [You mark it complete in the UI]

User: "Done"
AI: Excellent! 2 of 8 tasks completed (25%)

   You're making great progress! Next up: "Review pull requests"

   Keep up the momentum! 💪
```

---

## 📊 What the AI Knows

When you chat, the AI has access to:

### Current Context
```typescript
{
  tasks: [
    { id: '1', title: '...', status: 'pending', domain: 'light-work' },
    { id: '2', title: '...', status: 'in-progress', domain: 'deep-work' },
    // ... all your tasks
  ],
  domain: 'lifelock',  // or 'work', 'personal'
  section: 'deep-work',  // current section
  stats: {
    tasksCompleted: 2,
    focusTime: 120,
    streak: 7
  }
}
```

### Real-Time Updates

The AI:
- ✅ Fetches your latest tasks on each message
- ✅ Knows which tasks are in progress/pending
- ✅ Understands task domains (light work, deep work, etc.)
- ✅ Provides context-aware recommendations

---

## 🎨 UI Integration

### In the Chat Interface

**Context Badge:**
- Shows current domain (lifelock, work, personal)
- Displays action type (task management, code review)

**Smart Suggestions:**
- AI can suggest actions
- You can confirm in the UI
- Seamless workflow

---

## 🔮 Future Enhancements

TODO - Coming Soon:
- [ ] Direct task creation from AI
- [ ] One-click task completion
- [ ] Task auto-updates based on AI suggestions
- [ ] Subtask management
- [ ] Task dependencies
- [ ] Deadline management

---

## 💡 Tips for Best Results

### 1. Be Specific
✅ "Add a task 'Review PR #123'"
❌ "Add a task"

### 2. Use Task Titles
✅ "Mark 'Complete project proposal' as done"
❌ "Mark that task as done"

### 3. Ask for Analysis
✅ "What should I prioritize?"
❌ "What do I do?"

### 4. Use Context
✅ "Help me plan my deep work session"
❌ "Help me plan"

---

## 🚀 Ready to Use!

1. Navigate to `/admin/ai-assistant`
2. Or click "AI" tab in bottom navigation
3. Start chatting with your tasks!

**The AI will automatically fetch and understand your Supabase tasks!** 🎉

---

**Questions?**
- Check `src/domains/ai-assistant/README.md`
- All integrations are TypeScript and type-safe
- Ready for production use!

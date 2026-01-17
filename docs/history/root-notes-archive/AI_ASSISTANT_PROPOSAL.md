# 🤖 Adding GLM AI Assistant to SISO Internal

## 🎯 Recommended Approach: Add "AI Assistant" Tab

### Best Option: Add to Bottom Navigation (Mobile)

Replace the "Voice" tab with "AI Assistant" or add it as a new tab.

**Current Navigation:**
- Today
- Tasks
- *(separator)*
- ~~Voice~~ → **AI Assistant** ✨
- Stats
- More

### Why This Approach?

1. **High Visibility** - Always accessible from any screen
2. **Natural Flow** - Users can ask questions while managing tasks
3. **Context-Aware** - GLM can see current tasks, stats, and provide relevant advice
4. **Mobile-First** - Your app has strong mobile support
5. **Proven Pattern** - Similar to ChatGPT, Claude mobile apps

---

## 🎨 Implementation Options

### Option 1: Replace "Voice" Tab (Recommended) ✅

**Pros:**
- Quick win - minimal changes
- Voice is less frequently used
- AI Assistant can still use voice-to-text

**Navigation:**
- Today
- Tasks
- *(separator)*
- **AI Assistant** (new)
- Stats
- More

### Option 2: Add as 7th Tab

**Pros:**
- Keep all existing tabs
- More options for users

**Cons:**
- More crowded navigation
- Smaller tap targets

### Option 3: Add as Floating Action Button

**Pros:**
- Always visible
- Doesn't affect navigation

**Cons:**
- Can obscure content
- Less discoverable

### Option 4: Add as "More" Menu Item

**Pros:**
- Doesn't clutter main nav
- Power user feature

**Cons:**
- Less discoverable
- Buried in menu

---

## 📱 UI Design for AI Assistant Tab

### Mobile View (Bottom Sheet)

```
┌─────────────────────────────┐
│  SISO AI Assistant          │
├─────────────────────────────┤
│                             │
│  💬 Chat Interface          │
│  ┌───────────────────────┐  │
│  │ How can I help you   │  │
│  │ manage your tasks    │  │
│  │ today?               │  │
│  └───────────────────────┘  │
│                             │
│  User: Help me prioritize   │
│  ─────────────────────────  │
│  AI: Based on your tasks... │
│                             │
│  [Quick Actions]            │
│  • Prioritize tasks         │
│  • Analyze productivity     │
│  • Review code              │
│  • Optimize workflow        │
│                             │
└─────────────────────────────┘
```

### Desktop View (Side Panel or Modal)

- Collapsible side panel
- Or: Floating chat widget (like Intercom)
- Or: Dedicated page at `/admin/ai-assistant`

---

## 🔧 Technical Implementation

### 1. Create AI Assistant Component

**File:** `src/domains/ai-assistant/ui/AIAssistantPage.tsx`

Features:
- Chat interface
- Message history
- Quick action buttons
- Context from current tasks/stats
- Voice input support (keep existing Voice feature)

### 2. Integrate GLM MCP Client

```typescript
import { GLMMCPClient } from '@/services/mcp/glm-client';

const glm = new GLMMCPClient();

// Task management
const response = await glm.manageTasks({
  query: userMessage,
  context: {
    currentTasks: tasksFromState,
    recentActivity: activityFromState,
    domain: 'lifelock'
  }
});
```

### 3. Update Navigation

**File:** `src/domains/tasks/ui/BottomNavigation.tsx`

Replace Voice with AI Assistant:
```typescript
import { Bot } from 'lucide-react'; // AI icon

const tabs = [
  { title: 'Today', icon: Home },
  { title: 'Tasks', icon: CheckSquare },
  { type: 'separator' as const },
  { title: 'AI', icon: Bot },  // Changed from Voice
  { title: 'Stats', icon: BarChart3 },
  { title: 'More', icon: Menu }
];
```

### 4. Add Route

**File:** `src/app/App.tsx`

```typescript
const AIAssistantPage = lazy(() => import('@/domains/ai-assistant/ui/AIAssistantPage'));

// Add route:
<Route path="/admin/ai-assistant" element={
  <ClerkAuthGuard>
    <AdminLayout>
      <AIAssistantPage />
    </AdminLayout>
  </ClerkAuthGuard>
} />
```

---

## 💬 Sample Interactions

### Task Management
```
User: "Help me organize my tasks today"
AI: "I see you have 5 tasks. I recommend:
1. Start with 'Complete project proposal' (high priority)
2. Then 'Review pull requests'
3. Leave 'Team standup' for its scheduled time

Want me to reorder your task list?"
```

### Productivity Tips
```
User: "How can I stay more focused?"
AI: "Based on your FlowStats, your focus peaks at 10am. Try:
• Schedule deep work for 9-11am
• Use 25/5 pomodoro technique
• Your most productive day is Tuesday

Want me to adjust your task schedule?"
```

### Code Review
```
User: "Review my code"
AI: [Analyzes code from clipboard or selected file]
"I found 3 suggestions:
1. Add error handling on line 42
2. Consider memoizing this component
3. Type annotation missing for 'data'

Want detailed explanations?"
```

---

## 🎯 Quick Actions (One-Tap Prompts)

Add quick action buttons for common tasks:

- **🎯 Prioritize My Tasks** - Auto-analyze and reorder
- **📊 Productivity Report** - Get insights from stats
- **💡 Morning Routine Tips** - Optimize your morning
- **🔥 Deep Work Planning** - Plan focused work sessions
- **💬 Chat** - Free-form conversation

---

## 🚀 Implementation Steps

### Phase 1: Basic Chat (1-2 hours)
1. Create AIAssistantPage component
2. Basic chat UI
3. Connect to GLM MCP client
4. Update navigation

### Phase 2: Context Integration (1-2 hours)
1. Pull in current tasks
2. Add user stats
3. Recent activity
4. Domain context (lifelock, work, etc.)

### Phase 3: Quick Actions (1 hour)
1. Add quick action buttons
2. Pre-built prompts
3. One-tap workflows

### Phase 4: Advanced Features (optional)
1. Voice input
2. Message history
3. Streaming responses
4. Task auto-updates from AI suggestions

---

## 📊 Success Metrics

- Usage: How often do users chat with AI?
- Tasks created: Does AI help create better tasks?
- Productivity: Do users complete more tasks?
- Satisfaction: Do users find AI helpful?

---

## 🎨 UI Components Needed

1. **ChatBubble** - Message display
2. **ChatInput** - Text input with send button
3. **QuickActions** - Pre-built prompts
4. **TypingIndicator** - AI thinking state
5. **SuggestionChips** - AI suggested actions
6. **ContextPanel** - Show what context AI has

---

## ✅ Recommended First Step

**Start with Option 1: Replace Voice tab with AI Assistant**

1. Create the page component
2. Update BottomNavigation.tsx
3. Add route to App.tsx
4. Test with GLM API

**Estimated time:** 2-3 hours for basic working version

---

**Want me to implement this?** I can create:
- The AI Assistant page component
- Updated navigation
- Route configuration
- Full GLM integration

Just say "go" and I'll build it! 🚀

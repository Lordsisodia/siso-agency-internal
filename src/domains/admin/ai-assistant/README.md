# AI Assistant Domain

## Overview

The AI Assistant domain provides GLM 4.0-powered AI assistance for SISO Internal. It helps users manage tasks, improve productivity, and optimize workflows through natural conversation.

## Architecture

```
ai-assistant/
├── ui/                    # UI components
│   ├── components/        # Reusable components
│   │   ├── ChatInterface.tsx     # Main chat container
│   │   ├── ChatMessage.tsx       # Message bubble
│   │   ├── ChatInput.tsx         # Input with send button
│   │   ├── QuickActions.tsx      # Pre-built prompts
│   │   └── TypingIndicator.tsx  # AI thinking state
│   └── pages/
│       └── AIAssistantPage.tsx   # Main page
├── api/                  # API layer
│   └── ai-assistant-api.ts      # GLM MCP client integration
├── hooks/               # Custom React hooks
│   ├── useAIChat.ts            # Chat state management
│   └── useAIContext.ts         # Context from SISO state
├── types/               # TypeScript types
│   ├── chat.ts                 # Message types
│   ├── context.ts              # AI context types
│   └── quick-actions.ts        # Quick action definitions
└── index.ts            # Public exports
```

## Features

### 1. Task Management
- Automatic prioritization
- Task organization
- Scheduling assistance

### 2. Productivity Insights
- Personalized tips
- FlowStats integration
- Performance analysis

### 3. Workflow Optimization
- Morning routine optimization
- Deep work planning
- Time management

### 4. Code Analysis
- Code review
- Improvement suggestions
- Best practices

## Usage

### Basic Chat

```typescript
import { ChatInterface } from '@/domains/ai-assistant';

<ChatInterface />
```

### Custom Integration

```typescript
import { useAIChat } from '@/domains/ai-assistant';

function MyComponent() {
  const { sendMessage, isLoading } = useAIChat();

  const handleAsk = async () => {
    await sendMessage('Help me prioritize my tasks', {
      domain: 'lifelock',
      tasks: [...]
    });
  };
}
```

## Quick Actions

Pre-built prompts for common tasks:

1. **Prioritize Tasks** - Auto-analyze and organize tasks
2. **Productivity Tips** - Get personalized advice
3. **Morning Routine** - Optimize morning habits
4. **Deep Work Plan** - Plan focused sessions
5. **Code Review** - Analyze code

## Context Integration

The AI Assistant is context-aware and can:

- See current tasks from SISO
- Access FlowStats data
- Understand user domain (lifelock, work, personal)
- Provide personalized recommendations

## Route

Accessible at: `/admin/ai-assistant`

## Navigation

Replaces the "Voice" tab in bottom navigation with "AI" (bot icon).

## Dependencies

- GLM MCP Client (`@/services/mcp/glm-client`)
- React hooks
- Framer Motion (animations)
- Lucide React (icons)

## Future Enhancements

- [ ] Voice input integration
- [ ] Message history persistence
- [ ] Streaming responses
- [ ] Task auto-updates from AI
- [ ] Suggest actions based on context
- [ ] Multi-language support

## Testing

```bash
# Test with production API key
npm run test:glm:connection

# Run the app
npm run dev

# Navigate to http://localhost:5173/admin/ai-assistant
```

## Notes

- Requires valid GLM_API_KEY in .env
- Follows SISO domain architecture patterns
- Mobile-first responsive design
- Integrates with existing MCP infrastructure

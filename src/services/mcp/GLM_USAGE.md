# GLM MCP Integration

This document describes how to use the GLM (Zhipu AI) MCP client in SISO Internal.

## Overview

The GLM MCP client provides AI-powered capabilities integrated into SISO's MCP orchestration system:

- **Task Management**: AI assistance for organizing, prioritizing, and managing tasks
- **Code Analysis**: Intelligent code review and improvement suggestions
- **Workflow Optimization**: AI-powered workflow and process optimization
- **General Assistance**: Conversational AI for general questions and guidance

## Setup

### 1. Install Dependencies

```bash
npm install zhipuai-sdk-nodejs-v4
```

### 2. Configure Environment Variables

Add your GLM API key to your environment:

```bash
# .env or .env.local
GLM_API_KEY=your_api_key_here

# Optional: Override defaults
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_API_TIMEOUT=30000
```

Get your API key from: https://open.bigmodel.cn/

### 3. Initialize MCP Services

The GLM client is automatically registered when you initialize MCP services:

```typescript
import { initializeMCPServices } from './services/mcp';

const mcpServices = initializeMCPServices();

// GLM is now available through the orchestrator
const glmClient = mcpServices.orchestrator.getClient('glm');
```

## Usage Examples

### 1. Direct GLM Client Usage

```typescript
import { GLMMCPClient } from './services/mcp/glm-client';

const glm = new GLMMCPClient();

// General assistance
const response = await glm.assist({
  query: 'How can I improve my morning routine?',
  context: {
    currentRoutine: ['wake up', 'meditate', 'exercise']
  }
});

console.log(response);
// "Based on your routine, consider adding..."
```

### 2. Task Management

```typescript
import { GLMMCPClient } from './services/mcp/glm-client';

const glm = new GLMMCPClient();

// Get task management assistance
const advice = await glm.manageTasks({
  query: 'I have too many tasks. Help me prioritize.',
  context: {
    currentTasks: [
      { id: '1', title: 'Complete project proposal', status: 'in-progress' },
      { id: '2', title: 'Review code', status: 'pending' },
      { id: '3', title: 'Team meeting', status: 'scheduled' }
    ],
    recentActivity: ['Completed morning routine', 'Started deep work session'],
    domain: 'lifelock'
  }
});

console.log(advice);
// {
//   analysis: "You have 3 tasks with mixed priorities...",
//   suggestions: ["Focus on high-impact tasks first", ...],
//   prioritizedTasks: [...]
// }
```

### 3. Code Analysis

```typescript
import { GLMMCPClient } from './services/mcp/glm-client';

const glm = new GLMMCPClient();

// Analyze code
const analysis = await glm.analyzeCode({
  code: `
function processTasks(tasks) {
  return tasks.map(t => ({ ...t, processed: true }));
}
  `,
  language: 'typescript',
  question: 'How can I make this more efficient?'
});

console.log(analysis);
// {
//   analysis: "The code is functional but could be optimized...",
//   suggestions: ["Consider adding error handling", ...],
//   issues: []
// }
```

### 4. Workflow Optimization

```typescript
import { GLMMCPClient } from './services/mcp/glm-client';

const glm = new GLMMCPClient();

// Optimize a workflow
const optimized = await glm.optimizeWorkflow({
  workflowDescription: 'Daily morning routine',
  currentSteps: [
    'Wake up at 6am',
    'Check email',
    'Exercise',
    'Shower',
    'Breakfast',
    'Start work'
  ],
  goals: [
    'Reduce decision fatigue',
    'Increase energy levels',
    'Start deep work earlier'
  ]
});

console.log(optimized);
// {
//   optimizedSteps: [...],
//   explanation: "Reordered to prioritize...",
//   improvements: ["Moved exercise before checking email", ...]
// }
```

### 5. Using via MCP Orchestrator

```typescript
import { MCPOrchestrator } from './services/mcp';

const orchestrator = new MCPOrchestrator();

// Register GLM client
import GLMMCPClient from './services/mcp/glm-client';
orchestrator.registerMCPClient('glm', new GLMMCPClient());

// Execute as part of a workflow
const result = await orchestrator.executeWorkflow({
  id: 'task-analysis',
  name: 'Analyze and Prioritize Tasks',
  steps: [
    {
      id: 'analyze',
      mcp: 'glm',
      action: 'manageTasks',
      params: {
        query: 'Help me organize my tasks for today',
        context: {
          currentTasks: [
            { id: '1', title: 'Deep work session', status: 'pending' },
            { id: '2', title: 'Team standup', status: 'scheduled' }
          ]
        }
      }
    }
  ]
});

console.log(result.results[0].result);
```

### 6. Using via Unified MCP Client (Smart Routing)

```typescript
import { UnifiedMCPClient } from './services/mcp/unified-mcp-client';

const client = new UnifiedMCPClient();

// Query will be automatically routed to GLM
const response = await client.smartQuery(
  'Help me prioritize my tasks for today',
  {
    currentTasks: [
      { id: '1', title: 'Complete feature', status: 'in-progress' },
      { id: '2', title: 'Review PRs', status: 'pending' }
    ]
  }
);

// Intent detection automatically identifies this as a task management query
// and routes it to GLM with the manageTasks action
```

### 7. Streaming Responses

```typescript
import { GLMMCPClient } from './services/mcp/glm-client';

const glm = new GLMMCPClient();

// Stream response for real-time feedback
await glm.chatStream(
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Give me tips for staying focused' }
    ]
  },
  (chunk) => {
    console.log('Received:', chunk);
    // Process each chunk as it arrives
  }
);
```

## Intent Patterns

The GLM client is automatically invoked for queries matching these patterns:

- **AI Assistance**: `help`, `assist`, `suggest`, `advise`, `recommend`, `how to`, `explain`
- **Task Management**: `prioritize`, `organize`, `manage`, `plan`, `schedule`, `task`, `goal`
- **Code Analysis**: `review code`, `analyze code`, `improve code`, `optimize code`
- **Workflow Optimization**: `optimize workflow`, `improve process`, `streamline routine`

## Available Actions

| Action | Description | Method |
|--------|-------------|--------|
| `assist` | General AI assistance | `glm.assist()` |
| `manageTasks` | Task management & prioritization | `glm.manageTasks()` |
| `analyzeCode` | Code review & analysis | `glm.analyzeCode()` |
| `optimizeWorkflow` | Workflow optimization | `glm.optimizeWorkflow()` |
| `chat` | Raw chat completions | `glm.chat()` |
| `chatStream` | Streaming chat | `glm.chatStream()` |

## Configuration

The GLM client supports the following configuration:

```typescript
const glm = new GLMMCPClient();

// Uses environment variables:
// GLM_API_KEY - Required: Your Zhipu AI API key
// GLM_API_BASE_URL - Optional: Default: https://open.bigmodel.cn/api/paas/v4
// GLM_API_TIMEOUT - Optional: Default: 30000ms
```

## Error Handling

```typescript
try {
  const response = await glm.assist({ query: 'Help me' });
} catch (error) {
  if (error.message.includes('GLM_API_KEY')) {
    console.error('API key not configured');
  } else if (error.message.includes('GLM API error')) {
    console.error('API request failed:', error);
  }
}
```

## Testing

Run GLM MCP tests:

```bash
npm run test:mcp:glm
```

Or run all MCP tests:

```bash
npm run test:mcp:supabase
```

## Examples in SISO Context

### LifeLock Domain

```typescript
const glm = new GLMMCPClient();

// Optimize morning routine
const advice = await glm.manageTasks({
  query: 'How can I improve my morning routine consistency?',
  context: {
    domain: 'lifelock',
    currentTasks: [
      { id: '1', title: 'Meditation', status: 'completed' },
      { id: '2', title: 'Journaling', status: 'skipped' },
      { id: '3', title: 'Exercise', status: 'completed' }
    ]
  }
});
```

### Work Domain

```typescript
// Analyze workflow for deep work sessions
const optimized = await glm.optimizeWorkflow({
  workflowDescription: 'Deep work session preparation',
  currentSteps: [
    'Check calendar',
    'Select tasks',
    'Set timer',
    'Start work'
  ],
  goals: ['Maximize focus time', 'Minimize distractions']
});
```

## Integration with Other MCPs

GLM works seamlessly with other SISO MCPs:

```typescript
const result = await orchestrator.executeWorkflow({
  id: 'comprehensive-task-workflow',
  name: 'Task Analysis & Planning',
  steps: [
    {
      id: 'query-db',
      mcp: 'supabase',
      action: 'executeSql',
      params: { query: 'SELECT * FROM light_work_tasks WHERE status = pending' }
    },
    {
      id: 'analyze-tasks',
      mcp: 'glm',
      action: 'manageTasks',
      params: {
        query: 'Help me organize these tasks',
        dependsOn: ['query-db']
      }
    }
  ]
});
```

## Best Practices

1. **Provide Context**: Always include relevant context for better responses
2. **Use Specific Queries**: Be specific about what you need help with
3. **Combine with Data**: Use Supabase MCP to fetch data, then GLM to analyze it
4. **Handle Errors**: Always wrap GLM calls in try-catch blocks
5. **Cache Responses**: Use MCP cache for frequently asked questions

## Resources

- [GLM API Documentation](https://open.bigmodel.cn/dev/api)
- [GLM Node.js SDK](https://github.com/MetaGLM/zhipuai-sdk-nodejs-v4)
- [Zhipu AI Developer Docs](https://docs.z.ai/guides/llm/glm-4.5)

# Quick Reference: Framework Patterns

> Fast lookup for implementation patterns from AutoMaker and Maestro

## Context Files Pattern (AutoMaker)

### Structure
```
.project-root/
└── .automaker/context/
    ├── CLAUDE.md              # Project rules
    ├── CODE_QUALITY.md        # Standards
    └── context-metadata.json  # Descriptions
```

### Metadata Format
```json
{
  "files": {
    "CLAUDE.md": {
      "description": "Project-specific rules including package manager and conventions"
    }
  }
}
```

### Usage
```typescript
import { loadContextFiles } from '@automaker/utils';

const { formattedPrompt, files } = await loadContextFiles({
  projectPath: '/path/to/project'
});

// Use formattedPrompt as system prompt
```

---

## Layer Stack Pattern (Maestro)

### Priority System
```typescript
const MODAL_PRIORITIES = {
  CONFIRM: 1000,              // Highest
  QUICK_ACTION: 700,
  SETTINGS: 450,
  GIT_DIFF: 200,
  FILE_TREE_FILTER: 30,       // Lowest
};
```

### Registration Pattern
```typescript
import { useLayerStack } from './contexts/LayerStackContext';

const { registerLayer, unregisterLayer } = useLayerStack();
const onCloseRef = useRef(onClose);
onCloseRef.current = onClose;

useEffect(() => {
  if (isOpen) {
    const id = registerLayer({
      type: 'modal',
      priority: MODAL_PRIORITIES.YOUR_MODAL,
      onEscape: () => onCloseRef.current(),
    });
    return () => unregisterLayer(id);
  }
}, [isOpen, registerLayer, unregisterLayer]);
```

---

## Git Worktree Pattern (Both)

### Creation
```typescript
// Create worktree for isolated execution
const worktreePath = `/tmp/worktree-${featureId}`;
await execFile('git', ['worktree', 'add', worktreePath, '-b', branchName], repoPath);

// Execute in worktree
await executeTask(worktreePath, taskConfig);

// Create PR when done
await createPR(worktreePath, baseBranch, title, body);

// Cleanup
await execFile('git', ['worktree', 'remove', worktreePath], repoPath);
```

### Benefits
- Main branch stays safe
- Parallel development
- Easy rollback
- No conflicts

---

## Event-Driven Pattern (AutoMaker)

### Event Emitter
```typescript
import { createEventEmitter } from './lib/events';

const emitter = createEventEmitter();

// Emit events
emitter.emit('task:started', { taskId, timestamp });
emitter.emit('task:progress', { taskId, progress: 50 });
emitter.emit('task:completed', { taskId, result });

// Subscribe to events
emitter.on('task:progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});
```

### WebSocket Streaming
```typescript
// Broadcast to frontend
websocket.broadcast({
  type: 'task:progress',
  data: { taskId, progress }
});

// Frontend subscription
websocket.on('task:progress', (data) => {
  updateProgress(data.taskId, data.progress);
});
```

---

## Hook-Based State Pattern (Maestro)

### Custom Hook Template
```typescript
export function useFeatureState() {
  // State
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    loadState();
  }, []);

  // Actions
  const updateState = useCallback((newState) => {
    setState(newState);
    persistState(newState);
  }, []);

  return {
    state,
    loading,
    error,
    updateState
  };
}
```

### Usage Pattern
```typescript
const { state, loading, error, updateState } = useFeatureState();
```

---

## Auto Run Pattern (Maestro)

### Document Format
```markdown
# Task: Setup Development Environment

- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Setup database
- [ ] Run migrations
- [ ] Start development server
```

### Execution Pattern
```typescript
// Parse markdown checkboxes
const tasks = parseCheckboxes(markdownContent);

// Execute sequentially
for (const task of tasks) {
  if (!task.checked) {
    await agent.execute(task.text);
    task.checked = true;
    saveDocument(markdownContent);
  }
}
```

### Playbook Structure
```
playbook-folder/
├── 01_TASK.md
├── 02_TASK.md
├── README.md
└── assets/
    ├── config.yaml
    └── setup.sh
```

---

## Planning Modes Pattern (AutoMaker)

### Mode Definitions
```typescript
enum PlanningMode {
  SKIP = 'skip',         // Direct execution
  LITE = 'lite',         // Quick summary
  SPEC = 'spec',         // Task breakdown
  FULL = 'full'          // Detailed phases
}
```

### Approval Workflow
```typescript
// Generate plan
const plan = await generatePlan(feature, mode);

// Require approval for spec/full
if (mode === PlanningMode.SPEC || mode === PlanningMode.FULL) {
  const approved = await waitForApproval(plan);
  if (!approved) return;
}

// Execute plan
await executePlan(plan);
```

---

## Multi-Agent Coordination Pattern (Maestro)

### Moderator Flow
```typescript
// 1. User sends request with @mentions
const agents = extractMentions(userRequest);

// 2. Moderator routes to agents
const responses = await Promise.all(
  agents.map(agent => executeAgent(agent, userRequest))
);

// 3. Moderator synthesizes
const synthesis = await moderator.synthesize(userRequest, responses);

// 4. Check if needs more info
if (synthesis.hasMentions) {
  // Loop back to agents
  await routeToAgents(synthesis.mentions);
} else {
  // Return to user
  return synthesis.response;
}
```

---

## Custom Commands Pattern (Maestro)

### Command Definition
```typescript
interface CustomCommand {
  command: string;           // e.g., "/review"
  description: string;       // "Review recent changes"
  prompt: string;            // Expanded prompt
  template?: string[];       // Variables
}
```

### Template Variables
```typescript
const VARIABLES = {
  date: () => new Date().toISOString().split('T')[0],
  time: () => new Date().toTimeString(),
  cwd: () => process.cwd(),
  session: () => sessionName,
};

// Expand template
const expanded = prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  return VARIABLES[key]?.() || `{{${key}}}`;
});
```

---

## File-Based Storage Pattern (Both)

### Directory Structure
```
.data/
├── features/
│   └── {featureId}/
│       ├── feature.json
│       └── output.md
├── sessions/
│   └── {sessionId}.json
├── settings.json
└── state.json
```

### Read/Write Pattern
```typescript
// Read
const data = JSON.parse(fs.readFileSync(path, 'utf-8'));

// Write
fs.writeFileSync(path, JSON.stringify(data, null, 2));

// Atomic write
fs.renameSync(tempPath, targetPath);
```

---

## Safe Command Execution Pattern (Maestro)

### execFileNoThrow Pattern
```typescript
import { execFileNoThrow } from './utils/execFile';

// Never throws, returns result object
const result = await execFileNoThrow('git', ['status'], cwd);

// Returns: { stdout, stderr, exitCode }
if (result.exitCode === 0) {
  console.log(result.stdout);
}
```

### Security Rules
- NEVER use shell-based execution
- ALWAYS use execFile with array arguments
- NEVER concatenate command strings
- ALWAYS validate user input

---

## Monorepo Package Pattern (AutoMaker)

### Structure
```
project/
├── apps/
│   ├── ui/
│   └── server/
└── libs/
    ├── types/        # No dependencies
    ├── utils/        # Depends on types
    ├── platform/     # Depends on types
    └── execution/    # Depends on utils, platform
```

### Dependency Chain
```json
{
  "name": "@project/execution",
  "dependencies": {
    "@project/utils": "workspace:*",
    "@project/platform": "workspace:*"
  }
}
```

### Import Convention
```typescript
// ALWAYS import from packages
import { Feature } from '@project/types';
import { logger } from '@project/utils';

// NEVER import from relative paths
import { Feature } from '../../types'; // WRONG
```

---

## Session Management Pattern (Maestro)

### Session Interface
```typescript
interface Session {
  id: string;
  name: string;
  agentPid: number;           // AI process
  terminalPid: number;        // Terminal process
  inputMode: 'ai' | 'terminal';
  createdAt: number;
  lastActive: number;
}
```

### Dual-Process Creation
```typescript
// Spawn AI process
const aiPid = await spawnAgent(agentConfig);

// Spawn terminal process
const terminalPid = await spawnTerminal(shellConfig);

// Create session
const session = {
  id: generateId(),
  agentPid,
  terminalPid,
  inputMode: 'ai'
};
```

---

## Analytics Pattern (Maestro)

### SQLite Schema
```sql
CREATE TABLE executions (
  id TEXT PRIMARY KEY,
  skill_id TEXT,
  timestamp INTEGER,
  duration INTEGER,
  tokens_used INTEGER,
  cost_usd REAL
);

CREATE TABLE stats_sessions (
  id TEXT PRIMARY KEY,
  start_time INTEGER,
  end_time INTEGER,
  total_tasks INTEGER,
  completed_tasks INTEGER
);
```

### Query Pattern
```typescript
const db = new Database('stats.db');

const stats = db.prepare(`
  SELECT
    skill_id,
    COUNT(*) as executions,
    AVG(duration) as avg_duration,
    SUM(cost_usd) as total_cost
  FROM executions
  WHERE timestamp >= ?
  GROUP BY skill_id
`).all(sinceDate);
```

---

## Theme System Pattern (Maestro)

### Theme Interface
```typescript
interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: {
    bgMain: string;
    bgSidebar: string;
    textMain: string;
    textDim: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}
```

### Usage Pattern
```typescript
// Use inline styles for theme colors
<div style={{ color: theme.colors.textMain }}>

// Use Tailwind for layout
<div className="flex items-center gap-2">
```

---

## Progress Tracking Pattern (AutoMaker)

### Progress Events
```typescript
interface ProgressEvent {
  type: 'progress';
  taskId: string;
  progress: number;        // 0-100
  message: string;
  timestamp: number;
}

// Emit progress
emitter.emit('progress', {
  taskId: 'task-123',
  progress: 50,
  message: 'Processing file 3 of 6',
  timestamp: Date.now()
});
```

### UI Update Pattern
```typescript
function TaskProgress({ taskId }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = emitter.on('progress', (event) => {
      if (event.taskId === taskId) {
        setProgress(event.progress);
        setMessage(event.message);
      }
    });
    return () => unsubscribe();
  }, [taskId]);

  return (
    <div>
      <ProgressBar value={progress} />
      <p>{message}</p>
    </div>
  );
}
```

---

## Key Takeaways

1. **Context Files** - Project-specific rules automatically applied
2. **Layer Stack** - Centralized modal management with priorities
3. **Git Worktrees** - Isolated execution environments
4. **Event-Driven** - Real-time communication via events/WebSocket
5. **Hook-Based** - Consistent state management patterns
6. **File-Based Storage** - Simple, transparent persistence
7. **Safe Execution** - Never use shell-based commands
8. **Monorepo** - Clear package hierarchy with shared types

---

**Quick lookup for common patterns - copy, adapt, implement!**

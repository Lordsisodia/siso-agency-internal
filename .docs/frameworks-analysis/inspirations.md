# Inspirations for BlackBox5

> Date: 2025-01-18
> Based on analysis of AutoMaker and Maestro frameworks

## Executive Summary

This document captures the most valuable patterns, features, and architectural decisions from AutoMaker and Maestro that could inspire and improve BlackBox5. Recommendations are organized by category and priority.

## High-Priority Inspirations

### 1. Context Files System (AutoMaker)

**What It Is**:
Project-specific rules stored in `.automaker/context/` that are automatically loaded and prepended to agent prompts.

**Why It's Brilliant**:
- Agents automatically follow project conventions
- Clear descriptions of when to use each file
- Metadata explains purpose of each context file
- Version controlled with the project

**Implementation for BlackBox5**:
```
.blackbox5/
├── context/
│   ├── AGENT.md              # Agent-specific rules
│   ├── CONVENTIONS.md        # Code conventions
│   ├── WORKFLOW.md           # Workflow patterns
│   └── context-metadata.json # File descriptions
```

**Key Features**:
- Load context files on agent initialization
- Format with clear descriptions
- Include file paths for reference
- Metadata for when to use each file

### 2. Layer Stack System (Maestro)

**What It Is**:
Centralized modal/overlay management with priority-based Escape key handling.

**Why It's Brilliant**:
- Eliminates scattered Escape handlers
- Predictable focus management
- Priority-based stacking
- Single global handler

**Implementation for BlackBox5**:
```typescript
const LAYER_PRIORITIES = {
  CRITICAL: 1000,      // Highest priority
  CONFIRMATION: 900,
  QUICK_ACTION: 700,
  SETTINGS: 500,
  INFO: 300,
  NOTIFICATION: 100,   // Lowest priority
};

// Register modals with layer stack
const { registerLayer, unregisterLayer } = useLayerStack();
```

**Benefits**:
- No more fighting over Escape key
- Clear modal hierarchy
- Automatic focus management
- Consistent behavior

### 3. Git Worktree Isolation (Both)

**What It Is**:
Each task/feature executes in an isolated git worktree to protect the main branch.

**Why It's Brilliant**:
- Main branch stays safe
- Parallel development without conflicts
- Easy PR creation
- Isolated testing environments

**Implementation for BlackBox5**:
```typescript
// Create worktree for each skill execution
const worktreePath = await createWorktree(repoPath, branchName);

// Execute skill in worktree
await executeSkill(worktreePath, skillConfig);

// Create PR when done
await createPR(worktreePath, baseBranch, title, body);
```

**Benefits**:
- Safe parallel execution
- Clean workspace
- Easy rollback
- No merge conflicts

### 4. Event-Driven Architecture (AutoMaker)

**What It Is**:
All operations emit events that stream to the frontend via WebSocket.

**Why It's Brilliant**:
- Real-time updates
- Progress monitoring
- Multi-user collaboration potential
- Loose coupling

**Implementation for BlackBox5**:
```typescript
// Create event emitter
const emitter = createEventEmitter();

// Emit events for all operations
emitter.emit('skill:started', { skillId, timestamp });
emitter.emit('skill:progress', { skillId, progress, message });
emitter.emit('skill:completed', { skillId, result });

// Stream to frontend via WebSocket
websocket.broadcast(event);
```

**Benefits**:
- Live progress updates
- Real-time monitoring
- Easy to extend
- Testable

### 5. Hook-Based State Management (Maestro)

**What It Is**:
Consistent use of custom hooks for all complex state management.

**Why It's Brilliant**:
- Consistent patterns
- Reusable logic
- Easy testing
- Clear separation of concerns

**Implementation for BlackBox5**:
```typescript
// Custom hooks for different concerns
const useSkills = () => { /* ... */ };
const useSessions = () => { /* ... */ };
const useWorktrees = () => { /* ... */ };
const useAutoRun = () => { /* ... */ };
const useNavigation = () => { /* ... */ };
```

**Benefits**:
- Consistent API
- Reusable across components
- Easy to test
- Clear responsibilities

## Medium-Priority Inspirations

### 6. Auto Run System (Maestro)

**What It Is**:
File-based automation system where markdown checklists are processed sequentially by AI agents.

**Why It's Useful**:
- Repeatable workflows
- Easy to version control
- Human-readable automation
- Asset support (configs, scripts)

**Implementation for BlackBox5**:
```
.blackbox5/
├── playbooks/
│   ├── setup/
│   │   ├── 01-install-deps.md
│   │   ├── 02-configure.md
│   │   └── assets/
│   │       └── config.yaml
│   └── deployment/
│       ├── 01-build.md
│       └── 02-deploy.md
```

**Use Cases**:
- Onboarding automation
- Deployment workflows
- Testing procedures
- Maintenance tasks

### 7. Planning Modes (AutoMaker)

**What It Is**:
Four levels of planning control: skip, lite, spec, full.

**Why It's Useful**:
- Flexibility in control
- Preview before execution
- Task breakdown for complex work
- Human-in-the-loop approval

**Implementation for BlackBox5**:
```typescript
enum PlanningMode {
  SKIP = 'skip',         // Direct execution
  LITE = 'lite',         // Quick summary
  SPEC = 'spec',         // Task breakdown
  FULL = 'full'          // Detailed phases
}

// Require approval for spec/full modes
if (mode === PlanningMode.SPEC || mode === PlanningMode.FULL) {
  await waitForApproval(plan);
}
```

**Benefits**:
- Appropriate control for task complexity
- Approval gates prevent mistakes
- Clear communication of approach

### 8. Group Chat / Multi-Agent Coordination (Maestro)

**What It Is**:
Moderator AI orchestrates multiple agents, routing questions and synthesizing responses.

**Why It's Powerful**:
- Parallel agent execution
- Specialized agents for different tasks
- Moderator ensures quality
- Can iterate until satisfied

**Implementation for BlackBox5**:
```typescript
// Moderator receives user request
const agents = extractAgentMentions(request);

// Route to specialized agents
const responses = await Promise.all(
  agents.map(agent => executeAgent(agent, request))
);

// Moderator synthesizes responses
const synthesis = await moderator.synthesize(request, responses);

// Either return to user or iterate with agents
if (synthesis.needsMoreInfo) {
  // Loop back to agents
} else {
  // Return to user
}
```

**Use Cases**:
- Code review (different agents check different aspects)
- Architecture decisions (multiple perspectives)
- Debugging (specialized diagnostic agents)
- Documentation (technical + writing agents)

### 9. Custom AI Commands (Maestro)

**What It Is**:
User-defined prompt macros that expand when typed, with template variables.

**Why It's Useful**:
- Repeatable prompts
- Template variables for dynamic content
- Command autocomplete
- Personal workflows

**Implementation for BlackBox5**:
```typescript
interface CustomCommand {
  command: string;           // e.g., "/review"
  description: string;       // Shown in autocomplete
  prompt: string;            // Expanded prompt
  template?: string[];       // Variables: {{date}}, {{cwd}}, etc.
}

// Define commands
const commands = [
  {
    command: '/review',
    description: 'Review recent changes',
    prompt: 'Review the changes made in {{cwd}} as of {{date}}',
  }
];
```

**Benefits**:
- Faster workflows
- Consistent prompts
- Easy to share
- Template flexibility

### 10. Usage Dashboard & Analytics (Maestro)

**What It Is**:
Comprehensive analytics with SQLite backend, visual charts, and real-time updates.

**Why It's Valuable**:
- Track skill usage
- Monitor costs
- Identify patterns
- Gamification potential

**Implementation for BlackBox5**:
```typescript
// SQLite database for stats
const db = new Database('blackbox5-stats.db');

// Track skill executions
db.exec(`
  CREATE TABLE skill_executions (
    id TEXT PRIMARY KEY,
    skill_id TEXT,
    timestamp INTEGER,
    duration INTEGER,
    tokens_used INTEGER,
    cost_usd REAL
  )
`);

// Query for analytics
const stats = db.prepare(`
  SELECT
    skill_id,
    COUNT(*) as executions,
    SUM(duration) as total_duration,
    SUM(cost_usd) as total_cost
  FROM skill_executions
  WHERE timestamp >= ?
  GROUP BY skill_id
`).all(sinceDate);
```

**Benefits**:
- Data-driven decisions
- Cost monitoring
- Usage insights
- Performance optimization

## Lower-Priority but Interesting

### 11. Achievement System (Maestro)

**What It Is**:
Gamification with levels, badges, and celebration animations.

**Why It's Engaging**:
- Motivates usage
- Tracks progress
- Celebrates milestones
- Shareable achievements

**Implementation for BlackBox5**:
```typescript
// Define achievement levels
const ACHIEVEMENTS = {
  NOVICE: { hours: 1, name: 'Novice Agent' },
  EXPERT: { hours: 10, name: 'Expert Agent' },
  MASTER: { hours: 100, name: 'Master Agent' },
};

// Track cumulative usage
const totalHours = getTotalUsageHours();
const achievement = getAchievement(totalHours);

// Celebrate on level up
if (newLevel > currentLevel) {
  showCelebration(achievement);
}
```

### 12. Mobile Remote Control (Maestro)

**What It Is**:
Built-in web server with PWA for mobile access and control.

**Why It's Convenient**:
- Monitor from anywhere
- Quick interventions
- Status checks
- No app installation

**Implementation for BlackBox5**:
```typescript
// Start web server
const server = express();
const httpServer = createServer(server);

// WebSocket for real-time updates
const wsServer = new WebSocket.Server({ server: httpServer });

// PWA manifest
app.use(express.static('web-client'));

// QR code for easy connection
const qrCode = generateQRCode(serverUrl);
```

### 13. Session Discovery (Maestro)

**What It Is**:
Automatically discovers and imports existing sessions from all supported providers.

**Why It's Seamless**:
- No manual import
- Browse all history
- Search and resume
- Transparent to user

**Implementation for BlackBox5**:
```typescript
// Scan for session directories
const sessions = await scanSessions([
  '~/.claude/projects/',
  '~/.blackbox5/sessions/',
  // ... other providers
]);

// Index and make searchable
const index = buildSessionIndex(sessions);

// Provide search and resume
const results = searchSessions(query);
```

### 14. Document Graph (Maestro)

**What It Is**:
Visual knowledge graph of markdown documentation with interactive nodes.

**Why It's Powerful**:
- See document relationships
- Discover connections
- Navigate knowledge base
- Visual learning

**Implementation for BlackBox5**:
```typescript
// Scan for markdown files
const files = await scanMarkdownFiles(docPath);

// Extract links and relationships
const graph = buildDocumentGraph(files);

// Visualize with React Flow
<DocumentGraph
  nodes={graph.nodes}
  edges={graph.edges}
  onNodeClick={openDocument}
/>
```

### 15. SSH Remote Sessions (Maestro)

**What It Is**:
Execute skills and commands on remote hosts via SSH.

**Why It's Flexible**:
- Work on remote servers
- Same interface as local
- Transparent to user
- No VPN needed

**Implementation for BlackBox5**:
```typescript
// Execute skill on remote host
const result = await executeSkillRemotely({
  host: sshConfig.host,
  username: sshConfig.username,
  command: skillCommand,
  workingDir: remotePath
});
```

## Architectural Patterns to Adopt

### Monorepo Structure (AutoMaker)

```
blackbox5/
├── apps/
│   ├── cli/          # Command-line interface
│   ├── server/       # Web server
│   └── ui/           # Web UI
└── libs/             # Shared packages
    ├── types/        # Core types
    ├── utils/        # Utilities
    ├── skills/       # Skill definitions
    ├── execution/    # Execution engine
    └── storage/      # Storage layer
```

**Benefits**:
- Clear separation
- Type sharing
- Reusable packages
- Scalable

### File-Based Storage (Both)

```
.blackbox5/
├── context/          # Context files
├── skills/           # Skill definitions
├── sessions/         # Session history
├── playbooks/        # Automation playbooks
└── state/            # Application state
```

**Benefits**:
- Version control
- Human-readable
- Easy backup
- No database complexity

### Event-Driven Communication (AutoMaker)

```typescript
// All operations emit events
eventBus.emit('skill:started', { skillId, timestamp });
eventBus.emit('skill:progress', { skillId, progress, message });
eventBus.emit('skill:completed', { skillId, result, duration });

// Real-time streaming via WebSocket
websocket.broadcast({ type, data });
```

**Benefits**:
- Real-time updates
- Loose coupling
- Easy monitoring
- Extensible

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. **Context Files System**
   - Create `.blackbox5/context/` directory
   - Implement context loader
   - Add metadata support
   - Integrate with skill execution

2. **Layer Stack System**
   - Implement modal priority system
   - Create global Escape handler
   - Add focus management
   - Migrate existing modals

### Phase 2: Core Features (Week 3-4)

3. **Git Worktree Isolation**
   - Implement worktree creation
   - Add worktree execution
   - Create PR workflow
   - Add cleanup logic

4. **Event-Driven Architecture**
   - Create event emitter
   - Add WebSocket streaming
   - Implement progress tracking
   - Build monitoring UI

### Phase 3: Advanced Features (Week 5-6)

5. **Auto Run System**
   - Create playbook format
   - Implement markdown parsing
   - Add asset support
   - Build playbook manager

6. **Planning Modes**
   - Define planning levels
   - Implement approval workflow
   - Add plan generation
   - Create plan UI

### Phase 4: Enhancement (Week 7-8)

7. **Multi-Agent Coordination**
   - Implement moderator pattern
   - Add agent routing
   - Create synthesis logic
   - Build group chat UI

8. **Usage Analytics**
   - Create SQLite schema
   - Implement tracking
   - Build dashboard
   - Add export functionality

### Phase 5: Polish (Week 9-10)

9. **Custom Commands**
   - Create command format
   - Implement expansion
   - Add autocomplete
   - Build command editor

10. **Achievement System**
    - Define achievement levels
    - Implement tracking
    - Create celebrations
    - Add sharing

## Key Takeaways

### Most Valuable Patterns

1. **Context Files** - Project-specific rules automatically applied
2. **Layer Stack** - Predictable modal management
3. **Git Worktrees** - Safe isolated execution
4. **Event-Driven** - Real-time communication
5. **Hook-Based** - Consistent state management

### Best Features to Adopt

1. **Auto Run** - File-based automation
2. **Planning Modes** - Flexible control
3. **Group Chat** - Multi-agent coordination
4. **Usage Dashboard** - Analytics and insights
5. **Custom Commands** - User-defined macros

### Architecture Goals

1. **Monorepo** - Clear package separation
2. **File-Based Storage** - Simplicity and transparency
3. **Event-Driven** - Real-time updates
4. **Hook-Based** - Consistent patterns
5. **Git Isolation** - Safe execution

## Conclusion

AutoMaker and Maestro both offer excellent inspiration for BlackBox5:

- **AutoMaker** excels at structured workflows and autonomous implementation
- **Maestro** excels at orchestration and power user features

The best approach for BlackBox5 is to combine:
- AutoMaker's context files and planning system
- Maestro's layer stack and automation
- Both frameworks' git worktree isolation
- Event-driven architecture for real-time updates
- Hook-based state management for consistency

This will create a powerful, flexible AI agent orchestration platform that balances structure with flexibility, and autonomous execution with human control.

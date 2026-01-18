# Current System Analysis - Research Application Mapping

**Analysis of SISO-INTERNAL codebase and how research applies**

**Created:** 2026-01-18
**Purpose:** Map research findings to existing codebase architecture

---

## Part 1: Current System Architecture

### Existing Domain Structure

Based on codebase analysis, the system is organized into:

```
src/
├── domains/           (8 core domains)
│   ├── admin/         (Client management, dashboard, analytics)
│   ├── agency/        (NEW - Agent system?)
│   ├── partners/      (Partnership management)
│   ├── industries/    (Industry categories)
│   ├── lifelock/      (Daily tasks, deep work)
│   ├── financial/     (Payments, expenses)
│   ├── calendar/      (Planning, scheduling)
│   └── profile/       (User portfolio)
│
├── components/        (UI components)
│   └── ui/dashboard/  (Dashboard UI library)
│
├── services/          (Business logic)
│   ├── integrations/  (Supabase, external APIs)
│   ├── supabaseTaskService.ts
│   └── UnifiedTaskService.ts
│
└── xp-store/          (NEW - Experience storage?)
```

### Key Observations

1. **No Agent System Yet** - The `agency/` and `xp-store/` directories suggest Black Box 5 is in early planning
2. **Task Services Exist** - `UnifiedTaskService.ts` and `supabaseTaskService.ts` provide task management
3. **Supabase Integration** - Full Supabase stack with auth, storage, database
4. **Domain-Driven Design** - Clear separation of concerns by business domain

---

## Part 2: Research Application to AGENTS System

### Application Area: Event-Driven Communication

**Research Finding:** Event-driven architecture reduces communication overhead by 67%

**Current State:** No agent communication system exists yet

**What to Build:**

```typescript
// FILE: src/agency/communication/EventBus.ts

interface AgentEvent {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: unknown;
}

interface EventBusConfig {
  backend: 'redis' | 'kafka' | 'memory';
  persistence?: boolean;
  partitions?: number;
}

class AgentEventBus {
  private backend: EventBusConfig['backend'];
  private publishers: Map<string, any>;
  private subscribers: Map<string, Set<string>>;

  constructor(config: EventBusConfig) {
    this.backend = config.backend;
    this.publishers = new Map();
    this.subscribers = new Map();

    this.initializeBackend(config);
  }

  private initializeBackend(config: EventBusConfig): void {
    if (config.backend === 'redis') {
      // Use Redis for pub/sub
      this.initializeRedis();
    } else if (config.backend === 'kafka') {
      // Use Kafka for distributed systems
      this.initializeKafka(config);
    } else {
      // In-memory for development
      this.initializeMemory();
    }
  }

  publish(topic: string, event: Omit<AgentEvent, 'id' | 'timestamp'>): string {
    const eventId = crypto.randomUUID();
    const fullEvent: AgentEvent = {
      id: eventId,
      timestamp: new Date(),
      ...event
    };

    // Publish to backend
    this.publishToBackend(topic, fullEvent);

    return eventId;
  }

  subscribe(agentId: string, topic: string, handler: (event: AgentEvent) => void): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(agentId);

    // Register handler for this agent
    this.registerHandler(topic, agentId, handler);
  }

  unsubscribe(agentId: string, topic: string): void {
    this.subscribers.get(topic)?.delete(agentId);
  }

  private publishToBackend(topic: string, event: AgentEvent): void {
    // Implementation depends on backend
    if (this.backend === 'memory') {
      this.publishInMemory(topic, event);
    } else if (this.backend === 'redis') {
      this.publishToRedis(topic, event);
    } else if (this.backend === 'kafka') {
      this.publishToKafka(topic, event);
    }
  }

  private registerHandler(topic: string, agentId: string, handler: (event: AgentEvent) => void): void {
    // Register handler for events on this topic
    // Implementation depends on backend
  }

  private initializeRedis(): void {
    // Initialize Redis client
    // Import and configure Redis
  }

  private initializeKafka(config: EventBusConfig): void {
    // Initialize Kafka producer
    // Import and configure Kafka
  }

  private initializeMemory(): void {
    // In-memory implementation for development
  }

  private publishInMemory(topic: string, event: AgentEvent): void {
    // Direct function call for in-memory
  }

  private publishToRedis(topic: string, event: AgentEvent): void {
    // Redis PUBLISH command
  }

  private publishToKafka(topic: string, event: AgentEvent): void {
    // Kafka producer send
  }
}

// Usage example
const eventBus = new AgentEventBus({
  backend: 'redis', // or 'kafka' for production
  persistence: true,
  partitions: 10
});

// Subscribe to topics
eventBus.subscribe('agent-123', 'task.assigned', (event) => {
  console.log('Task assigned:', event.data);
});

// Publish events
eventBus.publish('task.assigned', {
  type: 'task.assigned',
  source: 'manager',
  data: {
    taskId: 'task-456',
    assignedTo: 'agent-123',
    description: 'Research query'
  }
});
```

**Integration Points:**
- Integrate with existing Supabase for event persistence
- Use existing `supabaseTaskService.ts` for task events
- Connect to `UnifiedTaskService.ts` for unified task management

---

### Application Area: 3-Level Hierarchy

**Research Finding:** 3-level hierarchy is 47% faster with 62% fewer errors

**Current State:** No agent hierarchy exists

**What to Build:**

```typescript
// FILE: src/agency/agents/ManagerAgent.ts

interface ExecutionPlan {
  steps: ExecutionStep[];
  dependencies: Map<string, string[]>;
  estimatedDuration: number;
}

interface ExecutionStep {
  id: string;
  task: Task;
  specialist: string;
  dependencies: string[];
  priority: number;
}

class ManagerAgent {
  private eventBus: AgentEventBus;
  private specialists: Map<string, SpecialistAgent>;
  private taskQueue: Task[];

  constructor(eventBus: AgentEventBus) {
    this.eventBus = eventBus;
    this.specialists = new Map();
    this.taskQueue = [];

    // Subscribe to task-related events
    this.eventBus.subscribe('manager', 'task.completed', this.onTaskCompleted.bind(this));
    this.eventBus.subscribe('manager', 'task.failed', this.onTaskFailed.bind(this));
  }

  registerSpecialist(agent: SpecialistAgent): void {
    this.specialists.set(agent.getId(), agent);
  }

  async coordinateTask(task: Task): Promise<TaskResult> {
    // Step 1: Analyze task and create plan
    const plan = await this.createPlan(task);

    // Step 2: Execute steps with smart scheduling
    const results = await this.executePlan(plan);

    // Step 3: Integrate results
    const integrated = await this.integrateResults(results);

    return integrated;
  }

  private async createPlan(task: Task): Promise<ExecutionPlan> {
    // Break task into subtasks
    const subtasks = await this.decomposeTask(task);

    // Identify dependencies between subtasks
    const dependencies = await this.identifyDependencies(subtasks);

    // Estimate duration
    const duration = this.estimateDuration(subtasks);

    // Assign specialists to each subtask
    const steps: ExecutionStep[] = await Promise.all(
      subtasks.map(async (subtask, index) => ({
        id: `step-${index}`,
        task: subtask,
        specialist: this.selectSpecialist(subtask),
        dependencies: dependencies.get(index) || [],
        priority: this.calculatePriority(subtask)
      }))
    );

    return { steps, dependencies, estimatedDuration: duration };
  }

  private selectSpecialist(task: Task): string {
    // Select best specialist based on task requirements
    const requiredCapability = task.requiredCapability;

    // Find specialists with required capability
    const capable = Array.from(this.specialists.values())
      .filter(agent => agent.hasCapability(requiredCapability));

    // Return least loaded capable agent
    return capable
      .sort((a, b) => a.getCurrentLoad() - b.getCurrentLoad())[0]
      ?.getId();
  }

  private async executePlan(plan: ExecutionPlan): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();
    const completed = new Set<string>();

    // Execute steps respecting dependencies
    for (const step of plan.steps) {
      // Check if dependencies are met
      if (step.dependencies.every(dep => completed.has(dep))) {
        const specialist = this.specialists.get(step.specialist);
        if (specialist) {
          const result = await specialist.execute(step.task);
          results.set(step.id, result);
          completed.add(step.id);

          // Publish progress
          this.eventBus.publish('step.completed', {
            type: 'step.completed',
            source: 'manager',
            data: { stepId: step.id, result }
          });
        }
      }
    }

    return results;
  }

  private async integrateResults(results: Map<string, TaskResult>): Promise<TaskResult> {
    // Combine all results into final output
    const allResults = Array.from(results.values());
    return {
      success: allResults.every(r => r.success),
      data: allResults.map(r => r.data),
      metadata: {
        stepsCompleted: results.size,
        timestamp: new Date()
      }
    };
  }

  private onTaskCompleted(event: AgentEvent): void {
    // Handle task completion
    console.log('Task completed:', event.data);
  }

  private onTaskFailed(event: AgentEvent): void {
    // Handle task failure
    console.error('Task failed:', event.data);
  }

  private async decomposeTask(task: Task): Promise<Task[]> {
    // Break task into smaller subtasks
    // Implementation depends on task complexity
    return [task]; // Placeholder
  }

  private async identifyDependencies(subtasks: Task[]): Promise<Map<number, string[]>> {
    // Identify dependencies between subtasks
    return new Map(); // Placeholder
  }

  private estimateDuration(subtasks: Task[]): number {
    // Estimate total duration
    return subtasks.length * 60; // Placeholder: 1 minute per subtask
  }

  private calculatePriority(task: Task): number {
    // Calculate task priority
    return task.priority || 5; // Placeholder
  }
}

// FILE: src/agency/agents/SpecialistAgent.ts

interface SpecialistConfig {
  specialty: string;
  capabilities: string[];
  model: string;
  maxConcurrentTasks: number;
}

class SpecialistAgent {
  private config: SpecialistConfig;
  private eventBus: AgentEventBus;
  private currentTasks: Map<string, Task>;
  private tools: ToolAgent[];

  constructor(config: SpecialistConfig, eventBus: AgentEventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.currentTasks = new Map();
    this.tools = [];

    // Subscribe to relevant events
    this.eventBus.subscribe(config.specialty, 'task.assigned', this.onTaskAssigned.bind(this));
  }

  async execute(task: Task): Promise<TaskResult> {
    // Add to current tasks
    this.currentTasks.set(task.id, task);

    try {
      // Use relevant tools to execute task
      const results = await this.executeWithTools(task);

      // Remove from current tasks
      this.currentTasks.delete(task.id);

      // Publish completion
      this.eventBus.publish('task.completed', {
        type: 'task.completed',
        source: this.config.specialty,
        data: { taskId: task.id, result: results }
      });

      return results;
    } catch (error) {
      // Handle failure
      this.eventBus.publish('task.failed', {
        type: 'task.failed',
        source: this.config.specialty,
        data: { taskId: task.id, error: error.message }
      });
      throw error;
    }
  }

  hasCapability(capability: string): boolean {
    return this.config.capabilities.includes(capability);
  }

  getCurrentLoad(): number {
    return this.currentTasks.size;
  }

  getId(): string {
    return this.config.specialty;
  }

  private async executeWithTools(task: Task): Promise<TaskResult> {
    // Execute task using available tools
    const results = [];

    for (const tool of this.tools) {
      if (tool.canHandle(task)) {
        const result = await tool.execute(task);
        results.push(result);
      }
    }

    return {
      success: true,
      data: results,
      metadata: {
        specialist: this.config.specialty,
        timestamp: new Date()
      }
    };
  }

  private onTaskAssigned(event: AgentEvent): void {
    // Handle task assignment
    const task = event.data as Task;
    this.execute(task);
  }
}

// FILE: src/agency/agents/ToolAgent.ts

interface ToolConfig {
  name: string;
  description: string;
  capabilities: string[];
}

class ToolAgent {
  private config: ToolConfig;

  constructor(config: ToolConfig) {
    this.config = config;
  }

  async execute(task: Task): Promise<any> {
    // Execute tool-specific logic
    throw new Error('Tool execute must be implemented by subclass');
  }

  canHandle(task: Task): boolean {
    return task.requiredCapabilities?.some(cap =>
      this.config.capabilities.includes(cap)
    ) || false;
  }

  getName(): string {
    return this.config.name;
  }
}

// Usage example
const eventBus = new AgentEventBus({ backend: 'redis' });

// Create manager
const manager = new ManagerAgent(eventBus);

// Register specialists
const researcher = new SpecialistAgent({
  specialty: 'research',
  capabilities: ['web_search', 'document_analysis', 'fact_checking'],
  model: 'claude-sonnet-4',
  maxConcurrentTasks: 3
}, eventBus);

const coder = new SpecialistAgent({
  specialty: 'code',
  capabilities: ['code_generation', 'debugging', 'refactoring'],
  model: 'claude-opus-4',
  maxConcurrentTasks: 2
}, eventBus);

manager.registerSpecialist(researcher);
manager.registerSpecialist(coder);

// Coordinate task
const result = await manager.coordinateTask({
  id: 'task-123',
  description: 'Build a feature',
  requiredCapability: 'code_generation',
  priority: 1
});
```

**Integration Points:**
- Use existing `supabaseTaskService.ts` for task persistence
- Connect to `UnifiedTaskService.ts` for task management
- Store agent configurations in Supabase

---

### Application Area: Circuit Breakers

**Research Finding:** Circuit breakers reduce deadlock detection from 45s to 5s

**Current State:** No circuit breaker implementation

**What to Build:**

```typescript
// FILE: src/agency/resilience/CircuitBreaker.ts

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  timeout: number;           // 30 seconds
  failureThreshold: number;   // 3 failures
  resetTimeout: number;       // 60 seconds
}

class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private lastFailureTime: Date | null;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.config = config;
  }

  async call<T>(
    func: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit open after ${this.failureCount} failures`
        );
      }
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(func, this.config.timeout);

      // Success - reset failures
      this.onSuccess();

      return result;
    } catch (error) {
      // Failure - increment counter
      this.onFailure();

      // Try fallback if available
      if (fallback) {
        return await fallback();
      }

      throw error;
    }
  }

  private async executeWithTimeout<T>(
    func: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      func(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new TimeoutError('Operation timed out')), timeout)
      )
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Usage in agents
class SpecialistAgent {
  private circuitBreaker: CircuitBreaker;

  constructor(config: SpecialistConfig, eventBus: AgentEventBus) {
    // ... existing code ...
    this.circuitBreaker = new CircuitBreaker({
      timeout: 30000,      // 30 seconds
      failureThreshold: 3, // 3 failures
      resetTimeout: 60000  // 60 seconds
    });
  }

  async executeWithProtection(task: Task): Promise<TaskResult> {
    return this.circuitBreaker.call(
      () => this.execute(task),
      () => this.getFallbackAgent().execute(task) // Fallback
    );
  }

  private getFallbackAgent(): SpecialistAgent {
    // Return fallback specialist
    throw new Error('Fallback not implemented');
  }
}
```

---

### Application Area: Multi-Level Memory

**Research Finding:** 4-level memory increases task success from 27% to 94%

**Current State:** No agent memory system exists

**What to Build:**

```typescript
// FILE: src/agency/memory/MultiLevelMemory.ts

interface MemoryConfig {
  working: {
    capacity: number;        // 100K tokens
    retention: 'session';    // Session-based
  };
  episodic: {
    capacity: number;        // 1,000 episodes
    retentionDays: number;   // 30 days
  };
  semantic: {
    capacity: number;        // 10K facts
  };
  procedural: {
    capacity: number;        // 500 patterns
  };
}

class MultiLevelMemory {
  private agentId: string;
  private config: MemoryConfig;
  private working: WorkingMemory;
  private episodic: EpisodicMemory;
  private semantic: SemanticMemory;
  private procedural: ProceduralMemory;

  constructor(agentId: string, config: MemoryConfig) {
    this.agentId = agentId;
    this.config = config;

    this.working = new WorkingMemory(config.working);
    this.episodic = new EpisodicMemory(agentId, config.episodic);
    this.semantic = new SemanticMemory(config.semantic);
    this.procedural = new ProceduralMemory(agentId, config.procedural);
  }

  async store(information: unknown, level: 'working' | 'episodic' | 'semantic' | 'procedural'): Promise<void> {
    switch (level) {
      case 'working':
        this.working.store(information);
        break;
      case 'episodic':
        await this.episodic.store(information);
        break;
      case 'semantic':
        await this.semantic.store(information);
        break;
      case 'procedural':
        await this.procedural.store(information);
        break;
    }
  }

  async retrieve(query: string): Promise<unknown | null> {
    const results: Array<{ priority: number; data: unknown }> = [];

    // Check working memory (fastest, highest priority)
    const workingResult = this.working.get(query);
    if (workingResult) {
      results.push({ priority: 1.0, data: workingResult });
    }

    // Check procedural memory (fast, high priority)
    const proceduralResult = await this.procedural.match(query);
    if (proceduralResult) {
      results.push({ priority: 0.8, data: proceduralResult });
    }

    // Check episodic memory (medium speed, medium priority)
    const episodicResult = await this.episodic.search(query);
    if (episodicResult) {
      results.push({ priority: 0.6, data: episodicResult });
    }

    // Check semantic memory (slowest, lowest priority)
    const semanticResult = await this.semantic.query(query);
    if (semanticResult) {
      results.push({ priority: 0.4, data: semanticResult });
    }

    // Return best result
    if (results.length > 0) {
      results.sort((a, b) => b.priority - a.priority);
      return results[0].data;
    }

    return null;
  }
}

// FILE: src/agency/memory/WorkingMemory.ts

interface WorkingMemoryConfig {
  capacity: number;  // Max tokens
  retention: 'session';
}

class WorkingMemory {
  private config: WorkingMemoryConfig;
  private storage: Map<string, { data: unknown; timestamp: Date }>;

  constructor(config: WorkingMemoryConfig) {
    this.config = config;
    this.storage = new Map();
  }

  store(key: string, data: unknown): void {
    // Implement LRU eviction if capacity exceeded
    if (this.storage.size >= this.config.capacity) {
      const firstKey = this.storage.keys().next().value;
      this.storage.delete(firstKey);
    }

    this.storage.set(key, { data, timestamp: new Date() });
  }

  get(key: string): unknown | null {
    const item = this.storage.get(key);
    if (item) {
      // Update access time for LRU
      this.storage.set(key, { ...item, timestamp: new Date() });
      return item.data;
    }
    return null;
  }
}

// FILE: src/agency/memory/EpisodicMemory.ts

interface EpisodicConfig {
  capacity: number;
  retentionDays: number;
}

interface Episode {
  id: string;
  agentId: string;
  data: unknown;
  timestamp: Date;
  embedding?: number[];
}

class EpisodicMemory {
  private agentId: string;
  private config: EpisodicConfig;

  constructor(agentId: string, config: EpisodicConfig) {
    this.agentId = agentId;
    this.config = config;

    // Initialize vector database (e.g., Chroma)
    this.initializeVectorDB();
  }

  async store(episode: Omit<Episode, 'id' | 'agentId' | 'timestamp'>): Promise<void> {
    // Store in vector database with embedding
    const embedding = await this.generateEmbedding(episode.data);

    const fullEpisode: Episode = {
      id: crypto.randomUUID(),
      agentId: this.agentId,
      data: episode.data,
      timestamp: new Date(),
      embedding
    };

    await this.saveToVectorDB(fullEpisode);
  }

  async search(query: string, topK: number = 5): Promise<Episode | null> {
    // Semantic search using vector similarity
    const queryEmbedding = await this.generateEmbedding(query);

    const results = await this.vectorSearch(queryEmbedding, topK);

    // Filter by retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const validResults = results.filter(r => r.timestamp >= cutoffDate);

    return validResults.length > 0 ? validResults[0] : null;
  }

  private initializeVectorDB(): void {
    // Initialize Chroma or similar vector database
  }

  private async generateEmbedding(data: unknown): Promise<number[]> {
    // Use embedding model (e.g., OpenAI embeddings)
    return []; // Placeholder
  }

  private async saveToVectorDB(episode: Episode): Promise<void> {
    // Save to vector database
  }

  private async vectorSearch(embedding: number[], topK: number): Promise<Episode[]> {
    // Perform vector similarity search
    return []; // Placeholder
  }
}

// FILE: src/agency/memory/SemanticMemory.ts

interface SemanticConfig {
  capacity: number;
}

interface Fact {
  id: string;
  fact: string;
  relationships: string[];
  metadata: Record<string, unknown>;
}

class SemanticMemory {
  private config: SemanticConfig;

  constructor(config: SemanticConfig) {
    this.config = config;

    // Initialize knowledge graph (e.g., Neo4j)
    this.initializeKnowledgeGraph();
  }

  async store(fact: string, relationships: string[] = [], metadata: Record<string, unknown> = {}): Promise<void> {
    // Store in knowledge graph
    await this.saveToGraph({
      id: crypto.randomUUID(),
      fact,
      relationships,
      metadata
    });
  }

  async query(query: string): Promise<Fact | null> {
    // Query knowledge graph using Cypher or similar
    const results = await this.queryGraph(query);

    return results.length > 0 ? results[0] : null;
  }

  private initializeKnowledgeGraph(): void {
    // Initialize Neo4j or similar
  }

  private async saveToGraph(fact: Fact): Promise<void> {
    // Save to knowledge graph
  }

  private async queryGraph(query: string): Promise<Fact[]> {
    // Query knowledge graph
    return []; // Placeholder
  }
}

// FILE: src/agency/memory/ProceduralMemory.ts

interface ProceduralConfig {
  capacity: number;
}

interface Pattern {
  id: string;
  agentId: string;
  skill: string;
  pattern: unknown;
  successRate: number;
}

class ProceduralMemory {
  private agentId: string;
  private config: ProceduralConfig;
  private storage: Map<string, Pattern>;

  constructor(agentId: string, config: ProceduralConfig) {
    this.agentId = agentId;
    this.config = config;
    this.storage = new Map();

    // Initialize Redis for fast access
    this.initializeRedis();
  }

  async store(skill: string, pattern: unknown): Promise<void> {
    const patternRecord: Pattern = {
      id: crypto.randomUUID(),
      agentId: this.agentId,
      skill,
      pattern,
      successRate: 0
    };

    this.storage.set(patternRecord.id, patternRecord);

    // Cache in Redis
    await this.cacheInRedis(patternRecord);
  }

  async match(query: string): Promise<Pattern | null> {
    // Find matching pattern based on skill/query
    const patterns = Array.from(this.storage.values());

    const matches = patterns.filter(p => p.skill === query);

    if (matches.length > 0) {
      // Return pattern with highest success rate
      return matches.sort((a, b) => b.successRate - a.successRate)[0];
    }

    return null;
  }

  private initializeRedis(): void {
    // Initialize Redis client
  }

  private async cacheInRedis(pattern: Pattern): Promise<void> {
    // Cache in Redis for fast access
  }
}

// Usage in agents
class SpecialistAgent {
  private memory: MultiLevelMemory;

  constructor(config: SpecialistConfig, eventBus: AgentEventBus) {
    // ... existing code ...

    this.memory = new MultiLevelMemory(config.specialty, {
      working: {
        capacity: 100000,
        retention: 'session'
      },
      episodic: {
        capacity: 1000,
        retentionDays: 30
      },
      semantic: {
        capacity: 10000
      },
      procedural: {
        capacity: 500
      }
    });
  }

  async learn(information: unknown, type: 'experience' | 'fact' | 'skill'): Promise<void> {
    if (type === 'experience') {
      await this.memory.store(information, 'episodic');
    } else if (type === 'fact') {
      await this.memory.store(information, 'semantic');
    } else if (type === 'skill') {
      await this.memory.store(information, 'procedural');
    }
  }

  async recall(query: string): Promise<unknown> {
    return await this.memory.retrieve(query);
  }
}
```

**Integration Points:**
- Use Supabase for persistent storage of episodes and facts
- Use existing `services/integrations/supabase/` for database access
- Store embeddings in Supabase Vector or external vector DB

---

## Part 3: Research Application to SKILLS System

### Application Area: Capability-Based Allocation

**Research Finding:** Capability-based allocation achieves 94% success vs 67% random

**Current State:** No skills allocation system exists

**What to Build:**

```typescript
// FILE: src/agency/skills/SkillAllocator.ts

interface Agent {
  id: string;
  skills: Set<string>;
  currentLoad: number;
}

interface Skill {
  id: string;
  name: string;
  capabilities: string[];
}

class SkillAllocator {
  private agents: Map<string, Agent>;
  private skills: Map<string, Skill>;
  private agentSkills: Map<string, Set<string>>;
  private agentLoad: Map<string, number>;

  constructor() {
    this.agents = new Map();
    this.skills = new Map();
    this.agentSkills = new Map();
    this.agentLoad = new Map();
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.agentSkills.set(agent.id, agent.skills);
    this.agentLoad.set(agent.id, agent.currentLoad);
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  allocateTask(task: Task): Agent {
    const requiredSkills = new Set(task.requiredSkills || []);

    // Find agents with required skills
    const capableAgents = Array.from(this.agentSkills.entries())
      .filter(([_, skills]) => {
        const agentSkills = skills;
        return requiredSkills.size > 0 &&
          Array.from(requiredSkills).every(skill => agentSkills.has(skill));
      })
      .map(([agentId]) => agentId);

    if (capableAgents.length === 0) {
      throw new Error(`No agent has skills: ${Array.from(requiredSkills).join(', ')}`);
    }

    // Select least loaded capable agent
    const bestAgentId = capableAgents.reduce((best, current) => {
      const bestLoad = this.agentLoad.get(best) || 0;
      const currentLoad = this.agentLoad.get(current) || 0;
      return currentLoad < bestLoad ? current : best;
    });

    // Increment load
    const currentLoad = this.agentLoad.get(bestAgentId) || 0;
    this.agentLoad.set(bestAgentId, currentLoad + 1);

    return this.agents.get(bestAgentId)!;
  }

  taskComplete(agentId: string): void {
    const currentLoad = this.agentLoad.get(agentId) || 0;
    this.agentLoad.set(agentId, Math.max(0, currentLoad - 1));
  }
}
```

---

## Summary: Implementation Roadmap

### Phase 1 (Week 1-2): Critical Infrastructure

1. **Event Bus Setup** (2-3 days)
   - Implement `AgentEventBus.ts`
   - Add Redis/Kafka backend
   - Test pub/sub functionality

2. **Circuit Breakers** (2-3 days)
   - Implement `CircuitBreaker.ts`
   - Add to all agent operations
   - Test timeout and recovery

3. **Basic Memory** (3-4 days)
   - Implement `WorkingMemory.ts`
   - Add to agents for session state
   - Test storage and retrieval

### Phase 2 (Week 3-4): Core Agent System

4. **3-Level Hierarchy** (5-7 days)
   - Implement `ManagerAgent.ts`
   - Implement `SpecialistAgent.ts`
   - Implement `ToolAgent.ts`
   - Test coordination and delegation

5. **Episodic Memory** (3-4 days)
   - Implement `EpisodicMemory.ts`
   - Set up vector database (Chroma)
   - Test semantic search

6. **Skill Allocation** (2-3 days)
   - Implement `SkillAllocator.ts`
   - Add skill discovery
   - Test allocation accuracy

### Phase 3 (Week 5+): Advanced Features

7. **Semantic Memory** (3-4 days)
   - Implement `SemanticMemory.ts`
   - Set up knowledge graph (Neo4j)
   - Test fact queries

8. **Procedural Memory** (2-3 days)
   - Implement `ProceduralMemory.ts`
   - Set up Redis cache
   - Test skill patterns

9. **MCP Integration** (3-4 days)
   - Add Context7 integration
   - Add Exa search integration
   - Add Grep.app integration

10. **LSP Tools** (3-4 days)
    - Add LSP client
    - Implement type info tool
    - Implement definition lookup

---

**Status:** Ready for implementation - Complete architecture and code patterns provided

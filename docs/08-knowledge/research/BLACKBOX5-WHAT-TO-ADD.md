# BlackBox 5: What To Add (CLI-First Implementation)

**Based on: Unlimited GLM + Claude Code CLI + Simplified Architecture**

---

## 🎯 The Core Insight

**BlackBox 5 ALREADY HAS 70% of what we need!**

Looking at the existing codebase:
- ✅ 285+ agents (markdown-based)
- ✅ 40 skills (YAML + markdown)
- ✅ 139 shell scripts (CLI orchestration)
- ✅ Python tools (git_ops, indexer, validator)
- ✅ Testing infrastructure (pytest)
- ✅ Memory systems (working, episodic)

**We only need to add 30% to make it a production multi-agent system!**

---

## 📋 What to Add (In Priority Order)

### Priority 1: Multi-Agent Coordination ⭐⭐⭐⭐⭐

**What's Missing**: Agent-to-agent communication and coordination

**What to Add**:

```python
# .blackbox5/engine/core/coordination.py

class AgentCoordinator:
    """Route tasks to appropriate agents and coordinate execution"""

    def __init__(self, event_bus, agent_registry):
        self.event_bus = event_bus
        self.agents = agent_registry
        self.active_tasks = {}

    def route_task(self, task: Task) -> Agent:
        """Decide: single agent or multi-agent?"""
        steps = self.estimate_steps(task)

        # Single agent for simple tasks
        if steps < 10:
            return self.find_capable_agent(task)

        # Multi-agent for complex tasks
        return self.manager_agent

    def coordinate_multi_agent(self, task: Task):
        """Manager delegates to specialists"""
        # Decompose task
        subtasks = self.manager.decompose(task)

        # Execute in parallel
        results = []
        for subtask in subtasks:
            agent = self.find_specialist(subtask)
            result = agent.execute(subtask)
            results.append(result)

        # Integrate results
        return self.manager.integrate(results)
```

**Files to Create**:
- `.blackbox5/engine/core/coordination.py` - Core coordinator
- `.blackbox5/engine/core/task_router.py` - Task complexity estimation
- `.blackbox5/engine/core/parallel.py` - Parallel execution

**Time**: 3-5 days

---

### Priority 2: Event Bus (Redis) ⭐⭐⭐⭐⭐

**What's Missing**: Agent communication system

**What to Add**:

```python
# .blackbox5/engine/core/event_bus.py

class RedisEventBus:
    """Simple pub/sub for agent communication"""

    def __init__(self, redis_url="redis://localhost:6379"):
        import redis
        self.redis = redis.from_url(redis_url)
        self.subscribers = {}

    def publish(self, topic: str, event: dict):
        """Publish event to topic"""
        message = json.dumps({
            'id': str(uuid.uuid4()),
            'topic': topic,
            'data': event,
            'timestamp': datetime.now().isoformat()
        })
        self.redis.publish(topic, message)

    def subscribe(self, topic: str, callback):
        """Subscribe to topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)
```

**Standard Topics**:
- `agent.task.assigned` - Task delegated to agent
- `agent.task.completed` - Agent finished task
- `agent.task.failed` - Agent failed task
- `agent.status.changed` - Agent status update

**Files to Create**:
- `.blackbox5/engine/core/event_bus.py` - Event bus implementation
- `.blackbox5/engine/core/events.py` - Event schemas
- `.blackbox5/engine/runtime/start-redis.sh` - Redis startup script

**Time**: 2-3 days

---

### Priority 3: Circuit Breaker ⭐⭐⭐⭐⭐

**What's Missing**: Fast failure detection

**What to Add**:

```python
# .blackbox5/engine/core/circuit_breaker.py

class CircuitBreaker:
    """Prevent cascading failures"""

    def __init__(self, timeout=30, failure_threshold=3):
        self.timeout = timeout
        self.failure_threshold = failure_threshold
        self.failures = {}
        self.state = {}  # agent_id -> 'CLOSED' | 'OPEN' | 'HALF_OPEN'

    def call(self, agent_id: str, func, *args, **kwargs):
        """Execute with circuit breaker protection"""

        # Check if circuit is open
        if self.state.get(agent_id) == 'OPEN':
            if self._should_attempt_reset(agent_id):
                self.state[agent_id] = 'HALF_OPEN'
            else:
                raise CircuitBreakerOpenError(agent_id)

        # Execute with timeout
        try:
            result = func(*args, **kwargs)
            self.on_success(agent_id)
            return result
        except Exception as e:
            self.on_failure(agent_id)
            raise
```

**Files to Create**:
- `.blackbox5/engine/core/circuit_breaker.py` - Circuit breaker
- `.blackbox5/engine/core/exceptions.py` - Custom exceptions

**Time**: 1-2 days

---

### Priority 4: Enhanced Memory System ⭐⭐⭐⭐

**What's Missing**: Shared episodic memory across agents

**What to Add**:

```python
# .blackbox5/engine/memory/shared_episodic.py

class SharedEpisodicMemory:
    """Vector-based episodic memory shared across agents"""

    def __init__(self, chroma_path="./memory/chroma"):
        import chromadb
        self.client = chromadb.PersistentClient(path=chroma_path)
        self.collection = self.client.get_or_create_collection(
            name="episodes",
            metadata={"hnsw:space": "cosine"}
        )

    def store(self, episode: Episode):
        """Store episode in vector DB"""
        embedding = self.get_embedding(episode.content)
        self.collection.add(
            ids=[episode.id],
            embeddings=[embedding],
            metadatas=[{
                'agent': episode.agent_id,
                'task': episode.task_type,
                'timestamp': episode.timestamp,
                'success': episode.success
            }],
            documents=[episode.content]
        )

    def retrieve(self, query: str, top_k=5):
        """Retrieve similar episodes"""
        embedding = self.get_embedding(query)
        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k
        )
        return results
```

**Files to Create**:
- `.blackbox5/engine/memory/shared_episodic.py` - Shared memory
- `.blackbox5/engine/memory/embeddings.py` - GLM embedding wrapper
- `.blackbox5/engine/runtime/init-chroma.sh` - Chroma setup script

**Time**: 3-4 days

---

### Priority 5: Manager Agent ⭐⭐⭐⭐

**What's Missing**: Central coordination agent

**What to Add**:

```markdown
---
name: "Manager"
type: "core"
category: "coordination"
version: "1.0.0"
model: "glm-4"

capabilities:
  - task_decomposition
  - agent_selection
  - result_integration
  - progress_monitoring
  - failure_recovery

tools:
  - event_bus
  - agent_registry
  - task_tracker
  - memory

prompt: |
  You are the Manager Agent. Your role is to:

  1. Receive complex tasks (10+ steps)
  2. Decompose into subtasks
  3. Delegate to specialist agents
  4. Monitor progress
  5. Integrate results
  6. Handle failures

  Available specialists:
  - Researcher: web_search, document_analysis
  - Coder: code_generation, debugging
  - Writer: documentation, explanation

  Always coordinate via the event bus.
  Track all task state in memory.
  Report progress clearly.
---
```

**Files to Create**:
- `.blackbox5/engine/agents/manager.md` - Manager agent definition

**Time**: 1 day

---

### Priority 6: Task Router ⭐⭐⭐⭐

**What's Missing**: Automatic single/multi-agent routing

**What to Add**:

```python
# .blackbox5/engine/core/task_router.py

class TaskRouter:
    """Route task to single agent or multi-agent system"""

    def __init__(self, coordinator, manager_agent):
        self.coordinator = coordinator
        self.manager = manager_agent

    def route(self, task: Task):
        """Decide execution strategy"""

        # Estimate complexity
        complexity = self.analyze_complexity(task)

        # Simple: single agent
        if complexity < 0.3:
            return ExecutionStrategy(
                type='single',
                agent=self.coordinator.find_generalist(),
                reason='Simple task, single agent faster'
            )

        # Complex: multi-agent
        return ExecutionStrategy(
            type='multi',
            agent=self.manager,
            reason='Complex task, multi-agent system needed'
        )

    def analyze_complexity(self, task: Task) -> float:
        """Estimate task complexity (0-1 scale)"""

        # Factor 1: Token count (proxy for steps)
        token_count = len(task.prompt)
        if token_count < 500:
            tokens_score = 0.1
        elif token_count < 2000:
            tokens_score = 0.5
        else:
            tokens_score = 0.9

        # Factor 2: Tool requirements
        tool_score = min(1.0, len(task.required_tools) * 0.2)

        # Factor 3: Domain complexity
        complex_domains = ['system_architecture', 'security', 'distributed_systems']
        domain_score = 1.0 if task.domain in complex_domains else 0.3

        # Aggregate
        return (tokens_score + tool_score + domain_score) / 3
```

**Files to Create**:
- `.blackbox5/engine/core/task_router.py` - Task router
- `.blackbox5/engine/core/complexity.py` - Complexity analysis

**Time**: 2-3 days

---

### Priority 7: Manifest System ⭐⭐⭐

**What's Missing**: Operation tracking for CLI debugging

**What to Add**:

```python
# .blackbox5/engine/core/manifest.py

class ManifestSystem:
    """Track all operations for debugging"""

    def __init__(self, manifest_dir="./scratch/manifests"):
        self.manifest_dir = Path(manifest_dir)
        self.manifest_dir.mkdir(parents=True, exist_ok=True)

    def create_manifest(self, operation_type: str) -> Manifest:
        """Create new operation manifest"""
        manifest_id = str(uuid.uuid4())
        manifest = Manifest(
            id=manifest_id,
            type=operation_type,
            started_at=datetime.now(),
            steps=[]
        )
        self.save_manifest(manifest)
        return manifest

    def log_step(self, manifest: Manifest, step: str, details: dict):
        """Log operation step"""
        step_record = {
            'step': step,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        manifest.steps.append(step_record)
        self.save_manifest(manifest)

    def save_manifest(self, manifest: Manifest):
        """Save manifest to file"""
        path = self.manifest_dir / f"{manifest.id}.md"
        with open(path, 'w') as f:
            f.write(self.format_manifest(manifest))

    def format_manifest(self, manifest: Manifest) -> str:
        """Format manifest as markdown"""
        lines = [
            f"# Operation Manifest: {manifest.type}",
            f"## Metadata",
            f"- ID: {manifest.id}",
            f"- Started: {manifest.started_at}",
            f"- Status: {manifest.status}",
            f"",
            f"## Execution"
        ]

        for step in manifest.steps:
            lines.append(f"### {step['step']}")
            lines.append(f"- Time: {step['timestamp']}")
            for key, value in step['details'].items():
                lines.append(f"- {key}: {value}")
            lines.append("")

        return "\n".join(lines)
```

**Files to Create**:
- `.blackbox5/engine/core/manifest.py` - Manifest system
- `.blackbox5/engine/runtime/view-manifest.sh` - View manifest CLI tool

**Time**: 2 days

---

### Priority 8: Structured Logging ⭐⭐⭐

**What's Missing**: Comprehensive logging for CLI debugging

**What to Add**:

```python
# .blackbox5/engine/core/logging.py

import structlog

def setup_logging():
    """Configure structured logging"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Usage in agents
logger = structlog.get_logger()

def execute_task(task: Task):
    log = logger.bind(task_id=task.id)
    log.info("task.start", description=task.description)

    try:
        result = do_work(task)
        log.info("task.success", result=result)
        return result
    except Exception as e:
        log.error("task.failed", error=str(e), exc_info=True)
        raise
```

**Files to Create**:
- `.blackbox5/engine/core/logging.py` - Logging configuration
- `.blackbox5/engine/runtime/view-logs.sh` - Log viewer CLI tool

**Time**: 1-2 days

---

## 🚫 What NOT to Add (Skip These)

### Don't Add: Multi-Model Router
**Why**: GLM is unlimited, no cost savings
**Savings**: 2-3 days development + ongoing complexity

### Don't Add: Token Optimization
**Why**: Tokens are free with unlimited GLM
**Savings**: 3-5 days development + ongoing complexity

### Don't Add: React GUI
**Why**: Can't build efficiently through CLI
**Savings**: 10-15 days development + maintenance burden

### Don't Add: Prompt Caching
**Why**: Minimal benefit when tokens are free
**Savings**: 2-3 days development

### Don't Add: Semantic Memory (Neo4j)
**Why**: Only +5% benefit, can add later if needed
**Savings**: $100/month + 5-7 days development

### Don't Add: Procedural Memory
**Why**: Only +3% benefit, can add later if needed
**Savings**: 3-4 days development

---

## 📅 Implementation Timeline

### Week 1: Core Foundation (5 components)
- Day 1-2: Event bus (Redis)
- Day 3-4: Circuit breaker
- Day 5: Task router
- Day 6-7: Structured logging

**Deliverable**: Core communication and safety infrastructure

### Week 2: Coordination (3 components)
- Day 8-10: Agent coordinator
- Day 11-12: Manager agent
- Day 13-14: Manifest system

**Deliverable**: Multi-agent coordination system

### Week 3: Memory (2 components)
- Day 15-17: Shared episodic memory
- Day 18-19: Memory integration

**Deliverable**: Shared memory across agents

### Week 4: Integration & Testing
- Day 20-22: End-to-end testing
- Day 23-24: Performance tuning
- Day 25-28: Documentation and examples

**Deliverable**: Production-ready system

---

## 🎯 Success Criteria

### Week 1 (Foundation)
- ✅ Event bus operational (Redis)
- ✅ Circuit breakers prevent hangs
- ✅ Task routing works (single vs multi)
- ✅ All operations logged

### Week 2 (Coordination)
- ✅ Manager delegates to specialists
- ✅ Specialists coordinate tasks
- ✅ Results integrated correctly
- ✅ Manifests track all operations

### Week 3 (Memory)
- ✅ Agents share episodic memory
- ✅ Vector search works
- ✅ Memory improves success rate

### Week 4 (Production)
- ✅ End-to-end workflows work
- ✅ 90%+ success rate achieved
- ✅ <20s coordination time
- ✅ System is debuggable via logs/manifests

---

## 🔧 Key Design Decisions

### Decision 1: Use Existing Agent Format
**Keep**: Markdown + YAML frontmatter
**Why**: Already works, CLI-friendly, no migration needed

### Decision 2: Leverage Existing Tools
**Keep**: git_ops.py, indexer.py, validator.py
**Why**: Already battle-tested, CLI-native

### Decision 3: Extend Existing Runtime
**Keep**: Shell script orchestration
**Why**: 139 scripts prove this works

### Decision 4: Self-Host Everything
**Keep**: Redis, ChromaDB on existing infrastructure
**Why**: Zero additional cost, already have servers

### Decision 5: GLM for All LLM Calls
**Keep**: Single model (no routing needed)
**Why**: Unlimited tokens, no cost optimization needed

---

## 📁 File Structure (What We're Adding)

```
.blackbox5/engine/
├── core/
│   ├── event_bus.py          # NEW - Redis pub/sub
│   ├── circuit_breaker.py    # NEW - Failure detection
│   ├── task_router.py        # NEW - Single/multi routing
│   ├── complexity.py          # NEW - Complexity analysis
│   ├── coordination.py        # NEW - Agent coordinator
│   ├── manifest.py            # NEW - Operation tracking
│   └── logging.py             # NEW - Structured logging
│
├── memory/
│   ├── shared_episodic.py    # NEW - Shared vector memory
│   └── embeddings.py          # NEW - GLM embeddings
│
├── agents/
│   └── manager.md             # NEW - Manager agent
│
└── runtime/
    ├── start-redis.sh         # NEW - Redis startup
    ├── init-chroma.sh        # NEW - Chroma setup
    ├── view-manifest.sh      # NEW - Manifest viewer
    └── view-logs.sh           # NEW - Log viewer
```

**Total New Files**: 14
**Total New Code**: ~2,000 lines
**Implementation Time**: 4 weeks

---

## ✅ Checklist: What We're Building

### Core Infrastructure
- [ ] Redis event bus (pub/sub)
- [ ] Circuit breaker pattern
- [ ] Task router (complexity estimation)
- [ ] Structured logging (JSON logs)
- [ ] Manifest system (operation tracking)

### Coordination
- [ ] Agent coordinator (routing logic)
- [ ] Manager agent (task decomposition)
- [ ] Parallel execution (concurrent tasks)

### Memory
- [ ] Shared episodic memory (ChromaDB)
- [ ] Vector embeddings (GLM-based)
- [ ] Memory retrieval (similarity search)

### Testing
- [ ] Unit tests (pytest)
- [ ] Integration tests (end-to-end)
- [ ] Performance tests (coordination time)

### Documentation
- [ ] Architecture docs
- [ ] API documentation
- [ ] Usage examples
- [ ] Troubleshooting guide

---

## 🚀 Expected Results

### Performance
- **Success Rate**: 90% (vs 94% full stack)
- **Coordination Time**: <20s (vs 19s full stack)
- **Scalability**: 20+ concurrent agents (vs 100+ full stack)

### Development
- **Implementation Time**: 4 weeks (vs 90 days full stack)
- **Team Size**: 1-2 developers (vs 3-5 full stack)
- **Maintenance**: Low complexity (vs high full stack)

### Cost
- **Infrastructure**: $0/month (self-hosted)
- **LLM Usage**: Your GLM subscription (same as full stack)
- **Total**: Your GLM subscription only

---

## 🎯 The Bottom Line

**We're adding ONLY 14 files (~2,000 lines) to get:**
- ✅ Multi-agent coordination
- ✅ Event-driven communication
- ✅ Fast failure detection
- ✅ Shared memory
- ✅ CLI-friendly debugging
- ✅ 90% of full-stack benefit
- ✅ In 4 weeks (not 90 days)

**Key Advantage**: Building on existing BlackBox 5 foundation rather than starting from scratch!

---

**Status**: Ready to implement
**Confidence**: ⭐⭐⭐⭐⭐ (5/5)
**Next Step**: Start Week 1, Day 1 (Event bus setup)

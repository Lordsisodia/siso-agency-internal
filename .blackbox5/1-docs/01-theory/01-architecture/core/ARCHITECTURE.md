# BlackBox5 System Architecture

**Version:** 5.0.0
**Last Updated:** 2026-01-18
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Interactions](#component-interactions)
4. [Data Flow](#data-flow)
5. [Integration Points](#integration-points)
6. [Technology Stack](#technology-stack)
7. [Design Patterns](#design-patterns)
8. [Scalability & Performance](#scalability--performance)

---

## System Overview

BlackBox5 is a **multi-agent AI orchestration system** that combines:
- **12+ specialized agents** for different domains
- **4-layer memory system** (working, episodic, semantic, procedural)
- **Event-driven architecture** for agent communication
- **Complexity-based routing** for optimal execution
- **External integrations** (GitHub, Vibe Kanban, MCP)

### Key Design Principles

1. **Separation of Concerns:** Each component has a single, well-defined responsibility
2. **Event-Driven:** Components communicate via events (loose coupling)
3. **Fault Tolerance:** Circuit breakers and error recovery at every layer
4. **Scalability:** Horizontal scaling via Redis and distributed agents
5. **Methodology Agnostic:** Supports BMAD, GSD, and custom workflows

---

## Architecture Diagram

### High-Level System View

```mermaid
graph TB
    subgraph "Client Layer"
        CLI[CLI Tools]
        API[REST API]
        WS[WebSocket]
    end

    subgraph "Core Layer"
        Router[Task Router]
        Coord[Multi-Agent Coordinator]
        CB[Circuit Breaker]
        EventBus[Event Bus]
        Config[Config Manager]
        Manifest[Manifest System]
    end

    subgraph "Agent Layer"
        Manager[Manager Agent]
        CoreAgents[Core Agents]
        BMADAgents[BMAD Agents]
        Specialists[Specialist Agents]
        Skills[Skill Library]
    end

    subgraph "Memory Layer"
        Working[Working Memory]
        Episodic[Episodic Memory]
        Semantic[Semantic Memory]
        Procedural[Procedural Memory]
    end

    subgraph "Brain Layer"
        Vector[Vector Search]
        Graph[Graph Query]
        NLParser[NL Parser]
        BrainAPI[Brain API]
    end

    subgraph "Integration Layer"
        GitHub[GitHub Integration]
        Vibe[Vibe Kanban]
        MCP[MCP Integration]
    end

    subgraph "Infrastructure Layer"
        Redis[(Redis)]
        Chroma[(ChromaDB)]
        Neo4j[(Neo4j)]
        Claude[Anthropic API]
    end

    %% Connections
    CLI --> Router
    API --> Router
    WS --> EventBus

    Router --> Coord
    Router --> CoreAgents
    Coord --> Manager
    Coord --> CB

    Manager --> BMADAgents
    Manager --> Specialists
    BMADAgents --> Skills
    Specialists --> Skills

    CoreAgents --> Working
    BMADAgents --> Episodic
    Specialists --> Semantic
    AllAgents --> Procedural

    Working --> BrainAPI
    Episodic --> Vector
    Semantic --> Graph
    Procedural --> Redis

    Vector --> BrainAPI
    Graph --> BrainAPI
    NLParser --> BrainAPI

    EventBus --> GitHub
    EventBus --> Vibe
    Skills --> MCP

    EventBus --> Redis
    Procedural --> Redis
    Vector --> Chroma
    Graph --> Neo4j
    AllAgents --> Claude

    %% Styling
    classDef client fill:#e1f5fe
    classDef core fill:#fff3e0
    classDef agent fill:#f3e5f5
    classDef memory fill:#e8f5e9
    classDef brain fill:#fce4ec
    classDef integration fill:#fff9c4
    classDef infra fill:#efebe9

    class CLI,API,WS client
    class Router,Coord,CB,EventBus,Config,Manifest core
    class Manager,CoreAgents,BMADAgents,Specialists,Skills agent
    class Working,Episodic,Semantic,Procedural memory
    class Vector,Graph,NLParser,BrainAPI brain
    class GitHub,Vibe,MCP integration
    class Redis,Chroma,Neo4j,Claude infra
```

### Component Hierarchy

```
BlackBox5 System
├── Core Systems
│   ├── Kernel (boot, lifecycle)
│   ├── Event Bus (Redis pub/sub)
│   ├── Task Router (complexity-based routing)
│   ├── Circuit Breaker (fault tolerance)
│   ├── Config Manager (multi-strategy loading)
│   └── Manifest System (operation tracking)
│
├── Agent Layer
│   ├── Agent Loader (discovery, loading)
│   ├── Skill Manager (skill registry)
│   ├── Manager Agent (coordination)
│   ├── Core Agents (orchestrator, executor)
│   ├── BMAD Agents (Mary, Winston, Arthur, John, TEA)
│   ├── Specialist Agents (research, code, writing, etc.)
│   └── Skill Library (100+ reusable skills)
│
├── Memory Systems
│   ├── Working Memory (session context, 100K tokens)
│   ├── Episodic Memory (ChromaDB vector storage)
│   ├── Semantic Memory (Neo4j knowledge graph)
│   ├── Procedural Memory (Redis skill patterns)
│   └── Memory Consolidation (auto-consolidation)
│
├── Brain System
│   ├── Vector Search (ChromaDB similarity)
│   ├── Graph Query (Neo4j traversal)
│   ├── NL Parser (natural language queries)
│   └── Brain API (unified interface)
│
├── Integration Layer
│   ├── GitHub (issues, PRs, comments)
│   ├── Vibe Kanban (cards, columns)
│   └── MCP (external tools)
│
└── Runtime
    ├── CLI Tools (status, logs, manifests)
    ├── API Server (FastAPI REST)
    ├── WebSocket (real-time events)
    └── Health Monitoring (system checks)
```

---

## Component Interactions

### 1. Task Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Router
    participant Coordinator
    participant Manager
    participant Specialists
    participant Memory
    participant EventBus
    participant Integrations

    User->>API: Submit Task
    API->>Router: Route(task)
    Router->>Router: Analyze complexity

    alt Simple Task
        Router->>API: Return single agent
        API->>Specialists: Execute(task)
        Specialists->>Memory: Store context
        Specialists->>EventBus: Publish completion
        Specialists->>API: Return result
    else Complex Task
        Router->>Coordinator: Execute(task)
        Coordinator->>Manager: Decompose task
        Manager->>Manager: Create subtasks

        loop For each subtask
            Coordinator->>Specialists: Delegate subtask
            Specialists->>Memory: Access memory
            Specialists->>EventBus: Publish progress
            Specialists->>Coordinator: Return result
        end

        Coordinator->>Manager: Integrate results
        Manager->>Coordinator: Final result
        Coordinator->>EventBus: Publish completion
        Coordinator->>API: Return result
    end

    EventBus->>Integrations: Sync status
    API->>User: Return result
```

### 2. Memory Access Flow

```mermaid
sequenceDiagram
    participant Agent
    participant Working
    participant Episodic
    participant Semantic
    participant Procedural
    participant BrainAPI

    Agent->>Working: Check working memory
    Working-->>Agent: Context found (or not)

    Agent->>BrainAPI: Query("relevant information")
    BrainAPI->>Episodic: Vector search
    Episodic-->>BrainAPI: Similar episodes

    BrainAPI->>Semantic: Graph traversal
    Semantic-->>BrainAPI: Related concepts

    BrainAPI->>Procedural: Skill patterns
    Procedural-->>BrainAPI: Best procedures

    BrainAPI-->>Agent: Unified results

    Agent->>Working: Store new context
    Agent->>Episodic: Store episode
    Agent->>Semantic: Update graph
    Agent->>Procedural: Update patterns
```

### 3. Event Flow

```mermaid
sequenceDiagram
    participant Publisher
    participant EventBus
    participant Subscriber1
    participant Subscriber2
    participant Integrations

    Publisher->>EventBus: Publish(topic, event)
    EventBus->>EventBus: Validate event
    EventBus->>EventBus: Serialize to JSON

    EventBus->>Subscriber1: Deliver event
    EventBus->>Subscriber2: Deliver event
    EventBus->>Integrations: Deliver event

    Subscriber1-->>EventBus: Acknowledgment
    Subscriber2-->>EventBus: Acknowledgment
    Integrations-->>EventBus: Acknowledgment

    EventBus-->>Publisher: Publish confirmed
```

### 4. Multi-Agent Coordination

```mermaid
graph TB
    Task[Complex Task] --> Manager
    Manager --> Decompose[Decomposition]
    Decompose --> Subtasks[Subtasks]

    Subtasks --> DepGraph[Dependency Graph]
    DepGraph --> Waves{Build Waves}

    Waves --> Wave1[Wave 1: Independent]
    Waves --> Wave2[Wave 2: Dependent on 1]
    Waves --> Wave3[Wave 3: Dependent on 2]

    Wave1 --> Parallel1[Parallel Execution]
    Parallel1 --> Specialist1[Specialist 1]
    Parallel1 --> Specialist2[Specialist 2]
    Parallel1 --> Specialist3[Specialist 3]

    Specialist1 --> Results1[Results]
    Specialist2 --> Results1
    Specialist3 --> Results1

    Results1 --> Wave2
    Wave2 --> Sequential[Sequential Execution]
    Sequential --> Specialist4[Specialist 4]
    Specialist4 --> Results2[Results]

    Results2 --> Wave3
    Wave3 --> Integration[Result Integration]
    Integration --> Final[Final Result]
```

---

## Data Flow

### Request Flow

```mermaid
flowchart TD
    Start([User Request]) --> API[REST API / WebSocket]
    API --> Validate[Validate Request]
    Validate --> Router[Task Router]

    Router --> Analyze[Analyze Complexity]
    Analyze --> Score{Complexity Score}

    Score -->|< 0.3| Simple[Simple Task]
    Score -->|0.3 - 0.6| Moderate[Moderate Task]
    Score -->|> 0.6| Complex[Complex Task]

    Simple --> SingleAgent[Single Agent]
    Moderate --> Specialist{Specialist?}
    Complex --> MultiAgent[Multi-Agent System]

    Specialist -->|Yes| SingleAgent
    Specialist -->|No| MultiAgent

    SingleAgent --> Execute1[Execute Task]
    Execute1 --> Memory1[Access Memory]
    Memory1 --> Tools[Use Tools/Skills]
    Tools --> Result1[Result]

    MultiAgent --> Coordinator[Coordinator]
    Coordinator --> Decompose[Decompose Task]
    Decompose --> Plan[Execution Plan]
    Plan --> Execute2[Execute Subtasks]
    Execute2 --> Monitor[Monitor Progress]
    Monitor --> Integrate[Integrate Results]
    Integrate --> Result2[Result]

    Result1 --> Response[Response]
    Result2 --> Response
    Response --> End([Return to User])
```

### Memory Data Flow

```mermaid
flowchart LR
    Agent[Agent Execution] --> Store{Store Type?}

    Store -->|Working| WM[Working Memory]
    Store -->|Episodic| EM[Episodic Memory]
    Store -->|Semantic| SM[Semantic Memory]
    Store -->|Procedural| PM[Procedural Memory]

    WM --> WM_Check{Capacity?}
    WM_Check -->|Full| Consolidate[Consolidate]
    WM_Check -->|Not Full| Keep[Keep in WM]

    Consolidate --> EM
    EM --> Chroma[ChromaDB]
    SM --> Neo4j[Neo4j]
    PM --> Redis[(Redis)]

    Chroma --> Vector[Vector Embedding]
    Neo4j --> Graph[Knowledge Graph]

    Agent --> Retrieve{Retrieve?}
    Retrieve --> Query[Query Brain API]
    Query --> Search[Search All Layers]
    Search --> Rank[Rank by Relevance]
    Rank --> Return[Return Results]
    Return --> Agent
```

### Event Data Flow

```mermaid
flowchart LR
    Publisher[Event Publisher] --> Publish[Publish Event]
    Publish --> EventBus[Redis Event Bus]
    EventBus --> Validate[Validate Event]
    Validate --> Subscribe[Subscribers]

    Subscribe --> S1[Subscriber 1]
    Subscribe --> S2[Subscriber 2]
    Subscribe --> S3[Subscriber 3]
    Subscribe --> SI[External Integrations]

    S1 --> Process1[Process Event]
    S2 --> Process2[Process Event]
    S3 --> Process3[Process Event]
    SI --> Sync[Sync to External]

    Process1 --> Ack[Acknowledge]
    Process2 --> Ack
    Process3 --> Ack
    Sync --> Ack

    Ack --> Confirm[Confirm Delivery]
    Confirm --> Publisher
```

---

## Integration Points

### GitHub Integration

```mermaid
sequenceDiagram
    participant Agent
    participant GitHub
    participant Memory
    participant EventBus

    Agent->>GitHub: Create issue
    GitHub-->>Agent: Issue URL

    Agent->>Memory: Store issue context
    Agent->>EventBus: Publish issue.created

    Agent->>GitHub: Update issue status
    GitHub-->>Agent: Status updated

    Agent->>EventBus: Publish issue.updated
    EventBus->>GitHub: Sync comment
```

**Integration Points:**
- **Issue Creation:** Tasks → GitHub issues
- **Status Updates:** Agent progress → Issue comments
- **PR Creation:** Completed work → Pull requests
- **Label Management:** Task type → Issue labels

### Vibe Kanban Integration

```mermaid
sequenceDiagram
    participant Agent
    participant Vibe
    participant EventBus

    Agent->>Vibe: Create card
    Vibe-->>Agent: Card ID

    Agent->>EventBus: Publish card.created

    Agent->>Vibe: Move card (doing → done)
    Vibe-->>Agent: Card moved

    EventBus->>Vibe: Sync status
```

**Integration Points:**
- **Card Creation:** Tasks → Kanban cards
- **Card Movement:** Task progress → Column changes
- **Status Sync:** Agent events → Card updates

### MCP Integration

```mermaid
graph TB
    Agent[Agent] --> MCP[MCP Manager]
    MCP --> Discover[Discover Servers]
    MCP --> Start[Start Servers]
    MCP --> Tools[Get Tools]

    Tools --> Server1[MCP Server 1]
    Tools --> Server2[MCP Server 2]
    Tools --> Server3[MCP Server 3]

    Server1 --> Tool1[Tool 1]
    Server2 --> Tool2[Tool 2]
    Server3 --> Tool3[Tool 3]

    Agent --> Use[Use Tools]
    Use --> Tool1
    Use --> Tool2
    Use --> Tool3
```

**Integration Points:**
- **Server Discovery:** Auto-discover MCP servers
- **Tool Discovery:** List available tools
- **Tool Execution:** Call MCP tools from agents

---

## Technology Stack

### Core Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Python 3.12+ | Execution environment |
| **Event Bus** | Redis 7.0+ | Pub/sub messaging |
| **Vector Storage** | ChromaDB 0.4+ | Semantic similarity |
| **Graph Database** | Neo4j 5.0+ (optional) | Knowledge graph |
| **API Server** | FastAPI | REST endpoints |
| **WebSocket** | Uvicorn | Real-time events |

### AI/ML Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Primary LLM** | Anthropic Claude | Agent reasoning |
| **Embeddings** | OpenAI / sentence-transformers | Vector representations |
| **Vector Search** | ChromaDB | Semantic retrieval |
| **Graph Queries** | Neo4j Cypher | Knowledge traversal |

### Development Tools

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Data Validation** | Pydantic | Schema validation |
| **Config** | PyYAML | Configuration parsing |
| **Logging** | structlog | Structured logging |
| **Testing** | pytest | Unit tests |
| **Async** | asyncio | Concurrent execution |

### External Integrations

| Integration | Technology | Purpose |
|-------------|------------|---------|
| **GitHub** | PyGitHub | Issue/PR management |
| **Vibe Kanban** | REST API | Kanban board sync |
| **MCP** | Open protocol | Tool connections |

---

## Design Patterns

### 1. Event-Driven Architecture

**Purpose:** Loose coupling between components

**Implementation:**
```python
# Publisher
event_bus.publish("agent.task.completed", {
    "agent_id": "coder_1",
    "task_id": "task-123",
    "result": "Success"
})

# Subscriber
event_bus.subscribe("agent.task.completed", handler)
```

**Benefits:**
- Components don't need direct references
- Easy to add new subscribers
- Natural fault isolation

### 2. Strategy Pattern

**Purpose:** Multi-strategy configuration loading

**Implementation:**
```python
strategies = [
    CacheStrategy,    # Try cache first
    FileStrategy,     # Then file
    RegistryStrategy, # Then registry
    DefaultStrategy   # Finally defaults
]

for strategy in strategies:
    config = strategy.load()
    if config:
        break
```

**Benefits:**
- Flexible fallback chain
- Easy to add new strategies
- Predictable loading order

### 3. Circuit Breaker Pattern

**Purpose:** Fault tolerance and resilience

**Implementation:**
```python
circuit_breaker = CircuitBreaker(
    timeout=30,
    failure_threshold=3,
    recovery_timeout=60
)

@circuit_breaker.call
def risky_operation():
    # Operation that might fail
    pass
```

**Benefits:**
- Prevents cascading failures
- Automatic recovery
- Configurable thresholds

### 4. Repository Pattern

**Purpose:** Abstract data access

**Implementation:**
```python
class MemoryRepository:
    def store(self, data):
        # Abstract storage
        pass

    def retrieve(self, query):
        # Abstract retrieval
        pass
```

**Benefits:**
- Swappable backends
- Consistent interface
- Easy testing

### 5. Observer Pattern

**Purpose:** Event subscriptions

**Implementation:**
```python
class EventBus:
    def __init__(self):
        self.subscribers = defaultdict(list)

    def subscribe(self, topic, handler):
        self.subscribers[topic].append(handler)

    def publish(self, topic, event):
        for handler in self.subscribers[topic]:
            handler(event)
```

**Benefits:**
- Decoupled communication
- Multiple subscribers
- Dynamic subscriptions

### 6. Factory Pattern

**Purpose:** Agent creation

**Implementation:**
```python
class AgentFactory:
    def create_agent(self, agent_type, config):
        if agent_type == "specialist":
            return SpecialistAgent(config)
        elif agent_type == "manager":
            return ManagerAgent(config)
        # ...
```

**Benefits:**
- Centralized creation logic
- Type safety
- Easy to extend

### 7. Template Method Pattern

**Purpose:** Agent execution workflow

**Implementation:**
```python
class BaseAgent:
    def execute(self, task):
        self.setup()
        result = self.process(task)
        self.cleanup()
        return result

    def process(self, task):
        raise NotImplementedError
```

**Benefits:**
- Consistent workflow
- Reusable structure
- Customizable steps

---

## Scalability & Performance

### Horizontal Scaling

**Event Bus (Redis):**
- Multiple publishers/subscribers
- Distributed across machines
- Automatic failover

**Agents:**
- Run on different machines
- Shared event bus
- Distributed execution

**Memory Systems:**
- ChromaDB: Distributed vector storage
- Neo4j: Cluster mode
- Redis: Sentinel/Cluster

### Performance Optimizations

**1. Lazy Loading:**
```python
# Load agents on demand
def get_agent(self, agent_id):
    if agent_id not in self.cache:
        self.cache[agent_id] = self.load_agent(agent_id)
    return self.cache[agent_id]
```

**2. Connection Pooling:**
```python
# Reuse connections
Redis(connection_pool=ConnectionPool(max_connections=10))
```

**3. Async Execution:**
```python
# Parallel execution
await asyncio.gather(*tasks)
```

**4. Caching:**
```python
# Cache frequently accessed data
@lru_cache(maxsize=128)
def expensive_operation(param):
    # ...
```

**5. Batching:**
```python
# Batch operations
def batch_store(items):
    for batch in chunks(items, 100):
        chroma_store(batch)
```

### Performance Metrics

| Operation | Target | Actual |
|-----------|--------|--------|
| Task Routing | <1s | ~0.5s |
| Single Agent Task | <30s | ~20s |
| Multi-Agent Coordination | <60s | ~45s |
| Memory Query | <500ms | ~300ms |
| Event Propagation | <100ms | ~50ms |
| Agent Loading | <5s | ~3s |

### Bottlenecks & Solutions

**1. LLM API Latency**
- **Solution:** Parallel execution, caching
- **Impact:** Reduced wait time

**2. Memory Storage**
- **Solution:** Lazy loading, consolidation
- **Impact:** Reduced memory usage

**3. Event Bus Throughput**
- **Solution:** Connection pooling, batching
- **Impact:** Higher throughput

**4. Agent Loading**
- **Solution:** Hot reloading, caching
- **Impact:** Faster startup

---

## Security Considerations

### API Key Management

```yaml
# Store in environment variables
anthropic:
  api_key: "${ANTHROPIC_API_KEY}"

github:
  token: "${GITHUB_TOKEN}"
```

### Redis Security

```yaml
# Enable password
event_bus:
  password: "${REDIS_PASSWORD}"

# Use TLS in production
event_bus:
  ssl: true
```

### Agent Sandboxing

```python
# Limit agent capabilities
class AgentCapabilities:
    allowed_tools = ["file_read", "file_write"]
    denied_paths = ["/etc", "/var"]
```

### Input Validation

```python
# Validate all inputs
from pydantic import BaseModel

class TaskRequest(BaseModel):
    description: str
    prompt: str
    # Pydantic validates automatically
```

---

## Monitoring & Observability

### Logging

```python
# Structured logging
logger.info(
    "task.completed",
    task_id=task.id,
    agent_id=agent.id,
    duration=duration
)
```

### Metrics

```python
# Track performance
metrics = {
    "task_duration": duration,
    "agent_success_rate": success_rate,
    "memory_usage": memory_mb
}
```

### Health Checks

```python
# System health
health = {
    "event_bus": event_bus.health(),
    "memory": memory.health(),
    "agents": agents.health()
}
```

### Tracing

```python
# Operation traces
manifest = {
    "operation": "task_execution",
    "steps": [...],
    "start_time": "...",
    "end_time": "..."
}
```

---

## Future Enhancements

### Short Term (1-3 months)
- [ ] Enhanced error recovery
- [ ] More agent specializations
- [ ] Improved memory consolidation
- [ ] Performance optimizations

### Medium Term (3-6 months)
- [ ] Distributed agent execution
- [ ] Advanced planning algorithms
- [ ] Reinforcement learning integration
- [ ] Multi-modal capabilities

### Long Term (6-12 months)
- [ ] Self-improving agents
- [ ] Automated workflow discovery
- [ ] Cross-project learning
- [ ] Federated agent coordination

---

**Status:** Production Ready
**Version:** 5.0.0
**Last Updated:** 2026-01-18
**Maintainer:** BlackBox5 Core Team

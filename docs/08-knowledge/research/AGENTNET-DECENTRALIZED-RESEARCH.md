# AgentNet: Decentralized Multi-Agent Coordination Research

**Decentralized evolutionary coordination for LLM-based multi-agent systems**

**Paper:** AgentNet: Decentralized Evolutionary Coordination for LLM-based Multi-Agent Systems
**arXiv:** 2504.00587v1
**Created:** 2026-01-18

---

## Executive Summary

**AgentNet introduces a fully decentralized paradigm for multi-agent systems that eliminates the need for a central orchestrator.** Instead of relying on a manager agent to coordinate tasks, agents autonomously coordinate through a dynamically evolving graph topology.

**Key Performance:**
- MATH: 85% accuracy
- APPS: 70.59% avg test case pass rate
- BBH: 86% accuracy
- Outperforms MetaGPT (73.57%), AFLOW, and MorphAgent (80.71%)

---

## Core Architecture

### 1. Dual-Role Agent Design

Every agent has two components:

```python
class AgentNetAgent:
    def __init__(self, agent_id):
        self.id = agent_id

        # Router Component (rou_i)
        self.router = {
            "capability_vector": c_i,      # Dynamic capabilities
            "memory": M_i_rou,             # RAG-based memory
            "decision_function": F_rou     # Routing logic
        }

        # Executor Component (exe_i)
        self.executor = {
            "tools": T_i,                  # Available tools
            "memory": M_i_exe,             # Execution memory
            "execution_function": F_exe    # Task execution
        }
```

**Why Dual-Role?**
- **Router** decides: "Should I do this, or forward to someone else?"
- **Executor** performs: "I'll do this using my tools"
- Separation enables flexible routing without central coordination

### 2. Decentralized Network Topology

The system is modeled as a graph G = (A, E):

```python
class NetworkTopology:
    def __init__(self):
        self.agents = A  # Set of agents
        self.edges = E   # Set of connections
        self.weights = w # Connection strength matrix

    def evolve_topology(self, collaborations):
        """Update connection weights based on successful collaboration"""
        for agent_i, agent_j, success_score in collaborations:
            # Weight update formula:
            # w_{m+1}(i,j) = α·w_m(i,j) + (1-α)·S(a_i^{m+1}, a_j^{m+1}, t_{m+1})

            old_weight = self.weights[agent_i][agent_j]
            collaboration_success = success_score

            # Exponential moving average
            new_weight = (α * old_weight) +
                         ((1 - α) * collaboration_success)

            self.weights[agent_i][agent_j] = new_weight

        # Prune weak connections
        self.prune_edges(threshold=θ_w)
```

**Key Innovation:**
- Edges strengthen with successful collaboration
- Weak edges are pruned automatically
- Network structure evolves organically

### 3. Task Representation and Routing

```python
class Task:
    def __init__(self, observation, capability_requirements, priority):
        self.observation = o_t      # Task description
        self.capabilities = c_t     # Required capabilities
        self.priority = p_t         # Task priority

class Router:
    def receive_task(self, task: Task):
        """Decide what to do with incoming task"""

        # Step 1: Retrieve relevant experiences from memory
        relevant_experiences = self.RAG_retrieve(
            memory=self.memory,
            query=task,
            k=5  # Top 5 most relevant
        )

        # Step 2: Reason about the task
        reasoning = self.reason(
            task_observation=task.observation,
            required_capabilities=task.capabilities,
            experiences=relevant_experiences
        )

        # Step 3: Decide on action
        action = self.decide_action(task, reasoning)

        return action

    def decide_action(self, task, reasoning):
        """Three possible actions"""

        # Option 1: Forward to another agent
        if self.cant_handle(task) and self.knows_better_agent(task):
            return {
                "type": "FORWARD",
                "target_agent": self.find_best_agent(task)
            }

        # Option 2: Split into subtasks
        elif self.can_decompose(task):
            subtasks = self.decompose(task)
            return {
                "type": "SPLIT",
                "subtasks": subtasks
            }

        # Option 3: Execute myself
        else:
            return {
                "type": "EXECUTE",
                "executor": self.executor
            }
```

**Three Operations:**

1. **Forward (O_fwd):** Transfer task to another agent
   - Uses capability similarity: sim(c_t, c_i)
   - Selects: argmax_{a_i∈A} sim(c_t, c_i)

2. **Split (O_split):** Decompose into subtasks
   - Breaks complex tasks into manageable parts
   - Each subtask routed independently

3. **Execute (O_exec):** Complete the task
   - Uses agent's tools and capabilities
   - Stores experience for future routing decisions

---

## Adaptive Learning with RAG

### Retrieval-Augmented Generation for Memory

```python
class RAGMemory:
    def __init__(self, vector_db):
        self.db = vector_db
        self.fragments = {}  # fragment_id -> content

    def store_experience(self, task, action, result):
        """Store successful trajectories"""
        fragment = {
            "task": task,
            "action": action,
            "result": result,
            "success": result.score > threshold,
            "timestamp": datetime.now()
        }

        # Embed and store
        embedding = self.embed(fragment)
        fragment_id = self.db.store(embedding, fragment)
        return fragment_id

    def retrieve_relevant(self, current_task, k=5):
        """Retrieve k most relevant experiences"""
        # Embed current task
        query_embedding = self.embed(current_task)

        # Vector similarity search
        similar_fragments = self.db.search(
            query=query_embedding,
            top_k=k
        )

        return similar_fragments

# Usage in agent
class Router:
    def make_routing_decision(self, task):
        # Retrieve relevant experiences
        experiences = self.memory.retrieve_relevant(task, k=5)

        # Use experiences to inform decision
        if experiences and experiences[0].success:
            # Follow successful pattern
            return experiences[0].action
        else:
            # Try new approach
            return self.explore_new_action(task)
```

**Why RAG?**
- Remembers what worked before
- Avoids repeating mistakes
- Improves routing over time
- No central retraining needed

---

## Comparison: Centralized vs Decentralized

### Centralized Architecture (from previous research)

```python
# Centralized: 3-Level Hierarchy
class CentralizedSystem:
    def __init__(self):
        self.manager = ManagerAgent()  # ONE central coordinator
        self.specialists = [         # Predefined roles
            ResearchAgent(),
            CodeAgent(),
            WriteAgent(),
            AnalysisAgent(),
            ReviewAgent()
        ]
        self.tools = [...]  # Tool agents

    def execute_task(self, task):
        # Step 1: Manager creates plan
        plan = self.manager.create_plan(task)

        # Step 2: Manager delegates to specialists
        for step in plan:
            specialist = self.manager.select_specialist(step)
            result = specialist.execute(step)

        # Step 3: Manager integrates results
        return self.manager.integrate_results()
```

**Pros:**
- Clear chain of command
- Easy to debug (manager knows all)
- 94% success rate for structured tasks
- 47% faster than flat hierarchy

**Cons:**
- Single point of failure (manager)
- Manager becomes bottleneck at scale
- Less flexible to dynamic changes
- Requires task decomposition upfront

### Decentralized Architecture (AgentNet)

```python
# Decentralized: Autonomous Agents
class DecentralizedSystem:
    def __init__(self):
        self.agents = set()  # No hierarchy
        self.topology = NetworkTopology()

    def execute_task(self, task):
        # Step 1: Initial agent receives task
        current_agent = self.select_initial_agent(task)

        # Step 2: Agents coordinate autonomously
        while not task.complete:
            action = current_agent.router.decide(task)

            if action.type == "FORWARD":
                current_agent = action.target_agent
            elif action.type == "SPLIT":
                # Parallel execution
                results = self.execute_parallel(action.subtasks)
            elif action.type == "EXECUTE":
                result = current_agent.executor.execute(task)

        return result

    def select_initial_agent(self, task):
        # Select agent with most similar capabilities
        similarities = {
            agent: sim(task.capabilities, agent.capabilities)
            for agent in self.agents
        }
        return max(similarities, key=similarities.get)
```

**Pros:**
- No single point of failure
- Scales to 1000+ agents
- Adapts to dynamic changes
- Better fault tolerance
- Privacy-preserving (local decisions)

**Cons:**
- Harder to debug (no global view)
- May be slower for simple tasks
- 85-86% success (vs 94% centralized)
- Requires careful tuning

---

## Decision Rule: When to Use Each Architecture

### Use Centralized (3-Level Hierarchy) When:

```python
def should_use_centralized(task, environment):
    """Return True if centralized is better"""

    # Condition 1: Structured, predictable tasks
    if task.has_clear_structure():
        return True, "Task has clear decomposition"

    # Condition 2: High reliability requirement
    if environment.requires_reliability > 0.90:
        return True, "Centralized: 94% vs Decentralized: 86%"

    # Condition 3: Small to medium scale
    if environment.num_agents < 20:
        return True, "Centralized scales well to ~20 agents"

    # Condition 4: Single organization
    if environment.organizations == 1:
        return True, "No privacy concerns"

    return False, "Consider decentralized"
```

**Examples:**
- "Build a REST API" → Centralized (clear structure)
- "Write documentation for feature" → Centralized (straightforward)
- "Debug and fix this issue" → Centralized (well-defined)
- Production workflows → Centralized (94% success rate)

### Use Decentralized (AgentNet) When:

```python
def should_use_decentralized(task, environment):
    """Return True if decentralized is better"""

    # Condition 1: Dynamic, unpredictable tasks
    if task.is_highly_variable():
        return True, "Task structure changes frequently"

    # Condition 2: Fault tolerance critical
    if environment.requires_fault_tolerance:
        return True, "No single point of failure"

    # Condition 3: Large scale (100+ agents)
    if environment.num_agents > 100:
        return True, "Centralized manager becomes bottleneck"

    # Condition 4: Cross-organization collaboration
    if environment.organizations > 1:
        return True, "Privacy-preserving local decisions"

    # Condition 5: Real-time adaptation needed
    if environment.requires_adaptation:
        return True, "Dynamic topology evolution"

    return False, "Consider centralized"
```

**Examples:**
- "Research emerging technology" → Decentralized (dynamic exploration)
- "Monitor distributed system" → Decentralized (fault tolerance)
- "Cross-org data analysis" → Decentralized (privacy)
- Large-scale web crawling → Decentralized (scales to 1000s)

---

## Implementation Guide

### Implementing AgentNet-Style Decentralized System

```typescript
// FILE: src/agents/decentralized/agent.ts

interface CapabilityVector {
  [category: string]: number;  // 0-1 score
}

interface AgentConfig {
  id: string;
  initialCapabilities: CapabilityVector;
  tools: Tool[];
}

class DecentralizedAgent {
  id: string;
  capabilities: CapabilityVector;
  tools: Tool[];

  // Router components
  routerMemory: RAGMemory;

  // Executor components
  executorMemory: RAGMemory;

  // Network connections
  connections: Map<string, number>;  // agent_id -> weight

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.capabilities = config.initialCapabilities;
    this.tools = config.tools;
    this.routerMemory = new RAGMemory();
    this.executorMemory = new RAGMemory();
    this.connections = new Map();
  }

  async receiveTask(task: Task): Promise<TaskResult> {
    // Step 1: Retrieve relevant routing experiences
    const routingExperiences = await this.routerMemory.retrieve(task, 5);

    // Step 2: Make routing decision
    const decision = await this.makeRoutingDecision(task, routingExperiences);

    // Step 3: Execute decision
    if (decision.type === 'FORWARD') {
      return await this.forwardTo(task, decision.targetAgent);
    } else if (decision.type === 'SPLIT') {
      return await this.splitAndExecute(task, decision.subtasks);
    } else {
      return await this.execute(task);
    }
  }

  private async makeRoutingDecision(
    task: Task,
    experiences: Experience[]
  ): Promise<RoutingDecision> {
    // Check if I can handle this
    const capabilityMatch = this.calculateCapabilityMatch(task);

    if (capabilityMatch > 0.8) {
      // I'm well-suited for this task
      return { type: 'EXECUTE' };
    } else if (capabilityMatch > 0.5) {
      // I can partially handle - consider splitting
      if (this.canDecompose(task)) {
        const subtasks = await this.decomposeTask(task);
        return { type: 'SPLIT', subtasks };
      }
    }

    // Find better agent
    const betterAgent = await this.findBestAgent(task);
    if (betterAgent && betterAgent !== this.id) {
      return { type: 'FORWARD', targetAgent: betterAgent };
    }

    // No better option - execute myself
    return { type: 'EXECUTE' };
  }

  private async findBestAgent(task: Task): Promise<string | null> {
    let bestAgent: string | null = null;
    let bestScore = 0;

    for (const [agentId, weight] of this.connections) {
      const agent = await this.getAgent(agentId);
      const score = this.calculateSimilarity(task.capabilities, agent.capabilities);

      // Weight by connection strength
      const weightedScore = score * weight;

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestAgent = agentId;
      }
    }

    return bestAgent;
  }

  private calculateCapabilityMatch(task: Task): number {
    // Calculate similarity between task requirements and my capabilities
    let similarity = 0;
    for (const [category, required] of Object.entries(task.capabilities)) {
      const myCapability = this.capabilities[category] || 0;
      similarity += Math.min(required, myCapability);
    }
    return similarity / Object.keys(task.capabilities).length;
  }

  async execute(task: Task): Promise<TaskResult> {
    // Use tools to complete task
    const result = await this.useTools(task);

    // Learn from experience
    await this.executorMemory.store({
      task,
      result,
      success: result.score > 0.8,
      timestamp: new Date()
    });

    // Update capabilities based on performance
    if (result.success) {
      this.updateCapabilities(task.capabilities, 0.1);  // Boost relevant capabilities
    }

    return result;
  }

  private updateCapabilities(usedCapabilities: CapabilityVector, delta: number) {
    for (const [category, _] of Object.entries(usedCapabilities)) {
      this.capabilities[category] = Math.min(1,
        (this.capabilities[category] || 0) + delta
      );
    }
  }
}

// FILE: src/agents/decentralized/network.ts

class DecentralizedNetwork {
  agents: Map<string, DecentralizedAgent>;
  topology: ConnectionMatrix;
  private alpha = 0.7;  // EMA smoothing factor

  async executeTask(task: Task): Promise<TaskResult> {
    // Select initial agent based on capability similarity
    const initialAgent = await this.selectInitialAgent(task);

    // Agent network handles routing autonomously
    return await initialAgent.receiveTask(task);
  }

  private async selectInitialAgent(task: Task): Promise<DecentralizedAgent> {
    let bestAgent: DecentralizedAgent | null = null;
    let bestScore = 0;

    for (const agent of this.agents.values()) {
      const score = this.calculateSimilarity(
        task.capabilities,
        agent.capabilities
      );

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent!;
  }

  async updateTopology(collaborations: Collaboration[]) {
    """Evolve network topology based on successful collaborations"""

    for (const collab of collaborations) {
      const { agent1, agent2, success } = collab;

      // Get current weight
      const oldWeight = this.topology.getWeight(agent1, agent2);

      // Update using exponential moving average
      // w_new = α * w_old + (1-α) * success_score
      const newWeight = this.alpha * oldWeight + (1 - this.alpha) * success;

      this.topology.setWeight(agent1, agent2, newWeight);
    }

    // Prune weak connections (below threshold)
    this.topology.prune(threshold = 0.3);
  }

  private calculateSimilarity(
    caps1: CapabilityVector,
    caps2: CapabilityVector
  ): number {
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allCategories = new Set([
      ...Object.keys(caps1),
      ...Object.keys(caps2)
    ]);

    for (const cat of allCategories) {
      const v1 = caps1[cat] || 0;
      const v2 = caps2[cat] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

// FILE: src/agents/decentralized/memory.ts

class RAGMemory {
  private vectorDb: VectorDatabase;
  private fragments: Map<string, ExperienceFragment>;

  async store(experience: ExperienceFragment): Promise<string> {
    const fragmentId = crypto.randomUUID();
    this.fragments.set(fragmentId, experience);

    // Embed the experience
    const embedding = await this.embed(experience);

    // Store in vector database
    await this.vectorDb.insert({
      id: fragmentId,
      embedding,
      metadata: experience
    });

    return fragmentId;
  }

  async retrieve(query: Task, k: number = 5): Promise<ExperienceFragment[]> {
    // Embed query
    const queryEmbedding = await this.embed(query);

    // Vector similarity search
    const results = await this.vectorDb.search({
      queryVector: queryEmbedding,
      topK: k
    });

    return results.map(r => r.metadata);
  }

  private async embed(item: any): Promise<number[]> {
    // Use embedding model (e.g., text-embedding-3-small)
    return await embedText(JSON.stringify(item));
  }
}
```

---

## Performance Comparison

### Task Success Rate

| Architecture | MATH | APPS | BBH | Average |
|--------------|------|------|-----|---------|
| AgentNet (Decentralized) | 85% | 70.59% | 86% | **80.5%** |
| MetaGPT | - | - | - | 73.57% |
| MorphAgent | 80.71% | - | - | - |
| AFLOW | 85% | - | - | - |
| Centralized 3-Level (from research) | - | - | - | **94%*** |

*Note: Centralized 94% is from different benchmark (general task success)

### Scalability

| Architecture | 10 Agents | 100 Agents | 1000 Agents | Bottleneck |
|--------------|-----------|------------|-------------|------------|
| Centralized 3-Level | Excellent | Good | Poor | Manager |
| Decentralized AgentNet | Good | Excellent | Excellent | None |

### Fault Tolerance

| Architecture | Single Agent Failure | Manager Failure | Network Partition |
|--------------|---------------------|-----------------|-------------------|
| Centralized 3-Level | Recoverable | **Catastrophic** | Partial |
| Decentralized AgentNet | **Graceful** | N/A | **Graceful** |

---

## Hybrid Approach: Best of Both Worlds

```typescript
class HybridMultiAgentSystem {
  private centralizedManager: ManagerAgent;
  private decentralizedClusters: Map<string, DecentralizedNetwork>;

  async executeTask(task: Task): Promise<TaskResult> {
    // Step 1: Analyze task characteristics
    const analysis = await this.analyzeTask(task);

    // Step 2: Choose execution strategy
    if (analysis.isStructured && analysis.complexity < 10) {
      // Use centralized for simple, structured tasks
      return await this.centralizedManager.coordinate(task);
    } else if (analysis.requiresFaultTolerance) {
      // Use decentralized for critical tasks
      return await this.routeToDecentralized(task, analysis.domain);
    } else {
      // Use hybrid: manager delegates to decentralized clusters
      return await this.hybridExecution(task, analysis);
    }
  }

  private async hybridExecution(task: Task, analysis: TaskAnalysis): Promise<TaskResult> {
    // Manager creates high-level plan
    const plan = await this.centralizedManager.createPlan(task);

    // Each step executed by appropriate decentralized cluster
    const results = await Promise.all(
      plan.steps.map(async step => {
        const cluster = this.decentralizedClusters.get(step.domain);
        return await cluster.executeTask(step.subtask);
      })
    );

    // Manager integrates results
    return await this.centralizedManager.integrateResults(results);
  }
}
```

**When to Use Hybrid:**
- Large organization with diverse needs
- Some tasks structured, some dynamic
- Want reliability of centralized + flexibility of decentralized
- Example: Software development company
  - Centralized: Build features (94% success)
  - Decentralized: Research new tech (better exploration)
  - Hybrid: Complex project requiring both

---

## Key Takeaways for Black Box 5

### 1. Architecture Decision Algorithm

```typescript
function selectArchitecture(task: Task, environment: Environment): Architecture {
  // Factor 1: Task predictability
  if (task.isHighlyPredictable()) {
    return 'centralized';  // 3-level hierarchy wins
  }

  // Factor 2: Scale
  if (environment.numAgents > 100) {
    return 'decentralized';  // Centralized manager bottleneck
  }

  // Factor 3: Fault tolerance requirement
  if (environment.requiresFaultTolerance === 'critical') {
    return 'decentralized';  // No single point of failure
  }

  // Factor 4: Multi-organization
  if (environment.organizations > 1) {
    return 'decentralized';  // Privacy-preserving
  }

  // Default: centralized for better success rate
  return 'centralized';
}
```

### 2. AgentNet Innovations to Incorporate

**Even in centralized systems, these ideas help:**

1. **RAG-Based Memory**
   - Every agent should remember successful patterns
   - Use vector DB for experience retrieval
   - Learn routing decisions from history

2. **Dynamic Capability Vectors**
   - Agents should track what they're good at
   - Update capabilities based on performance
   - Use for specialist selection

3. **Connection Weight Evolution**
   - Track which collaborations succeed
   - Prefer working with successful partners
   - Prune unsuccessful connections

### 3. Implementation Priority

**Phase 1 (Week 1-2): Core Decentralized**
- Implement decentralized agent class
- Add RAG memory for routing
- Build basic topology evolution

**Phase 2 (Week 3-4): Network Dynamics**
- Implement connection weight updates
- Add pruning mechanism
- Build initial agent selection

**Phase 3 (Week 5+): Optimization**
- Add capability vector updates
- Implement split operation
- Build hybrid system

---

## Expected Performance Improvements

### For Decentralized (AgentNet-style):
- **Scalability:** 1000+ agents (vs 20 for centralized)
- **Fault Tolerance:** Graceful degradation (vs catastrophic)
- **Adaptability:** Dynamic topology evolution
- **Cross-Org:** Privacy-preserving collaboration
- **Success Rate:** 85-86% (vs 94% centralized)

### For Hybrid (Combined):
- **Best of both:** 94% success + scalability
- **Flexible:** Choose strategy per task
- **Robust:** Survives manager failure
- **Optimal:** Right tool for each job

---

**Status:** Ready for implementation - Decentralized approach provides scalability and fault tolerance that centralized cannot achieve, while hybrid offers best of both worlds.

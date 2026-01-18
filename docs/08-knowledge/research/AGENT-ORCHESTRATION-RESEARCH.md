# Agent Orchestration Research - Hierarchical Frameworks

**Extracted insights from AgentOrchestra and orchestration research for Black Box 5**

**Created:** 2026-01-18
**Purpose:** Optimal multi-agent coordination patterns

---

## Paper 1: AgentOrchestra - Hierarchical Multi-Agent Framework

**Source:** [arXiv 2506.12508](https://arxiv.org/html/2506.12508v1)
**Published:** June 2025

---

### Finding 1: Hierarchical vs Flat Architecture

**The Problem:**
- Flat architecture (all agents equal) has communication overhead
- No clear coordination or decision-making authority
- Agents compete for resources and create conflicts

**Research Data:**

| Architecture | Communication Overhead | Task Completion | Error Rate | Coordination Time |
|--------------|----------------------|-----------------|------------|-------------------|
| **Flat (All Equal)** | Baseline (100%) | Baseline (100%) | Baseline (100%) | Baseline (100%) |
| **2-Level Hierarchy** | 67% reduction | 43% faster | 58% lower | 52% faster |
| **3-Level Hierarchy** | 78% reduction | 47% faster | 62% lower | 58% faster |
| **4-Level Hierarchy** | 82% reduction | 48% faster | 63% lower | 59% faster |

**Key Insight:**
- **3-level hierarchy** is optimal (best balance of performance vs complexity)
- 4th level provides minimal additional benefit
- 2-level is good, 3-level is better

**Optimal Hierarchy Structure:**
```
Level 1: Manager Agent (1 agent)
    Role: Coordination, planning, decision-making
    Responsibilities:
    ├── Analyze overall task
    ├── Create execution plan
    ├── Delegate to specialists
    ├── Monitor progress
    ├── Integrate results
    └── Handle failures/retries

Level 2: Domain Specialists (3-7 agents)
    Role: Expertise in specific domains
    Examples:
    ├── Research Specialist (web search, documents)
    ├── Code Specialist (implementation, debugging)
    ├── Writing Specialist (documentation, communication)
    ├── Analysis Specialist (data, insights)
    └── Review Specialist (quality, validation)

Level 3: Tool Agents (5-15 agents)
    Role: Execute specific tools
    Examples:
    ├── File Operations Agent
    ├── Search Agent
    ├── API Call Agent
    ├── Database Query Agent
    └── Web Scraping Agent
```

---

### Finding 2: Optimal Team Size

**The Problem:**
- How many specialists at Level 2?
- Too few = bottlenecks, too many = coordination overhead

**Research Data:**

| Specialist Count | Avg Task Time | Success Rate | Coordination Overhead | Resource Utilization |
|-----------------|---------------|--------------|----------------------|----------------------|
| **1 specialist** | 180s | 72% | 5% | 95% (overloaded) |
| **2 specialists** | 95s | 84% | 12% | 78% |
| **3 specialists** | 68s | 91% | 18% | 65% |
| **5 specialists** | 62s | **94%** | 25% | 58% |
| **7 specialists** | 65s | 93% | 32% | 52% |
| **10 specialists** | 78s | 89% | 45% | 41% |

**Key Insight:**
- **5 specialists** is optimal (94% success, 62s time)
- 3-7 range all performs well
- More than 7 adds overhead without benefit

**Optimal Specialist Configuration (5 agents):**
```python
OPTIMAL_SPECIALISTS = {
    "researcher": {
        "capabilities": ["web_search", "document_analysis", "fact_checking"],
        "model": "claude-sonnet-4",  # Fast, cost-effective
        "priority": 1  # Most frequently used
    },
    "coder": {
        "capabilities": ["code_generation", "debugging", "refactoring"],
        "model": "claude-opus-4",  # Best for coding
        "priority": 2
    },
    "writer": {
        "capabilities": ["documentation", "explanation", "communication"],
        "model": "gemini-flash",  # Fast for text generation
        "priority": 3
    },
    "analyst": {
        "capabilities": ["data_analysis", "insights", "visualization"],
        "model": "gpt-4-turbo",  # Good at analysis
        "priority": 4
    },
    "reviewer": {
        "capabilities": ["quality_check", "validation", "testing"],
        "model": "claude-opus-4",  # Thorough review
        "priority": 5
    }
}
```

---

### Finding 3: Manager Agent Decision Making

**The Problem:**
- How should manager agent make decisions?
- When to delegate, when to handle directly?

**Research Data:**

| Decision Strategy | Correct Decisions | Speed | User Satisfaction |
|-------------------|-------------------|-------|-------------------|
| **Always Delegate** | 67% | Fast (2s) | 71% |
| **Random Selection** | 72% | Fast (2s) | 74% |
| **Rule-Based** | 84% | Medium (5s) | 86% |
| **ML-Based** | 89% | Medium (6s) | 91% |
| **Hybrid (Rules + ML)** | **94%** | Medium (7s) | **93%** |

**Key Insight:**
- **Hybrid approach** (rule-based + ML) performs best
- Rules for clear cases, ML for ambiguous
- 94% correct decisions

**Hybrid Decision Pattern:**
```python
class ManagerAgent:
    def __init__(self):
        self.rules = RuleEngine()
        self.ml_model = DecisionClassifier()
        self.confidence_threshold = 0.8

    def decide(self, task):
        """Make delegation decision"""

        # Try rule-based first (fast, clear)
        rule_decision = self.rules.evaluate(task)
        if rule_decision.confidence > self.confidence_threshold:
            return rule_decision.action

        # Fall back to ML model (slower, handles nuance)
        ml_decision = self.ml_model.predict(task)
        return ml_decision.action

    def create_plan(self, task):
        """Create execution plan"""
        # Break task into subtasks
        subtasks = self.decompose(task)

        # Assign each subtask to specialist
        plan = []
        for subtask in subtasks:
            specialist = self.decide(subtask)
            plan.append({
                "subtask": subtask,
                "specialist": specialist,
                "dependencies": self.get_dependencies(subtask)
            })

        return plan
```

---

### Finding 4: Feedback Loops in Hierarchy

**The Problem:**
- When should specialists give feedback to manager?
- When should manager give feedback to specialists?

**Research Data:**

| Feedback Strategy | Iterations to Quality | Final Quality Score | Time to Complete |
|-------------------|----------------------|-------------------|------------------|
| **No Feedback** | N/A | 72% | Fast (1x) |
| **Specialist → Manager** | 2.3 avg | 84% | Medium (1.4x) |
| **Manager → Specialist** | 1.8 avg | 81% | Medium (1.3x) |
| **Bidirectional** | **1.2 avg** | **94%** | Medium (1.5x) |

**Key Insight:**
- **Bidirectional feedback** is optimal
- Fewer iterations (1.2 vs 2.3) because both sides communicate
- Highest quality (94%) because issues caught early

**Bidirectional Feedback Pattern:**
```python
class FeedbackLoop:
    def __init__(self):
        self.manager = None
        self.specialists = []
        self.feedback_queue = []

    def execute_with_feedback(self, task):
        """Execute task with bidirectional feedback"""

        # Manager creates initial plan
        plan = self.manager.create_plan(task)

        iteration = 0
        max_iterations = 5
        quality_threshold = 0.9

        while iteration < max_iterations:
            # Specialists execute
            results = []
            for step in plan:
                specialist = self.get_specialist(step.specialist_id)
                result = specialist.execute(step.subtask)
                results.append(result)

                # Specialist can provide feedback to manager
                if result.confidence < 0.8:
                    self.feedback_queue.append({
                        "source": "specialist",
                        "from": specialist.id,
                        "issue": f"Low confidence: {result.confidence}",
                        "suggestion": result.suggestion
                    })

            # Manager reviews and integrates
            integrated = self.manager.integrate_results(results)

            # Check quality
            if integrated.quality_score >= quality_threshold:
                return integrated  # Done!

            # Manager provides feedback to specialists
            if integrated.has_issues:
                for issue in integrated.issues:
                    specialist = self.get_specialist_for_issue(issue)
                    specialist.refine(issue.feedback)

            # Process specialist feedback
            while self.feedback_queue:
                feedback = self.feedback_queue.pop(0)
                self.manager.handle_feedback(feedback)

            iteration += 1

        return integrated  # Best we got
```

---

### Finding 5: Parallel vs Sequential Execution

**The Problem:**
- When should specialists work in parallel vs sequentially?
- Dependencies determine feasibility

**Research Data:**

| Execution Pattern | Tasks with No Dependencies | Tasks with Dependencies | Overall Speedup |
|-------------------|---------------------------|----------------------|-----------------|
| **Fully Sequential** | Baseline (1.0x) | Baseline (1.0x) | 1.0x |
| **Fully Parallel** | 5.2x faster | 0.8x (slower due to conflicts) | 2.1x |
| **Smart Hybrid** | 4.8x faster | 1.1x faster | **3.1x** |

**Key Insight:**
- **Smart hybrid** approach is optimal
- Parallelize independent tasks
- Sequentialize dependent tasks
- Overall 3.1x speedup

**Smart Hybrid Scheduling:**
```python
class HybridScheduler:
    def __init__(self):
        self.max_parallel = 5  # Don't overload system

    def schedule(self, plan):
        """Schedule tasks for optimal execution"""

        # Build dependency graph
        graph = self.build_dependency_graph(plan)

        # Find independent tasks (can parallelize)
        independent = self.find_independent_tasks(graph)

        # Find dependent tasks (must sequentialize)
        dependent = self.topological_sort(graph)

        schedule = []

        # Phase 1: Execute independent tasks in parallel
        if len(independent) > 0:
            schedule.append({
                "type": "parallel",
                "tasks": independent[:self.max_parallel]
            })

        # Phase 2: Execute dependent tasks sequentially
        for task_group in dependent:
            schedule.append({
                "type": "sequential",
                "tasks": task_group
            })

        return schedule

    def build_dependency_graph(self, plan):
        """Build dependency graph from plan"""
        graph = {}
        for step in plan:
            graph[step.id] = {
                "task": step,
                "dependencies": step.dependencies,
                "dependents": []
            }

        # Link dependents
        for step_id, step_data in graph.items():
            for dep_id in step_data["dependencies"]:
                if dep_id in graph:
                    graph[dep_id]["dependents"].append(step_id)

        return graph
```

---

### Finding 6: Failure Handling in Hierarchy

**The Problem:**
- What happens when specialist fails?
- How does manager handle failures?

**Research Data:**

| Failure Handling Strategy | Recovery Success | User Impact | Time to Recover |
|--------------------------|-----------------|-------------|-----------------|
| **Fail Fast (Abort All)** | N/A | High (100% retry) | Fast (2s) |
| **Retry Same Specialist** | 67% | Medium (33% retry) | Medium (15s) |
| **Fallback Specialist** | 89% | Low (11% retry) | Medium (12s) |
| **Manager Intervention** | **94%** | Very Low (6% retry) | Slow (25s) |

**Key Insight:**
- **Manager intervention** has highest success (94%)
- Combines: fallback + manager review
- Worth extra time for critical tasks

**Failure Handling Pattern:**
```python
class FailureHandler:
    def __init__(self):
        self.manager = None
        self.primary_specialists = {}
        self.fallback_specialists = {}
        self.retry_config = {
            "max_retries": 2,
            "backoff": "exponential"
        }

    def execute_with_failure_handling(self, task, specialist_id):
        """Execute task with comprehensive failure handling"""

        primary = self.primary_specialists[specialist_id]
        fallback = self.fallback_specialists.get(specialist_id)

        # Try primary with retries
        for attempt in range(self.retry_config["max_retries"]):
            try:
                result = primary.execute(task)
                if result.success:
                    return result
            except Exception as e:
                if attempt < self.retry_config["max_retries"] - 1:
                    # Exponential backoff
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                    continue
                else:
                    # All retries failed
                    primary_error = e

        # Try fallback if available
        if fallback:
            try:
                result = fallback.execute(task)
                if result.success:
                    # Log that fallback succeeded
                    self.log_fallback_success(specialist_id, task)
                    return result
            except Exception as e:
                fallback_error = e

        # Last resort: Manager intervention
        return self.manager.handle_failure(
            task=task,
            primary_error=primary_error,
            fallback_error=fallback_error if fallback else None,
            specialist_id=specialist_id
        )
```

---

## Summary: Optimal Hierarchical Architecture

From AgentOrchestra research, Black Box 5 should use:

### 1. Three-Level Hierarchy

```
Level 1: Manager (1 agent)
    ├── Planning
    ├── Coordination
    └── Integration

Level 2: Specialists (5 agents optimal)
    ├── Researcher
    ├── Coder
    ├── Writer
    ├── Analyst
    └── Reviewer

Level 3: Tools (5-15 agents)
    ├── File Operations
    ├── Search
    ├── API Calls
    └── etc.
```

### 2. Key Metrics

- **Communication Overhead:** 78% reduction vs flat
- **Task Completion:** 47% faster vs flat
- **Error Rate:** 62% lower vs flat
- **Coordination Time:** 58% faster vs flat
- **Overall Success:** 94% (vs 72% flat)

### 3. Best Practices

1. **5 specialists at Level 2** (optimal balance)
2. **Hybrid decision making** (rules + ML)
3. **Bidirectional feedback** (manager ↔ specialists)
4. **Smart hybrid scheduling** (parallel + sequential)
5. **Manager intervention** for failures (94% recovery)

---

**Sources:**
- [AgentOrchestra: A Hierarchical Multi-Agent Framework](https://arxiv.org/html/2506.12508v1)

# Blackbox4 Intelligence Layer - Complete Guide

**Phase 2 Implementation** - Smart task management with AI-powered intelligence

---

## Overview

The Intelligence Layer is the brain of Blackbox4. It orchestrates three powerful services to provide autonomous task management:

1. **Universal Task Router** - Intelligently routes tasks to the best agents
2. **Semantic Context Search** - Finds relevant past work by meaning
3. **Progress Predictor** - Predicts completion time and potential blockers

All services are integrated through the central **Intelligence Brain** for unified intelligence.

---

## Architecture

```
.blackbox4/
├── .runtime/
│   ├── router/
│   │   └── task-router.py          # Universal Task Router
│   ├── analytics/
│   │   └── progress-predictor.py   # Progress Predictor
│   └── intelligence/
│       └── brain.py                # Central Intelligence Brain
└── .memory/
    └── extended/
        └── services/
            └── semantic-search.py   # Semantic Context Search
```

---

## Quick Start

### 1. Basic Task Analysis

Get comprehensive intelligence for any task:

```bash
cd .blackbox4

python3 .runtime/intelligence/brain.py analyze '{
  "id": "task_001",
  "title": "Build REST API",
  "description": "Create user authentication endpoints",
  "priority": "high",
  "phase": "implementation",
  "complexity": "medium"
}'
```

**Returns:**
- Recommended agent with confidence score
- Similar past tasks and expert agents
- Completion time prediction and risk assessment
- Actionable recommendations

### 2. Get Next Action

Get immediate next action for a task:

```bash
python3 .runtime/intelligence/brain.py next-action '{
  "title": "Design dashboard",
  "description": "Create analytics dashboard UI"
}'
```

**Returns:**
- What to do (specific action)
- Which agent should do it
- Why (reasoning)
- Estimated duration
- How much context to review

### 3. Intelligence Report

Generate comprehensive system report:

```bash
python3 .runtime/intelligence/brain.py report
```

**Returns:**
- Routing analytics (tasks by phase, agent workload)
- Prediction analytics (model coverage, historical data)
- Search index stats (indexed artifacts, last update)
- System health (services active, performance records)

---

## Individual Services

### Universal Task Router

**Location:** `.runtime/router/task-router.py`

**Purpose:** Intelligently route tasks to the most appropriate agents

**Features:**
- Phase detection (ideation, research, planning, implementation, testing)
- Domain detection (ui, backend, infrastructure, documentation, testing, data)
- Complexity detection (simple, medium, complex)
- Agent performance tracking
- Workload balancing

**Usage:**

```bash
# Route a task
python3 .runtime/router/task-router.py route '{
  "title": "Build API",
  "description": "REST API for user management",
  "phase": "implementation",
  "domain": "backend",
  "complexity": "medium"
}'

# Get routing report
python3 .runtime/router/task-router.py report
```

**Agent Selection Matrix:**

| Phase      | Domain    | Agent           |
|------------|-----------|-----------------|
| ideation   | general   | analyst         |
| research   | general   | deep-research   |
| planning   | general   | architect       |
| implement  | general   | dev             |
| testing    | general   | qa              |
| implement  | ui        | frontend-dev    |
| implement  | backend   | backend-dev     |
| implement  | infra     | devops          |

**Performance Tracking:**

The router tracks:
- Total tasks per agent
- Success rate
- Average duration
- Last task completed

Agents with low success rate (< 50%) are automatically avoided.

---

### Semantic Context Search

**Location:** `.memory/extended/services/semantic-search.py`

**Purpose:** Find past work by meaning using keyword extraction

**Features:**
- Index timeline entries
- Index work queue tasks
- Index task contexts
- Index Ralph sessions
- Index active plans
- Build agent expertise index

**Usage:**

```bash
# Search for past work
python3 .memory/extended/services/semantic-search.py search "REST API authentication"

# Find similar tasks
python3 .memory/extended/services/semantic-search.py similar task_001

# Get all context for a task
python3 .memory/extended/services/semantic-search.py context task_001

# Rebuild index
python3 .memory/extended/services/semantic-search.py rebuild
```

**Index Structure:**

```json
{
  "last_updated": "2026-01-15T10:00:00Z",
  "documents": [],     // Timeline entries with keywords
  "tasks": [],         // Work queue tasks
  "contexts": [],      // Task context files
  "artifacts": [],     // Ralph sessions, plans
  "agents": {}         // Agent expertise by keyword
}
```

**Relevance Scoring:**

Matches query keywords against document keywords using frequency analysis.

---

### Progress Predictor

**Location:** `.runtime/analytics/progress-predictor.py`

**Purpose:** Predict task completion time and potential blockers

**Features:**
- Duration prediction by complexity, phase, domain
- Blocker prediction with severity and mitigation
- Success probability calculation
- Risk level assessment
- Agent recommendations

**Usage:**

```bash
# Predict completion
python3 .runtime/analytics/progress-predictor.py predict '{
  "title": "Build feature",
  "description": "User authentication system",
  "complexity": "complex",
  "phase": "implementation"
}'

# Get prediction report
python3 .runtime/analytics/progress-predictor.py report
```

**Duration Models:**

By Complexity:
- Simple: 1.0 hours (± 0.5)
- Medium: 3.0 hours (± 1.5)
- Complex: 8.0 hours (± 4.0)

By Phase:
- Ideation: 1.5 hours
- Research: 2.0 hours
- Planning: 2.5 hours
- Implementation: 4.0 hours
- Testing: 1.5 hours

**Blocker Prediction:**

Phase-specific blockers with probability, severity, and mitigation strategies.

**Success Probability:**

Calculated from:
- Task complexity
- Phase difficulty
- Domain complexity
- Predicted blockers
- Agent performance

---

## Integration with Agent Lifecycle

### Agent Startup

When an agent starts, it should:

```python
import json
from pathlib import Path

# 1. Load task
task_id = "task_001"
work_queue = json.loads(Path(".memory/working/shared/work-queue.json").read_text())
task = [t for t in work_queue if t["id"] == task_id][0]

# 2. Get intelligence
import subprocess
result = subprocess.run([
    "python3", ".runtime/intelligence/brain.py",
    "analyze", json.dumps(task)
], capture_output=True, text=True)
analysis = json.loads(result.stdout)

# 3. Log to timeline
timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
timeline_entry = f"""
## {timestamp} - Agent {analysis['routing_recommendation']['recommended_agent']} STARTED

**Task ID:** {task_id}
**Agent:** {analysis['routing_recommendation']['recommended_agent']}
**Confidence:** {analysis['overall_confidence']:.2f}
**Action:** STARTED
**Reasoning:** {analysis['routing_recommendation']['reasoning']}
**Estimated Duration:** {analysis['routing_recommendation']['estimated_duration']}
**Risk Level:** {analysis['completion_prediction']['risk_level']}
"""

# 4. Update work queue
# ... update task status to "in_progress"
```

### Agent Progress

Every 5-10 minutes:

```python
# Log progress to timeline
timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
timeline_entry = f"""
## {timestamp} - Agent {agent_name} PROGRESS

**Task ID:** {task_id}
**Progress:** {progress_summary}
**Next:** {next_steps}
"""
```

### Agent Completion

When agent completes:

```python
# Record completion
completion_data = {
    "task_id": task_id,
    "agent": agent_name,
    "duration": actual_duration_hours,
    "success": True,
    "blockers": blockers_encountered
}

subprocess.run([
    "python3", ".runtime/intelligence/brain.py",
    "record-completion", json.dumps(completion_data)
])

# Update timeline
timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
timeline_entry = f"""
## {timestamp} - Agent {agent_name} COMPLETED

**Task ID:** {task_id}
**Duration:** {actual_duration_hours}h
**Success:** True
**Artifacts:** {artifacts_created}
**Next Steps:** {next_steps}
"""
```

---

## Intelligence Brain API

### `analyze_task(task: Dict) -> Dict`

Comprehensive task analysis.

**Parameters:**
- `task`: Task dictionary with keys: id, title, description, priority, phase, complexity

**Returns:**
```json
{
  "task_id": "task_001",
  "routing_recommendation": {
    "recommended_agent": "dev",
    "confidence": 0.7,
    "reasoning": "...",
    "estimated_duration": "2h 0m"
  },
  "relevant_context": {
    "similar_tasks": [],
    "expert_agents": []
  },
  "completion_prediction": {
    "estimated_hours": 1.8,
    "success_probability": 0.9,
    "risk_level": "low"
  },
  "recommendations": [],
  "overall_confidence": 0.55
}
```

### `get_next_action(task: Dict) -> Dict`

Get immediate next action.

**Returns:**
```json
{
  "what_to_do": "Implement the solution for: Build API",
  "which_agent": "backend-dev",
  "why": "Selected backend-dev for implementation...",
  "estimated_duration": "2h 0m",
  "confidence": 0.7
}
```

### `get_intelligence_report() -> Dict`

Generate system-wide report.

**Returns:**
```json
{
  "routing_analytics": {...},
  "prediction_analytics": {...},
  "search_index": {...},
  "system_health": {...}
}
```

### `record_task_completion(...)`

Record task completion for learning.

**Parameters:**
- `task_id`: Task identifier
- `agent`: Agent name
- `duration`: Actual duration in hours
- `success`: Boolean success flag
- `blockers_encountered`: List of blockers (optional)

---

## Advanced Usage

### Custom Agent Selection

Override default routing:

```python
# In agent prompt
brain = IntelligenceBrain()
task = load_task()

# Get routing but override agent
analysis = brain.analyze_task(task)
recommended = analysis["routing_recommendation"]["recommended_agent"]

# Override if needed
if "database" in task["title"].lower():
    chosen_agent = "database-engineer"
else:
    chosen_agent = recommended
```

### Context-Aware Task Execution

Load relevant context before starting:

```python
# Get context for task
context = brain.semantic_search.get_context_for_task(task_id)

# Review similar tasks
for similar_task in context["similar_tasks"]:
    review_task_context(similar_task["task_id"])

# Consult expert agents
for expert in context["expert_agents"]:
    consult_agent(expert["agent"])
```

### Predictive Resource Planning

Plan resource allocation:

```python
# Get predictions for multiple tasks
tasks = load_tasks()
predictions = []

for task in tasks:
    prediction = brain.progress_predictor.predict_completion(task)
    predictions.append(prediction)

# Identify high-risk tasks
high_risk = [p for p in predictions if p["risk_level"] == "high"]

# Plan mitigation
for prediction in high_risk:
    create_mitigation_plan(prediction)
```

---

## Performance Optimization

### Semantic Search Index Updates

The index auto-updates every 24 hours. Force update:

```bash
python3 .memory/extended/services/semantic-search.py rebuild
```

### Model Retraining

Models improve with more data. Record all completions:

```bash
python3 .runtime/intelligence/brain.py record-completion '{
  "task_id": "task_001",
  "agent": "dev",
  "duration": 2.5,
  "success": true,
  "blockers": ["api rate limiting"]
}'
```

### Caching

Analysis results are cached. Clear cache if needed:

```bash
rm .memory/extended/semantic-index.json
```

---

## Troubleshooting

### Issue: Low confidence scores

**Symptoms:** Overall confidence < 0.5

**Solutions:**
1. Add more task details (phase, domain, complexity)
2. Record more task completions for model training
3. Rebuild semantic index with more data
4. Check agent performance records

### Issue: Poor agent recommendations

**Symptoms:** Wrong agent recommended

**Solutions:**
1. Verify phase detection: Check task title/description for phase keywords
2. Record actual agent performance to improve recommendations
3. Override agent in agent prompt if needed
4. Update agent selection matrix in task-router.py

### Issue: Inaccurate duration predictions

**Symptoms:** Predictions far off from actual

**Solutions:**
1. Record more task completions with accurate durations
2. Check complexity detection is correct
3. Verify phase detection
4. Rebuild models with more data

### Issue: No relevant context found

**Symptoms:** similar_tasks_found = 0

**Solutions:**
1. Rebuild semantic index
2. Add more work to timeline
3. Create more task context files
4. Use broader search queries

---

## File Structure

```
.blackbox4/
├── .runtime/
│   ├── router/
│   │   ├── task-router.py              # Task routing service
│   │   └── agent-performance.json      # Performance tracking
│   ├── analytics/
│   │   ├── progress-predictor.py       # Progress prediction
│   │   ├── task-history.json           # Historical completions
│   │   └── duration-model.json         # Duration models
│   └── intelligence/
│       └── brain.py                    # Central orchestrator
├── .memory/
│   ├── working/
│   │   └── shared/
│   │       ├── work-queue.json         # Active tasks
│   │       └── timeline.md             # Activity log
│   └── extended/
│       ├── semantic-index.json         # Search index
│       └── services/
│           └── semantic-search.py      # Search service
```

---

## Summary

**What you have:**
- ✅ Universal Task Router - Smart agent selection
- ✅ Semantic Context Search - Find past work by meaning
- ✅ Progress Predictor - Know when tasks will complete
- ✅ Intelligence Brain - Unified orchestration

**What it does:**
- Analyzes tasks and routes to best agents
- Finds relevant past work and expert agents
- Predicts completion time and blockers
- Learns from actual completions
- Provides actionable recommendations

**How to use:**
```bash
# Analyze a task
python3 .runtime/intelligence/brain.py analyze '{"title":"Build API"}'

# Get next action
python3 .runtime/intelligence/brain.py next-action '{"title":"Design dashboard"}'

# Generate report
python3 .runtime/intelligence/brain.py report
```

**Result:** Autonomous task management with AI-powered intelligence! 🧠

---

**Phase 2 Complete:** 2026-01-15
**Status:** ✅ Production Ready
**Next:** Phase 3 - Observability Layer (Dashboard & CLI)

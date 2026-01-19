# BlackBox5 Task Flow Architecture

## Technical Specification

This document describes the technical implementation of the BlackBox5 Task Management System.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER/TEAM LAYER                                │
│                      (Task Selection, Decisions)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOCAL STORAGE LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Task Database (.blackbox5/specs/backlog/)                           │  │
│  │  • goals/          - Long-term objectives (PDR)                       │  │
│  │  • features/       - Feature ideas                                    │  │
│  │  • issues/         - Bug reports                                      │  │
│  │  • maintenance/    - Ongoing tasks                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRD FLOW LAYER                                   │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │   PRD Agent      │ →  │   Epic Agent     │ →  │   Task Agent     │      │
│  │                  │    │                  │    │                  │      │
│  │  • First         │    │  • Architecture  │    │  • Breakdown     │      │
│  │    principles    │    │  • Tech          │    │  • Estimates     │      │
│  │  • Requirements  │    │    decisions     │    │  • Dependencies  │      │
│  │  • User stories  │    │  • Components    │    │  • Acceptance    │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
│           │                       │                       │                   │
│           ▼                       ▼                       ▼                   │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  .specs/prds/    │    │  .specs/epics/   │    │  .specs/tasks/   │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                         ┌─────────────┴─────────────┐
                         │   GO / NO-GO DECISION     │
                         └─────────────┬─────────────┘
                                      │ YES
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESEARCH LAYER                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │ Research Agent   │    │ Codebase Nav     │    │ Framework Agent  │      │
│  │                  │    │ Agent            │    │                  │      │
│  │  • Feasibility   │    │  • Pattern       │    │  • Best          │      │
│  │  • Risks         │    │    analysis      │    │    practices     │      │
│  │  • Alternatives  │    │  • Dependencies  │    │  • Standards     │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB INTEGRATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  GitHub Sync Manager                                                  │  │
│  │  • Sync epic → GitHub Issue                                          │  │
│  │  • Sync tasks → Sub-issues                                           │  │
│  │  • Link to PRD/Epic documents                                        │  │
│  │  • Add labels, milestones, assignees                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BLACK BOX DEVELOPMENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Working Memory (.blackbox5/memory/working/{task-id}/)              │  │
│  │                                                                      │  │
│  │  history.json     - Complete action log                             │  │
│  │  thoughts.md      - Thought processes (Sequential Thinking)          │  │
│  │  plan.md          - Implementation plan                              │  │
│  │  agents/          - Per-agent execution logs                         │  │
│  │  artifacts/       - Generated code, tests, docs                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Vibe Kanban + MCP Multi-Agent System                                │  │
│  │                                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │Orchestrator│  │Code Agent  │  │Test Agent  │  │Docs Agent  │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │  │
│  │        │               │               │               │            │  │
│  │        └───────────────┴───────────────┴───────────────┘            │  │
│  │                        │                                         │  │
│  │                        ▼                                         │  │
│  │              Multi-Agent Collaboration                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TESTING & VALIDATION LAYER                            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  Test Agent      │    │  Review Agent    │    │  User Acceptance │      │
│  │                  │    │                  │    │                  │      │
│  │  • Unit tests    │    │  • Code review   │    │  • Manual test   │      │
│  │  • Integration   │    │  • Architecture  │    │  • Validation    │      │
│  │  • E2E tests     │    │  • Best practices│    │  • Sign-off      │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                         ┌─────────────┴─────────────┐
                         │   SUCCESS / FAILURE       │
                         └─────────────┬─────────────┘
                  SUCCESS                  │ FAILURE
                      │                      │
                      ▼                      ▼
         ┌─────────────────────┐    ┌─────────────────────┐
         │  ARCHIVE MEMORY      │    │  FEEDBACK LOOP      │
         │  (.blackbox5/memory/ │    │  (Re-enter          │
         │   archive/{task-id}/)│    │   development)      │
         └─────────────────────┘    └─────────────────────┘
```

## Data Models

### Task (Local Database)
```python
@dataclass
class LocalTask:
    task_id: str
    title: str
    category: TaskCategory  # GOALS, FEATURES, ISSUES, MAINTENANCE
    status: TaskStatus     # BACKLOG, SELECTED, IN_PRD, DEFERRED, ARCHIVED
    priority: TaskPriority # CRITICAL, HIGH, MEDIUM, LOW
    created_at: str
    updated_at: str
    description: str
    acceptance_criteria: List[str] = field(default_factory=list)
    estimated_complexity: Optional[str] = None
    prd_id: Optional[str] = None  # Links to PRD if created
```

### PRD Document
```python
@dataclass
class PRDDocument:
    prd_id: str
    title: str
    status: str
    created: str
    author: str

    # First Principles
    problem: Dict[str, Any]
    truths: Dict[str, Any]
    solution: Dict[str, Any]

    # Requirements
    functional_requirements: List[Dict[str, str]]
    non_functional_requirements: List[Dict[str, str]]

    # Success Metrics
    success_metrics: Dict[str, List[str]]

    # User Stories
    user_stories: List[str]

    # Traceability
    source_task_id: Optional[str] = None  # Links to local task
```

### Epic Document
```python
@dataclass
class EpicDocument:
    epic_id: str
    title: str
    prd_id: str
    status: str

    # Architecture
    architecture: Dict[str, Any]
    components: List[Component]

    # Technical Decisions
    technical_decisions: List[TechnicalDecision]

    # Acceptance Criteria
    acceptance_criteria: List[str]

    # Implementation Strategy
    implementation_phases: List[ImplementationPhase]
```

### Task (Development)
```python
@dataclass
class Task:
    task_id: str
    title: str
    description: str
    task_type: TaskType
    priority: TaskPriority
    status: str

    # Breakdown
    acceptance_criteria: List[AcceptanceCriterion]
    dependencies: List[TaskDependency]
    estimate: Optional[TaskEstimate]

    # Technical Details
    technical_notes: List[str]
    files_to_modify: List[str]

    # Traceability
    epic_id: str
    prd_id: str
    github_issue_id: Optional[int] = None
```

### Black Box Memory Entry
```python
@dataclass
class MemoryEntry:
    entry_id: str
    timestamp: str
    task_id: str
    agent_id: str
    entry_type: EntryType  # THOUGHT, ACTION, DECISION, PLAN

    # Content
    content: str
    metadata: Dict[str, Any]

    # Links
    related_entries: List[str]
    attachments: List[str]  # File paths
```

## State Machine

### Task States

```python
class TaskState(Enum):
    # Local Database States
    BACKLOG = "backlog"           # In local database, not selected
    SELECTED = "selected"         # Chosen for PRD flow
    IN_PRD = "in_prd"             # PRD generation in progress
    DEFERRED = "deferred"         # Decision to defer
    ARCHIVED = "archived"         # Completed locally (rare)

    # Git States
    IN_GIT = "in_git"             # Pushed to GitHub Issues
    ASSIGNED = "assigned"         # Agent assigned
    IN_DEVELOP = "in_develop"     # Black Box active
    IN_REVIEW = "in_review"       # Code review
    IN_TEST = "in_test"           # Testing

    # Final States
    DONE = "done"                 # Complete
    FAILED = "failed"             # Failed, needs loop
```

### State Transitions

```
BACKLOG → SELECTED (User selects task)
SELECTED → IN_PRD (PRD generation starts)
IN_PRD → DEFERRED (Go/No-Go: No)
IN_PRD → IN_GIT (Go/No-Go: Yes, after research)
IN_GIT → ASSIGNED (Agent assigned)
ASSIGNED → IN_DEVELOP (Black Box starts)
IN_DEVELOP → IN_REVIEW (Dev done)
IN_REVIEW → IN_TEST (Review passed)
IN_TEST → DONE (Success)
IN_TEST → FAILED (Failure)
FAILED → IN_DEVELOP (Feedback loop)
```

## API Interfaces

### CLI Commands

```bash
# Local Task Management
bb5 task:new --category features "Add dark mode"
bb5 task:list --category features
bb5 task:select TASK-001

# PRD Flow
bb5 prd:new "User Authentication" --task-id TASK-001
bb5 prd:validate prd-001-auth.md
bb5 epic:create --prd prd-001-auth.md
bb5 task:create epic-001-auth.md

# Git Sync
bb5 github:sync-epic epic-001-auth.md
bb5 github:update --issue 123 --status "in_develop"
bb5 github:close --issue 123

# Black Box
bb5 memory:init --task-id TASK-001
bb5 memory:track --action "Implement AuthService"
bb5 memory:thought "Should use JWT for tokens"
bb5 memory:archive --task-id TASK-001
```

### Agent APIs

```python
# PRD Agent
class PRDAgent:
    def create_prd(task_id: str) -> PRDDocument
    def validate_prd(prd: PRDDocument) -> ValidationResult

# Epic Agent
class EpicAgent:
    def create_epic(prd: PRDDocument) -> EpicDocument
    def validate_epic(epic: EpicDocument) -> ValidationResult

# Task Agent
class TaskAgent:
    def create_tasks(epic: EpicDocument) -> TaskDocument
    def validate_task(task: Task) -> List[str]

# Research Agent
class ResearchAgent:
    def analyze_codebase(task: Task) -> CodebaseAnalysis
    def assess_feasibility(task: Task) -> FeasibilityReport

# Orchestrator Agent
class OrchestratorAgent:
    def plan_approach(github_issue: int) -> ExecutionPlan
    def assign_agents(plan: ExecutionPlan) -> Dict[str, str]

# Specialist Agents
class CodeAgent:
    def implement(task: Task, plan: ExecutionPlan) -> ImplementationResult

class TestAgent:
    def test(task: Task) -> TestResult

class DocsAgent:
    def document(task: Task) -> DocumentationResult

# Memory Agent
class MemoryAgent:
    def log_action(task_id: str, action: str) -> None
    def log_thought(task_id: str, thought: str) -> None
    def log_decision(task_id: str, decision: str) -> None
    def archive(task_id: str) -> None
```

## Storage Schema

### File Structure

```
.blackbox5/
├── specs/
│   ├── backlog/
│   │   ├── goals/
│   │   │   ├── goal-001.md
│   │   │   └── goal-002.md
│   │   ├── features/
│   │   │   ├── feature-001.md
│   │   │   └── feature-002.md
│   │   ├── issues/
│   │   │   ├── issue-001.md
│   │   │   └── issue-002.md
│   │   └── maintenance/
│   │       ├── maint-001.md
│   │       └── maint-002.md
│   ├── prds/
│   │   ├── prd-001.md
│   │   └── prd-002.md
│   ├── epics/
│   │   ├── epic-001.md
│   │   └── epic-002.md
│   └── tasks/
│       ├── epic-001-tasks.md
│       └── epic-002-tasks.md
├── memory/
│   ├── working/
│   │   ├── TASK-001/
│   │   │   ├── history.json
│   │   │   ├── thoughts.md
│   │   │   ├── plan.md
│   │   │   ├── agents/
│   │   │   │   ├── orchestrator/
│   │   │   │   │   ├── log.json
│   │   │   │   │   └── thoughts.md
│   │   │   │   ├── code-agent/
│   │   │   │   │   ├── log.json
│   │   │   │   │   ├── thoughts.md
│   │   │   │   │   └── artifacts/
│   │   │   │   ├── test-agent/
│   │   │   │   └── docs-agent/
│   │   │   └── artifacts/
│   │   │       ├── code/
│   │   │       ├── tests/
│   │   │       └── docs/
│   │   └── TASK-002/
│   └── archive/
│       ├── TASK-001/
│       │   ├── complete-history.json
│       │   ├── final-thoughts.md
│       │   ├── execution-summary.md
│       │   ├── lessons-learned.md
│       │   └── artifacts/
│       └── TASK-002/
└── config/
    └── task-flow.yml
```

### JSON Schemas

#### history.json
```json
{
  "task_id": "TASK-001",
  "github_issue_id": 123,
  "started_at": "2024-01-18T10:00:00Z",
  "actions": [
    {
      "timestamp": "2024-01-18T10:05:00Z",
      "agent_id": "orchestrator",
      "action_type": "plan",
      "description": "Created execution plan",
      "details": {...}
    },
    {
      "timestamp": "2024-01-18T10:10:00Z",
      "agent_id": "code-agent",
      "action_type": "implement",
      "description": "Implemented AuthService",
      "details": {...}
    }
  ]
}
```

#### thoughts.md
```markdown
# Thoughts for TASK-001

## Orchestrator Agent (2024-01-18 10:05:00)

### Reasoning
Need to break down into 3 sub-tasks:
1. Implement AuthService
2. Implement PasswordHasher
3. Write tests

### Decision
Will use JWT for authentication, stored in HTTP-only cookies.

### Alternatives Considered
- Local Storage (rejected: XSS risk)
- Session Storage (rejected: lost on close)

## Code Agent (2024-01-18 10:15:00)

### Reasoning
AuthService needs to handle:
- Registration
- Login
- Token generation

### Implementation Approach
Will use bcrypt for password hashing.
Will use JWT with 24h expiry.
```

#### plan.md
```markdown
# Implementation Plan for TASK-001

## Overview
Implement user authentication system with JWT tokens.

## Architecture
- Client-server architecture
- HTTP-only cookies for token storage
- Bcrypt for password hashing

## Components
1. AuthService
2. PasswordHasher
3. Login endpoint
4. Register endpoint

## Execution Steps
1. Implement PasswordHasher
2. Implement AuthService
3. Create API endpoints
4. Write unit tests
5. Write integration tests

## Risk Mitigation
- Use established libraries (bcrypt, jsonwebtoken)
- Comprehensive test coverage
- Security review
```

## Agent Orchestration

### Vibe Kanban Integration

```
GitHub Issue #123: Implement AuthService
    │
    ▼
Vibe Kanban Column: "In Progress"
    │
    ├── Orchestrator Agent assigns work
    │       │
    │       ├── Code Agent → Implement AuthService
    │       │       └── Updates Black Box memory
    │       │
    │       ├── Test Agent → Write tests
    │       │       └── Updates Black Box memory
    │       │
    │       └── Docs Agent → Write documentation
    │               └── Updates Black Box memory
    │
    ▼
Move to "Review" column
    │
    ├── Review Agent validates
    │       │
    │       ├── PASS → Move to "Testing"
    │       └── FAIL → Return to "In Progress"
    │
    ▼
Move to "Testing" column
    │
    ├── Test Agent runs tests
    │       │
    │       ├── PASS → Move to "Done"
    │       └── FAIL → Return to "In Progress"
    │
    ▼
Move to "Done"
    │
    └── Archive to Black Box memory
```

### MCP Multi-Agent System

```python
# Orchestration
orchestrator = OrchestratorAgent()
plan = orchestrator.plan_approach(github_issue_id=123)

# Parallel execution
agents = {
    "code": CodeAgent(),
    "test": TestAgent(),
    "docs": DocsAgent()
}

# Assign work
assignments = orchestrator.assign_agents(plan)

# Execute in parallel
for agent_id, task in assignments.items():
    agents[agent_id].execute(task, memory=memory)

# Track in Black Box
memory.log_actions(task_id, assignments)
```

## Feedback Loop Implementation

```python
def handle_test_failure(task_id: str, failure_data: FailureData):
    """Handle testing failure with feedback loop"""

    # 1. Root cause analysis
    root_cause = analyze_failure(failure_data)

    # 2. Update Black Box memory
    memory.log_decision(
        task_id=task_id,
        decision=f"Test failed: {root_cause}"
    )

    # 3. Plan remediation
    remediation = plan_fix(root_cause)

    # 4. Re-enter development
    memory.update_state(
        task_id=task_id,
        new_state="IN_DEVELOP"
    )

    # 5. Execute fix
    orchestrator.assign_agents(remediation)
```

## Configuration

### task-flow.yml
```yaml
# BlackBox5 Task Flow Configuration

local_storage:
  backlog_dir: ".blackbox5/specs/backlog"
  categories:
    - goals
    - features
    - issues
    - maintenance

prd_flow:
  enable_first_principles: true
  require_acceptance_criteria: true
  require_success_metrics: true

github:
  auto_sync: false
  create_sub_issues: true
  link_documents: true

blackbox:
  memory_dir: ".blackbox5/memory"
  track_thoughts: true
  track_actions: true
  auto_archive_on_complete: true

agents:
  orchestrator:
    model: "claude-opus-4-5-20251101"
  code:
    model: "claude-sonnet-4-5-20250514"
  test:
    model: "claude-sonnet-4-5-20250514"
  docs:
    model: "claude-haiku-4-20250514"

testing:
  required_coverage: 80
  run_unit_tests: true
  run_integration_tests: true
  run_e2e_tests: false

feedback_loop:
  max_iterations: 3
  require_root_cause: true
```

## Monitoring & Observability

### Metrics to Track

1. **Cycle Time**: Time from selection to done
2. **Lead Time**: Time from backlog to done
3. **PRD Pass Rate**: % of tasks that pass Go/No-Go
4. **First Pass Success**: % of tasks that pass testing on first try
5. **Agent Performance**: Time per agent, success rate
6. **Feedback Loop Rate**: % of tasks that loop back

### Dashboards

```
┌─────────────────────────────────────────┐
│         Task Flow Dashboard             │
├─────────────────────────────────────────┤
│  Backlog:        42 tasks               │
│  In PRD:         3 tasks                │
│  In Git:         15 tasks               │
│  In Development: 8 tasks                │
│  In Testing:     5 tasks                │
│  Done:           156 tasks              │
├─────────────────────────────────────────┤
│  PRD Pass Rate:     85%                 │
│  First Pass Success: 72%                │
│  Avg Cycle Time:     3.2 days           │
└─────────────────────────────────────────┘
```

## Security Considerations

1. **Access Control**: Who can create/modify tasks
2. **GitHub Token**: Secure storage and rotation
3. **Memory Isolation**: Per-task memory separation
4. **Audit Trail**: Complete history of all actions
5. **Data Retention**: When to archive, when to delete

## Performance Optimization

1. **Caching**: Cache PRD/Epic/Task documents
2. **Parallel Agents**: Run multiple agents in parallel
3. **Incremental Sync**: Only sync changes to GitHub
4. **Memory Compression**: Compress old memory entries
5. **Lazy Loading**: Load history on-demand

## Future Enhancements

1. **Semantic Search**: Find similar tasks across history
2. **ML Predictions**: Estimate task complexity based on history
3. **Auto-Scheduling**: Suggest optimal task order
4. **Dependency Graph**: Visualize task dependencies
5. **Resource Allocation**: Balance agent workload

## Summary

This architecture provides:

1. **Flexible Local Storage**: Capture ideas without commitment
2. **Rigorous PRD Flow**: Gate to prevent waste
3. **Deep Research**: Understand before building
4. **Git Integration**: Leverage existing workflows
5. **Multi-Agent Development**: Parallel execution
6. **Complete Traceability**: Everything tracked
7. **Feedback Loop**: Continuous improvement
8. **Archival**: Learn from the past

The system is designed to scale from individual developers to teams, while maintaining complete traceability and enabling continuous learning.

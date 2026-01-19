# Complete Agent Orchestration Workflow
## Planning → Vibe Kanban → Parallel Agents → Autonomous Loops

**Question**: "Remember we want to be able to talk to an agent and plan all our tasks and then push them to vibe kanban to run many agents and then have some of these agents run the loop if they need to. Is this possible?"

**Answer**: ✅ **YES!** This is exactly how BlackBox5 is designed to work. Here's the complete workflow:

---

## 🎯 The Big Picture: 4-Phase Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Talk to Planning Agent                            │
│ "I need to build a multi-tenant SaaS app"                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Planning Agent Creates Tasks                       │
│ • Creates PRD (Product Requirements Document)               │
│ • Creates Epic (technical architecture)                     │
│ • Breaks down into 20+ tasks                               │
│ • Pushes everything to Vibe Kanban                         │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Vibe Kanban Orchestrates Parallel Agents          │
│ • Spins up 5 agents working in parallel                     │
│ • Each agent picks tasks from Kanban                        │
│ • Real-time status updates                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Agents Run Autonomous Loops (if needed)           │
│ • Complex tasks → Ralphy autonomous loop                    │
│ • Simple tasks → Direct completion                          │
│ • Results committed to git                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Detailed Step-by-Step Workflow

### Step 1: Talk to Planning Agent (You)

**You**: "I need to build a multi-tenant SaaS application with:
- User authentication
- Tenant isolation
- Billing integration
- Admin dashboard
- API endpoints"

**Planning Agent** (using BMAD method):
1. Analyzes requirements
2. Asks clarifying questions
3. Creates PRD with first principles
4. Designs architecture
5. Breaks down into tasks

**Output**:
```
.blackbox5/specs/
├── prds/
│   └── multi-tenant-saas-prd.md
├── epics/
│   └── multi-tenant-saas-epic.md
└── tasks/
    └── multi-tenant-saas-tasks.md
```

### Step 2: Planning Agent Pushes to Vibe Kanban

**What happens**:

```python
# Planning Agent runs this code
from blackbox5.engine.integrations.vibe import VibeKanbanManager

manager = VibeKanbanManager(api_url="http://localhost:3001")

# Create cards for each task
tasks = [
    {"title": "Setup Next.js project structure", "column": "backlog"},
    {"title": "Implement authentication", "column": "backlog"},
    {"title": "Create tenant model", "column": "backlog"},
    {"title": "Build admin dashboard", "column": "backlog"},
    {"title": "Setup billing integration", "column": "backlog"},
    {"title": "Create API endpoints", "column": "backlog"},
    # ... 20+ more tasks
]

for task in tasks:
    await manager.create_card(
        title=task["title"],
        description=f"From PRD: multi-tenant-saas",
        column=task["column"],
        labels=["multi-tenant", "backend"]
    )
```

**Vibe Kanban Board**:
```
┌─────────────────────────────────────────────────────┐
│ BACKLOG              │ DOING           │ DONE       │
├─────────────────────────────────────────────────────┤
│ • Setup Next.js      │                 │            │
│ • Authentication     │                 │            │
│ • Tenant model       │                 │            │
│ • Admin dashboard    │                 │            │
│ • Billing            │                 │            │
│ • API endpoints      │                 │            │
│ • ... (20+ tasks)    │                 │            │
└─────────────────────────────────────────────────────┘
```

### Step 3: Vibe Kanban Spins Up Parallel Agents

**Orchestrator Agent** sees the board and:

```python
# Orchestrator analyzes tasks
complex_tasks = [
    "Implement authentication",
    "Create tenant model",
    "Build admin dashboard"
]

simple_tasks = [
    "Setup Next.js project",
    "Create API endpoints",
    "Setup billing integration"
]

# Assign to agents
assignments = {
    "agent-1": ["Implement authentication"],
    "agent-2": ["Create tenant model"],
    "agent-3": ["Build admin dashboard"],
    "agent-4": simple_tasks  # Can handle multiple
}
```

**Parallel Execution**:
```
┌─────────────────────────────────────────────────────┐
│ AGENT 1                   │ AGENT 2                 │
│ Working on:               │ Working on:             │
│ Authentication            │ Tenant Model            │
│ • JWT tokens              │ • Database schema        │
│ • Login/logout            │ • Multi-tenancy         │
│ • Session mgmt            │ • Data isolation        │
└─────────────────────────────────────────────────────┘
              │                        │
              ▼                        ▼
┌─────────────────────────────────────────────────────┐
│ AGENT 3                   │ AGENT 4                 │
│ Working on:               │ Working on:             │
│ Admin Dashboard           │ Simple Tasks            │
│ • Dashboard UI            │ ✅ Setup Next.js        │
│ • User management         │ ✅ Create API            │
│ • Analytics               │ ✅ Setup billing         │
└─────────────────────────────────────────────────────┘
```

**Vibe Kanban Real-time Updates**:
```
BACKLOG → DOING → DONE
  │        │        │
  │        ├─ "Setup Next.js" → agent-4 → DONE ✅
  │        ├─ "Authentication" → agent-1 → IN_PROGRESS...
  │        ├─ "Tenant model" → agent-2 → IN_PROGRESS...
  │        └─ "Admin dashboard" → agent-3 → IN_PROGRESS...
```

### Step 4: Agents Run Autonomous Loops (if needed)

**Agent 1** (Authentication) realizes this is complex:

```python
# Agent 1 decides to use Ralphy
from blackbox5.engine.operations.runtime.ralphy import RalphyManager

manager = RalphyManager()

# Run autonomous loop for authentication
result = manager.execute_task(
    task="Implement complete authentication system with JWT, "
          "login/logout, session management, password reset",
    prd_file="specs/prds/multi-tenant-saas-prd.md",
    engine="claude"
)

# Ralphy runs the loop:
# Loop iteration 1: "Create user model"
# Loop iteration 2: "Create JWT service"
# Loop iteration 3: "Create auth controller"
# Loop iteration 4: "Add tests"
# Loop iteration 5: "Documentation"
# ...continues until complete

# All tracked in Blackbox Memory:
# .blackbox5/5-project-memory/siso-internal/operations/ralphy/
```

**Agent 2** (Tenant Model) also uses Ralphy:

```python
# Agent 2 runs Ralphy for tenant isolation
result = manager.execute_task(
    task="Implement multi-tenant data isolation with "
          "tenant_id filtering, row-level security",
    prd_file="specs/prds/multi-tenant-saas-prd.md",
    engine="claude"
)
```

**Agent 4** (Simple tasks) just does them directly:

```python
# No loop needed for simple tasks
def setup_nextjs():
    run("npx create-next-app@latest .")
    run("npm install --save typescript")
    # Done! Move card to DONE
```

---

## 🔧 How It All Works Together

### The Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. YOU TALK TO PLANNING AGENT                               │
│                                                              │
│ "Build multi-tenant SaaS"                                   │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PLANNING AGENT (BMAD Method)                             │
│                                                              │
│ • Creates PRD: .blackbox5/specs/prds/xxx.md                │
│ • Creates Epic: .blackbox5/specs/epics/xxx.md              │
│ • Creates Tasks: .blackbox5/specs/tasks/xxx.md             │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PUSH TO VIBE KANBAN                                      │
│                                                              │
│ manager.create_card(title, description, column="backlog")  │
│                                                              │
│ Creates 20+ cards in Vibe Kanban board                      │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ORCHESTRATOR SEES BOARD                                  │
│                                                              │
│ • Analyzes tasks                                            │
│ • Assigns to agents                                         │
│ • Plans parallel execution                                  │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PARALLEL AGENTS START WORKING                            │
│                                                              │
│ Agent-1: "Authentication" → Complex → Use Ralphy Loop      │
│ Agent-2: "Tenant Model" → Complex → Use Ralphy Loop        │
│ Agent-3: "Dashboard" → Complex → Use Ralphy Loop           │
│ Agent-4: "Setup Next.js" → Simple → Direct completion      │
│ Agent-5: "API endpoints" → Simple → Direct completion      │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. REAL-TIME UPDATES TO VIBE KANBAN                         │
│                                                              │
│ • Agent-4 completes "Setup Next.js" → Move to DONE         │
│ • Agent-5 completes "API endpoints" → Move to DONE         │
│ • Agent-1 running Ralphy loop → Update progress           │
│ • Agent-2 running Ralphy loop → Update progress           │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ALL AGENTS COMPLETE                                      │
│                                                              │
│ • All code written                                          │
│ • All tests passing                                         │
│ • All git commits made                                      │
│ • All cards moved to DONE                                   │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. RESULTS IN PROJECT MEMORY                                │
│                                                              │
│ .blackbox5/5-project-memory/siso-internal/operations/       │
│ ├── agents/                                                 │
│ │   ├── agent-1/sessions.json  (RALPHY sessions)           │
│ │   ├── agent-2/sessions.json  (RALPHY sessions)           │
│ │   ├── agent-3/sessions.json  (RALPHY sessions)           │
│ │   ├── agent-4/sessions.json  (direct tasks)             │
│ │   └── agent-5/sessions.json  (direct tasks)             │
│ └── ralphy/                                                 │
│     ├── sessions/ralphy/sessions.json (all loops)          │
│     └── insights.json (learned patterns)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Practical Example: Complete Code

### File 1: Planning Agent Workflow

```python
# .blackbox5/engine/agents/workflows/planning_agent.py

from pathlib import Path
from blackbox5.engine.integrations.vibe import VibeKanbanManager

class PlanningAgent:
    """Agent that plans tasks and pushes to Vibe Kanban"""

    def __init__(self):
        self.vibe_manager = VibeKanbanManager(
            api_url="http://localhost:3001"
        )

    def plan_and_push(self, user_request: str):
        """Plan tasks from user request and push to Kanban"""

        # Step 1: Create PRD
        prd_path = self.create_prd(user_request)
        print(f"✅ Created PRD: {prd_path}")

        # Step 2: Create Epic
        epic_path = self.create_epic(prd_path)
        print(f"✅ Created Epic: {epic_path}")

        # Step 3: Break down into tasks
        tasks = self.breakdown_tasks(epic_path)
        print(f"✅ Created {len(tasks)} tasks")

        # Step 4: Push to Vibe Kanban
        for task in tasks:
            self.vibe_manager.create_card(
                title=task["title"],
                description=task["description"],
                column="backlog",
                labels=task.get("labels", [])
            )
        print(f"✅ Pushed {len(tasks)} cards to Vibe Kanban")

        return {
            "prd": prd_path,
            "epic": epic_path,
            "tasks": len(tasks),
            "kanban_url": "http://localhost:3001"
        }

    def create_prd(self, user_request: str) -> Path:
        """Create Product Requirements Document"""
        prd_content = f"""
# PRD: {user_request}

## Problem Statement
[First principles analysis]

## User Stories
- As a user, I want...
- As an admin, I want...

## Success Metrics
- [ ] Metric 1
- [ ] Metric 2
"""
        prd_path = Path(".blackbox5/specs/prds/current-prd.md")
        prd_path.parent.mkdir(parents=True, exist_ok=True)
        prd_path.write_text(prd_content)
        return prd_path

    def create_epic(self, prd_path: Path) -> Path:
        """Create Epic with technical architecture"""
        epic_content = """
# Epic: Technical Architecture

## System Architecture
[Architecture decisions]

## Technology Stack
- Frontend: Next.js
- Backend: Python/FastAPI
- Database: PostgreSQL

## Components
[Component breakdown]
"""
        epic_path = Path(".blackbox5/specs/epics/current-epic.md")
        epic_path.write_text(epic_content)
        return epic_path

    def breakdown_tasks(self, epic_path: Path) -> list:
        """Break down epic into implementation tasks"""
        return [
            {
                "title": "Setup Next.js project",
                "description": "Initialize Next.js with TypeScript",
                "labels": ["setup", "frontend"],
                "complexity": "simple"
            },
            {
                "title": "Implement authentication",
                "description": "JWT-based auth with login/logout",
                "labels": ["auth", "backend"],
                "complexity": "complex"
            },
            {
                "title": "Create tenant model",
                "description": "Multi-tenant database schema",
                "labels": ["database", "backend"],
                "complexity": "complex"
            },
            # ... more tasks
        ]
```

### File 2: Orchestrator Agent

```python
# .blackbox5/engine/agents/workflows/orchestrator_agent.py

from blackbox5.engine.integrations.vibe import VibeKanbanManager
from blackbox5.engine.operations.runtime.ralphy import RalphyManager

class OrchestratorAgent:
    """Agent that orchestrates parallel execution"""

    def __init__(self):
        self.vibe_manager = VibeKanbanManager(
            api_url="http://localhost:3001"
        )
        self.ralphy_manager = RalphyManager()

    def orchestrate_parallel_execution(self):
        """Orchestrate parallel agent execution"""

        # Step 1: Get all cards from backlog
        backlog_cards = self.vibe_manager.get_cards(column="backlog")
        print(f"📋 Found {len(backlog_cards)} cards in backlog")

        # Step 2: Analyze and assign
        assignments = self.analyze_and_assign(backlog_cards)
        print(f"👥 Assigned to {len(assignments)} agents")

        # Step 3: Execute in parallel
        results = self.execute_parallel(assignments)
        print(f"✅ Completed {len(results)} tasks")

        return results

    def analyze_and_assign(self, cards: list) -> dict:
        """Analyze cards and assign to agents"""

        simple_tasks = [c for c in cards if self.is_simple(c)]
        complex_tasks = [c for c in cards if self.is_complex(c)]

        assignments = {}

        # Assign complex tasks to individual agents
        for i, task in enumerate(complex_tasks):
            agent_id = f"agent-{i+1}"
            assignments[agent_id] = {
                "task": task,
                "method": "ralphy_loop",
                "reason": "Complex task requiring autonomous loop"
            }

        # Group simple tasks
        if simple_tasks:
            assignments["agent-batch"] = {
                "tasks": simple_tasks,
                "method": "direct",
                "reason": "Simple tasks, direct execution"
            }

        return assignments

    def is_simple(self, card) -> bool:
        """Determine if card is simple"""
        keywords = ["setup", "config", "install", "create"]
        return any(k in card.title.lower() for k in keywords)

    def is_complex(self, card) -> bool:
        """Determine if card is complex"""
        keywords = ["implement", "build", "integrate", "system"]
        return any(k in card.title.lower() for k in keywords)

    def execute_parallel(self, assignments: dict) -> list:
        """Execute tasks in parallel"""

        import concurrent.futures

        results = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # Submit all tasks
            futures = {}
            for agent_id, assignment in assignments.items():
                if assignment["method"] == "ralphy_loop":
                    future = executor.submit(
                        self.execute_with_ralphy,
                        agent_id,
                        assignment["task"]
                    )
                else:
                    future = executor.submit(
                        self.execute_direct,
                        agent_id,
                        assignment["tasks"]
                    )
                futures[future] = agent_id

            # Collect results as they complete
            for future in concurrent.futures.as_completed(futures):
                agent_id = futures[future]
                try:
                    result = future.result()
                    results.append({
                        "agent": agent_id,
                        "result": result
                    })

                    # Update Vibe Kanban
                    self.vibe_manager.move_card(
                        result["card_id"],
                        "done"
                    )
                    print(f"✅ {agent_id} completed task")

                except Exception as e:
                    print(f"❌ {agent_id} failed: {e}")

        return results

    def execute_with_ralphy(self, agent_id: str, card) -> dict:
        """Execute complex task with Ralphy autonomous loop"""

        # Move card to doing
        self.vibe_manager.move_card(card.id, "doing")

        # Run Ralphy loop
        result = self.ralphy_manager.execute_task(
            task=card.description,
            prd_file="specs/prds/current-prd.md",
            engine="claude"
        )

        return {
            "card_id": card.id,
            "success": result.success,
            "files_created": result.files_created,
            "git_commit": result.git_commit
        }

    def execute_direct(self, agent_id: str, cards: list) -> dict:
        """Execute simple tasks directly"""

        results = []

        for card in cards:
            # Move to doing
            self.vibe_manager.move_card(card.id, "doing")

            # Execute directly (no loop)
            if "setup" in card.title.lower():
                self._setup_project()
            elif "api" in card.title.lower():
                self._create_api()

            # Move to done
            self.vibe_manager.move_card(card.id, "done")

            results.append({
                "card_id": card.id,
                "success": True
            })

        return results

    def _setup_project(self):
        """Setup Next.js project"""
        import subprocess
        subprocess.run(["npx", "create-next-app@latest", "."], check=True)

    def _create_api(self):
        """Create API endpoints"""
        # Implementation here
        pass
```

### File 3: Main Entry Point

```python
# main.py - How to use the complete workflow

from blackbox5.engine.agents.workflows.planning_agent import PlanningAgent
from blackbox5.engine.agents.workflows.orchestrator_agent import OrchestratorAgent

def main():
    """Complete workflow from planning to execution"""

    # Step 1: Plan tasks
    print("🎯 PHASE 1: Planning")
    planning_agent = PlanningAgent()
    plan_result = planning_agent.plan_and_push(
        user_request="Build multi-tenant SaaS with auth and billing"
    )

    print(f"\n✅ Planning complete:")
    print(f"  - PRD: {plan_result['prd']}")
    print(f"  - Epic: {plan_result['epic']}")
    print(f"  - Tasks: {plan_result['tasks']}")
    print(f"  - Kanban: {plan_result['kanban_url']}")

    # Step 2: Execute in parallel
    print("\n🚀 PHASE 2: Parallel Execution")
    orchestrator = OrchestratorAgent()
    execution_result = orchestrator.orchestrate_parallel_execution()

    print(f"\n✅ Execution complete:")
    print(f"  - Agents used: {len(execution_result)}")
    print(f"  - Tasks completed: {sum(1 for r in execution_result if r['result']['success'])}")

    # Step 3: Show results in Project Memory
    print("\n📊 PHASE 3: Results")
    print("Check Project Memory:")
    print("  .blackbox5/5-project-memory/siso-internal/operations/")
    print("  ├── agents/ (agent sessions)")
    print("  └── ralphy/ (autonomous loops)")

if __name__ == "__main__":
    main()
```

---

## 🎬 Real-World Example Session

### What You Would See

```bash
# You start the workflow
$ python main.py

🎯 PHASE 1: Planning
✅ Created PRD: .blackbox5/specs/prds/current-prd.md
✅ Created Epic: .blackbox5/specs/epics/current-epic.md
✅ Created 20 tasks
✅ Pushed 20 cards to Vibe Kanban

✅ Planning complete:
  - PRD: .blackbox5/specs/prds/current-prd.md
  - Epic: .blackbox5/specs/epics/current-epic.md
  - Tasks: 20
  - Kanban: http://localhost:3001

🚀 PHASE 2: Parallel Execution
📋 Found 20 cards in backlog
👥 Assigned to 5 agents

🔄 Agent-1 working on: "Implement authentication"
   → Using Ralphy autonomous loop
   → Loop iteration 1: Create user model
   → Loop iteration 2: Create JWT service
   → Loop iteration 3: Create auth controller
   → Loop iteration 4: Add tests
   → Loop iteration 5: Documentation
   ✅ Agent-1 completed task

🔄 Agent-2 working on: "Create tenant model"
   → Using Ralphy autonomous loop
   → Loop iteration 1: Design database schema
   → Loop iteration 2: Implement tenant isolation
   → Loop iteration 3: Add row-level security
   ✅ Agent-2 completed task

🔄 Agent-3 working on: "Build admin dashboard"
   → Using Ralphy autonomous loop
   ✅ Agent-3 completed task

🔄 Agent-batch working on: 5 simple tasks
   ✅ Setup Next.js project
   ✅ Create API endpoints
   ✅ Setup billing integration
   ✅ Configure TypeScript
   ✅ Setup ESLint
   ✅ Agent-batch completed task

✅ Execution complete:
  - Agents used: 5
  - Tasks completed: 20
  - Ralphy loops: 3
  - Direct tasks: 17

📊 PHASE 3: Results
Check Project Memory:
  .blackbox5/5-project-memory/siso-internal/operations/
  ├── agents/
  │   ├── agent-1/sessions.json (RALPHY: 5 iterations)
  │   ├── agent-2/sessions.json (RALPHY: 3 iterations)
  │   ├── agent-3/sessions.json (RALPHY: 4 iterations)
  │   └── agent-batch/sessions.json (17 direct tasks)
  └── ralphy/
      ├── sessions/ralphy/sessions.json (12 total iterations)
      └── insights.json (learned patterns)
```

---

## ✅ What Each Component Does

### Planning Agent
- **Talks to you** about requirements
- **Creates PRD** using first principles
- **Designs Epic** with architecture
- **Breaks down** into 20+ tasks
- **Pushes to Vibe Kanban** automatically

### Vibe Kanban
- **Visual board** showing all tasks
- **Real-time updates** as agents work
- **Tracks status**: backlog → doing → done
- **Manages parallel execution**

### Orchestrator Agent
- **Analyzes tasks** (complex vs simple)
- **Assigns to agents** (5 agents in parallel)
- **Monitors progress** in real-time
- **Handles failures** and retries

### Execution Agents
- **Complex tasks** → Run Ralphy autonomous loop
- **Simple tasks** → Direct execution
- **Update Vibe Kanban** with progress
- **Commit to git** when complete

### Ralphy (Autonomous Loop)
- **Runs iterative development**
- **Tracks progress** in Blackbox Memory
- **Creates files** and writes tests
- **Learns patterns** across sessions

---

## 🎯 Summary: Yes, It's Possible!

**What you want**:
1. ✅ Talk to agent to plan tasks
2. ✅ Push to Vibe Kanban
3. ✅ Run many agents in parallel
4. ✅ Some agents run autonomous loops

**How it works**:
```
You → Planning Agent → Vibe Kanban → Orchestrator → Parallel Agents
                                                    ↓
                                            Complex → Ralphy Loop
                                            Simple → Direct Execution
                                                    ↓
                                            All tracked in Project Memory
```

**Everything is already built!** You just need to:
1. Use Planning Agent to create tasks
2. Push to Vibe Kanban
3. Orchestrator automatically spins up parallel agents
4. Complex tasks use Ralphy, simple tasks direct
5. All tracked in Blackbox Memory

**This is the BlackBox5 production workflow!** 🚀

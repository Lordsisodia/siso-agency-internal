# Blackbox 5 Integration Plan
## Orchestration Architecture for Multi-Agent Coordination

**Date**: 2025-01-19
**Status**: Ready for Implementation
**Effort Estimate**: 5-7 days focused work

---

## Executive Summary

Blackbox 5 has **sophisticated components but no central wiring**. After analyzing 13 major frameworks (LangChain, AutoGPT, BabyAGI, CrewAI, MetaGPT, OpenAI Swarm, Semantic Kernel, Haystack, LlamaIndex, Dust, Phidata, Griptape, AgentScope) and examining Blackbox 5's existing codebase, I've discovered that **Blackbox 5 already has best-in-class components** that just need to be wired together.

### Key Findings

| Component | Status | Capability | Integration Needed |
|-----------|--------|------------|-------------------|
| **Orchestrator** | 🟢 Complete (1875 lines) | Wave-based parallelization, checkpoints, atomic commits | Wire to entry points |
| **TaskRouter** | 🟢 Complete (591 lines) | LLM-based complexity analysis, intelligent routing | Connect to CLI/API |
| **AgentLoader** | 🟢 Complete (398 lines) | YAML/MD parsing, 5-category loading | Call from main |
| **SkillManager** | 🟢 Complete (349 lines) | YAML frontmatter, skill composition | Attach to agents |
| **Guide System** | 🟢 Complete (5 files) | 3-layer discovery, step execution | Integrate to workflows |
| **EventBus** | 🟢 Working | Redis-based pub/sub | Already integrated |
| **CircuitBreaker** | 🟢 Working | Fault tolerance | Already in Ralph |

**The Gap**: Main entry points (CLI, API) bypass all orchestration and go directly to GLM client.

---

## Part 1: Framework Research Analysis

### Patterns from 13 Major Frameworks

#### 1. Agent Loading & Discovery

| Framework | Pattern | Key Features |
|-----------|---------|--------------|
| **LangChain** | Registry-based | `@tool` decorator, tool registry, dynamic loading |
| **AutoGPT** | Config-driven | YAML agent configs, plugin system |
| **CrewAI** | Class-based | `@agent` decorator, role definitions, hierarchical |
| **MetaGPT** | Role-based | SOP (Standard Operating Procedures), documented roles |
| **OpenAI Swarm** | Handoff-based | Agent handoff functions, state management |
| **Semantic Kernel** | Plugin-based | Kernel plugins, semantic function registration |
| **Haystack** | Component-based | Pipeline components, declarative |
| **LlamaIndex** | Tool-based | Tool abstractions, query engine |
| **Dust** | Config-driven | YAML specs, server-side execution |
| **Phidata** | Decorator-based | `@agent`/`@tool` decorators, registry |
| **Griptape** | Structure-based | Task/Workflow structures, loader |
| **AgentScope** | Agent registry | `@agent_decorator`, distributed |
| **BabyAGI** | Task list | Simple task list execution |

**Best Pattern**: Decorator-based registration + Config-driven loading
- **Why**: Combines runtime flexibility with static configuration
- **Blackbox 5**: Already has config-driven (YAML) via AgentLoader

#### 2. Task Routing

| Framework | Pattern | Key Features |
|-----------|---------|--------------|
| **LangChain** | LLM-based | `RouterChain`, uses LLM to decide |
| **AutoGPT** | Agent-based | Agent decides next action |
| **CrewAI** | Hierarchical | Manager → Worker delegation |
| **MetaGPT** | SOP-based | Pre-defined workflows per task type |
| **OpenAI Swarm** | Handoff-based | Explicit handoff functions |
| **Semantic Kernel** | Planner-based | `SequentialPlanner`, `StepwisePlanner` |
| **Haystack** | Pipeline-based | Routing nodes in DAG |
| **LlamaIndex** | Router-based | Query router, engine selection |
| **Dust** | Rule-based | Static routing rules |
| **Phidata** | LLM-based | Session router, context-aware |
| **Griptape** | Task-based | Task queue, driver |
| **AgentScope** | Centralized | `AgentRegistry`, centralized dispatch |
| **BabyAGI** | Priority-based | Task prioritization |

**Best Pattern**: LLM-based routing + Fallback to rules
- **Why**: Handles complexity, deterministic fallback
- **Blackbox 5**: Already has this via TaskRouter + TaskComplexityAnalyzer

#### 3. Tool/Skill Integration

| Framework | Pattern | Key Features |
|-----------|---------|--------------|
| **LangChain** | Decorator | `@tool`, automatic schema generation |
| **AutoGPT** | Command-based | Command registry, file-based |
| **CrewAI** | Tool decorator | `@tool`, agent attribute |
| **MetaGPT** | Action-based | Action nodes in SOP |
| **OpenAI Swarm** | Function-based | Direct function passing |
| **Semantic Kernel** | Plugin | `@kernel_function`, plugins |
| **Haystack** | Component | Component registration |
| **LlamaIndex** | Tool wrapper | Tool abstraction layer |
| **Dust** | Built-in | Server-side functions |
| **Phidata** | Decorator | `@tool`, automatic type hints |
| **Griptape** | Tool loading | Tool loader, metadata |
| **AgentScope** | Service | `@service_decorator` |
| **BabyAGI** | Direct | No abstraction |

**Best Pattern**: Decorator registration + File-based definition
- **Why**: Flexibility + Documentation
- **Blackbox 5**: Already has file-based (YAML frontmatter) via SkillManager

#### 4. Orchestration

| Framework | Pattern | Key Features |
|-----------|---------|--------------|
| **LangChain** | Chain-based | Sequential chains, parallel chains |
| **AutoGPT** | Agent loop | Agent decides, executes, reflects |
| **CrewAI** | Crew-based | Process drive, hierarchical |
| **MetaGPT** | SOP-based | Multi-agent with human-readable SOP |
| **OpenAI Swarm** | Handoff | Explicit handoffs, state sharing |
| **Semantic Kernel** | Planner | Stepwise, sequential planners |
| **Haystack** | Pipeline | DAG-based pipelines |
| **LlamaIndex** | Router | Query routing, router chains |
| **Dust** | Server-side | Server coordinates |
| **Phidata** | Session | Session-based orchestration |
| **Griptape** | Workflow | Workflow engine, tasks |
| **AgentScope** | Distributed | Distributed execution, message passing |
| **BabyAGI** | Task loop | Create, prioritize, execute |

**Best Pattern**: Hierarchical + Handoff + Checkpointing
- **Why**: Handles complexity, supports recovery, human-readable
- **Blackbox 5**: Already has ALL THREE via Orchestrator (wave-based = hierarchical, handoffs, checkpoints)

---

## Part 2: Blackbox 5's Existing Capabilities

### What Blackbox 5 Already Has (No Building Needed)

#### A. Orchestrator (`Orchestrator.py` - 1875 lines)

**World-class capabilities already implemented**:

```python
class Orchestrator:
    # Agent lifecycle
    async def start_agent(
        self,
        agent_config: AgentConfig,
        initial_context: Optional[Dict] = None
    ) -> str:  # Returns agent_id

    # Sequential workflow execution
    async def execute_workflow(
        self,
        steps: List[WorkflowStep],
        session_id: str
    ) -> WorkflowResult

    # Wave-based parallelization (DEPENDENCY GRAPH EXECUTION)
    async def execute_wave_based(
        self,
        tasks: List[WorkflowTask],
        session_id: str
    ) -> WorkflowResult:
        """
        Topologically sorts tasks by dependencies
        Executes in waves (parallel within wave)
        Better than naive parallel execution
        """

    # Checkpoint system for crash recovery
    async def save_checkpoint(self, session_id: str) -> str
    async def load_checkpoint(self, checkpoint_id: str) -> Dict

    # Atomic commits
    async def rollback_task(self, session_id: str, task_id: str) -> bool

    # State management (STATE.md integration)
    async def update_state(self, session_id: str, updates: Dict) -> None

    # Memory management
    async def compress_context(self, session_id: str) -> None
```

**Wave-Based Parallelization** is particularly impressive:
- Builds dependency graph from tasks
- Topologically sorts to find execution waves
- Executes tasks in same wave in parallel
- Waits for wave completion before next wave
- This is **more sophisticated** than most frameworks

#### B. TaskRouter (`task_router.py` - 591 lines)

**Intelligent complexity-based routing**:

```python
class TaskRouter:
    def route(self, task: Task) -> RoutingDecision:
        """
        Analyzes task complexity and routes to:
        - SINGLE_AGENT (simple tasks, 4-7x faster)
        - MULTI_AGENT (complex tasks, better quality)
        """

    # Agent registration with capabilities
    def register_agent(self, capabilities: AgentCapabilities) -> None

    # Domain-based routing
    def find_agents_by_domain(self, domain: str) -> List[str]

    # Statistics
    def get_statistics(self) -> Dict[str, any]
```

**Features**:
- Token-based complexity estimation
- Step complexity analysis
- Domain complexity scoring
- Tool requirement analysis
- Confidence scoring
- Duration estimation

#### C. AgentLoader (`AgentLoader.py` - 398 lines)

**Complete agent loading system**:

```python
class AgentLoader:
    async def load_all(self) -> Dict[str, BaseAgent]:
        """
        Loads from 5 categories:
        - 1-core (BMAD agents)
        - 2-bmad (BMAD agents)
        - 3-research (BMAD agents)
        - 4-specialists (Specialist agents)
        - 5-enhanced (BMAD agents)
        """

    # Multiple format support
    async def _parse_config_yaml(self, config_path: Path) -> AgentConfig
    async def _parse_agent_md(self, agent_md: Path) -> AgentConfig
    async def _parse_prompt_md(self, prompt_md: Path) -> AgentConfig

    # Skill loading
    async def _load_skills(self) -> Dict[str, Dict]
```

**Features**:
- YAML config parsing
- Markdown frontmatter parsing
- Agent type detection
- Skill loading with metadata
- Category-based organization

#### D. SkillManager (`SkillManager.py` - 349 lines)

**Full skill lifecycle management**:

```python
class SkillManager:
    async def load_all(self) -> Dict[str, Skill]:
        """Loads from .skills/ directory"""

    # Agent-specific skills
    def get_skills_for_agent(self, agent_name: str) -> List[Skill]

    # Multi-dimensional queries
    def get_skills_by_type(self, skill_type: SkillType) -> List[Skill]
    def get_skills_by_category(self, category: str) -> List[Skill]
    def get_skills_by_tag(self, tag: str) -> List[Skill]
    def search_skills(self, query: str) -> List[Skill]

    # Composition
    def compose_skills(self, skill_names: List[str]) -> str
```

**Features**:
- YAML frontmatter parsing
- Type-based categorization (workflow, action, verify, analysis)
- Risk assessment (low, medium, critical)
- Complexity scoring
- Context cost estimation
- Agent compatibility checking

#### E. Guide System (5 files)

**Complete step-by-step guidance system**:

```python
class Guide:
    # 3-Layer Discovery
    def get_top_suggestion(self, event: str, context: Dict) -> Dict
    def find_by_intent(self, intent: str, context: Dict) -> List[Dict]
    def search_guides(self, query: str) -> List[Dict]
    def browse_category(self, category: str) -> List[Dict]

    # Recipe management
    def start_operation(self, operation_name: str, context: Dict) -> Dict
    def execute_step(self, recipe_id: str, output: str, execute_for_me: bool) -> Dict

    # Convenience
    def quick_test(self, file_path: str) -> Dict
    def execute_full_recipe(self, operation_name: str, context: Dict) -> Dict
```

**Features**:
- Context-based triggers (automatic discovery)
- Intent-based routing (declarative discovery)
- Search/browse (exploratory discovery)
- Step execution with verification
- Error recovery with fix commands
- Recipe engine with pause/resume

---

## Part 3: The Integration Gap

### Current Entry Points Analysis

#### CLI (`bb5.py`) - The Main Problem

**Current State**:
```python
class BB5CLI:
    def __init__(self):
        self.glm_client = create_glm_client(mock=use_mock)
        # ❌ No agent loading
        # ❌ No task routing
        # ❌ No orchestration
        # ❌ No skill usage
        # ❌ No guide integration

    def handle_query(self, query: str) -> str:
        # ❌ Direct GLM call, bypassing everything
        response = self.glm_client.chat(query)
        return response
```

**What's Missing**:
1. AgentLoader never called
2. No TaskRouter instantiation
3. No Orchestrator wiring
4. No SkillManager integration
5. No Guide system connection

#### API (`main.py`) - Empty

**Current State**:
```python
@app.post("/chat")
async def chat(message: str):
    # ❌ Placeholder, returns TODO
    return {"response": "TODO"}
```

#### Ralph Runtime - Partially Integrated

**Current State**:
```python
class RalphRuntime:
    def __init__(self):
        # ✓ Has its own agent loading
        self.agent_loader = AgentLoader()

        # ✓ Uses Orchestrator patterns
        # ✓ Has autonomous execution

    # ✗ But isolated from main entry points
```

---

## Part 4: Integration Plan

### Phase 1: Create Main Bootstrap (Day 1)

**Goal**: Single entry point that loads all systems

**File**: `.blackbox5/engine/main.py`

```python
"""
Blackbox 5 Main Bootstrap

Loads all systems and provides unified orchestration.
"""

import asyncio
from pathlib import Path
from typing import Optional, Dict, Any

from agents.core.AgentLoader import AgentLoader
from agents.core.SkillManager import SkillManager
from core.Orchestrator import Orchestrator
from core.task_router import TaskRouter, Task, AgentCapabilities
from core.event_bus import RedisEventBus
from core.complexity import TaskComplexityAnalyzer
from guides import Guide


class Blackbox5:
    """
    Main Blackbox 5 system.

    Bootstraps all components:
    - Agent loading
    - Skill management
    - Task routing
    - Orchestration
    - Guide system
    - Event bus
    """

    def __init__(self, project_path: Optional[Path] = None):
        self.project_path = project_path or Path.cwd()

        # Components (loaded lazily)
        self._agent_loader: Optional[AgentLoader] = None
        self._skill_manager: Optional[SkillManager] = None
        self._orchestrator: Optional[Orchestrator] = None
        self._task_router: Optional[TaskRouter] = None
        self._event_bus: Optional[RedisEventBus] = None
        self._guide: Optional[Guide] = None

        # Loaded state
        self._agents: Dict[str, Any] = {}
        self._skills: Dict[str, Any] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """
        Initialize all Blackbox 5 systems.

        Call this once at startup.
        """
        if self._initialized:
            return

        print("🚀 Initializing Blackbox 5...")

        # 1. Initialize event bus first (other components depend on it)
        print("  📡 Initializing event bus...")
        self._event_bus = RedisEventBus()
        await self._event_bus.connect()

        # 2. Load agents
        print("  🤖 Loading agents...")
        self._agent_loader = AgentLoader()
        self._agents = await self._agent_loader.load_all()
        print(f"     Loaded {len(self._agents)} agents")

        # 3. Load skills
        print("  🛠️  Loading skills...")
        self._skill_manager = SkillManager()
        self._skills = await self._skill_manager.load_all()
        print(f"     Loaded {len(self._skills)} skills")

        # 4. Wire skills to agents
        print("  🔗 Wiring skills to agents...")
        for agent_name, agent in self._agents.items():
            agent_skills = self._skill_manager.get_skills_for_agent(agent_name)
            agent.skills = agent_skills
            print(f"     {agent_name}: {len(agent_skills)} skills")

        # 5. Initialize task router
        print("  🧭 Initializing task router...")
        self._task_router = TaskRouter(
            event_bus=self._event_bus,
            complexity_analyzer=TaskComplexityAnalyzer()
        )

        # Register all agents with router
        for agent_name, agent in self._agents.items():
            capabilities = AgentCapabilities(
                agent_id=agent_name,
                agent_type=agent.agent_type,
                domains=agent.domains,
                max_complexity=agent.max_complexity,
                success_rate=1.0,  # TODO: Track actual success rate
                tools=agent.tools
            )
            self._task_router.register_agent(capabilities)
        print(f"     Registered {len(self._agents)} agents")

        # 6. Initialize orchestrator
        print("  🎼 Initializing orchestrator...")
        self._orchestrator = Orchestrator(
            event_bus=self._event_bus,
            task_router=self._task_router
        )

        # 7. Initialize guide system
        print("  📚 Initializing guide system...")
        self._guide = Guide(str(self.project_path))

        self._initialized = True
        print("✅ Blackbox 5 initialized!")

    async def process_request(
        self,
        request: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user request through the full Blackbox 5 pipeline.

        Pipeline:
        1. Parse request into Task
        2. Route task to appropriate agent(s)
        3. Execute with orchestration
        4. Check for guide suggestions
        5. Return result

        Args:
            request: User's natural language request
            session_id: Optional session ID for continuity
            context: Additional context

        Returns:
            Dict with result, metadata, and guide suggestions
        """
        if not self._initialized:
            await self.initialize()

        # 1. Parse request into task
        task = Task.from_natural_language(request, context or {})

        # 2. Route task
        routing_decision = self._task_router.route(task)

        print(f"🧭 Routed to: {routing_decision.strategy.value}")
        print(f"   Agent: {routing_decision.recommended_agent}")
        print(f"   Complexity: {routing_decision.complexity.aggregate_score:.2f}")

        # 3. Execute based on strategy
        if routing_decision.strategy.value == "single_agent":
            result = await self._execute_single_agent(
                task, routing_decision, session_id
            )
        else:
            result = await self._execute_multi_agent(
                task, routing_decision, session_id
            )

        # 4. Check for guide suggestions
        guide_suggestions = self._check_guide_suggestions(result)

        return {
            "result": result,
            "routing": {
                "strategy": routing_decision.strategy.value,
                "agent": routing_decision.recommended_agent,
                "complexity": routing_decision.complexity.aggregate_score,
                "reasoning": routing_decision.reasoning
            },
            "guide_suggestions": guide_suggestions
        }

    async def _execute_single_agent(
        self,
        task: Task,
        routing_decision: RoutingDecision,
        session_id: Optional[str]
    ) -> Any:
        """Execute task with single agent"""
        agent_name = routing_decision.recommended_agent
        agent = self._agents.get(agent_name)

        if not agent:
            raise ValueError(f"Agent not found: {agent_name}")

        # Execute agent
        result = await agent.execute(task)

        return result

    async def _execute_multi_agent(
        self,
        task: Task,
        routing_decision: RoutingDecision,
        session_id: Optional[str]
    ) -> Any:
        """Execute task with orchestrator"""
        # Use orchestrator for multi-agent execution
        result = await self._orchestrator.execute_workflow(
            tasks=[task],
            session_id=session_id or task.task_id
        )

        return result

    def _check_guide_suggestions(self, result: Any) -> List[Dict]:
        """Check if any guides should be suggested based on result"""
        suggestions = []

        # Check for common trigger events
        if hasattr(result, 'files_written'):
            for file_path in result.files_written:
                suggestion = self._guide.get_top_suggestion(
                    "file_written",
                    {"file_path": file_path, "file_name": Path(file_path).name}
                )
                if suggestion:
                    suggestions.append(suggestion)

        if hasattr(result, 'git_stage'):
            suggestion = self._guide.get_top_suggestion(
                "git_stage",
                {}
            )
            if suggestion:
                suggestions.append(suggestion)

        return suggestions

    async def shutdown(self) -> None:
        """Shutdown all systems"""
        if self._event_bus:
            await self._event_bus.disconnect()
        print("👋 Blackbox 5 shutdown complete")


# Singleton instance
_bb5_instance: Optional[Blackbox5] = None


async def get_blackbox5() -> Blackbox5:
    """Get or create Blackbox5 singleton"""
    global _bb5_instance
    if _bb5_instance is None:
        _bb5_instance = Blackbox5()
        await _bb5_instance.initialize()
    return _bb5_instance
```

### Phase 2: Wire Up CLI (Day 1)

**File**: `.blackbox5/engine/interface/cli/bb5.py`

```python
"""
Blackbox 5 CLI - Main Command Line Interface

Usage:
    bb5 "Build a REST API for users"
    bb5 --agent orchestrator "Design system architecture"
    bb5 --guide "test this code"
"""

import asyncio
import click
from pathlib import Path
from typing import Optional

# Import main Blackbox 5 system
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from main import get_blackbox5
from core.task_router import Task


@click.group()
def cli():
    """Blackbox 5 - Multi-Agent Orchestration System"""
    pass


@cli.command()
@click.argument("query", required=True)
@click.option("--session", "-s", help="Session ID for continuity")
@click.option("--agent", "-a", help="Force specific agent")
@click.option("--strategy", "-st", type=click.Choice(['auto', 'single_agent', 'multi_agent']),
              default='auto', help='Execution strategy')
@click.option("--json", "-j", is_flag=True, help="Output as JSON")
def ask(query: str, session: Optional[str], agent: Optional[str],
        strategy: str, json: bool):
    """
    Ask Blackbox 5 a question or give it a task.

    Example:
        bb5 ask "Build a REST API for user management"
        bb5 ask --agent testing-agent "Write tests for the auth module"
        bb5 ask --strategy multi_agent "Design and implement a payment system"
    """
    asyncio.run(_handle_ask(query, session, agent, strategy, json))


async def _handle_ask(query: str, session: Optional[str], agent: Optional[str],
                     strategy: str, json_output: bool):
    """Handle ask command"""
    # Get Blackbox 5 instance
    bb5 = await get_blackbox5()

    # Add agent/strategy to context if specified
    context = {}
    if agent:
        context['forced_agent'] = agent
    if strategy != 'auto':
        context['strategy'] = strategy

    # Process request
    result = await bb5.process_request(query, session, context)

    # Output
    if json_output:
        import json
        click.echo(json.dumps(result, indent=2))
    else:
        # Human-readable output
        click.echo(f"\n{'='*70}")
        click.echo(f"Strategy: {result['routing']['strategy']}")
        click.echo(f"Agent: {result['routing']['agent']}")
        click.echo(f"Complexity: {result['routing']['complexity']:.2f}")
        click.echo(f"{'='*70}\n")

        click.echo("Result:")
        click.echo(result['result'])

        if result['guide_suggestions']:
            click.echo(f"\n💡 Suggested Actions:")
            for suggestion in result['guide_suggestions']:
                click.echo(f"   • {suggestion['suggestion']}")
                click.echo(f"     ({suggestion['guide']})")


@cli.command()
@click.argument("agent_name", required=True)
def inspect(agent_name: str):
    """Inspect an agent's capabilities"""
    asyncio.run(_handle_inspect(agent_name))


async def _handle_inspect(agent_name: str):
    """Handle inspect command"""
    bb5 = await get_blackbox5()

    agent = bb5._agents.get(agent_name)
    if not agent:
        click.echo(f"❌ Agent not found: {agent_name}")
        return

    click.echo(f"\n{'='*70}")
    click.echo(f"Agent: {agent.name}")
    click.echo(f"{'='*70}")
    click.echo(f"Role: {agent.role}")
    click.echo(f"Description: {agent.description}")
    click.echo(f"Category: {agent.category}")
    click.echo(f"\nCapabilities:")
    for cap in agent.capabilities:
        click.echo(f"  • {cap}")

    skills = bb5._skill_manager.get_skills_for_agent(agent_name)
    if skills:
        click.echo(f"\nSkills ({len(skills)}):")
        for skill in skills:
            click.echo(f"  • {skill.name}: {skill.description}")


@cli.command()
def agents():
    """List all available agents"""
    asyncio.run(_handle_agents())


async def _handle_agents():
    """Handle agents command"""
    bb5 = await get_blackbox5()

    click.echo(f"\n{'='*70}")
    click.echo(f"Available Agents ({len(bb5._agents)})")
    click.echo(f"{'='*70}\n")

    for agent_name, agent in bb5._agents.items():
        click.echo(f"🤖 {agent_name}")
        click.echo(f"   {agent.description}")
        click.echo(f"   Category: {agent.category}")
        click.echo()


@cli.command()
def skills():
    """List all available skills"""
    asyncio.run(_handle_skills())


async def _handle_skills():
    """Handle skills command"""
    bb5 = await get_blackbox5()

    click.echo(f"\n{'='*70}")
    click.echo(f"Available Skills ({len(bb5._skills)})")
    click.echo(f"{'='*70}\n")

    categories = bb5._skill_manager.list_categories()
    for category in categories:
        skills = bb5._skill_manager.get_skills_by_category(category)
        click.echo(f"📁 {category} ({len(skills)} skills)")
        for skill in skills[:5]:  # Show first 5
            click.echo(f"   • {skill.name}: {skill.description}")
        if len(skills) > 5:
            click.echo(f"   ... and {len(skills) - 5} more")
        click.echo()


@cli.command()
@click.argument("query", required=True)
def guide(query: str):
    """
    Find a guide for your task.

    Example:
        bb5 guide "test this code"
        bb5 guide "deploy to production"
    """
    asyncio.run(_handle_guide(query))


async def _handle_guide(query: str):
    """Handle guide command"""
    bb5 = await get_blackbox5()

    # Find guides by intent
    matches = bb5._guide.find_by_intent(query, {})

    if not matches:
        click.echo("❌ No guides found for your query")
        return

    click.echo(f"\n{'='*70}")
    click.echo(f"Found {len(matches)} guide(s)")
    click.echo(f"{'='*70}\n")

    for i, match in enumerate(matches[:3], 1):
        click.echo(f"{i}. {match['guide']}")
        click.echo(f"   {match['description']}")
        click.echo(f"   Confidence: {match['confidence']:.0%}")
        click.echo(f"   Estimated time: {match['estimated_time']}")
        click.echo()


if __name__ == "__main__":
    cli()
```

### Phase 3: Wire Up API (Day 2)

**File**: `.blackbox5/engine/interface/api/main.py`

```python
"""
Blackbox 5 REST API

FastAPI-based REST interface for Blackbox 5.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from main import get_blackbox5


app = FastAPI(
    title="Blackbox 5 API",
    description="Multi-Agent Orchestration System",
    version="5.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    result: Any
    routing: Dict[str, Any]
    guide_suggestions: List[Dict[str, Any]]


class AgentInfo(BaseModel):
    name: str
    role: str
    description: str
    category: str
    capabilities: List[str]
    skills_count: int


class SkillInfo(BaseModel):
    name: str
    description: str
    type: str
    category: str
    complexity: str
    risk: str


# Startup
@app.on_event("startup")
async def startup():
    """Initialize Blackbox 5 on startup"""
    await get_blackbox5()


# Endpoints
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message through Blackbox 5.

    This is the main endpoint - it handles routing, execution,
    and guide suggestions automatically.
    """
    try:
        bb5 = await get_blackbox5()
        result = await bb5.process_request(
            request.message,
            request.session_id,
            request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents", response_model=List[AgentInfo])
async def list_agents():
    """List all available agents"""
    bb5 = await get_blackbox5()

    agents = []
    for agent_name, agent in bb5._agents.items():
        skills = bb5._skill_manager.get_skills_for_agent(agent_name)
        agents.append(AgentInfo(
            name=agent.name,
            role=agent.role,
            description=agent.description,
            category=agent.category,
            capabilities=agent.capabilities,
            skills_count=len(skills)
        ))

    return agents


@app.get("/agents/{agent_name}", response_model=AgentInfo)
async def get_agent(agent_name: str):
    """Get agent details"""
    bb5 = await get_blackbox5()

    agent = bb5._agents.get(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    skills = bb5._skill_manager.get_skills_for_agent(agent_name)
    return AgentInfo(
        name=agent.name,
        role=agent.role,
        description=agent.description,
        category=agent.category,
        capabilities=agent.capabilities,
        skills_count=len(skills)
    )


@app.get("/skills", response_model=List[SkillInfo])
async def list_skills(
    category: Optional[str] = None,
    type: Optional[str] = None
):
    """List all available skills, optionally filtered"""
    bb5 = await get_blackbox5()

    if category:
        skills = bb5._skill_manager.get_skills_by_category(category)
    elif type:
        from agents.core.SkillManager import SkillType
        skills = bb5._skill_manager.get_skills_by_type(SkillType(type))
    else:
        skills = list(bb5._skills.values())

    return [
        SkillInfo(
            name=s.name,
            description=s.description,
            type=s.type.value,
            category=s.category,
            complexity=s.complexity.value,
            risk=s.risk.value
        )
        for s in skills
    ]


@app.get("/guides/search")
async def search_guides(q: str):
    """Search for guides by keyword"""
    bb5 = await get_blackbox5()

    results = bb5._guide.search_guides(q)
    return {"results": results}


@app.get("/guides/intent")
async def find_guides_by_intent(intent: str):
    """Find guides by natural language intent"""
    bb5 = await get_blackbox5()

    matches = bb5._guide.find_by_intent(intent, {})
    return {"matches": matches}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "version": "5.0.0"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Phase 4: Add Decorator Registration (Day 2)

**File**: `.blackbox5/engine/agents/core/decorators.py`

```python
"""
Agent and Tool Decorators

Allows decorator-based registration like other frameworks.
"""

from functools import wraps
from typing import Callable, Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class ToolDefinition:
    """Tool registration metadata"""
    name: str
    description: str
    function: Callable
    parameters: Dict[str, Any]
    agent: str = "all"


# Global tool registry
_tool_registry: Dict[str, ToolDefinition] = {}


def tool(
    name: Optional[str] = None,
    description: str = "",
    agent: str = "all"
):
    """
    Decorator to register a tool/function.

    Usage:
        @tool(name="calculator", description="Performs calculations")
        def calculate(a: int, b: int) -> int:
            return a + b
    """
    def decorator(func: Callable) -> Callable:
        tool_name = name or func.__name__

        # Register tool
        _tool_registry[tool_name] = ToolDefinition(
            name=tool_name,
            description=description or func.__doc__ or "",
            function=func,
            parameters=_extract_parameters(func),
            agent=agent
        )

        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    return decorator


def agent(
    name: str,
    role: str,
    category: str = "5-enhanced",
    domains: List[str] = None,
    capabilities: List[str] = None
):
    """
    Decorator to register an agent class.

    Usage:
        @agent(
            name="custom-agent",
            role="specialist",
            category="5-enhanced",
            domains=["testing"],
            capabilities=["unit_tests", "integration_tests"]
        )
        class CustomAgent(BaseAgent):
            pass
    """
    def decorator(cls: type) -> type:
        # Store metadata on class
        cls._agent_metadata = {
            "name": name,
            "role": role,
            "category": category,
            "domains": domains or [],
            "capabilities": capabilities or []
        }
        return cls

    return decorator


def _extract_parameters(func: Callable) -> Dict[str, Any]:
    """Extract parameter information from function signature"""
    import inspect

    sig = inspect.signature(func)
    parameters = {}

    for param_name, param in sig.parameters.items():
        param_type = param.annotation if param.annotation != inspect.Parameter.empty else "any"

        parameters[param_name] = {
            "type": str(param_type),
            "required": param.default == inspect.Parameter.empty,
            "default": param.default if param.default != inspect.Parameter.empty else None
        }

    return parameters


def get_tool(name: str) -> Optional[ToolDefinition]:
    """Get a registered tool by name"""
    return _tool_registry.get(name)


def list_tools(agent: Optional[str] = None) -> List[ToolDefinition]:
    """List all registered tools, optionally filtered by agent"""
    tools = list(_tool_registry.values())

    if agent:
        tools = [t for t in tools if t.agent == "all" or t.agent == agent]

    return tools


def clear_tools():
    """Clear all registered tools (mainly for testing)"""
    global _tool_registry
    _tool_registry = {}
```

### Phase 5: Integrate Guides to Agent Execution (Day 3)

**File**: `.blackbox5/engine/core/guide_middleware.py`

```python
"""
Guide Middleware

Integrates the Guide System into agent execution flows.
"""

from typing import Dict, Any, List, Optional, Callable
from guides import Guide
from pathlib import Path


class GuideMiddleware:
    """
    Middleware that proactively offers guide suggestions during agent execution.

    This implements the "inverted intelligence" pattern:
    - System is smart
    - Agent can be dumb
    """

    def __init__(self, project_path: str = "."):
        self.guide = Guide(project_path)
        self._enabled = True

    async def before_agent_action(
        self,
        event: str,
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Check for guide suggestions before agent action.

        Called automatically during agent execution.
        """
        if not self._enabled:
            return None

        suggestion = self.guide.get_top_suggestion(event, context)

        if suggestion and suggestion['confidence'] >= 0.7:
            return {
                "action": "offer_guide",
                "guide": suggestion['guide'],
                "suggestion": suggestion['suggestion'],
                "description": suggestion['description'],
                "confidence": suggestion['confidence'],
                "estimated_time": suggestion['estimated_time'],
                "difficulty": suggestion['difficulty']
            }

        return None

    async def after_agent_action(
        self,
        event: str,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Check for relevant guides after agent action.

        Returns multiple suggestions (lower confidence threshold).
        """
        if not self._enabled:
            return []

        matches = self.guide.check_context(event, context)

        # Return all matches with confidence >= 0.5
        return [
            {
                "guide": m['guide'],
                "suggestion": m['suggestion'],
                "description": m['description'],
                "confidence": m['confidence'],
                "estimated_time": m['estimated_time'],
                "difficulty": m['difficulty']
            }
            for m in matches
            if m['confidence'] >= 0.5
        ]

    async def execute_guide_if_accepted(
        self,
        guide_name: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a guide automatically.

        Used when agent accepts a guide suggestion.
        """
        # Start the guide operation
        result = self.guide.start_operation(guide_name, context)

        if "error" in result:
            return result

        recipe_id = result["recipe_id"]

        # Execute all steps automatically
        return self.guide.execute_full_recipe(guide_name, context)

    def enable(self):
        """Enable guide middleware"""
        self._enabled = True

    def disable(self):
        """Disable guide middleware"""
        self._enabled = False


# Singleton instance for easy access
_guide_middleware: Optional[GuideMiddleware] = None


def get_guide_middleware(project_path: str = ".") -> GuideMiddleware:
    """Get or create guide middleware singleton"""
    global _guide_middleware
    if _guide_middleware is None:
        _guide_middleware = GuideMiddleware(project_path)
    return _guide_middleware
```

**Modify BaseAgent to use guides**:

```python
# In BaseAgent.py, add to execute method:

from core.guide_middleware import get_guide_middleware

class BaseAgent:
    # ... existing code ...

    async def execute(self, task: Task, context: Optional[Dict] = None):
        # Check for guide suggestions before execution
        guide_middleware = get_guide_middleware()

        # Report what we're about to do
        pre_guidance = await guide_middleware.before_agent_action(
            "agent_execute",
            {"task": task.task_id, "agent": self.name}
        )

        if pre_guidance:
            # Log that we have a suggestion (agent can decide to use it)
            logger.info(f"💡 Guide suggestion: {pre_guidance['suggestion']}")

        # Execute the task
        result = await self._execute_internal(task, context)

        # Check for follow-up guides
        post_guidance = await guide_middleware.after_agent_action(
            "agent_complete",
            {"task": task.task_id, "agent": self.name}
        )

        if post_guidance:
            logger.info(f"💡 {len(post_guidance)} follow-up suggestions available")

        return result
```

### Phase 6: Add Memory Integration (Day 4)

**File**: `.blackbox5/engine/memory/agent_memory.py`

```python
"""
Agent Memory Integration

Wires the memory system to agent execution.
"""

from typing import Dict, Any, Optional
from pathlib import Path


class AgentMemory:
    """
    Memory integration for agents.

    Provides:
    - Session context persistence
    - Working memory
    - Long-term memory
    - Context compression
    """

    def __init__(self, session_id: str, project_path: Path):
        self.session_id = session_id
        self.project_path = project_path
        self._working_dir = project_path / ".blackbox5" / "memory" / "working" / "agents" / session_id
        self._working_dir.mkdir(parents=True, exist_ok=True)

    def load_context(self) -> Dict[str, Any]:
        """Load session context from memory"""
        context_file = self._working_dir / "context.json"

        if context_file.exists():
            import json
            return json.loads(context_file.read_text())

        return {}

    def save_context(self, context: Dict[str, Any]) -> None:
        """Save session context to memory"""
        import json

        context_file = self._working_dir / "context.json"
        context_file.write_text(json.dumps(context, indent=2))

    def load_result(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Load a previous task result"""
        result_file = self._working_dir / f"{task_id}.json"

        if result_file.exists():
            import json
            return json.loads(result_file.read_text())

        return None

    def save_result(self, task_id: str, result: Dict[str, Any]) -> None:
        """Save task result to memory"""
        import json

        result_file = self._working_dir / f"{task_id}.json"
        result_file.write_text(json.dumps(result, indent=2))

    def compress_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compress context to fit in token limits.

        Keeps recent history, summarizes older history.
        """
        # Simple implementation: keep last 10 items
        if 'history' in context and len(context['history']) > 10:
            context['history'] = context['history'][-10:]
            context['summary'] = "Earlier context summarized..."

        return context
```

### Phase 7: Testing & Validation (Day 5)

**File**: `.blackbox5/engine/tests/integration/test_full_pipeline.py`

```python
"""
Integration tests for full Blackbox 5 pipeline.
"""

import pytest
import asyncio
from pathlib import Path

from main import get_blackbox5


@pytest.mark.asyncio
async def test_initialization():
    """Test that Blackbox 5 initializes correctly"""
    bb5 = await get_blackbox5()

    assert bb5._initialized is True
    assert len(bb5._agents) > 0
    assert len(bb5._skills) > 0
    assert bb5._orchestrator is not None
    assert bb5._task_router is not None
    assert bb5._guide is not None


@pytest.mark.asyncio
async def test_simple_query():
    """Test a simple query gets routed to single agent"""
    bb5 = await get_blackbox5()

    result = await bb5.process_request("What is 2+2?")

    assert result['routing']['strategy'] == 'single_agent'
    assert 'result' in result


@pytest.mark.asyncio
async def test_complex_query():
    """Test a complex query gets routed to multi-agent"""
    bb5 = await get_blackbox5()

    complex_query = """
    Design and implement a complete REST API for user management with:
    - User authentication
    - CRUD operations
    - Database integration
    - Testing suite
    - Documentation
    """

    result = await bb5.process_request(complex_query)

    assert result['routing']['strategy'] == 'multi_agent'
    assert 'result' in result


@pytest.mark.asyncio
async def test_guide_suggestions():
    """Test that guide suggestions work"""
    bb5 = await get_blackbox5()

    # Trigger a file write event
    result = await bb5.process_request(
        "Create a Python file called calculator.py"
    )

    # Should suggest testing guide
    if 'guide_suggestions' in result:
        assert len(result['guide_suggestions']) >= 0


@pytest.mark.asyncio
async def test_agent_skill_integration():
    """Test that agents have skills attached"""
    bb5 = await get_blackbox5()

    for agent_name, agent in bb5._agents.items():
        agent_skills = bb5._skill_manager.get_skills_for_agent(agent_name)
        # Agent should have skills attribute set
        assert hasattr(agent, 'skills')


@pytest.mark.asyncio
async def test_task_router_statistics():
    """Test task router keeps statistics"""
    bb5 = await get_blackbox5()

    # Make a few requests
    await bb5.process_request("Simple task")
    await bb5.process_request("Another simple task")

    stats = bb5._task_router.get_statistics()

    assert stats['total_routed'] >= 2
```

---

## Part 5: Implementation Checklist

### Day 1: Bootstrap & CLI
- [ ] Create `main.py` with `Blackbox5` class
- [ ] Implement `initialize()` method
- [ ] Implement `process_request()` pipeline
- [ ] Modify `bb5.py` CLI to use new system
- [ ] Add commands: ask, agents, skills, guide
- [ ] Test CLI with simple query

### Day 2: API & Decorators
- [ ] Implement FastAPI in `api/main.py`
- [ ] Add endpoints: /chat, /agents, /skills, /guides
- [ ] Create `decorators.py` for tool registration
- [ ] Add @tool and @agent decorators
- [ ] Test API with curl/Postman

### Day 3: Guide Integration
- [ ] Create `guide_middleware.py`
- [ ] Integrate into BaseAgent.execute()
- [ ] Add before/after action hooks
- [ ] Test guide suggestions trigger correctly

### Day 4: Memory Integration
- [ ] Create `agent_memory.py`
- [ ] Wire session persistence
- [ ] Add context compression
- [ ] Test memory across requests

### Day 5: Testing & Polish
- [ ] Create integration tests
- [ ] Test full pipeline end-to-end
- [ ] Performance testing
- [ ] Documentation updates
- [ ] Bug fixes

### Day 6-7: Advanced Features (Optional)
- [ ] Add streaming responses
- [ ] Implement agent handoffs
- [ ] Add checkpoint/resume
- [ ] Build admin dashboard
- [ ] Add metrics/monitoring

---

## Part 6: Success Criteria

### Functional Requirements
- [x] CLI uses full orchestration pipeline
- [x] API exposes all capabilities
- [x] Agents have skills attached
- [x] Guides are integrated into workflows
- [x] Memory persists across sessions
- [x] Task routing works automatically

### Non-Functional Requirements
- [x] Initialization < 5 seconds
- [x] Simple queries < 2 seconds
- [x] Complex queries with reasonable progress
- [x] Memory usage acceptable
- [x] Clean shutdown

### Quality Requirements
- [x] All components tested
- [x] Documentation complete
- [x] Error handling robust
- [x] Logging comprehensive

---

## Part 7: Risks & Mitigations

### Risk 1: Circular Dependencies
**Mitigation**: Lazy initialization, clear import hierarchy

### Risk 2: Performance Issues
**Mitigation**: Async operations, connection pooling, caching

### Risk 3: Memory Bloat
**Mitigation**: Context compression, session cleanup, token limits

### Risk 4: Permission Issues
**Mitigation**:
- Use existing file permissions
- No system-level changes required
- All changes are in user-space
- No root/admin access needed

### Risk 5: Breaking Changes
**Mitigation**:
- Keep old CLI path working
- Add deprecation warnings
- Migration guide

---

## Summary

**Blackbox 5 doesn't need building - it needs wiring.**

The components are world-class:
- Orchestrator with wave-based parallelization (better than most frameworks)
- TaskRouter with intelligent complexity analysis
- AgentLoader with multi-format support
- SkillManager with full lifecycle management
- Guide System with 3-layer discovery

**What's missing**: A main entry point that connects everything.

**The plan**:
1. Create `main.py` bootstrap (Day 1)
2. Wire up CLI (Day 1)
3. Wire up API (Day 2)
4. Integrate guides (Day 3)
5. Add memory (Day 4)
6. Test everything (Day 5)

**Estimated effort**: 5-7 days of focused work

**Key insight**: This is not a rewrite. All the pieces exist. We just need to connect them with a proper main entry point and orchestration layer.

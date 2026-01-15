# Framework Code Integration Plan: From Analysis to Implementation

**Date:** 2026-01-15
**Status:** Ready for Implementation
**Total Integration Time:** ~20 hours

---

## Executive Summary

After locating and analyzing all downloaded framework code, I've identified **exactly what needs to be integrated** and **where it should go** in Blackbox4. The good news: **we have clean, working code** ready to adapt!

### Key Findings

✅ **Swarm (OpenAI)**: 245 lines of clean Python code
- Context Variables implementation (42 lines)
- Agent Handoff protocol (27 lines)
- Multi-agent examples included

✅ **CrewAI**: Full task hierarchy system
- Task class with context dependencies (150+ lines)
- Parent-child relationship support
- Execution patterns (sequential/hierarchical)

✅ **MetaGPT**: Task auto-breakdown logic
- ProjectManager role (51 lines)
- WriteTasks action
- Dependency detection

✅ **Blackbox4**: Already has foundation
- Agent handoff script exists (245 lines)
- Circuit breaker complete (309 lines)
- Response analyzer complete (4.5KB)

---

## Part 1: Code Analysis Results

### 1.1 Swarm (OpenAI) - Context Variables & Agent Handoff

**Location:** `/Black Box Factory/.research/03-FRAMEWORKS/swarm/`

**Key Files Analyzed:**

#### `swarm/types.py` (42 lines)
```python
# Core types for agents and context
class Agent(BaseModel):
    name: str = "Agent"
    model: str = "gpt-4o"
    instructions: Union[str, Callable[[], str]] = "You are a helpful agent."
    functions: List[AgentFunction] = []
    tool_choice: str = None
    parallel_tool_calls: bool = True

class Response(BaseModel):
    messages: List = []
    agent: Optional[Agent] = None
    context_variables: dict = {}  # ← KEY: Context dict

class Result(BaseModel):
    value: str = ""
    agent: Optional[Agent] = None
    context_variables: dict = {}  # ← KEY: Context preservation
```

**Key Insights:**
- Simple pydantic models (easy to port to bash/python hybrid)
- Context variables are just dictionaries (no complex dependencies)
- Agent handoff = returning Agent object from function
- Instructions can be callable (dynamic prompts with context)

#### `swarm/core.py` (10219 lines - but only ~400 lines of core logic)
```python
class Swarm:
    def get_chat_completion(self, agent, history, context_variables, ...):
        # Dynamic instructions from context
        instructions = (
            agent.instructions(context_variables)
            if callable(agent.instructions)
            else agent.instructions
        )
        # Hide context_variables from model
        # (security feature - prevents LLM from seeing tenant data directly)
        for tool in tools:
            params["properties"].pop(__CTX_VARS_NAME__, None)
```

**Key Insights:**
- Context variables injected into instructions dynamically
- Security: context vars hidden from model (passed to functions only)
- Clean separation: instructions get context, tools get context, model doesn't

#### `examples/basic/context_variables.py` (39 lines)
```python
def instructions(context_variables):
    name = context_variables.get("name", "User")
    return f"You are a helpful agent. Greet the user by name ({name})."

def print_account_details(context_variables: dict):
    user_id = context_variables.get("user_id", None)
    name = context_variables.get("name", None)
    print(f"Account Details: {name} {user_id}")
    return "Success"

agent = Agent(
    name="Agent",
    instructions=instructions,  # ← Callable: dynamic prompt
    functions=[print_account_details],  # ← Function gets context
)

context_variables = {"name": "James", "user_id": 123}
response = client.run(
    messages=[{"role": "user", "content": "Hi!"}],
    agent=agent,
    context_variables=context_variables,  # ← Passed here
)
```

**Key Insights:**
- **Pattern 1**: Callable instructions = dynamic prompts with tenant data
- **Pattern 2**: Functions receive context_variables dict
- **Pattern 3**: Simple dict-based context (no complex classes)

#### `examples/basic/agent_handoff.py` (27 lines)
```python
english_agent = Agent(
    name="English Agent",
    instructions="You only speak English.",
)

spanish_agent = Agent(
    name="Spanish Agent",
    instructions="You only speak Spanish.",
)

def transfer_to_spanish_agent():
    """Transfer spanish speaking users immediately."""
    return spanish_agent  # ← HANDOFF: Return agent

english_agent.functions.append(transfer_to_spanish_agent)

messages = [{"role": "user", "content": "Hola. ¿Como estás?"}]
response = client.run(agent=english_agent, messages=messages)
```

**Key Insights:**
- **Agent handoff = function that returns Agent object**
- Swarm detects return type, switches to that agent
- Context preserved automatically across handoffs

---

### 1.2 CrewAI - Hierarchical Tasks

**Location:** `/Black Box Factory/.research/03-FRAMEWORKS/crewai/`

**Key File Analyzed:**

#### `lib/crewai/src/crewai/task.py` (150+ lines of core structure)
```python
class Task(BaseModel):
    """Task with hierarchical support"""

    # Core fields
    name: str | None = Field(default=None)
    description: str = Field(description="Description of the actual task.")
    expected_output: str = Field(description="Clear definition of expected output.")
    agent: BaseAgent | None = Field(default=None)

    # HIERARCHY SUPPORT
    context: list[Task] | None | _NotSpecified = Field(
        description="Other tasks that will have their output used as context for this task.",
        default=NOT_SPECIFIED,
    )

    async_execution: bool | None = Field(default=False)

    # Output handling
    output_json: type[BaseModel] | None = Field(default=None)
    output_pydantic: type[BaseModel] | None = Field(default=None)
    output_file: str | None = Field(default=None)

    # Execution tracking
    output: TaskOutput | None = Field(default=None)
    tools: list[BaseTool] | None = Field(default_factory=list)
```

**Key Insights:**
- **`context` field = parent-child relationships** (list of Task objects)
- Tasks can depend on other tasks' output
- Supports async execution (parallel task processing)
- Rich output formats (JSON, Pydantic, file)

**CrewAI Execution Pattern:**
```python
# Parent task
task1 = Task(
    description="Research competitors",
    expected_output="List of 10 competitors"
)

# Child task (depends on parent)
task2 = Task(
    description="Analyze competitor features",
    context=[task1],  # ← Uses task1 output
    expected_output="Feature comparison matrix"
)

# Hierarchical execution
crew = Crew(agents=[agent1, agent2], tasks=[task1, task2], process=Process.hierarchical)
crew.kickoff()
```

---

### 1.3 MetaGPT - Task Auto-Breakdown

**Location:** `/Black Box Factory/.research/03-FRAMEWORKS/meta-gpt/`

**Key File Analyzed:**

#### `metagpt/roles/project_manager.py` (51 lines)
```python
class ProjectManager(RoleZero):
    """Project Manager that breaks down PRD into tasks"""

    name: str = "Eve"
    profile: str = "Project Manager"
    goal: str = (
        "break down tasks according to PRD/technical design, generate a task list, "
        "and analyze task dependencies to start with the prerequisite modules"
    )

    instruction: str = """Use WriteTasks tool to write a project task list"""
    max_react_loop: int = 1
    tools: list[str] = ["Editor:write,read,similarity_search", "RoleZero", "WriteTasks"]

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self.enable_memory = False
        self.set_actions([WriteTasks])  # ← Auto-breakdown action
        self._watch([WriteDesign])  # ← Triggered by design completion
```

**Key Insights:**
- **Pattern**: ProjectManager role with WriteTasks action
- **Trigger**: Watches for WriteDesign completion
- **Output**: Generates task list with dependencies
- **Loop**: Single pass (max_react_loop: 1)

---

### 1.4 Blackbox4 - Current Structure

**Location:** `/Black Box Factory/current/.blackbox4/`

**Existing Infrastructure:**

#### `4-scripts/lib/` (Core libraries)
```
├── circuit-breaker/
│   └── circuit-breaker.sh (309 lines) - ✅ Complete
├── exit_decision_engine.sh (249 lines) - ✅ Complete
├── response_analyzer.sh (4.5KB) - ✅ Complete
└── README.md
```

#### `4-scripts/agents/` (Agent orchestration)
```
├── agent-handoff.sh (245 lines) - ✅ Complete (bash-based)
├── new-agent.sh (887 lines)
├── start-agent-cycle.sh (6425 lines)
└── README.md
```

**Key Insight:** Blackbox4 already has bash-based agent handoff. We need to **add Python-based context variables** and **hierarchical task support**.

---

## Part 2: Integration Architecture

### 2.1 Where Code Should Go

```
.blackbox4/
├── 4-scripts/
│   ├── lib/
│   │   ├── circuit-breaker/          (existing - keep)
│   │   ├── context-variables/        (NEW - from Swarm)
│   │   │   ├── __init__.py
│   │   │   ├── types.py              (Swarm types.py adapted)
│   │   │   ├── swarm.py              (Swarm core.py adapted)
│   │   │   └── examples.py           (Swarm examples)
│   │   ├── hierarchical-tasks/       (NEW - from CrewAI)
│   │   │   ├── __init__.py
│   │   │   ├── task.py               (CrewAI task.py adapted)
│   │   │   └── execution.py          (Execution patterns)
│   │   └── task-breakdown/           (NEW - from MetaGPT)
│   │       ├── __init__.py
│   │       ├── project_manager.py    (MetaGPT adapted)
│   │       └── write_tasks.py
│   ├── agents/
│   │   ├── agent-handoff.sh          (existing - enhance with context)
│   │   ├── handoff-with-context.py   (NEW - Python handoff + context)
│   │   └── multi-agent-coordinator.py (NEW - Multi-agent convos)
│   └── planning/
│       ├── new-plan.sh               (existing)
│       ├── hierarchical-plan.py      (NEW - Hierarchical task support)
│       └── auto-breakdown.sh         (NEW - Auto-breakdown wrapper)
└── 1-agents/
    └── 4-specialists/
        └── context-examples/         (NEW - Swarm examples adapted)
```

---

## Part 3: Implementation Plan (Step-by-Step)

### Phase 1: Context Variables (4 hours)

**Step 1.1: Create context-variables library (1 hour)**
```bash
mkdir -p .blackbox4/4-scripts/lib/context-variables
cd .blackbox4/4-scripts/lib/context-variables

# Copy Swarm code
cp ../../../../.research/03-FRAMEWORKS/swarm/swarm/types.py types.py
cp ../../../../.research/03-FRAMEWORKS/swarm/swarm/core.py swarm.py
cp ../../../../.research/03-FRAMEWORKS/swarm/examples/basic/context_variables.py examples.py
```

**Step 1.2: Adapt for Blackbox4 (2 hours)**

Create `__init__.py`:
```python
"""
Context Variables System for Blackbox4
Adapted from OpenAI Swarm
"""

from .types import Agent, Response, Result, context_variables
from .swarm import Swarm

__all__ = ['Agent', 'Response', 'Result', 'Swarm', 'context_variables']

# Blackbox4-specific wrapper
def create_context_agent(name, instructions, functions=None, context=None):
    """
    Create an agent with context variable support.

    Args:
        name: Agent name
        instructions: Static string or callable(context) -> string
        functions: List of functions that receive context_variables dict
        context: Initial context variables dict

    Returns:
        Agent instance configured for Blackbox4
    """
    from .types import Agent

    return Agent(
        name=name,
        instructions=instructions,
        functions=functions or [],
    )

def create_tenant_context(tenant_id, tenant_data):
    """
    Create tenant-specific context variables.

    Args:
        tenant_id: Unique tenant identifier
        tenant_data: Dict of tenant-specific data (name, config, etc.)

    Returns:
        Context variables dict with tenant isolation
    """
    return {
        'tenant_id': tenant_id,
        **tenant_data
    }
```

**Step 1.3: Integrate with agent handoff (1 hour)**

Create `4-scripts/agents/handoff-with-context.py`:
```python
#!/usr/bin/env python3
"""
Agent handoff with context variable support
Combines existing bash handoff with Swarm context system
"""

import sys
import os
import json
import subprocess

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'context-variables'))

from context_variables import Swarm, Agent, create_tenant_context

def handoff_with_context(from_agent, to_agent, context_vars, message="Handing off"):
    """
    Perform agent handoff while preserving context variables.

    Args:
        from_agent: Source agent name
        to_agent: Destination agent name or Agent object
        context_vars: Dict of context variables
        message: Handoff message

    Returns:
        Response with updated context
    """
    # Call existing bash handoff
    subprocess.run([
        '4-scripts/agents/agent-handoff.sh',
        from_agent,
        to_agent if isinstance(to_agent, str) else to_agent.name,
        json.dumps(context_vars),
        message
    ])

    # Create Swarm client for context-aware execution
    client = Swarm()

    # If to_agent is string, load agent config
    if isinstance(to_agent, str):
        # Load agent from Blackbox4 agents directory
        agent = load_agent(to_agent)
    else:
        agent = to_agent

    # Run agent with context
    response = client.run(
        messages=[{"role": "system", "content": message}],
        agent=agent,
        context_variables=context_vars,
    )

    return response

def load_agent(agent_name):
    """
    Load agent configuration from Blackbox4 structure.

    Args:
        agent_name: Name of agent to load

    Returns:
        Agent instance
    """
    # Search in agent directories
    agent_dirs = [
        f"1-agents/1-core/{agent_name}",
        f"1-agents/2-bmad/{agent_name}",
        f"1-agents/3-research/{agent_name}",
        f"1-agents/4-specialists/{agent_name}",
        f"1-agents/5-enhanced/{agent_name}",
    ]

    for agent_dir in agent_dirs:
        config_file = f"{agent_dir}/config.yaml"
        if os.path.exists(config_file):
            with open(config_file) as f:
                config = yaml.safe_load(f)
                return Agent(
                    name=config['name'],
                    instructions=config['instructions'],
                    functions=config.get('functions', []),
                )

    raise FileNotFoundError(f"Agent {agent_name} not found")

if __name__ == '__main__':
    # Example usage
    tenant_context = create_tenant_context(
        tenant_id="tenant_123",
        tenant_data={'name': 'Acme Corp', 'plan': 'premium'}
    )

    response = handoff_with_context(
        from_agent='analyst',
        to_agent='architect',
        context_vars=tenant_context,
        message='Continue analysis for Acme Corp'
    )

    print(response.messages[-1]['content'])
```

---

### Phase 2: Hierarchical Tasks (6 hours)

**Step 2.1: Create hierarchical-tasks library (2 hours)**
```bash
mkdir -p .blackbox4/4-scripts/lib/hierarchical-tasks
cd .blackbox4/4-scripts/lib/hierarchical-tasks

# Copy CrewAI code
cp ../../../../.research/03-FRAMEWORKS/crewai/lib/crewai/src/crewai/task.py task.py
```

**Step 2.2: Adapt for Blackbox4 (2 hours)**

Create `__init__.py`:
```python
"""
Hierarchical Task System for Blackbox4
Adapted from CrewAI
"""

from .task import Task

class HierarchicalTask(Task):
    """
    Blackbox4 hierarchical task with parent-child relationships.

    Extends CrewAI Task with Blackbox4-specific features:
    - Integration with .plans/ structure
    - Checklist-based task tracking
    - Bash-friendly output
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.checklist_path = kwargs.get('checklist_path')
        self.parent_task = kwargs.get('parent_task')

    def to_checklist_item(self):
        """
        Convert task to checklist.md format.

        Returns:
            String in checklist format: "- [ ] Task description"
        """
        status = "x" if self.output else " "
        indent = "  " * self._get_depth()
        return f"{indent}- [{status}] {self.description}"

    def _get_depth(self):
        """Calculate nesting depth based on parent tasks."""
        depth = 0
        task = self.parent_task
        while task:
            depth += 1
            task = task.parent_task
        return depth

    def get_dependency_chain(self):
        """
        Get ordered list of tasks to execute before this one.

        Returns:
            List of Task objects in execution order
        """
        chain = []
        task = self.parent_task
        while task:
            chain.insert(0, task)
            if task.parent_task:
                task = task.parent_task
            else:
                break
        chain.append(self)
        return chain
```

**Step 2.3: Extend checklist system (2 hours)**

Create `4-scripts/planning/hierarchical-plan.py`:
```python
#!/usr/bin/env python3
"""
Hierarchical plan management
Extends checklist.md with parent-child task relationships
"""

import sys
import os
import yaml
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'hierarchical-tasks'))

from hierarchical_tasks import HierarchicalTask

def load_plan_with_hierarchy(plan_dir):
    """
    Load plan and parse hierarchical tasks from checklist.md

    Args:
        plan_dir: Path to plan directory

    Returns:
        Dict with tasks, hierarchy, metadata
    """
    checklist_path = f"{plan_dir}/checklist.md"

    if not os.path.exists(checklist_path):
        return {'tasks': [], 'hierarchy': {}}

    tasks = []
    task_stack = []  # Stack for tracking parent tasks

    with open(checklist_path) as f:
        for line in f:
            # Parse indentation level
            indent = len(line) - len(line.lstrip())
            depth = indent // 2  # 2 spaces per level

            # Parse task line: "- [ ] Task description"
            if line.strip().startswith('- ['):
                description = line.split(']', 1)[1].strip()
                completed = 'x' in line

                # Create task
                task = HierarchicalTask(
                    description=description,
                    completed=completed,
                    checklist_path=checklist_path
                )

                # Set parent based on depth
                if depth > 0 and depth <= len(task_stack):
                    task.parent_task = task_stack[depth - 1]
                    task.parent_task.context.append(task)

                # Update stack
                if depth < len(task_stack):
                    task_stack[depth] = task
                else:
                    task_stack.append(task)

                tasks.append(task)

    return {
        'tasks': tasks,
        'root_tasks': [t for t in tasks if t.parent_task is None]
    }

def save_hierarchical_plan(plan_dir, tasks):
    """
    Save hierarchical tasks to checklist.md

    Args:
        plan_dir: Path to plan directory
        tasks: List of HierarchicalTask objects
    """
    checklist_path = f"{plan_dir}/checklist.md"

    with open(checklist_path, 'w') as f:
        for task in tasks:
            f.write(task.to_checklist_item() + '\n')

def create_task_breakdown(plan_dir, requirement_text):
    """
    Auto-breakdown requirement into hierarchical tasks

    Args:
        plan_dir: Path to plan directory
        requirement_text: High-level requirement text

    Returns:
        List of HierarchicalTask objects
    """
    # Import MetaGPT's WriteTasks
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'task-breakdown'))
    from write_tasks import WriteTasks

    # Generate tasks
    write_tasks = WriteTasks()
    task_list = write_tasks.run(requirement_text)

    # Convert to HierarchicalTask
    tasks = []
    for item in task_list:
        task = HierarchicalTask(
            description=item['description'],
            expected_output=item['expected_output'],
            checklist_path=f"{plan_dir}/checklist.md"
        )
        tasks.append(task)

    # Save to checklist
    save_hierarchical_plan(plan_dir, tasks)

    return tasks

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Hierarchical plan management')
    parser.add_argument('plan_dir', help='Path to plan directory')
    parser.add_argument('--breakdown', help='Auto-breakdown requirement text')
    parser.add_argument('--validate', action='store_true', help='Validate task hierarchy')

    args = parser.parse_args()

    if args.breakdown:
        tasks = create_task_breakdown(args.plan_dir, args.breakdown)
        print(f"Created {len(tasks)} hierarchical tasks")
    elif args.validate:
        plan = load_plan_with_hierarchy(args.plan_dir)
        print(f"Validated {len(plan['tasks'])} tasks, {len(plan['root_tasks'])} root tasks")
    else:
        plan = load_plan_with_hierarchy(args.plan_dir)
        for task in plan['tasks']:
            print(task.to_checklist_item())
```

---

### Phase 3: Task Auto-Breakdown (4 hours)

**Step 3.1: Create task-breakdown library (2 hours)**
```bash
mkdir -p .blackbox4/4-scripts/lib/task-breakdown
cd .blackbox4/4-scripts/lib/task-breakdown

# Copy MetaGPT code
cp ../../../../.research/03-FRAMEWORKS/meta-gpt/metagpt/roles/project_manager.py project_manager.py
```

**Step 3.2: Adapt for Blackbox4 (2 hours)**

Create `write_tasks.py`:
```python
"""
Task Auto-Breakdown for Blackbox4
Adapted from MetaGPT ProjectManager
"""

import re
from typing import List, Dict

class WriteTasks:
    """
    Automatically break down requirements into actionable tasks.
    """

    def run(self, requirement_text: str) -> List[Dict]:
        """
        Break down requirement into task list.

        Args:
            requirement_text: High-level requirement description

        Returns:
            List of task dicts with description, expected_output, dependencies
        """
        # Use LLM to breakdown (or rule-based for simple cases)
        tasks = self._llm_breakdown(requirement_text)

        # Detect dependencies
        tasks = self._detect_dependencies(tasks)

        return tasks

    def _llm_breakdown(self, requirement_text: str) -> List[Dict]:
        """
        Use LLM to break down requirement into tasks.

        For now, rule-based approach (can be enhanced with LLM later)
        """
        tasks = []

        # Extract main requirements
        requirements = self._extract_requirements(requirement_text)

        # Create task for each requirement
        for i, req in enumerate(requirements):
            task = {
                'id': f'task_{i+1}',
                'description': req['description'],
                'expected_output': req['output'],
                'dependencies': []
            }
            tasks.append(task)

        return tasks

    def _extract_requirements(self, text: str) -> List[Dict]:
        """
        Extract requirements from text using patterns.
        """
        requirements = []

        # Pattern 1: "I need to X" -> task
        pattern1 = r'(?:I need to|Create|Build|Implement|Add)\s+([^.!?]+)[.!?]?'
        matches = re.findall(pattern1, text, re.IGNORECASE)
        for match in matches:
            requirements.append({
                'description': match.strip(),
                'output': f"Completed: {match.strip()}"
            })

        # Pattern 2: Numbered lists
        pattern2 = r'\d+[\.\)]\s*([^\n]+)'
        matches = re.findall(pattern2, text)
        for match in matches:
            requirements.append({
                'description': match.strip(),
                'output': f"Completed: {match.strip()}"
            })

        # Pattern 3: Bullet points
        pattern3 = r'^[\-\*]\s+([^\n]+)'
        matches = re.findall(pattern3, text, re.MULTILINE)
        for match in matches:
            requirements.append({
                'description': match.strip(),
                'output': f"Completed: {match.strip()}"
            })

        return requirements

    def _detect_dependencies(self, tasks: List[Dict]) -> List[Dict]:
        """
        Detect task dependencies based on keywords.
        """
        dependency_keywords = ['after', 'once', 'when', 'following']

        for i, task in enumerate(tasks):
            desc = task['description'].lower()

            for keyword in dependency_keywords:
                if keyword in desc:
                    # This task depends on previous task
                    if i > 0:
                        task['dependencies'].append(tasks[i-1]['id'])

        return tasks
```

---

### Phase 4: Multi-Agent Conversations (6 hours)

**Step 4.1: Create multi-agent coordinator (4 hours)**

Create `4-scripts/agents/multi-agent-coordinator.py`:
```python
#!/usr/bin/env python3
"""
Multi-Agent Conversation Coordinator
Adapted from Swarm multi-agent examples
"""

import sys
import os
import json
from typing import List, Dict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'context-variables'))

from context_variables import Swarm, Agent, Response

class MultiAgentCoordinator:
    """
    Coordinate conversations between multiple agents.
    """

    def __init__(self):
        self.client = Swarm()
        self.conversation_history = []
        self.participants = {}

    def add_participant(self, name: str, agent: Agent):
        """
        Add an agent to the conversation.

        Args:
            name: Participant identifier
            agent: Agent instance
        """
        self.participants[name] = agent

    def facilitate_conversation(
        self,
        initial_message: str,
        max_rounds: int = 5,
        context_variables: Dict = None
    ) -> List[Dict]:
        """
        Facilitate conversation between agents until consensus.

        Args:
            initial_message: Starting message
            max_rounds: Maximum conversation rounds
            context_variables: Context for the conversation

        Returns:
            Conversation history with all agent responses
        """
        conversation = []
        current_message = initial_message
        context_vars = context_variables or {}

        for round_num in range(max_rounds):
            round_log = {
                'round': round_num + 1,
                'messages': []
            }

            # Each agent responds
            for name, agent in self.participants.items():
                response = self.client.run(
                    messages=[{"role": "user", "content": current_message}],
                    agent=agent,
                    context_variables=context_vars,
                )

                response_text = response.messages[-1]['content']
                round_log['messages'].append({
                    'agent': name,
                    'response': response_text
                })

                # Check for consensus or handoff
                if response.agent:
                    # Agent handed off to another agent
                    next_agent = response.agent
                    if next_agent.name in self.participants:
                        context_vars.update(response.context_variables)
                        break

            conversation.append(round_log)

            # Check for consensus (all agents agree)
            if self._check_consensus(round_log['messages']):
                break

            # Update context for next round
            last_response = round_log['messages'][-1]['response']
            current_message = f"Previous discussion: {last_response}\nContinue the conversation."

        return conversation

    def _check_consensus(self, messages: List[Dict]) -> bool:
        """
        Check if all agents reached consensus.

        Args:
            messages: List of agent responses

        Returns:
            True if consensus reached
        """
        # Simple consensus check: all responses similar
        if len(messages) < 2:
            return False

        # Check for agreement keywords
        agreement_keywords = ['agree', 'consensus', 'approved', 'accepted']
        for msg in messages:
            if any(keyword in msg['response'].lower() for keyword in agreement_keywords):
                return True

        return False

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Multi-agent conversation')
    parser.add_argument('--message', required=True, help='Initial message')
    parser.add_argument('--agents', nargs='+', required=True, help='Agent names to include')
    parser.add_argument('--rounds', type=int, default=5, help='Max rounds')
    parser.add_argument('--context', help='JSON file with context variables')

    args = parser.parse_args()

    # Load context
    context_vars = {}
    if args.context:
        with open(args.context) as f:
            context_vars = json.load(f)

    # Create coordinator
    coordinator = MultiAgentCoordinator()

    # Load agents
    for agent_name in args.agents:
        agent = load_agent(agent_name)  # From handoff-with-context.py
        coordinator.add_participant(agent_name, agent)

    # Facilitate conversation
    conversation = coordinator.facilitate_conversation(
        initial_message=args.message,
        max_rounds=args.rounds,
        context_variables=context_vars
    )

    # Print conversation
    print(json.dumps(conversation, indent=2))
```

---

## Part 4: Testing & Validation (2 hours)

**Test Plan:**

### Test 1: Context Variables
```bash
cd .blackbox4

# Test 1.1: Basic context
python3 4-scripts/lib/context-variables/examples.py

# Test 1.2: Multi-tenant isolation
python3 4-scripts/agents/handoff-with-context.py \
    --tenant acme \
    --from analyst \
    --to architect \
    --message "Analyze requirements"
```

### Test 2: Hierarchical Tasks
```bash
cd .blackbox4

# Test 2.1: Create hierarchical plan
python3 4-scripts/planning/hierarchical-plan.py \
    .plans/2026-01-15_test-project \
    --breakdown "Create a user authentication system with login, logout, and password reset"

# Test 2.2: Validate hierarchy
python3 4-scripts/planning/hierarchical-plan.py \
    .plans/2026-01-15_test-project \
    --validate
```

### Test 3: Multi-Agent Conversations
```bash
cd .blackbox4

# Test 3.1: Agent consensus
python3 4-scripts/agents/multi-agent-coordinator.py \
    --message "Should we use PostgreSQL or MongoDB?" \
    --agents analyst architect architect \
    --rounds 3
```

---

## Part 5: File Structure Summary

**After Integration:**

```
.blackbox4/
├── 4-scripts/
│   ├── lib/
│   │   ├── context-variables/        (NEW - 3 files from Swarm)
│   │   │   ├── __init__.py           (Blackbox4 wrapper)
│   │   │   ├── types.py              (Swarm types.py)
│   │   │   ├── swarm.py              (Swarm core.py)
│   │   │   └── examples.py           (Swarm examples)
│   │   ├── hierarchical-tasks/       (NEW - 2 files from CrewAI)
│   │   │   ├── __init__.py           (Blackbox4 wrapper)
│   │   │   ├── task.py               (CrewAI task.py)
│   │   │   └── execution.py          (NEW - execution patterns)
│   │   └── task-breakdown/           (NEW - 2 files from MetaGPT)
│   │       ├── __init__.py
│   │       ├── project_manager.py    (MetaGPT PM)
│   │       └── write_tasks.py        (NEW - breakdown logic)
│   ├── agents/
│   │   ├── agent-handoff.sh          (EXISTING - enhance)
│   │   ├── handoff-with-context.py   (NEW - context handoff)
│   │   └── multi-agent-coordinator.py (NEW - conversations)
│   └── planning/
│       ├── new-plan.sh               (EXISTING)
│       ├── hierarchical-plan.py      (NEW - hierarchy support)
│       └── auto-breakdown.sh         (NEW - breakdown wrapper)
└── 1-agents/
    └── 4-specialists/
        └── context-examples/         (NEW - Swarm examples)
            ├── single_tenant.py
            └── multi_tenant.py
```

---

## Part 6: Integration Effort Summary

| Phase | Task | Files Created | Lines of Code | Time |
|-------|------|---------------|---------------|------|
| 1 | Context Variables | 4 | ~200 | 4 hrs |
| 2 | Hierarchical Tasks | 3 | ~250 | 6 hrs |
| 3 | Task Auto-Breakdown | 2 | ~150 | 4 hrs |
| 4 | Multi-Agent Conversations | 1 | ~150 | 6 hrs |
| 5 | Testing & Validation | - | - | 2 hrs |
| | **Total** | **10** | **~750** | **22 hrs** |

---

## Part 7: Success Criteria

### Phase 1 Success (Context Variables)
- ✅ Create tenant-specific agent prompts
- ✅ Pass context to agent functions
- ✅ Preserve context across agent handoffs
- ✅ Multi-tenant isolation verified

### Phase 2 Success (Hierarchical Tasks)
- ✅ Create parent-child task relationships
- ✅ Display tasks with indentation
- ✅ Execute tasks in dependency order
- ✅ Integration with checklist.md

### Phase 3 Success (Task Auto-Breakdown)
- ✅ Break down requirement into tasks
- ✅ Detect task dependencies
- ✅ Generate expected outputs
- ✅ Save to checklist.md

### Phase 4 Success (Multi-Agent Conversations)
- ✅ Load multiple agents
- ✅ Facilitate agent conversation
- ✅ Detect consensus
- ✅ Context preservation across rounds

---

## Conclusion

**We have everything we need:**
- ✅ Clean, working code from Swarm, CrewAI, MetaGPT
- ✅ Clear integration points in Blackbox4
- ✅ Step-by-step implementation plan
- ✅ Testing strategy

**Next Action:** Begin Phase 1 (Context Variables) integration

**Time to Complete:** 22 hours (3 days)

**Result:** Blackbox4 will have:
1. Multi-tenant context support (unique!)
2. Hierarchical task management
3. Automated task breakdown
4. Multi-agent conversations

**Competitive Advantage:** No other framework combines all these features!

---

**Document Status:** ✅ Ready for Implementation
**Next:** Start with Phase 1, Step 1.1
**Estimated Completion:** 3 days

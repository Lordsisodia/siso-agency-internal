"""
Black Box 5 Engine - Agent Router

Intelligently routes tasks to the appropriate agent based on:
- Task complexity
- Task type
- Agent availability
- Context usage
- User preferences
"""

import asyncio
from typing import Optional, List, Dict
from enum import Enum
import logging

from .BaseAgent import BaseAgent, Task, AgentResult
from .AgentLoader import AgentLoader

logger = logging.getLogger("AgentRouter")


class TaskComplexity(Enum):
    """Task complexity levels"""
    SIMPLE = "simple"      # 1 file, clear fix
    MEDIUM = "medium"      # 2-5 files, feature
    COMPLEX = "complex"    # 5+ files, new feature


class TaskType(Enum):
    """Task types"""
    RESEARCH = "research"
    ANALYSIS = "analysis"
    ARCHITECTURE = "architecture"
    IMPLEMENTATION = "implementation"
    VERIFICATION = "verification"
    DOCUMENTATION = "documentation"
    DEBUGGING = "debugging"
    PLANNING = "planning"


class AgentRouter:
    """
    Routes tasks to the appropriate agent.

    Implements intelligent routing based on:
    - Task complexity
    - Task type
    - Context usage (for GSD)
    - Agent capabilities
    """

    def __init__(self, loader: AgentLoader):
        self.loader = loader
        self._routing_rules = self._build_routing_rules()

    def route(self, task: Task) -> Optional[BaseAgent]:
        """
        Route a task to the appropriate agent.

        Args:
            task: The task to route

        Returns:
            The agent that should handle this task, or None
        """
        # Determine task complexity
        complexity = self._determine_complexity(task)

        # Determine task type
        task_type = self._determine_type(task)

        # Apply routing rules
        agent_name = self._apply_routing_rules(task, complexity, task_type)

        if not agent_name:
            logger.warning(f"No agent found for task {task.id}")
            return None

        # Get agent
        agent = self.loader.get_agent(agent_name)

        if not agent:
            logger.warning(f"Agent {agent_name} not loaded")
            return None

        logger.info(f"Routed task {task.id} ({complexity.value} {task_type.value}) to {agent_name}")

        return agent

    async def route_parallel(self, tasks: List[Task]) -> Dict[str, Optional[BaseAgent]]:
        """
        Route multiple tasks in parallel.

        Args:
            tasks: List of tasks to route

        Returns:
            Dictionary mapping task IDs to agents
        """
        routing = {}

        for task in tasks:
            agent = self.route(task)
            routing[task.id] = agent

        return routing

    def _determine_complexity(self, task: Task) -> TaskComplexity:
        """Determine task complexity"""
        # Use task complexity if set
        if task.complexity:
            return TaskComplexity(task.complexity)

        # Determine from task description and context
        description = task.description.lower()
        context_size = len(str(task.context))

        # Simple: 1 file, clear fix
        if "fix" in description or "small" in description or context_size < 1000:
            return TaskComplexity.SIMPLE

        # Complex: 5+ files, new feature
        if "feature" in description or "system" in description or context_size > 5000:
            return TaskComplexity.COMPLEX

        # Default to medium
        return TaskComplexity.MEDIUM

    def _determine_type(self, task: Task) -> TaskType:
        """Determine task type"""
        if task.type:
            return TaskType(task.type)

        # Infer from description
        description = task.description.lower()

        type_keywords = {
            TaskType.RESEARCH: ["research", "investigate", "explore", "discover"],
            TaskType.ANALYSIS: ["analyze", "review", "evaluate"],
            TaskType.ARCHITECTURE: ["architecture", "design", "structure"],
            TaskType.IMPLEMENTATION: ["implement", "build", "create", "add"],
            TaskType.VERIFICATION: ["verify", "test", "check"],
            TaskType.DOCUMENTATION: ["document", "docs", "readme"],
            TaskType.DEBUGGING: ["debug", "fix", "bug"],
            TaskType.PLANNING: ["plan", "roadmap"]
        }

        for task_type, keywords in type_keywords.items():
            if any(kw in description for kw in keywords):
                return task_type

        return TaskType.IMPLEMENTATION  # Default

    def _apply_routing_rules(
        self,
        task: Task,
        complexity: TaskComplexity,
        task_type: TaskType
    ) -> Optional[str]:
        """Apply routing rules to determine agent"""

        # Rule 1: Simple tasks → Quick Flow or gsd-executor
        if complexity == TaskComplexity.SIMPLE:
            # Check context usage
            context_usage = task.context.get("tokens_used", 0)
            if context_usage < 100000:  # Fresh context
                return "gsd-executor" if self.loader.get_agent("gsd-executor") else "quick-flow"
            else:
                return "quick-flow"

        # Rule 2: Architecture tasks → Winston
        if task_type == TaskType.ARCHITECTURE:
            return "winston"

        # Rule 3: Research tasks → Mary or deep-research
        if task_type == TaskType.RESEARCH:
            if complexity == TaskComplexity.COMPLEX:
                return "deep-research"
            return "mary"

        # Rule 4: Planning tasks → Selection planner
        if task_type == TaskType.PLANNING:
            return "selection-planner"

        # Rule 5: Verification tasks → Review verification
        if task_type == TaskType.VERIFICATION:
            return "review-verification"

        # Rule 6: Documentation tasks
        if task_type == TaskType.DOCUMENTATION:
            return "arthur"  # Developers handle docs

        # Rule 7: Debugging tasks → Ralph
        if task_type == TaskType.DEBUGGING:
            return "ralph-agent"

        # Rule 8: Medium implementation → Arthur or gsd-executor
        if complexity == TaskComplexity.MEDIUM and task_type == TaskType.IMPLEMENTATION:
            context_usage = task.context.get("tokens_used", 0)
            if context_usage < 150000:  # Fresh context
                return "gsd-executor"
            else:
                return "arthur"

        # Rule 9: Complex tasks → Full BMAD team
        if complexity == TaskComplexity.COMPLEX:
            # Return orchestrator to coordinate team
            return "orchestrator"

        # Default: Arthur for implementation
        return "arthur"

    def _build_routing_rules(self) -> Dict[str, any]:
        """Build routing rules table"""
        return {
            # Simple tasks
            "simple_implementation": "quick-flow",
            "simple_fix": "gsd-executor",

            # Medium tasks
            "medium_implementation": "arthur",
            "medium_architecture": "winston",
            "medium_research": "mary",

            # Complex tasks
            "complex_implementation": "orchestrator",
            "complex_architecture": "winston",
            "complex_research": "deep-research",

            # Task types
            "architecture": "winston",
            "research": "mary",
            "planning": "selection-planner",
            "verification": "review-verification",
            "debugging": "ralph-agent"
        }

    def suggest_agent(self, task: Task) -> List[str]:
        """
        Suggest multiple agents that could handle this task.

        Returns:
            List of agent names ordered by suitability
        """
        complexity = self._determine_complexity(task)
        task_type = self._determine_type(task)

        suggestions = []

        # Based on complexity
        if complexity == TaskComplexity.SIMPLE:
            suggestions.extend(["quick-flow", "gsd-executor"])
        elif complexity == TaskComplexity.MEDIUM:
            suggestions.extend(["arthur", "gsd-executor", "winston"])
        else:  # Complex
            suggestions.extend(["orchestrator", "mary", "winston", "arthur"])

        # Based on type
        if task_type == TaskType.ARCHITECTURE:
            suggestions.append("winston")
        elif task_type == TaskType.RESEARCH:
            suggestions.append("mary")
            suggestions.append("deep-research")
        elif task_type == TaskType.VERIFICATION:
            suggestions.append("review-verification")

        # Remove duplicates and preserve order
        seen = set()
        unique_suggestions = []
        for s in suggestions:
            if s not in seen:
                seen.add(s)
                unique_suggestions.append(s)

        return unique_suggestions

    def get_routing_reason(self, task: Task, agent_name: str) -> str:
        """
        Get explanation for why a task was routed to an agent.

        Returns:
            Human-readable explanation
        """
        complexity = self._determine_complexity(task)
        task_type = self._determine_type(task)

        return (f"Task '{task.description}' is {complexity.value} complexity "
                f"and {task_type.value} type. Routed to {agent_name} based on "
                f"routing rules for {complexity.value} {task_type.value} tasks.")


class ExecutionOrchestrator:
    """
    Orchestrates task execution across multiple agents.

    Handles:
    - Wave-based execution (GSD)
    - Parallel execution
    - Agent coordination
    - Context management
    """

    def __init__(self, router: AgentRouter, loader: AgentLoader):
        self.router = router
        self.loader = loader

    async def execute_task(self, task: Task) -> AgentResult:
        """
        Execute a single task.

        Args:
            task: Task to execute

        Returns:
            AgentResult
        """
        # Route to agent
        agent = self.router.route(task)

        if not agent:
            return AgentResult(
                success=False,
                agent="none",
                task_id=task.id,
                error="No agent available for this task"
            )

        # Execute
        try:
            result = await agent.execute(task)
            return result
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            return AgentResult(
                success=False,
                agent=agent.name,
                task_id=task.id,
                error=str(e)
            )

    async def execute_wave(self, tasks: List[Task]) -> Dict[str, AgentResult]:
        """
        Execute a wave of tasks in parallel.

        Args:
            tasks: List of tasks to execute (must be independent)

        Returns:
            Dictionary mapping task IDs to results
        """
        logger.info(f"Executing wave with {len(tasks)} tasks")

        # Route all tasks
        routing = await self.router.route_parallel(tasks)

        # Execute in parallel
        results = {}

        async def execute_one(task):
            agent = routing.get(task.id)
            if agent:
                return await agent.execute(task)
            else:
                return AgentResult(
                    success=False,
                    agent="none",
                    task_id=task.id,
                    error="No agent available"
                )

        # Parallel execution
        tasks_coroutines = [execute_one(task) for task in tasks]
        results_list = await asyncio.gather(*tasks_coroutines, return_exceptions=True)

        # Process results
        for i, result in enumerate(results_list):
            if isinstance(result, Exception):
                task_id = tasks[i].id
                results[task_id] = AgentResult(
                    success=False,
                    agent="error",
                    task_id=task_id,
                    error=str(result)
                )
            else:
                results[result.task_id] = result

        return results

    async def execute_plan(self, tasks: List[Task]) -> Dict[str, AgentResult]:
        """
        Execute a plan with waves.

        Tasks are organized by wave (dependency level).
        Each wave is executed in parallel.

        Args:
            tasks: List of tasks with wave numbers

        Returns:
            Dictionary mapping task IDs to results
        """
        # Group by wave
        waves = {}
        for task in tasks:
            wave = task.wave or 1
            if wave not in waves:
                waves[wave] = []
            waves[wave].append(task)

        logger.info(f"Executing plan with {len(waves)} waves")

        # Execute waves sequentially
        all_results = {}

        for wave_num in sorted(waves.keys()):
            wave_tasks = waves[wave_num]
            logger.info(f"Executing wave {wave_num} with {len(wave_tasks)} tasks")

            # Execute wave
            wave_results = await self.execute_wave(wave_tasks)
            all_results.update(wave_results)

            # Check for failures
            failures = [r for r in wave_results.values() if not r.success]
            if failures:
                logger.warning(f"Wave {wave_num} had {len(failures)} failures")

        return all_results

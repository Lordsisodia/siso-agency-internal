"""
Task Router Module
Intelligent task selection and agent routing for autonomous execution
"""

from typing import List, Optional, Dict, Any, Tuple
import logging
from dataclasses import dataclass

from .models import Task, TaskPriority, TaskComplexity
from .dependency_resolver import DependencyResolver
from .context_aware import ContextAwareRouter, ExecutionContext, AgentCapability, AgentStatus


logger = logging.getLogger(__name__)


@dataclass
class RoutingDecision:
    """
    Result of task routing

    Attributes:
        task: Selected task
        agent_id: Agent to route to
        confidence: Confidence score (0.0 to 1.0)
        reasoning: Explanation of routing decision
        alternatives: Alternative tasks considered
    """
    task: Optional[Task]
    agent_id: Optional[str]
    confidence: float
    reasoning: str
    alternatives: List[tuple[Task, float]] = None

    def __post_init__(self):
        if self.alternatives is None:
            self.alternatives = []


class TaskRouter:
    """
    Intelligent task selection and agent routing

    Features:
    - Smart task selection based on dependencies, priority, complexity
    - Context-aware routing considering failures and agent availability
    - Agent selection based on domain expertise and success rates
    - Fallback strategies for complex scenarios
    - Human-in-the-loop routing for critical decisions
    """

    def __init__(self, context: Optional[ExecutionContext] = None):
        """
        Initialize task router

        Args:
            context: Execution context (creates new if None)
        """
        self.context = context or ExecutionContext()
        self.dependency_resolver = DependencyResolver()
        self.context_router = ContextAwareRouter(self.context)

        # Domain to default agent mapping
        self.domain_agent_map = {
            'frontend': 'claude-code',
            'backend': 'claude-code',
            'devops': 'claude-code',
            'testing': 'claude-code',
            'documentation': 'claude-code',
            'design': 'human',  # Design tasks often need human input
            'architecture': 'human',  # Architecture decisions need human oversight
        }

        # Complexity thresholds for human intervention
        self.human_intervention_thresholds = {
            'complexity': 'complex',
            'priority': TaskPriority.CRITICAL,
            'failure_count': 3,  # Auto-fail after N attempts
        }

        logger.info("TaskRouter initialized")

    def select_next_task(self, tasks: List[Task]) -> Optional[Task]:
        """
        Select the next task to execute using intelligent multi-factor scoring

        Selection Algorithm:
        1. Filter by dependencies (only tasks with satisfied deps)
        2. Filter by validation (only tasks that pass validation)
        3. Check for tasks to avoid (recent failures, unavailable agents)
        4. Score remaining tasks using context-aware routing
        5. Sort by score and return highest-scoring task

        Args:
            tasks: List of available tasks

        Returns:
            Best task to execute next, or None if no ready tasks
        """
        if not tasks:
            logger.info("No tasks available for selection")
            return None

        logger.info(f"Selecting next task from {len(tasks)} tasks")

        # Step 1: Filter by dependencies
        ready_tasks = self.dependency_resolver.get_ready_tasks(
            tasks,
            self.context.completed_tasks
        )
        logger.info(f"Tasks with satisfied dependencies: {len(ready_tasks)}")

        if not ready_tasks:
            logger.info("No tasks with satisfied dependencies")
            return None

        # Step 2: Filter by validation
        valid_tasks = [t for t in ready_tasks if t.is_ready]
        logger.info(f"Tasks that pass validation: {len(valid_tasks)}")

        if not valid_tasks:
            logger.warning("No valid tasks ready for execution")
            # Return the first ready task even if it doesn't pass validation
            # (might need human intervention)
            return ready_tasks[0]

        # Step 3: Check for tasks to avoid
        safe_tasks = []
        avoided_tasks = []

        for task in valid_tasks:
            should_avoid, reason = self.context_router.should_avoid_task(task)
            if should_avoid:
                avoided_tasks.append((task, reason))
                logger.debug(f"Avoiding task {task.id}: {reason}")
            else:
                safe_tasks.append(task)

        # If all tasks are being avoided, still consider them
        # (prefer to make progress vs. being stuck)
        if not safe_tasks and avoided_tasks:
            logger.warning("All tasks have avoidance flags, proceeding anyway")
            safe_tasks = [task for task, _ in avoided_tasks]

        if not safe_tasks:
            logger.info("No safe tasks available")
            return None

        # Step 4: Score tasks using context-aware routing
        ranked_tasks = self.context_router.rank_tasks(safe_tasks)

        # Step 5: Return highest-scoring task
        if ranked_tasks:
            best_task, best_score = ranked_tasks[0]
            logger.info(f"Selected task {best_task.id} (score: {best_score:.3f})")

            # Log alternatives for debugging
            if len(ranked_tasks) > 1:
                alternatives = ranked_tasks[1:4]  # Top 3 alternatives
                logger.debug(f"Top alternatives: {[(t.id, s) for t, s in alternatives]}")

            return best_task

        return None

    def route_to_agent(self, task: Task) -> str:
        """
        Route task to appropriate agent

        Routing Logic:
        1. If task specifies an agent, use it
        2. Check if task requires human intervention (complexity, priority, failures)
        3. Use domain-specific routing if domain is set
        4. Get suggested agents from context-aware router
        5. Fall back to default agent (claude-code)

        Args:
            task: Task to route

        Returns:
            Agent ID to route to
        """
        logger.info(f"Routing task {task.id} to agent")

        # 1. Check if task specifies an agent
        if task.agent:
            logger.info(f"Task specifies agent: {task.agent}")
            return task.agent

        # 2. Check if task requires human intervention
        if self._requires_human_intervention(task):
            logger.info(f"Task requires human intervention: {task.id}")
            return 'human'

        # 3. Check domain-specific routing
        if task.domain and task.domain in self.domain_agent_map:
            suggested_agent = self.domain_agent_map[task.domain]

            # Check if suggested agent is available
            if suggested_agent in self.context_router.context.available_agents:
                logger.info(f"Routed to domain agent: {suggested_agent}")
                return suggested_agent
            else:
                logger.warning(f"Domain agent {suggested_agent} not available")

        # 4. Get suggested agents from context-aware router
        suggested_agents = self.context_router.get_suggested_agents(task)

        if suggested_agents:
            best_agent = suggested_agents[0]
            logger.info(f"Routed to suggested agent: {best_agent}")
            return best_agent

        # 5. Fall back to default agent
        default_agent = 'claude-code'
        logger.info(f"Routed to default agent: {default_agent}")
        return default_agent

    def make_routing_decision(self, tasks: List[Task]) -> RoutingDecision:
        """
        Make complete routing decision (task + agent)

        Args:
            tasks: List of available tasks

        Returns:
            RoutingDecision with selected task, agent, and reasoning
        """
        logger.info("Making routing decision")

        # Select best task
        task = self.select_next_task(tasks)

        if task is None:
            return RoutingDecision(
                task=None,
                agent_id=None,
                confidence=0.0,
                reasoning="No tasks ready for execution"
            )

        # Route to agent
        agent_id = self.route_to_agent(task)

        # Calculate confidence
        confidence = self._calculate_confidence(task, agent_id)

        # Generate reasoning
        reasoning = self._generate_routing_reasoning(task, agent_id, confidence)

        # Get alternatives
        ranked_tasks = self.context_router.rank_tasks(tasks)
        alternatives = ranked_tasks[1:4] if len(ranked_tasks) > 1 else []

        return RoutingDecision(
            task=task,
            agent_id=agent_id,
            confidence=confidence,
            reasoning=reasoning,
            alternatives=alternatives
        )

    def _requires_human_intervention(self, task: Task) -> bool:
        """
        Check if task requires human intervention

        Args:
            task: Task to check

        Returns:
            True if human intervention required
        """
        # Check complexity
        if task.complexity == TaskComplexity.COMPLEX:
            # Check if it's overridden in user preferences
            auto_complex = self.context.user_preferences.get('auto_complex_tasks', False)
            if not auto_complex:
                return True

        # Check priority
        if task.priority == TaskPriority.CRITICAL:
            auto_critical = self.context.user_preferences.get('auto_critical_tasks', False)
            if not auto_critical:
                return True

        # Check for repeated failures
        failure_count = sum(
            1 for entry in task.execution_history
            if not entry.get('success', True)
        )

        if failure_count >= self.human_intervention_thresholds['failure_count']:
            return True

        return False

    def _calculate_confidence(self, task: Task, agent_id: str) -> float:
        """
        Calculate confidence score for routing decision

        Args:
            task: Task being routed
            agent_id: Selected agent

        Returns:
            Confidence score (0.0 to 1.0)
        """
        confidence_factors = []

        # Task score from context router
        task_score = self.context_router.score_task(task)
        confidence_factors.append(task_score)

        # Agent success rate
        agent_success = self.context_router.context.get_agent_success_rate(agent_id)
        confidence_factors.append(agent_success)

        # Domain match
        if task.domain:
            if agent_id in self.context_router.context.agent_capabilities:
                cap = self.context_router.context.agent_capabilities[agent_id]
                if task.domain in cap.domains:
                    confidence_factors.append(1.0)
                else:
                    confidence_factors.append(0.5)
            else:
                confidence_factors.append(0.5)
        else:
            confidence_factors.append(0.7)  # Neutral for no domain

        # Calculate average
        return sum(confidence_factors) / len(confidence_factors)

    def _generate_routing_reasoning(self, task: Task, agent_id: str,
                                   confidence: float) -> str:
        """
        Generate human-readable explanation of routing decision

        Args:
            task: Selected task
            agent_id: Routed agent
            confidence: Confidence score

        Returns:
            Explanation string
        """
        parts = []

        # Task selection reasoning
        parts.append(f"Selected task '{task.title}' (priority: {task.priority_level})")

        if task.has_dependencies:
            parts.append("• All dependencies satisfied")
        else:
            parts.append("• No dependencies")

        parts.append(f"• Complexity: {task.complexity}")

        if task.domain:
            parts.append(f"• Domain: {task.domain}")

        # Agent routing reasoning
        parts.append(f"• Routed to agent: {agent_id}")

        if task.agent:
            parts.append("  (explicitly specified)")
        elif agent_id == 'human':
            parts.append("  (human intervention required)")
        elif task.domain:
            parts.append(f"  (domain specialist)")
        else:
            parts.append("  (default)")

        # Confidence
        parts.append(f"• Confidence: {confidence:.1%}")

        return "\n".join(parts)

    def update_after_execution(self, task_id: str, agent_id: str,
                             success: bool, duration: float,
                             domain: Optional[str] = None):
        """
        Update routing context after task execution

        Args:
            task_id: Executed task ID
            agent_id: Agent that executed
            success: Whether task succeeded
            duration: Execution duration in minutes
            domain: Task domain
        """
        logger.info(f"Updating context after execution: {task_id} by {agent_id} (success={success})")

        self.context_router.update_context(
            task_id=task_id,
            agent_id=agent_id,
            success=success,
            duration=duration,
            domain=domain
        )

    def get_status_summary(self) -> Dict[str, Any]:
        """
        Get summary of router status

        Returns:
            Dictionary with router status
        """
        return {
            'routing_summary': self.context_router.get_routing_summary(),
            'domain_agent_map': self.domain_agent_map,
            'human_intervention_thresholds': self.human_intervention_thresholds,
        }

    def configure_domain_agent(self, domain: str, agent: str):
        """
        Configure domain-specific agent routing

        Args:
            domain: Domain name
            agent: Agent ID
        """
        self.domain_agent_map[domain] = agent
        logger.info(f"Configured domain '{domain}' -> agent '{agent}'")

    def register_agent_capability(self, agent_id: str, domains: List[str],
                                 max_complexity: str = 'complex',
                                 initial_success_rate: float = 1.0):
        """
        Register agent capability for routing

        Args:
            agent_id: Agent ID
            domains: List of domains agent can handle
            max_complexity: Maximum complexity agent can handle
            initial_success_rate: Initial success rate estimate
        """
        capability = AgentCapability(
            agent_id=agent_id,
            domains=domains,
            max_complexity=max_complexity,
            success_rate=initial_success_rate
        )

        self.context_router.context.agent_capabilities[agent_id] = capability
        logger.info(f"Registered agent capability: {agent_id} (domains: {domains})")

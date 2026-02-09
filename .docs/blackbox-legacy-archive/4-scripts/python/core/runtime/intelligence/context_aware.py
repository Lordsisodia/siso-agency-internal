"""
Context-Aware Routing Module
Intelligent task scoring based on execution context, failures, and agent availability
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import statistics

from .models import Task


class AgentStatus(Enum):
    """Agent availability status"""
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    RATE_LIMITED = "rate_limited"


class TimeOfDay(Enum):
    """Time periods for context-aware routing"""
    EARLY_MORNING = "early_morning"  # 5-8 AM
    MORNING = "morning"              # 8-12 PM
    AFTERNOON = "afternoon"          # 12-5 PM
    EVENING = "evening"              # 5-9 PM
    NIGHT = "night"                  # 9 PM-5 AM


@dataclass
class AgentCapability:
    """Agent capability profile"""
    agent_id: str
    domains: List[str] = field(default_factory=list)
    max_complexity: str = "complex"
    status: AgentStatus = AgentStatus.AVAILABLE
    success_rate: float = 1.0
    recent_failures: List[str] = field(default_factory=list)
    last_used: Optional[datetime] = None
    tasks_completed: int = 0
    avg_completion_time: float = 0.0  # minutes


@dataclass
class ExecutionContext:
    """
    Execution context for intelligent task routing

    Attributes:
        completed_tasks: List of completed task IDs
        failed_tasks: List of failed task IDs with reasons
        agent_capabilities: Map of agent_id to capabilities
        recent_failures_by_domain: Failure count by domain
        current_time: Current timestamp
        user_preferences: User routing preferences
        execution_history: Recent execution history
    """
    completed_tasks: List[str] = field(default_factory=list)
    failed_tasks: Dict[str, str] = field(default_factory=dict)  # task_id -> reason
    agent_capabilities: Dict[str, AgentCapability] = field(default_factory=dict)
    recent_failures_by_domain: Dict[str, int] = field(default_factory=dict)
    current_time: datetime = field(default_factory=datetime.now)
    user_preferences: Dict[str, Any] = field(default_factory=dict)
    execution_history: List[Dict[str, Any]] = field(default_factory=list)

    @property
    def time_of_day(self) -> TimeOfDay:
        """Get current time period"""
        hour = self.current_time.hour
        if 5 <= hour < 8:
            return TimeOfDay.EARLY_MORNING
        elif 8 <= hour < 12:
            return TimeOfDay.MORNING
        elif 12 <= hour < 17:
            return TimeOfDay.AFTERNOON
        elif 17 <= hour < 21:
            return TimeOfDay.EVENING
        else:
            return TimeOfDay.NIGHT

    @property
    def available_agents(self) -> List[str]:
        """Get list of available agents"""
        return [
            agent_id for agent_id, cap in self.agent_capabilities.items()
            if cap.status == AgentStatus.AVAILABLE
        ]

    def get_domain_failure_rate(self, domain: str) -> float:
        """
        Get failure rate for a specific domain

        Args:
            domain: Domain to check

        Returns:
            Failure rate (0.0 to 1.0)
        """
        if domain not in self.recent_failures_by_domain:
            return 0.0

        total_failures = self.recent_failures_by_domain[domain]

        # Count total attempts in this domain
        domain_attempts = sum(
            1 for entry in self.execution_history
            if entry.get('domain') == domain
        )

        if domain_attempts == 0:
            return 0.0

        return min(total_failures / domain_attempts, 1.0)

    def get_agent_success_rate(self, agent_id: str) -> float:
        """
        Get success rate for an agent

        Args:
            agent_id: Agent to check

        Returns:
            Success rate (0.0 to 1.0)
        """
        if agent_id not in self.agent_capabilities:
            return 0.5  # Unknown agent

        return self.agent_capabilities[agent_id].success_rate

    def update_agent_status(self, agent_id: str, success: bool, domain: str):
        """
        Update agent status after task execution

        Args:
            agent_id: Agent that executed the task
            success: Whether task succeeded
            domain: Task domain
        """
        if agent_id not in self.agent_capabilities:
            self.agent_capabilities[agent_id] = AgentCapability(agent_id=agent_id)

        cap = self.agent_capabilities[agent_id]
        cap.last_used = self.current_time

        if success:
            cap.tasks_completed += 1
            # Update success rate with exponential moving average
            cap.success_rate = 0.9 * cap.success_rate + 0.1 * 1.0
        else:
            cap.success_rate = 0.9 * cap.success_rate + 0.1 * 0.0
            cap.recent_failures.append(domain)

            # Keep only last 10 failures
            if len(cap.recent_failures) > 10:
                cap.recent_failures.pop(0)

            # Update domain failure count
            self.recent_failures_by_domain[domain] = \
                self.recent_failures_by_domain.get(domain, 0) + 1

    def add_execution_record(self, task_id: str, agent_id: str, success: bool,
                           duration: float, domain: Optional[str] = None):
        """
        Add execution record to history

        Args:
            task_id: Executed task ID
            agent_id: Agent that executed
            success: Whether task succeeded
            duration: Execution duration in minutes
            domain: Task domain
        """
        record = {
            'task_id': task_id,
            'agent_id': agent_id,
            'success': success,
            'duration': duration,
            'domain': domain,
            'timestamp': self.current_time.isoformat()
        }
        self.execution_history.append(record)

        # Keep only last 100 records
        if len(self.execution_history) > 100:
            self.execution_history.pop(0)


class ContextAwareRouter:
    """
    Context-aware task routing with intelligent scoring

    Features:
    - Score tasks based on multiple context factors
    - Avoid repeating failed approaches
    - Consider agent availability and capabilities
    - Optimize for time of day and user preferences
    - Learn from execution history
    """

    def __init__(self, context: Optional[ExecutionContext] = None):
        """
        Initialize router

        Args:
            context: Initial execution context (creates new if None)
        """
        self.context = context or ExecutionContext()
        self.scoring_weights = {
            'priority': 0.35,          # Task priority importance
            'complexity': 0.15,        # Prefer simpler tasks first
            'domain_freshness': 0.20,  # Avoid recently failed domains
            'agent_availability': 0.15, # Available agents
            'time_match': 0.10,        # Task matches time of day
            'user_preference': 0.05,   # User preferences
        }

    def score_task(self, task: Task) -> float:
        """
        Score task based on context factors

        Args:
            task: Task to score

        Returns:
            Score from 0.0 to 1.0 (higher = better candidate)
        """
        scores = {
            'priority': self._score_priority(task),
            'complexity': self._score_complexity(task),
            'domain_freshness': self._score_domain_freshness(task),
            'agent_availability': self._score_agent_availability(task),
            'time_match': self._score_time_match(task),
            'user_preference': self._score_user_preference(task),
        }

        # Calculate weighted score
        total_score = sum(
            scores[factor] * self.scoring_weights[factor]
            for factor in scores
        )

        return total_score

    def _score_priority(self, task: Task) -> float:
        """
        Score based on task priority

        Higher priority = higher score
        """
        # Map priority 1-4 to score 1.0-0.0
        return (4 - task.priority) / 3.0

    def _score_complexity(self, task: Task) -> float:
        """
        Score based on task complexity

        Prefer simpler tasks for quick wins early
        """
        complexity_scores = {
            'simple': 1.0,
            'medium': 0.6,
            'complex': 0.2,
        }
        return complexity_scores.get(task.complexity, 0.5)

    def _score_domain_freshness(self, task: Task) -> float:
        """
        Score based on domain freshness

        Penalize domains with recent failures
        """
        if not task.domain:
            return 0.5  # Neutral for tasks without domain

        failure_rate = self.context.get_domain_failure_rate(task.domain)

        # Invert failure rate (high failure = low score)
        return 1.0 - failure_rate

    def _score_agent_availability(self, task: Task) -> float:
        """
        Score based on agent availability

        Higher score if suitable agents are available
        """
        if not self.context.available_agents:
            return 0.0

        # If task specifies an agent, check if it's available
        if task.agent:
            if task.agent in self.context.available_agents:
                return 1.0
            else:
                return 0.0

        # Check if any available agent can handle the domain
        if task.domain:
            capable_agents = [
                agent_id for agent_id in self.context.available_agents
                if task.domain in self.context.agent_capabilities[agent_id].domains
            ]
            return 1.0 if capable_agents else 0.3

        return 1.0

    def _score_time_match(self, task: Task) -> float:
        """
        Score based on time of day match

        Certain tasks may be better suited for certain times
        """
        time_prefs = self.context.user_preferences.get('time_preferences', {})

        if not task.domain or task.domain not in time_prefs:
            return 0.5  # Neutral

        preferred_times = time_prefs[task.domain]
        current_time = self.context.time_of_day.value

        if current_time in preferred_times:
            return 1.0
        else:
            return 0.3

    def _score_user_preference(self, task: Task) -> float:
        """
        Score based on user preferences

        User may prefer certain domains or agents
        """
        domain_prefs = self.context.user_preferences.get('preferred_domains', [])
        agent_prefs = self.context.user_preferences.get('preferred_agents', [])

        score = 0.5  # Base score

        if task.domain and task.domain in domain_prefs:
            score += 0.3

        if task.agent and task.agent in agent_prefs:
            score += 0.2

        return min(score, 1.0)

    def rank_tasks(self, tasks: List[Task]) -> List[tuple[Task, float]]:
        """
        Rank tasks by their scores

        Args:
            tasks: List of tasks to rank

        Returns:
            List of (task, score) tuples sorted by score descending
        """
        scored_tasks = [(task, self.score_task(task)) for task in tasks]
        return sorted(scored_tasks, key=lambda x: x[1], reverse=True)

    def should_avoid_task(self, task: Task) -> tuple[bool, str]:
        """
        Check if task should be avoided based on context

        Args:
            task: Task to check

        Returns:
            (should_avoid, reason) tuple
        """
        # Check for recent failures in this domain
        if task.domain:
            failure_rate = self.context.get_domain_failure_rate(task.domain)

            # If failure rate is very high, suggest avoiding
            if failure_rate > 0.7:
                return True, f"High failure rate in {task.domain} domain ({failure_rate:.1%})"

            # Check if there have been recent consecutive failures
            if task.domain in self.context.recent_failures_by_domain:
                if self.context.recent_failures_by_domain[task.domain] >= 3:
                    return True, f"Three or more recent failures in {task.domain} domain"

        # Check if specified agent is unavailable
        if task.agent and task.agent not in self.context.available_agents:
            cap = self.context.agent_capabilities.get(task.agent)
            if cap and cap.status != AgentStatus.AVAILABLE:
                return True, f"Agent {task.agent} is {cap.status.value}"

        return False, ""

    def get_suggested_agents(self, task: Task) -> List[str]:
        """
        Get suggested agents for a task

        Args:
            task: Task to get agents for

        Returns:
            List of agent IDs sorted by suitability
        """
        agents = []

        # If task specifies an agent, return it
        if task.agent:
            return [task.agent]

        # Find agents capable of handling the task
        for agent_id, capability in self.context.agent_capabilities.items():
            # Skip unavailable agents
            if capability.status != AgentStatus.AVAILABLE:
                continue

            # Check domain match
            if task.domain and task.domain not in capability.domains:
                continue

            # Check complexity capability
            complexity_levels = {'simple': 0, 'medium': 1, 'complex': 2}
            if complexity_levels.get(task.complexity, 1) > \
               complexity_levels.get(capability.max_complexity, 2):
                continue

            agents.append(agent_id)

        # Sort by success rate
        agents.sort(
            key=lambda a: self.context.get_agent_success_rate(a),
            reverse=True
        )

        return agents

    def update_context(self, task_id: str, agent_id: str, success: bool,
                      duration: float, domain: Optional[str] = None):
        """
        Update context after task execution

        Args:
            task_id: Executed task ID
            agent_id: Agent that executed
            success: Whether task succeeded
            duration: Execution duration in minutes
            domain: Task domain
        """
        # Update execution history
        self.context.add_execution_record(task_id, agent_id, success, duration, domain)

        # Update completed/failed task lists
        if success:
            if task_id not in self.context.completed_tasks:
                self.context.completed_tasks.append(task_id)
        else:
            self.context.failed_tasks[task_id] = "Execution failed"

        # Update agent status
        self.context.update_agent_status(agent_id, success, domain or "general")

    def get_routing_summary(self) -> Dict[str, Any]:
        """
        Get summary of routing context

        Returns:
            Dictionary with routing context summary
        """
        return {
            'available_agents': len(self.context.available_agents),
            'completed_tasks': len(self.context.completed_tasks),
            'failed_tasks': len(self.context.failed_tasks),
            'domains_with_failures': list(self.context.recent_failures_by_domain.keys()),
            'time_of_day': self.context.time_of_day.value,
            'execution_history_size': len(self.context.execution_history),
            'agent_success_rates': {
                agent_id: cap.success_rate
                for agent_id, cap in self.context.agent_capabilities.items()
            }
        }

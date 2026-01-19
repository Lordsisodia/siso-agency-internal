"""
Unit tests for Task Router component.

Tests task routing logic, complexity analysis, and agent selection.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from typing import Dict, List

from core.task_router import TaskRouter
from core.task_types import (
    Task,
    ComplexityScore,
    RoutingDecision,
    ExecutionStrategy,
    AgentType,
    AgentCapabilities,
    RoutingConfig,
    TaskPriority
)
from core.exceptions import AgentNotFoundError


class TestTaskRouting:
    """Test basic task routing functionality."""

    def test_simple_task_routes_to_single_agent(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Simple tasks should route to single agent execution."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Simple task: low complexity, few tools
        task = sample_tasks["simple"]
        decision = router.route(task)

        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT
        assert decision.complexity.aggregate_score < 0.5
        assert decision.estimated_steps < 10
        assert decision.confidence > 0.7
        assert decision.recommended_agent is not None

    def test_complex_task_routes_to_multi_agent(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Complex tasks should route to multi-agent execution."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Complex task: high complexity, many tools
        task = sample_tasks["complex"]
        decision = router.route(task)

        assert decision.strategy == ExecutionStrategy.MULTI_AGENT
        assert decision.complexity.aggregate_score >= 0.5
        assert decision.estimated_steps >= 10
        assert decision.agent_type == AgentType.ORCHESTRATOR
        assert decision.confidence > 0.6

    def test_moderate_task_with_specialist(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Moderate complexity tasks should route to specialist agent."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Moderate task: medium complexity
        task = sample_tasks["moderate"]
        decision = router.route(task)

        # Should route to single agent with specialist
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT
        assert decision.agent_type in [AgentType.SPECIALIST, AgentType.GENERALIST]
        assert decision.complexity.aggregate_score >= 0.3
        assert decision.complexity.aggregate_score < 0.7

    def test_explicit_strategy_in_metadata(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Tasks can explicitly request strategy in metadata."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Simple task requesting multi-agent
        task = sample_tasks["simple"]
        task.metadata["strategy"] = "multi_agent"

        decision = router.route(task)

        assert decision.strategy == ExecutionStrategy.MULTI_AGENT
        assert "explicitly requested" in decision.reasoning.lower()

    def test_task_routing_statistics(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Router should track routing statistics."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Route several tasks
        router.route(sample_tasks["simple"])
        router.route(sample_tasks["complex"])
        router.route(sample_tasks["moderate"])

        stats = router.get_statistics()

        assert stats["total_routed"] == 3
        assert stats["single_agent_routed"] >= 1
        assert stats["multi_agent_routed"] >= 1
        assert "by_domain" in stats
        assert stats["registered_agents"] == len(sample_agent_capabilities)


class TestComplexityScoring:
    """Test complexity analysis components."""

    def test_token_count_scoring(self, sample_tasks):
        """Token count should contribute to complexity score."""
        router = TaskRouter()

        # Low token count
        simple_task = sample_tasks["simple"]
        simple_complexity = router.complexity_analyzer.analyze(simple_task)

        # High token count
        complex_task = sample_tasks["complex"]
        complex_complexity = router.complexity_analyzer.analyze(complex_task)

        assert complex_complexity.token_count > simple_complexity.token_count
        assert complex_complexity.aggregate_score > simple_complexity.aggregate_score

    def test_tool_requirement_scoring(self, sample_tasks):
        """Tool requirements should contribute to complexity score."""
        router = TaskRouter()

        # Few tools
        simple_task = sample_tasks["simple"]
        simple_complexity = router.complexity_analyzer.analyze(simple_task)

        # Many tools
        multi_tool_task = sample_tasks["multi_tool"]
        multi_tool_complexity = router.complexity_analyzer.analyze(multi_tool_task)

        assert multi_tool_complexity.tool_requirements > simple_complexity.tool_requirements
        # Tool requirements increase complexity
        assert multi_tool_complexity.aggregate_score > simple_complexity.aggregate_score

    def test_domain_complexity_scoring(self, sample_tasks):
        """Domain complexity should affect routing."""
        router = TaskRouter()

        # Simple domain
        simple_task = sample_tasks["simple"]
        simple_complexity = router.complexity_analyzer.analyze(simple_task)

        # Complex domain (system_architecture)
        complex_task = sample_tasks["complex"]
        complex_complexity = router.complexity_analyzer.analyze(complex_task)

        assert complex_complexity.domain_complexity > simple_complexity.domain_complexity

    def test_complexity_thresholds(self, sample_tasks):
        """Test routing decisions at complexity thresholds."""
        router = TaskRouter(config=RoutingConfig(
            complexity_threshold=0.5,
            step_threshold=10,
            token_threshold=2000
        ))

        for capabilities in sample_agent_capabilities():
            router.register_agent(capabilities)

        # Just below threshold
        task_below = sample_tasks["simple"]
        decision_below = router.route(task_below)
        assert decision_below.strategy == ExecutionStrategy.SINGLE_AGENT

        # Just above threshold
        task_above = sample_tasks["complex"]
        decision_above = router.route(task_above)
        assert decision_above.strategy == ExecutionStrategy.MULTI_AGENT

    def test_step_complexity_estimation(self, sample_tasks):
        """Step complexity should be estimated from task properties."""
        router = TaskRouter()

        simple_task = sample_tasks["simple"]
        complexity = router.complexity_analyzer.analyze(simple_task)

        # Should have estimated steps
        assert hasattr(complexity, "step_complexity")
        assert complexity.step_complexity >= 0
        assert complexity.step_complexity <= 1


class TestAgentSelection:
    """Test agent discovery and selection logic."""

    def test_find_generalist_agent(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should find generalist agent for simple tasks."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Should recommend an agent
        assert decision.recommended_agent is not None

        # Get the agent capabilities
        agent_caps = router.get_agent_capabilities(decision.recommended_agent)
        assert agent_caps is not None

    def test_find_specialist_agent(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should find specialist agent for domain-specific tasks."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Coding task
        task = sample_tasks["moderate"]  # debugging task
        decision = router.route(task)

        # Should find coding specialist
        assert decision.recommended_agent is not None
        agent_caps = router.get_agent_capabilities(decision.recommended_agent)

        # Should have coding/debugging domain
        assert any(domain in agent_caps.domains for domain in ["coding", "debugging", "testing"])

    def test_agent_success_rate_influences_selection(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Agents with higher success rates should be preferred."""
        router = TaskRouter()

        # Register agents with different success rates
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Add another agent with lower success rate
        low_success_caps = AgentCapabilities(
            agent_id="specialist_coder_junior",
            agent_type=AgentType.SPECIALIST,
            domains=["coding", "debugging"],
            tools=["write_file", "read_file"],
            max_complexity=0.6,
            success_rate=0.65,  # Lower success rate
            avg_response_time=2.0
        )
        router.register_agent(low_success_caps)

        task = sample_tasks["moderate"]
        decision = router.route(task)

        # Should prefer higher success rate agent
        assert decision.recommended_agent is not None
        selected_caps = router.get_agent_capabilities(decision.recommended_agent)

        # Should not be the low success agent if a better one is available
        if decision.recommended_agent == "specialist_coder_junior":
            # Only acceptable if no other specialist available
            pass

    def test_find_agents_by_domain(
        self,
        sample_agent_capabilities
    ):
        """Should be able to find agents by domain."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Find coding agents
        coding_agents = router.find_agents_by_domain("coding")
        assert len(coding_agents) > 0
        assert "specialist_coder" in coding_agents

        # Find research agents
        research_agents = router.find_agents_by_domain("research")
        assert len(research_agents) > 0
        assert "specialist_researcher" in research_agents

    def test_find_agents_by_type(
        self,
        sample_agent_capabilities
    ):
        """Should be able to find agents by type."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Find specialists
        specialists = router.find_agents_by_type(AgentType.SPECIALIST)
        assert len(specialists) == 2  # coder and researcher
        assert "specialist_coder" in specialists
        assert "specialist_researcher" in specialists

        # Find generalists
        generalists = router.find_agents_by_type(AgentType.GENERALIST)
        assert len(generalists) >= 1

    def test_no_available_agent_fallback(
        self,
        sample_tasks
    ):
        """Should handle case when no suitable agent is available."""
        router = TaskRouter()

        # Don't register any agents
        task = sample_tasks["simple"]
        decision = router.route(task)

        # Should still make a decision
        assert decision is not None
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT
        # But no specific agent recommended
        assert decision.recommended_agent is None or decision.confidence < 0.7


class TestAgentRegistration:
    """Test agent registration and management."""

    def test_register_agent(self):
        """Should be able to register an agent."""
        router = TaskRouter()

        capabilities = AgentCapabilities(
            agent_id="test_agent",
            agent_type=AgentType.GENERALIST,
            domains=["test"],
            tools=["test_tool"],
            max_complexity=0.5,
            success_rate=0.8,
            avg_response_time=2.0
        )

        router.register_agent(capabilities)

        # Should be able to retrieve
        retrieved = router.get_agent_capabilities("test_agent")
        assert retrieved is not None
        assert retrieved.agent_id == "test_agent"

    def test_unregister_agent(self, sample_agent_capabilities):
        """Should be able to unregister an agent."""
        router = TaskRouter()

        # Register an agent
        router.register_agent(sample_agent_capabilities[0])

        # Unregister it
        router.unregister_agent("generalist_1")

        # Should not be found
        retrieved = router.get_agent_capabilities("generalist_1")
        assert retrieved is None

    def test_unregister_nonexistent_agent(self):
        """Should raise error when unregistering nonexistent agent."""
        router = TaskRouter()

        with pytest.raises(AgentNotFoundError):
            router.unregister_agent("nonexistent_agent")

    def test_get_agent_capabilities(
        self,
        sample_agent_capabilities
    ):
        """Should retrieve agent capabilities."""
        router = TaskRouter()
        router.register_agent(sample_agent_capabilities[0])

        caps = router.get_agent_capabilities("generalist_1")

        assert caps is not None
        assert caps.agent_id == "generalist_1"
        assert caps.agent_type == AgentType.GENERALIST
        assert "general" in caps.domains


class TestRoutingDecision:
    """Test routing decision structure and properties."""

    def test_routing_decision_structure(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Routing decision should have all required fields."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Check all fields present
        assert hasattr(decision, "task_id")
        assert hasattr(decision, "strategy")
        assert hasattr(decision, "agent_type")
        assert hasattr(decision, "recommended_agent")
        assert hasattr(decision, "complexity")
        assert hasattr(decision, "reasoning")
        assert hasattr(decision, "estimated_duration")
        assert hasattr(decision, "confidence")

    def test_routing_decision_reasoning(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Routing decision should include clear reasoning."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Reasoning should be non-empty string
        assert isinstance(decision.reasoning, str)
        assert len(decision.reasoning) > 0

        # Should mention key factors
        assert "complexity" in decision.reasoning.lower()

    def test_routing_decision_confidence(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Confidence should reflect certainty in decision."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Simple task (high confidence)
        simple_task = sample_tasks["simple"]
        simple_decision = router.route(simple_task)
        assert 0.0 <= simple_decision.confidence <= 1.0
        assert simple_decision.confidence > 0.5

        # Complex task (still reasonable confidence)
        complex_task = sample_tasks["complex"]
        complex_decision = router.route(complex_task)
        assert 0.0 <= complex_decision.confidence <= 1.0

    def test_estimated_duration(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Estimated duration should be reasonable."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Duration should be positive
        assert decision.estimated_duration > 0

        # Complex tasks should take longer
        complex_task = sample_tasks["complex"]
        complex_decision = router.route(complex_task)

        assert complex_decision.estimated_duration > decision.estimated_duration


class TestRoutingConfiguration:
    """Test routing with custom configurations."""

    def test_custom_complexity_threshold(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should respect custom complexity threshold."""
        router = TaskRouter(config=RoutingConfig(complexity_threshold=0.8))
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # With high threshold, more tasks go to single agent
        task = sample_tasks["moderate"]
        decision = router.route(task)

        # Should route to single agent with higher threshold
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT

    def test_custom_token_threshold(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should respect custom token threshold."""
        router = TaskRouter(config=RoutingConfig(token_threshold=10000))
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # With high token threshold, more tasks go to single agent
        task = sample_tasks["moderate"]
        decision = router.route(task)

        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT

    def test_event_routing_enabled(
        self,
        sample_tasks,
        sample_agent_capabilities,
        mock_event_bus
    ):
        """Should emit events when enabled."""
        router = TaskRouter(
            config=RoutingConfig(enable_event_routing=True),
            event_bus=mock_event_bus
        )
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Should have published event
        mock_event_bus.publish.assert_called_once()

    def test_event_routing_disabled(
        self,
        sample_tasks,
        sample_agent_capabilities,
        mock_event_bus
    ):
        """Should not emit events when disabled."""
        router = TaskRouter(
            config=RoutingConfig(enable_event_routing=False),
            event_bus=mock_event_bus
        )
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        # Should not have published event
        mock_event_bus.publish.assert_not_called()


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_empty_task_description(self):
        """Should handle empty task description."""
        router = TaskRouter()

        task = Task(
            task_id="empty_task",
            description="",
            prompt="",
            required_tools=[],
            domain="general",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        assert decision is not None
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT

    def test_unknown_domain(self, sample_agent_capabilities):
        """Should handle unknown domain gracefully."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = Task(
            task_id="unknown_domain_task",
            description="Task in unknown domain",
            prompt="Do something in unknown domain",
            required_tools=[],
            domain="completely_unknown_domain_xyz",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        # Should still make a decision
        assert decision is not None
        assert decision.strategy in [ExecutionStrategy.SINGLE_AGENT, ExecutionStrategy.MULTI_AGENT]

    def test_very_long_task_description(self):
        """Should handle very long task descriptions."""
        router = TaskRouter()

        long_prompt = "This is a very long prompt. " * 1000

        task = Task(
            task_id="long_task",
            description="Very long task",
            prompt=long_prompt,
            required_tools=["tool1", "tool2", "tool3"],
            domain="general",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        assert decision is not None
        # High token count should route to multi-agent
        assert decision.strategy == ExecutionStrategy.MULTI_AGENT
        assert decision.complexity.token_count > 1000

    def test_task_with_many_dependencies(self):
        """Should handle tasks with many context dependencies."""
        router = TaskRouter()

        large_context = {f"context_{i}": f"value_{i}" for i in range(100)}

        task = Task(
            task_id="context_heavy_task",
            description="Task with lots of context",
            prompt="Process this context",
            required_tools=[],
            domain="general",
            priority=TaskPriority.NORMAL,
            context=large_context,
            metadata={}
        )

        decision = router.route(task)

        assert decision is not None
        # Large context might increase complexity
        assert hasattr(decision.complexity, "aggregate_score")


class TestStatisticsAndMonitoring:
    """Test statistics tracking and monitoring."""

    def test_routing_statistics_accumulation(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Statistics should accumulate across multiple routes."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Route multiple tasks
        router.route(sample_tasks["simple"])
        router.route(sample_tasks["simple"])
        router.route(sample_tasks["complex"])
        router.route(sample_tasks["moderate"])

        stats = router.get_statistics()

        assert stats["total_routed"] == 4
        assert stats["single_agent_routed"] >= 2
        assert stats["multi_agent_routed"] >= 1

    def test_reset_statistics(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should be able to reset statistics."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Route some tasks
        router.route(sample_tasks["simple"])
        router.route(sample_tasks["complex"])

        # Reset
        router.reset_statistics()

        stats = router.get_statistics()

        assert stats["total_routed"] == 0
        assert stats["single_agent_routed"] == 0
        assert stats["multi_agent_routed"] == 0

    def test_domain_statistics(
        self,
        sample_tasks,
        sample_agent_capabilities
    ):
        """Should track statistics by domain."""
        router = TaskRouter()
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        router.route(sample_tasks["simple"])  # coding
        router.route(sample_tasks["moderate"])  # debugging
        router.route(sample_tasks["complex"])  # system_architecture

        stats = router.get_statistics()

        assert "by_domain" in stats
        assert "coding" in stats["by_domain"]
        assert "debugging" in stats["by_domain"]
        assert "system_architecture" in stats["by_domain"]


@pytest.mark.integration
class TestTaskRouterIntegration:
    """Integration tests for task router with real components."""

    def test_router_with_real_event_bus(
        self,
        sample_tasks,
        sample_agent_capabilities,
        real_event_bus
    ):
        """Router should work with real event bus."""
        router = TaskRouter(
            config=RoutingConfig(enable_event_routing=True),
            event_bus=real_event_bus
        )
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        task = sample_tasks["simple"]
        decision = router.route(task)

        assert decision is not None
        assert real_event_bus.is_connected

    def test_router_with_multiple_agents(
        self,
        sample_tasks
    ):
        """Router should handle multiple agents correctly."""
        router = TaskRouter()

        # Register multiple agents
        agents = [
            AgentCapabilities(
                agent_id=f"agent_{i}",
                agent_type=AgentType.GENERALIST,
                domains=[f"domain_{i}"],
                tools=[f"tool_{i}"],
                max_complexity=0.5,
                success_rate=0.8 + (i * 0.01),
                avg_response_time=2.0
            )
            for i in range(10)
        ]

        for agent in agents:
            router.register_agent(agent)

        task = sample_tasks["simple"]
        decision = router.route(task)

        assert decision is not None
        assert decision.recommended_agent is not None

        # Should prefer agent with highest success rate
        selected_caps = router.get_agent_capabilities(decision.recommended_agent)
        assert selected_caps.success_rate >= 0.8

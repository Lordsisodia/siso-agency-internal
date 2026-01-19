"""
Integration tests for Week 1 components.

Tests end-to-end workflows and integration between task router,
logging, manifest system, and circuit breaker.
"""

import pytest
import asyncio
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch
import tempfile
import shutil

from core.task_router import TaskRouter
from core.task_types import Task, TaskPriority, ExecutionStrategy, AgentType
from core.logging import setup_logging, get_agent_logger, get_operation_logger
from core.manifest import ManifestSystem, ManifestStatus
from core.circuit_breaker import CircuitBreaker, CircuitBreakerManager
from core.event_bus import RedisEventBus, EventBusConfig
from core.complexity import TaskComplexityAnalyzer


@pytest.mark.integration
class TestTaskRouterWithLogging:
    """Test integration between task router and logging."""

    def test_task_router_with_logging(self, temp_log_dir):
        """Task router should work with logging system."""
        # Setup logging
        log_file = temp_log_dir / "router.log"
        setup_logging(log_file=log_file, json_logs=True)

        # Create router with event bus
        router = TaskRouter()

        # Register agent
        from core.task_types import AgentCapabilities
        router.register_agent(AgentCapabilities(
            agent_id="test_agent",
            agent_type=AgentType.GENERALIST,
            domains=["test"],
            tools=["test_tool"],
            max_complexity=0.5,
            success_rate=0.9,
            avg_response_time=2.0
        ))

        # Create and route task
        task = Task(
            task_id="test_task",
            description="Test task",
            prompt="Test prompt",
            required_tools=[],
            domain="test",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        # Log file should exist and have content
        assert log_file.exists()

        # Should have completed without errors
        assert decision is not None
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT

    def test_task_router_emits_logged_events(self, temp_log_dir):
        """Task router should emit events that get logged."""
        log_file = temp_log_dir / "router_events.log"
        setup_logging(log_file=log_file, json_logs=True)

        # Create real event bus if available
        try:
            config = EventBusConfig(db=15)
            event_bus = RedisEventBus(config)
            event_bus.connect()
        except Exception:
            pytest.skip("Redis not available")

        router = TaskRouter(
            config=RoutingConfig(enable_event_routing=True),
            event_bus=event_bus
        )

        # Register agent
        from core.task_types import AgentCapabilities
        router.register_agent(AgentCapabilities(
            agent_id="test_agent",
            agent_type=AgentType.GENERALIST,
            domains=["test"],
            tools=["test"],
            max_complexity=0.5,
            success_rate=0.9,
            avg_response_time=2.0
        ))

        # Route task
        task = Task(
            task_id="test_task",
            description="Test",
            prompt="Test",
            required_tools=[],
            domain="test",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        assert decision is not None

        event_bus.disconnect()


@pytest.mark.integration
class TestManifestWithLogging:
    """Test integration between manifest system and logging."""

    def test_manifest_with_logging(self, temp_log_dir, temp_manifest_dir):
        """Manifest operations should be logged."""
        # Setup logging
        log_file = temp_log_dir / "manifest.log"
        setup_logging(log_file=log_file, json_logs=True)

        # Create manifest system
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)

        # Create operation logger
        op_logger = get_operation_logger("test_operation")

        # Create manifest
        manifest = manifest_system.create_manifest(
            "test_operation",
            {"task_id": "task_123"}
        )

        op_logger.operation_start("test_op", "Test operation")

        # Add steps
        manifest_system.start_step(manifest, "Initialize", {"config": "{}"})
        op_logger.operation_step("initialize")

        manifest_system.start_step(manifest, "Process", {"items": 100})
        op_logger.operation_step("process")

        # Complete
        manifest_system.complete_manifest(manifest, {"result": "success"})
        op_logger.operation_complete({"manifest_id": manifest.id})

        # Both manifest and log should exist
        manifest_file = temp_manifest_dir / f"{manifest.id}.md"
        assert manifest_file.exists()
        assert log_file.exists()

        # Manifest should have correct content
        manifest_content = manifest_file.read_text()
        assert "test_operation" in manifest_content
        assert "Initialize" in manifest_content
        assert "Process" in manifest_content

    def test_manifest_failure_logged(self, temp_log_dir, temp_manifest_dir):
        """Manifest failures should be logged."""
        log_file = temp_log_dir / "manifest_failure.log"
        setup_logging(log_file=log_file, json_logs=True)

        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        op_logger = get_operation_logger("failing_operation")

        manifest = manifest_system.create_manifest("failing_op")
        op_logger.operation_start("failing_op", "This will fail")

        manifest_system.start_step(manifest, "Step 1")
        op_logger.operation_step("step_1")

        # Fail
        error_msg = "Operation failed: dependency missing"
        manifest_system.fail_manifest(manifest, error_msg)
        op_logger.operation_failure(error_msg)

        # Check log contains error
        with open(log_file) as f:
            log_content = f.read()

        assert "failed" in log_content.lower() or "failure" in log_content.lower()
        assert error_msg in log_content or "dependency" in log_content.lower()

        # Check manifest has error
        manifest_file = temp_manifest_dir / f"{manifest.id}.md"
        manifest_content = manifest_file.read_text()
        assert error_msg in manifest_content


@pytest.mark.integration
class TestTaskRouterWithManifest:
    """Test integration between task router and manifest system."""

    def test_end_to_end_task_execution(
        self,
        temp_manifest_dir,
        temp_log_dir,
        sample_agent_capabilities
    ):
        """Complete end-to-end workflow with all components."""
        # Setup
        setup_logging(log_file=temp_log_dir / "e2e.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter()

        # Register agents
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Create operation manifest
        manifest = manifest_system.create_manifest(
            "task_execution",
            {"description": "Execute a routed task"}
        )

        op_logger = get_operation_logger(manifest.id)
        op_logger.operation_start("task_execution", "Execute task")

        # Step 1: Analyze and route task
        manifest_system.start_step(manifest, "route_task")
        task = Task(
            task_id="e2e_task",
            description="Write a simple function",
            prompt="Write a function to add two numbers",
            required_tools=[],
            domain="coding",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)
        op_logger.operation_step("task_routed", strategy=decision.strategy.value)

        # Step 2: Execute (mock)
        manifest_system.start_step(manifest, "execute_task", {
            "agent": decision.recommended_agent,
            "strategy": decision.strategy.value
        })

        # Mock execution
        result = {"status": "success", "output": "Function created"}
        op_logger.operation_step("task_executed", result=result)

        # Step 3: Complete
        manifest_system.complete_manifest(manifest, {
            "decision": {
                "strategy": decision.strategy.value,
                "agent": decision.recommended_agent,
                "confidence": decision.confidence
            },
            "result": result
        })

        op_logger.operation_complete({
            "manifest_id": manifest.id,
            "task_id": task.task_id
        })

        # Verify all components worked
        assert manifest.status == ManifestStatus.COMPLETED
        assert len(manifest.steps) == 3
        assert decision.strategy == ExecutionStrategy.SINGLE_AGENT

        # Verify manifest file
        manifest_file = temp_manifest_dir / f"{manifest.id}.md"
        assert manifest_file.exists()

    def test_multi_agent_task_execution(
        self,
        temp_manifest_dir,
        temp_log_dir,
        sample_agent_capabilities
    ):
        """Complex task requiring multi-agent coordination."""
        setup_logging(log_file=temp_log_dir / "multi_agent.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter()

        # Register agents
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Create complex task
        manifest = manifest_system.create_manifest("multi_agent_task")
        op_logger = get_operation_logger(manifest.id)
        op_logger.operation_start("multi_agent", "Complex multi-agent task")

        # Complex task
        task = Task(
            task_id="complex_task",
            description="Design and implement complete system",
            prompt="Design a complete microservice architecture" * 100,
            required_tools=["design", "code", "test", "deploy"],
            domain="system_architecture",
            priority=TaskPriority.CRITICAL,
            context={"scale": "enterprise"},
            metadata={}
        )

        manifest_system.start_step(manifest, "analyze_complexity")
        decision = router.route(task)

        # Should route to multi-agent
        assert decision.strategy == ExecutionStrategy.MULTI_AGENT
        assert decision.agent_type == AgentType.ORCHESTRATOR

        op_logger.operation_step("routed_to_multi_agent")

        # Simulate multi-agent execution
        manifest_system.start_step(manifest, "decompose_task")
        op_logger.operation_step("task_decomposed", subtasks=3)

        manifest_system.start_step(manifest, "coordinate_agents")
        op_logger.operation_step("agents_coordinated", agents=["coder", "architect", "tester"])

        manifest_system.complete_manifest(manifest, {
            "strategy": "multi_agent",
            "subtasks_completed": 3,
            "result": "System designed and implemented"
        })

        op_logger.operation_complete({"manifest_id": manifest.id})

        assert manifest.status == ManifestStatus.COMPLETED


@pytest.mark.integration
class TestCircuitBreakerIntegration:
    """Test circuit breaker integration with other components."""

    def test_circuit_breaker_with_task_router(
        self,
        sample_agent_capabilities,
        temp_log_dir
    ):
        """Circuit breaker should protect agent calls."""
        setup_logging(log_file=temp_log_dir / "circuit_breaker.log", json_logs=True)

        # Create circuit breaker for an agent
        cb = CircuitBreaker("agent.generalist_1")

        # Simulate successful calls
        def successful_call():
            return {"result": "success"}

        result = cb.call(successful_call)
        assert result == {"result": "success"}
        assert cb.is_closed

        # Simulate failing calls
        def failing_call():
            raise Exception("Agent failed")

        # Trigger failures to open circuit
        for _ in range(3):
            try:
                cb.call(failing_call)
            except Exception:
                pass

        # Circuit should be open now
        assert cb.is_open

        # Next call should fail fast
        with pytest.raises(Exception):  # CircuitBreakerOpenError or Exception
            cb.call(successful_call)

    def test_circuit_breaker_with_manifest(
        self,
        temp_manifest_dir,
        temp_log_dir
    ):
        """Circuit breaker failures should be reflected in manifests."""
        setup_logging(log_file=temp_log_dir / "cb_manifest.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)

        manifest = manifest_system.create_manifest("circuit_breaker_test")

        # Create circuit breaker
        cb = CircuitBreaker("test_service")

        manifest_system.start_step(manifest, "attempt_call")

        # Simulate failures
        def failing_operation():
            raise Exception("Service unavailable")

        try:
            cb.call(failing_operation)
        except Exception:
            pass

        # Circuit should open after threshold
        for _ in range(3):
            try:
                cb.call(failing_operation)
            except Exception:
                pass

        manifest_system.start_step(manifest, "circuit_opened", {
            "state": cb.state.value,
            "failures": cb.stats.current_failures
        })

        # Fail manifest due to circuit open
        manifest_system.fail_manifest(
            manifest,
            f"Circuit breaker open after {cb.stats.current_failures} failures"
        )

        assert manifest.status == ManifestStatus.FAILED
        assert cb.is_open


@pytest.mark.integration
class TestFullSystemIntegration:
    """Complete integration tests with all Week 1 components."""

    def test_complete_task_workflow(
        self,
        temp_manifest_dir,
        temp_log_dir,
        sample_agent_capabilities
    ):
        """Complete workflow from task creation to completion."""
        # Setup all components
        setup_logging(log_file=temp_log_dir / "complete.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter()
        cb_manager = CircuitBreakerManager()

        # Register agents
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Get circuit breaker for agent
        cb = cb_manager.get_breaker("agent.generalist_1")

        # Create manifest
        manifest = manifest_system.create_manifest("complete_workflow")
        op_logger = get_operation_logger(manifest.id)

        op_logger.operation_start("complete_workflow", "Full system test")

        # Phase 1: Task routing
        manifest_system.start_step(manifest, "route_task")
        task = Task(
            task_id="complete_test",
            description="Test complete workflow",
            prompt="Test prompt",
            required_tools=[],
            domain="general",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)
        op_logger.operation_step("routed", strategy=decision.strategy.value)

        # Phase 2: Execute with circuit breaker protection
        manifest_system.start_step(manifest, "execute_with_protection")

        def execute_task():
            # Mock execution
            return {"status": "completed", "output": "Task done"}

        result = cb.call(execute_task)
        op_logger.operation_step("executed", result=result)

        # Phase 3: Complete
        manifest_system.complete_manifest(manifest, {
            "task_id": task.task_id,
            "decision": {
                "strategy": decision.strategy.value,
                "agent": decision.recommended_agent
            },
            "result": result,
            "circuit_breaker": {
                "state": cb.state.value,
                "failures": cb.stats.current_failures
            }
        })

        op_logger.operation_complete({"manifest_id": manifest.id})

        # Verify everything worked
        assert manifest.status == ManifestStatus.COMPLETED
        assert len(manifest.steps) == 3
        assert cb.is_closed  # Circuit should be closed after success

    def test_error_recovery_workflow(
        self,
        temp_manifest_dir,
        temp_log_dir
    ):
        """Workflow that handles errors and recovers."""
        setup_logging(log_file=temp_log_dir / "recovery.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)

        manifest = manifest_system.create_manifest("error_recovery")
        op_logger = get_operation_logger(manifest.id)

        op_logger.operation_start("error_recovery", "Test error handling")

        # Create circuit breaker
        cb = CircuitBreaker("flaky_service", failure_threshold=2)

        # Step 1: Attempt operation that fails
        manifest_system.start_step(manifest, "attempt_operation")

        def flaky_operation():
            raise Exception("Service unavailable")

        # Try multiple times
        attempt = 0
        max_attempts = 3

        while attempt < max_attempts:
            try:
                result = cb.call(flaky_operation)
                manifest_system.start_step(manifest, "operation_success", {
                    "attempt": attempt + 1
                })
                break
            except Exception as e:
                attempt += 1
                op_logger.operation_step("attempt_failed", {
                    "attempt": attempt,
                    "error": str(e)
                })

                # Circuit might be open now
                if cb.is_open:
                    # Log circuit state
                    manifest_system.start_step(manifest, "circuit_open", {
                        "state": cb.state.value,
                        "failures": cb.stats.current_failures
                    })
                    break

        # Fail the manifest if all attempts failed
        if cb.is_open:
            manifest_system.fail_manifest(
                manifest,
                f"Failed after {attempt} attempts, circuit breaker open"
            )
            op_logger.operation_failure("All attempts failed")

        assert manifest.status == ManifestStatus.FAILED
        assert cb.is_open

    def test_parallel_task_execution(
        self,
        temp_manifest_dir,
        temp_log_dir,
        sample_agent_capabilities
    ):
        """Simulate parallel task execution with manifests."""
        setup_logging(log_file=temp_log_dir / "parallel.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter()

        # Register agents
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Main manifest
        main_manifest = manifest_system.create_manifest("parallel_execution")
        op_logger = get_operation_logger(main_manifest.id)

        op_logger.operation_start("parallel_execution", "Execute tasks in parallel")

        # Create multiple subtasks
        tasks = [
            Task(
                task_id=f"task_{i}",
                description=f"Subtask {i}",
                prompt=f"Task {i}",
                required_tools=[],
                domain="general",
                priority=TaskPriority.NORMAL,
                context={},
                metadata={}
            )
            for i in range(3)
        ]

        # Route all tasks
        manifest_system.start_step(main_manifest, "route_tasks", {
            "task_count": len(tasks)
        })

        decisions = []
        for task in tasks:
            decision = router.route(task)
            decisions.append(decision)

        op_logger.operation_step("tasks_routed", count=len(decisions))

        # Simulate parallel execution
        manifest_system.start_step(main_manifest, "execute_parallel", {
            "tasks": len(tasks)
        })

        results = []
        for i, (task, decision) in enumerate(zip(tasks, decisions)):
            # Create sub-manifest for each task
            sub_manifest = manifest_system.create_manifest(
                f"subtask_{i}",
                {"parent": main_manifest.id, "task_id": task.task_id}
            )

            manifest_system.start_step(sub_manifest, "execute", {
                "agent": decision.recommended_agent
            })

            # Mock execution
            result = {
                "task_id": task.task_id,
                "status": "completed",
                "output": f"Result {i}"
            }

            manifest_system.complete_manifest(sub_manifest, result)
            results.append(result)

        op_logger.operation_step("parallel_completed", results=len(results))

        # Complete main manifest
        manifest_system.complete_manifest(main_manifest, {
            "subtasks": len(tasks),
            "results": results
        })

        op_logger.operation_complete({"manifest_id": main_manifest.id})

        # Verify
        assert main_manifest.status == ManifestStatus.COMPLETED
        assert len(results) == 3

        # All sub-manifests should be completed
        all_manifests = manifest_system.list_manifests()
        completed = [m for m in all_manifests if m.status == ManifestStatus.COMPLETED]
        assert len(completed) >= 3  # At least the subtasks


@pytest.mark.integration
class TestRealComponentsIntegration:
    """Integration tests with real external components."""

    def test_with_real_redis(self, real_event_bus, temp_manifest_dir, temp_log_dir):
        """Integration with real Redis event bus."""
        setup_logging(log_file=temp_log_dir / "redis_integration.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter(event_bus=real_event_bus)

        # Register agent
        from core.task_types import AgentCapabilities
        router.register_agent(AgentCapabilities(
            agent_id="test_agent",
            agent_type=AgentType.GENERALIST,
            domains=["test"],
            tools=["test"],
            max_complexity=0.5,
            success_rate=0.9,
            avg_response_time=2.0
        ))

        # Create manifest
        manifest = manifest_system.create_manifest("redis_test")

        # Route task
        task = Task(
            task_id="redis_test",
            description="Test with Redis",
            prompt="Test",
            required_tools=[],
            domain="test",
            priority=TaskPriority.NORMAL,
            context={},
            metadata={}
        )

        decision = router.route(task)

        manifest_system.complete_manifest(manifest, {
            "strategy": decision.strategy.value,
            "agent": decision.recommended_agent
        })

        # Verify event bus still connected
        assert real_event_bus.is_connected
        assert manifest.status == ManifestStatus.COMPLETED

        real_event_bus.disconnect()


@pytest.mark.slow
@pytest.mark.integration
class TestPerformanceIntegration:
    """Performance tests for integrated components."""

    def test_high_volume_task_routing(
        self,
        temp_manifest_dir,
        temp_log_dir,
        sample_agent_capabilities
    ):
        """Test handling high volume of tasks."""
        setup_logging(log_file=temp_log_dir / "performance.log", json_logs=True)
        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)
        router = TaskRouter()

        # Register agents
        for capabilities in sample_agent_capabilities:
            router.register_agent(capabilities)

        # Route many tasks
        import time
        start = time.time()

        task_count = 100
        for i in range(task_count):
            task = Task(
                task_id=f"perf_test_{i}",
                description=f"Performance test {i}",
                prompt="Test",
                required_tools=[],
                domain="general",
                priority=TaskPriority.NORMAL,
                context={},
                metadata={}
            )

            decision = router.route(task)
            assert decision is not None

        duration = time.time() - start

        # Should complete in reasonable time
        assert duration < 10.0  # Less than 10 seconds for 100 tasks

        # Check statistics
        stats = router.get_statistics()
        assert stats["total_routed"] == task_count

    def test_concurrent_manifest_creation(self, temp_manifest_dir):
        """Test creating many manifests concurrently."""
        import threading

        manifest_system = ManifestSystem(manifest_dir=temp_manifest_dir)

        def create_manifests(count):
            for i in range(count):
                manifest_system.create_manifest(f"concurrent_{i}")

        # Create multiple threads
        threads = [
            threading.Thread(target=create_manifests, args=(10,))
            for _ in range(5)
        ]

        start = threading.time()
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        duration = threading.time() - start

        # Should complete reasonably fast
        assert duration < 5.0

        # Check all manifests exist
        all_manifests = manifest_system.list_manifests()
        assert len(all_manifests) >= 50  # 5 threads * 10 manifests

"""
Blackbox 5 Main Bootstrap

This is THE CENTRAL ENTRY POINT that wires together ALL Blackbox 5 systems.

Must implement:
1. Blackbox5 class with lazy initialization
2. initialize() method that loads ALL systems in order
3. process_request() that implements the FULL pipeline
4. Singleton pattern via get_blackbox5()
5. Proper error handling and logging
6. Async/await throughout

Pipeline order (MUST follow exactly):
1. Parse request into Task
2. Route task via TaskRouter
3. Execute (single or multi-agent based on routing)
4. Check for guide suggestions
5. Return result with routing metadata

Systems to initialize (in order):
1. EventBus (RedisEventBus) - other components depend on it
2. AgentLoader - load all agents
3. SkillManager - load all skills
4. Wire skills to agents
5. TaskRouter - register all agents
6. Orchestrator - for multi-agent coordination
7. Guide system - for proactive suggestions
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

# Add parent directory to path for sibling imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Core imports
from agents.core.agent_loader import AgentLoader
from agents.core.skill_manager import SkillManager
from agents.core.base_agent import BaseAgent, AgentTask

from orchestration.Orchestrator import AgentOrchestrator, WorkflowStep
from routing.task_router import TaskRouter, Task, AgentCapabilities, AgentType
from state.event_bus import RedisEventBus, EventBusConfig
from routing.complexity import TaskComplexityAnalyzer

# Guide system imports
# from guides import Guide, OperationRegistry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Blackbox5")


class InitializationError(Exception):
    """Raised when Blackbox5 initialization fails."""
    pass


class ProcessingError(Exception):
    """Raised when request processing fails."""
    pass


class Blackbox5:
    """
    Blackbox 5 Main System Class

    This is the central bootstrap that wires together all Blackbox 5 systems.
    Implements lazy initialization and the complete request processing pipeline.

    Pipeline:
    1. Parse request into Task
    2. Route task via TaskRouter
    3. Execute (single or multi-agent based on routing)
    4. Check for guide suggestions
    5. Return result with routing metadata
    """

    def __init__(self, project_path: Optional[Path] = None):
        """
        Initialize Blackbox5 system.

        Args:
            project_path: Path to the project (defaults to current working directory)
        """
        self.project_path = project_path or Path.cwd()
        self.engine_path = Path(__file__).parent

        # Core components (lazy initialized)
        self._event_bus: Optional[RedisEventBus] = None
        self._agent_loader: Optional[AgentLoader] = None
        self._skill_manager: Optional[SkillManager] = None
        self._task_router: Optional[TaskRouter] = None
        self._orchestrator: Optional[AgentOrchestrator] = None
        self._complexity_analyzer: Optional[TaskComplexityAnalyzer] = None
        # self._guide_registry: Optional[OperationRegistry] = None
        self._guide_registry = None

        # State tracking
        self._initialized = False
        self._initialization_lock = asyncio.Lock()

        # Agent registry
        self._agents: Dict[str, BaseAgent] = {}

        logger.info(f"Blackbox5 instance created for project: {self.project_path}")

    async def initialize(self) -> None:
        """
        Initialize ALL Blackbox5 systems in order.

        Initialization order is critical:
        1. EventBus - other components depend on it
        2. AgentLoader - load all agents
        3. SkillManager - load all skills
        4. Wire skills to agents
        5. TaskRouter - register all agents
        6. Orchestrator - for multi-agent coordination
        7. Guide system - for proactive suggestions

        Raises:
            InitializationError: If initialization fails
        """
        async with self._initialization_lock:
            if self._initialized:
                logger.info("Blackbox5 already initialized, skipping")
                return

            logger.info("=" * 60)
            logger.info("INITIALIZING BLACKBOX5 SYSTEM")
            logger.info("=" * 60)

            try:
                # Step 1: Initialize EventBus
                await self._initialize_event_bus()

                # Step 2: Initialize AgentLoader
                await self._initialize_agent_loader()

                # Step 3: Initialize SkillManager
                await self._initialize_skill_manager()

                # Step 4: Wire skills to agents
                await self._wire_skills_to_agents()

                # Step 5: Initialize TaskRouter
                await self._initialize_task_router()

                # Step 6: Initialize Orchestrator
                await self._initialize_orchestrator()

                # Step 7: Initialize Guide system
                await self._initialize_guide_system()

                self._initialized = True
                logger.info("=" * 60)
                logger.info("BLACKBOX5 INITIALIZATION COMPLETE")
                logger.info("=" * 60)
                logger.info(f"Loaded {len(self._agents)} agents")
                logger.info(f"Task router ready with {len(self._task_router._agents)} registered agents")

            except Exception as e:
                logger.error(f"Failed to initialize Blackbox5: {e}", exc_info=True)
                raise InitializationError(f"Initialization failed: {e}") from e

    async def _initialize_event_bus(self) -> None:
        """Initialize Redis event bus."""
        logger.info("[1/7] Initializing EventBus...")

        try:
            config = EventBusConfig(
                host="localhost",
                port=6379,
                db=0,
                enable_reconnection=True
            )

            self._event_bus = RedisEventBus(config)
            self._event_bus.connect()

            logger.info(f"EventBus connected: {self._event_bus.state.value}")

        except Exception as e:
            logger.warning(f"Failed to connect to Redis EventBus: {e}")
            logger.info("Continuing without EventBus (some features may be limited)")
            self._event_bus = None

    async def _initialize_agent_loader(self) -> None:
        """Initialize agent loader and load all agents."""
        logger.info("[2/7] Initializing AgentLoader...")

        try:
            agents_path = self.engine_path.parent / "agents"
            self._agent_loader = AgentLoader(agents_path=agents_path)

            # Load all agents
            self._agents = await self._agent_loader.load_all()

            logger.info(f"Loaded {len(self._agents)} agents from {agents_path}")

            # List loaded agents
            for agent_name, agent in self._agents.items():
                logger.debug(f"  - {agent_name}: {agent.role} ({agent.category})")

        except Exception as e:
            logger.error(f"Failed to initialize AgentLoader: {e}")
            raise

    async def _initialize_skill_manager(self) -> None:
        """Initialize skill manager and load all skills."""
        logger.info("[3/7] Initializing SkillManager...")

        try:
            skills_path = self.engine_path.parent / "agents" / ".skills"
            self._skill_manager = SkillManager(skills_path=skills_path)

            # Load all skills
            skills = await self._skill_manager.load_all()

            logger.info(f"Loaded {len(skills)} skills from {skills_path}")

            # List skill categories
            for category in self._skill_manager.list_categories():
                skill_count = len(self._skill_manager.get_skills_by_category(category))
                logger.debug(f"  - {category}: {skill_count} skills")

        except Exception as e:
            logger.warning(f"Failed to initialize SkillManager: {e}")
            logger.info("Continuing without skills")
            self._skill_manager = None

    async def _wire_skills_to_agents(self) -> None:
        """Wire skills to agents that can use them."""
        logger.info("[4/7] Wiring skills to agents...")

        if not self._skill_manager:
            logger.info("Skipping skill wiring (no SkillManager)")
            return

        try:
            wired_count = 0

            for agent_name, agent in self._agents.items():
                # Get skills this agent can use
                agent_skills = self._skill_manager.get_skills_for_agent(agent_name)

                if agent_skills:
                    # Attach skills to agent (implementation depends on agent structure)
                    if hasattr(agent, '_skills'):
                        agent._skills = [skill.name for skill in agent_skills]
                        wired_count += len(agent_skills)

                    logger.debug(f"  Wired {len(agent_skills)} skills to {agent_name}")

            logger.info(f"Wired {wired_count} skill assignments to agents")

        except Exception as e:
            logger.warning(f"Failed to wire skills: {e}")

    async def _initialize_task_router(self) -> None:
        """Initialize task router and register all agents."""
        logger.info("[5/7] Initializing TaskRouter...")

        try:
            self._complexity_analyzer = TaskComplexityAnalyzer()
            self._task_router = TaskRouter(
                event_bus=self._event_bus,
                complexity_analyzer=self._complexity_analyzer
            )

            # Register all agents with the task router
            registered_count = 0

            for agent_name, agent in self._agents.items():
                # Create AgentCapabilities from agent config
                capabilities = AgentCapabilities(
                    name=agent_name,
                    agent_type=self._map_agent_role_to_type(agent.role),
                    capabilities=agent.config.capabilities,
                    max_tasks=5,
                    success_rate=0.9,
                    avg_task_time=60.0
                )

                await self._task_router.register_agent(agent)
                registered_count += 1

            logger.info(f"Registered {registered_count} agents with TaskRouter")

        except Exception as e:
            logger.error(f"Failed to initialize TaskRouter: {e}")
            raise

    async def _initialize_orchestrator(self) -> None:
        """Initialize multi-agent orchestrator."""
        logger.info("[6/7] Initializing Orchestrator...")

        try:
            memory_path = self.project_path / ".blackbox5" / "agent_memory"
            self._orchestrator = AgentOrchestrator(
                event_bus=self._event_bus,
                task_router=self._task_router,
                memory_base_path=memory_path,
                max_concurrent_agents=5,
                enable_checkpoints=True,
                enable_state_management=True
            )

            logger.info("Orchestrator initialized")

        except Exception as e:
            logger.error(f"Failed to initialize Orchestrator: {e}")
            raise

    async def _initialize_guide_system(self) -> None:
        """Initialize guide system for proactive suggestions."""
        logger.info("[7/7] Initializing Guide system...")

        try:
            # self._guide_registry = OperationRegistry()
            logger.info("Guide system disabled (OperationRegistry not imported)")

        except Exception as e:
            logger.warning(f"Failed to initialize Guide system: {e}")
            logger.info("Continuing without guide suggestions")
            self._guide_registry = None

    def _map_agent_role_to_type(self, role: str) -> AgentType:
        """Map agent role to AgentType enum."""
        role_lower = role.lower()

        if "orchestrat" in role_lower:
            return AgentType.ORCHESTRATOR
        elif "manager" in role_lower or "pm" in role_lower:
            return AgentType.MANAGER
        elif "specialist" in role_lower or "expert" in role_lower:
            return AgentType.SPECIALIST
        elif "executor" in role_lower or "implementor" in role_lower:
            return AgentType.EXECUTOR
        else:
            return AgentType.GENERALIST

    async def process_request(
        self,
        request: str,
        session_id: Optional[str] = None,
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process a request through the FULL pipeline.

        Pipeline:
        1. Parse request into Task
        2. Route task via TaskRouter
        3. Execute (single or multi-agent based on routing)
        4. Check for guide suggestions
        5. Return result with routing metadata

        Args:
            request: The user request to process
            session_id: Optional session ID for context tracking
            context: Optional additional context

        Returns:
            Dictionary with result, routing metadata, and guide suggestions

        Raises:
            ProcessingError: If processing fails
        """
        # Ensure initialized
        if not self._initialized:
            await self.initialize()

        session_id = session_id or str(uuid.uuid4())
        context = context or {}

        logger.info(f"Processing request (session: {session_id})")
        logger.debug(f"Request: {request[:200]}...")

        try:
            # Step 1: Parse request into Task
            task = self._parse_request(request, session_id, context)
            logger.info(f"Parsed task: {task.task_id} (type: {task.task_type}, domain: {task.domain})")

            # Step 2: Route task via TaskRouter
            routing_decision = self._task_router.route(task)
            logger.info(
                f"Routing decision: {routing_decision.strategy.value} "
                f"(agent: {routing_decision.recommended_agent}, "
                f"complexity: {routing_decision.complexity.aggregate_score:.2f})"
            )

            # Step 3: Execute based on routing
            result = await self._execute_task(task, routing_decision)

            # Step 4: Check for guide suggestions
            guide_suggestions = await self._get_guide_suggestions(task, result)

            # Step 5: Return complete response
            response = {
                "result": result,
                "routing": {
                    "strategy": routing_decision.strategy.value,
                    "agent": routing_decision.recommended_agent,
                    "complexity": routing_decision.complexity.aggregate_score,
                    "reasoning": routing_decision.reasoning,
                    "estimated_duration": routing_decision.estimated_duration,
                    "confidence": routing_decision.confidence
                },
                "guide_suggestions": guide_suggestions,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            }

            logger.info(f"Request processed successfully in {response['routing']['estimated_duration']:.2f}s estimated")

            return response

        except Exception as e:
            logger.error(f"Failed to process request: {e}", exc_info=True)
            raise ProcessingError(f"Request processing failed: {e}") from e

    def _parse_request(self, request: str, session_id: str, context: Dict) -> Task:
        """
        Parse request into Task for routing.

        Args:
            request: User request string
            session_id: Session identifier
            context: Additional context

        Returns:
            Task object
        """
        # Infer task type and domain from request
        task_type = self._infer_task_type(request)
        domain = self._infer_domain(request)
        priority = self._infer_priority(request)

        # Create Task object
        task = Task(
            task_id=f"task_{session_id}",
            description=request,
            task_type=task_type,
            domain=domain,
            priority=priority,
            context=context,
            metadata={"session_id": session_id}
        )

        return task

    def _infer_task_type(self, request: str) -> str:
        """Infer task type from request."""
        request_lower = request.lower()

        if any(word in request_lower for word in ["analyze", "investigate", "research", "study"]):
            return "analysis"
        elif any(word in request_lower for word in ["design", "architecture", "plan"]):
            return "architecture"
        elif any(word in request_lower for word in ["implement", "build", "create", "write"]):
            return "implementation"
        elif any(word in request_lower for word in ["test", "verify", "validate"]):
            return "testing"
        elif any(word in request_lower for word in ["fix", "debug", "resolve"]):
            return "debugging"
        elif any(word in request_lower for word in ["document", "explain"]):
            return "documentation"
        else:
            return "general"

    def _infer_domain(self, request: str) -> str:
        """Infer domain from request."""
        request_lower = request.lower()

        if any(word in request_lower for word in ["backend", "api", "server", "database"]):
            return "backend"
        elif any(word in request_lower for word in ["frontend", "ui", "interface"]):
            return "frontend"
        elif any(word in request_lower for word in ["devops", "deploy", "infrastructure"]):
            return "devops"
        elif any(word in request_lower for word in ["test", "qa"]):
            return "testing"
        elif any(word in request_lower for word in ["document", "readme"]):
            return "documentation"
        else:
            return "general"

    def _infer_priority(self, request: str) -> str:
        """Infer priority from request."""
        request_lower = request.lower()

        if any(word in request_lower for word in ["urgent", "critical", "asap", "immediately"]):
            return "critical"
        elif any(word in request_lower for word in ["important", "high priority"]):
            return "high"
        elif any(word in request_lower for word in ["low priority", "when possible"]):
            return "low"
        else:
            return "normal"

    async def _execute_task(self, task: Task, routing_decision) -> Any:
        """
        Execute task based on routing decision.

        Args:
            task: Task to execute
            routing_decision: Routing decision from TaskRouter

        Returns:
            Execution result
        """
        strategy = routing_decision.strategy.value

        if strategy == "single_agent":
            return await self._execute_single_agent(task, routing_decision)
        elif strategy == "multi_agent":
            return await self._execute_multi_agent(task, routing_decision)
        else:
            # Default to single agent
            return await self._execute_single_agent(task, routing_decision)

    async def _execute_single_agent(self, task: Task, routing_decision) -> Any:
        """
        Execute task with a single agent.

        Args:
            task: Task to execute
            routing_decision: Routing decision

        Returns:
            Agent execution result
        """
        agent_name = routing_decision.recommended_agent

        if not agent_name:
            # Fallback to first available agent
            agent_name = list(self._agents.keys())[0]
            logger.warning(f"No agent recommended, using fallback: {agent_name}")

        agent = self._agents.get(agent_name)

        if not agent:
            raise ProcessingError(f"Agent not found: {agent_name}")

        logger.info(f"Executing with single agent: {agent_name}")

        # Convert Task to AgentTask
        agent_task = AgentTask(
            id=task.task_id,
            description=task.description,
            type=task.task_type,
            complexity="medium",
            context=task.context or {}
        )

        # Execute agent
        try:
            result = await agent.execute(agent_task)

            return {
                "success": result.success,
                "output": result.output,
                "artifacts": result.artifacts,
                "metadata": result.metadata,
                "agent": agent_name,
                "duration": result.duration
            }

        except Exception as e:
            logger.error(f"Agent execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": agent_name
            }

    async def _execute_multi_agent(self, task: Task, routing_decision) -> Any:
        """
        Execute task with multi-agent orchestration.

        Args:
            task: Task to execute
            routing_decision: Routing decision

        Returns:
            Orchestrated execution result
        """
        logger.info("Executing with multi-agent orchestration")

        # Create workflow steps for the task
        # This is a simplified version - real implementation would break down
        # the task into multiple steps based on complexity
        workflow_step = WorkflowStep(
            agent_type="developer",  # Default to developer
            task=task.description,
            agent_id=None,  # Let orchestrator assign
            timeout=300
        )

        # Execute via orchestrator
        try:
            result = await self._orchestrator.execute_wave_based(
                tasks=[workflow_step],
                workflow_id=task.task_id
            )

            return {
                "success": result.state.value == "completed",
                "output": result.results,
                "steps_completed": result.steps_completed,
                "steps_total": result.steps_total,
                "errors": result.errors,
                "waves_completed": result.waves_completed,
                "artifacts": list(result.results.keys()) if result.results else []
            }

        except Exception as e:
            logger.error(f"Multi-agent execution failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _get_guide_suggestions(self, task: Task, result: Any) -> List[Dict[str, Any]]:
        """
        Get guide suggestions based on task and result.

        Args:
            task: The task that was executed
            result: The execution result

        Returns:
            List of guide suggestions
        """
        if not self._guide_registry:
            return []

        # Check for guide suggestions based on task type and result
        suggestions = []

        # This is a placeholder - real implementation would query
        # the guide registry for relevant suggestions
        if result.get("success"):
            suggestions.append({
                "type": "next_step",
                "title": "Task completed successfully",
                "description": "Consider validating the implementation or running tests"
            })

        return suggestions

    async def shutdown(self) -> None:
        """
        Shutdown Blackbox5 and cleanup resources.
        """
        logger.info("Shutting down Blackbox5...")

        # Disconnect event bus
        if self._event_bus:
            try:
                self._event_bus.disconnect()
                logger.info("EventBus disconnected")
            except Exception as e:
                logger.warning(f"Failed to disconnect EventBus: {e}")

        # Cleanup orchestrator
        if self._orchestrator:
            try:
                # Cleanup completed agents
                self._orchestrator.cleanup_completed_agents(older_than_seconds=0)
                logger.info("Orchestrator cleaned up")
            except Exception as e:
                logger.warning(f"Failed to cleanup orchestrator: {e}")

        self._initialized = False
        logger.info("Blackbox5 shutdown complete")

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get system statistics.

        Returns:
            Dictionary with system statistics
        """
        stats = {
            "initialized": self._initialized,
            "project_path": str(self.project_path),
            "agent_count": len(self._agents),
            "agents": list(self._agents.keys()),
        }

        if self._task_router:
            stats["routing"] = self._task_router.get_statistics()

        if self._orchestrator:
            stats["orchestrator"] = self._orchestrator.get_statistics()

        return stats


# =============================================================================
# SINGLETON PATTERN
# =============================================================================

_global_blackbox5: Optional[Blackbox5] = None
_blackbox5_lock = asyncio.Lock()


async def get_blackbox5(project_path: Optional[Path] = None) -> Blackbox5:
    """
    Get the global Blackbox5 singleton instance.

    Args:
        project_path: Path to project (only used on first call)

    Returns:
        The global Blackbox5 instance
    """
    global _global_blackbox5

    async with _blackbox5_lock:
        if _global_blackbox5 is None:
            logger.info("Creating global Blackbox5 instance")
            _global_blackbox5 = Blackbox5(project_path=project_path)
            await _global_blackbox5.initialize()

        return _global_blackbox5


async def shutdown_blackbox5() -> None:
    """Shutdown the global Blackbox5 instance."""
    global _global_blackbox5

    async with _blackbox5_lock:
        if _global_blackbox5:
            await _global_blackbox5.shutdown()
            _global_blackbox5 = None


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

async def process_request(
    request: str,
    session_id: Optional[str] = None,
    context: Optional[Dict] = None,
    project_path: Optional[Path] = None
) -> Dict[str, Any]:
    """
    Convenience function to process a request.

    Args:
        request: The user request
        session_id: Optional session ID
        context: Optional context
        project_path: Optional project path

    Returns:
        Processing result
    """
    bb5 = await get_blackbox5(project_path=project_path)
    return await bb5.process_request(request, session_id, context)


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    async def main():
        """Test the Blackbox5 system."""
        print("Testing Blackbox5 Main Bootstrap...")

        # Get instance
        bb5 = await get_blackbox5()

        # Print statistics
        stats = bb5.get_statistics()
        print(f"\nSystem Statistics:")
        print(f"  Initialized: {stats['initialized']}")
        print(f"  Project: {stats['project_path']}")
        print(f"  Agents: {stats['agent_count']}")
        print(f"  Agent Names: {', '.join(stats['agents'][:5])}...")

        # Test request processing
        print("\nProcessing test request...")
        result = await bb5.process_request(
            request="Create a simple Python function to calculate fibonacci numbers",
            session_id="test_session"
        )

        print(f"\nResult:")
        print(f"  Strategy: {result['routing']['strategy']}")
        print(f"  Agent: {result['routing']['agent']}")
        print(f"  Complexity: {result['routing']['complexity']:.2f}")
        print(f"  Success: {result['result'].get('success', False)}")

        # Shutdown
        await bb5.shutdown()
        print("\nTest complete!")

    asyncio.run(main())

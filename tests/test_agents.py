"""
Tests for BlackBox5 Agent System

Comprehensive tests for the working agent implementations including:
- DeveloperAgent
- AnalystAgent
- ArchitectAgent
- BaseAgent functionality
- Task routing and execution
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Add the blackbox5 engine to path
sys.path.insert(0, str(Path(__file__).parent / ".blackbox5" / "engine"))

from engine.agents.core.BaseAgent import (
    BaseAgent,
    AgentConfig,
    Task,
    AgentResult,
    BMADAgent,
    GSDAgent,
    SpecialistAgent
)
from engine.agents.agents import (
    DeveloperAgent,
    AnalystAgent,
    ArchitectAgent,
    create_developer_agent,
    create_analyst_agent,
    create_architect_agent
)


class TestBaseAgent:
    """Test the BaseAgent class and core functionality"""

    def test_agent_config_creation(self):
        """Test creating an AgentConfig"""
        config = AgentConfig(
            name="TestAgent",
            full_name="Test Agent",
            role="Tester",
            category="test",
            icon="🧪",
            description="A test agent",
            capabilities=["testing"]
        )

        assert config.name == "TestAgent"
        assert config.role == "Tester"
        assert config.icon == "🧪"
        assert config.capabilities == ["testing"]

    def test_task_creation(self):
        """Test creating a Task"""
        task = Task(
            id="test-001",
            description="Test task description",
            type="testing",
            complexity="simple"
        )

        assert task.id == "test-001"
        assert task.description == "Test task description"
        assert task.type == "testing"
        assert task.complexity == "simple"

    def test_agent_result_creation(self):
        """Test creating an AgentResult"""
        result = AgentResult(
            success=True,
            agent="TestAgent",
            task_id="test-001",
            output="Test output",
            artifacts=["test.py"],
            duration=1.5
        )

        assert result.success is True
        assert result.agent == "TestAgent"
        assert result.task_id == "test-001"
        assert result.output == "Test output"
        assert result.artifacts == ["test.py"]
        assert result.duration == 1.5


class TestDeveloperAgent:
    """Test the DeveloperAgent implementation"""

    @pytest.fixture
    def developer_agent(self):
        """Create a developer agent for testing"""
        return create_developer_agent(use_mock_llm=True)

    def test_developer_agent_creation(self, developer_agent):
        """Test creating a developer agent"""
        assert developer_agent.name == "Amelia"
        assert developer_agent.role == "Senior Software Engineer"
        assert developer_agent.category == "bmad"
        assert developer_agent.config.icon == "💻"

    def test_developer_agent_initialization(self, developer_agent):
        """Test initializing the developer agent"""
        asyncio.run(developer_agent.initialize())
        assert developer_agent._initialized is True

    def test_developer_agent_execute_simple_task(self, developer_agent):
        """Test executing a simple implementation task"""
        asyncio.run(developer_agent.initialize())

        task = Task(
            id="dev-001",
            description="Write a hello world function in Python",
            type="implementation",
            complexity="simple"
        )

        result = asyncio.run(developer_agent.execute(task))

        assert result.success is True
        assert result.agent == "Amelia"
        assert result.task_id == "dev-001"
        assert result.output is not None
        assert isinstance(result.output, dict)
        assert "response" in result.output
        assert result.duration >= 0

    def test_developer_agent_execute_sync(self, developer_agent):
        """Test synchronous execution wrapper"""
        asyncio.run(developer_agent.initialize())

        task = Task(
            id="dev-002",
            description="Write a test function",
            type="implementation",
            complexity="simple"
        )

        result = developer_agent.execute_sync(task)

        assert result.success is True
        assert result.agent == "Amelia"

    def test_developer_agent_tdd_principles(self, developer_agent):
        """Test that developer agent has TDD principles"""
        assert len(developer_agent.principles) > 0
        assert any("red-green-refactor" in p.lower() for p in developer_agent.principles)
        assert any("test" in p.lower() for p in developer_agent.principles)

    def test_developer_agent_artifact_extraction(self, developer_agent):
        """Test artifact extraction from responses"""
        response = """
        Created files:
        - `hello_world.py` - Main implementation
        - `test_hello_world.py` - Test file
        - `README.md` - Documentation
        """

        artifacts = developer_agent._extract_artifacts(response)

        assert len(artifacts) >= 3
        assert "hello_world.py" in artifacts
        assert "test_hello_world.py" in artifacts
        assert "README.md" in artifacts


class TestAnalystAgent:
    """Test the AnalystAgent implementation"""

    @pytest.fixture
    def analyst_agent(self):
        """Create an analyst agent for testing"""
        return create_analyst_agent(use_mock_llm=True)

    def test_analyst_agent_creation(self, analyst_agent):
        """Test creating an analyst agent"""
        assert analyst_agent.name == "Mary"
        assert analyst_agent.role == "Strategic Business Analyst + Requirements Expert"
        assert analyst_agent.category == "bmad"
        assert analyst_agent.config.icon == "📊"

    def test_analyst_agent_initialization(self, analyst_agent):
        """Test initializing the analyst agent"""
        asyncio.run(analyst_agent.initialize())
        assert analyst_agent._initialized is True

    def test_analyst_agent_execute_research_task(self, analyst_agent):
        """Test executing a research task"""
        asyncio.run(analyst_agent.initialize())

        task = Task(
            id="analysis-001",
            description="Analyze the competitive landscape for project management tools",
            type="research",
            complexity="medium",
            context={
                "focus": "SMB market",
                "region": "North America"
            }
        )

        result = asyncio.run(analyst_agent.execute(task))

        assert result.success is True
        assert result.agent == "Mary"
        assert result.task_id == "analysis-001"
        assert result.output is not None
        assert "frameworks_used" in result.output

    def test_analyst_agent_execute_requirements_task(self, analyst_agent):
        """Test executing a requirements elicitation task"""
        asyncio.run(analyst_agent.initialize())

        task = Task(
            id="req-001",
            description="Elicit requirements for a task management system",
            type="requirements",
            complexity="medium"
        )

        result = asyncio.run(analyst_agent.execute(task))

        assert result.success is True
        assert "response" in result.output

    def test_analyst_agent_frameworks(self, analyst_agent):
        """Test that analyst agent has analysis frameworks"""
        assert len(analyst_agent.analysis_frameworks) > 0
        assert "SWOT" in analyst_agent.analysis_frameworks
        assert "Porter's Five Forces" in analyst_agent.analysis_frameworks

    def test_analyst_agent_framework_detection(self, analyst_agent):
        """Test framework detection in responses"""
        response = """
        Based on SWOT analysis, we identified key strengths and weaknesses.
        Porter's Five Forces reveals high competitive rivalry.
        Root cause analysis shows the underlying issues.
        """

        frameworks = analyst_agent._detect_frameworks(response)

        assert len(frameworks) > 0
        assert "SWOT" in frameworks
        assert "Porter's Five Forces" in frameworks


class TestArchitectAgent:
    """Test the ArchitectAgent implementation"""

    @pytest.fixture
    def architect_agent(self):
        """Create an architect agent for testing"""
        return create_architect_agent(use_mock_llm=True)

    def test_architect_agent_creation(self, architect_agent):
        """Test creating an architect agent"""
        assert architect_agent.name == "Alex"
        assert architect_agent.role == "Technical Architect & Solution Engineer"
        assert architect_agent.category == "bmad"
        assert architect_agent.config.icon == "🏗️"

    def test_architect_agent_initialization(self, architect_agent):
        """Test initializing the architect agent"""
        asyncio.run(architect_agent.initialize())
        assert architect_agent._initialized is True

    def test_architect_agent_execute_architecture_task(self, architect_agent):
        """Test executing an architecture design task"""
        asyncio.run(architect_agent.initialize())

        task = Task(
            id="arch-001",
            description="Design a scalable microservices architecture",
            type="architecture",
            complexity="complex",
            inputs={
                "requirements": "Handle 10k concurrent users",
                "constraints": ["Use PostgreSQL", "Deploy to AWS"]
            }
        )

        result = asyncio.run(architect_agent.execute(task))

        assert result.success is True
        assert result.agent == "Alex"
        assert result.task_id == "arch-001"
        assert result.output is not None
        assert "patterns_detected" in result.output

    def test_architect_agent_execute_api_design_task(self, architect_agent):
        """Test executing an API design task"""
        asyncio.run(architect_agent.initialize())

        task = Task(
            id="api-001",
            description="Design REST API for task management",
            type="api_design",
            complexity="medium"
        )

        result = asyncio.run(architect_agent.execute(task))

        assert result.success is True
        assert "response" in result.output

    def test_architect_agent_patterns(self, architect_agent):
        """Test that architect agent has architecture patterns"""
        assert len(architect_agent.architecture_patterns) > 0
        assert "Microservices" in architect_agent.architecture_patterns
        assert "Layered Architecture" in architect_agent.architecture_patterns

    def test_architect_agent_pattern_detection(self, architect_agent):
        """Test pattern detection in responses"""
        response = """
        We recommend a microservices architecture with an API Gateway.
        The system will use event-driven patterns for real-time updates.
        """

        patterns = architect_agent._detect_patterns(response)

        assert len(patterns) > 0
        assert "Microservices" in patterns

    def test_architect_agent_technology_detection(self, architect_agent):
        """Test technology detection in responses"""
        response = """
        The tech stack will use React for the frontend,
        Node.js for the backend, PostgreSQL for the database,
        and Docker for containerization.
        """

        technologies = architect_agent._detect_technologies(response)

        assert len(technologies) > 0
        assert "React" in technologies
        assert "Node.js" in technologies
        assert "PostgreSQL" in technologies


class TestAgentIntegration:
    """Integration tests for multiple agents working together"""

    def test_multiple_agents_creation(self):
        """Test creating multiple agents"""
        dev = create_developer_agent(use_mock_llm=True)
        analyst = create_analyst_agent(use_mock_llm=True)
        architect = create_architect_agent(use_mock_llm=True)

        assert dev.name == "Amelia"
        assert analyst.name == "Mary"
        assert architect.name == "Alex"

    def test_sequential_task_execution(self):
        """Test executing tasks across multiple agents sequentially"""
        analyst = create_analyst_agent(use_mock_llm=True)
        architect = create_architect_agent(use_mock_llm=True)
        dev = create_developer_agent(use_mock_llm=True)

        asyncio.run(analyst.initialize())
        asyncio.run(architect.initialize())
        asyncio.run(dev.initialize())

        # Phase 1: Analysis
        analysis_task = Task(
            id="phase-1",
            description="Analyze requirements for task management system",
            type="research",
            complexity="medium"
        )
        analysis_result = asyncio.run(analyst.execute(analysis_task))
        assert analysis_result.success is True

        # Phase 2: Architecture
        arch_task = Task(
            id="phase-2",
            description="Design architecture based on analysis",
            type="architecture",
            complexity="complex"
        )
        arch_result = asyncio.run(architect.execute(arch_task))
        assert arch_result.success is True

        # Phase 3: Implementation
        impl_task = Task(
            id="phase-3",
            description="Implement core features",
            type="implementation",
            complexity="medium"
        )
        impl_result = asyncio.run(dev.execute(impl_task))
        assert impl_result.success is True

    def test_agent_task_routing(self):
        """Test that different agents handle different task types appropriately"""
        dev = create_developer_agent(use_mock_llm=True)
        analyst = create_analyst_agent(use_mock_llm=True)
        architect = create_architect_agent(use_mock_llm=True)

        asyncio.run(dev.initialize())
        asyncio.run(analyst.initialize())
        asyncio.run(architect.initialize())

        # Implementation task should go to developer
        impl_task = Task(
            id="route-001",
            description="Write a feature",
            type="implementation",
            complexity="simple"
        )
        impl_result = asyncio.run(dev.execute(impl_task))
        assert impl_result.success is True

        # Research task should go to analyst
        research_task = Task(
            id="route-002",
            description="Research market",
            type="research",
            complexity="medium"
        )
        research_result = asyncio.run(analyst.execute(research_task))
        assert research_result.success is True

        # Architecture task should go to architect
        arch_task = Task(
            id="route-003",
            description="Design system",
            type="architecture",
            complexity="complex"
        )
        arch_result = asyncio.run(architect.execute(arch_task))
        assert arch_result.success is True


class TestAgentErrorHandling:
    """Test error handling in agents"""

    def test_developer_agent_error_handling(self):
        """Test developer agent handles errors gracefully"""
        agent = create_developer_agent(use_mock_llm=True)
        asyncio.run(agent.initialize())

        # Invalid task (missing required fields)
        task = Task(
            id="error-001",
            description="",  # Empty description
            type="implementation",
            complexity="simple"
        )

        # Agent should still return a result
        result = asyncio.run(agent.execute(task))
        assert isinstance(result, AgentResult)

    def test_agent_uninitialized(self):
        """Test that agent can execute without explicit initialization"""
        agent = create_developer_agent(use_mock_llm=True)

        task = Task(
            id="uninit-001",
            description="Test task",
            type="implementation",
            complexity="simple"
        )

        # Agent should auto-initialize or handle gracefully
        result = asyncio.run(agent.execute(task))
        assert isinstance(result, AgentResult)


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

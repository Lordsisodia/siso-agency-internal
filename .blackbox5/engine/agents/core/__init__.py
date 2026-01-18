"""
Black Box 5 Engine - Agents Package

Provides the core agent system for BB5:
- BaseAgent: Foundation for all agents
- AgentLoader: Load agents from filesystem
- AgentRouter: Route tasks to agents
- SkillManager: Manage skills
- ExecutionOrchestrator: Orchestrate multi-agent workflows
"""

from .BaseAgent import (
    BaseAgent,
    BMADAgent,
    GSDAgent,
    SpecialistAgent,
    AgentConfig,
    Task,
    AgentResult,
    ExecutionContext,
    create_agent
)

from .AgentLoader import AgentLoader
from .AgentRouter import AgentRouter, ExecutionOrchestrator, TaskComplexity, TaskType
from .SkillManager import SkillManager, Skill, SkillType, SkillComplexity, SkillRisk

__all__ = [
    # Base classes
    "BaseAgent",
    "BMADAgent",
    "GSDAgent",
    "SpecialistAgent",
    "AgentConfig",
    "Task",
    "AgentResult",
    "ExecutionContext",
    "create_agent",

    # Loader
    "AgentLoader",

    # Router
    "AgentRouter",
    "ExecutionOrchestrator",
    "TaskComplexity",
    "TaskType",

    # Skills
    "SkillManager",
    "Skill",
    "SkillType",
    "SkillComplexity",
    "SkillRisk",
]


# Version info
__version__ = "5.0.0"

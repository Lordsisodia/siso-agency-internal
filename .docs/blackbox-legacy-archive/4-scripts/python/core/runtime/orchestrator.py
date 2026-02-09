#!/usr/bin/env python3
"""
Ultimate Orchestrator - Combines BMAD + Think-Rail + Context
The best of both worlds: Real BMAD methodology with hierarchical oversight
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum
import json


class ScaleLevel(Enum):
    """BMAD Scale-Adaptive Levels"""
    QUICK_FIX = 0      # 5min, 2 agents
    SMALL_FEATURE = 1  # 15min, 5 agents
    PRODUCT_PLATFORM = 2  # 30min, 12 agents
    COMPLEX_SYSTEM = 3 # 1hour, 18 agents
    ENTERPRISE = 4     # 2hours, 21 agents


@dataclass
class Task:
    """Task definition"""
    description: str
    type: str
    importance: str = "medium"
    requirements: List[str] = None
    context: Dict[str, Any] = None

    def __post_init__(self):
        if self.requirements is None:
            self.requirements = []
        if self.context is None:
            self.context = {}


@dataclass
class AgentConfig:
    """Agent configuration"""
    name: str
    tier: str  # strategic, specialist, executor
    role: str
    model: str


class UltimateOrchestrator:
    """
    Ultimate orchestrator combining:
    - Real BMAD methodology (21 agents, scale-adaptive)
    - Think-rail oversight (hierarchical validation)
    - Context scanning (codebase awareness)
    - Model routing (smart model selection)
    """

    # Scale-adaptive level configurations
    LEVEL_CONFIGS = {
        0: {
            "name": "quick_fix",
            "agents": ["dev"],
            "time_estimate": "5min",
            "description": "Quick fixes and simple changes"
        },
        1: {
            "name": "small_feature",
            "agents": ["pm", "dev", "ux-designer"],
            "time_estimate": "15min",
            "description": "Small features and enhancements"
        },
        2: {
            "name": "product_platform",
            "agents": ["pm", "analyst", "architect", "dev", "ux-designer",
                      "tech-writer", "security-engineer", "qa-engineer",
                      "devops-engineer", "sm", "performance-analyst"],
            "time_estimate": "30min",
            "description": "Product/platform features"
        },
        3: {
            "name": "complex_system",
            "agents": ["pm", "analyst", "architect", "dev", "ux-designer",
                      "tech-writer", "security-engineer", "qa-engineer",
                      "devops-engineer", "sm", "performance-analyst",
                      "game-designer", "game-architect", "game-dev",
                      "trend-analyst", "innovation-strategist", "creative-problem-solver",
                      "design-thinking-coach"],
            "time_estimate": "1hour",
            "description": "Complex system development"
        },
        4: {
            "name": "enterprise",
            "agents": ["pm", "analyst", "architect", "dev", "ux-designer",
                      "tech-writer", "security-engineer", "qa-engineer",
                      "devops-engineer", "sm", "performance-analyst",
                      "game-designer", "game-architect", "game-dev",
                      "trend-analyst", "innovation-strategist", "creative-problem-solver",
                      "design-thinking-coach", "presentation-master", "brainstorming-coach",
                      "storyteller", "bmad-master"],
            "time_estimate": "2hours",
            "description": "Enterprise-scale projects"
        }
    }

    def __init__(self,
                 project_root: Optional[Path] = None,
                 bmad_agents_dir: Optional[Path] = None):
        """
        Initialize Ultimate Orchestrator

        Args:
            project_root: Root directory of project
            bmad_agents_dir: Directory containing converted BMAD agents
        """
        from core.runtime.model_router import ModelRouter
        from core.runtime.think_rail import ThinkRailValidator
        from core.runtime.context_scanner import ContextScanner

        self.project_root = project_root or Path.cwd()
        self.bmad_agents_dir = bmad_agents_dir or (self.project_root / "core" / "agents" / "bmad-converted")

        # Initialize core systems
        self.model_router = ModelRouter()
        self.think_rail = ThinkRailValidator()
        self.context_scanner = ContextScanner(self.project_root)

        # Load BMAD agents
        self.agents = self._load_agents()

    def _load_agents(self) -> Dict[str, AgentConfig]:
        """Load converted BMAD agents"""
        agents = {}

        if not self.bmad_agents_dir.exists():
            return agents

        for agent_file in self.bmad_agents_dir.glob("*.md"):
            try:
                # Parse agent file to extract metadata
                with open(agent_file) as f:
                    content = f.read()

                # Extract tier from content
                tier = "specialist"  # default
                if "Tier: STRATEGIC" in content:
                    tier = "strategic"
                elif "Tier: EXECUTOR" in content:
                    tier = "executor"

                # Extract name
                name = agent_file.stem.replace("-", " ").title()

                # Extract role
                role = "Specialist"
                for line in content.split("\n"):
                    if "### Role" in line:
                        # Get next few lines
                        idx = content.index(line)
                        role_section = content[idx:idx+100]
                        for role_line in role_section.split("\n")[1:5]:
                            if role_line.strip() and not role_line.startswith("#"):
                                role = role_line.strip()
                                break
                        break

                agents[agent_file.stem] = AgentConfig(
                    name=agent_file.stem,
                    tier=tier,
                    role=role,
                    model=self._get_model_for_tier(tier)
                )

            except Exception as e:
                print(f"Warning: Failed to load agent {agent_file.name}: {e}")

        return agents

    def _get_model_for_tier(self, tier: str) -> str:
        """Get model name for tier"""
        models = {
            "strategic": "GLM-4 Plus",
            "specialist": "GLM-4",
            "executor": "GLM-4 Flash"
        }
        return models.get(tier, "GLM-4")

    def determine_scale_level(self, task: Task) -> int:
        """
        Determine scale-adaptive level (0-4) based on task complexity

        Args:
            task: Task to analyze

        Returns:
            Scale level (0-4)
        """
        description = task.description.lower()
        complexity_score = 0

        # Complexity indicators
        strategic_keywords = [
            ("architecture", 20), ("system", 15), ("microservices", 20),
            ("enterprise", 25), ("platform", 15), ("infrastructure", 20),
            ("design", 10), ("strategy", 15), ("analysis", 10)
        ]

        feature_keywords = [
            ("feature", 10), ("implement", 8), ("build", 8),
            ("create", 5), ("add", 3), ("enhancement", 8)
        ]

        simple_keywords = [
            ("fix", 3), ("bug", 3), ("update", 2), ("change", 2),
            ("refactor", 5), ("optimize", 5)
        ]

        # Score task
        for keyword, score in strategic_keywords:
            if keyword in description:
                complexity_score += score

        for keyword, score in feature_keywords:
            if keyword in description:
                complexity_score += score

        for keyword, score in simple_keywords:
            if keyword in description:
                complexity_score += score

        # Determine level
        if complexity_score < 10:
            return 0  # Quick fix
        elif complexity_score < 30:
            return 1  # Small feature
        elif complexity_score < 60:
            return 2  # Product/platform
        elif complexity_score < 90:
            return 3  # Complex system
        else:
            return 4  # Enterprise

    def execute_task(self, task: Task, level: Optional[int] = None) -> Dict[str, Any]:
        """
        Execute task with appropriate agents and oversight

        Args:
            task: Task to execute
            level: Scale level (0-4), auto-determined if not provided

        Returns:
            Execution result
        """
        # Step 1: Determine scale level
        if level is None:
            level = self.determine_scale_level(task)

        level_config = self.LEVEL_CONFIGS[level]

        print(f"\n{'='*70}")
        print(f"🚀 EXECUTING TASK: {task.description}")
        print(f"{'='*70}")
        print(f"\n📊 Scale Level: {level} ({level_config['name']})")
        print(f"⏱️  Time Estimate: {level_config['time_estimate']}")
        print(f"👥 Agents: {len(level_config['agents'])}")
        print(f"🎯 Description: {level_config['description']}")

        # Step 2: Scan codebase for context
        print(f"\n{'─'*70}")
        print("Step 1: Scanning codebase for context...")
        print(f"{'─'*70}")

        context = self.context_scanner.scan_context(task)

        print(f"✅ Found {len(context.similar_features)} similar features")
        print(f"✅ Found {len(context.patterns)} patterns")
        print(f"✅ Found {len(context.relevant_code)} relevant code files")
        print(f"✅ Found {len(context.lessons_learned)} lessons learned")

        # Step 3: Route to model
        print(f"\n{'─'*70}")
        print("Step 2: Routing to appropriate model...")
        print(f"{'─'*70}")

        model_config = self.model_router.route(task, context.to_dict())

        print(f"✅ Model: {model_config.model}")
        print(f"✅ Provider: {model_config.provider}")
        print(f"✅ Temperature: {model_config.temperature}")
        print(f"✅ Max Tokens: {model_config.max_tokens:,}")
        print(f"✅ Reason: {model_config.reason}")

        # Step 4: Select agents for this level
        print(f"\n{'─'*70}")
        print("Step 3: Selecting agents for this task...")
        print(f"{'─'*70}")

        selected_agents = []
        for agent_name in level_config['agents']:
            if agent_name in self.agents:
                agent = self.agents[agent_name]
                selected_agents.append(agent)

                tier_symbol = {
                    "strategic": "⭐",
                    "specialist": "🔧",
                    "executor": "⚡"
                }.get(agent.tier, "🤖")

                print(f"{tier_symbol} {agent.name}: {agent.role} ({agent.model})")

        # Step 5: Execute with think-rail validation
        print(f"\n{'─'*70}")
        print("Step 4: Executing with think-rail oversight...")
        print(f"{'─'*70}")

        results = []
        for agent in selected_agents:
            print(f"\n🤖 {agent.name} ({agent.tier}):")

            # Check if validation needed
            action = {"type": "analysis", "description": f"Execute {agent.name} tasks"}
            should_validate = self.think_rail.should_validate(agent.tier, action)

            validation_status = "✅ Validate" if should_validate else "⏭️ Skip"
            print(f"   Validation: {validation_status}")

            if should_validate:
                # Pre-validation
                validation = self.think_rail.validate_before(
                    agent.tier, action, context.to_dict()
                )

                if validation.approved:
                    print(f"   Result: APPROVED")
                else:
                    print(f"   Result: REJECTED - {validation.feedback}")
                    continue

            # Simulate agent execution
            result = {
                "agent": agent.name,
                "tier": agent.tier,
                "status": "completed",
                "outputs": ["analysis", "recommendations"]
            }
            results.append(result)

            # Post-validation
            if should_validate:
                validation = self.think_rail.validate_after(
                    agent.tier, result, context.to_dict()
                )

                if validation.approved:
                    print(f"   Post-validation: APPROVED ✅")
                else:
                    print(f"   Post-validation: NEEDS REVIEW ⚠️")

        # Step 6: Summary
        print(f"\n{'='*70}")
        print(f"✅ EXECUTION COMPLETE")
        print(f"{'='*70}")

        print(f"\n📊 Summary:")
        print(f"   Scale Level: {level} ({level_config['name']})")
        print(f"   Agents Used: {len(selected_agents)}")
        print(f"   Tasks Completed: {len(results)}")
        print(f"   Model Used: {model_config.model}")
        print(f"   Context Found: {len(context.similar_features) + len(context.patterns)} items")

        return {
            "level": level,
            "level_name": level_config['name'],
            "agents_used": len(selected_agents),
            "tasks_completed": len(results),
            "model_used": model_config.model,
            "context_items": len(context.similar_features) + len(context.patterns),
            "results": results
        }

    def list_agents(self) -> None:
        """List all available BMAD agents"""
        print(f"\n{'='*70}")
        print(f"📋 AVAILABLE BMAD AGENTS")
        print(f"{'='*70}\n")

        tiers = {
            "strategic": [],
            "specialist": [],
            "executor": []
        }

        # Group by tier
        for agent_name, agent in self.agents.items():
            tiers[agent.tier].append(agent)

        # Print by tier
        for tier_name, tier_agents in tiers.items():
            if not tier_agents:
                continue

            tier_symbol = {
                "strategic": "⭐ STRATEGIC (HQ Model)",
                "specialist": "🔧 SPECIALIST (Balanced Model)",
                "executor": "⚡ EXECUTOR (Fast Model)"
            }.get(tier_name, tier_name.upper())

            print(f"{tier_symbol}")
            print(f"{'─'*70}")

            for agent in tier_agents:
                print(f"  • {agent.name}: {agent.role}")
            print()

    def get_level_info(self, level: int) -> None:
        """Get information about a scale level"""
        if level not in self.LEVEL_CONFIGS:
            print(f"Error: Invalid level {level}")
            return

        config = self.LEVEL_CONFIGS[level]

        print(f"\n{'='*70}")
        print(f"📊 SCALE LEVEL {level}: {config['name'].upper()}")
        print(f"{'='*70}\n")

        print(f"Description: {config['description']}")
        print(f"Time Estimate: {config['time_estimate']}")
        print(f"Agents Required: {len(config['agents'])}")
        print(f"\nAgents:")

        for i, agent_name in enumerate(config['agents'], 1):
            if agent_name in self.agents:
                agent = self.agents[agent_name]
                print(f"  {i}. {agent.name}: {agent.role}")
            else:
                print(f"  {i}. {agent_name}: (not loaded)")


# Singleton instance
_orchestrator_instance = None

def get_orchestrator(project_root: Optional[Path] = None) -> UltimateOrchestrator:
    """Get singleton orchestrator instance"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = UltimateOrchestrator(project_root)
    return _orchestrator_instance

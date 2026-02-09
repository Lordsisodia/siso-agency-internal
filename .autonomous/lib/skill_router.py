#!/usr/bin/env python3
"""
Skill Router for SISO-Internal Autonomous System

Automatically routes tasks to appropriate skills based on keywords,
task type, and confidence scoring.

Adapted from BlackBox5 RALF-Core automatic skill routing system.
"""

import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class SkillType(Enum):
    """Types of skills available."""
    PM = "bmad-pm"                    # Product Management
    ARCHITECT = "bmad-architect"      # Architecture
    ANALYST = "bmad-analyst"          # Research/Analysis
    SM = "bmad-sm"                    # Scrum/Process
    UX = "bmad-ux"                    # UX/Design
    DEV = "bmad-dev"                  # Development
    QA = "bmad-qa"                    # QA/Testing
    TEA = "bmad-tea"                  # Task Execution
    QUICK_FLOW = "bmad-quick-flow"    # Quick Tasks
    SUPERINTELLIGENCE = "superintelligence-protocol"
    CONTINUOUS_IMPROVEMENT = "continuous-improvement"
    GIT = "git-commit"
    CODEBASE_NAV = "codebase-navigation"
    SUPABASE = "supabase-operations"
    WEB_SEARCH = "web-search"


@dataclass
class SkillMatch:
    """Represents a skill match result."""
    skill: SkillType
    confidence: float  # 0.0 to 1.0
    matched_keywords: List[str]
    rationale: str


class SkillRouter:
    """Routes tasks to appropriate skills."""

    # Domain keyword mappings
    DOMAIN_KEYWORDS: Dict[SkillType, List[str]] = {
        SkillType.PM: [
            "prd", "requirements", "feature", "product", "epic", "user story",
            "roadmap", "milestone", "release", "backlog", "prioritize",
        ],
        SkillType.ARCHITECT: [
            "architecture", "design", "refactor", "pattern", "scalability",
            "structure", "system", "component", "integration", "platform",
        ],
        SkillType.ANALYST: [
            "research", "analyze", "investigate", "pattern", "benchmark",
            "study", "survey", "compare", "evaluate", "assess",
        ],
        SkillType.SM: [
            "sprint", "process", "coordination", "planning", "ceremony",
            "standup", "retrospective", "workflow", "methodology",
        ],
        SkillType.UX: [
            "ui", "ux", "design", "user flow", "interface", "mockup",
            "wireframe", "prototype", "usability", "experience",
        ],
        SkillType.DEV: [
            "implement", "code", "develop", "build", "create", "write",
            "function", "class", "module", "api", "endpoint",
        ],
        SkillType.QA: [
            "test", "quality", "qa", "validation", "verify", "check",
            "assert", "spec", "coverage", "bug", "issue",
        ],
        SkillType.TEA: [
            "ralf", "autonomous", "execute", "workflow", "orchestrate",
            "delegate", "coordinate", "multi-agent",
        ],
        SkillType.QUICK_FLOW: [
            "simple", "quick fix", "straightforward", "minor", "small",
            "trivial", "easy", "fast",
        ],
        SkillType.SUPERINTELLIGENCE: [
            "should we", "how should we", "what's the best way",
            "architecture", "strategy", "complex", "decision",
        ],
        SkillType.CONTINUOUS_IMPROVEMENT: [
            "improve", "optimize", "refine", "iterate", "enhance",
            "better", "upgrade", "polish", "tune",
        ],
        SkillType.GIT: [
            "commit", "pr", "pull request", "git", "branch", "merge",
            "repository", "version control", "push", "pull",
        ],
        SkillType.CODEBASE_NAV: [
            "find code", "explore", "understand structure", "navigate",
            "locate", "search", "discover", "map",
        ],
        SkillType.SUPABASE: [
            "supabase", "database", "rls", "migration", "table",
            "policy", "postgres", "sql", "schema",
        ],
        SkillType.WEB_SEARCH: [
            "search", "current events", "documentation", "latest",
            "news", "update", "recent", "2025", "2026",
        ],
    }

    # Task type triggers
    TASK_TYPE_TRIGGERS: Dict[str, List[SkillType]] = {
        "implement": [SkillType.DEV, SkillType.SUPABASE, SkillType.GIT],
        "analyze": [SkillType.ANALYST, SkillType.WEB_SEARCH],
        "research": [SkillType.ANALYST, SkillType.WEB_SEARCH],
        "design": [SkillType.ARCHITECT, SkillType.UX],
        "test": [SkillType.QA],
        "fix": [SkillType.DEV, SkillType.QUICK_FLOW],
        "create": [SkillType.DEV, SkillType.PM],
        "update": [SkillType.DEV, SkillType.CONTINUOUS_IMPROVEMENT],
        "refactor": [SkillType.ARCHITECT, SkillType.DEV],
        "plan": [SkillType.PM, SkillType.SM],
    }

    def __init__(self, confidence_threshold: float = 0.70):
        """Initialize skill router.

        Args:
            confidence_threshold: Minimum confidence to invoke a skill (0.0-1.0)
        """
        self.confidence_threshold = confidence_threshold

    def analyze_task(self, task_description: str) -> List[SkillMatch]:
        """Analyze a task and return skill matches.

        Args:
            task_description: Description of the task

        Returns:
            List of skill matches sorted by confidence (highest first)
        """
        task_lower = task_description.lower()
        matches: List[SkillMatch] = []

        # Check domain keywords
        for skill, keywords in self.DOMAIN_KEYWORDS.items():
            matched = []
            for keyword in keywords:
                if keyword.lower() in task_lower:
                    matched.append(keyword)

            if matched:
                confidence = self._calculate_confidence(matched, len(keywords))
                matches.append(SkillMatch(
                    skill=skill,
                    confidence=confidence,
                    matched_keywords=matched,
                    rationale=f"Matched keywords: {', '.join(matched)}",
                ))

        # Check task type triggers
        for task_type, skills in self.TASK_TYPE_TRIGGERS.items():
            if task_type in task_lower:
                for skill in skills:
                    # Check if already matched
                    existing = next((m for m in matches if m.skill == skill), None)
                    if existing:
                        existing.confidence = min(1.0, existing.confidence + 0.1)
                        if task_type not in existing.matched_keywords:
                            existing.matched_keywords.append(task_type)
                    else:
                        matches.append(SkillMatch(
                            skill=skill,
                            confidence=0.6,  # Base confidence for task type match
                            matched_keywords=[task_type],
                            rationale=f"Task type trigger: {task_type}",
                        ))

        # Sort by confidence (highest first)
        matches.sort(key=lambda m: m.confidence, reverse=True)

        return matches

    def _calculate_confidence(self, matched: List[str], total_keywords: int) -> float:
        """Calculate confidence score based on matches."""
        # Base confidence on proportion of keywords matched
        base_confidence = len(matched) / total_keywords

        # Boost for multiple matches
        boost = min(0.3, (len(matched) - 1) * 0.1)

        return min(1.0, base_confidence + boost)

    def get_best_skill(
        self,
        task_description: str,
        min_confidence: Optional[float] = None,
    ) -> Optional[SkillMatch]:
        """Get the best matching skill for a task.

        Args:
            task_description: Description of the task
            min_confidence: Override default confidence threshold

        Returns:
            Best skill match or None if no match meets threshold
        """
        threshold = min_confidence or self.confidence_threshold
        matches = self.analyze_task(task_description)

        if matches and matches[0].confidence >= threshold:
            return matches[0]

        return None

    def should_use_skill(self, task_description: str, skill: SkillType) -> bool:
        """Check if a specific skill should be used for a task.

        Args:
            task_description: Description of the task
            skill: Skill to check

        Returns:
            True if the skill matches with sufficient confidence
        """
        matches = self.analyze_task(task_description)

        for match in matches:
            if match.skill == skill and match.confidence >= self.confidence_threshold:
                return True

        return False

    def get_skill_recommendation(self, task_description: str) -> Dict[str, Any]:
        """Get a full skill recommendation with reasoning.

        Args:
            task_description: Description of the task

        Returns:
            Dictionary with recommendation details
        """
        matches = self.analyze_task(task_description)
        best_match = matches[0] if matches else None

        return {
            "task": task_description[:100] + "..." if len(task_description) > 100 else task_description,
            "recommended_skill": best_match.skill.value if best_match else None,
            "confidence": best_match.confidence if best_match else 0.0,
            "threshold": self.confidence_threshold,
            "should_invoke": best_match is not None and best_match.confidence >= self.confidence_threshold,
            "all_matches": [
                {
                    "skill": m.skill.value,
                    "confidence": round(m.confidence, 2),
                    "keywords": m.matched_keywords,
                    "rationale": m.rationale,
                }
                for m in matches[:5]  # Top 5 matches
            ],
            "rationale": best_match.rationale if best_match else "No matching skill found",
        }


def get_skill_router(confidence_threshold: float = 0.70) -> SkillRouter:
    """Get the default skill router instance."""
    return SkillRouter(confidence_threshold)


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    if len(sys.argv) < 2:
        print("Usage: python skill_router.py [test|<task description>]")
        print("\nExamples:")
        print('  python skill_router.py "Create a PRD for user authentication"')
        print('  python skill_router.py "How should we architect the caching layer?"')
        print('  python skill_router.py "Fix the login bug"')
        sys.exit(1)

    if sys.argv[1] == "test":
        print("Testing skill router...")

        router = get_skill_router()

        test_tasks = [
            "Create a PRD for user authentication",
            "How should we architect the caching layer?",
            "Research the best database for our use case",
            "Implement the login API endpoint",
            "Fix the auto-collapse bug in the UI",
            "Run tests for the auth module",
            "Create a git commit for these changes",
            "Set up Supabase RLS policies",
        ]

        for task in test_tasks:
            print(f"\nTask: {task}")
            rec = router.get_skill_recommendation(task)
            print(f"  Recommended: {rec['recommended_skill']} (confidence: {rec['confidence']:.2f})")
            print(f"  Should invoke: {rec['should_invoke']}")

        print("\n✓ All tests completed")

    else:
        # Analyze provided task
        task = " ".join(sys.argv[1:])
        router = get_skill_router()

        print(f"\nAnalyzing task: {task}\n")
        rec = router.get_skill_recommendation(task)

        print(f"Recommended Skill: {rec['recommended_skill']}")
        print(f"Confidence: {rec['confidence']:.2f} (threshold: {rec['threshold']})")
        print(f"Should Invoke: {rec['should_invoke']}")
        print(f"\nRationale: {rec['rationale']}")

        if rec['all_matches']:
            print("\nAll Matches:")
            for match in rec['all_matches']:
                print(f"  - {match['skill']}: {match['confidence']} ({', '.join(match['keywords'][:3])})")

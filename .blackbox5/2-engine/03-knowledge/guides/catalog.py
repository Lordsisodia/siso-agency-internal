#!/usr/bin/env python3
"""
Guide Catalog - Enhanced registry with smart routing.

The catalog helps agents find the right guide without needing to know
guide names or navigate a taxonomy.
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import re
from pathlib import Path

from .registry import Operation, TriggerCondition


class MatchReason(Enum):
    """Why a guide matched."""
    EXACT_TRIGGER = "exact_trigger"  # File pattern matched exactly
    CONTEXT_MATCH = "context_match"  # Contextual match
    INTENT_MATCH = "intent_match"  # Agent stated intent
    KEYWORD_MATCH = "keyword_match"  # Search keyword
    CATEGORY_MATCH = "category_match"  # Category browse


@dataclass
class IntentPattern:
    """Pattern for matching agent intent."""
    patterns: List[str]  # ["test this", "validate", "check for errors"]
    confidence: float = 0.8
    category: Optional[str] = None


@dataclass
class GuideMatch:
    """A matched guide with metadata."""
    guide_name: str
    description: str
    confidence: float
    reason: MatchReason
    suggestion: str
    estimated_time: str  # "2 minutes", "5 minutes"
    difficulty: str  # "basic", "intermediate", "advanced"


@dataclass
class GuideMetadata:
    """Rich metadata about a guide."""
    guide_id: str
    name: str
    description: str
    category: str
    subcategory: str = ""
    tags: List[str] = field(default_factory=list)
    estimated_time: str = "5 minutes"
    difficulty: str = "basic"
    dependencies: List[str] = field(default_factory=list)
    conflicts: List[str] = field(default_factory=list)
    required_tools: List[str] = field(default_factory=list)
    intent_patterns: List[IntentPattern] = field(default_factory=list)


class GuideCatalog:
    """
    Enhanced catalog that routes agents to the right guide.

    Agents don't need to know guide names or navigate taxonomy.
    The system figures out what they need.
    """

    def __init__(self):
        self.guides: Dict[str, GuideMetadata] = {}
        self.operations: Dict[str, Operation] = {}
        self._load_builtin_guides()

    def _load_builtin_guides(self):
        """Load built-in guides with rich metadata."""

        # Python Testing Guide
        self.register_guide(
            GuideMetadata(
                guide_id="test_python_code",
                name="Test Python Code",
                description="Validate and test Python code with syntax checking, linting, type checking, and unit tests",
                category="testing",
                subcategory="python",
                tags=["python", "testing", "validation", "linting", "mypy"],
                estimated_time="3 minutes",
                difficulty="basic",
                required_tools=["python", "pylint", "mypy", "pytest"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["test", "validate", "check", "verify"],
                        confidence=0.9,
                        category="testing"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="file_written", pattern=r".*\.py$"),
                TriggerCondition(event="file_modified", pattern=r".*\.py$")
            ]
        )

        # JavaScript Testing Guide
        self.register_guide(
            GuideMetadata(
                guide_id="test_javascript_code",
                name="Test JavaScript/TypeScript Code",
                description="Validate and test JavaScript/TypeScript with ESLint, type checking, and Jest",
                category="testing",
                subcategory="javascript",
                tags=["javascript", "typescript", "testing", "eslint", "jest"],
                estimated_time="3 minutes",
                difficulty="basic",
                required_tools=["node", "eslint", "jest", "typescript"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["test", "validate", "check", "verify"],
                        confidence=0.9,
                        category="testing"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="file_written", pattern=r".*\.(js|jsx|ts|tsx)$"),
                TriggerCondition(event="file_modified", pattern=r".*\.(js|jsx|ts|tsx)$")
            ]
        )

        # Database Migration Guide
        self.register_guide(
            GuideMetadata(
                guide_id="validate_database_migration",
                name="Validate Database Migration",
                description="Validate SQL migration files with syntax checking and dry-run testing",
                category="database",
                subcategory="migration",
                tags=["sql", "database", "migration", "validation"],
                estimated_time="2 minutes",
                difficulty="intermediate",
                required_tools=["psql", "pg_prove"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["validate migration", "check migration", "test sql"],
                        confidence=0.9,
                        category="database"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="file_written", pattern=r".*migrations/.*\.sql$"),
                TriggerCondition(event="file_modified", pattern=r".*migrations/.*\.sql$")
            ]
        )

        # API Testing Guide
        self.register_guide(
            GuideMetadata(
                guide_id="test_api_endpoint",
                name="Test API Endpoint",
                description="Test REST API endpoints with request validation and response checking",
                category="testing",
                subcategory="api",
                tags=["api", "rest", "testing", "integration"],
                estimated_time="5 minutes",
                difficulty="intermediate",
                required_tools=["curl", "httpie"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["test api", "test endpoint", "check api"],
                        confidence=0.9,
                        category="testing"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="file_written", pattern=r".*api/.*\.py$"),
                TriggerCondition(event="file_written", pattern=r".*routes/.*\.js$")
            ]
        )

        # Docker Build Guide
        self.register_guide(
            GuideMetadata(
                guide_id="validate_dockerfile",
                name="Validate Dockerfile",
                description="Validate Dockerfile syntax and test build",
                category="deployment",
                subcategory="docker",
                tags=["docker", "deployment", "validation"],
                estimated_time="5 minutes",
                difficulty="intermediate",
                required_tools=["docker"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["docker", "build image", "container"],
                        confidence=0.9,
                        category="deployment"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="file_written", pattern=r".*Dockerfile$"),
                TriggerCondition(event="file_modified", pattern=r".*Dockerfile$")
            ]
        )

        # Git Commit Guide
        self.register_guide(
            GuideMetadata(
                guide_id="validate_git_commit",
                name="Validate Git Commit",
                description="Validate staged changes before committing",
                category="validation",
                subcategory="git",
                tags=["git", "commit", "validation"],
                estimated_time="1 minute",
                difficulty="basic",
                required_tools=["git"],
                intent_patterns=[
                    IntentPattern(
                        patterns=["commit", "check before commit", "pre-commit"],
                        confidence=0.9,
                        category="validation"
                    )
                ]
            ),
            triggers=[
                TriggerCondition(event="git_stage"),
                TriggerCondition(event="git_commit")
            ]
        )

    def register_guide(self, metadata: GuideMetadata, triggers: List[TriggerCondition]):
        """Register a guide with its metadata and triggers."""
        self.guides[metadata.guide_id] = metadata

        # Create operation from guide
        operation = Operation(
            name=metadata.guide_id,
            description=metadata.description,
            category=metadata.category,
            triggers=triggers,
            steps=[]  # Steps defined elsewhere
        )
        self.operations[metadata.guide_id] = operation

    def find_by_context(self, event: str, context: Dict[str, Any]) -> List[GuideMatch]:
        """
        Find guides based on context (automatic).

        This is how the system proactively offers help.
        """
        matches = []

        for guide_id, metadata in self.guides.items():
            operation = self.operations.get(guide_id)
            if not operation:
                continue

            # Check if triggers match
            for trigger in operation.triggers:
                if self._trigger_matches(trigger, event, context):
                    # Calculate confidence
                    confidence = self._calculate_confidence(
                        trigger, event, context, "context"
                    )

                    matches.append(GuideMatch(
                        guide_name=guide_id,
                        description=metadata.description,
                        confidence=confidence,
                        reason=MatchReason.EXACT_TRIGGER,
                        suggestion=self._generate_suggestion(metadata, context),
                        estimated_time=metadata.estimated_time,
                        difficulty=metadata.difficulty
                    ))
                    break  # Only add once per guide

        # Sort by confidence
        matches.sort(key=lambda m: m.confidence, reverse=True)

        # Filter by minimum confidence
        return [m for m in matches if m.confidence >= 0.5]

    def find_by_intent(self, intent: str, context: Dict[str, Any]) -> List[GuideMatch]:
        """
        Find guides based on agent intent (declarative).

        Agent says what they want, system finds the right guide.
        """
        matches = []
        intent_lower = intent.lower()

        for guide_id, metadata in self.guides.items():
            # Check intent patterns
            for pattern in metadata.intent_patterns:
                for p in pattern.patterns:
                    if p.lower() in intent_lower:
                        # Boost confidence if category matches
                        confidence = pattern.confidence

                        # Boost if context also matches
                        operation = self.operations.get(guide_id)
                        if operation:
                            for trigger in operation.triggers:
                                if self._trigger_matches(trigger, "file_written", context):
                                    confidence = min(1.0, confidence + 0.1)
                                    break

                        matches.append(GuideMatch(
                            guide_name=guide_id,
                            description=metadata.description,
                            confidence=confidence,
                            reason=MatchReason.INTENT_MATCH,
                            suggestion=f"I'll help you {intent.lower()}",
                            estimated_time=metadata.estimated_time,
                            difficulty=metadata.difficulty
                        ))
                        break

        # Sort by confidence
        matches.sort(key=lambda m: m.confidence, reverse=True)

        return matches

    def search(self, query: str) -> List[GuideMatch]:
        """
        Search for guides by keyword (exploratory).

        This is the fallback when agent wants to browse.
        """
        matches = []
        query_lower = query.lower()

        for guide_id, metadata in self.guides.items():
            # Search in name, description, tags
            score = 0.0

            if query_lower in metadata.name.lower():
                score += 0.5
            if query_lower in metadata.description.lower():
                score += 0.3
            for tag in metadata.tags:
                if query_lower in tag.lower():
                    score += 0.2
            if query_lower in metadata.category.lower():
                score += 0.1

            if score > 0:
                matches.append(GuideMatch(
                    guide_name=guide_id,
                    description=metadata.description,
                    confidence=score,
                    reason=MatchReason.KEYWORD_MATCH,
                    suggestion=f"Found guide matching '{query}'",
                    estimated_time=metadata.estimated_time,
                    difficulty=metadata.difficulty
                ))

        # Sort by score
        matches.sort(key=lambda m: m.confidence, reverse=True)

        return matches

    def browse_category(self, category: str) -> List[GuideMatch]:
        """Browse guides by category."""
        matches = []

        for guide_id, metadata in self.guides.items():
            if metadata.category.lower() == category.lower():
                matches.append(GuideMatch(
                    guide_name=guide_id,
                    description=metadata.description,
                    confidence=0.6,  # Default confidence for category browse
                    reason=MatchReason.CATEGORY_MATCH,
                    suggestion=f"Browse {category} guides",
                    estimated_time=metadata.estimated_time,
                    difficulty=metadata.difficulty
                ))

        return matches

    def list_categories(self) -> List[str]:
        """List all available categories."""
        categories = set()
        for metadata in self.guides.values():
            categories.add(metadata.category)
        return sorted(categories)

    def get_guide(self, guide_id: str) -> Optional[GuideMetadata]:
        """Get guide metadata by ID."""
        return self.guides.get(guide_id)

    def _trigger_matches(self, trigger: TriggerCondition, event: str,
                         context: Dict[str, Any]) -> bool:
        """Check if a trigger matches the event and context."""
        if trigger.event != event:
            return False

        if trigger.pattern and "file_path" in context:
            return bool(re.match(trigger.pattern, context["file_path"]))

        return True

    def _calculate_confidence(self, trigger: TriggerCondition, event: str,
                             context: Dict[str, Any], match_type: str) -> float:
        """Calculate confidence score for a match."""
        base_confidence = 0.7

        if match_type == "context" and trigger.pattern:
            # Exact pattern match is high confidence
            base_confidence = 0.9

        # Adjust by trigger's min_confidence
        return max(base_confidence, trigger.min_confidence)

    def _generate_suggestion(self, metadata: GuideMetadata,
                            context: Dict[str, Any]) -> str:
        """Generate a helpful suggestion message."""
        file_path = context.get("file_path", "")

        if file_path:
            return f"I see you created {Path(file_path).name}. Would you like me to {metadata.name.lower()}?"

        return f"Would you like me to {metadata.name.lower()}?"

    def get_top_suggestion(self, event: str, context: Dict[str, Any]) -> Optional[GuideMatch]:
        """
        Get the single best guide suggestion for the current context.

        This is what the system uses to offer help proactively.
        """
        matches = self.find_by_context(event, context)

        if not matches:
            return None

        # Return only high-confidence matches
        if matches[0].confidence >= 0.7:
            return matches[0]

        return None


# Global catalog instance
_catalog = None


def get_catalog() -> GuideCatalog:
    """Get the global guide catalog."""
    global _catalog
    if _catalog is None:
        _catalog = GuideCatalog()
    return _catalog

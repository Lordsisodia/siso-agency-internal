# Adaptive Flow Router - Architecture Design

**Created:** 2026-01-18
**Status:** Architecture Specification
**Purpose:** Intelligent task routing with adaptive workflows

---

## Executive Summary

The Adaptive Flow Router is the **brain** of the task management system. It analyzes tasks, classifies them into complexity tiers, and routes them through the appropriate workflow. It's not just a static classifier - it **learns from experience** and **adapts** to changing patterns.

### Core Philosophy

> "Not all tasks deserve the same process. Simple tasks should be quick. Complex tasks need rigor. The router must intelligently decide."

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE FLOW ROUTER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Task Input    │───▶│  Complexity     │───▶│   Workflow  │ │
│  │  (YAML + MD)   │    │  Analyzer      │    │   Router    │ │
│  └────────────────┘    └─────────────────┘    └─────────────┘ │
│                                 │                     │        │
│                                 │                     │        │
│                                 ▼                     ▼        │
│                        ┌─────────────┐      ┌──────────────┐   │
│                        │  Complexity │      │  Workflow    │   │
│                        │  Score      │      │  Selection   │   │
│                        │  (0-100)    │      │  Logic       │   │
│                        └─────────────┘      └──────────────┘   │
│                                 │                     │        │
│                                 └──────────┬──────────┘        │
│                                            │                   │
│                                            ▼                   │
│                                   ┌─────────────────┐          │
│                                   │  Tier Assignment│          │
│                                   │  (1-4)          │          │
│                                   └─────────────────┘          │
│                                            │                   │
│           ┌────────────────────────────────┼───────────────┐  │
│           │                                │               │  │
│           ▼                                ▼               ▼  │
│    ┌──────────┐                      ┌──────────┐   ┌──────────┐
│    │  Tier 1  │                      │  Tier 2  │   │  Tier 3  │
│    │  Quick   │                      │  Simple  │   │ Standard │
│    │  Fix     │                      │          │   │          │
│    └──────────┘                      └──────────┘   └──────────┘
│           │                                │               │  │
│           ▼                                ▼               ▼  │
│    ┌──────────┐                      ┌──────────┐   ┌──────────┐
│    │  Direct  │                      │  Light   │   │  Full    │
│    │  to Git  │                      │  PRD     │   │  PRD     │
│    │  Issue   │                      │  Flow    │   │  Flow    │
│    └──────────┘                      └──────────┘   └──────────┘
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Learning & Feedback Loop                  │ │
│  │  - Track actual vs estimated complexity                   │ │
│  │  - Learn from patterns                                    │ │
│  │  - Adjust classification weights                          │ │
│  │  - Improve routing accuracy over time                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Task Input Parser

**Purpose**: Extract structured data from YAML frontmatter + markdown body

**File**: `.blackbox5/engine/task_management/parser.py`

```python
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class ParsedTask:
    """Parsed task with all metadata"""
    # Core fields
    id: str
    title: str
    description: str

    # Classification
    category: str
    subcategory: str
    domain: str
    tech_stack: list[str]

    # Current workflow
    status: str
    tier: Optional[int]
    workflow: Optional[str]

    # Priority & Risk
    priority: str
    risk_level: str
    confidence: float

    # Relationships
    relates_to: list[str]
    blocks: list[str]
    blocked_by: list[str]
    depends_on: list[str]
    parent_prd: Optional[str]
    parent_epic: Optional[str]

    # Metadata
    tags: list[str]
    created_at: str
    created_by: str
    metadata: dict[str, Any]

    # Content
    content: str  # Markdown body

class TaskParser:
    """Parse task files with YAML frontmatter"""

    def parse(self, task_path: Path) -> ParsedTask:
        """Parse task file into structured data"""
        content = task_path.read_text()

        # Split on ---
        parts = content.split('---', 2)

        if len(parts) < 3:
            raise ValueError(f"Invalid task format: {task_path}")

        # Parse YAML frontmatter
        frontmatter = yaml.safe_load(parts[1])
        markdown_body = parts[2]

        # Extract description from first paragraph
        description = self._extract_description(markdown_body)

        return ParsedTask(
            id=frontmatter.get('id', task_path.stem),
            title=frontmatter.get('title', 'Untitled'),
            description=description,

            category=frontmatter.get('category', 'feature'),
            subcategory=frontmatter.get('subcategory', ''),
            domain=frontmatter.get('domain', ''),
            tech_stack=frontmatter.get('tech_stack', []),

            status=frontmatter.get('status', 'proposed'),
            tier=frontmatter.get('tier'),
            workflow=frontmatter.get('workflow'),

            priority=frontmatter.get('priority', 'medium'),
            risk_level=frontmatter.get('risk_level', 'medium'),
            confidence=frontmatter.get('confidence', 0.5),

            relates_to=frontmatter.get('relates_to', []),
            blocks=frontmatter.get('blocks', []),
            blocked_by=frontmatter.get('blocked_by', []),
            depends_on=frontmatter.get('depends_on', []),
            parent_prd=frontmatter.get('parent_prd'),
            parent_epic=frontmatter.get('parent_epic'),

            tags=frontmatter.get('tags', []),
            created_at=frontmatter.get('created_at', ''),
            created_by=frontmatter.get('created_by', 'unknown'),
            metadata=frontmatter.get('metadata', {}),

            content=markdown_body
        )

    def _extract_description(self, markdown: str) -> str:
        """Extract first paragraph as description"""
        lines = markdown.strip().split('\n')

        # Find first non-empty line after headers
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('#'):
                # Get paragraph (until empty line)
                desc_lines = [stripped]
                for j in range(i+1, len(lines)):
                    next_line = lines[j].strip()
                    if next_line:
                        desc_lines.append(next_line)
                    else:
                        break
                return ' '.join(desc_lines)

        return "No description"
```

---

### 2. Complexity Analyzer

**Purpose**: Calculate complexity score from multiple dimensions

**File**: `.blackbox5/engine/task_management/complexity_analyzer.py`

```python
from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

class ComplexityDimension(Enum):
    """Dimensions that contribute to complexity"""
    SCOPE = "scope"                    # How much work
    TECHNICAL = "technical"            # Technical difficulty
    DEPENDENCIES = "dependencies"      # External dependencies
    RISK = "risk"                      # Risk level
    UNCERTAINTY = "uncertainty"        # How well-understood
    CROSS_DOMAIN = "cross_domain"      # Spans multiple domains

@dataclass
class ComplexityScore:
    """Result of complexity analysis"""
    total_score: int                  # 0-100
    tier: int                         # 1-4
    confidence: float                 # 0-1

    # Dimension scores (0-100 each)
    dimensions: Dict[ComplexityDimension, int]

    # Rationale
    reasoning: List[str]              # Why this score?
    indicators: List[str]             # What indicators found?

    # Recommendations
    suggested_workflow: str           # Which workflow?
    estimation_hours: tuple           # (min, max, expected)

class ComplexityAnalyzer:
    """
    Analyze task complexity across multiple dimensions.

    Scoring:
    - 0-25: Tier 1 (Quick Fix < 1hr)
    - 26-50: Tier 2 (Simple 1-4hr)
    - 51-75: Tier 3 (Standard 4-16hr)
    - 76-100: Tier 4 (Complex 16hr+)
    """

    def __init__(self):
        # Weights for each dimension (sum = 100)
        self.weights = {
            ComplexityDimension.SCOPE: 25,
            ComplexityDimension.TECHNICAL: 30,
            ComplexityDimension.DEPENDENCIES: 15,
            ComplexityDimension.RISK: 15,
            ComplexityDimension.UNCERTAINTY: 10,
            ComplexityDimension.CROSS_DOMAIN: 5,
        }

        # Complexity indicators with scores
        self.indicators = self._build_indicators()

    def analyze(self, task: ParsedTask) -> ComplexityScore:
        """Analyze task and produce complexity score"""
        dimension_scores = {}
        reasoning = []
        indicators_found = []

        # Analyze each dimension
        for dimension in ComplexityDimension:
            score, dim_reasoning, dim_indicators = self._analyze_dimension(
                task, dimension
            )

            dimension_scores[dimension] = score
            reasoning.extend(dim_reasoning)
            indicators_found.extend(dim_indicators)

        # Calculate weighted total
        total_score = sum(
            score * self.weights[dimension] / 100
            for dimension, score in dimension_scores.items()
        )

        # Round to integer
        total_score = int(total_score)

        # Determine tier
        tier = self._score_to_tier(total_score)

        # Calculate confidence
        confidence = self._calculate_confidence(task, dimension_scores)

        # Suggest workflow
        workflow = self._suggest_workflow(tier)

        # Estimate hours
        estimation = self._estimate_hours(tier, dimension_scores)

        return ComplexityScore(
            total_score=total_score,
            tier=tier,
            confidence=confidence,
            dimensions=dimension_scores,
            reasoning=reasoning,
            indicators=indicators_found,
            suggested_workflow=workflow,
            estimation_hours=estimation
        )

    def _analyze_dimension(
        self,
        task: ParsedTask,
        dimension: ComplexityDimension
    ) -> tuple[int, list[str], list[str]]:
        """Analyze a single dimension"""
        score = 0
        reasoning = []
        indicators = []

        text = f"{task.title} {task.description} {task.content}".lower()
        tags = [t.lower() for t in task.tags]
        tech = [t.lower() for t in task.tech_stack]

        if dimension == ComplexityDimension.SCOPE:
            # Scope: How much work?
            lines_of_code_hint = len(task.content.split('\n'))
            if lines_of_code_hint > 100:
                score += 30
                reasoning.append("Long specification (>100 lines)")
            elif lines_of_code_hint > 50:
                score += 15
                reasoning.append("Moderate specification (50-100 lines)")

            # Keywords
            if any(kw in text for kw in ["multiple", "several", "various"]):
                score += 20
                indicators.append("Multiple components mentioned")

            if "end-to-end" in text or "full" in text:
                score += 30
                indicators.append("Full implementation required")

        elif dimension == ComplexityDimension.TECHNICAL:
            # Technical: How difficult?
            technical_keywords = {
                "algorithm": 15,
                "optimization": 20,
                "architecture": 25,
                "scalability": 25,
                "performance": 20,
                "database": 20,
                "migration": 30,
            }

            for keyword, kw_score in technical_keywords.items():
                if keyword in text:
                    score += kw_score
                    indicators.append(f"Technical keyword: {keyword}")

            # Tech stack complexity
            if len(task.tech_stack) > 3:
                score += 15
                reasoning.append(f"Multiple technologies ({len(task.tech_stack)})")

        elif dimension == ComplexityDimension.DEPENDENCIES:
            # Dependencies: External integrations?
            if "api" in text or "integration" in text:
                score += 30
                indicators.append("External API integration")

            if "third-party" in text or "external" in text:
                score += 40
                indicators.append("Third-party dependency")

            if len(task.depends_on) > 2:
                score += 20
                reasoning.append(f"Multiple dependencies ({len(task.depends_on)})")

        elif dimension == ComplexityDimension.RISK:
            # Risk: What's the impact?
            if task.risk_level == "high":
                score = 80
            elif task.risk_level == "medium":
                score = 50
            elif task.risk_level == "low":
                score = 20

            reasoning.append(f"Risk level: {task.risk_level}")

            # Risk indicators
            risk_keywords = ["security", "payment", "data-loss", "compliance"]
            for keyword in risk_keywords:
                if keyword in text:
                    score += 20
                    indicators.append(f"Risk indicator: {keyword}")

        elif dimension == ComplexityDimension.UNCERTAINTY:
            # Uncertainty: How well-understood?
            if task.confidence < 0.3:
                score = 80
            elif task.confidence < 0.5:
                score = 60
            elif task.confidence < 0.7:
                score = 40
            else:
                score = 20

            reasoning.append(f"Confidence: {task.confidence:.0%}")

            # Uncertainty indicators
            if "research" in text or "investigate" in text or "explore" in text:
                score += 30
                indicators.append("Requires research")

        elif dimension == ComplexityDimension.CROSS_DOMAIN:
            # Cross-domain: Spans multiple areas?
            domains_in_text = []
            domain_keywords = {
                "frontend": ["ui", "frontend", "react", "vue", "component"],
                "backend": ["api", "backend", "server", "endpoint"],
                "database": ["database", "schema", "migration", "query"],
                "devops": ["deploy", "ci/cd", "pipeline", "infrastructure"],
            }

            for domain, keywords in domain_keywords.items():
                if any(kw in text for kw in keywords):
                    domains_in_text.append(domain)

            if len(domains_in_text) > 1:
                score = len(domains_in_text) * 30
                reasoning.append(f"Cross-domain: {', '.join(domains_in_text)}")

        # Cap at 100
        score = min(score, 100)

        return score, reasoning, indicators

    def _score_to_tier(self, score: int) -> int:
        """Convert score to tier"""
        if score <= 25:
            return 1
        elif score <= 50:
            return 2
        elif score <= 75:
            return 3
        else:
            return 4

    def _calculate_confidence(
        self,
        task: ParsedTask,
        dimension_scores: Dict[ComplexityDimension, int]
    ) -> float:
        """Calculate confidence in classification"""
        # Start with task confidence
        base_confidence = task.confidence

        # Reduce if dimensions vary widely (inconsistent signals)
        scores = list(dimension_scores.values())
        if max(scores) - min(scores) > 50:
            base_confidence *= 0.8

        # Increase if consistent signals
        if max(scores) - min(scores) < 20:
            base_confidence = min(1.0, base_confidence * 1.2)

        return base_confidence

    def _suggest_workflow(self, tier: int) -> str:
        """Suggest workflow based on tier"""
        workflows = {
            1: "quick_fix",
            2: "light_prd",
            3: "standard",
            4: "complex"
        }
        return workflows.get(tier, "standard")

    def _estimate_hours(
        self,
        tier: int,
        dimension_scores: Dict[ComplexityDimension, int]
    ) -> tuple[int, int, float]:
        """Estimate hours based on tier and scope score"""
        scope_score = dimension_scores.get(ComplexityDimension.SCOPE, 50)

        tier_bases = {
            1: (0.5, 1.0),    # 0.5-1 hour
            2: (1, 4),        # 1-4 hours
            3: (4, 16),       # 4-16 hours
            4: (16, 40)       # 16-40 hours
        }

        min_h, max_h = tier_bases.get(tier, (4, 16))

        # Adjust by scope
        expected = (min_h + max_h) / 2 * (scope_score / 50)

        return (int(min_h), int(max_h), expected)

    def _build_indicators(self) -> Dict[str, int]:
        """Build complexity indicator dictionary"""
        return {
            # Database
            "database": 20,
            "schema": 20,
            "migration": 30,

            # Authentication
            "auth": 25,
            "jwt": 20,
            "oauth": 25,
            "permission": 20,
            "role": 15,

            # Security
            "security": 30,
            "encrypt": 25,
            "vulnerability": 35,

            # Performance
            "performance": 25,
            "optimization": 25,
            "scalability": 30,

            # Integration
            "api": 15,
            "integration": 25,
            "webhook": 20,
            "third-party": 30,

            # Architecture
            "architecture": 30,
            "design": 20,
            "pattern": 15,

            # Data
            "migration": 30,
            "etl": 25,
            "pipeline": 20,

            # Multiple domains
            "full-stack": 40,
            "end-to-end": 35,
        }
```

---

### 3. Workflow Router

**Purpose**: Route tasks to appropriate workflow based on tier and context

**File**: `.blackbox5/engine/task_management/workflow_router.py`

```python
from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass

class WorkflowTier(Enum):
    """Workflow tiers"""
    TIER_1_QUICK_FIX = 1
    TIER_2_SIMPLE = 2
    TIER_3_STANDARD = 3
    TIER_4_COMPLEX = 4

@dataclass
class RoutingDecision:
    """Result of routing decision"""
    tier: int
    workflow: str
    reasoning: list[str]

    # Execution plan
    next_steps: list[str]
    estimated_hours: tuple

    # Overrides allowed
    can_override: bool
    override_options: list[str]

class WorkflowRouter:
    """
    Route tasks to appropriate workflow.

    Workflows:
    1. Quick Fix (< 1hr) → Direct to Git Issue
    2. Simple (1-4hr) → Light PRD → Git Issue
    3. Standard (4-16hr) → Full PRD → Epic → Tasks → Git Issue
    4. Complex (16hr+) → Standard + Architecture Review + Security Review
    """

    def __init__(self):
        pass

    def route(
        self,
        task: ParsedTask,
        complexity: ComplexityScore,
        force_tier: Optional[int] = None
    ) -> RoutingDecision:
        """Route task to appropriate workflow"""

        # Use forced tier if provided
        if force_tier:
            tier = force_tier
        else:
            tier = complexity.tier

        # Build routing decision
        if tier == 1:
            return self._route_quick_fix(task, complexity)
        elif tier == 2:
            return self._route_simple(task, complexity)
        elif tier == 3:
            return self._route_standard(task, complexity)
        else:
            return self._route_complex(task, complexity)

    def _route_quick_fix(
        self,
        task: ParsedTask,
        complexity: ComplexityScore
    ) -> RoutingDecision:
        """Route to quick fix workflow"""
        return RoutingDecision(
            tier=1,
            workflow="quick_fix",
            reasoning=[
                f"Complexity score: {complexity.total_score}/100",
                "Simple, well-understood task",
                "Can be completed in < 1 hour",
            ],
            next_steps=[
                "1. Create GitHub Issue directly",
                "2. Implement fix",
                "3. Create PR",
                "4. Mark task as done",
            ],
            estimated_hours=complexity.estimation_hours,
            can_override=True,
            override_options=["tier_2_simple", "tier_3_standard"]
        )

    def _route_simple(
        self,
        task: ParsedTask,
        complexity: ComplexityScore
    ) -> RoutingDecision:
        """Route to simple feature workflow"""
        return RoutingDecision(
            tier=2,
            workflow="light_prd",
            reasoning=[
                f"Complexity score: {complexity.total_score}/100",
                "Straightforward implementation",
                "Estimated 1-4 hours",
            ],
            next_steps=[
                "1. Create light PRD (1-2 pages)",
                "2. Create GitHub Issue",
                "3. Implement feature",
                "4. Basic testing",
                "5. Mark task as done",
            ],
            estimated_hours=complexity.estimation_hours,
            can_override=True,
            override_options=["tier_1_quick", "tier_3_standard"]
        )

    def _route_standard(
        self,
        task: ParsedTask,
        complexity: ComplexityScore
    ) -> RoutingDecision:
        """Route to standard workflow"""
        return RoutingDecision(
            tier=3,
            workflow="standard",
            reasoning=[
                f"Complexity score: {complexity.total_score}/100",
                "Requires full spec-driven process",
                "Estimated 4-16 hours",
            ],
            next_steps=[
                "1. Create PRD with first principles",
                "2. Generate Epic from PRD",
                "3. Break down Epic into Tasks",
                "4. Create GitHub Issue for each task",
                "5. Multi-agent execution",
                "6. Testing & review",
                "7. Mark tasks as done",
            ],
            estimated_hours=complexity.estimation_hours,
            can_override=True,
            override_options=["tier_2_simple", "tier_4_complex"]
        )

    def _route_complex(
        self,
        task: ParsedTask,
        complexity: ComplexityScore
    ) -> RoutingDecision:
        """Route to complex project workflow"""
        return RoutingDecision(
            tier=4,
            workflow="complex",
            reasoning=[
                f"Complexity score: {complexity.total_score}/100",
                "Major project requiring rigor",
                "Estimated 16+ hours",
            ],
            next_steps=[
                "1. Deep research phase",
                "2. First principles analysis",
                "3. Create comprehensive PRD",
                "4. Architecture Review",
                "5. Security Assessment",
                "6. Generate Epic",
                "7. Break down into phased Tasks",
                "8. Create GitHub Issues with dependencies",
                "9. Multi-agent parallel execution",
                "10. Comprehensive testing",
                "11. Production rollout plan",
                "12. Mark done",
            ],
            estimated_hours=complexity.estimation_hours,
            can_override=False,
            override_options=[]
        )
```

---

### 4. Learning System

**Purpose**: Learn from actual vs estimated complexity to improve routing

**File**: `.blackbox5/engine/task_management/learning_system.py`

```python
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class LearningSystem:
    """
    Learn from task execution to improve routing accuracy.

    Tracks:
    - Estimated vs actual complexity
    - Estimated vs actual hours
    - Classification accuracy
    - Pattern recognition
    """

    def __init__(self, data_path: Path = None):
        if data_path is None:
            data_path = Path(".blackbox5/tasks/learning-data.json")

        self.data_path = Path(data_path)
        self.data = self._load_data()

    def record_outcome(
        self,
        task_id: str,
        estimated_tier: int,
        actual_tier: int,
        estimated_hours: tuple,
        actual_hours: float,
        success: bool
    ) -> None:
        """Record actual outcome for learning"""
        record = {
            "task_id": task_id,
            "timestamp": datetime.now().isoformat(),
            "estimated": {
                "tier": estimated_tier,
                "hours_min": estimated_hours[0],
                "hours_max": estimated_hours[1],
                "hours_expected": estimated_hours[2],
            },
            "actual": {
                "tier": actual_tier,
                "hours": actual_hours,
                "success": success,
            },
            "accuracy": {
                "tier_correct": estimated_tier == actual_tier,
                "hours_error": abs(estimated_hours[2] - actual_hours),
                "hours_error_pct": abs(estimated_hours[2] - actual_hours) / estimated_hours[2],
            }
        }

        self.data["outcomes"].append(record)
        self._save_data()

    def get_accuracy_metrics(self) -> Dict[str, Any]:
        """Calculate accuracy metrics"""
        if not self.data["outcomes"]:
            return {"message": "No data yet"}

        total = len(self.data["outcomes"])
        tier_correct = sum(1 for o in self.data["outcomes"] if o["accuracy"]["tier_correct"])

        hour_errors = [o["accuracy"]["hours_error_pct"] for o in self.data["outcomes"]]
        avg_hour_error = sum(hour_errors) / len(hour_errors)

        return {
            "total_tasks": total,
            "tier_accuracy": tier_correct / total,
            "avg_hour_error_pct": avg_hour_error * 100,
            "recent_accuracy": self._recent_accuracy(10)
        }

    def suggest_adjustments(self) -> List[str]:
        """Suggest adjustments based on learning"""
        suggestions = []

        # Analyze patterns
        miscategorized = [
            o for o in self.data["outcomes"]
            if not o["accuracy"]["tier_correct"]
        ]

        # Find common patterns in miscategorization
        underestimated = [
            o for o in miscategorized
            if o["actual"]["tier"] > o["estimated"]["tier"]
        ]

        overestimated = [
            o for o in miscategorized
            if o["actual"]["tier"] < o["estimated"]["tier"]
        ]

        if len(underestimated) > len(overestimated):
            suggestions.append("Consider increasing complexity weights (underestimating)")

        if len(overestimated) > len(underestimated):
            suggestions.append("Consider decreasing complexity weights (overestimating)")

        return suggestions

    def _load_data(self) -> Dict[str, Any]:
        """Load learning data"""
        if self.data_path.exists():
            return json.loads(self.data_path.read_text())
        else:
            return {
                "version": "1.0",
                "created_at": datetime.now().isoformat(),
                "outcomes": []
            }

    def _save_data(self) -> None:
        """Save learning data"""
        self.data_path.parent.mkdir(parents=True, exist_ok=True)
        self.data_path.write_text(json.dumps(self.data, indent=2))

    def _recent_accuracy(self, n: int) -> float:
        """Calculate recent accuracy (last n tasks)"""
        recent = self.data["outcomes"][-n:]
        if not recent:
            return 0.0

        correct = sum(1 for o in recent if o["accuracy"]["tier_correct"])
        return correct / len(recent)
```

---

## Integration Flow

### Complete Routing Flow

```python
from task_management.parser import TaskParser
from task_management.complexity_analyzer import ComplexityAnalyzer
from task_management.workflow_router import WorkflowRouter
from task_management.learning_system import LearningSystem

class AdaptiveFlowRouter:
    """Main router orchestrating all components"""

    def __init__(self):
        self.parser = TaskParser()
        self.analyzer = ComplexityAnalyzer()
        self.router = WorkflowRouter()
        self.learning = LearningSystem()

    def route_task(
        self,
        task_path: Path,
        force_tier: int = None
    ) -> RoutingDecision:
        """Route a task through the adaptive flow"""

        # Step 1: Parse task
        task = self.parser.parse(task_path)

        # Step 2: Analyze complexity
        complexity = self.analyzer.analyze(task)

        # Step 3: Route to workflow
        decision = self.router.route(task, complexity, force_tier)

        # Step 4: Store for learning
        self._store_classification(task, complexity, decision)

        return decision

    def record_outcome(
        self,
        task_id: str,
        actual_hours: float,
        success: bool
    ) -> None:
        """Record actual outcome for learning"""
        # Get stored classification
        classification = self._get_classification(task_id)

        if classification:
            # Determine actual tier from hours
            actual_tier = self._hours_to_tier(actual_hours)

            # Record for learning
            self.learning.record_outcome(
                task_id=task_id,
                estimated_tier=classification["tier"],
                actual_tier=actual_tier,
                estimated_hours=classification["estimated_hours"],
                actual_hours=actual_hours,
                success=success
            )

    def _hours_to_tier(self, hours: float) -> int:
        """Convert hours to tier"""
        if hours <= 1:
            return 1
        elif hours <= 4:
            return 2
        elif hours <= 16:
            return 3
        else:
            return 4
```

---

## CLI Integration

```bash
# Route a task
bb5 tasks:route TASK-2026-01-18-001

# Force a specific tier
bb5 tasks:route TASK-2026-01-18-001 --tier 3

# Record outcome
bb5 tasks:complete TASK-2026-01-18-001 --hours 6 --success

# View learning metrics
bb5 tasks:learning-metrics

# Get suggestions
bb5 tasks:learning-suggestions
```

---

## Summary

### Key Features

1. **Multi-Dimensional Analysis** - 6 dimensions of complexity
2. **Weighted Scoring** - Configurable weights per dimension
3. **Adaptive Learning** - Improves over time
4. **Transparent Reasoning** - Explains why decisions were made
5. **Flexible Routing** - 4-tier workflow system
6. **Override Support** - Can force specific tier when needed

### Next Steps

1. **Implement parser** - Extract data from YAML frontmatter
2. **Implement analyzer** - Multi-dimensional complexity scoring
3. **Implement router** - Route to appropriate workflow
4. **Implement learning** - Track and improve over time
5. **Integrate with CLI** - Commands for routing and tracking

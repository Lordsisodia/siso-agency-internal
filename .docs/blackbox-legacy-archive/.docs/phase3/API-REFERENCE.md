# API Reference

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Phase:** 3 - Structured Spec Creation

---

## Table of Contents

1. [Core Classes](#core-classes)
2. [Data Models](#data-models)
3. [QuestioningEngine](#questioningengine)
4. [SpecValidator](#specvalidator)
5. [SpecAnalyzer](#specanalyzer)
6. [Helper Functions](#helper-functions)
7. [CLI Tools](#cli-tools)

---

## Core Classes

### StructuredSpec

Main container for complete specifications.

```python
class StructuredSpec:
    """Complete specification with user stories, requirements, and constitution."""

    def __init__(
        self,
        project_name: str,
        overview: str = "",
        context_variables: Dict[str, Any] = None
    ):
        """
        Initialize a new specification.

        Args:
            project_name: Name of the project
            overview: Brief project overview (2-3 sentences)
            context_variables: Optional context for multi-tenant scenarios
        """
        self.project_name = project_name
        self.overview = overview
        self.context_variables = context_variables or {}
        self.user_stories: List[UserStory] = []
        self.functional_requirements: List[FunctionalRequirement] = []
        self.constitution: Optional[ProjectConstitution] = None
        self.clarifications: List[Dict[str, str]] = []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def add_user_story(self, story: UserStory) -> None:
        """Add a user story to the specification.

        Args:
            story: UserStory instance to add
        """

    def add_requirement(self, requirement: FunctionalRequirement) -> None:
        """Add a functional requirement to the specification.

        Args:
            requirement: FunctionalRequirement instance to add
        """

    def add_clarification(self, question: str, answer: str) -> None:
        """Add a Q&A clarification.

        Args:
            question: Question that was asked
            answer: Answer that was provided
        """

    def save(self, filepath: str) -> str:
        """Save specification to JSON and PRD markdown.

        Args:
            filepath: Path to save JSON file (PRD will be saved with -prd suffix)

        Returns:
            Path to the generated PRD file
        """

    def to_dict(self) -> Dict:
        """Convert specification to dictionary.

        Returns:
            Dictionary representation of the specification
        """

    @classmethod
    def load(cls, filepath: str) -> 'StructuredSpec':
        """Load specification from JSON file.

        Args:
            filepath: Path to JSON file

        Returns:
            Loaded StructuredSpec instance
        """

    def export_to_plan(self, plan_path: str) -> None:
        """Export specification to plan format.

        Args:
            plan_path: Path to plan directory
        """
```

**Usage Example:**
```python
from spec_creation import StructuredSpec, UserStory

spec = StructuredSpec(
    project_name="E-commerce Platform",
    overview="Modern e-commerce for small businesses",
    context_variables={"tenant": "acme", "phase": "mvp"}
)

spec.add_user_story(UserStory(
    id="US-001",
    as_a="shop owner",
    i_want="to manage products",
    so_that="customers can browse items"
))

prd_path = spec.save("specs/ecommerce.json")
```

---

## Data Models

### UserStory

Represents a user story with acceptance criteria.

```python
@dataclass
class UserStory:
    """User story with acceptance criteria."""

    id: str                          # Unique identifier (e.g., "US-001")
    as_a: str                        # User role
    i_want: str                      # Desired feature/action
    so_that: str                     # Benefit/value
    acceptance_criteria: List[str]   # Definition of done
    priority: str = "medium"         # critical|high|medium|low
    story_points: int = 1            # Effort estimate
    context_variables: Dict[str, Any] = None  # Optional context

    def to_markdown(self) -> str:
        """Convert to markdown format.

        Returns:
            Markdown string representation
        """

    def to_dict(self) -> Dict:
        """Convert to dictionary.

        Returns:
            Dictionary representation
        """

    @classmethod
    def from_dict(cls, data: Dict) -> 'UserStory':
        """Create from dictionary.

        Args:
            data: Dictionary data

        Returns:
            UserStory instance
        """
```

**Usage Example:**
```python
from spec_creation import UserStory

story = UserStory(
    id="US-001",
    as_a="shop owner",
    i_want="to manage my product catalog",
    so_that="customers can browse and purchase items",
    acceptance_criteria=[
        "Can add/edit/delete products",
        "Can upload product images",
        "Can set prices and inventory"
    ],
    priority="high",
    story_points=8
)

md = story.to_markdown()
print(md)
```

### FunctionalRequirement

Represents a functional requirement with dependencies and tests.

```python
@dataclass
class FunctionalRequirement:
    """Functional requirement with dependencies and tests."""

    id: str                          # Unique identifier (e.g., "FR-001")
    title: str                       # Requirement title
    description: str                 # Detailed description
    priority: str = "medium"         # critical|high|medium|low
    dependencies: List[str] = None   # List of dependent requirement IDs
    acceptance_tests: List[str] = None  # Test conditions
    context_variables: Dict[str, Any] = None  # Optional context

    def to_markdown(self) -> str:
        """Convert to markdown format.

        Returns:
            Markdown string representation
        """

    def to_dict(self) -> Dict:
        """Convert to dictionary.

        Returns:
            Dictionary representation
        """

    @classmethod
    def from_dict(cls, data: Dict) -> 'FunctionalRequirement':
        """Create from dictionary.

        Args:
            data: Dictionary data

        Returns:
            FunctionalRequirement instance
        """
```

**Usage Example:**
```python
from spec_creation import FunctionalRequirement

req = FunctionalRequirement(
    id="FR-001",
    title="User Authentication",
    description="JWT-based authentication with secure password hashing",
    priority="critical",
    dependencies=[],
    acceptance_tests=[
        "Users can register with email/password",
        "Users can login with valid credentials",
        "Invalid credentials return appropriate error",
        "Passwords are hashed using bcrypt"
    ]
)

md = req.to_markdown()
print(md)
```

### ProjectConstitution

Defines project vision, principles, and standards.

```python
@dataclass
class ProjectConstitution:
    """Project constitution with vision, tech stack, and standards."""

    vision: str                              # Project vision statement
    tech_stack: Dict[str, str] = None        # Technology choices
    quality_standards: List[str] = None      # Quality requirements
    architectural_principles: List[str] = None  # Design principles
    constraints: List[str] = None            # Project constraints

    def to_markdown(self) -> str:
        """Convert to markdown format.

        Returns:
            Markdown string representation
        """

    def to_dict(self) -> Dict:
        """Convert to dictionary.

        Returns:
            Dictionary representation
        """

    @classmethod
    def from_dict(cls, data: Dict) -> 'ProjectConstitution':
        """Create from dictionary.

        Args:
            data: Dictionary data

        Returns:
            ProjectConstitution instance
        """
```

**Usage Example:**
```python
from spec_creation import ProjectConstitution

constitution = ProjectConstitution(
    vision="Empower small businesses with affordable e-commerce",
    tech_stack={
        "frontend": "Next.js 14",
        "backend": "Python/FastAPI",
        "database": "PostgreSQL",
        "hosting": "AWS"
    },
    quality_standards=[
        "Test coverage > 80%",
        "API response time < 200ms",
        "Mobile-responsive design"
    ],
    constraints=["Launch in 90 days", "Budget: $50k"]
)

spec.constitution = constitution
```

---

## QuestioningEngine

Generate questions to identify gaps and improve specs.

```python
class QuestioningEngine:
    """Generate questions for spec improvement."""

    def __init__(
        self,
        areas: List[str] = None,
        priority_threshold: str = "low"
    ):
        """
        Initialize questioning engine.

        Args:
            areas: Question areas to focus on
                   (completeness, clarity, consistency, feasibility, testability)
            priority_threshold: Minimum priority to generate questions
                               (critical, high, medium, low)
        """

    def generate_questions(
        self,
        section: str,
        context: Dict[str, Any] = None
    ) -> List[Dict]:
        """Generate questions for a spec section.

        Args:
            section: Section to generate questions for
                    (overview, user_stories, requirements, constitution, all)
            context: Additional context for question generation

        Returns:
            List of question dictionaries with keys:
                - question: str - The question text
                - area: str - Question area
                - priority: str - Question priority
                - section: str - Target section
                - recommendation: str - Suggested answer
        """

    def analyze_gaps(self, spec: StructuredSpec) -> List[Dict]:
        """Analyze specification for gaps.

        Args:
            spec: Specification to analyze

        Returns:
            List of gap dictionaries with keys:
                - type: str - Gap type
                - area: str - Gap area
                - severity: str - Gap severity (critical, high, medium, low)
                - description: str - Gap description
                - location: str - Gap location in spec
                - recommendation: str - Suggested fix
        """

    def generate_questioning_report(self, spec: StructuredSpec) -> str:
        """Generate comprehensive questioning report.

        Args:
            spec: Specification to analyze

        Returns:
            Formatted report string
        """
```

**Usage Example:**
```python
from spec_creation import QuestioningEngine

engine = QuestioningEngine()

# Generate questions
questions = engine.generate_questions("user_stories")
for q in questions:
    print(f"[{q['priority']}] {q['question']}")
    print(f"  Suggestion: {q['recommendation']}\n")

# Analyze gaps
gaps = engine.analyze_gaps(spec)
for gap in gaps:
    print(f"[{gap['severity']}] {gap['description']}")
    print(f"  Fix: {gap['recommendation']}\n")

# Generate report
report = engine.generate_questioning_report(spec)
print(report)
```

---

## SpecValidator

Validate specifications for completeness, clarity, consistency, feasibility, and testability.

```python
class SpecValidator:
    """Validate structured specifications."""

    def __init__(self, strict_mode: bool = False):
        """
        Initialize validator.

        Args:
            strict_mode: If True, all checks must pass for validity
        """

    def validate(self, spec: StructuredSpec) -> ValidationResult:
        """Validate specification.

        Args:
            spec: Specification to validate

        Returns:
            ValidationResult with:
                - is_valid: bool
                - completeness_score: float (0-100)
                - clarity_score: float (0-100)
                - consistency_score: float (0-100)
                - feasibility_score: float (0-100)
                - testability_score: float (0-100)
                - overall_score: float (0-100)
                - errors: List[Dict]
                - warnings: List[Dict]
                - suggestions: List[Dict]
                - missing_components: List[str]
                - conflicts: List[Dict]
                - ambiguous_terms: List[Dict]
                - feasibility_issues: List[Dict]
                - untestable_items: List[Dict]
        """

    def validate_with_domain_rules(
        self,
        spec: StructuredSpec,
        context: Dict[str, Any]
    ) -> ValidationResult:
        """Validate with domain-specific rules.

        Args:
            spec: Specification to validate
            context: Domain rules and context

        Returns:
            ValidationResult with domain compliance
        """

    def validate_with_plan(
        self,
        spec: StructuredSpec,
        plan_path: str
    ) -> ValidationResult:
        """Cross-validate with plan.

        Args:
            spec: Specification to validate
            plan_path: Path to plan directory

        Returns:
            ValidationResult with plan consistency
        """

    def auto_fix(
        self,
        spec: StructuredSpec,
        issues: List[Dict]
    ) -> StructuredSpec:
        """Automatically fix common issues.

        Args:
            spec: Specification to fix
            issues: List of issues to fix

        Returns:
            Fixed specification (new instance)
        """
```

**Usage Example:**
```python
from spec_creation.validation import SpecValidator

validator = SpecValidator()

# Validate spec
result = validator.validate(spec)

print(f"Valid: {result.is_valid}")
print(f"Overall Score: {result.overall_score:.0f}%")
print(f"Completeness: {result.completeness_score:.0f}%")
print(f"Clarity: {result.clarity_score:.0f}%")

# Check errors
if result.errors:
    for error in result.errors:
        print(f"[{error['severity']}] {error['message']}")
        print(f"  Location: {error['location']}")

# Validate with domain rules
domain_result = validator.validate_with_domain_rules(
    spec,
    context={"domain": "ecommerce"}
)

# Auto-fix issues
fixed_spec = validator.auto_fix(spec, result.errors)
```

---

## SpecAnalyzer

Analyze specifications for statistics, complexity, and dependencies.

```python
class SpecAnalyzer:
    """Analyze specifications for insights."""

    def get_statistics(self, spec: StructuredSpec) -> Dict:
        """Get specification statistics.

        Args:
            spec: Specification to analyze

        Returns:
            Dictionary with:
                - user_story_count: int
                - requirement_count: int
                - total_story_points: int
                - average_story_points: float
                - priority_distribution: Dict[str, int]
                - completeness_percentage: float
        """

    def analyze_complexity(self, spec: StructuredSpec) -> Dict:
        """Analyze specification complexity.

        Args:
            spec: Specification to analyze

        Returns:
            Dictionary with:
                - score: float (0-100)
                - risk_level: str (low, medium, high, critical)
                - factors: List[str]
                - recommendations: List[str]
        """

    def get_dependency_graph(self, spec: StructuredSpec) -> Dict:
        """Get requirement dependency graph.

        Args:
            spec: Specification to analyze

        Returns:
            Dictionary with:
                - nodes: List[str] - Requirement IDs
                - edges: List[Tuple[str, str]] - Dependencies
                - chain: List[str] - Dependency execution order
                - cycles: List[List[str]] - Circular dependencies (if any)
        """

    def estimate_effort(self, spec: StructuredSpec) -> Dict:
        """Estimate development effort.

        Args:
            spec: Specification to analyze

        Returns:
            Dictionary with:
                - total_story_points: int
                - estimated_hours: float
                - estimated_weeks: float
                - by_priority: Dict[str, int]
                - confidence: float (0-1)
        """
```

**Usage Example:**
```python
from spec_creation.analyze import SpecAnalyzer

analyzer = SpecAnalyzer()

# Get statistics
stats = analyzer.get_statistics(spec)
print(f"User Stories: {stats['user_story_count']}")
print(f"Requirements: {stats['requirement_count']}")
print(f"Total Story Points: {stats['total_story_points']}")

# Analyze complexity
complexity = analyzer.analyze_complexity(spec)
print(f"Complexity Score: {complexity['score']}")
print(f"Risk Level: {complexity['risk_level']}")

# Get dependencies
deps = analyzer.get_dependency_graph(spec)
print(f"Execution Order: {deps['chain']}")

# Estimate effort
effort = analyzer.estimate_effort(spec)
print(f"Estimated Hours: {effort['estimated_hours']}")
```

---

## Helper Functions

### spec_from_plan

Convert plan to specification.

```python
def spec_from_plan(plan_path: str) -> StructuredSpec:
    """Convert plan directory to specification.

    Args:
        plan_path: Path to plan directory

    Returns:
        StructuredSpec instance

    Raises:
        FileNotFoundError: If plan directory doesn't exist
    """
```

**Usage:**
```python
from spec_creation import spec_from_plan

spec = spec_from_plan(".plans/ecommerce-project")
spec.save("specs/ecommerce.json")
```

### create_spec_from_requirements

Create spec from requirements text.

```python
def create_spec_from_requirements(
    project_name: str,
    requirements_text: str
) -> StructuredSpec:
    """Create spec from requirements text.

    Args:
        project_name: Name of the project
        requirements_text: Requirements in text format

    Returns:
        StructuredSpec instance
    """
```

**Usage:**
```python
from spec_creation import create_spec_from_requirements

requirements = """
We need an e-commerce platform with:
- User authentication
- Product catalog
- Shopping cart
- Payment processing
"""

spec = create_spec_from_requirements("E-commerce", requirements)
```

---

## CLI Tools

### spec-create.py

Command-line interface for spec creation and management.

```bash
# Create new spec interactively
python3 4-scripts/planning/spec-create.py create \
    --name "My Project" \
    --output specs/my-project

# Import from plan
python3 4-scripts/planning/spec-create.py import \
    --plan .plans/existing-project \
    --output specs/project-spec.json

# Validate spec
python3 4-scripts/planning/spec-create.py validate \
    --spec specs/project-spec.json

# Generate questions
python3 4-scripts/planning/spec-create.py question \
    --spec specs/project-spec.json \
    --section user_stories \
    --output questions.json

# Export to PRD
python3 4-scripts/planning/spec-create.py export \
    --spec specs/project-spec.json \
    --format prd \
    --output docs/PRD.md

# Analyze spec
python3 4-scripts/planning/spec-create.py analyze \
    --spec specs/project-spec.json \
    --output analysis.json
```

### spec-create.sh

Bash wrapper for spec-create.py.

```bash
#!/bin/bash
# Wrapper script for spec-create.py

python3 4-scripts/planning/spec-create.py "$@"
```

**Usage:**
```bash
cd .blackbox4
./4-scripts/planning/spec-create.sh create "My Project"
```

---

## Type Signatures

### Complete Type Reference

```python
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime

# Core types
SpecDict = Dict[str, Any]
QuestionDict = Dict[str, Any]
GapDict = Dict[str, Any]
ValidationResultDict = Dict[str, Any]

# Context variables
ContextVariables = Dict[str, Any]

# User story priority
UserStoryPriority = Literal["critical", "high", "medium", "low"]

# Requirement priority
RequirementPriority = Literal["critical", "high", "medium", "low"]

# Question areas
QuestionArea = Literal[
    "completeness",
    "clarity",
    "consistency",
    "feasibility",
    "testability"
]

# Gap severity
GapSeverity = Literal["critical", "high", "medium", "low"]

# Validation scores
Score = float  # 0-100

# Risk levels
RiskLevel = Literal["low", "medium", "high", "critical"]
```

---

## Error Handling

### Common Exceptions

```python
# Spec validation errors
class SpecValidationError(Exception):
    """Raised when spec validation fails."""
    pass

# Missing required field
class MissingRequiredFieldError(SpecValidationError):
    """Raised when required field is missing."""
    pass

# Invalid priority value
class InvalidPriorityError(SpecValidationError):
    """Raised when priority value is invalid."""
    pass

# Circular dependency
class CircularDependencyError(SpecValidationError):
    """Raised when circular dependency detected."""
    pass

# File not found
class SpecFileNotFoundError(Exception):
    """Raised when spec file not found."""
    pass

# Invalid JSON
class InvalidSpecJSONError(Exception):
    """Raised when spec JSON is invalid."""
    pass
```

**Usage:**
```python
from spec_creation import StructuredSpec, SpecValidationError

try:
    spec = StructuredSpec.load("specs/ecommerce.json")
    validator.validate(spec)
except SpecFileNotFoundError:
    print("Spec file not found")
except InvalidSpecJSONError:
    print("Invalid spec JSON format")
except SpecValidationError as e:
    print(f"Validation error: {e}")
```

---

## Conclusion

This API reference covers all public APIs for Phase 3 (Structured Spec Creation). For usage examples, see [Examples.md](EXAMPLES.md).

**Key Components:**
- `StructuredSpec` - Main spec container
- `UserStory` - User story model
- `FunctionalRequirement` - Requirement model
- `ProjectConstitution` - Constitution model
- `QuestioningEngine` - Question generation
- `SpecValidator` - Validation framework
- `SpecAnalyzer` - Analysis tools
- CLI tools - Command-line interface

**Next Steps:**
- Read [Examples](EXAMPLES.md)
- Read [Integration Guide](INTEGRATION-GUIDE.md)
- Read [Phase 3 Complete](PHASE3-COMPLETE.md)

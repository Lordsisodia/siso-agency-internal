# Enhanced Task Analysis System - Complete Design

**Created:** 2026-01-18
**Status:** Comprehensive Design Specification
**Purpose:** Multi-dimensional task analysis for optimal routing and execution

---

## Executive Summary

The original system only analyzed **complexity**. The enhanced system analyzes **5 dimensions**:

1. **Complexity** - How difficult is it?
2. **Value** - How valuable is it?
3. **Compute Requirements** - How much AI power?
4. **Speed Priority** - How fast must it be done?
5. **Task Type** - What kind of work?

This enables **intelligent routing** that considers not just difficulty, but business impact, resource allocation, urgency, and execution strategy.

---

## Multi-Dimensional Analysis Framework

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENHANCED TASK ANALYZER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT: Task (YAML frontmatter + markdown body)                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                  5-DIMENSION ANALYSIS                          │     │
│  ├────────────────────────────────────────────────────────────────┤     │
│  │                                                                  │     │
│  │  1. COMPLEXITY (How difficult?)                                 │     │
│  │     ├─ Scope (25%)                                              │     │
│  │     ├─ Technical (30%)                                          │     │
│  │     ├─ Dependencies (15%)                                       │     │
│  │     ├─ Risk (15%)                                               │     │
│  │     ├─ Uncertainty (10%)                                        │     │
│  │     └─ Cross-Domain (5%)                                        │     │
│  │                                                                  │     │
│  │  2. VALUE (How valuable?)                                       │     │
│  │     ├─ Business Impact (35%)                                    │     │
│  │     ├─ User Value (25%)                                         │     │
│  │     ├─ Strategic Alignment (20%)                                │     │
│  │     ├─ Revenue Impact (15%)                                     │     │
│  │     └─ Competitive Advantage (5%)                               │     │
│  │                                                                  │     │
│  │  3. COMPUTE REQUIREMENTS (How much AI power?)                   │     │
│  │     ├─ Processing Type (40%)                                     │     │
│  │     ├─ Token Budget (30%)                                       │     │
│  │     ├─ Model Requirements (20%)                                 │     │
│  │     └─ Parallelization Potential (10%)                          │     │
│  │                                                                  │     │
│  │  4. SPEED PRIORITY (How fast?)                                  │     │
│  │     ├─ Urgency (40%)                                             │     │
│  │     ├─ Dependencies (30%)                                       │     │
│  │     ├─ Time Sensitivity (20%)                                   │     │
│  │     └─ Stakeholder Pressure (10%)                               │     │
│  │                                                                  │     │
│  │  5. TASK TYPE (What kind of work?)                              │     │
│  │     ├─ UI (visual, user-facing)                                 │     │
│  │     ├─ Refactor (code restructuring)                            │     │
│  │     ├─ Research (investigation, analysis)                       │     │
│  │     ├─ Planning (design, architecture)                          │     │
│  │     ├─ Brainstorming (ideation, creative)                       │     │
│  │     ├─ Implementation (coding, feature)                         │     │
│  │     ├─ Testing (QA, validation)                                 │     │
│  │     ├─ Documentation (writing, guides)                          │     │
│  │     ├─ Infrastructure (devops, deployment)                       │     │
│  │     └─ Data (migrations, etl, analytics)                       │     │
│  │                                                                  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  OUTPUT: Multi-Dimensional Score                                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    ROUTING DECISION                             │     │
│  ├────────────────────────────────────────────────────────────────┤     │
│  │  • Workflow Tier (1-4)                                          │     │
│  │  • Agent Selection (which agent(s)?)                            │     │
│  │  • Model Assignment (which AI model?)                           │     │
│  │  • Token Budget (how many tokens?)                              │     │
│  │  • Parallelization Strategy (parallel vs sequential)            │     │
│  │  • Execution Priority (queue position)                          │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Dimension 1: Complexity Analysis

### Purpose
Determine how difficult the task is to complete.

### Scoring: 0-100 (Higher = More Complex)

```python
class ComplexityAnalyzer:
    """Analyze task complexity"""

    def analyze(self, task: ParsedTask) -> ComplexityScore:
        """
        Dimensions:
        - Scope (25%): How much work?
        - Technical (30%): How technically difficult?
        - Dependencies (15%): How many dependencies?
        - Risk (15%): What's the risk level?
        - Uncertainty (10%): How well-understood?
        - Cross-Domain (5%): Spans multiple domains?
        """
        score = 0
        reasoning = []

        # Scope Analysis
        scope_score = self._analyze_scope(task)
        score += scope_score * 0.25

        # Technical Analysis
        tech_score = self._analyze_technical(task)
        score += tech_score * 0.30

        # Dependency Analysis
        dep_score = self._analyze_dependencies(task)
        score += dep_score * 0.15

        # Risk Analysis
        risk_score = self._analyze_risk(task)
        score += risk_score * 0.15

        # Uncertainty Analysis
        uncertainty_score = self._analyze_uncertainty(task)
        score += uncertainty_score * 0.10

        # Cross-Domain Analysis
        cross_score = self._analyze_cross_domain(task)
        score += cross_score * 0.05

        return ComplexityScore(
            total_score=int(score),
            tier=self._score_to_tier(score),
            reasoning=reasoning
        )
```

### Indicators for Each Dimension

**Scope Indicators:**
- "multiple", "several", "various" → +20
- "end-to-end", "full", "complete" → +30
- Lines of spec > 100 → +30
- Lines of spec > 50 → +15

**Technical Indicators:**
- "algorithm", "optimization", "scalability" → +25 each
- "architecture", "design pattern" → +25
- "database", "migration" → +20
- Tech stack count > 3 → +15

**Dependency Indicators:**
- "api", "integration", "webhook" → +30
- "third-party", "external service" → +40
- Dependency count > 2 → +20

**Risk Indicators:**
- Risk level "high" → 80, "medium" → 50, "low" → 20
- "security", "payment", "data-loss" → +20 each

**Uncertainty Indicators:**
- Confidence < 0.3 → 80, < 0.5 → 60, < 0.7 → 40, else → 20
- "research", "investigate", "explore" → +30

**Cross-Domain Indicators:**
- Spans frontend + backend → 60
- Spans backend + database → 60
- Each additional domain → +30

---

## Dimension 2: Value Analysis

### Purpose
Determine how valuable the task is to the business.

### Scoring: 0-100 (Higher = More Valuable)

```python
class ValueAnalyzer:
    """Analyze task value"""

    def analyze(self, task: ParsedTask) -> ValueScore:
        """
        Dimensions:
        - Business Impact (35%): Revenue, cost savings, growth
        - User Value (25%): User experience, satisfaction
        - Strategic Alignment (20%): OKRs, company goals
        - Revenue Impact (15%): Direct revenue generation
        - Competitive Advantage (5%): Market differentiation
        """
        score = 0
        reasoning = []

        # Business Impact
        business_score = self._analyze_business_impact(task)
        score += business_score * 0.35

        # User Value
        user_score = self._analyze_user_value(task)
        score += user_score * 0.25

        # Strategic Alignment
        strategic_score = self._analyze_strategic_alignment(task)
        score += strategic_score * 0.20

        # Revenue Impact
        revenue_score = self._analyze_revenue_impact(task)
        score += revenue_score * 0.15

        # Competitive Advantage
        competitive_score = self._analyze_competitive_advantage(task)
        score += competitive_score * 0.05

        return ValueScore(
            total_score=int(score),
            value_tier=self._score_to_value_tier(score),
            reasoning=reasoning
        )
```

### Value Indicators

**Business Impact (35%)**
```python
business_indicators = {
    # High Impact
    "revenue": 90,
    "cost-reduction": 85,
    "scale": 80,
    "growth": 80,
    "efficiency": 70,

    # Medium Impact
    "optimization": 60,
    "performance": 60,
    "improvement": 50,

    # Low Impact
    "cleanup": 30,
    "refactor": 40,
    "maintenance": 35,
}
```

**User Value (25%)**
```python
user_indicators = {
    # High User Value
    "user-experience": 90,
    "ux": 85,
    "accessibility": 80,
    "feature-request": 70,
    "user-pain": 85,

    # Medium User Value
    "enhancement": 60,
    "improvement": 55,

    # Low User Value
    "internal": 40,
    "technical": 35,
    "refactor": 30,
}
```

**Strategic Alignment (20%)**
```python
# Check alignment with company goals/OKRs
strategic_keywords = {
    "okr": 80,
    "quarterly-goal": 75,
    "company-initiative": 85,
    "strategic": 70,
    "priority": 60,
}
```

**Revenue Impact (15%)**
```python
revenue_indicators = {
    # Direct Revenue
    "monetization": 100,
    "payment": 90,
    "checkout": 85,
    "subscription": 90,
    "pricing": 85,

    # Indirect Revenue
    "onboarding": 70,
    "retention": 75,
    "conversion": 80,
}
```

**Competitive Advantage (5%)**
```python
competitive_indicators = {
    "innovative": 90,
    "first-to-market": 100,
    "differentiation": 80,
    "competitive-edge": 85,
    "market-leader": 90,
}
```

---

## Dimension 3: Compute Requirements Analysis

### Purpose
Determine how much AI compute power is needed.

### Scoring: 0-100 (Higher = More Compute Needed)

```python
class ComputeAnalyzer:
    """Analyze compute requirements"""

    def analyze(self, task: ParsedTask) -> ComputeScore:
        """
        Dimensions:
        - Processing Type (40%): Research > Planning > Implementation > Testing
        - Token Budget (30%): How much context needed?
        - Model Requirements (20%): Which model capabilities?
        - Parallelization (10%): Can it be parallelized?
        """
        score = 0
        reasoning = []

        # Processing Type
        processing_score = self._analyze_processing_type(task)
        score += processing_score * 0.40

        # Token Budget
        token_score = self._analyze_token_needs(task)
        score += token_score * 0.30

        # Model Requirements
        model_score = self._analyze_model_requirements(task)
        score += model_score * 0.20

        # Parallelization
        parallel_score = self._analyze_parallelization(task)
        score += parallel_score * 0.10

        return ComputeScore(
            total_score=int(score),
            compute_tier=self._score_to_compute_tier(score),
            token_budget=self._estimate_tokens(task),
            model_recommendation=self._recommend_model(task),
            parallelization=self._should_parallelize(task),
            reasoning=reasoning
        )
```

### Processing Type Scores (40%)

```python
processing_type_scores = {
    # Heavy Compute (Research/Planning)
    "research": 100,
    "brainstorming": 95,
    "planning": 85,
    "architecture": 90,
    "investigation": 95,

    # Medium Compute (Implementation)
    "implementation": 60,
    "feature": 65,
    "refactor": 55,
    "coding": 60,

    # Light Compute (Testing/Docs)
    "testing": 40,
    "documentation": 35,
    "review": 30,
    "cleanup": 25,
}
```

### Token Budget Estimation (30%)

```python
def _estimate_tokens(self, task: ParsedTask) -> TokenBudget:
    """Estimate token requirements"""

    # Base tokens from content length
    content_length = len(task.content)
    base_tokens = content_length // 4  # Rough estimate

    # Multipliers
    multiplier = 1.0

    # Research needs more tokens
    if task.category in ["research", "planning"]:
        multiplier *= 3

    # Complex tasks need more tokens
    if task.tech_stack and len(task.tech_stack) > 3:
        multiplier *= 1.5

    # Long descriptions need more tokens
    if len(task.description) > 500:
        multiplier *= 1.3

    # Calculate budget
    estimated = int(base_tokens * multiplier)

    # Ranges
    if estimated < 1000:
        tier = "small"
        budget = (500, 2000)
    elif estimated < 5000:
        tier = "medium"
        budget = (2000, 10000)
    elif estimated < 20000:
        tier = "large"
        budget = (10000, 50000)
    else:
        tier = "xlarge"
        budget = (50000, 200000)

    return TokenBudget(
        tier=tier,
        min=budget[0],
        max=budget[1],
        estimated=estimated
    )
```

### Model Requirements (20%)

```python
model_requirements = {
    # Needs Best Model (Opus)
    "research": "opus",
    "architecture": "opus",
    "security": "opus",
    "optimization": "opus",

    # Needs Good Model (Sonnet)
    "implementation": "sonnet",
    "feature": "sonnet",
    "refactor": "sonnet",
    "planning": "sonnet",

    # Can Use Fast Model (Haiku)
    "documentation": "haiku",
    "testing": "haiku",
    "review": "haiku",
    "cleanup": "haiku",
}
```

### Parallelization Potential (10%)

```python
parallelization_indicators = {
    # High parallelization
    "testing": 90,
    "documentation": 70,
    "review": 85,
    "research": 80,  # Can parallelize research dimensions

    # Medium parallelization
    "implementation": 50,
    "feature": 60,

    # Low parallelization
    "architecture": 30,  # Needs coherence
    "planning": 40,      # Sequential decisions
}
```

---

## Dimension 4: Speed Priority Analysis

### Purpose
Determine how quickly the task needs to be completed.

### Scoring: 0-100 (Higher = More Urgent)

```python
class SpeedAnalyzer:
    """Analyze speed priority"""

    def analyze(self, task: ParsedTask) -> SpeedScore:
        """
        Dimensions:
        - Urgency (40%): How time-sensitive?
        - Dependencies (30%): Blocking others?
        - Time Sensitivity (20%): Deadlines, windows
        - Stakeholder Pressure (10%): Executive priority
        """
        score = 0
        reasoning = []

        # Urgency
        urgency_score = self._analyze_urgency(task)
        score += urgency_score * 0.40

        # Dependencies
        dep_score = self._analyze_blocking_dependencies(task)
        score += dep_score * 0.30

        # Time Sensitivity
        time_score = self._analyze_time_sensitivity(task)
        score += time_score * 0.20

        # Stakeholder Pressure
        pressure_score = self._analyze_stakeholder_pressure(task)
        score += pressure_score * 0.10

        return SpeedScore(
            total_score=int(score),
            speed_tier=self._score_to_speed_tier(score),
            priority_level=self._get_priority_level(score),
            reasoning=reasoning
        )
```

### Urgency Indicators (40%)

```python
urgency_indicators = {
    # Critical
    "critical": 100,
    "urgent": 95,
    "blocker": 100,
    "hotfix": 100,
    "production-issue": 95,

    # High
    "high-priority": 80,
    "important": 75,
    "asap": 85,

    # Medium
    "medium-priority": 50,
    "priority": 60,

    # Low
    "low-priority": 20,
    "backlog": 10,
    "eventually": 5,
}
```

### Blocking Dependencies (30%)

```python
def _analyze_blocking_dependencies(self, task: ParsedTask) -> int:
    """Check if this task blocks others"""

    # Count how many tasks this blocks
    blocks_count = len(task.blocks)

    if blocks_count == 0:
        return 0

    # Each blocked task adds urgency
    if blocks_count >= 5:
        return 100
    elif blocks_count >= 3:
        return 75
    elif blocks_count >= 1:
        return 50

    return 0
```

### Time Sensitivity (20%)

```python
time_sensitivity_indicators = {
    # Time-sensitive
    "deadline": 90,
    "time-sensitive": 85,
    "window": 80,
    "launch": 85,
    "release": 80,

    # Time-bound
    "sprint": 60,
    "milestone": 65,
    "quarter": 50,
}
```

---

## Dimension 5: Task Type Analysis

### Purpose
Determine what kind of work this is.

### Task Types

```python
class TaskType(Enum):
    """Types of tasks with different execution strategies"""

    UI = "ui"                      # Visual, user-facing, requires design skills
    REFACTOR = "refactor"          # Code restructuring, requires careful analysis
    RESEARCH = "research"          # Investigation, analysis, requires deep thinking
    PLANNING = "planning"          # Design, architecture, requires synthesis
    BRAINSTORMING = "brainstorming" # Ideation, creative, requires divergent thinking
    IMPLEMENTATION = "implementation" # Coding, feature development
    TESTING = "testing"            # QA, validation, requires systematic approach
    DOCUMENTATION = "documentation" # Writing, guides, requires communication
    INFRASTRUCTURE = "infrastructure" # DevOps, deployment, requires ops knowledge
    DATA = "data"                  # Migrations, ETL, analytics, requires data skills
```

### Type Detection

```python
class TaskTypeAnalyzer:
    """Detect task type from content"""

    def detect_type(self, task: ParsedTask) -> TaskType:
        """Detect task type with confidence"""

        type_scores = {}

        # UI Type
        type_scores[TaskType.UI] = self._score_ui_type(task)

        # Refactor Type
        type_scores[TaskType.REFACTOR] = self._score_refactor_type(task)

        # Research Type
        type_scores[TaskType.RESEARCH] = self._score_research_type(task)

        # Planning Type
        type_scores[TaskType.PLANNING] = self._score_planning_type(task)

        # Brainstorming Type
        type_scores[TaskType.BRAINSTORMING] = self._score_brainstorming_type(task)

        # Implementation Type
        type_scores[TaskType.IMPLEMENTATION] = self._score_implementation_type(task)

        # Testing Type
        type_scores[TaskType.TESTING] = self._score_testing_type(task)

        # Documentation Type
        type_scores[TaskType.DOCUMENTATION] = self._score_documentation_type(task)

        # Infrastructure Type
        type_scores[TaskType.INFRASTRUCTURE] = self._score_infrastructure_type(task)

        # Data Type
        type_scores[TaskType.DATA] = self._score_data_type(task)

        # Get highest score
        detected_type = max(type_scores, key=type_scores.get)
        confidence = type_scores[detected_type]

        return TaskTypeResult(
            type=detected_type,
            confidence=confidence,
            all_scores=type_scores
        )

    def _score_ui_type(self, task: ParsedTask) -> float:
        """Score UI type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        ui_keywords = [
            "ui", "user interface", "frontend", "component",
            "design", "visual", "responsive", "mobile",
            "web", "button", "form", "layout", "style",
            "css", "react", "vue", "angular"
        ]

        for keyword in ui_keywords:
            if keyword in text:
                score += 0.15

        # Check domain
        if task.domain == "frontend" or task.domain == "design":
            score += 0.3

        # Check category
        if task.category == "feature":
            score += 0.1

        return min(score, 1.0)

    def _score_refactor_type(self, task: ParsedTask) -> float:
        """Score refactor type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        refactor_keywords = [
            "refactor", "restructure", "reorganize", "cleanup",
            "technical debt", "improve code", "code quality",
            "simplify", "optimize", "rework", "rewrite"
        ]

        for keyword in refactor_keywords:
            if keyword in text:
                score += 0.2

        # Check category
        if task.category == "refactor" or task.category == "cleanup":
            score += 0.4

        return min(score, 1.0)

    def _score_research_type(self, task: ParsedTask) -> float:
        """Score research type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        research_keywords = [
            "research", "investigate", "analyze", "study",
            "explore", "evaluate", "compare", "find",
            "discovery", "investigation", "analysis"
        ]

        for keyword in research_keywords:
            if keyword in text:
                score += 0.15

        # Check category
        if task.category == "research":
            score += 0.4

        return min(score, 1.0)

    def _score_planning_type(self, task: ParsedTask) -> float:
        """Score planning type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        planning_keywords = [
            "plan", "design", "architecture", "spec",
            "architecture", "roadmap", "strategy", "approach",
            "technical design", "system design"
        ]

        for keyword in planning_keywords:
            if keyword in text:
                score += 0.12

        # Check subcategory
        if task.subcategory == "architecture":
            score += 0.3

        return min(score, 1.0)

    def _score_brainstorming_type(self, task: ParsedTask) -> float:
        """Score brainstorming type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        brainstorm_keywords = [
            "brainstorm", "ideate", "ideas", "creative",
            "explore options", "alternatives", "possibilities",
            "concept", "innovate", "think", "envision"
        ]

        for keyword in brainstorm_keywords:
            if keyword in text:
                score += 0.18

        return min(score, 1.0)

    def _score_implementation_type(self, task: ParsedTask) -> float:
        """Score implementation type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        implementation_keywords = [
            "implement", "build", "create", "develop",
            "add feature", "functionality", "endpoint",
            "api", "service", "module", "class"
        ]

        for keyword in implementation_keywords:
            if keyword in text:
                score += 0.1

        # Check category
        if task.category == "feature" or task.category == "enhancement":
            score += 0.2

        return min(score, 1.0)

    def _score_testing_type(self, task: ParsedTask) -> float:
        """Score testing type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        testing_keywords = [
            "test", "testing", "qa", "validate", "verify",
            "unit test", "integration test", "e2e",
            "test coverage", "test case"
        ]

        for keyword in testing_keywords:
            if keyword in text:
                score += 0.15

        # Check category
        if task.category == "testing":
            score += 0.4

        return min(score, 1.0)

    def _score_documentation_type(self, task: ParsedTask) -> float:
        """Score documentation type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        doc_keywords = [
            "document", "documentation", "guide", "readme",
            "wiki", "comment", "explain", "write", "manual"
        ]

        for keyword in doc_keywords:
            if keyword in text:
                score += 0.15

        # Check category
        if task.category == "documentation":
            score += 0.4

        return min(score, 1.0)

    def _score_infrastructure_type(self, task: ParsedTask) -> float:
        """Score infrastructure type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        infra_keywords = [
            "deploy", "deployment", "ci/cd", "pipeline",
            "infrastructure", "devops", "docker", "kubernetes",
            "aws", "gcp", "azure", "server", "hosting"
        ]

        for keyword in infra_keywords:
            if keyword in text:
                score += 0.12

        # Check category
        if task.category == "infrastructure" or task.category == "devops":
            score += 0.4

        return min(score, 1.0)

    def _score_data_type(self, task: ParsedTask) -> float:
        """Score data type indicators"""
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        data_keywords = [
            "migration", "etl", "data", "database",
            "schema", "sql", "query", "analytics",
            "report", "dashboard", "metrics"
        ]

        for keyword in data_keywords:
            if keyword in text:
                score += 0.12

        # Check subcategory
        if task.subcategory == "database" or task.subcategory == "analytics":
            score += 0.3

        return min(score, 1.0)
```

---

## Complete Multi-Dimensional Analyzer

```python
class EnhancedTaskAnalyzer:
    """
    Complete multi-dimensional task analyzer.

    Analyzes 5 dimensions:
    1. Complexity - How difficult?
    2. Value - How valuable?
    3. Compute - How much AI power?
    4. Speed - How urgent?
    5. Type - What kind of work?
    """

    def __init__(self):
        self.complexity_analyzer = ComplexityAnalyzer()
        self.value_analyzer = ValueAnalyzer()
        self.compute_analyzer = ComputeAnalyzer()
        self.speed_analyzer = SpeedAnalyzer()
        self.type_analyzer = TaskTypeAnalyzer()

    def analyze(self, task: ParsedTask) -> TaskAnalysis:
        """Complete multi-dimensional analysis"""

        # Analyze all dimensions
        complexity = self.complexity_analyzer.analyze(task)
        value = self.value_analyzer.analyze(task)
        compute = self.compute_analyzer.analyze(task)
        speed = self.speed_analyzer.analyze(task)
        task_type = self.type_analyzer.detect_type(task)

        # Generate routing recommendation
        routing = self._generate_routing(
            task, complexity, value, compute, speed, task_type
        )

        return TaskAnalysis(
            task_id=task.id,
            title=task.title,

            # Dimension scores
            complexity=complexity,
            value=value,
            compute=compute,
            speed=speed,
            task_type=task_type,

            # Routing recommendation
            routing=routing,

            # Overall assessment
            overall_assessment=self._generate_overall_assessment(
                complexity, value, compute, speed, task_type
            )
        )

    def _generate_routing(
        self,
        task: ParsedTask,
        complexity: ComplexityScore,
        value: ValueScore,
        compute: ComputeScore,
        speed: SpeedScore,
        task_type: TaskTypeResult
    ) -> RoutingRecommendation:
        """Generate complete routing recommendation"""

        # Determine workflow tier (based on complexity)
        workflow_tier = complexity.tier

        # Determine priority (based on speed + value)
        if speed.total_score >= 80 or value.total_score >= 80:
            priority = "critical"
        elif speed.total_score >= 60 or value.total_score >= 60:
            priority = "high"
        elif speed.total_score >= 40 or value.total_score >= 40:
            priority = "medium"
        else:
            priority = "low"

        # Determine agent (based on task type)
        agent_mapping = {
            TaskType.UI: "ui-specialist",
            TaskType.REFACTOR: "code-architect",
            TaskType.RESEARCH: "research-agent",
            TaskType.PLANNING: "architect",
            TaskType.BRAINSTORMING: "creative-agent",
            TaskType.IMPLEMENTATION: "developer",
            TaskType.TESTING: "qa-agent",
            TaskType.DOCUMENTATION: "technical-writer",
            TaskType.INFRASTRUCTURE: "devops-engineer",
            TaskType.DATA: "data-engineer",
        }
        recommended_agent = agent_mapping.get(task_type.type, "generalist")

        # Determine model (based on compute)
        model_mapping = {
            "opus": "claude-opus-4",
            "sonnet": "claude-sonnet-4",
            "haiku": "claude-haiku-4"
        }
        recommended_model = model_mapping.get(compute.model_recommendation, "claude-sonnet-4")

        # Determine parallelization
        should_parallelize = compute.parallelization

        # Generate execution plan
        execution_plan = self._generate_execution_plan(
            workflow_tier, task_type, compute, should_parallelize
        )

        return RoutingRecommendation(
            workflow_tier=workflow_tier,
            priority=priority,
            recommended_agent=recommended_agent,
            recommended_model=recommended_model,
            token_budget=compute.token_budget,
            should_parallelize=should_parallelize,
            execution_plan=execution_plan,
            estimated_hours=complexity.estimated_hours
        )

    def _generate_execution_plan(
        self,
        tier: int,
        task_type: TaskTypeResult,
        compute: ComputeScore,
        parallelize: bool
    ) -> ExecutionPlan:
        """Generate detailed execution plan"""

        if tier == 1:
            # Quick fix
            return ExecutionPlan(
                strategy="direct",
                steps=[
                    "Create GitHub Issue",
                    "Implement fix directly",
                    "Create PR",
                    "Mark done"
                ],
                estimated_duration_minutes=30
            )

        elif tier == 2:
            # Simple
            return ExecutionPlan(
                strategy="sequential",
                steps=[
                    "Create light PRD",
                    "Create GitHub Issue",
                    "Implement",
                    "Basic testing",
                    "Mark done"
                ],
                estimated_duration_minutes=60
            )

        elif tier == 3:
            # Standard
            if parallelize and task_type.type == TaskType.RESEARCH:
                # Parallel research
                return ExecutionPlan(
                    strategy="parallel_research",
                    steps=[
                        "Decompose research into dimensions",
                        "Spawn parallel research agents",
                        "Aggregate findings",
                        "Create PRD",
                        "Generate Epic",
                        "Break down to tasks",
                        "Execute"
                    ],
                    estimated_duration_minutes=240
                )
            else:
                # Sequential standard
                return ExecutionPlan(
                    strategy="standard",
                    steps=[
                        "Create PRD",
                        "Generate Epic",
                        "Break down to tasks",
                        "Execute tasks",
                        "Test",
                        "Mark done"
                    ],
                    estimated_duration_minutes=180
                )

        else:
            # Complex
            return ExecutionPlan(
                strategy="phased",
                steps=[
                    "Deep research (parallel)",
                    "First principles analysis",
                    "Architecture review",
                    "Security assessment",
                    "Create comprehensive PRD",
                    "Generate Epic",
                    "Phased task breakdown",
                    "Execute by phase",
                    "Comprehensive testing",
                    "Production rollout"
                ],
                estimated_duration_minutes=480
            )
```

---

## Data Structures

```python
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
from enum import Enum

@dataclass
class ComplexityScore:
    """Complexity analysis result"""
    total_score: int
    tier: int
    reasoning: List[str]
    estimated_hours: Tuple[int, int, float]

@dataclass
class ValueScore:
    """Value analysis result"""
    total_score: int
    value_tier: str  # "critical", "high", "medium", "low"
    reasoning: List[str]
    roi_estimate: float

@dataclass
class ComputeScore:
    """Compute requirements result"""
    total_score: int
    compute_tier: str  # "minimal", "moderate", "heavy", "intensive"
    token_budget: TokenBudget
    model_recommendation: str  # "opus", "sonnet", "haiku"
    parallelization: bool
    reasoning: List[str]

@dataclass
class TokenBudget:
    """Token budget estimate"""
    tier: str  # "small", "medium", "large", "xlarge"
    min: int
    max: int
    estimated: int

@dataclass
class SpeedScore:
    """Speed priority result"""
    total_score: int
    speed_tier: str  # "immediate", "fast", "normal", "eventual"
    priority_level: str  # "critical", "high", "medium", "low"
    reasoning: List[str]

@dataclass
class TaskTypeResult:
    """Task type detection result"""
    type: TaskType
    confidence: float
    all_scores: Dict[TaskType, float]

@dataclass
class RoutingRecommendation:
    """Complete routing recommendation"""
    workflow_tier: int
    priority: str
    recommended_agent: str
    recommended_model: str
    token_budget: TokenBudget
    should_parallelize: bool
    execution_plan: ExecutionPlan
    estimated_hours: Tuple[int, int, float]

@dataclass
class ExecutionPlan:
    """Execution plan"""
    strategy: str  # "direct", "sequential", "parallel", "phased"
    steps: List[str]
    estimated_duration_minutes: int

@dataclass
class TaskAnalysis:
    """Complete task analysis"""
    task_id: str
    title: str

    # All dimensions
    complexity: ComplexityScore
    value: ValueScore
    compute: ComputeScore
    speed: SpeedScore
    task_type: TaskTypeResult

    # Routing
    routing: RoutingRecommendation

    # Overall
    overall_assessment: str
```

---

## Example Usage

```python
from task_management.enhanced_analyzer import EnhancedTaskAnalyzer
from task_management.parser import TaskParser
from pathlib import Path

# Parse task
parser = TaskParser()
task = parser.parse(Path("tasks/TASK-2026-01-18-001.md"))

# Analyze
analyzer = EnhancedTaskAnalyzer()
analysis = analyzer.analyze(task)

# Print results
print(f"Task: {analysis.title}")
print(f"\nComplexity: {analysis.complexity.total_score}/100 (Tier {analysis.complexity.tier})")
print(f"Value: {analysis.value.total_score}/100 ({analysis.value.value_tier})")
print(f"Compute: {analysis.compute.total_score}/100 ({analysis.compute.compute_tier})")
print(f"Speed: {analysis.speed.total_score}/100 ({analysis.speed.speed_tier})")
print(f"Type: {analysis.task_type.type.value} ({analysis.task_type.confidence:.0%} confidence)")

print(f"\nRouting Recommendation:")
print(f"  Workflow: Tier {analysis.routing.workflow_tier}")
print(f"  Priority: {analysis.routing.priority}")
print(f"  Agent: {analysis.routing.recommended_agent}")
print(f"  Model: {analysis.routing.recommended_model}")
print(f"  Tokens: {analysis.routing.token_budget.estimated} ({analysis.routing.token_budget.tier})")
print(f"  Parallelize: {analysis.routing.should_parallelize}")
print(f"  Estimate: {analysis.routing.estimated_hours[2]:.1f}h")

print(f"\nExecution Plan:")
for step in analysis.routing.execution_plan.steps:
    print(f"  • {step}")
```

---

## Summary

This enhanced system considers:

1. **Complexity** (5 dimensions) - How difficult?
2. **Value** (5 dimensions) - How valuable?
3. **Compute** (4 dimensions) - How much AI power?
4. **Speed** (4 dimensions) - How urgent?
5. **Type** (10 types) - What kind of work?

**Result:** Intelligent routing that optimizes for:
- Right workflow (based on complexity)
- Right priority (based on speed + value)
- Right agent (based on task type)
- Right model (based on compute needs)
- Right resources (token budget)
- Right strategy (parallel vs sequential)

**Next:** Implement this enhanced analyzer.

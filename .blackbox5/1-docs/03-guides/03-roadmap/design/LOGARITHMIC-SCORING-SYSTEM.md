# Logarithmic Scoring System - Enhanced Task Analyzer

**Created:** 2026-01-18
**Status:** Complete Implementation Specification
**Key Innovation:** Log₁₀-based exponential scales for natural task distribution

---

## Why Logarithmic Scales?

### Problem with Linear Scales

Linear scales have poor resolution at the low end and compressed ranges at the high end:

```
Linear Scale (0-100):
0-20:   Too broad (can't distinguish quick fixes)
20-40:  Medium tasks crowded together
40-60:  Most tasks fall here
60-80:  Complex tasks compressed
80-100: Very complex tasks have no room
```

### Solution: Logarithmic Scales

Log₁₀ scales provide **exponential discrimination**:

```
Log Scale (log₁₀):
Score 0-20:   Covers 1-100 units (100x range)
Score 20-40:  Covers 100-10,000 units (100x range)
Score 40-60:  Covers 10,000-1,000,000 units (100x range)
Score 60-80:  Covers 1M-100M units (100x range)
Score 80-100: Covers 100M-10B units (100x range)
```

**Each 20-point band represents a 100x increase in magnitude!**

### Benefits

1. **Natural Task Distribution** - Power law distribution (many small, few large)
2. **Better Low-End Resolution** - Distinguish quick fixes clearly
3. **Unbounded Upper Range** - No ceiling for extremely complex tasks
4. **Human-Perception Aligned** - Matches how we perceive effort/difficulty
5. **Multiplicative Comparisons** - "Task A is 10x harder than B"

---

## Log₁₀ Scoring Formulas

### Basic Formula

```python
def log_score(value: float, min_val: float = 1, max_val: float = 10**10) -> float:
    """
    Convert linear value to log₁₀ score (0-100).

    Formula:
    score = 100 * (log₁₀(value) - log₁₀(min_val)) / (log₁₀(max_val) - log₁₀(min_val))

    This maps:
    - min_val → 0
    - max_val → 100
    - Each 100x increase → +20 points
    """
    import math

    if value <= min_val:
        return 0.0

    if value >= max_val:
        return 100.0

    log_value = math.log10(value)
    log_min = math.log10(min_val)
    log_max = math.log10(max_val)

    score = 100 * (log_value - log_min) / (log_max - log_min)

    return score
```

### Inverse Formula

```python
def log_to_value(score: float, min_val: float = 1, max_val: float = 10**10) -> float:
    """
    Convert log₁₀ score back to linear value.
    """
    import math

    if score <= 0:
        return min_val

    if score >= 100:
        return max_val

    log_min = math.log10(min_val)
    log_max = math.log10(max_val)

    log_value = log_min + (score / 100) * (log_max - log_min)

    return 10 ** log_value
```

---

## Dimension 1: Complexity (Logarithmic)

### Scoring Bands

```python
class LogComplexityAnalyzer:
    """Complexity analysis with logarithmic scoring"""

    # Complexity magnitude bands (each 100x increase)
    BANDS = {
        0: (1, 100, "Trivial"),           # Score 0-20
        1: (100, 10_000, "Simple"),       # Score 20-40
        2: (10_000, 1_000_000, "Moderate"), # Score 40-60
        3: (1_000_000, 100_000_000, "Complex"), # Score 60-80
        4: (100_000_000, 10_000_000_000, "Very Complex"), # Score 80-100
    }

    def calculate_complexity_magnitude(self, task: ParsedTask) -> float:
        """
        Calculate complexity magnitude (raw value).

        This is the product of all complexity factors.
        """
        magnitude = 1.0  # Start with baseline

        # Scope multiplier (1-1000x)
        scope_multiplier = self._calculate_scope_multiplier(task)
        magnitude *= scope_multiplier

        # Technical multiplier (1-100x)
        tech_multiplier = self._calculate_technical_multiplier(task)
        magnitude *= tech_multiplier

        # Dependency multiplier (1-100x)
        dep_multiplier = self._calculate_dependency_multiplier(task)
        magnitude *= dep_multiplier

        # Risk multiplier (1-100x)
        risk_multiplier = self._calculate_risk_multiplier(task)
        magnitude *= risk_multiplier

        # Uncertainty multiplier (1-100x)
        uncertainty_multiplier = self._calculate_uncertainty_multiplier(task)
        magnitude *= uncertainty_multiplier

        # Cross-domain multiplier (1-10x)
        cross_multiplier = self._calculate_cross_domain_multiplier(task)
        magnitude *= cross_multiplier

        return magnitude

    def _calculate_scope_multiplier(self, task: ParsedTask) -> float:
        """
        Scope: How much work?

        Multipliers:
        - 1x: Single line change
        - 10x: Small function (< 50 lines)
        - 100x: Medium feature (50-500 lines)
        - 1,000x: Large feature (500-5000 lines)
        - 10,000x: Epic (5000+ lines)
        """
        text = f"{task.title} {task.description} {task.content}"
        line_count = len(text.split('\n'))

        # Base from line count
        if line_count <= 10:
            base = 1
        elif line_count <= 50:
            base = 10
        elif line_count <= 500:
            base = 100
        elif line_count <= 5000:
            base = 1000
        else:
            base = 10000

        # Keyword multipliers
        if "multiple" in text.lower() or "several" in text.lower():
            base *= 10
        if "end-to-end" in text.lower() or "full" in text.lower():
            base *= 100

        return float(base)

    def _calculate_technical_multiplier(self, task: ParsedTask) -> float:
        """
        Technical difficulty.

        Multipliers:
        - 1x: Straightforward
        - 10x: Some technical challenge
        - 100x: Significantly technical
        """
        text = f"{task.title} {task.description} {task.content}".lower()

        multiplier = 1.0

        # Technical difficulty keywords
        technical_keywords = {
            # 100x multipliers
            "algorithm": 100,
            "optimization": 100,
            "scalability": 100,
            "architecture": 100,
            "performance": 100,

            # 10x multipliers
            "database": 10,
            "migration": 10,
            "api": 10,
            "integration": 10,
            "security": 10,
        }

        for keyword, mult in technical_keywords.items():
            if keyword in text:
                multiplier *= max(1, mult / 10)  # Average out if multiple

        # Tech stack diversity
        if len(task.tech_stack) > 3:
            multiplier *= 10
        elif len(task.tech_stack) > 1:
            multiplier *= 2

        return min(multiplier, 100.0)

    def _calculate_dependency_multiplier(self, task: ParsedTask) -> float:
        """
        Dependencies.

        Multipliers:
        - 1x: No dependencies
        - 10x: Some dependencies
        - 100x: Many dependencies
        """
        multiplier = 1.0

        # Count dependencies
        dep_count = len(task.depends_on) + len(task.blocked_by)

        if dep_count >= 5:
            multiplier = 100
        elif dep_count >= 2:
            multiplier = 10
        elif dep_count >= 1:
            multiplier = 2

        # External dependencies
        text = f"{task.title} {task.description} {task.content}".lower()
        if "api" in text or "integration" in text:
            multiplier *= 10
        if "third-party" in text or "external" in text:
            multiplier *= 100

        return min(multiplier, 100.0)

    def _calculate_risk_multiplier(self, task: ParsedTask) -> float:
        """
        Risk level.

        Multipliers:
        - 1x: Low risk
        - 10x: Medium risk
        - 100x: High risk
        """
        risk_map = {
            "low": 1,
            "medium": 10,
            "high": 100
        }

        multiplier = float(risk_map.get(task.risk_level.lower(), 10))

        # Risk keywords add more
        text = f"{task.title} {task.description} {task.content}".lower()
        risk_keywords = ["security", "payment", "data-loss", "compliance", "critical"]
        for keyword in risk_keywords:
            if keyword in text:
                multiplier *= 10

        return min(multiplier, 100.0)

    def _calculate_uncertainty_multiplier(self, task: ParsedTask) -> float:
        """
        Uncertainty.

        Multipliers:
        - 1x: Well-understood (confidence > 0.7)
        - 10x: Somewhat uncertain (0.3-0.7)
        - 100x: Highly uncertain (< 0.3)
        """
        if task.confidence >= 0.7:
            multiplier = 1.0
        elif task.confidence >= 0.3:
            multiplier = 10.0
        else:
            multiplier = 100.0

        # Research keywords add uncertainty
        text = f"{task.title} {task.description} {task.content}".lower()
        if "research" in text or "investigate" in text or "explore" in text:
            multiplier *= 10

        return min(multiplier, 100.0)

    def _calculate_cross_domain_multiplier(self, task: ParsedTask) -> float:
        """
        Cross-domain complexity.

        Multipliers:
        - 1x: Single domain
        - 10x: 2-3 domains
        - 100x: 4+ domains
        """
        # Count domains involved
        domains = set()

        text = f"{task.title} {task.description} {task.content} {task.domain}".lower()

        domain_keywords = {
            "frontend": ["ui", "frontend", "react", "vue", "component"],
            "backend": ["api", "backend", "server", "endpoint"],
            "database": ["database", "schema", "sql", "query"],
            "devops": ["deploy", "ci/cd", "infrastructure", "docker"],
        }

        for domain, keywords in domain_keywords.items():
            if any(kw in text for kw in keywords):
                domains.add(domain)

        domain_count = len(domains)

        if domain_count >= 4:
            return 100.0
        elif domain_count >= 2:
            return 10.0
        else:
            return 1.0

    def analyze(self, task: ParsedTask) -> LogComplexityScore:
        """Complete complexity analysis with logarithmic scoring"""

        # Calculate magnitude
        magnitude = self.calculate_complexity_magnitude(task)

        # Convert to log score (0-100)
        score = log_score(magnitude, min_val=1, max_val=10**10)

        # Determine band and tier
        band = self._get_band(score)
        tier = self._score_to_tier(score)

        # Estimate hours (logarithmic)
        hours_min, hours_max, hours_expected = self._estimate_hours_log(score)

        return LogComplexityScore(
            magnitude=magnitude,
            total_score=int(score),
            band=band,
            tier=tier,
            estimated_hours=(hours_min, hours_max, hours_expected)
        )

    def _get_band(self, score: float) -> str:
        """Get complexity band from score"""
        if score < 20:
            return "trivial"
        elif score < 40:
            return "simple"
        elif score < 60:
            return "moderate"
        elif score < 80:
            return "complex"
        else:
            return "very_complex"

    def _score_to_tier(self, score: float) -> int:
        """Convert score to workflow tier"""
        if score < 20:
            return 1
        elif score < 40:
            return 2
        elif score < 60:
            return 3
        else:
            return 4

    def _estimate_hours_log(self, score: float) -> tuple[int, int, float]:
        """
        Estimate hours using logarithmic scale.

        Formula: hours = base * 10^(score / 20)
        Where base = 0.5 hours
        """
        import math

        base = 0.5  # Minimum 30 minutes
        exponent = score / 20  # Each 20 points = 10x more hours

        hours_expected = base * (10 ** exponent)

        # Range: 50% to 200% of expected
        hours_min = int(hours_expected * 0.5)
        hours_max = int(hours_expected * 2)

        return (hours_min, hours_max, hours_expected)


@dataclass
class LogComplexityScore:
    """Logarithmic complexity score"""
    magnitude: float          # Raw magnitude (1 to 10B)
    total_score: int          # Log₁₀ score (0-100)
    band: str                 # "trivial", "simple", "moderate", "complex", "very_complex"
    tier: int                 # Workflow tier (1-4)
    estimated_hours: tuple[int, int, float]  # (min, max, expected)
```

---

## Dimension 2: Value (Logarithmic)

### Scoring Bands

```python
class LogValueAnalyzer:
    """Value analysis with logarithmic scoring"""

    def calculate_value_magnitude(self, task: ParsedTask) -> float:
        """
        Calculate value magnitude (raw value).

        This is the product of all value factors.
        """
        magnitude = 1.0

        # Business impact multiplier (1-10,000x)
        business_multiplier = self._calculate_business_impact(task)
        magnitude *= business_multiplier

        # User value multiplier (1-1,000x)
        user_multiplier = self._calculate_user_value(task)
        magnitude *= user_multiplier

        # Strategic alignment multiplier (1-100x)
        strategic_multiplier = self._calculate_strategic_alignment(task)
        magnitude *= strategic_multiplier

        # Revenue impact multiplier (1-1,000x)
        revenue_multiplier = self._calculate_revenue_impact(task)
        magnitude *= revenue_multiplier

        # Competitive advantage multiplier (1-10x)
        competitive_multiplier = self._calculate_competitive_advantage(task)
        magnitude *= competitive_multiplier

        return magnitude

    def _calculate_business_impact(self, task: ParsedTask) -> float:
        """
        Business impact (logarithmic).

        Multipliers:
        - 1x: Minimal impact
        - 10x: Noticeable improvement
        - 100x: Significant impact
        - 1,000x: Major impact
        - 10,000x: Transformative
        """
        text = f"{task.title} {task.description} {task.content}".lower()

        # Impact keywords with logarithmic multipliers
        impact_keywords = {
            # 10,000x (transformative)
            "transformational": 10000,
            "revolutionary": 10000,
            "game-changer": 10000,

            # 1,000x (major)
            "revenue": 1000,
            "scale": 1000,
            "growth": 1000,
            "cost-reduction": 1000,

            # 100x (significant)
            "optimization": 100,
            "performance": 100,
            "efficiency": 100,
            "significant": 100,

            # 10x (noticeable)
            "improvement": 10,
            "enhancement": 10,
            "better": 10,

            # 1x (minimal)
            "cleanup": 1,
            "maintenance": 1,
            "refactor": 1,
        }

        multiplier = 1.0
        for keyword, mult in impact_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_user_value(self, task: ParsedTask) -> float:
        """
        User value (logarithmic).

        Multipliers:
        - 1x: Internal benefit
        - 10x: Minor user benefit
        - 100x: Moderate user benefit
        - 1,000x: Major user benefit
        """
        text = f"{task.title} {task.description} {task.content}".lower()

        user_keywords = {
            # 1,000x (major user value)
            "user-experience": 1000,
            "ux": 1000,
            "accessibility": 1000,
            "user-pain": 1000,

            # 100x (moderate user value)
            "feature-request": 100,
            "enhancement": 100,
            "improvement": 100,

            # 10x (minor user value)
            "ui": 10,
            "interface": 10,

            # 1x (internal)
            "internal": 1,
            "technical": 1,
        }

        multiplier = 1.0
        for keyword, mult in user_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_strategic_alignment(self, task: ParsedTask) -> float:
        """
        Strategic alignment (logarithmic).

        Multipliers:
        - 1x: Not aligned
        - 10x: Somewhat aligned
        - 100x: Well aligned
        """
        text = f"{task.title} {task.description}".lower()

        strategic_keywords = {
            # 100x
            "okr": 100,
            "quarterly-goal": 100,
            "company-initiative": 100,
            "strategic": 100,
            "priority": 100,

            # 10x
            "aligned": 10,
            "goal": 10,
        }

        multiplier = 1.0
        for keyword, mult in strategic_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_revenue_impact(self, task: ParsedTask) -> float:
        """
        Revenue impact (logarithmic).

        Multipliers:
        - 1x: No revenue impact
        - 10x: Indirect revenue
        - 100x: Direct revenue contribution
        - 1,000x: Revenue-critical
        """
        text = f"{task.title} {task.description} {task.content}".lower()

        revenue_keywords = {
            # 1,000x
            "monetization": 1000,
            "payment": 1000,
            "subscription": 1000,
            "checkout": 1000,

            # 100x
            "conversion": 100,
            "retention": 100,
            "onboarding": 100,

            # 10x
            "pricing": 10,

            # 1x
            "internal": 1,
        }

        multiplier = 1.0
        for keyword, mult in revenue_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_competitive_advantage(self, task: ParsedTask) -> float:
        """
        Competitive advantage (logarithmic).

        Multipliers:
        - 1x: No advantage
        - 10x: Minor advantage
        - 100x: Significant advantage
        """
        text = f"{task.title} {task.description}".lower()

        competitive_keywords = {
            # 100x
            "innovative": 100,
            "first-to-market": 100,
            "differentiation": 100,
            "competitive-edge": 100,

            # 10x
            "advantage": 10,
            "better": 10,
        }

        multiplier = 1.0
        for keyword, mult in competitive_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def analyze(self, task: ParsedTask) -> LogValueScore:
        """Complete value analysis with logarithmic scoring"""

        # Calculate magnitude
        magnitude = self.calculate_value_magnitude(task)

        # Convert to log score (0-100)
        score = log_score(magnitude, min_val=1, max_val=10**8)

        # Determine value tier
        value_tier = self._score_to_value_tier(score)

        # Calculate ROI (value / complexity ratio)
        # This will be done when we have complexity score

        return LogValueScore(
            magnitude=magnitude,
            total_score=int(score),
            value_tier=value_tier
        )

    def _score_to_value_tier(self, score: float) -> str:
        """Convert score to value tier"""
        if score >= 80:
            return "critical"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "medium"
        else:
            return "low"


@dataclass
class LogValueScore:
    """Logarithmic value score"""
    magnitude: float          # Raw magnitude (1 to 100M)
    total_score: int          # Log₁₀ score (0-100)
    value_tier: str           # "critical", "high", "medium", "low"
    roi_estimate: float = 0.0  # Value / Complexity ratio
```

---

## Dimension 3: Compute Requirements (Logarithmic)

### Scoring Bands

```python
class LogComputeAnalyzer:
    """Compute requirements analysis with logarithmic scoring"""

    def calculate_compute_magnitude(self, task: ParsedTask) -> float:
        """
        Calculate compute magnitude (raw compute needs).

        This combines processing type, token needs, and model requirements.
        """
        magnitude = 1.0

        # Processing type multiplier (1-1,000x)
        processing_multiplier = self._calculate_processing_type(task)
        magnitude *= processing_multiplier

        # Token budget multiplier (1-10,000x)
        token_multiplier = self._calculate_token_needs(task)
        magnitude *= token_multiplier

        # Model requirements multiplier (1-100x)
        model_multiplier = self._calculate_model_requirements(task)
        magnitude *= model_multiplier

        # Parallelization factor (0.1x to 1x)
        parallel_factor = self._calculate_parallelization_factor(task)
        magnitude *= parallel_factor

        return magnitude

    def _calculate_processing_type(self, task: ParsedTask) -> float:
        """
        Processing type (logarithmic compute needs).

        Multipliers:
        - 1x: Documentation, testing
        - 10x: Implementation, coding
        - 100x: Planning, architecture
        - 1,000x: Research, brainstorming
        """
        # Determine task type
        task_type = self._detect_task_type(task)

        type_multipliers = {
            TaskType.DOCUMENTATION: 1,
            TaskType.TESTING: 1,
            TaskType.IMPLEMENTATION: 10,
            TaskType.REFACTOR: 10,
            TaskType.INFRASTRUCTURE: 10,
            TaskType.DATA: 10,
            TaskType.PLANNING: 100,
            TaskType.UI: 50,
            TaskType.BRAINSTORMING: 1000,
            TaskType.RESEARCH: 1000,
        }

        return type_multipliers.get(task_type, 10)

    def _calculate_token_needs(self, task: ParsedTask) -> float:
        """
        Token needs (logarithmic).

        Multipliers:
        - 1x: Small (< 1K tokens)
        - 10x: Medium (1K-10K tokens)
        - 100x: Large (10K-100K tokens)
        - 1,000x: Very Large (100K-1M tokens)
        - 10,000x: Massive (1M+ tokens)
        """
        # Estimate base tokens from content
        content_length = len(task.content)
        base_tokens = content_length // 4  # Rough estimate

        # Apply task type multiplier
        task_type = self._detect_task_type(task)

        type_multipliers = {
            TaskType.RESEARCH: 1000,      # Needs lots of context
            TaskType.BRAINSTORMING: 1000, # Needs exploration
            TaskType.PLANNING: 100,       # Needs synthesis
            TaskType.REFACTOR: 50,        # Needs code analysis
            TaskType.IMPLEMENTATION: 10,   # Standard coding
            TaskType.TESTING: 5,          # Focused testing
            TaskType.DOCUMENTATION: 5,    # Writing docs
            TaskType.UI: 20,              # Visual + code
            TaskType.INFRASTRUCTURE: 10,   # Config + scripts
            TaskType.DATA: 50,            # Data analysis
        }

        multiplier = type_multipliers.get(task_type, 10)

        # Adjust for content length
        if base_tokens > 10000:
            multiplier *= 10
        elif base_tokens > 5000:
            multiplier *= 5
        elif base_tokens > 1000:
            multiplier *= 2

        return float(multiplier)

    def _calculate_model_requirements(self, task: ParsedTask) -> float:
        """
        Model requirements (logarithmic compute cost).

        Multipliers:
        - 1x: Haiku (fast, cheap)
        - 10x: Sonnet (balanced)
        - 100x: Opus (best, expensive)
        """
        task_type = self._detect_task_type(task)

        # Map task types to required models
        model_requirements = {
            TaskType.RESEARCH: "opus",
            TaskType.PLANNING: "opus",
            TaskType.BRAINSTORMING: "sonnet",
            TaskType.REFACTOR: "sonnet",
            TaskType.IMPLEMENTATION: "sonnet",
            TaskType.UI: "sonnet",
            TaskType.TESTING: "haiku",
            TaskType.DOCUMENTATION: "haiku",
            TaskType.INFRASTRUCTURE: "sonnet",
            TaskType.DATA: "sonnet",
        }

        model = model_requirements.get(task_type, "sonnet")

        model_multipliers = {
            "haiku": 1,
            "sonnet": 10,
            "opus": 100,
        }

        return float(model_multipliers.get(model, 10))

    def _calculate_parallelization_factor(self, task: ParsedTask) -> float:
        """
        Parallelization factor (reduces effective compute).

        Returns:
        - 1.0: No parallelization (full compute)
        - 0.5: Can parallelize 2x (half compute each)
        - 0.25: Can parallelize 4x (quarter compute each)
        - 0.1: Can parallelize 10x (tenth compute each)
        """
        task_type = self._detect_task_type(task)

        # Task types that parallelize well
        parallel_types = {
            TaskType.RESEARCH: 0.25,      # Can parallelize 4x
            TaskType.BRAINSTORMING: 0.1,  # Can parallelize 10x
            TaskType.TESTING: 0.25,       # Can parallelize 4x
            TaskType.DOCUMENTATION: 0.5,  # Can parallelize 2x
            TaskType.REVIEW: 0.5,          # Can parallelize 2x
        }

        # Task types that don't parallelize well
        sequential_types = {
            TaskType.PLANNING: 1.0,       # Needs coherence
            TaskType.IMPLEMENTATION: 1.0,  # Sequential steps
            TaskType.REFACTOR: 1.0,       # Careful analysis
        }

        if task_type in parallel_types:
            return parallel_types[task_type]
        elif task_type in sequential_types:
            return sequential_types[task_type]
        else:
            return 0.5  # Default: can parallelize 2x

    def analyze(self, task: ParsedTask) -> LogComputeScore:
        """Complete compute analysis with logarithmic scoring"""

        # Calculate magnitude
        magnitude = self.calculate_compute_magnitude(task)

        # Convert to log score (0-100)
        score = log_score(magnitude, min_val=1, max_val=10**7)

        # Determine compute tier
        compute_tier = self._score_to_compute_tier(score)

        # Estimate token budget
        token_budget = self._estimate_tokens_log(score)

        # Recommend model
        model = self._recommend_model(task)

        # Check parallelization
        should_parallelize = self._should_parallelize(task)

        return LogComputeScore(
            magnitude=magnitude,
            total_score=int(score),
            compute_tier=compute_tier,
            token_budget=token_budget,
            model_recommendation=model,
            should_parallelize=should_parallelize
        )

    def _score_to_compute_tier(self, score: float) -> str:
        """Convert score to compute tier"""
        if score < 20:
            return "minimal"
        elif score < 40:
            return "light"
        elif score < 60:
            return "moderate"
        elif score < 80:
            return "heavy"
        else:
            return "intensive"

    def _estimate_tokens_log(self, score: float) -> TokenBudget:
        """Estimate token budget using logarithmic scale"""
        import math

        # Base tokens: 1K
        # Each 20 points = 10x more tokens
        base = 1000
        exponent = score / 20

        estimated = int(base * (10 ** exponent))

        # Calculate tier
        if estimated < 5000:
            tier = "small"
            min_t, max_t = 500, 5000
        elif estimated < 50000:
            tier = "medium"
            min_t, max_t = 5000, 50000
        elif estimated < 500000:
            tier = "large"
            min_t, max_t = 50000, 500000
        else:
            tier = "xlarge"
            min_t, max_t = 500000, 5000000

        return TokenBudget(
            tier=tier,
            min=min_t,
            max=max_t,
            estimated=estimated
        )

    def _recommend_model(self, task: ParsedTask) -> str:
        """Recommend AI model based on task type and compute needs"""
        task_type = self._detect_task_type(task)

        model_map = {
            TaskType.RESEARCH: "claude-opus-4",
            TaskType.PLANNING: "claude-opus-4",
            TaskType.BRAINSTORMING: "claude-sonnet-4",
            TaskType.REFACTOR: "claude-sonnet-4",
            TaskType.IMPLEMENTATION: "claude-sonnet-4",
            TaskType.UI: "claude-sonnet-4",
            TaskType.TESTING: "claude-haiku-4",
            TaskType.DOCUMENTATION: "claude-haiku-4",
            TaskType.INFRASTRUCTURE: "claude-sonnet-4",
            TaskType.DATA: "claude-sonnet-4",
        }

        return model_map.get(task_type, "claude-sonnet-4")

    def _should_parallelize(self, task: ParsedTask) -> bool:
        """Determine if task should be parallelized"""
        factor = self._calculate_parallelization_factor(task)
        return factor < 1.0  # Any factor < 1.0 means we can parallelize


@dataclass
class LogComputeScore:
    """Logarithmic compute score"""
    magnitude: float          # Raw compute magnitude
    total_score: int          # Log₁₀ score (0-100)
    compute_tier: str         # "minimal", "light", "moderate", "heavy", "intensive"
    token_budget: TokenBudget # Estimated token needs
    model_recommendation: str # "claude-opus-4", "claude-sonnet-4", "claude-haiku-4"
    should_parallelize: bool  # Whether to parallelize
```

---

## Dimension 4: Speed Priority (Logarithmic)

### Scoring Bands

```python
class LogSpeedAnalyzer:
    """Speed priority analysis with logarithmic scoring"""

    def calculate_speed_magnitude(self, task: ParsedTask) -> float:
        """
        Calculate speed priority magnitude (urgency).

        This combines urgency, blocking status, and time sensitivity.
        """
        magnitude = 1.0

        # Urgency multiplier (1-10,000x)
        urgency_multiplier = self._calculate_urgency(task)
        magnitude *= urgency_multiplier

        # Blocking multiplier (1-1,000x)
        blocking_multiplier = self._calculate_blocking(task)
        magnitude *= blocking_multiplier

        # Time sensitivity multiplier (1-100x)
        time_multiplier = self._calculate_time_sensitivity(task)
        magnitude *= time_multiplier

        # Stakeholder pressure multiplier (1-10x)
        pressure_multiplier = self._calculate_stakeholder_pressure(task)
        magnitude *= pressure_multiplier

        return magnitude

    def _calculate_urgency(self, task: ParsedTask) -> float:
        """
        Urgency (logarithmic).

        Multipliers:
        - 1x: Low priority
        - 10x: Medium priority
        - 100x: High priority
        - 1,000x: Critical priority
        - 10,000x: Emergency (blocker, hotfix)
        """
        # Check priority field
        priority_map = {
            "low": 1,
            "medium": 10,
            "high": 100,
            "critical": 1000,
            "blocker": 10000,
            "urgent": 1000,
            "hotfix": 10000,
        }

        multiplier = float(priority_map.get(task.priority.lower(), 10))

        # Check for urgency keywords
        text = f"{task.title} {task.description}".lower()

        urgency_keywords = {
            # 10,000x
            "production-issue": 10000,
            "outage": 10000,
            "emergency": 10000,

            # 1,000x
            "asap": 1000,
            "immediate": 1000,
            "critical": 1000,

            # 100x
            "urgent": 100,
            "high-priority": 100,
        }

        for keyword, mult in urgency_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_blocking(self, task: ParsedTask) -> float:
        """
        Blocking status (logarithmic).

        Multipliers:
        - 1x: Not blocking anyone
        - 10x: Blocking 1-2 tasks
        - 100x: Blocking 3-5 tasks
        - 1,000x: Blocking 5+ tasks or critical path
        """
        blocks_count = len(task.blocks)

        if blocks_count == 0:
            return 1.0
        elif blocks_count <= 2:
            return 10.0
        elif blocks_count <= 5:
            return 100.0
        else:
            return 1000.0

    def _calculate_time_sensitivity(self, task: ParsedTask) -> float:
        """
        Time sensitivity (logarithmic).

        Multipliers:
        - 1x: No time constraint
        - 10x: Flexible deadline
        - 100x: Fixed deadline
        """
        text = f"{task.title} {task.description} {task.metadata}".lower()

        time_keywords = {
            # 100x
            "deadline": 100,
            "time-sensitive": 100,
            "launch": 100,
            "release": 100,

            # 10x
            "sprint": 10,
            "milestone": 10,
            "quarter": 10,
        }

        multiplier = 1.0
        for keyword, mult in time_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, mult)

        return float(multiplier)

    def _calculate_stakeholder_pressure(self, task: ParsedTask) -> float:
        """
        Stakeholder pressure (logarithmic).

        Multipliers:
        - 1x: No pressure
        - 10x: Some pressure
        - 100x: Executive attention
        """
        # Check metadata for stakeholder info
        metadata = task.metadata or {}

        if metadata.get("stakeholder") == "executive":
            return 100.0
        elif metadata.get("stakeholder"):
            return 10.0
        else:
            return 1.0

    def analyze(self, task: ParsedTask) -> LogSpeedScore:
        """Complete speed analysis with logarithmic scoring"""

        # Calculate magnitude
        magnitude = self.calculate_speed_magnitude(task)

        # Convert to log score (0-100)
        score = log_score(magnitude, min_val=1, max_val=10**6)

        # Determine speed tier
        speed_tier = self._score_to_speed_tier(score)

        # Determine priority level
        priority_level = self._get_priority_level(score)

        return LogSpeedScore(
            magnitude=magnitude,
            total_score=int(score),
            speed_tier=speed_tier,
            priority_level=priority_level
        )

    def _score_to_speed_tier(self, score: float) -> str:
        """Convert score to speed tier"""
        if score >= 80:
            return "immediate"
        elif score >= 60:
            return "fast"
        elif score >= 40:
            return "normal"
        else:
            return "eventual"

    def _get_priority_level(self, score: float) -> str:
        """Get priority level from score"""
        if score >= 80:
            return "critical"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "medium"
        else:
            return "low"


@dataclass
class LogSpeedScore:
    """Logarithmic speed score"""
    magnitude: float       # Raw urgency magnitude
    total_score: int       # Log₁₀ score (0-100)
    speed_tier: str        # "immediate", "fast", "normal", "eventual"
    priority_level: str    # "critical", "high", "medium", "low"
```

---

## Complete Logarithmic Task Analyzer

```python
class LogEnhancedTaskAnalyzer:
    """
    Complete multi-dimensional analyzer with logarithmic scales.

    All dimensions use log₁₀ scoring for natural task distribution.
    """

    def __init__(self):
        self.complexity_analyzer = LogComplexityAnalyzer()
        self.value_analyzer = LogValueAnalyzer()
        self.compute_analyzer = LogComputeAnalyzer()
        self.speed_analyzer = LogSpeedAnalyzer()
        self.type_analyzer = TaskTypeAnalyzer()

    def analyze(self, task: ParsedTask) -> LogTaskAnalysis:
        """Complete multi-dimensional analysis with log scales"""

        # Analyze all dimensions
        complexity = self.complexity_analyzer.analyze(task)
        value = self.value_analyzer.analyze(task)
        compute = self.compute_analyzer.analyze(task)
        speed = self.speed_analyzer.analyze(task)
        task_type = self.type_analyzer.detect_type(task)

        # Calculate ROI (Value / Complexity)
        roi = value.magnitude / complexity.magnitude

        # Generate routing recommendation
        routing = self._generate_routing(
            task, complexity, value, compute, speed, task_type, roi
        )

        return LogTaskAnalysis(
            task_id=task.id,
            title=task.title,

            # All dimensions (with magnitudes and log scores)
            complexity=complexity,
            value=value,
            compute=compute,
            speed=speed,
            task_type=task_type,

            # ROI
            roi=roi,

            # Routing
            routing=routing,

            # Overall assessment
            overall_assessment=self._generate_overall_assessment(
                complexity, value, compute, speed, task_type, roi
            )
        )

    def _generate_routing(
        self,
        task: ParsedTask,
        complexity: LogComplexityScore,
        value: LogValueScore,
        compute: LogComputeScore,
        speed: LogSpeedScore,
        task_type: TaskTypeResult,
        roi: float
    ) -> LogRoutingRecommendation:
        """Generate routing based on all dimensions"""

        # Determine workflow tier (based on complexity)
        workflow_tier = complexity.tier

        # Determine priority (based on speed + value)
        # Use geometric mean for log scales
        speed_factor = speed.magnitude / 10**3  # Normalize
        value_factor = value.magnitude / 10**6  # Normalize
        priority_magnitude = (speed_factor * value_factor) ** 0.5 * 10**4

        if priority_magnitude >= 10**3:  # Critical
            priority = "critical"
        elif priority_magnitude >= 10**2:  # High
            priority = "high"
        elif priority_magnitude >= 10:  # Medium
            priority = "medium"
        else:  # Low
            priority = "low"

        # Agent selection
        agent_map = {
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

        recommended_agent = agent_map.get(task_type.type, "generalist")

        # Generate execution plan
        execution_plan = self._generate_execution_plan(
            workflow_tier, task_type, compute
        )

        return LogRoutingRecommendation(
            workflow_tier=workflow_tier,
            priority=priority,
            recommended_agent=recommended_agent,
            recommended_model=compute.model_recommendation,
            token_budget=compute.token_budget,
            should_parallelize=compute.should_parallelize,
            execution_plan=execution_plan,
            estimated_hours=complexity.estimated_hours
        )

    def _generate_overall_assessment(
        self,
        complexity: LogComplexityScore,
        value: LogValueScore,
        compute: LogComputeScore,
        speed: LogSpeedScore,
        task_type: TaskTypeResult,
        roi: float
    ) -> str:
        """Generate overall assessment summary"""

        assessment = f"""
Task Assessment: {task_type.type.value.upper()}

Complexity: {complexity.band} (Band {complexity.total_score}/100)
  Magnitude: {complexity.magnitude:,.0f}x baseline
  Estimate: {complexity.estimated_hours[2]:.1f}h

Value: {value.value_tier.upper()} (Band {value.total_score}/100)
  Magnitude: {value.magnitude:,.0f}x baseline
  ROI: {roi:.2f}x (value/complexity)

Compute: {compute.compute_tier.upper()} (Band {compute.total_score}/100)
  Model: {compute.model_recommendation}
  Tokens: {compute.token_budget.estimated:,} ({compute.token_budget.tier})
  Parallelize: {compute.should_parallelize}

Speed: {speed.speed_tier.upper()} (Band {speed.total_score}/100)
  Priority: {speed.priority_level.upper()}
  Magnitude: {speed.magnitude:,.0f}x baseline

Routing: Tier {complexity.tier} workflow, {speed.priority_level} priority
        """.strip()

        return assessment


@dataclass
class LogTaskAnalysis:
    """Complete task analysis with logarithmic scales"""
    task_id: str
    title: str

    # All dimensions with magnitudes
    complexity: LogComplexityScore
    value: LogValueScore
    compute: LogComputeScore
    speed: LogSpeedScore
    task_type: TaskTypeResult

    # ROI
    roi: float

    # Routing
    routing: LogRoutingRecommendation

    # Overall
    overall_assessment: str


@dataclass
class LogRoutingRecommendation:
    """Routing recommendation with log-scale insights"""
    workflow_tier: int
    priority: str
    recommended_agent: str
    recommended_model: str
    token_budget: TokenBudget
    should_parallelize: bool
    execution_plan: ExecutionPlan
    estimated_hours: tuple[int, int, float]
```

---

## Example Output

### Before (Linear)
```
Task: "Add login button"
Complexity: 45/100 (moderate)
Value: 55/100 (medium)
```

### After (Logarithmic)
```
Task: "Add login button"

Complexity: SIMPLE (25/100)
  Magnitude: 316x baseline
  Estimate: 1.6h

Value: HIGH (65/100)
  Magnitude: 3,162,277x baseline
  ROI: 10,000x (excellent value!)

Compute: LIGHT (35/100)
  Model: claude-sonnet-4
  Tokens: 5,000 (medium)
  Parallelize: No

Speed: NORMAL (50/100)
  Priority: MEDIUM
  Magnitude: 100x baseline

Routing: Tier 2 workflow, MEDIUM priority
```

---

## Summary

**Log₁₀ scales provide:**
1. **Natural distribution** - Many simple tasks, few complex
2. **Better discrimination** - Clear separation at low end
3. **Unbounded upper range** - No ceiling
4. **Intuitive comparisons** - "100x more valuable"
5. **Multiplicative reasoning** - ROI = Value / Complexity

**Each 20-point band = 100x increase in magnitude**

This matches real-world task distributions and human perception of effort/difficulty.

**Ready to implement?**

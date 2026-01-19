"""
Task complexity analysis for BlackBox 5 routing system.

This module provides the TaskComplexityAnalyzer which analyzes tasks
to determine their complexity across multiple dimensions.
"""

import re
from typing import Dict, List, Set, Tuple
from .task_types import Task, ComplexityScore, AgentType


class TaskComplexityAnalyzer:
    """
    Analyzes task complexity to inform routing decisions.

    The analyzer evaluates tasks across multiple dimensions:
    - Token-based complexity (proxy for step count)
    - Tool requirements complexity
    - Domain-specific complexity
    - Aggregate complexity score

    Complexity scores are normalized to 0-1 range for easy comparison.
    """

    # Domain complexity weights (higher = more complex)
    DOMAIN_WEIGHTS = {
        'general': 0.3,
        'documentation': 0.4,
        'testing': 0.5,
        'development': 0.7,
        'architecture': 0.8,
        'research': 0.9,
        'integration': 0.85,
        'migration': 0.9,
    }

    # Tool complexity scores (higher = more complex)
    TOOL_COMPLEXITY = {
        # Basic tools
        'read': 0.2,
        'write': 0.3,
        'bash': 0.4,
        # Advanced tools
        'grep': 0.4,
        'find': 0.4,
        'git': 0.5,
        # Complex tools
        'mcp': 0.7,
        'database': 0.8,
        'api': 0.7,
        # Very complex
        'docker': 0.9,
        'kubernetes': 1.0,
    }

    # Keywords that indicate complexity
    COMPLEXITY_KEYWORDS = {
        'simple': -0.2,
        'basic': -0.1,
        'quick': -0.15,
        'update': -0.1,
        'fix': -0.1,
        'add': -0.05,
        'implement': 0.1,
        'refactor': 0.3,
        'integrate': 0.4,
        'migrate': 0.5,
        'architecture': 0.6,
        'system': 0.5,
        'complex': 0.7,
        'multi': 0.4,
        'orchestrate': 0.6,
        'coordinate': 0.5,
    }

    def __init__(
        self,
        domain_weights: Dict[str, float] = None,
        tool_complexity: Dict[str, float] = None
    ):
        """
        Initialize the complexity analyzer.

        Args:
            domain_weights: Custom domain complexity weights
            tool_complexity: Custom tool complexity scores
        """
        self.domain_weights = domain_weights or self.DOMAIN_WEIGHTS.copy()
        self.tool_complexity = tool_complexity or self.TOOL_COMPLEXITY.copy()

    def analyze(self, task: Task) -> ComplexityScore:
        """
        Analyze the complexity of a task.

        Args:
            task: The task to analyze

        Returns:
            ComplexityScore with detailed analysis
        """
        # 1. Token-based complexity
        token_count = task.estimate_token_count()
        token_complexity = self._analyze_token_complexity(token_count)

        # 2. Tool requirements complexity
        tool_complexity = self._analyze_tool_complexity(task)

        # 3. Domain complexity
        domain_complexity = self._analyze_domain_complexity(task)

        # 4. Step complexity (estimated from description and tools)
        step_complexity = self._estimate_step_complexity(task)

        # 5. Calculate aggregate score
        aggregate_score = self._calculate_aggregate_score(
            token_complexity=token_complexity,
            tool_complexity=tool_complexity,
            domain_complexity=domain_complexity,
            step_complexity=step_complexity
        )

        # 6. Calculate confidence
        confidence = self._calculate_confidence(task, aggregate_score)

        return ComplexityScore(
            token_count=token_count,
            tool_requirements=tool_complexity,
            domain_complexity=domain_complexity,
            step_complexity=step_complexity,
            aggregate_score=aggregate_score,
            confidence=confidence
        )

    def _analyze_token_complexity(self, token_count: int) -> float:
        """
        Analyze token-based complexity.

        Uses token count as a proxy for step count.
        Assumes ~500 tokens per step on average.

        Args:
            token_count: Estimated token count

        Returns:
            Token complexity score (0-1)
        """
        # Assume 500 tokens per step
        estimated_steps = token_count / 500

        # Normalize to 0-1
        # 1-3 steps: 0-0.3
        # 4-7 steps: 0.3-0.6
        # 8-12 steps: 0.6-0.8
        # 13+ steps: 0.8-1.0
        if estimated_steps <= 3:
            return min(0.3, estimated_steps / 10)
        elif estimated_steps <= 7:
            return 0.3 + ((estimated_steps - 3) / 4) * 0.3
        elif estimated_steps <= 12:
            return 0.6 + ((estimated_steps - 7) / 5) * 0.2
        else:
            return min(1.0, 0.8 + ((estimated_steps - 12) / 10) * 0.2)

    def _analyze_tool_complexity(self, task: Task) -> float:
        """
        Analyze tool requirements complexity.

        Considers both the number of tools and their individual complexity.

        Args:
            task: The task to analyze

        Returns:
            Tool complexity score (0-1)
        """
        if not task.tools_required:
            return 0.1  # Minimal complexity for no tools

        # Get complexity scores for each tool
        tool_scores = []
        for tool in task.tools_required:
            # Normalize tool name
            tool_lower = tool.lower()
            score = 0.3  # Default complexity

            # Check for partial matches
            for known_tool, known_score in self.tool_complexity.items():
                if known_tool in tool_lower or tool_lower in known_tool:
                    score = known_score
                    break

            tool_scores.append(score)

        # Average tool complexity
        avg_tool_complexity = sum(tool_scores) / len(tool_scores)

        # Adjust for number of tools (more tools = more complex)
        tool_count_factor = min(1.0, len(tool_scores) / 10)

        # Combine factors
        return (avg_tool_complexity * 0.7) + (tool_count_factor * 0.3)

    def _analyze_domain_complexity(self, task: Task) -> float:
        """
        Analyze domain-specific complexity.

        Args:
            task: The task to analyze

        Returns:
            Domain complexity score (0-1)
        """
        domain_lower = task.domain.lower()

        # Direct match
        if domain_lower in self.domain_weights:
            return self.domain_weights[domain_lower]

        # Partial match
        for domain, weight in self.domain_weights.items():
            if domain in domain_lower or domain_lower in domain:
                return weight

        # Check description for domain indicators
        description_lower = task.description.lower()
        domain_score = 0.5  # Default

        for domain, weight in self.domain_weights.items():
            if domain in description_lower:
                domain_score = max(domain_score, weight)

        return domain_score

    def _estimate_step_complexity(self, task: Task) -> int:
        """
        Estimate the number of execution steps required.

        Analyzes the task description and requirements to estimate
        how many distinct steps will be needed.

        Args:
            task: The task to analyze

        Returns:
            Estimated number of steps
        """
        steps = 1  # Base step

        # Count action verbs in description
        action_verbs = [
            'create', 'implement', 'add', 'update', 'fix', 'remove', 'delete',
            'refactor', 'migrate', 'integrate', 'test', 'deploy', 'configure',
            'analyze', 'research', 'design', 'build', 'setup', 'install'
        ]

        description_lower = task.description.lower()
        for verb in action_verbs:
            if verb in description_lower:
                steps += 1

        # Add steps for each file involved
        if task.files:
            steps += min(5, len(task.files) // 2)

        # Add steps for each requirement
        if task.requirements:
            steps += min(3, len(task.requirements) // 2)

        # Add steps for complex keywords
        complex_patterns = [
            (r'\bmultiple\b', 2),
            (r'\bseveral\b', 1),
            (r'\beach\b', 1),
            (r'\ball\b', 1),
            (r'\band\b', 0.5),
            (r'\bthen\b', 1),
            (r'\bafter\b', 1),
        ]

        for pattern, step_add in complex_patterns:
            matches = len(re.findall(pattern, description_lower))
            steps += min(matches * step_add, 3)

        return max(1, int(steps))

    def _calculate_aggregate_score(
        self,
        token_complexity: float,
        tool_complexity: float,
        domain_complexity: float,
        step_complexity: int
    ) -> float:
        """
        Calculate the aggregate complexity score.

        Combines all complexity dimensions into a single score.

        Args:
            token_complexity: Token-based complexity (0-1)
            tool_complexity: Tool requirements complexity (0-1)
            domain_complexity: Domain-specific complexity (0-1)
            step_complexity: Number of steps estimated

        Returns:
            Aggregate complexity score (0-1)
        """
        # Normalize step complexity to 0-1
        # Assume 20 steps is maximum for most tasks
        step_normalized = min(1.0, step_complexity / 20)

        # Weighted average of all factors
        # Weights: token (30%), tool (25%), domain (25%), steps (20%)
        aggregate = (
            token_complexity * 0.30 +
            tool_complexity * 0.25 +
            domain_complexity * 0.25 +
            step_normalized * 0.20
        )

        return min(1.0, max(0.0, aggregate))

    def _calculate_confidence(self, task: Task, aggregate_score: float) -> float:
        """
        Calculate confidence in the complexity analysis.

        Higher confidence when:
        - Clear description provided
        - Explicit requirements listed
        - Known tools specified
        - Known domain specified

        Args:
            task: The task that was analyzed
            aggregate_score: The calculated aggregate score

        Returns:
            Confidence score (0-1)
        """
        confidence = 0.5  # Base confidence

        # Description quality
        if len(task.description) > 50:
            confidence += 0.1
        if len(task.description) > 200:
            confidence += 0.1

        # Requirements provided
        if task.requirements:
            confidence += 0.1
        if len(task.requirements) >= 3:
            confidence += 0.1

        # Tools specified
        if task.tools_required:
            confidence += 0.1

        # Domain known
        if task.domain in self.domain_weights:
            confidence += 0.1

        # Files specified
        if task.files:
            confidence += 0.1

        return min(1.0, confidence)


class ComplexityThreshold:
    """
    Helper class for managing complexity thresholds.

    Provides predefined thresholds for different use cases.
    """

    @staticmethod
    def conservative() -> float:
        """
        Conservative threshold for preferring multi-agent.

        Returns:
            Threshold value (lower = more multi-agent routing)
        """
        return 0.4

    @staticmethod
    def balanced() -> float:
        """
        Balanced threshold for equal single/multi-agent usage.

        Returns:
            Threshold value
        """
        return 0.6

    @staticmethod
    def aggressive() -> float:
        """
        Aggressive threshold for preferring single-agent.

        Returns:
            Threshold value (higher = more single-agent routing)
        """
        return 0.8

    @staticmethod
    def from_steps(max_single_agent_steps: int) -> float:
        """
        Calculate threshold based on maximum steps for single-agent.

        Args:
            max_single_agent_steps: Maximum steps for single-agent routing

        Returns:
            Threshold value corresponding to the step limit
        """
        # Map steps to complexity score
        # Using the same normalization as in _analyze_token_complexity
        if max_single_agent_steps <= 3:
            return max_single_agent_steps / 10
        elif max_single_agent_steps <= 7:
            return 0.3 + ((max_single_agent_steps - 3) / 4) * 0.3
        elif max_single_agent_steps <= 12:
            return 0.6 + ((max_single_agent_steps - 7) / 5) * 0.2
        else:
            return min(1.0, 0.8 + ((max_single_agent_steps - 12) / 10) * 0.2)

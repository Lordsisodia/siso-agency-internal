"""
Enhanced Task Analyzer - Complete 5-dimensional analysis

Integrates all analyzers:
1. Complexity (6 sub-dimensions)
2. Value (5 sub-dimensions)
3. Compute Requirements (4 sub-dimensions)
4. Speed Priority (4 sub-dimensions)
5. Task Type (10 types)

Uses logarithmic scoring throughout for natural power-law distribution.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from .complexity_analyzer import LogComplexityAnalyzer
from .value_analyzer import LogValueAnalyzer
from .compute_analyzer import LogComputeAnalyzer
from .speed_analyzer import LogSpeedAnalyzer
from .task_type_detector import TaskTypeDetector, TaskType
from .utils import TokenBudget, ExecutionPlan


@dataclass
class LogTaskAnalysis:
    """Complete task analysis result"""
    # Core task info
    task_id: str
    task_title: str

    # 5-dimensional analysis
    complexity: Dict
    value: Dict
    compute: Dict
    speed: Dict
    task_type: Dict

    # Aggregated metrics
    roi_score: float  # Value magnitude / Complexity magnitude
    overall_priority: float  # Weighted combination of all dimensions

    # Recommendations
    recommended_tier: int  # 1-5 (which workflow tier)
    recommended_workflow: str  # Which workflow to use
    execution_plan: ExecutionPlan
    token_budget: TokenBudget


class LogEnhancedTaskAnalyzer:
    """
    Enhanced task analyzer with complete 5-dimensional analysis.

    Provides:
    - Comprehensive analysis across all dimensions
    - ROI calculation (value vs complexity)
    - Workflow tier recommendation (1-5)
    - Execution strategy (direct, sequential, parallel, phased)
    - Token budget estimation
    """

    def __init__(self):
        self.complexity_analyzer = LogComplexityAnalyzer()
        self.value_analyzer = LogValueAnalyzer()
        self.compute_analyzer = LogComputeAnalyzer()
        self.speed_analyzer = LogSpeedAnalyzer()
        self.type_detector = TaskTypeDetector()

    def analyze(self, task) -> LogTaskAnalysis:
        """
        Perform complete 5-dimensional analysis.

        Args:
            task: ParsedTask to analyze

        Returns:
            LogTaskAnalysis with complete analysis and recommendations
        """
        # Run all analyzers
        complexity = self.complexity_analyzer.analyze(task)
        value = self.value_analyzer.analyze(task)
        task_type = self.type_detector.detect(task)
        compute = self.compute_analyzer.analyze(task, complexity['overall_score'])
        speed = self.speed_analyzer.analyze(task)

        # Calculate ROI (value magnitude / complexity magnitude)
        roi_score = self._calculate_roi(value, complexity)

        # Calculate overall priority (weighted combination)
        overall_priority = self._calculate_priority(
            complexity, value, compute, speed, task_type
        )

        # Generate recommendations
        recommended_tier = self._recommend_tier(
            complexity['overall_score'],
            compute['overall_score'],
            task_type.confidence
        )

        recommended_workflow = self._recommend_workflow(
            task_type.type,
            complexity['tier'],
            speed['tier']
        )

        execution_plan = self._generate_execution_plan(
            task_type.type,
            complexity['tier'],
            speed['tier'],
            task.blocks,
            task.depends_on
        )

        token_budget = compute['token_budget']

        return LogTaskAnalysis(
            task_id=task.id,
            task_title=task.title,

            complexity=complexity,
            value=value,
            compute=compute,
            speed=speed,
            task_type={
                'type': task_type.type,
                'confidence': task_type.confidence,
                'all_scores': task_type.all_scores
            },

            roi_score=roi_score,
            overall_priority=overall_priority,

            recommended_tier=recommended_tier,
            recommended_workflow=recommended_workflow,
            execution_plan=execution_plan,
            token_budget=token_budget
        )

    def _calculate_roi(self, value: Dict, complexity: Dict) -> float:
        """
        Calculate ROI (Return on Investment).

        ROI = Value Magnitude / Complexity Magnitude

        Returns:
            float: ROI score (0-100, log₁₀ scale)
        """
        value_mag = value['overall_magnitude']
        complexity_mag = complexity['overall_magnitude']

        # Avoid division by zero
        if complexity_mag == 0:
            return 100.0 if value_mag > 0 else 0.0

        # ROI ratio
        roi_ratio = value_mag / complexity_mag

        # Convert to log score (0-100)
        # ROI < 0.1 = poor (score 0)
        # ROI = 1 = break-even (score 50)
        # ROI > 10 = excellent (score 100)
        from .utils import log_score
        roi_score = log_score(roi_ratio, min_val=0.1, max_val=10)

        return roi_score

    def _calculate_priority(
        self,
        complexity: Dict,
        value: Dict,
        compute: Dict,
        speed: Dict,
        task_type
    ) -> float:
        """
        Calculate overall priority score.

        Weights:
        - Value: 35% (most important)
        - Speed: 30% (urgency)
        - ROI: 20% (efficiency)
        - Complexity: 10% (inverted - simpler is better)
        - Type confidence: 5%
        """
        # Calculate ROI first
        roi = self._calculate_roi(value, complexity)

        # Weighted combination
        priority = (
            value['overall_score'] * 0.35 +
            speed['overall_score'] * 0.30 +
            roi * 0.20 +
            (100 - complexity['overall_score']) * 0.10 +
            task_type.confidence * 100 * 0.05
        )

        return priority

    def _recommend_tier(
        self,
        complexity_score: float,
        compute_score: float,
        type_confidence: float
    ) -> int:
        """
        Recommend workflow tier (1-5).

        Tier assignments:
        - Tier 1 (tiny): Simple, low compute, clear type
        - Tier 2 (small): Low complexity, low compute
        - Tier 3 (medium): Medium complexity, medium compute
        - Tier 4 (large): High complexity, high compute
        - Tier 5 (massive): Very high complexity, very high compute
        """
        # Combined score (70% complexity, 30% compute)
        combined = complexity_score * 0.7 + compute_score * 0.3

        # Adjust for type confidence (low confidence = higher tier for safety)
        if type_confidence < 0.5:
            combined = min(combined + 10, 100)

        if combined < 20:
            return 1
        elif combined < 40:
            return 2
        elif combined < 60:
            return 3
        elif combined < 80:
            return 4
        else:
            return 5

    def _recommend_workflow(
        self,
        task_type: str,
        complexity_tier: str,
        speed_tier: str
    ) -> str:
        """
        Recommend workflow based on task type, complexity, and speed.

        Workflow options:
        - atomic: Direct execution, single shot
        - sequential: Multi-step, ordered execution
        - parallel: Can be split and run in parallel
        - phased: Multiple phases with review points
        - collaborative: Requires human input/AI collaboration
        """
        # Task type mappings
        type_workflows = {
            'ui': 'atomic',
            'implementation': 'atomic',
            'testing': 'atomic',
            'documentation': 'atomic',
            'refactor': 'sequential',
            'data': 'sequential',
            'infrastructure': 'sequential',
            'research': 'collaborative',
            'planning': 'collaborative',
            'brainstorming': 'collaborative',
        }

        base_workflow = type_workflows.get(task_type, 'atomic')

        # Adjust based on complexity
        if complexity_tier in ['large', 'xlarge', 'massive']:
            if base_workflow == 'atomic':
                base_workflow = 'sequential'
            elif base_workflow == 'sequential':
                base_workflow = 'phased'

        # Adjust based on speed (urgent tasks need simpler workflows)
        if speed_tier in ['immediate', 'urgent']:
            if base_workflow in ['phased', 'collaborative']:
                base_workflow = 'sequential'

        return base_workflow

    def _generate_execution_plan(
        self,
        task_type: str,
        complexity_tier: str,
        speed_tier: str,
        blocks: List[str],
        depends_on: List[str]
    ) -> ExecutionPlan:
        """
        Generate execution plan with strategy and steps.

        Strategies:
        - direct: Execute immediately
        - sequential: Execute steps in order
        - parallel: Execute independent steps in parallel
        - phased: Execute in phases with reviews
        """
        # Determine strategy
        strategy = self._determine_strategy(
            task_type, complexity_tier, speed_tier, blocks, depends_on
        )

        # Generate steps based on strategy
        steps = self._generate_steps(strategy, task_type, complexity_tier)

        # Estimate duration based on complexity and speed
        duration = self._estimate_duration(complexity_tier, speed_tier)

        return ExecutionPlan(
            strategy=strategy,
            steps=steps,
            estimated_duration_minutes=duration
        )

    def _determine_strategy(
        self,
        task_type: str,
        complexity_tier: str,
        speed_tier: str,
        blocks: List[str],
        depends_on: List[str]
    ) -> str:
        """Determine execution strategy"""
        # If has dependencies, must be sequential
        if depends_on or blocks:
            return 'sequential'

        # If urgent, use direct or sequential
        if speed_tier in ['immediate', 'urgent']:
            return 'direct' if complexity_tier in ['tiny', 'small'] else 'sequential'

        # If collaborative task type, use phased
        if task_type in ['research', 'planning', 'brainstorming']:
            return 'phased'

        # If massive complexity, use phased
        if complexity_tier in ['xlarge', 'massive']:
            return 'phased'

        # Default to direct for simple tasks
        if complexity_tier in ['tiny', 'small', 'medium']:
            return 'direct'

        return 'sequential'

    def _generate_steps(self, strategy: str, task_type: str, complexity_tier: str) -> List[str]:
        """Generate execution steps based on strategy"""
        if strategy == 'direct':
            return [
                f"Analyze {task_type} task requirements",
                f"Execute {task_type} task",
                "Verify results"
            ]

        elif strategy == 'sequential':
            return [
                f"Analyze {task_type} task requirements",
                "Break down into sub-steps",
                "Execute each sub-step sequentially",
                "Verify intermediate results",
                "Final verification"
            ]

        elif strategy == 'parallel':
            return [
                "Identify independent sub-tasks",
                "Execute sub-tasks in parallel",
                "Aggregate results",
                "Final verification"
            ]

        elif strategy == 'phased':
            return [
                "Phase 1: Research and planning",
                "Phase 1 review",
                "Phase 2: Implementation",
                "Phase 2 review",
                "Phase 3: Verification and refinement",
                "Final review"
            ]

        return ["Execute task"]

    def _estimate_duration(self, complexity_tier: str, speed_tier: str) -> int:
        """
        Estimate execution duration in minutes.

        Base durations by complexity:
        - tiny: 5-15 min
        - small: 15-30 min
        - medium: 30-60 min
        - large: 60-120 min
        - xlarge: 120-240 min
        - massive: 240-480 min

        Adjusted by speed (urgent = faster)
        """
        base_durations = {
            'tiny': 10,
            'small': 20,
            'medium': 45,
            'large': 90,
            'xlarge': 180,
            'massive': 360
        }

        base = base_durations.get(complexity_tier, 45)

        # Speed multiplier (urgent tasks get less time but higher priority)
        speed_multipliers = {
            'immediate': 0.5,
            'urgent': 0.7,
            'priority': 0.9,
            'standard': 1.0,
            'eventual': 1.2,
            'whenever': 1.5
        }

        multiplier = speed_multipliers.get(speed_tier, 1.0)

        return int(base * multiplier)

    def batch_analyze(self, tasks: List) -> List[LogTaskAnalysis]:
        """
        Analyze multiple tasks in batch.

        Args:
            tasks: List of ParsedTask objects

        Returns:
            List of LogTaskAnalysis objects
        """
        return [self.analyze(task) for task in tasks]

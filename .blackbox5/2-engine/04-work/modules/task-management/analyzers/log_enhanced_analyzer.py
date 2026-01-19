"""
Logarithmic Enhanced Task Analyzer - Integrated multi-dimensional analysis

Combines all analyzers:
- TaskTypeDetector: Determines task type (UI, Refactor, Research, etc.)
- LogComplexityAnalyzer: Analyzes complexity (6 sub-dimensions)
- LogValueAnalyzer: Analyzes business value (5 sub-dimensions)
- LogComputeAnalyzer: Estimates compute requirements (4 sub-dimensions)
- LogSpeedAnalyzer: Analyzes speed priority (4 sub-dimensions)

Provides:
- Complete task analysis
- ROI calculation (Value / Complexity)
- Workflow recommendation
- Resource allocation guidance
"""

from typing import Dict, Any
from .task_type_detector import TaskTypeDetector
from .log_complexity_analyzer import LogComplexityAnalyzer
from .log_value_analyzer import LogValueAnalyzer
from .log_compute_analyzer import LogComputeAnalyzer
from .log_speed_analyzer import LogSpeedAnalyzer
from .utils import log_score, TaskType


class LogEnhancedTaskAnalyzer:
    """Enhanced task analyzer with multi-dimensional logarithmic scoring"""

    def __init__(self):
        """Initialize all analyzers"""
        self.type_detector = TaskTypeDetector()
        self.complexity_analyzer = LogComplexityAnalyzer()
        self.value_analyzer = LogValueAnalyzer()

        # Pass dependencies
        self.compute_analyzer = LogComputeAnalyzer(
            complexity_analyzer=self.complexity_analyzer,
            type_detector=self.type_detector
        )
        self.speed_analyzer = LogSpeedAnalyzer(
            value_analyzer=self.value_analyzer
        )

    def analyze(self, task) -> Dict[str, Any]:
        """
        Perform complete enhanced task analysis.

        Args:
            task: Task object with title, description, content, and metadata

        Returns:
            Complete analysis dict with:
                - task_type: Task type detection result
                - complexity: Complexity analysis result
                - value: Value analysis result
                - compute: Compute requirements result
                - speed: Speed priority result
                - roi: ROI score (value_magnitude / complexity_magnitude)
                - recommended_workflow: Recommended workflow tier
                - overall_priority: Overall priority score (0-100)
        """
        # Step 1: Detect task type
        task_type_result = self.type_detector.detect(task)

        # Step 2: Analyze complexity
        complexity_result = self.complexity_analyzer.analyze(task)

        # Step 3: Analyze value
        value_result = self.value_analyzer.analyze(task)

        # Step 4: Analyze compute requirements (uses complexity and type)
        compute_result = self.compute_analyzer.analyze(
            task,
            complexity_result=complexity_result,
            type_result=task_type_result
        )

        # Step 5: Analyze speed priority (uses value)
        speed_result = self.speed_analyzer.analyze(
            task,
            value_result=value_result
        )

        # Step 6: Calculate ROI
        roi = self._calculate_roi(complexity_result, value_result)

        # Step 7: Recommend workflow
        recommended_workflow = self._recommend_workflow(
            complexity_result,
            value_result,
            compute_result,
            speed_result
        )

        # Step 8: Calculate overall priority
        overall_priority = self._calculate_overall_priority(
            complexity_result,
            value_result,
            speed_result,
            roi
        )

        return {
            "task_type": task_type_result,
            "complexity": complexity_result,
            "value": value_result,
            "compute": compute_result,
            "speed": speed_result,
            "roi": roi,
            "recommended_workflow": recommended_workflow,
            "overall_priority": overall_priority,
        }

    def _calculate_roi(self, complexity_result: Dict, value_result: Dict) -> Dict:
        """
        Calculate ROI (Return on Investment).

        ROI = Value Magnitude / Complexity Magnitude

        Higher is better - more value per unit of complexity.
        """
        complexity_magnitude = complexity_result['magnitude']
        value_magnitude = value_result['magnitude']

        # Avoid division by zero
        if complexity_magnitude <= 0:
            roi_magnitude = value_magnitude
        else:
            roi_magnitude = value_magnitude / complexity_magnitude

        # Convert to score (0-100)
        # ROI range: 0.0001 to 10,000 (10^-4 to 10^4)
        roi_score = log_score(roi_magnitude, min_val=10**-4, max_val=10**4)

        return {
            "magnitude": roi_magnitude,
            "score": roi_score,
            "interpretation": self._interpret_roi(roi_score),
        }

    def _interpret_roi(self, roi_score: float) -> str:
        """Interpret ROI score"""
        if roi_score >= 80:
            return "exceptional"
        elif roi_score >= 60:
            return "excellent"
        elif roi_score >= 40:
            return "good"
        elif roi_score >= 20:
            return "fair"
        else:
            return "poor"

    def _recommend_workflow(
        self,
        complexity_result: Dict,
        value_result: Dict,
        compute_result: Dict,
        speed_result: Dict
    ) -> Dict:
        """
        Recommend workflow tier based on all dimensions.

        Workflow tiers:
        - quick_fix: Very simple, low value, low urgency
        - simple: Simple complexity, moderate value/urgency
        - standard: Standard complexity and value
        - complex: High complexity, high value, may need planning
        - research: High uncertainty, needs investigation
        """
        complexity_score = complexity_result['score']
        value_score = value_result['score']
        speed_score = speed_result['score']
        compute_score = compute_result['score']
        model = compute_result['recommended_model']

        # Determine workflow tier
        if complexity_score < 20 and value_score < 30 and speed_score < 30:
            workflow = "quick_fix"
            description = "Quick fix - simple task, low value, low urgency"
        elif complexity_score < 40:
            workflow = "simple"
            description = "Simple task - straightforward implementation"
        elif complexity_score < 70:
            workflow = "standard"
            description = "Standard task - typical development work"
        elif compute_score > 80 or model == "opus":
            workflow = "complex"
            description = "Complex task - requires Opus, may need planning"
        else:
            workflow = "complex"
            description = "Complex task - high complexity, strategic importance"

        # Check for research needs
        if complexity_result.get('uncertainty_multiplier', 1) > 50:
            workflow = "research"
            description = "Research task - high uncertainty, investigation needed"

        return {
            "tier": workflow,
            "description": description,
            "recommended_model": model,
            "estimated_tokens": compute_result['token_estimate'],
            "parallelizable": compute_result['parallelization_factor'] > 0.7,
        }

    def _calculate_overall_priority(
        self,
        complexity_result: Dict,
        value_result: Dict,
        speed_result: Dict,
        roi: Dict
    ) -> Dict:
        """
        Calculate overall priority (0-100).

        Weighted formula:
        - Value: 40%
        - Speed: 30%
        - ROI: 20%
        - Complexity: -10% (higher complexity = slightly lower priority)

        This prioritizes:
        1. High value tasks
        2. Urgent tasks
        3. High ROI tasks
        4. Simpler tasks (slight preference)
        """
        value_score = value_result['score']
        speed_score = speed_result['score']
        roi_score = roi['score']
        complexity_score = complexity_result['score']

        # Weighted calculation
        priority = (
            value_score * 0.40 +      # Value matters most
            speed_score * 0.30 +      # Urgency important
            roi_score * 0.20 +        # ROI important
            (100 - complexity_score) * 0.10  # Slight preference for simpler tasks
        )

        # Ensure within bounds
        priority = max(0, min(100, priority))

        return {
            "score": priority,
            "interpretation": self._interpret_priority(priority),
        }

    def _interpret_priority(self, priority_score: float) -> str:
        """Interpret priority score"""
        if priority_score >= 80:
            return "critical"
        elif priority_score >= 60:
            return "high"
        elif priority_score >= 40:
            return "medium"
        elif priority_score >= 20:
            return "low"
        else:
            return "backlog"

    def print_analysis(self, analysis: Dict[str, Any]):
        """
        Pretty print analysis results.

        Args:
            analysis: Result from analyze() method
        """
        print("\n" + "="*80)
        print("ENHANCED TASK ANALYSIS")
        print("="*80)

        # Task Type
        task_type = analysis['task_type']
        print(f"\n📋 TASK TYPE: {task_type.type.value.upper()}")
        print(f"   Confidence: {task_type.confidence:.1%}")

        # Complexity
        complexity = analysis['complexity']
        print(f"\n🔧 COMPLEXITY: {complexity['score']:.1f}/100")
        print(f"   Scope: {complexity['scope_multiplier']:.1f}x")
        print(f"   Technical: {complexity['technical_multiplier']:.1f}x")
        print(f"   Dependencies: {complexity['dependency_multiplier']:.1f}x")
        print(f"   Risk: {complexity['risk_multiplier']:.1f}x")
        print(f"   Uncertainty: {complexity['uncertainty_multiplier']:.1f}x")
        print(f"   Cross-Domain: {complexity['cross_domain_multiplier']:.1f}x")

        # Value
        value = analysis['value']
        print(f"\n💰 VALUE: {value['score']:.1f}/100")
        print(f"   Business: {value['business_multiplier']:.1f}x")
        print(f"   User: {value['user_multiplier']:.1f}x")
        print(f"   Strategic: {value['strategic_multiplier']:.1f}x")
        print(f"   Urgency: {value['urgency_multiplier']:.1f}x")
        print(f"   Impact: {value['impact_multiplier']:.1f}x")

        # Compute
        compute = analysis['compute']
        print(f"\n💻 COMPUTE: {compute['score']:.1f}/100")
        print(f"   Model: {compute['recommended_model'].upper()}")
        print(f"   Tokens: {compute['token_estimate']:,}")
        print(f"   Parallelization: {compute['parallelization_factor']:.0%}")

        # Speed
        speed = analysis['speed']
        print(f"\n⚡ SPEED: {speed['score']:.1f}/100")
        print(f"   Deadline: {speed['deadline_factor']:.1f}x")
        print(f"   Blocking: {speed['blocking_factor']:.1f}x")
        print(f"   Priority: {speed['priority_factor']:.1f}x")

        # ROI
        roi = analysis['roi']
        print(f"\n📈 ROI: {roi['score']:.1f}/100 ({roi['interpretation'].upper()})")
        print(f"   Value/Complexity: {roi['magnitude']:.2f}")

        # Workflow
        workflow = analysis['recommended_workflow']
        print(f"\n🚀 WORKFLOW: {workflow['tier'].upper()}")
        print(f"   {workflow['description']}")

        # Overall Priority
        priority = analysis['overall_priority']
        print(f"\n🎯 OVERALL PRIORITY: {priority['score']:.1f}/100 ({priority['interpretation'].upper()})")

        print("\n" + "="*80 + "\n")

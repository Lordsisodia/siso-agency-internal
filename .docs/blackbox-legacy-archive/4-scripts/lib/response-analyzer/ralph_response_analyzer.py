#!/usr/bin/env python3
"""
Ralph Response Analyzer - Specialized analyzer for Ralph autonomous agent

This module provides Ralph-specific analysis capabilities for understanding
and evaluating autonomous agent behavior and output.
"""

from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import re

from .response_analyzer import ResponseAnalyzer, AnalysisResult
from .pattern_matcher import PatternMatcher
from .quality_scorer import QualityScorer
from .expectation_validator import ExpectationValidator


@dataclass
class RalphAnalysisResult:
    """Extended analysis result for Ralph agent"""
    base_result: AnalysisResult
    task_completion: float
    confusion_level: float
    confidence_score: float
    recommended_action: str
    reasoning: List[str] = field(default_factory=list)
    next_step_suggestions: List[str] = field(default_factory=list)
    intervention_needed: bool = False
    intervention_reason: str = ""


class RalphResponseAnalyzer:
    """
    Specialized response analyzer for Ralph autonomous agent.

    Analyzes Ralph's autonomous decision-making, task completion status,
    and provides actionable recommendations for runtime control.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize Ralph-specific analyzer.

        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}

        # Initialize components
        self.base_analyzer = ResponseAnalyzer(config)
        self.pattern_matcher = PatternMatcher(config)
        self.quality_scorer = QualityScorer(config)
        self.expectation_validator = ExpectationValidator(config)

        # Ralph-specific thresholds
        self.min_task_completion = self.config.get('min_task_completion', 0.7)
        self.max_confusion_threshold = self.config.get('max_confusion_threshold', 0.4)
        self.min_autonomy_confidence = self.config.get('min_autonomy_confidence', 0.6)

        # Analysis history for trend tracking
        self.analysis_history: List[Dict[str, Any]] = []

    def analyze_agent_output(self,
                            agent_response: str,
                            task_expectation: Optional[Dict[str, Any]] = None,
                            context: Optional[Dict[str, Any]] = None) -> RalphAnalysisResult:
        """
        Analyze autonomous agent output comprehensively.

        Args:
            agent_response: The agent's response
            task_expectation: Expected task outcome
            context: Execution context

        Returns:
            RalphAnalysisResult with comprehensive analysis
        """
        # Base analysis
        base_result = self.base_analyzer.analyze(agent_response, context)

        # Ralph-specific analysis
        task_completion = self.check_task_completion(agent_response, task_expectation)
        confusion_level = self.detect_confusion(agent_response)
        confidence_score = self.assess_confidence(agent_response, base_result)

        # Generate recommendations
        recommended_action = self.recommend_action(
            task_completion,
            confusion_level,
            confidence_score,
            base_result
        )

        # Determine intervention needs
        intervention_needed, intervention_reason = self._assess_intervention_need(
            task_completion,
            confusion_level,
            confidence_score,
            base_result
        )

        # Generate reasoning and suggestions
        reasoning = self._generate_reasoning(
            base_result,
            task_completion,
            confusion_level,
            confidence_score
        )

        next_step_suggestions = self._generate_next_steps(
            agent_response,
            task_completion,
            confusion_level,
            context or {}
        )

        result = RalphAnalysisResult(
            base_result=base_result,
            task_completion=task_completion,
            confusion_level=confusion_level,
            confidence_score=confidence_score,
            recommended_action=recommended_action,
            reasoning=reasoning,
            next_step_suggestions=next_step_suggestions,
            intervention_needed=intervention_needed,
            intervention_reason=intervention_reason
        )

        # Store in history
        self._store_analysis(result, context)

        return result

    def check_task_completion(self,
                             response: str,
                             expectation: Optional[Dict[str, Any]] = None) -> float:
        """
        Verify task completion level.

        Args:
            response: Agent response
            expectation: Task expectation

        Returns:
            Completion score from 0.0 to 1.0
        """
        completion_score = 0.5  # Base score

        # Check for completion indicators
        completion_indicators = [
            'completed',
            'finished',
            'done',
            'implemented',
            'deployed',
            'tested',
            'verified',
        ]

        found_indicators = sum(1 for indicator in completion_indicators
                              if indicator in response.lower())
        completion_score += min(found_indicators * 0.1, 0.3)

        # Check for explicit completion statements
        if re.search(r'(?:task|goal|objective)\s+(?:has been|was|is)\s+(?:completed|finished|achieved)',
                    response, re.IGNORECASE):
            completion_score += 0.2

        # Check against expectation if provided
        if expectation:
            matches, _ = self.expectation_validator.validate_output(
                response, expectation
            )
            if matches:
                completion_score += 0.2
            else:
                completion_score -= 0.2

        # Check for incomplete indicators
        incomplete_indicators = [
            'in progress',
            'partially',
            'not yet',
            'still working',
            'to do',
            'remaining',
        ]

        found_incomplete = sum(1 for indicator in incomplete_indicators
                              if indicator in response.lower())
        completion_score -= min(found_incomplete * 0.15, 0.3)

        return max(0.0, min(1.0, completion_score))

    def detect_confusion(self, response: str) -> float:
        """
        Detect agent confusion or uncertainty.

        Args:
            response: Agent response

        Returns:
            Confusion level from 0.0 (clear) to 1.0 (confused)
        """
        confusion_score = 0.0

        # Use pattern matcher
        confusion_patterns = self.pattern_matcher.confusion_patterns
        for pattern in confusion_patterns:
            if re.search(pattern, response, re.IGNORECASE):
                confusion_score += 0.15

        # Check for ambiguity markers
        ambiguous_phrases = [
            r'(?:perhaps|maybe|possibly|might|could be)',
            r'(?:unclear|unsure|not certain|confused)',
            r'(?:need more|require additional|missing information)',
            r'(?:not sure how to|uncertain about)',
        ]

        for phrase in ambiguous_phrases:
            if re.search(phrase, response, re.IGNORECASE):
                confusion_score += 0.1

        # Check for conflicting statements
        if self._has_conflicts(response):
            confusion_score += 0.2

        # Check for excessive hedging
        hedge_count = response.lower().count('maybe') + response.lower().count('possibly')
        confusion_score += min(hedge_count * 0.05, 0.15)

        return max(0.0, min(1.0, confusion_score))

    def assess_confidence(self,
                         response: str,
                         base_result: AnalysisResult) -> float:
        """
        Assess response confidence.

        Args:
            response: Agent response
            base_result: Base analysis result

        Returns:
            Confidence score from 0.0 to 1.0
        """
        confidence = base_result.confidence

        # Check for confident language
        confident_phrases = [
            r'(?:definitely|certainly|absolutely|surely)',
            r'(?:confident|clear|certain)',
            r'(?:will do|can do|able to)',
        ]

        for phrase in confident_phrases:
            if re.search(phrase, response, re.IGNORECASE):
                confidence += 0.05

        # Check for definitive action statements
        if re.search(r'(?:I will|I am|I have)\s+(?:going to|will|created|implemented)',
                    response, re.IGNORECASE):
            confidence += 0.1

        # Check for concrete outcomes
        if base_result.extracted_info.get('file_paths'):
            confidence += 0.05
        if base_result.extracted_info.get('code_blocks'):
            confidence += 0.05

        # Reduce confidence for questions
        if '?' in response:
            confidence -= 0.1

        return max(0.0, min(1.0, confidence))

    def recommend_action(self,
                        task_completion: float,
                        confusion_level: float,
                        confidence: float,
                        base_result: AnalysisResult) -> str:
        """
        Recommend next action for runtime control.

        Args:
            task_completion: Task completion score
            confusion_level: Confusion level
            confidence: Confidence score
            base_result: Base analysis result

        Returns:
            Recommended action string
        """
        # High completion, low confusion, high confidence -> Continue
        if (task_completion >= self.min_task_completion and
            confusion_level < self.max_confusion_threshold and
            confidence >= self.min_autonomy_confidence):
            return "CONTINUE"

        # High confusion or low confidence -> Pause for review
        if (confusion_level > self.max_confusion_threshold or
            confidence < self.min_autonomy_confidence):
            if base_result.errors:
                return "ERROR_RECOVERY"
            else:
                return "PAUSE_FOR_REVIEW"

        # Low completion -> Check if stuck
        if task_completion < self.min_task_completion:
            if confusion_level > 0.5:
                return "REQUEST_GUIDANCE"
            else:
                return "CONTINUE"

        # Default -> Continue with caution
        return "CONTINUE_WITH_CAUTION"

    def _assess_intervention_need(self,
                                  task_completion: float,
                                  confusion_level: float,
                                  confidence: float,
                                  base_result: AnalysisResult) -> Tuple[bool, str]:
        """Assess if human intervention is needed"""
        reasons = []

        if task_completion < 0.3:
            reasons.append("Very low task completion")

        if confusion_level > 0.7:
            reasons.append("High confusion detected")

        if confidence < 0.3:
            reasons.append("Very low confidence")

        if len(base_result.errors) > 3:
            reasons.append("Multiple errors detected")

        if base_result.quality_score < 0.3:
            reasons.append("Poor response quality")

        return (len(reasons) > 0, "; ".join(reasons)) if reasons else (False, "")

    def _generate_reasoning(self,
                           base_result: AnalysisResult,
                           task_completion: float,
                           confusion_level: float,
                           confidence: float) -> List[str]:
        """Generate reasoning for the analysis"""
        reasoning = []

        if task_completion >= self.min_task_completion:
            reasoning.append(f"Task completion acceptable ({task_completion:.2%})")
        else:
            reasoning.append(f"Task completion below threshold ({task_completion:.2%})")

        if confusion_level < self.max_confusion_threshold:
            reasoning.append(f"Agent appears clear on direction (confusion: {confusion_level:.2%})")
        else:
            reasoning.append(f"Agent shows confusion (confusion: {confusion_level:.2%})")

        if confidence >= self.min_autonomy_confidence:
            reasoning.append(f"High confidence in actions ({confidence:.2%})")
        else:
            reasoning.append(f"Low confidence requires attention ({confidence:.2%})")

        if base_result.quality_score >= 0.7:
            reasoning.append("Response quality is good")
        else:
            reasoning.append("Response quality needs improvement")

        return reasoning

    def _generate_next_steps(self,
                            response: str,
                            task_completion: float,
                            confusion_level: float,
                            context: Dict[str, Any]) -> List[str]:
        """Generate next step suggestions"""
        steps = []

        # Extract next steps from response
        next_step_pattern = r'(?:next step|following|then|after this)[:\s]+([^.]+)'
        matches = re.findall(next_step_pattern, response, re.IGNORECASE)
        steps.extend(matches[:3])

        # Suggest steps based on completion
        if task_completion < 0.5:
            steps.append("Continue working on current task")
        elif task_completion < 1.0:
            steps.append("Complete remaining task components")

        # Suggest steps based on confusion
        if confusion_level > 0.5:
            steps.append("Clarify unclear requirements")
            steps.append("Request guidance on ambiguous points")

        return steps

    def _has_conflicts(self, response: str) -> bool:
        """Check for conflicting statements"""
        # Look for contradictory patterns
        conflict_patterns = [
            (r'(?:will|shall|going to)\s+\w+', r'(?:won\'t|will not|cannot)'),
            (r'(?:yes|correct|true)', r'(?:no|incorrect|false)'),
            (r'(?:implemented|added|created)', r'(?:removed|deleted|not implemented)'),
        ]

        for pos_pattern, neg_pattern in conflict_patterns:
            if (re.search(pos_pattern, response, re.IGNORECASE) and
                re.search(neg_pattern, response, re.IGNORECASE)):
                return True

        return False

    def _store_analysis(self, result: RalphAnalysisResult, context: Optional[Dict[str, Any]]):
        """Store analysis in history"""
        entry = {
            'timestamp': datetime.now().isoformat(),
            'task_completion': result.task_completion,
            'confusion_level': result.confusion_level,
            'confidence_score': result.confidence_score,
            'recommended_action': result.recommended_action,
            'intervention_needed': result.intervention_needed,
            'quality_score': result.base_result.quality_score,
            'context': context or {}
        }

        self.analysis_history.append(entry)

    def get_trend_analysis(self, window: int = 10) -> Dict[str, Any]:
        """
        Get trend analysis over recent analyses.

        Args:
            window: Number of recent analyses to consider

        Returns:
            Trend analysis dictionary
        """
        if len(self.analysis_history) < 2:
            return {'message': 'Insufficient data for trend analysis'}

        recent = self.analysis_history[-window:]

        return {
            'window_size': len(recent),
            'avg_completion': sum(r['task_completion'] for r in recent) / len(recent),
            'avg_confusion': sum(r['confusion_level'] for r in recent) / len(recent),
            'avg_confidence': sum(r['confidence_score'] for r in recent) / len(recent),
            'completion_trend': self._calculate_trend([r['task_completion'] for r in recent]),
            'confusion_trend': self._calculate_trend([r['confusion_level'] for r in recent]),
            'confidence_trend': self._calculate_trend([r['confidence_score'] for r in recent]),
            'intervention_rate': sum(1 for r in recent if r['intervention_needed']) / len(recent),
        }

    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction"""
        if len(values) < 2:
            return "unknown"

        first_half = sum(values[:len(values)//2]) / (len(values)//2 or 1)
        second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2 or 1)

        diff = second_half - first_half

        if abs(diff) < 0.05:
            return "stable"
        elif diff > 0:
            return "improving"
        else:
            return "declining"

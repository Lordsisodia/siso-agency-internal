"""
Response Analyzer System for Ralph Runtime

A comprehensive response analysis system for evaluating autonomous agent
outputs, detecting patterns, scoring quality, and validating against
expectations.

Components:
- ResponseAnalyzer: Core analysis functionality
- RalphResponseAnalyzer: Ralph-specific analysis
- QualityScorer: Multi-dimensional quality scoring
- PatternMatcher: Pattern detection and matching
- ExpectationValidator: Validation against expectations

Example usage:
    from response_analyzer import RalphResponseAnalyzer

    analyzer = RalphResponseAnalyzer()
    result = analyzer.analyze_agent_output(
        agent_response=response,
        task_expectation=expectation,
        context=context
    )

    if result.intervention_needed:
        handle_intervention(result)
"""

from .response_analyzer import ResponseAnalyzer, AnalysisResult
from .ralph_response_analyzer import RalphResponseAnalyzer, RalphAnalysisResult
from .quality_scorer import QualityScorer, QualityScores
from .pattern_matcher import PatternMatcher, PatternMatch
from .expectation_validator import ExpectationValidator, ValidationResult, Expectation

__version__ = '1.0.0'

__all__ = [
    # Core analyzer
    'ResponseAnalyzer',
    'AnalysisResult',

    # Ralph-specific
    'RalphResponseAnalyzer',
    'RalphAnalysisResult',

    # Quality scoring
    'QualityScorer',
    'QualityScores',

    # Pattern matching
    'PatternMatcher',
    'PatternMatch',

    # Expectation validation
    'ExpectationValidator',
    'ValidationResult',
    'Expectation',
]

# Convenience function for quick analysis
def analyze_response(response: str,
                    expectation: Optional[dict] = None,
                    context: Optional[dict] = None) -> RalphAnalysisResult:
    """
    Quick analysis function for agent responses.

    Args:
        response: The agent response to analyze
        expectation: Optional task expectation
        context: Optional execution context

    Returns:
        RalphAnalysisResult with comprehensive analysis
    """
    analyzer = RalphResponseAnalyzer()
    return analyzer.analyze_agent_output(response, expectation, context)


def score_quality(response: str,
                 query: Optional[str] = None) -> QualityScores:
    """
    Quick quality scoring function.

    Args:
        response: The response to score
        query: Optional original query

    Returns:
        QualityScores object
    """
    scorer = QualityScorer()
    return scorer.score_response(response, query)


def match_patterns(text: str) -> dict:
    """
    Quick pattern matching function.

    Args:
        text: The text to analyze

    Returns:
        Dictionary of pattern matches by type
    """
    matcher = PatternMatcher()
    return matcher.match_all_patterns(text)

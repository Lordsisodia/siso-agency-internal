#!/usr/bin/env python3
"""
Example usage of the Response Analyzer System for Ralph Runtime

This script demonstrates the key features and integration points of the
response analyzer system.
"""

import sys
import os

# Ensure we can import from the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import modules directly (avoiding package name conflict)
import response_analyzer as ra_module
import ralph_response_analyzer as rra_module
import quality_scorer as qs_module
import pattern_matcher as pm_module
import expectation_validator as ev_module

# Import classes from the modules
ResponseAnalyzer = ra_module.ResponseAnalyzer
AnalysisResult = ra_module.AnalysisResult
RalphResponseAnalyzer = rra_module.RalphResponseAnalyzer
RalphAnalysisResult = rra_module.RalphAnalysisResult
QualityScorer = qs_module.QualityScorer
QualityScores = qs_module.QualityScores
PatternMatcher = pm_module.PatternMatcher
PatternMatch = pm_module.PatternMatch
ExpectationValidator = ev_module.ExpectationValidator
Expectation = ev_module.Expectation


def example_basic_analysis():
    """Example: Basic response analysis"""
    print("=" * 60)
    print("Example 1: Basic Response Analysis")
    print("=" * 60)

    analyzer = ResponseAnalyzer()

    response = """
    I have successfully implemented the user authentication feature.
    The implementation includes:
    - Login endpoint: /api/auth/login
    - Registration endpoint: /api/auth/register
    - Password reset functionality

    All tests are passing and the feature is ready for deployment.
    Code is in auth.py and tests are in test_auth.py
    """

    result = analyzer.analyze(response)

    print(f"Quality Score: {result.quality_score:.2%}")
    print(f"Confidence: {result.confidence:.2%}")
    print(f"Valid: {result.is_valid}")
    print(f"Errors: {len(result.errors)}")
    print(f"File paths detected: {result.extracted_info['file_paths']}")
    print()


def example_ralph_analysis():
    """Example: Ralph-specific analysis"""
    print("=" * 60)
    print("Example 2: Ralph Response Analysis")
    print("=" * 60)

    analyzer = RalphResponseAnalyzer()

    response = """
    I'm working on implementing the payment processing feature.
    I've created the payment module in payment/processor.py
    The integration with Stripe is mostly complete.
    I'm not entirely sure about the webhook handling part though.
    Maybe I should clarify the requirements for idempotency.
    """

    expectation = {
        'required_keywords': ['implemented', 'tested', 'deployed'],
        'min_length': 100
    }

    result = analyzer.analyze_agent_output(response, expectation)

    print(f"Task Completion: {result.task_completion:.2%}")
    print(f"Confusion Level: {result.confusion_level:.2%}")
    print(f"Confidence Score: {result.confidence_score:.2%}")
    print(f"Recommended Action: {result.recommended_action}")
    print(f"Intervention Needed: {result.intervention_needed}")
    print()
    print("Reasoning:")
    for reason in result.reasoning:
        print(f"  - {reason}")
    print()


def example_quality_scoring():
    """Example: Quality scoring across dimensions"""
    print("=" * 60)
    print("Example 3: Quality Scoring")
    print("=" * 60)

    scorer = QualityScorer()

    response = """
    To implement the caching layer, I used Redis with the following approach:

    ```python
    import redis
    cache = redis.Redis(host='localhost', port=6379)

    def get_cached_data(key):
        data = cache.get(key)
        if data is None:
            data = fetch_from_database(key)
            cache.set(key, data, ex=3600)
        return data
    ```

    This implementation provides:
    1. Fast data retrieval
    2. Automatic expiration
    3. Fallback to database
    """

    scores = scorer.score_response(
        response,
        query="How to implement caching?",
        expected_elements=['code', 'explanation', 'example']
    )

    print(scorer.get_quality_breakdown(scores))
    print()


def example_pattern_matching():
    """Example: Pattern matching"""
    print("=" * 60)
    print("Example 4: Pattern Matching")
    print("=" * 60)

    matcher = PatternMatcher()

    # Success response
    success_response = """
    The deployment was successful!
    All tests passed and the application is live.
    Build succeeded in 2.5 minutes.
    """

    # Error response
    error_response = """
    Error: Failed to connect to database
    Exception: Connection timeout after 30s
    Unable to establish connection
    """

    # Confused response
    confused_response = """
    I'm not sure how to proceed with this.
    The requirements are unclear.
    Maybe we need more information about the expected behavior.
    """

    for label, response in [
        ("Success", success_response),
        ("Error", error_response),
        ("Confused", confused_response),
    ]:
        print(f"{label} Response:")
        sentiment = matcher.analyze_sentiment(response)
        counts = matcher.count_patterns(response)
        print(f"  Sentiment: {sentiment['sentiment']} ({sentiment['confidence']:.2%})")
        print(f"  Success: {counts['success']}, Error: {counts['error']}, "
              f"Confusion: {counts['confusion']}")
        print()


def example_expectation_validation():
    """Example: Expectation validation"""
    print("=" * 60)
    print("Example 5: Expectation Validation")
    print("=" * 60)

    validator = ExpectationValidator()

    response = """
    I've successfully implemented the API endpoint for user management.
    The code is well-structured and includes proper error handling.
    All tests are passing.
    Ready for code review.
    """

    expectation = validator.create_expectation(
        required_keywords=['implemented', 'tested'],
        required_patterns=[r'endpoint'],
        excluded_keywords=['TODO', 'FIXME'],
        min_length=100,
        required_structure=[]
    )

    result = validator.validate_comprehensive(response, expectation)

    print(f"Valid: {result.is_valid}")
    print(f"Compliance Score: {result.compliance_score:.2%}")
    print(f"Satisfied Requirements: {len(result.satisfied_requirements)}")
    print(f"Unsatisfied Requirements: {len(result.unsatisfied_requirements)}")
    print(f"Violations: {len(result.violations)}")

    if result.violations:
        print("\nViolations:")
        for violation in result.violations:
            print(f"  - {violation}")
    print()


def example_circuit_breaker_integration():
    """Example: Circuit breaker integration"""
    print("=" * 60)
    print("Example 6: Circuit Breaker Integration")
    print("=" * 60)

    analyzer = RalphResponseAnalyzer()

    def simulate_circuit_breaker(response, task_context):
        """Simulate circuit breaker logic"""
        result = analyzer.analyze_agent_output(
            response,
            task_context.get('expectation'),
            task_context
        )

        if result.base_result.quality_score < 0.3:
            return "OPEN", "Poor response quality", result
        elif result.confusion_level > 0.7:
            return "OPEN", "High agent confusion", result
        elif result.recommended_action == "ERROR_RECOVERY":
            return "OPEN", "Error recovery needed", result
        else:
            return "CLOSED", "Normal operation", result

    # Test cases
    test_cases = [
        (
            "Good response",
            "Successfully implemented the feature with all tests passing.",
            {'task': 'implementation', 'expectation': {}}
        ),
        (
            "Poor quality",
            "ok done",  # Too short
            {'task': 'implementation', 'expectation': {}}
        ),
        (
            "High confusion",
            "I'm not sure what to do. The requirements are unclear. Maybe we need more info?",
            {'task': 'planning', 'expectation': {}}
        ),
    ]

    for label, response, context in test_cases:
        state, reason, result = simulate_circuit_breaker(response, context)
        print(f"{label}:")
        print(f"  Circuit Breaker: {state}")
        print(f"  Reason: {reason}")
        print(f"  Quality: {result.base_result.quality_score:.2%}")
        print(f"  Confusion: {result.confusion_level:.2%}")
        print()


def example_trend_analysis():
    """Example: Trend analysis over time"""
    print("=" * 60)
    print("Example 7: Trend Analysis")
    print("=" * 60)

    analyzer = RalphResponseAnalyzer()

    # Simulate multiple analyses
    responses = [
        "Making progress on the task...",
        "Still working, almost there...",
        "Completed the first phase.",
        "Moving to second phase.",
        "Making good progress.",
        "Some confusion about requirements.",
        "Clarified requirements, continuing.",
        "Nearly complete.",
        "Final testing in progress.",
        "Task completed successfully!",
    ]

    for i, response in enumerate(responses):
        analyzer.analyze_agent_output(
            response,
            {'min_length': 10},
            {'iteration': i + 1}
        )

    trends = analyzer.get_trend_analysis(window=10)

    print("Trend Analysis (last 10 analyses):")
    print(f"  Average Completion: {trends['avg_completion']:.2%}")
    print(f"  Average Confusion: {trends['avg_confusion']:.2%}")
    print(f"  Average Confidence: {trends['avg_confidence']:.2%}")
    print(f"  Completion Trend: {trends['completion_trend']}")
    print(f"  Confusion Trend: {trends['confusion_trend']}")
    print(f"  Confidence Trend: {trends['confidence_trend']}")
    print(f"  Intervention Rate: {trends['intervention_rate']:.2%}")
    print()


def main():
    """Run all examples"""
    print("\n" + "=" * 60)
    print("Response Analyzer System - Usage Examples")
    print("For Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 60 + "\n")

    examples = [
        example_basic_analysis,
        example_ralph_analysis,
        example_quality_scoring,
        example_pattern_matching,
        example_expectation_validation,
        example_circuit_breaker_integration,
        example_trend_analysis,
    ]

    for example in examples:
        try:
            example()
        except Exception as e:
            print(f"Error running {example.__name__}: {e}")
            import traceback
            traceback.print_exc()
            print()

    print("=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()

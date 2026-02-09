# Response Analyzer System

Comprehensive response analysis system for Ralph Runtime, enabling real-time evaluation of autonomous agent outputs with pattern detection, quality scoring, and expectation validation.

## Overview

The Response Analyzer System provides Ralph Runtime with the ability to understand and evaluate autonomous agent responses in real-time. It detects patterns indicating success, error, confusion, or completion, scores response quality across multiple dimensions, and validates outputs against expectations.

## Components

### 1. ResponseAnalyzer (`response_analyzer.py`)

Core analysis functionality that evaluates agent responses for quality, errors, and key information.

**Key Features:**
- Real-time response analysis
- Error pattern detection
- Information extraction (file paths, URLs, commands, code blocks)
- Expectation comparison
- Comprehensive reporting

**Usage:**
```python
from response_analyzer import ResponseAnalyzer

analyzer = ResponseAnalyzer()
result = analyzer.analyze(
    response="I've successfully implemented the feature...",
    context={'task': 'feature-implementation'}
)

print(f"Quality: {result.quality_score:.2%}")
print(f"Errors: {result.errors}")
print(f"Extracted info: {result.extracted_info}")
```

### 2. RalphResponseAnalyzer (`ralph_response_analyzer.py`)

Ralph-specific analyzer that understands autonomous agent behavior and provides runtime control recommendations.

**Key Features:**
- Task completion verification
- Confusion detection
- Confidence assessment
- Action recommendations (CONTINUE, PAUSE_FOR_REVIEW, ERROR_RECOVERY, etc.)
- Intervention need assessment
- Trend analysis over time

**Usage:**
```python
from response_analyzer import RalphResponseAnalyzer

analyzer = RalphResponseAnalyzer()
result = analyzer.analyze_agent_output(
    agent_response=ralph_output,
    task_expectation={
        'required_keywords': ['deployed', 'tested'],
        'min_length': 100
    },
    context={'phase': 'implementation'}
)

if result.intervention_needed:
    print(f"Intervention needed: {result.intervention_reason}")
    trigger_intervention(result)

print(f"Recommended action: {result.recommended_action}")
print(f"Task completion: {result.task_completion:.2%}")
```

**Action Recommendations:**
- `CONTINUE`: High confidence, low confusion, good completion - proceed autonomously
- `CONTINUE_WITH_CAUTION`: Moderate metrics - proceed but monitor closely
- `PAUSE_FOR_REVIEW`: Low confidence or high confusion - pause for human review
- `ERROR_RECOVERY`: Errors detected - trigger error recovery protocol
- `REQUEST_GUIDANCE`: High confusion without errors - request clarification

### 3. QualityScorer (`quality_scorer.py`)

Multi-dimensional quality scoring system.

**Dimensions:**
- **Completeness**: Does the response address all requirements?
- **Accuracy**: Is the information correct and error-free?
- **Relevance**: Does it address the query/task appropriately?
- **Clarity**: Is it well-structured and easy to understand?

**Usage:**
```python
from response_analyzer import QualityScorer

scorer = QualityScorer()
scores = scorer.score_response(
    response="Here's the implementation...",
    query="How do I implement X?",
    expected_elements=['code', 'explanation', 'example']
)

print(f"Overall quality: {scores.overall:.2%}")
print(scorer.get_quality_breakdown(scores))
```

**Example Output:**
```
Quality Score Breakdown:
  Completeness: 85.0%
  Accuracy:     90.0%
  Relevance:    80.0%
  Clarity:      75.0%

  Overall:      82.5%

Interpretation:
  Excellent quality - Response meets all criteria

Dimension Analysis:
  - Clarity is below target - consider improving structure
```

### 4. PatternMatcher (`pattern_matcher.py`)

Pattern detection and matching system.

**Pattern Types:**
- **Success Patterns**: Indicators of successful completion
- **Error Patterns**: Error and exception indicators
- **Confusion Patterns**: Signs of uncertainty or confusion
- **Completion Patterns**: Task completion indicators

**Usage:**
```python
from response_analyzer import PatternMatcher

matcher = PatternMatcher()

# Check for specific patterns
if matcher.has_pattern(response, 'error'):
    print("Error patterns detected!")

# Get all pattern matches
all_matches = matcher.match_all_patterns(response)
for pattern_type, matches in all_matches.items():
    print(f"{pattern_type}: {len(matches)} matches")

# Analyze sentiment
sentiment = matcher.analyze_sentiment(response)
print(f"Sentiment: {sentiment['sentiment']}")
print(f"Confidence: {sentiment['confidence']:.2%}")

# Get pattern summary
print(matcher.get_pattern_summary(response))
```

**Adding Custom Patterns:**
```python
# Add custom success pattern
matcher.add_custom_pattern(
    'success',
    r'build\s+(?:passed|succeeded|green)'
)

# Add custom error pattern
matcher.add_custom_pattern(
    'error',
    r'pipeline\s+(?:failed|broke|errored)'
)
```

### 5. ExpectationValidator (`expectation_validator.py`)

Validate responses against specified requirements and constraints.

**Validation Capabilities:**
- Required keywords/patterns
- Excluded keywords/patterns
- Length constraints
- Structural requirements
- File operation limits
- Command execution controls

**Usage:**
```python
from response_analyzer import ExpectationValidator, Expectation

validator = ExpectationValidator()

# Create expectation
expectation = validator.create_expectation(
    required_keywords=['implemented', 'tested', 'documented'],
    required_patterns=[r'```python', r'def\s+\w+'],
    excluded_keywords=['TODO', 'FIXME', 'not implemented'],
    min_length=200,
    max_length=5000,
    required_structure=['code_blocks', 'headers']
)

# Validate response
result = validator.validate_comprehensive(response, expectation)

if not result.is_valid:
    print("Validation failed!")
    for violation in result.violations:
        print(f"  - {violation}")
else:
    print(f"Validation passed! Compliance: {result.compliance_score:.2%}")
```

## Integration with Ralph Runtime

### Circuit Breaker Integration

Trigger circuit breaker based on response quality:

```python
from response_analyzer import RalphResponseAnalyzer

analyzer = RalphResponseAnalyzer()

def monitor_ralph_output(agent_response, task_context):
    result = analyzer.analyze_agent_output(
        agent_response,
        task_context.get('expectation'),
        task_context
    )

    # Trigger circuit breaker on poor quality
    if result.base_result.quality_score < 0.3:
        circuit_breaker.open(
            reason="Poor response quality",
            analysis=result
        )
        return False

    # Trigger on high confusion
    if result.confusion_level > 0.7:
        circuit_breaker.open(
            reason="High agent confusion",
            analysis=result
        )
        return False

    return True
```

### Progress Tracker Integration

Track response quality trends over time:

```python
def track_quality_progress(agent_id):
    analyzer = RalphResponseAnalyzer()

    # Get trend analysis
    trends = analyzer.get_trend_analysis(window=20)

    return {
        'completion_trend': trends['completion_trend'],
        'confidence_trend': trends['confidence_trend'],
        'intervention_rate': trends['intervention_rate'],
        'avg_quality': trends['avg_completion']
    }
```

### Decision Engine Integration

Inform autonomous decision-making:

```python
def make_autonomous_decision(agent_response, task_context):
    analyzer = RalphResponseAnalyzer()
    result = analyzer.analyze_agent_output(
        agent_response,
        task_context.get('expectation'),
        task_context
    )

    # Follow recommendation
    if result.recommended_action == "CONTINUE":
        return "proceed_autonomously"
    elif result.recommended_action == "PAUSE_FOR_REVIEW":
        return "request_human_review"
    elif result.recommended_action == "ERROR_RECOVERY":
        return "trigger_recovery"
    else:
        return "proceed_with_caution"
```

### Error Recovery Integration

Trigger recovery based on analysis:

```python
def handle_response_analysis(agent_response, task_context):
    analyzer = RalphResponseAnalyzer()
    result = analyzer.analyze_agent_output(
        agent_response,
        task_context.get('expectation'),
        task_context
    )

    if result.recommended_action == "ERROR_RECOVERY":
        # Parse errors and trigger specific recovery
        for error in result.base_result.errors:
            if "timeout" in error.lower():
                trigger_timeout_recovery()
            elif "permission" in error.lower():
                trigger_permission_recovery()
            else:
                trigger_generic_recovery()

    return result
```

## Pattern Matching Guide

### Success Patterns

Success patterns indicate positive outcomes:

```python
# Built-in success patterns
"successfully completed"
"task was achieved"
"all tests passed"
"deployment completed"
"build succeeded"
```

### Error Patterns

Error patterns detect issues:

```python
# Built-in error patterns
"error: something went wrong"
"failed to connect"
"exception occurred"
"timeout after 30s"
"access denied"
```

### Confusion Patterns

Confusion patterns detect uncertainty:

```python
# Built-in confusion patterns
"unclear how to proceed"
"need more information"
"not sure what to do"
"possibly the right approach"
```

### Completion Patterns

Completion patterns detect task finishing:

```python
# Built-in completion patterns
"finished with task"
"all steps completed"
"implementation complete"
"ready for next phase"
```

## Quality Scoring Guide

### Score Interpretation

- **0.8 - 1.0 (Excellent)**: Response meets all criteria
- **0.6 - 0.8 (Good)**: Response meets most criteria
- **0.4 - 0.6 (Fair)**: Response needs improvement
- **0.0 - 0.4 (Poor)**: Response requires significant improvement

### Dimension Analysis

**Completeness** factors:
- Response length
- Expected elements coverage
- Structural completeness (intro, body, conclusion)

**Accuracy** factors:
- Error indicators
- Uncertainty markers
- Concrete outcomes (code blocks, specific actions)

**Relevance** factors:
- Vocabulary richness
- Technical indicators
- Query keyword overlap
- Action-oriented content

**Clarity** factors:
- Sentence length and structure
- Clear organization
- Clarity indicators
- Ambiguity penalties

## Configuration

### Analyzer Configuration

```python
config = {
    # Quality threshold for considering response valid
    'min_quality_threshold': 0.5,

    # Confidence threshold for autonomous operation
    'min_confidence_threshold': 0.6,

    # Minimum task completion for continuation
    'min_task_completion': 0.7,

    # Maximum confusion before pausing
    'max_confusion_threshold': 0.4,

    # Minimum confidence for autonomy
    'min_autonomy_confidence': 0.6,

    # Quality dimension weights
    'weights': {
        'completeness': 0.3,
        'accuracy': 0.3,
        'relevance': 0.2,
        'clarity': 0.2,
    }
}

analyzer = RalphResponseAnalyzer(config)
```

## Advanced Usage

### Custom Quality Weights

```python
from response_analyzer import QualityScorer

scorer = QualityScorer({
    'weights': {
        'completeness': 0.4,  # Weight completeness higher
        'accuracy': 0.3,
        'relevance': 0.2,
        'clarity': 0.1,
    }
})
```

### Pattern Matching Pipeline

```python
from response_analyzer import PatternMatcher

matcher = PatternMatcher()

# Analyze multiple responses
responses = [response1, response2, response3]
for response in responses:
    sentiment = matcher.analyze_sentiment(response)
    print(f"Sentiment: {sentiment['sentiment']}")

    counts = matcher.count_patterns(response)
    print(f"Success: {counts['success']}, Error: {counts['error']}")
```

### Comprehensive Validation

```python
from response_analyzer import ExpectationValidator, Expectation

validator = ExpectationValidator()

expectation = Expectation(
    required_keywords=['deployed', 'tested'],
    required_patterns=[r'```', r'def\s+\w+'],
    excluded_keywords=['TODO', 'FIXME'],
    min_length=500,
    max_length=5000,
    required_structure=['code_blocks', 'headers']
)

result = validator.validate_comprehensive(response, expectation)
report = validator.report_violations(result, response)
print(report)
```

## API Reference

### Quick Functions

```python
from response_analyzer import (
    analyze_response,    # Quick analysis
    score_quality,       # Quick quality scoring
    match_patterns       # Quick pattern matching
)

# Quick analysis
result = analyze_response(
    response="Agent output here",
    expectation={'keywords': ['success']},
    context={'task': 'deployment'}
)

# Quick quality scoring
scores = score_quality(
    response="Response here",
    query="Original query"
)

# Quick pattern matching
patterns = match_patterns("Text to analyze")
```

## Troubleshooting

### Low Quality Scores

**Problem**: Responses consistently score low on quality.

**Solutions**:
1. Check if response length is appropriate (not too short/long)
2. Verify expected elements are being included
3. Improve response structure with headers, paragraphs, code blocks
4. Reduce error indicators and uncertainty markers

### Pattern Not Detected

**Problem**: Expected patterns not being detected.

**Solutions**:
1. Use the `match_all_patterns()` method to see all matches
2. Check pattern syntax (valid regex)
3. Add custom patterns using `add_custom_pattern()`
4. Use case-insensitive patterns (default is IGNORECASE)

### Validation Fails Unexpectedly

**Problem**: Validation fails when response seems correct.

**Solutions**:
1. Check all requirement specifications
2. Review exclusion constraints (might be too strict)
3. Verify length constraints are reasonable
4. Use `validate_comprehensive()` to see full details

## Best Practices

1. **Set Appropriate Thresholds**: Configure thresholds based on your use case and risk tolerance
2. **Use Multiple Dimensions**: Don't rely on a single metric - use the full quality scoring
3. **Track Trends**: Monitor quality over time to detect degradation
4. **Custom Patterns**: Add domain-specific patterns for better detection
5. **Combine Signals**: Use multiple indicators together for better decisions
6. **Iterate**: Refine expectations and thresholds based on experience

## Performance Considerations

- **Caching**: Pattern matchers compile patterns once for performance
- **History Limits**: Analysis/validation history is limited to last 100 entries
- **Early Exit**: Many methods return early on first match for efficiency
- **Regex Compilation**: Patterns are pre-compiled for faster matching

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

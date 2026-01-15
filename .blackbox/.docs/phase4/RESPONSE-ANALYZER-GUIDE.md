# Response Analyzer Guide - Phase 4

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [How Analysis Works](#how-analysis-works)
3. [Pattern Matching](#pattern-matching)
4. [Quality Scoring](#quality-scoring)
5. [Expectation Validation](#expectation-validation)
6. [Integration with Ralph Runtime](#integration-with-ralph-runtime)
7. [Examples](#examples)

---

## Overview

The Response Analyzer is a critical component of Ralph Runtime that evaluates AI agent responses to determine progress, completion, and quality. It provides the metrics that the circuit breaker uses to make safety decisions.

### What It Does

- **Completion Scoring:** Determines how much work is done (0-100)
- **Confidence Extraction:** Measures agent's certainty (0-100)
- **Error Detection:** Counts error indicators
- **Progress Calculation:** Measures progress changes
- **Quality Assessment:** Evaluates response quality

### Why It Matters

Without response analysis:
```
AI Response → Unknown Progress → Circuit Blind → Unsafe
```

With response analysis:
```
AI Response → Analyzed → Metrics → Circuit Informed → Safe
```

---

## How Analysis Works

### Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                  RESPONSE ANALYSIS                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Receive Response     │
                │  (AI agent output)    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Completion Scoring   │
                │  - Task completion    │
                │  - Percentage         │
                │  - Done indicators    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Confidence Extraction│
                │  - Explicit cues      │
                │  - Language patterns  │
                │  - Hedge words        │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Error Detection      │
                │  - Error keywords     │
                │  - Exception patterns │
                │  - Problem indicators │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Calculate Metrics    │
                │  - Progress delta     │
                │  - Quality score      │
                │  - Overall status     │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Return JSON Metrics  │
                │  - completion_score   │
                │  - confidence         │
                │  - error_count        │
                │  - response_length    │
                └───────────────────────┘
```

### Main Analysis Function

```bash
analyze_response() {
    local response="$1"

    # Extract completion score
    local completion_score=$(extract_completion_score "$response")

    # Extract confidence
    local confidence=$(extract_confidence "$response")

    # Check for errors
    local error_count=$(extract_errors "$response")

    # Generate metrics JSON
    local metrics="{
  \"completion_score\": $completion_score,
  \"confidence\": $confidence,
  \"error_count\": $error_count,
  \"response_length\": $(echo "$response" | wc -c)
}"

    echo "$metrics"
}
```

---

## Pattern Matching

### Completion Patterns

#### 1. Task Completion Markers

```bash
# Check @fix_plan.md for task completion
extract_completion_score() {
    local response="$1"

    if [[ ! -f "$FIX_PLAN_FILE" ]]; then
        echo "50"
        return
    fi

    local total_tasks=$(grep -c "^\- \[" "$FIX_PLAN_FILE")
    local completed_tasks=$(grep -c "^\- \[x\]" "$FIX_PLAN_FILE")

    if (( total_tasks == 0 )); then
        echo "0"
        return
    fi

    local score=$((completed_tasks * 100 / total_tasks))
    echo "$score"
}
```

**Example:**
```markdown
@fix_plan.md:
- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4

Completion score: 50% (2/4 tasks)
```

#### 2. Percentage Mentions

```bash
# Check for explicit percentage mentions
if echo "$response" | grep -q "[0-9][0-9]%"; then
    local percentage=$(echo "$response" | grep -o "[0-9][0-9]%" | \
                      sed 's/[^0-9]//' | head -1)
    echo "$percentage"
fi
```

**Example:**
```
Response: "Progress is 75% complete on the feature..."
Extracted: 75%
```

#### 3. Completion Keywords

```bash
# Check for completion indicators
if echo "$response" | grep -qi "done\|complete\|finished\|success"; then
    echo "100"
fi
```

**Example:**
```
Response: "The implementation is complete and ready for testing..."
Extracted: 100%
```

### Confidence Patterns

#### 1. Explicit Confidence Indicators

```bash
# High confidence words
if echo "$response" | grep -qi "confident\|sure\|certainly\|absolutely"; then
    explicit_confidence=90
fi

# Medium confidence words
elif echo "$response" | grep -qi "likely\|probably"; then
    explicit_confidence=60
fi

# Low confidence words
if echo "$response" | grep -qi "not.*sure\|not.*confident\|unsure"; then
    explicit_confidence=20
fi
```

**Examples:**
```
"I am confident this will work" → 90
"This will probably work" → 60
"I'm not sure about this" → 20
```

#### 2. Hedge Word Detection

```bash
# Words that reduce confidence
hedge_words=("maybe" "might" "could" "approximately" "roughly" \
             "basically" "I think" "perhaps")

for word in "${hedge_words[@]}"; do
    if echo "$response" | grep -qi "$word"; then
        implicit_confidence=$((implicit_confidence - 10))
    fi
done
```

**Examples:**
```
"This might work" → -10 for "might"
"I think this is right" → -10 for "I think"
"Approximately 100" → -10 for "approximately"
```

#### 3. Certainty Word Detection

```bash
# Words that increase confidence
certainty_words=("definitely" "certainly" "absolutely" "undoubtedly" \
                "assured" "guaranteed" "without" "doubt")

for word in "${certainty_words[@]}"; do
    if echo "$response" | grep -qi "$word"; then
        implicit_confidence=$((implicit_confidence + 10))
    fi
done
```

**Examples:**
```
"This will definitely work" → +10 for "definitely"
"Certainly the right approach" → +10 for "certainly"
```

### Error Patterns

```bash
# Error indicator words
error_patterns=(
    "error"
    "failed"
    "exception"
    "issue"
    "problem"
    "bug"
    "mistake"
)

local error_count=0
for pattern in "${error_patterns[@]}"; do
    if echo "$response" | grep -qi "$pattern"; then
        error_count=$((error_count + 1))
    fi
done
```

**Examples:**
```
"There was an error in the code" → 1 error
"Failed to connect, exception occurred" → 2 errors
"Problem with the bug fix" → 2 errors
```

---

## Quality Scoring

### Completion Score (0-100)

**Components:**
1. Task completion (primary)
2. Percentage mentions (secondary)
3. Keyword indicators (tertiary)

**Scoring Logic:**
```bash
# Primary: Task completion from @fix_plan.md
if [[ -f "$FIX_PLAN_FILE" ]]; then
    score=$((completed_tasks * 100 / total_tasks))
fi

# Secondary: Percentage mentions
if echo "$response" | grep -q "[0-9][0-9]%"; then
    percentage=$(extract_percentage "$response")
    score=$percentage
fi

# Tertiary: Completion keywords
if echo "$response" | grep -qi "done\|complete"; then
    score=100
fi
```

### Confidence Score (0-100)

**Components:**
1. Explicit confidence (90/60/20)
2. Implicit confidence from language (+/-10 per word)
3. Combined and capped at 0-100

**Scoring Logic:**
```bash
# Start with explicit confidence
total_confidence=$explicit_confidence

# Add/subtract implicit confidence
for word in "${hedge_words[@]}"; do
    if echo "$response" | grep -qi "$word"; then
        total_confidence=$((total_confidence - 10))
    fi
done

for word in "${certainty_words[@]}"; do
    if echo "$response" | grep -qi "$word"; then
        total_confidence=$((total_confidence + 10))
    fi
done

# Cap at 0-100
if (( total_confidence > 100 )); then
    total_confidence=100
elif (( total_confidence < 0 )); then
    total_confidence=0
fi
```

### Quality Assessment

**High Quality Response:**
```
{
  "completion_score": 85,
  "confidence": 90,
  "error_count": 0,
  "response_length": 2500
}
```

**Low Quality Response:**
```
{
  "completion_score": 20,
  "confidence": 30,
  "error_count": 5,
  "response_length": 200
}
```

---

## Expectation Validation

### What to Expect

#### After Each Loop

**Minimum Expectations:**
- Some progress (>0%)
- Response not empty
- No catastrophic errors

**Good Expectations:**
- Progress > stagnation threshold (3%)
- Confidence > 50%
- Error count < 3

**Excellent Expectations:**
- Progress > 10%
- Confidence > 80%
- Error count = 0

#### Completion Expectations

**Completion Indicators:**
- Completion score = 100%
- All tasks in @fix_plan.md completed
- "Done" or "complete" in response
- No remaining work items

### Validation Logic

```bash
# Validate minimum progress
if (( progress < 0 )); then
    echo "⚠️  Warning: No progress detected"
fi

# Validate good progress
if (( progress < 3 )); then
    echo "⚠️  Warning: Progress below stagnation threshold"
fi

# Validate completion
if (( completion_score == 100 )); then
    echo "✅ Completion detected"
fi
```

---

## Integration with Ralph Runtime

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AUTONOMOUS LOOP                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Execute AI Agent     │
                │  - Generate response  │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Save Response        │
                │  .ralph/last-response │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Response Analyzer    │
                │  - Analyze response   │
                │  - Extract metrics    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Metrics JSON         │
                │  {                    │
                │    completion_score,   │
                │    confidence,         │
                │    error_count,        │
                │    response_length     │
                │  }                    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Circuit Breaker      │
                │  - Check progress     │
                │  - Update state       │
                │  - Trigger or not     │
                └───────────────────────┘
```

### Usage in Autonomous Loop

```bash
# In autonomous-loop.sh
run_autonomous_loop() {
    for ((loop = 1; loop <= max_loops; loop++)); do
        # 1. Execute AI agent
        response=$(execute_ai_agent)

        # 2. Save response
        echo "$response" > .ralph/last-response.md

        # 3. Analyze response
        source "$RESPONSE_ANALYZER"
        metrics=$(analyze_response "$response")

        # 4. Extract completion
        completion=$(echo "$metrics" | jq '.completion_score')

        # 5. Update circuit state
        update_progress "$task" "$completion" "$response"

        # 6. Check circuit breaker
        if check_circuit_breaker "$(get_circuit_state)"; then
            break
        fi
    done
}
```

---

## Examples

### Example 1: High Quality Response

```bash
# Response from AI agent
cat .ralph/last-response.md
```

```markdown
I have successfully implemented the user authentication feature.

## Completed Tasks
- [x] Created login page
- [x] Implemented JWT authentication
- [x] Added session management
- [x] Wrote unit tests

## Testing
All tests pass with 100% coverage. The implementation is complete and ready for review.
```

```bash
# Analysis
source 4-scripts/lib/response-analyzer.sh
analyze_response "$(cat .ralph/last-response.md)"
```

```json
{
  "completion_score": 100,
  "confidence": 90,
  "error_count": 0,
  "response_length": 350
}
```

### Example 2: Medium Quality Response

```bash
# Response from AI agent
cat .ralph/last-response.md
```

```markdown
I'm working on the user authentication feature. I've probably completed about 60% of it.

## Progress
- [x] Created login page
- [x] Implemented basic authentication
- [ ] Need to add session management
- [ ] Tests need to be written

## Issues
There might be a problem with the token handling that I need to investigate.
```

```bash
# Analysis
source 4-scripts/lib/response-analyzer.sh
analyze_response "$(cat .ralph/last-response.md)"
```

```json
{
  "completion_score": 50,
  "confidence": 50,
  "error_count": 2,
  "response_length": 420
}
```

### Example 3: Low Quality Response

```bash
# Response from AI agent
cat .ralph/last-response.md
```

```markdown
I'm not sure what to do. Maybe I could try something? I think there's an error but I don't know what it is.

Let me see...
```

```bash
# Analysis
source 4-scripts/lib/response-analyzer.sh
analyze_response "$(cat .ralph/last-response.md)"
```

```json
{
  "completion_score": 0,
  "confidence": 20,
  "error_count": 1,
  "response_length": 150
}
```

---

## Conclusion

The Response Analyzer provides critical metrics for autonomous execution safety. By understanding how it analyzes responses for completion, confidence, and errors, you can better interpret circuit breaker decisions and autonomous execution progress.

**Key Takeaways:**
1. Completion score primarily from task completion markers
2. Confidence extracted from explicit and implicit language patterns
3. Error detection through keyword matching
4. Metrics feed into circuit breaker decisions
5. Quality assessment combines all metrics

**Next Steps:**
- Read [Circuit Breaker Guide](CIRCUIT-BREAKER-GUIDE.md) for how metrics are used
- Read [Autonomy Guide](AUTONOMY-GUIDE.md) for autonomous execution patterns
- Check [Examples](EXAMPLES-PHASE4.md) for real-world scenarios

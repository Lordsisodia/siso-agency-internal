#!/usr/bin/env bash
#
# Benchmark Task Script
# Compare AI effectiveness with vs without .blackbox4
#
# Usage:
#   ./4-scripts/benchmark-task.sh "Task description" [complexity]
#
# Example:
#   ./4-scripts/benchmark-task.sh "Create a REST API for user management" moderate

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source library functions
if [[ -f "$SCRIPT_DIR/lib.sh" ]]; then
    source "$SCRIPT_DIR/lib.sh"
fi

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${CYAN}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

# Parse arguments
TASK="${1:-}"
COMPLEXITY="${2:-simple}"

if [[ -z "$TASK" ]]; then
    cat << EOF
${YELLOW}Usage:${NC}
  $0 "Task description" [complexity]

${CYAN}Example:${NC}
  $0 "Create a Python function to validate emails" simple
  $0 "Build a REST API for user management" moderate

${CYAN}Complexity levels:${NC}
  simple     - 15-30 min (single function, small feature)
  moderate   - 30-60 min (CRUD API, component, refactor)
  complex    - 1-2 hours (full feature, architecture)

${CYAN}What this does:${NC}
  Creates a benchmark plan folder with metrics tracking
  for comparing AI effectiveness with vs without .blackbox4

EOF
    exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TASK_SLUG=$(echo "$TASK" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | head -c 50)
BENCHMARK_ID="benchmark-${TIMESTAMP}_${TASK_SLUG}"

# Create benchmark directory
BENCHMARK_DIR=".benchmarks/$BENCHMARK_ID"
mkdir -p "$BENCHMARK_DIR"

info "=== AI Effectiveness Benchmark ==="
echo ""
info "Task: $TASK"
info "Complexity: $COMPLEXITY"
info "Benchmark ID: $BENCHMARK_ID"
info "Output: $BENCHMARK_DIR"
echo ""

# Create metrics template
cat > "$BENCHMARK_DIR/metrics.yaml" << EOF
# Benchmark Metrics
# Fill this out after each run

benchmark:
  id: "$BENCHMARK_ID"
  task: "$TASK"
  complexity: "$COMPLEXITY"
  created_at: "$(date -Iseconds)"

# --- RUN A: WITH BLACKBOX3 ---
run_a_with_blackbox3:
  date: "[Fill in after run]"
  ai_model: "[e.g., Claude Opus, GPT-4]"

  timing:
    started_at: "[Timestamp]"
    completed_at: "[Timestamp]"
    duration_seconds: [Total seconds]
    duration_human: "[e.g., 45m 30s]"

  resources:
    tokens_used: [From chat logs]
    iterations: [Count conversation turns]
    context_switches: [Times you redirected AI]

  outcomes:
    completed: [true/false]
    errors_found: [Code review count]
    files_created: [Number of files]
    lines_of_code: [Approximate]

  quality:
    code_quality: [1-10]
    mental_load: [1-10, lower better]
    maintainability: [1-10]
    reusability: [1-10]
    satisfaction: [1-10]

  notes: |
    [What worked well? What didn't?]

# --- RUN B: WITHOUT BLACKBOX3 ---
run_b_without_blackbox3:
  date: "[Fill in after run]"
  ai_model: "[Same as above for fair comparison]"

  timing:
    started_at: "[Timestamp]"
    completed_at: "[Timestamp]"
    duration_seconds: [Total seconds]
    duration_human: "[e.g., 1h 15m]"

  resources:
    tokens_used: [From chat logs]
    iterations: [Count conversation turns]
    context_switches: [Times you redirected AI]

  outcomes:
    completed: [true/false]
    errors_found: [Code review count]
    files_created: [Number of files]
    lines_of_code: [Approximate]

  quality:
    code_quality: [1-10]
    mental_load: [1-10, lower better]
    maintainability: [1-10]
    reusability: [1-10]
    satisfaction: [1-10]

  notes: |
    [What worked well? What didn't?]

# --- ANALYSIS ---
analysis:
  time_improvement: "[((raw_time - bb3_time) / raw_time) * 100]%"
  token_efficiency: "[((raw_tokens - bb3_tokens) / raw_tokens) * 100]%"
  iteration_reduction: "[((raw_iterations - bb3_iterations) / raw_iterations) * 100]%"
  error_reduction: "[((raw_errors - bb3_errors) / raw_errors) * 100]%"

  overall_winner: "[with_blackbox3|without_blackbox3|tie]"

  conclusions: |
    [Summary of findings]
    [Which approach was better for this type of task?]
    [Would you use .blackbox4 for similar tasks?]
EOF

# Create comparison plan
cat > "$BENCHMARK_DIR/PLAN.md" << EOF
# Benchmark Plan: $TASK

**Complexity:** $COMPLEXITY
**Created:** $(date +%Y-%m-%d)
**ID:** $BENCHMARK_ID

---

## Objective

Compare AI effectiveness when completing this task:
> "$TASK"

**With:** .blackbox4 (Action Plan Agent, structured workflow)
**Without:** Raw AI chat (no framework, just prompt)

---

## Protocol

### Step 1: Run WITHOUT .blackbox4 (Today)

1. Open a fresh AI chat (no .blackbox4 context)
2. Paste exactly: \`$TASK\`
3. Start timer
4. Work until complete or you give up
5. Record metrics in \`metrics.yaml\` under \`run_b_without_blackbox3\`
6. Save output files to \`$BENCHMARK_DIR/raw-output/\`

**Tips:**
- Don't mention .blackbox4 or any framework
- Use the same AI model you'll use with .blackbox4
- Time yourself accurately
- Count every conversation turn
- Note every time you had to redirect/clarify

### Step 2: Wait (Next Day)

Prevent learning effect. Don't do both runs on the same day.

### Step 3: Run WITH .blackbox4 (Next Day)

\`\`\`bash
cd /Users/shaansisodia/DEV/AI-HUB/Black\ Box\ Factory/current/.blackbox4
./4-scripts/action-plan.sh "$TASK"
\`\`\`

1. Follow the Action Plan workflow
2. Start timer when you begin with AI
3. Work until complete or you give up
4. Record metrics in \`metrics.yaml\` under \`run_a_with_blackbox3\`
5. Save output files (already in plan folder)

### Step 4: Compare & Analyze

1. Fill out the \`analysis\` section in \`metrics.yaml\`
2. Calculate improvements
3. Write conclusions

---

## Metrics to Track

### Time
- Start timestamp
- End timestamp
- Total duration (seconds and human-readable)

### Resources
- **Tokens used:** Check chat usage statistics
- **Iterations:** Count each AI response + user reply
- **Context switches:** Count times you had to redirect the AI

### Outcomes
- **Completed:** Did you finish the task fully?
- **Errors found:** Review output for bugs
- **Files created:** Count output files
- **Lines of code:** Approximate

### Quality (1-10 scale)
- **Code quality:** Clean, readable, follows best practices
- **Mental load:** How much cognitive effort (lower = easier)
- **Maintainability:** Easy to modify later
- **Reusability:** Can you reuse patterns for similar tasks
- **Satisfaction:** Overall happiness with process

---

## Expected Outcome

For a **$COMPLEXITY** task, we expect:

| Metric | Expected With .blackbox4 |
|--------|------------------------|
| Time | 20-40% faster |
| Tokens | 15-30% fewer |
| Iterations | 30-50% fewer |
| Errors | 25-40% fewer |
| Mental Load | 40-60% lower |

---

## Files Generated

- \`metrics.yaml\` - Data collection template
- \`PLAN.md\` - This file
- \`raw-output/\` - Save raw AI chat output here
- \`bb3-output/\` - Link to .blackbox4 plan folder

---

**Good luck! Remember: Use the same AI model for both runs.**
EOF

# Create output directories
mkdir -p "$BENCHMARK_DIR/raw-output"
mkdir -p "$BENCHMARK_DIR/bb3-output"

success "Benchmark plan created!"
echo ""
info "Next steps:"
echo ""
echo "  1. Read the plan:"
echo "     cat $BENCHMARK_DIR/PLAN.md"
echo ""
echo "  2. Run WITHOUT .blackbox4 first (today):"
echo "     - Open fresh AI chat"
echo "     - Paste: $TASK"
echo "     - Time yourself"
echo "     - Save output to: $BENCHMARK_DIR/raw-output/"
echo ""
echo "  3. Tomorrow, run WITH .blackbox4:"
echo "     ./4-scripts/action-plan.sh \"$TASK\""
echo ""
echo "  4. Fill in metrics:"
echo "     edit $BENCHMARK_DIR/metrics.yaml"
echo ""
echo "  5. Compare results!"
echo ""

# Quick reference card
cat > "$BENCHMARK_DIR/QUICK-REF.txt" << EOF
QUICK REFERENCE CARD
====================

TASK: $TASK
COMPLEXITY: $COMPLEXITY

RUN A (RAW AI):
- Start: [_____:____]  End: [_____:____]
- Tokens: _____  Iterations: _____  Switches: _____
- Quality: [_____/10]  Mental Load: [_____/10]

RUN B (WITH BLACKBOX3):
- Start: [_____:____]  End: [_____:____]
- Tokens: _____  Iterations: _____  Switches: _____
- Quality: [_____/10]  Mental Load: [_____/10]

CALCULATIONS:
- Time Improvement: _____%
- Token Efficiency: _____%
- Winner: [RAW | BB3 | TIE]
EOF

success "Quick reference created at: $BENCHMARK_DIR/QUICK-REF.txt"
echo ""
info "Benchmark directory: $BENCHMARK_DIR"

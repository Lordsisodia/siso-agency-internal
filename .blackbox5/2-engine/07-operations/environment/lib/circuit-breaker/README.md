# Circuit Breaker Library - Quick Start Guide

**Part of:** Blackbox3 Circuit Breaker Implementation
**Status:** Ready for Use

---

## What is This?

This library provides **protection against infinite loops** and **runaway API token consumption** when using autonomous execution (like Ralph integration). It implements the thought-chain analysis for safety and reliability.

---

## Quick Start

### 1. Test Circuit Breaker
```bash
cd "Black Box Factory/current/Blackbox3"

# Initialize circuit breaker
./scripts/lib/circuit-breaker.sh init

# Check status
./scripts/lib/circuit-breaker.sh status
```

**Expected Output:**
```
Circuit Breaker State:
  Status: CLOSED
  Trigger Count: 0
  Loop Count: 0
  Consecutive No-Progress Loops: 0
  Last Progress Timestamp: 0
  Last Trigger Time: 0
```

### 2. Simulate Autonomous Loop
```bash
# Create mock loop to test
mkdir -p .ralph/logs
echo "# Mock Loop" > .ralph/@fix_plan.md
echo "- [ ] Task 1" >> .ralph/@fix_plan.md

# Run 10 iterations
for i in {1..10}; do
    echo "# Loop $i: Working on task" > .ralph/last-response.md
    
    # Update progress
    ./scripts/lib/circuit-breaker.sh track
    
    # Check if circuit breaker triggers
    local state=$(./scripts/lib/circuit-breaker.sh check)
    local status=$(echo "$state" | jq -r '.status')
    
    if [[ "$status" == "OPEN" ]]; then
        echo "🚨 Circuit breaker OPEN at loop $i"
        break
    fi
done
```

### 3. Reset After Testing
```bash
./scripts/lib/circuit-breaker.sh reset
./scripts/lib/circuit-breaker.sh status
```

---

## Core Features

### 1. Configurable Thresholds
- **Per-project overrides** - Different projects need different tolerances
- **Stagnation detection** - Multiple methods (progress delta, task completion, error count)
- **Cooldown periods** - Prevent restart spam

### 2. State Persistence
- **Survives process restarts** - State saved in `.ralph/circuit-state.json`
- **Automatic backups** - Last 5 states saved
- **Manual reset** - Emergency override

### 3. Multiple Stagnation Methods
- **Progress delta** - Response length changes
- **Task completion** - Tasks marked [x]
- **Response quality** - Confidence scoring
- **Error patterns** - Counts specific keywords

### 4. Project Types
- `critical_feature` - Multi-tenant research (lenient)
- `simple_script` - Quick prototypes (aggressive)
- `research_task` - Deep analysis (very lenient)

### 5. Logging System
- **Structured logs** - `.ralph/logs/circuit_breaker_YYYYMMDD.log`
- **Log rotation** - Automatic file rotation (10MB max)
- **Retention** - 30 days by default
- **Multiple levels** - INFO, WARN, ERROR

### 6. Integration Ready
- **Circuit breaker** - Use in any autonomous loop
- **Exit detection** - Can combine with response analyzer
- **Progress tracking** - Real-time monitoring

---

## Usage Examples

### Basic Usage (Manual Reset)
```bash
# Check circuit breaker state
./scripts/lib/circuit-breaker.sh status

# Reset manually (emergency stop)
./scripts/lib/circuit-breaker.sh reset
```

### Integration with Autonomous Loop
```bash
# In your autonomous loop script:

# Check circuit breaker before each loop iteration
source scripts/lib/circuit-breaker.sh
state=$(./scripts/lib/circuit-breaker.sh check)

# Only continue if circuit is closed
if [[ "$(echo "$state" | jq -r '.status')" == "OPEN" ]]; then
    echo "🛑 Circuit breaker OPEN - stopping execution"
    exit 1  # Stop loop
else
    # Continue with loop
fi

# Update loop metrics
source scripts/lib/circuit-breaker.sh track
```

---

## File Structure

```
scripts/lib/circuit-breaker/
├── circuit-breaker.sh          # Main entry point
├── config.yaml                  # Configuration file
└── README.md                    # This file

.ralph/
├── circuit-state.json          # Circuit breaker state
├── logs/                       # Event logs
│   └── circuit_breaker_*.log
├── @fix_plan.md               # Task list for autonomous
├── PROMPT.md                   # Ralph format prompt
└── progress.md                 # Progress tracking

scripts/lib/
├── circuit-breaker/            # Circuit breaker library
└── response-analyzer.sh       # Response analysis
```

---

## Configuration Options

### Circuit Breaker Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `max_loops_no_progress` | 10 | Max loops without progress before trigger |
| `stagnation_threshold` | 3 | Consecutive loops with <10% progress |
| `absolute_max_loops` | 20 | Absolute maximum loops |
| `cooldown_period_seconds` | 300 | Cooldown before allowing restart |

### Project Type Thresholds

| Type | Max Loops | Stagnation | Absolute Max |
|------|-----------|----------|------------|
| `critical_feature` | 15 | 2 | 30 | Lenient for multi-tenant research |
| `simple_script` | 3 | 1 | 5 | Aggressive for quick prototypes |
| `research_task` | 20 | 5 | 50 | Very lenient for deep analysis |

---

## Troubleshooting

### Circuit breaker triggering too early?
**Symptoms:** Execution stops even though making progress

**Solutions:**
1. Adjust `max_loops_no_progress` up (e.g., 15 instead of 10)
2. Adjust `stagnation_threshold` up (e.g., 5% instead of 3%)
3. Check stagnation detection - ensure progress delta is calculated correctly

### Circuit breaker never triggers?
**Symptoms:** Execution runs forever even when stuck

**Solutions:**
1. Verify response analyzer is working
2. Check `.ralph/last-response.md` is being updated
3. Check if progress is being written
4. Manually reset if needed: `./scripts/lib/circuit-breaker.sh reset`

### Wrong error/warning triggers?
**Symptoms:** Circuit breaker triggers incorrectly

**Solutions:**
1. Review logs in `.ralph/logs/circuit_breaker_*.log`
2. Check state file: `.ralph/circuit-state.json`
3. Verify configuration: `scripts/lib/circuit-breaker/config.yaml`
4. Adjust thresholds if needed

---

## Integration with Blackbox3

The circuit breaker is designed to integrate seamlessly with:

1. **Blackbox3 agents** - Use agent handoffs
2. **Blackbox3 plans** - Track completion
3. **Blackbox3 memory** - Access context variables
4. **Blackbox3 scripts** - Use command palette shortcuts

---

## Next Steps

1. ✅ **Test circuit breaker** with mock loop (see test plan)
2. ✅ **Verify state persistence** across restarts
3. ✅ **Test project-specific thresholds**
4. ✅ **Integrate with Ralph** (when ready)
5. ✅ **Test with real autonomous execution**
6. ✅ **Monitor and adjust thresholds** based on real usage

---

## Documentation

For detailed implementation guidance, see:
- **Thought Chain Implementation Plan:** `.docs/improvement/THOUGHT-CHAIN-IMPLEMENTATION-PLAN.md`
- **Feature Matrix:** `.docs/roadmap/FEATURE-MATRIX-&-IMPLEMENTATION-ROADMAP.md`
- **Study Guides:** `.docs/roadmap/QUICK-STUDY-GUIDES.md`

---

**Status:** ✅ Ready for Testing
**Created:** 2026-01-15
**Version:** 1.0

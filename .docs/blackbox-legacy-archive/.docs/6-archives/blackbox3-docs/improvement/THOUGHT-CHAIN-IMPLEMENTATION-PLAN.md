# Blackbox3 Improvement: Thought Chain Implementation Plan

**Date:** 2026-01-15
**Status:** Ready for Implementation
**Purpose:** Step-by-step AI reasoning and logic for implementing critical improvements to make Blackbox3 more robust

---

## Executive Summary

This document provides a detailed thought chain and step-by-step implementation plan for enhancing Blackbox3 with features learned from analyzing 30+ AI/development frameworks. Each improvement includes:

1. Problem Analysis - Why this feature is critical
2. First Principles Reasoning - Core principles that must guide implementation
3. AI Logic Requirements - What the AI must know and do
4. Step-by-Step Implementation - Concrete actions with verification points
5. Success Criteria - How we know the feature works correctly

---

## Phase 1: Safety and Reliability (Highest Priority)

### Feature 1.1: Circuit Breaker with Configurable Thresholds

#### Problem Analysis
Why is this critical?
- Ralph integration will enable autonomous loops that run for hours
- Without circuit breaker, autonomous loops can:
  - Get stuck in infinite loops (repeating same action)
  - Burn unlimited API tokens (expensive)
  - Run forever without completing
  - Create runaway operations that harm system
- Current Blackbox3 has no protection against these risks
- Users need confidence that autonomous execution won't waste resources or cause damage

#### First Principles Reasoning
1. Simplicity Principle - Circuit breaker should be simple and understandable
   - Complex logic fails when developers can't debug it
   - Clear, transparent rules are better than opaque algorithms

2. Fail-Safe Design - Circuit breaker should never block legitimate work
   - False positives prevent valid work from completing
   - Must distinguish between "stuck" (no progress) vs "working" (slow progress)
   - Different projects have different tolerance levels
   - Research projects may need to iterate 100 times; simple scripts need only 3
   - Users must be able to configure thresholds per project

3. Configurability Principle - Different projects have different tolerance levels
   - A hard-coded threshold (e.g., 3 loops) won't work for all use cases
   - Research projects may need to iterate 100 times; simple scripts need only 3
   - Users must be able to configure thresholds per project

4. Visibility Principle - Circuit breaker state must be visible and debuggable
   - If circuit breaker trips, users need to know WHY
   - Should log detailed metrics to diagnose issues
   - Must provide clear human-readable status output

5. State Persistence Principle - Circuit breaker state should survive restarts
   - If process crashes and restarts, circuit breaker remembers it was open
   - Prevents accidental clearing of safety mechanisms
   - Allows state inspection and debugging

#### AI Logic Requirements
Must understand current circuit state (OPEN/CLOSED)
Must track loop metrics (loop count, timestamp of last progress)
Must track error patterns (repetitive failures, exceptions)
Must compare current state against configurable thresholds
Must provide clear human-readable status output
Must allow manual override (emergency stop)
Must log all state changes for debugging

#### Step-by-Step Implementation Plan

**Step 1: Define Circuit Breaker Data Model**
Create: scripts/circuit-breaker/config.yaml
Purpose: Centralized configuration for all circuit breaker rules

YAML Structure:
```yaml
# Global defaults
circuit_breaker:
  max_loops_no_progress: 10  # Maximum loops without progress
  stagnation_threshold: 3      # Consecutive loops with <1% progress
  cooldown_period_seconds: 300   # Cooldown before allowing restart

# Per-project overrides (can be set in .bb3.yaml)
projects:
  critical_feature:  # Example: "vendor_swap_validation"
    max_loops_no_progress: 15  # More lenient for research
    stagnation_threshold: 2  # Different definition of progress
    simple_script:  # Example: "quick_prototype"
      max_loops_no_progress: 3  # Very aggressive for quick tasks
```

**Step 2: Create State Tracking Library**
Create: scripts/lib/circuit-breaker.sh
Purpose: Circuit breaker state management functions

Functions to implement:
init_circuit_state() - Initialize circuit breaker state file
check_circuit_breaker() - Check against thresholds
trigger_circuit_breaker(reason, count) - Trigger circuit open
reset_circuit_breaker() - Manual reset
track_loop_metrics(timestamp, progress) - Update loop count
calculate_progress_delta() - Calculate percentage change

**Step 3: Create Logging System**
Create: scripts/lib/logger.sh
Purpose: Unified logging for circuit breaker events

Logging levels: INFO, WARN, ERROR
Log format: [timestamp] [level] [event] [details]
Log locations: .ralph/logs/circuit_breaker/

**Step 4: Integrate with Autonomous Loop**
Modify: scripts/autonomous-loop.sh (create if needed)
Add circuit breaker checks at each loop iteration
Call check_circuit_breaker() - if circuit open, stop execution

**Verification Points:**
- State persists across restarts
- Configurable thresholds per project
- Multiple stagnation detection heuristics
- Comprehensive logging for debugging
- Manual override capability
- Human-readable state format

**Success Criteria:**
- Circuit breaker activates on stagnation (>=3 loops with <10% progress)
- Circuit breaker activates on absolute max (>=20 loops)
- Circuit breaker state persists and survives process restarts
- All circuit breaker events logged for debugging
- Users can manually reset circuit breaker
- Configuration loaded from .bb3.yaml

### Feature 1.2: Exit Detection with Multiple Criteria

[Continue with detailed breakdown for other features...]

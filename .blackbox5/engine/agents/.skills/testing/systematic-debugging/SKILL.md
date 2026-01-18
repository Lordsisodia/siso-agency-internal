---
name: systematic-debugging
category: core
version: 1.0.0
description: Four-phase root cause analysis process to find bugs 10x faster
author: obra/superpowers
verified: true
tags: [debugging, troubleshooting, problem-solving]
---

# Systematic Debugging

## Overview
Find root causes quickly using a proven four-phase process: reproduce, isolate, identify, and verify.

## When to Use This Skill
✅ Complex bugs with unclear causes
✅ Production incidents requiring fast resolution
✅ Multi-component failures
✅ Intermittent issues
✅ Performance problems

## The Four Phases

### Phase 1: REPRODUCE
Create a reliable, minimal reproduction case:
- **Document exact steps** to trigger the bug
- **Capture environment** (OS, version, config)
- **Simplify the scenario** - remove unnecessary variables
- **Make it consistent** - bug should happen every time
- **Save test data** for later verification

### Phase 2: ISOLATE
Narrow down where the bug occurs:
- **Binary search** through code layers (frontend/backend/db)
- **Eliminate components** - what's NOT involved?
- **Add logging strategically** to trace execution
- **Test hypotheses** one at a time
- **Document what you ruled out**

### Phase 3: IDENTIFY
Find the exact root cause:
- **Examine the isolated code** carefully
- **Check assumptions** - what did you think was true?
- **Look for edge cases** and boundary conditions
- **Review recent changes** that might be related
- **Verify data flow** through the system

### Phase 4: VERIFY
Confirm the fix actually resolves the issue:
- **Apply the minimal fix** that addresses root cause
- **Test with original reproduction case**
- **Add regression test** to prevent recurrence
- **Check for similar issues** elsewhere in codebase
- **Document the fix** for future reference

## Common Debugging Mistakes
❌ Skipping straight to fixes without understanding
❌ Making multiple changes at once
❌ Not documenting what you tried
❌ Fixing symptoms instead of root causes
❌ Not verifying the fix works long-term

## Questions Claude Will Ask
To help debug systematically:
1. What were you doing when the bug occurred?
2. What did you expect to happen vs. what actually happened?
3. Can you reproduce this consistently?
4. What have you already tried?
5. What environment are you running in?

## Integration with Claude
When debugging, say:
- "Help me debug [issue] systematically"
- "I'm seeing [error], let's work through it methodically"
- "Let's isolate where this bug is occurring"

Claude will:
- Guide you through all four phases
- Prevent jumping to conclusions
- Help document your findings
- Suggest targeted tests
- Ensure you verify the fix

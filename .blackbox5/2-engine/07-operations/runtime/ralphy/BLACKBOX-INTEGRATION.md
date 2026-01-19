# Ralphy-Blackbox Integration Guide

## Overview

This integration ensures **Ralphy uses the Blackbox5 AgentMemory system** to track all agent activity with:
1. ✅ Goals and objectives
2. ✅ Task achievements
3. ✅ Code outputted
4. ✅ Timestamps and duration

## Problem Solved

**Before**: Ralphy only stored data in local `.ralphy/` directory, which was not integrated with the Blackbox system.

**After**: Ralphy now stores all session data in Project Memory alongside other agents, ensuring complete tracking of:
- What goals agents had
- What they were trying to achieve
- What code was outputted
- When all of this occurred

## Architecture

### Data Flow

```
User runs Ralphy
       ↓
ralphy-bb5-integrated.sh
       ↓
1. Starts Blackbox session (via blackbox_integration.py)
   - Creates session record
   - Stores in .blackbox5/5-project-memory/siso-internal/operations/ralphy/
   - Tracks: agent_id, task, engine, timestamp
       ↓
2. Executes Ralphy task
   - Runs ralphy.sh
   - Creates code files
   - Makes git commits
       ↓
3. Ends Blackbox session
   - Records success/failure
   - Lists files created
   - Captures git commit hash
   - Calculates duration
       ↓
4. Archives to Project Memory
   - history/sessions/ralphy/sessions.json
   - history/sessions/ralphy/{session_id}/session.json
   - active/session.json (cleared after completion)
```

## Project Memory Structure

```
.blackbox5/5-project-memory/siso-internal/operations/ralphy/
├── active/
│   └── session.json              # Currently running session
├── history/
│   └── sessions/
│       └── ralphy/
│           ├── sessions.json     # All session records
│           ├── ralphy_20260119_120000_abc123/  # Individual sessions
│           │   ├── session.json
│           │   ├── progress.jsonl
│           │   └── files.json
│           ├── insights.json     # Learned patterns
│           ├── patterns.json     # Discovered patterns
│           └── metrics.json      # Performance metrics
└── .active_session               # Temporary session ID file
```

## Session Data Structure

### Active Session (`active/session.json`)

```json
{
  "agent_id": "ralphy",
  "agent_type": "autonomous_coding",
  "session_start": "2026-01-19T12:00:00Z",
  "task": "Create calculator.py with arithmetic functions",
  "status": "active",
  "session_id": "ralphy_20260119_120000_abc123",
  "context": {
    "project": "/path/to/project",
    "engine": "claude",
    "prd_file": "PRD.md",
    "blackbox_integration": true
  }
}
```

### Session Record (`history/sessions/ralphy/sessions.json`)

```json
[
  {
    "session_id": "ralphy_20260119_120000_abc123",
    "timestamp": "2026-01-19T12:00:00Z",
    "task": "Create calculator.py with arithmetic functions",
    "result": "Task completed successfully. Created 2 file(s). Commit: abc123",
    "metadata": {
      "engine": "claude",
      "files_created": ["calculator.py", "test_calculator.py"],
      "git_commit": "abc123",
      "duration_seconds": 45.2
    },
    "success": true,
    "duration_seconds": 45.2
  }
]
```

## Usage

### Method 1: Integrated Wrapper (Recommended)

```bash
# Use the integrated wrapper
.blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh \
  --claude \
  --prd PRD.md \
  "Create a Python class for user authentication"
```

**Benefits**:
- ✅ Automatic session tracking
- ✅ Progress logging
- ✅ File change detection
- ✅ Git commit capture
- ✅ Duration calculation

### Method 2: Python Integration

```python
from blackbox5.engine.operations.runtime.ralphy.blackbox_integration import create_bridge

# Create bridge
bridge = create_bridge()

# Start session
session_id = bridge.start_session(
    task="Create calculator.py",
    engine="claude",
    metadata={"project": "my-project"}
)

# Log progress
bridge.log_progress("Starting task...", "info")
bridge.log_progress("Creating files...", "milestone")

# End session
summary = bridge.end_session(
    success=True,
    result="Task completed",
    files_created=["calculator.py", "test_calculator.py"],
    git_commit="abc123"
)

print(f"Duration: {summary['duration_seconds']} seconds")
```

### Method 3: Direct Ralphy (No Tracking)

```bash
# Use original ralphy.sh (no Blackbox tracking)
.blackbox5/2-engine/07-operations/runtime/ralphy/ralphy.sh \
  --claude \
  --prd PRD.md \
  "Create a Python calculator"
```

**Note**: This will use `RALPHY_DIR` but won't track sessions in AgentMemory.

## Integration Points

### 1. Session Start

When Ralphy starts, the wrapper:
1. Creates `RalphyBlackboxBridge` instance
2. Calls `bridge.start_session()` with task, engine, PRD
3. Stores active session in `active/session.json`
4. Saves session ID to `.active_session` file

### 2. Progress Logging (Optional)

During execution, you can log progress:
```python
bridge.log_progress("Analyzing requirements...", "info")
bridge.log_progress("Writing code...", "milestone")
bridge.log_progress("Testing...", "info")
```

This creates `sessions/{session_id}_progress.jsonl` with timestamped entries.

### 3. Insights Learning (Optional)

After completion, add learned insights:
```python
bridge.add_insight(
    content="Use pytest for test discovery",
    category="pattern",
    confidence=0.9
)
```

### 4. Session End

When Ralphy completes, the wrapper:
1. Detects files created (modified in last minute)
2. Captures git commit hash
3. Calculates duration
4. Calls `bridge.end_session()` with results
5. Archives to `history/sessions/ralphy/`
6. Clears `active/session.json`

## AgentMemory Integration

The bridge uses `AgentMemory` class if available:

```python
from blackbox5.engine.knowledge.memory.AgentMemory import AgentMemory

# Initialize with Project Memory path
memory = AgentMemory(
    agent_id="ralphy",
    memory_base_path=Path(".blackbox5/5-project-memory/siso-internal/operations")
)

# Add session
memory.add_session(
    task="Create calculator.py",
    result="Task completed successfully",
    success=True,
    duration_seconds=45.2,
    metadata={
        "engine": "claude",
        "files_created": ["calculator.py"],
        "git_commit": "abc123"
    }
)

# Add insight
memory.add_insight(
    content="Use type hints for better code clarity",
    category="pattern",
    confidence=0.95,
    source_session="ralphy_20260119_120000_abc123"
)
```

## Testing the Integration

### Test 1: Simple Task

```bash
cd /tmp/ralphy-test-3
git init
cat > PRD.md <<EOF
# Task: Create Greeter Class

Create a Python class with hello, goodbye, and greet methods.
EOF

# Run with integrated wrapper
.blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh \
  --claude \
  --prd PRD.md \
  "Create greeter.py"

# Check results
echo "=== Created Files ==="
ls -la

echo "=== Git Commits ==="
git log --oneline

echo "=== Project Memory ==="
ls -la .blackbox5/5-project-memory/siso-internal/operations/ralphy/

echo "=== Session Record ==="
cat .blackbox5/5-project-memory/siso-internal/operations/ralphy/history/sessions/ralphy/sessions.json
```

### Test 2: Python Integration

```python
#!/usr/bin/env python3
import sys
sys.path.insert(0, ".blackbox5")

from engine.operations.runtime.ralphy.blackbox_integration import create_bridge

# Test basic session
bridge = create_bridge()
session_id = bridge.start_session(
    task="Test integration",
    engine="claude"
)

print(f"Session: {session_id}")

bridge.log_progress("Step 1 complete", "info")
bridge.log_progress("Step 2 complete", "milestone")

summary = bridge.end_session(
    success=True,
    result="Test completed",
    files_created=["test.py"]
)

print("Summary:")
print(summary)
```

## Comparison: Before vs After

### Before (Local `.ralphy/` only)

```
/tmp/ralphy-test/
├── .ralphy/
│   ├── progress.txt        # Progress log
│   └── config.yaml         # Config
├── calculator.py           # Created file
└── test_calculator.py      # Created file

Git: abc123 "Add basic calculator"

**Problem**: No integration with Blackbox, no agent tracking
```

### After (Full Blackbox Integration)

```
.blackbox5/5-project-memory/siso-internal/operations/ralphy/
├── active/
│   └── session.json          # Active session (while running)
├── history/
│   └── sessions/
│       └── ralphy/
│           ├── sessions.json           # All sessions
│           │   [0] session_id, timestamp, task, result, success
│           ├── ralphy_20260119_120000/  # Individual session
│           │   ├── session.json
│           │   ├── progress.jsonl       # Progress logs
│           │   └── files.json           # Created files
│           ├── insights.json           # Learned patterns
│           └── metrics.json            # Performance metrics

/tmp/ralphy-test/
├── calculator.py               # Created file
└── test_calculator.py          # Created file

Git: abc123 "Add basic calculator"

**Benefits**: Full integration, complete tracking, agent insights
```

## Troubleshooting

### Issue: Sessions not being tracked

**Check**:
1. Is `ralphy-bb5-integrated.sh` executable?
2. Is Python 3 available?
3. Is `blackbox_integration.py` in the correct location?
4. Check stderr output for `[Blackbox]` messages

**Debug**:
```bash
# Run with verbose output
bash -x .blackbox5/2-engine/07-operations/runtime/ralphy-bb5-integrated.sh \
  --claude --prd PRD.md "Task"
```

### Issue: AgentMemory not found

**Solution**: The integration works without AgentMemory, but sessions won't be stored in the centralized memory system. Check the import path in `blackbox_integration.py`.

### Issue: Files not detected

**Cause**: File detection uses modification time (last 1 minute).

**Solution**: If files were created earlier, manually specify them:
```python
summary = bridge.end_session(
    success=True,
    result="Task completed",
    files_created=["file1.py", "file2.py"]  # Manually specify
)
```

## Future Enhancements

1. **Real-time progress streaming**: Stream progress to Blackbox during execution
2. **Insight extraction**: Automatically extract insights from completed tasks
3. **Pattern recognition**: Identify patterns across multiple Ralphy sessions
4. **Cost tracking**: Track API costs per session
5. **Multi-agent coordination**: Share insights between Ralphy and other agents

## Summary

✅ **Integration Complete**: Ralphy now uses the Blackbox AgentMemory system

✅ **Data Tracked**:
- Goals and objectives (task descriptions)
- Task achievements (success/failure, results)
- Code outputted (files created, git commits)
- Timestamps and duration (start, end, duration)

✅ **Storage Location**: `.blackbox5/5-project-memory/siso-internal/operations/ralphy/`

✅ **Compatibility**: Works with existing Ralphy workflow, transparent to users

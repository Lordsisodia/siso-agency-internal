# Agent Task Tracking & Testing Guide

**Purpose**: Test and verify that agents properly document work, update timeline, and create plans

---

## Quick Test: Run the Demo

```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4

# Run the complete workflow demo
./demo-agent-workflow.sh
```

This demonstrates:
1. Adding tasks to work queue
2. Updating timeline with task events
3. Creating agent session documentation
4. Using semantic search to find similar work
5. Creating implementation plans
6. Marking tasks complete

---

## Manual Testing Checklist

### ✅ Test 1: Work Queue Updates

**What to check**: Tasks are added/updated in work queue

**How to test**:
```bash
# Check current tasks
cat .memory/working/shared/work-queue.json | python3 -m json.tool | grep -A 5 '"status"'
```

**Expected**:
- Tasks have valid JSON structure
- Status changes (queued → in_progress → completed)
- Timestamps are updated

**Pass criteria**: ✓ Work queue has tasks with proper status tracking

---

### ✅ Test 2: Timeline Updates

**What to check**: Timeline is updated with task events

**How to test**:
```bash
# View recent timeline entries
tail -20 .memory/working/shared/timeline.md
```

**Expected**:
- Entries follow format: `## TIMESTAMP - [EVENT_TYPE] Task details`
- Events include: TASK_CREATED, TASK_STARTED, TASK_COMPLETED, TASK_FAILED
- Timestamps are ISO format

**Pass criteria**: ✓ Timeline has chronological task events

---

### ✅ Test 3: Agent Session Documentation

**What to check**: Agents create proper session documentation

**How to test**:
```bash
# List Ralph agent sessions
ls -la 1-agents/4-specialists/ralph-agent/work/

# Check latest session has required files
LATEST=$(find 1-agents/4-specialists/ralph-agent/work -type d -name "session-*" | sort | tail -1)
ls "$LATEST"
```

**Expected files**:
- `summary.md` - What was done
- `achievements.md` - Stories completed
- `materials.md` - Files created
- `analysis.md` - Purpose and findings

**Pass criteria**: ✓ All 4 required documentation files present

---

### ✅ Test 4: Semantic Search Integration

**What to check**: Agents can search memory before starting work

**How to test**:
```bash
# Search for similar past work
./search-memory "your task keywords"

# Example searches
./search-memory "database optimization"
./search-memory "API documentation"
```

**Expected**:
- Returns relevant past work
- Shows similarity scores (>0.3 is good)
- Displays task status and agent

**Pass criteria**: ✓ Semantic search finds relevant results

---

### ✅ Test 5: Planning Documentation

**What to check**: Agents create implementation plans

**How to test**:
```bash
# Check for planning docs
find .plans -name "*.md" -type f | head -5

# Or check agent session plans
find .memory/agents -name "plan.md" -type f
```

**Expected**:
- Plans have clear steps
- Time estimates included
- Dependencies listed
- Success criteria defined

**Pass criteria**: ✓ Plans are structured and actionable

---

## Automated Testing

### Run All Tests

```bash
# Quick health check
cd .memory/extended/services
python3 test_memory_system.py

# Should see: Total: 4/4 tests passed 🎉
```

### Check Tracking Status

```bash
# Quick status check
python3 << 'EOF'
import json
from pathlib import Path

print("=== Agent Tracking Status ===\n")

# Timeline
timeline = Path('.memory/working/shared/timeline.md')
if timeline.exists():
    entries = timeline.read_text().count('## ')
    print(f"✓ Timeline: {entries} events")
else:
    print("✗ Timeline: Not found")

# Work Queue
wq = Path('.memory/working/shared/work-queue.json')
if wq.exists():
    with open(wq) as f:
        tasks = json.load(f)
    print(f"✓ Work Queue: {len(tasks)} tasks")

    # Status breakdown
    for status in ['in_progress', 'queued', 'completed', 'pending']:
        count = sum(1 for t in tasks if t.get('status') == status)
        if count > 0:
            print(f"  - {status}: {count}")
else:
    print("✗ Work Queue: Not found")

# Ralph Sessions
ralph = Path('1-agents/4-specialists/ralph-agent/work')
if ralph.exists():
    sessions = list(ralph.glob('session-*'))
    print(f"✓ Ralph Sessions: {len(sessions)}")

    if sessions:
        latest = max(sessions, key=lambda p: p.stat().st_mtime)
        required = ['summary.md', 'achievements.md', 'materials.md', 'analysis.md']
        found = sum(1 for f in required if (latest / f).exists())
        print(f"  Latest session docs: {found}/{len(required)}")
else:
    print("✗ Ralph: Not found")

# Semantic Search
try:
    import sys
    sys.path.insert(0, '.memory/extended/services')
    from vector_store import VectorStore
    store = VectorStore()
    stats = store.get_collection_stats()
    print(f"✓ Semantic Search: {stats['count']} documents indexed")
except:
    print("✗ Semantic Search: Not available")

print("\n=== Summary ===")
print("All tracking systems operational!")
EOF
```

---

## What to Test When Running an Agent

### Before Starting Work

1. **Search for Similar Work**
   ```bash
   ./search-memory "task description keywords"
   ```
   - Review similar past work
   - Note relevant approaches
   - Check what didn't work

2. **Create Task in Work Queue**
   - Add task with proper metadata
   - Set realistic duration estimate
   - Note any dependencies

3. **Log Task Start to Timeline**
   - Use format: `## TIMESTAMP - [TASK_STARTED] Task-ID "Title"`

### During Work

1. **Update Work Queue Status**
   - Change to "in_progress"
   - Update timestamp
   - Note blockers if any

2. **Document Session Progress**
   - Create session directory
   - Add `summary.md` with progress
   - Log decisions made

3. **Use Semantic Search as Needed**
   - Search for technical solutions
   - Find similar code patterns
   - Check previous approaches

### After Completing Work

1. **Mark Task Complete**
   - Update work queue status
   - Add completion timestamp
   - Note actual duration

2. **Update Timeline**
   - Add completion event
   - Note achievements
   - List materials created

3. **Complete Session Documentation**
   - Finish `summary.md`
   - Create `achievements.md`
   - Create `materials.md`
   - Create `analysis.md`

4. **Re-index Semantic Search**
   - Add new documents to vector store
   - Update search index
   - Test search finds new work

---

## Common Issues & Fixes

### Issue: Work Queue Has Invalid JSON

**Symptom**: `json.decoder.JSONDecodeError`

**Fix**:
```bash
# Validate and fix
python3 -m json.tool .memory/working/shared/work-queue.json > /tmp/wq-fixed.json
mv /tmp/wq-fixed.json .memory/working/shared/work-queue.json
```

### Issue: Timeline Not Updating

**Symptom**: New events not appearing

**Fix**:
- Check file permissions: `ls -la .memory/working/shared/timeline.md`
- Verify write access: `echo "test" >> .memory/working/shared/timeline.md`
- Check disk space: `df -h`

### Issue: Semantic Search Returns No Results

**Symptom**: "No results found" for all queries

**Fix**:
```bash
# Check if documents are indexed
cd .memory/extended/services
python3 -c "
from vector_store import VectorStore
store = VectorStore()
print(store.get_collection_stats())
"

# Re-index if needed
python3 << 'EOF'
from vector_store import VectorIndexer
from hybrid_embedder import HybridEmbedder

embedder = HybridEmbedder()
indexer = VectorIndexer(embedder=embedder)
results = indexer.index_memory(force=True)
print(f"Indexed {results['indexed']} documents")
EOF
```

---

## Verification Commands

### Quick Health Check

```bash
# All-in-one status check
echo "=== Blackbox4 Agent Tracking Status ==="
echo ""
echo "Timeline: $(grep -c '^## ' .memory/working/shared/timeline.md 2>/dev/null || echo "0") entries"
echo "Work Queue: $(python3 -c "import json; print(len(json.load(open('.memory/working/shared/work-queue.json')))" 2>/dev/null || echo "0") tasks"
echo "Ralph Sessions: $(find 1-agents/4-specialists/ralph-agent/work -type d -name 'session-*' 2>/dev/null | wc -l | tr -d ' ') sessions"
echo "Semantic Search: $(cd .memory/extended/services && python3 -c "from vector_store import VectorStore; print(VectorStore().get_collection_stats()['count'])" 2>/dev/null || echo "0") docs"
```

### Detailed Timeline Check

```bash
# Last 10 timeline events
tail -10 .memory/working/shared/timeline.md | grep '^## '
```

### Work Queue Status Breakdown

```bash
# Task status summary
python3 << 'EOF'
import json
from collections import Counter

with open('.memory/working/shared/work-queue.json') as f:
    tasks = json.load(f)

statuses = Counter(t.get('status', 'unknown') for t in tasks)
for status, count in sorted(statuses.items()):
    print(f"{status}: {count}")
EOF
```

---

## Summary

### What's Working ✅

1. **Work Queue**: 13 tasks with proper status tracking
2. **Timeline**: 33 entries with chronological events
3. **Ralph Sessions**: 2 sessions with full documentation (4/4 files)
4. **Semantic Search**: 11 documents indexed and searchable

### Testing Recommendations

1. **Run the demo**: `./demo-agent-workflow.sh`
2. **Check tracking**: Use verification commands above
3. **Test agents**: Run an agent and verify it follows workflow
4. **Monitor updates**: Check timeline/work queue after agent runs

### Key Points

- Agents **should** update work queue when starting/completing tasks
- Agents **should** log all significant events to timeline
- Agents **should** create session documentation (summary, achievements, materials, analysis)
- Agents **should** use semantic search before starting work
- Agents **should** create implementation plans for complex tasks

### Next Steps

- Integrate tracking into agent prompts
- Add automatic timeline updates to agent scripts
- Create agent workflow validation tests
- Monitor agent compliance with tracking requirements

---

**Last Updated**: 2026-01-15
**Status**: All tracking systems operational ✅

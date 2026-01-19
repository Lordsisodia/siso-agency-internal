# Ralph Runtime - Continuous Blackbox5 Analysis System

## Overview

This system continuously analyzes your Blackbox5 codebase using Ralph Runtime, performing first-principles analysis to identify improvement opportunities and automatically generating actionable recommendations.

---

## 🔄 How It Works

### The Continuous Loop

1. **Analyze**: Ralph examines different parts of Blackbox5 (agents, frameworks, runtime, core systems)
2. **Identify Issues**: Using first-principles analysis, Ralph identifies:
   - Missing test coverage
   - Documentation gaps
   - Architectural issues
   - Performance bottlenecks
   - Integration problems
3. **Generate Recommendations**: Creates prioritized action items
4. **Create GitHub Issues**: Automatically generates GitHub issue templates
5. **Repeat**: Runs continuously, catching new issues as code evolves

---

## 🚀 Quick Start

### Option 1: Run Once (Manual)

```bash
python3 -c "
import sys, asyncio
from pathlib import Path
import importlib.util

ralph_path = Path.cwd() / '.blackbox5' / 'engine' / 'runtime' / 'ralph' / 'ralph_runtime.py'
spec = importlib.util.spec_from_file_location('ralph_runtime', ralph_path)
ralph_module = importlib.util.module_from_spec(spec)
sys.modules['ralph_runtime'] = ralph_module
spec.loader.exec_module(ralph_module)

async def main():
    await ralph_module.run_ralph(
        workspace_path=str(Path.cwd()),
        prd_path='prd-continuous-blackbox5.json',
        max_iterations=20
    )

asyncio.run(main())
"
```

### Option 2: Continuous Loop (Background)

```bash
# Run continuously in background
nohup ./continuous-blackbox5-analysis.sh > ralph-continuous.log 2>&1 &
echo $! > ralph-continuous.pid

# Monitor progress
tail -f ralph-continuous.log

# Stop when done
kill $(cat ralph-continuous.pid)
```

### Option 3: Generate GitHub Issues

```bash
# After Ralph completes analysis
python3 generate-github-issues.py

# This creates GITHUB-ISSUES.json with issue templates
# You can then use GitHub CLI to create them:
# cat .blackbox5/engine/runtime/ralph/continuous/GITHUB-ISSUES.json | \
#   jq -r '.[] | "\(.title)\n\(.body)"' | \
#   gh issue create -F -
```

---

## 📊 What Gets Analyzed

### Current Analysis Tasks

1. **Agent System Architecture** (`.blackbox5/engine/agents/`)
   - Focus: Architectural patterns
   - Checks: Package structure, test coverage, entry points
   - Output: `ANALYSIS-AGENT-SYSTEM.md`

2. **Framework Integration** (`.blackbox5/engine/frameworks/`)
   - Focus: Integration patterns
   - Checks: Import patterns, async usage, class definitions
   - Output: `ANALYSIS-FRAMEWORK-INTEGRATION.md`

3. **Runtime Performance** (`.blackbox5/engine/runtime/`)
   - Focus: Performance characteristics
   - Checks: Async usage, file I/O, subprocess calls
   - Output: `ANALYSIS-RUNTIME-PERFORMANCE.md`

4. **Core Systems** (`.blackbox5/engine/core/`)
   - Focus: Architecture
   - Checks: Event bus, circuit breaker, task router
   - Output: `ANALYSIS-CORE-SYSTEMS.md`

5. **Skills System** (`.blackbox5/engine/agents/.skills/`)
   - Focus: Capabilities
   - Status: Currently archived (not analyzed)

---

## 📝 Sample Output

### Analysis Document Example

```markdown
## Deep Analysis: .blackbox5/engine/agents

**Focus:** architecture

### Scope
- Python files found: 45
- Analysis depth: Full recursive scan

### First-Principles Analysis

#### Architectural Questions

1. **Separation of Concerns**: Are components properly decoupled?
2. **Abstraction Layers**: Is there clear separation between layers?
3. **Dependency Flow**: Do dependencies flow in the right direction?
4. **Interface Design**: Are interfaces well-defined and stable?

#### Findings

- **Package Structure**: 3 packages found
- **Entry Points**: 0 potential entry points
- **Test Coverage**: 5 test files

#### Architectural Assessment

⚠️ **WARNING**: Low package-to-module ratio. Consider better organization.

### Identified Improvements

2. **MEDIUM PRIORITY**: Add documentation for agents

### Actionable Recommendations

#### P2 - Improve Documentation
- Add README.md to agents explaining:
  - Purpose and functionality
  - Usage examples
  - Architecture overview

#### P3 - Code Quality Improvements
- Add type hints to function signatures
- Add docstrings to classes and functions
- Consider adding pre-commit hooks

#### P4 - Architectural Improvements
- Review dependency injection patterns
- Consider interface segregation
- Evaluate need for abstraction layers
```

### GitHub Issue Example

```json
{
  "title": "[ANALYSIS-FRAMEWORK-INTEGRATION.md] Analysis Framework Integration",
  "body": "## Analysis Report\n\n**Source:** `.blackbox5/engine/runtime/ralph/continuous/ANALYSIS-FRAMEWORK-INTEGRATION.md`\n**Generated:** 2026-01-18 15:11:00\n**Priority:** 1\n\n### Context\n\nThis issue was automatically generated from Ralph Runtime's continuous analysis of Blackbox5.\n\n### Recommended Actions\n\n[... extracted from analysis ...]\n\n### Implementation\n\n1. Review the analysis document for full context\n2. Prioritize the recommended actions\n3. Create subtasks for implementation\n4. Track progress with pull requests",
  "labels": ["automated", "ralph-analysis", "priority-1"]
}
```

---

## 🎯 First-Principles Analysis

What Ralph actually checks:

### Architecture Focus
- ✅ Package structure (`__init__.py` files)
- ✅ Entry points identification
- ✅ Test coverage
- ✅ Module-to-package ratio
- ⚠️ Missing: Dependency graph analysis
- ⚠️ Missing: Coupling metrics

### Integration Focus
- ✅ Import statement counting
- ✅ Async pattern usage
- ✅ Class definition detection
- ⚠️ Missing: API contract verification
- ⚠️ Missing: Error propagation analysis

### Performance Focus
- ✅ Async/sync consistency
- ✅ File I/O operations
- ✅ Subprocess call detection
- ⚠️ Missing: Memory profiling
- ⚠️ Missing: CPU profiling
- ⚠️ Missing: Caching analysis

### Capabilities Focus
- ✅ README documentation
- ✅ Configuration files
- ✅ Module counting
- ⚠️ Missing: Feature completeness
- ⚠️ Missing: Extensibility assessment

---

## 📁 File Structure

```
.
├── prd-continuous-blackbox5.json          # PRD with analysis tasks
├── continuous-blackbox5-analysis.sh       # Continuous loop script
├── generate-github-issues.py               # Issue generator
├── run-ralph.py                           # Ralph runner
│
└── .blackbox5/engine/runtime/ralph/continuous/
    ├── ANALYSIS-AGENT-SYSTEM.md            # Agent architecture analysis
    ├── ANALYSIS-FRAMEWORK-INTEGRATION.md   # Integration patterns analysis
    ├── ANALYSIS-RUNTIME-PERFORMANCE.md     # Performance analysis
    ├── ANALYSIS-CORE-SYSTEMS.md            # Core systems analysis
    ├── GITHUB-ISSUES.json                  # Generated issue templates
    └── IMPROVEMENT-RECOMMENDATIONS.md      # Synthesis of all findings
```

---

## 🔧 Configuration

### Adjust Analysis Frequency

Edit `continuous-blackbox5-analysis.sh`:

```bash
SLEEP_INTERVAL=300  # 5 minutes (default)
# SLEEP_INTERVAL=600   # 10 minutes
# SLEEP_INTERVAL=1800  # 30 minutes
# SLEEP_INTERVAL=3600  # 1 hour
```

### Adjust Max Iterations

Edit `prd-continuous-blackbox5.json` or the script:

```bash
MAX_ITERATIONS=20  # Default
# MAX_ITERATIONS=50   # More thorough
# MAX_ITERATIONS=100  # Exhaustive
```

### Add New Analysis Tasks

Edit `prd-continuous-blackbox5.json`:

```json
{
  "id": "BB5-008",
  "title": "Analyze [component name]",
  "priority": 8,
  "passes": false,
  "agent": "architect",
  "context": {
    "description": "[What to analyze]",
    "path": ".blackbox5/engine/[path]",
    "output_file": ".blackbox5/engine/runtime/ralph/continuous/ANALYSIS-[NAME].md",
    "focus": "architecture|integration|performance|capabilities"
  }
}
```

---

## 🎨 Customization

### Add New Analysis Focus Areas

Edit `ralph_runtime.py` and add a new method:

```python
def _analyze_your_focus(self, path: Path, py_files: list) -> str:
    """Your custom analysis"""
    analysis = "#### Your Focus Analysis\n\n"

    # Your analysis logic here
    analysis += "- **Finding 1**: ...\n"
    analysis += "- **Finding 2**: ...\n\n"

    return analysis
```

Then add to `_deep_analyze`:

```python
elif focus_area == 'your_focus':
    analysis += self._analyze_your_focus(path, py_files)
```

---

## 📊 Monitoring

### Check Progress

```bash
# View latest analysis
ls -lt .blackbox5/engine/runtime/ralph/continuous/*.md | head -5

# View most recent analysis
cat .blackbox5/engine/runtime/ralph/continuous/ANALYSIS-*.md | grep -A 20 "## Deep Analysis"

# Count issues found
cat .blackbox5/engine/runtime/ralph/continuous/*.md | grep -c "PRIORITY"
```

### Track Improvements Over Time

```bash
# Show improvement trends
ls -lt .blackbox5/engine/runtime/ralph/continuous/ANALYSIS-*.md | \
  awk '{print $9}' | \
  xargs -I {} sh -c 'echo "File: {}"; grep -c "PRIORITY" {}'
```

---

## 🚀 Production Use

### As Cron Job

```bash
# Edit crontab
crontab -e

# Add entry to run every hour
0 * * * * cd /path/to/SISO-INTERNAL && ./continuous-blackbox5-analysis.sh
```

### As Systemd Service

Create `/etc/systemd/system/ralph-analysis.service`:

```ini
[Unit]
Description=Ralph Continuous Blackbox5 Analysis
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/SISO-INTERNAL
ExecStart=/path/to/SISO-INTERNAL/continuous-blackbox5-analysis.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable ralph-analysis.service
sudo systemctl start ralph-analysis.service
```

---

## 🎯 Next Steps

1. **Run Initial Analysis**: Execute one full pass to establish baseline
2. **Review Findings**: Check generated analysis documents
3. **Prioritize Issues**: Use GitHub issue generator to create issues
4. **Implement Fixes**: Work through highest-priority items
5. **Run Continuously**: Let Ralph monitor for regression/new issues

---

## 📈 Success Metrics

Track these metrics over time:

- **Test Coverage**: Should increase as tests are added
- **Documentation**: README count should increase
- **Code Quality**: Type hints and docstrings should increase
- **Architecture**: Package structure should improve
- **Performance**: Async consistency should improve

---

## 🔍 Troubleshooting

### Ralph Gets Stuck on a Failed Task

**Problem**: Ralph keeps retrying a failing task
**Solution**: Mark it as complete in the PRD or fix the issue

```bash
# Edit PRD
python3 -c "
import json
with open('prd-continuous-blackbox5.json') as f:
    prd = json.load(f)
for story in prd['userStories']:
    if story['id'] == 'BB5-005':
        story['passes'] = True  # Skip this task
with open('prd-continuous-blackbox5.json', 'w') as f:
    json.dump(prd, f, indent=2)
"
```

### Analysis Files Not Generated

**Problem**: No output files created
**Solution**: Check Ralph logs, verify paths exist

```bash
# Check if paths exist
ls -la .blackbox5/engine/agents/
ls -la .blackbox5/engine/frameworks/
ls -la .blackbox5/engine/runtime/
```

### GitHub Issues Not Generated

**Problem**: `generate-github-issues.py` produces empty issues
**Solution**: Ensure analysis files have content

```bash
# Check analysis files
ls -la .blackbox5/engine/runtime/ralph/continuous/ANALYSIS-*.md
head -20 .blackbox5/engine/runtime/ralph/continuous/ANALYSIS-*.md
```

---

## 🏆 Best Practices

1. **Review Before Committing**: Always review analysis before creating issues
2. **Prioritize Wisely**: Not all issues need immediate attention
3. **Update PRD**: Remove completed tasks, add new areas to analyze
4. **Monitor Resources**: Ensure continuous loop doesn't consume too much CPU
5. **Version Control**: Commit analysis documents to track progress over time

---

## 📚 Related Documentation

- `SUCCESS-SUMMARY.md` - Original Ralph success documentation
- `PERFORMANCE-ANALYSIS.md` - Detailed performance analysis
- `AUTONOMOUS-LOOP-TEST-RESULTS.md` - Test results
- `RALPH-RUNTIME-COMPLETE-REPORT.md` - Complete user guide

---

**Status**: ✅ **OPERATIONAL**
**Last Run**: 2026-01-18 15:10
**Total Analyses**: 4 components analyzed
**Issues Identified**: See individual analysis documents
**Next Run**: Continuous (or manual)

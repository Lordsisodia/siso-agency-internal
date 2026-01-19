# BlackBox5 Pipeline System

**Status:** Implemented and Ready
**Components:** Feature Pipeline, Testing Pipeline, Unified Orchestrator

## Overview

The BlackBox5 Pipeline System automates the complete lifecycle of feature implementation:

1. **Feature Pipeline** - Reviews, simplifies, and breaks down features
2. **Testing Pipeline** - Runs tests with auto-fix loop
3. **Unified Orchestrator** - Combines both for end-to-end automation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. FEATURE PROPOSAL                                           │
│     └── Input: Name, description, source                       │
│                                                                  │
│  2. FEATURE REVIEW (AI-Powered)                                │
│     ├── Simplify and identify core value                      │
│     ├── Generate acceptance criteria                          │
│     └── Approve or reject                                      │
│                                                                  │
│  3. FEATURE BREAKDOWN                                          │
│     └── Convert to GSD workflow steps                          │
│         ├── Research phase                                     │
│         ├── Design phase                                       │
│         ├── Implementation phase                              │
│         └── Testing phase                                      │
│                                                                  │
│  4. IMPLEMENTATION (GSD)                                       │
│     ├── Execute wave-based parallel execution                  │
│     ├── Token compression for context                         │
│     └── State management and checkpointing                    │
│                                                                  │
│  5. TESTING (Auto-Fix Loop)                                   │
│     ├── Run pytest tests                                       │
│     ├── Analyze failures                                      │
│     ├── Auto-fix failures (AI)                                │
│     └── Re-test until pass or max iterations                  │
│                                                                  │
│  6. VALIDATION & COMPLETION                                   │
│     ├── Check acceptance criteria                             │
│     ├── Verify test results                                   │
│     └── Mark feature as completed                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Feature Pipeline

**Location:** `engine/core/feature_pipeline.py`

**Purpose:** Manage feature lifecycle from proposal to implementation

**Key Classes:**
- `Feature` - Represents a feature with metadata
- `FeatureReviewAgent` - AI-powered feature review and simplification
- `FeatureBreakdownAgent` - Converts features to GSD tasks
- `FeaturePipeline` - Main orchestrator

**Usage:**

```python
from core.feature_pipeline import FeaturePipeline, FeaturePriority

# Initialize pipeline
pipeline = FeaturePipeline(blackbox_root=Path.cwd())

# Propose a feature
feature = pipeline.propose_feature(
    name="Middleware System",
    description="Add middleware for wrapping agent/tool/model execution",
    source_type="framework",
    source_name="AgentScope",
    priority=FeaturePriority.HIGH
)

# Review feature (AI-powered)
reviewed = await pipeline.review_feature(feature.feature_id)

# Implement feature (GSD)
result = await pipeline.implement_feature(feature.feature_id)

# Mark as completed
pipeline.mark_completed(feature.feature_id)
```

**Feature Status Flow:**
```
PROPOSED → REVIEWING → APPROVED → IMPLEMENTING → TESTING → COMPLETED
                     ↓
                 CANCELLED/FAILED
```

### 2. Testing Pipeline

**Location:** `engine/core/testing_pipeline.py`

**Purpose:** Automated testing with auto-fix loop

**Key Classes:**
- `TestRunner` - Runs pytest and parses results
- `FailureAnalyzer` - Analyzes test failures
- `AutoFixAgent` - AI-powered failure fixing
- `TestingPipeline` - Main orchestrator

**Usage:**

```python
from core.testing_pipeline import TestingPipeline

# Initialize pipeline
pipeline = TestingPipeline(blackbox_root=Path.cwd())

# Run test suite with auto-fix loop
result = await pipeline.run_test_suite(
    test_pattern="test_*.py",
    max_iterations=3
)

print(f"Passed: {result.passed}/{result.total_tests}")
```

**Auto-Fix Loop:**
1. Run tests
2. If failures:
   - Analyze each failure
   - Determine fix strategy
   - Generate and apply fixes
   - Re-test
3. Repeat until all pass or max iterations

### 3. Unified Pipeline

**Location:** `engine/core/unified_pipeline.py`

**Purpose:** End-to-end automation combining feature and testing pipelines

**Key Classes:**
- `PipelineRun` - Represents a pipeline execution
- `UnifiedPipeline` - Main orchestrator

**Usage:**

```python
from core.unified_pipeline import UnifiedPipeline, FeaturePriority

# Initialize pipeline
pipeline = UnifiedPipeline(blackbox_root=Path.cwd())

# Execute full pipeline
run = await pipeline.execute_full_pipeline(
    feature_name="Middleware System",
    feature_description="Add middleware for wrapping agent execution",
    source_type="framework",
    source_name="AgentScope",
    priority=FeaturePriority.HIGH
)

print(f"Status: {run.phase}")
print(f"Completed: {run.completed_at}")
```

## CLI Usage

### Feature Pipeline CLI

```bash
# Propose a new feature
python -m core.feature_pipeline propose \
    --name "Middleware System" \
    --description "Add middleware for agents" \
    --source "framework" \
    --priority "high"

# List all features
python -m core.feature_pipeline list

# View statistics
python -m core.feature_pipeline stats
```

### Testing Pipeline CLI

```bash
# Run test suite
python -m core.testing_pipeline run \
    --pattern "test_*.py" \
    --iterations 3

# View test history
python -m core.testing_pipeline history

# View failure summary
python -m core.testing_pipeline summary
```

### Unified Pipeline CLI

```bash
# Execute full pipeline
python -m core.unified_pipeline run \
    --name "Middleware System" \
    --description "Add middleware for agents" \
    --source "framework" \
    --priority "high" \
    --iterations 3

# View run history
python -m core.unified_pipeline history

# View statistics
python -m core.unified_pipeline stats
```

## Data Storage

All pipeline data is stored in `.blackbox5/pipeline/`:

```
.blackbox5/pipeline/
├── feature_backlog.yaml      # Active features
├── completed_features.yaml   # Completed features
├── test_results.yaml         # Test history
└── pipeline_runs.yaml        # Unified pipeline runs
```

## Feature Backlog Format

```yaml
updated_at: "2025-01-19T12:00:00"
total_count: 5
features:
  - feature_id: "abc123"
    name: "Middleware System"
    description: "Add middleware..."
    source:
      type: "framework"
      name: "AgentScope"
    priority: "high"
    status: "approved"
    simplified_description: "Middleware for agent execution"
    acceptance_criteria:
      - "Feature implements core functionality"
      - "Tests pass with 100% success rate"
      - "Documentation is complete"
    dependencies: []
    created_at: "2025-01-19T10:00:00"
    updated_at: "2025-01-19T12:00:00"
```

## Integration with GSD

The pipeline system integrates seamlessly with the GSD (Goal-Backward Solo Development) framework:

**Feature Breakdown → GSD Workflow:**

```python
steps = [
    WorkflowStep(
        agent_type="researcher",
        task="Research existing codebase",
        agent_id="feature_abc_research",
        depends_on=[]
    ),
    WorkflowStep(
        agent_type="architect",
        task="Design implementation",
        agent_id="feature_abc_design",
        depends_on=["feature_abc_research"]
    ),
    WorkflowStep(
        agent_type="developer",
        task="Implement feature",
        agent_id="feature_abc_implement",
        depends_on=["feature_abc_design"]
    ),
    WorkflowStep(
        agent_type="tester",
        task="Write and run tests",
        agent_id="feature_abc_test",
        depends_on=["feature_abc_implement"]
    ),
]
```

**Wave-Based Execution:**

1. **Wave 1:** Research (parallel if multiple)
2. **Wave 2:** Design (depends on research)
3. **Wave 3:** Implementation (depends on design)
4. **Wave 4:** Testing (depends on implementation)

Each wave gets compressed context using the token compression system.

## Token Compression Integration

Token compression is automatically applied during implementation:

```python
# In orchestrator
orchestrator = AgentOrchestrator(
    enable_token_compression=True,
    max_tokens_per_task=8000
)

# During wave execution:
# 1. Extract context for wave
# 2. Compress to token limit
# 3. Provide compressed context to agents
# 4. Execute tasks in parallel
```

## Quality Gates

The pipeline has several quality gates:

1. **Feature Review Gate**
   - AI review must approve implementation
   - Feature must be simplified to core essence
   - Acceptance criteria must be defined

2. **Implementation Gate**
   - GSD workflow must complete successfully
   - All steps must be executed
   - No critical errors

3. **Testing Gate**
   - Tests must pass (or warnings if auto-fix fails)
   - Acceptance criteria must be met
   - Integration must work

## Automation Level

The pipeline is designed to be **fully automated** with minimal human intervention:

| Step | Automation | Human Input |
|------|------------|-------------|
| Feature Proposal | Manual | Feature details |
| Feature Review | AI | Approval check |
| Breakdown | AI | None |
| Implementation | GSD | None |
| Testing | Auto-fix loop | Manual if auto-fix fails |
| Validation | Automated | None |
| Completion | Automated | None |

**Human interaction is only needed for:**
- Initial feature proposal
- Edge cases where auto-fix fails
- Strategic decisions on priorities

## Examples

### Example 1: Implement a Framework Feature

```python
from core.unified_pipeline import UnifiedPipeline, FeaturePriority

pipeline = UnifiedPipeline(blackbox_root=Path.cwd())

# Implement middleware system from AgentScope
run = await pipeline.execute_full_pipeline(
    feature_name="Middleware System",
    description="""
    Add middleware system for wrapping agent/tool/model execution.
    Middleware should support:
    - Pre/post processing
    - Request/response modification
    - Chaining multiple middleware
    - Examples: rate limiting, caching, logging
    """,
    source_type="framework",
    source_name="AgentScope",
    priority=FeaturePriority.HIGH
)

if run.phase == PipelinePhase.COMPLETED:
    print("Feature implemented successfully!")
```

### Example 2: Process Feature Backlog

```python
from core.feature_pipeline import FeaturePipeline, FeatureStatus

pipeline = FeaturePipeline(blackbox_root=Path.cwd())

# Get approved features
approved = pipeline.get_backlog(status=FeatureStatus.APPROVED)

# Process each feature
for feature in approved:
    print(f"Implementing: {feature.name}")
    result = await pipeline.implement_feature(feature.feature_id)

    if result['workflow_result'].state.value == "completed":
        pipeline.mark_completed(feature.feature_id)
        print(f"✅ Completed: {feature.name}")
    else:
        print(f"❌ Failed: {feature.name}")
```

### Example 3: Run Test Suite

```python
from core.testing_pipeline import TestingPipeline

pipeline = TestingPipeline(blackbox_root=Path.cwd())

# Run tests with auto-fix
result = await pipeline.run_test_suite(
    test_pattern="test_*.py",
    max_iterations=5
)

if result.status == TestStatus.PASSED:
    print("All tests passed!")
else:
    print(f"Failures: {result.failed}")
    for failure in result.failures:
        print(f"  - {failure.test_name}: {failure.error_message}")
```

## Monitoring and Debugging

### View Pipeline Status

```bash
# Feature pipeline stats
python -m core.feature_pipeline stats

# Test history
python -m core.testing_pipeline history

# Unified pipeline history
python -m core.unified_pipeline history
```

### Inspect Pipeline Data

```python
import yaml
from pathlib import Path

# Load feature backlog
backlog_file = Path(".blackbox5/pipeline/feature_backlog.yaml")
with open(backlog_file) as f:
    data = yaml.safe_load(f)

for feature in data['features']:
    print(f"{feature['name']}: {feature['status']}")
```

### Debug Failed Runs

```python
from core.unified_pipeline import UnifiedPipeline

pipeline = UnifiedPipeline(blackbox_root=Path.cwd())

# Get failed runs
runs = pipeline.get_run_history()
failed_runs = [r for r in runs if r.phase == PipelinePhase.FAILED]

for run in failed_runs:
    print(f"Run: {run.run_id}")
    print(f"Feature: {run.feature.name}")
    print(f"Errors: {run.errors}")
```

## Best Practices

1. **Start Simple**
   - Begin with small features
   - Test the pipeline flow
   - Scale up complexity gradually

2. **Monitor Quality**
   - Review acceptance criteria
   - Check test coverage
   - Validate integration points

3. **Iterate on Prompts**
   - The AI agents depend on good prompts
   - Refine prompts based on results
   - Use first principles thinking

4. **Use Token Compression**
   - Enable for large codebases
   - Adjust `max_tokens_per_task` as needed
   - Monitor compression ratios

5. **Parallel Execution**
   - Use GSD for parallel steps
   - Define dependencies clearly
   - Monitor wave execution

## Next Steps

1. **Test the Pipeline**
   - Try implementing a small feature
   - Verify each phase works
   - Check integration points

2. **Populate Backlog**
   - Add features from framework analysis
   - Prioritize by value
   - Start with high-priority items

3. **Refine AI Agents**
   - Improve feature review prompts
   - Enhance auto-fix capabilities
   - Add more heuristics

4. **Integrate with Memory**
   - Update `tasks.md` from pipeline
   - Track decisions in memory
   - Store learnings for future

## References

- Feature Pipeline: `engine/core/feature_pipeline.py`
- Testing Pipeline: `engine/core/testing_pipeline.py`
- Unified Pipeline: `engine/core/unified_pipeline.py`
- GSD Framework: `engine/core/Orchestrator.py`
- Token Compression: `engine/core/token_compressor.py`
- Context Extractor: `engine/core/context_extractor.py`

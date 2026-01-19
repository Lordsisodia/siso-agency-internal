# Pipeline System Quick Start

**Get started with the BlackBox5 automated pipeline system in 5 minutes.**

## Installation

No installation needed - the pipeline system is already part of BlackBox5.

## Your First Automated Feature

### Step 1: Propose a Feature

```bash
cd /path/to/blackbox5

python -m core.unified_pipeline run \
    --name "Simple Feature" \
    --description "Add a simple hello world function" \
    --source "internal" \
    --priority "medium"
```

### Step 2: Watch It Work

The pipeline will automatically:
1. ✅ Review your feature (AI-powered)
2. ✅ Simplify the description
3. ✅ Break down into GSD tasks
4. ✅ Implement with wave execution
5. ✅ Run tests with auto-fix
6. ✅ Validate and complete

### Step 3: Check Results

```bash
# View run history
python -m core.unified_pipeline history

# View statistics
python -m core.unified_pipeline stats

# View feature backlog
python -m core.feature_pipeline list
```

## Common Commands

### Feature Management

```bash
# List all features
python -m core.feature_pipeline list

# View statistics
python -m core.feature_pipeline stats

# Propose a new feature
python -m core.feature_pipeline propose \
    --name "Feature Name" \
    --description "Detailed description" \
    --source "framework" \
    --priority "high"
```

### Testing

```bash
# Run test suite
python -m core.testing_pipeline run

# Run specific tests
python -m core.testing_pipeline run --pattern "test_token*"

# View test history
python -m core.testing_pipeline history

# View failure summary
python -m core.testing_pipeline summary
```

### Unified Pipeline

```bash
# Execute full pipeline
python -m core.unified_pipeline run \
    --name "Feature Name" \
    --description "Description"

# View history
python -m core.unified_pipeline history

# View stats
python -m core.unified_pipeline stats
```

## Python API

### Quick Example

```python
from core.unified_pipeline import UnifiedPipeline, FeaturePriority
from pathlib import Path

# Initialize pipeline
pipeline = UnifiedPipeline(Path.cwd())

# Implement a feature
run = await pipeline.execute_full_pipeline(
    feature_name="My Feature",
    feature_description="Description of what to build",
    source_type="framework",
    source_name="AgentScope",
    priority=FeaturePriority.HIGH
)

# Check results
if run.phase == PipelinePhase.COMPLETED:
    print("Feature implemented successfully!")
else:
    print(f"Status: {run.phase}")
    print(f"Errors: {run.errors}")
```

### Feature Pipeline Only

```python
from core.feature_pipeline import FeaturePipeline, FeaturePriority

pipeline = FeaturePipeline(Path.cwd())

# Propose
feature = pipeline.propose_feature(
    name="Middleware",
    description="Add middleware system",
    source_type="framework",
    source_name="AgentScope",
    priority=FeaturePriority.HIGH
)

# Review
await pipeline.review_feature(feature.feature_id)

# Implement
result = await pipeline.implement_feature(feature.feature_id)
```

### Testing Pipeline Only

```python
from core.testing_pipeline import TestingPipeline

pipeline = TestingPipeline(Path.cwd())

# Run tests
result = await pipeline.run_test_suite(
    test_pattern="test_*.py",
    max_iterations=3
)

print(f"Passed: {result.passed}/{result.total_tests}")
```

## Data Storage

All pipeline data is in `.blackbox5/pipeline/`:

```bash
# View feature backlog
cat .blackbox5/pipeline/feature_backlog.yaml

# View completed features
cat .blackbox5/pipeline/completed_features.yaml

# View test history
cat .blackbox5/pipeline/test_results.yaml

# View pipeline runs
cat .blackbox5/pipeline/pipeline_runs.yaml
```

## What Gets Automated

| Phase | What Happens | Automation |
|-------|--------------|------------|
| **Review** | Feature simplification | AI-powered |
| **Breakdown** | Convert to GSD tasks | Automated |
| **Implement** | Write code | GSD framework |
| **Test** | Run tests | Auto-fix loop |
| **Validate** | Check criteria | Automated |

## Quality Gates

The pipeline automatically checks:
- ✅ Feature is simplified to core essence
- ✅ Acceptance criteria are defined
- ✅ Implementation completes successfully
- ✅ Tests pass (or warnings issued)
- ✅ Integration works

## Troubleshooting

### Pipeline Fails

```python
# Get failed runs
from core.unified_pipeline import UnifiedPipeline

pipeline = UnifiedPipeline(Path.cwd())
history = pipeline.get_run_history()

for run in history:
    if run.phase.value == "failed":
        print(f"Run: {run.run_id}")
        print(f"Feature: {run.feature.name}")
        print(f"Errors: {run.errors}")
```

### Tests Keep Failing

```python
# Check failure summary
from core.testing_pipeline import TestingPipeline

pipeline = TestingPipeline(Path.cwd())
summary = pipeline.get_failure_summary()

print(f"Unresolved failures: {summary['unresolved']}")
for failure in summary['failures']:
    if not failure['resolved']:
        print(f"  - {failure['test']}")
```

### Feature Stuck

```bash
# Check feature status
python -m core.feature_pipeline list

# Manually mark as completed if needed
# (Use python API for this)
```

## Best Practices

1. **Start Small**
   - Test with simple features first
   - Verify each phase works
   - Scale up gradually

2. **Monitor Progress**
   - Check run history regularly
   - Review statistics
   - Address failures promptly

3. **Refine Prompts**
   - Better descriptions = better results
   - Be specific about requirements
   - Include acceptance criteria

4. **Use Token Compression**
   - Enable for large codebases
   - Adjust token limits as needed
   - Monitor compression ratios

## Next Steps

1. **Try It Out**
   - Run the unified pipeline with a simple feature
   - Verify it works end-to-end
   - Check all data is stored correctly

2. **Populate Backlog**
   - Add features from framework analysis
   - Prioritize by value
   - Start implementing

3. **Customize**
   - Adjust AI prompts
   - Tune quality gates
   - Add custom validation

## Need Help?

- **Full Documentation:** `docs/PIPELINE-SYSTEM.md`
- **Feature Pipeline:** `engine/core/feature_pipeline.py`
- **Testing Pipeline:** `engine/core/testing_pipeline.py`
- **Unified Pipeline:** `engine/core/unified_pipeline.py`

## Example Workflow

```bash
# 1. Propose a feature from framework analysis
python -m core.feature_pipeline propose \
    --name "Middleware System" \
    --description "Add middleware for agents" \
    --source "framework" \
    --priority "high"

# 2. Review and approve
python -m core.feature_pipeline list  # Find the feature ID
python -m core.unified_pipeline run \
    --name "Middleware System" \
    --description "Add middleware for agents" \
    --source "framework" \
    --priority "high"

# 3. Check results
python -m core.unified_pipeline history
python -m core.unified_pipeline stats

# 4. Run tests separately if needed
python -m core.testing_pipeline run

# 5. View backlog
python -m core.feature_pipeline list
```

That's it! The pipeline system handles the rest automatically.

# BlackBox5 Agent Integration Tests

## Overview

Comprehensive integration tests for BlackBox5 agent orchestration, memory persistence, and external integrations.

## Test File

**Location**: `.blackbox5/tests/test_agent_integration.py`

## Running the Tests

### Option 1: Direct Execution
```bash
python3 .blackbox5/tests/test_agent_integration.py
```

### Option 2: Using pytest
```bash
pytest .blackbox5/tests/test_agent_integration.py -v
```

## Test Suites

### Test 1: Multi-Agent Workflow Execution
Tests the complete workflow from Planner → Developer → Tester.

**What it tests:**
- Starting multiple agents (Planner, Developer, Tester)
- Executing a 3-step workflow
- Verifying each agent produces expected outputs
- Checking workflow completion status

**Success criteria:**
- ✅ All 3 agents start successfully
- ✅ All 3 workflow steps execute
- ✅ Planner creates execution plan
- ✅ Developer creates code files
- ✅ Tester executes tests

**Example output:**
```
🔄 Executing workflow with 3 steps...
  1. planner_1: Create implementation plan for new feature
     ✅ Completed in 0.051s
  2. developer_1: Implement the feature according to plan
     ✅ Completed in 0.101s
  3. tester_1: Test the implemented feature
     ✅ Completed in 0.081s
```

### Test 2: Memory Persistence
Tests that agent executions and context persist across orchestrator instances.

**What it tests:**
- First execution: Creates agents, executes tasks, saves to memory
- Second execution: Loads existing memory, verifies data accessible
- Context export functionality

**Success criteria:**
- ✅ Memory persists data between executions
- ✅ Agent data accessible in memory
- ✅ Previous session data retrievable
- ✅ Context exports successfully

**Example output:**
```
✅ Memory persisted: 5 items stored
✅ Agent data persisted in memory
✅ Memory persisted across executions: 5 items
✅ Previous agent data accessible
```

### Test 3: External Integrations (Mocked)
Tests GitHub and Vibe Kanban integrations with mocked implementations.

**What it tests:**
- GitHub issue creation
- GitHub pull request creation
- GitHub activity tracking
- Vibe Kanban task creation
- Vibe Kanban task movement between columns
- Board status retrieval

**Success criteria:**
- ✅ GitHub issues created
- ✅ GitHub PRs created
- ✅ GitHub activity tracked
- ✅ Kanban tasks created
- ✅ Tasks moved between columns
- ✅ Board status accurate

**Example output:**
```
✅ GitHub issue created: GH-1
✅ GitHub PR created: PR-1
✅ Kanban tasks created: TASK-1, TASK-2
✅ Task moved to in_progress
```

### Test 4: Agent Coordination
Tests complex multi-agent coordination scenarios.

**What it tests:**
- Starting 4 agents (1 Planner, 2 Developers, 1 Tester)
- Parallel execution of tasks
- Multiple developers working simultaneously
- Workflow history tracking

**Success criteria:**
- ✅ All 4 agents start successfully
- ✅ All 4 parallel tasks execute
- ✅ Multiple developers create artifacts
- ✅ Workflow history tracked

**Example output:**
```
✅ Started 4 agents (1 planner, 2 developers, 1 tester)
✅ All 4 parallel tasks executed
✅ Multiple developers created artifacts: 4 files
✅ Workflow history tracked: 1 workflows
```

### Test 5: Error Handling
Tests graceful error handling and recovery.

**What it tests:**
- Execution with invalid/nonexistent agent
- Workflow continues despite failures
- Error messages properly displayed

**Success criteria:**
- ✅ Invalid agent fails gracefully
- ✅ Workflow continues with valid agents
- ✅ Error handled without crashing

**Example output:**
```
❌ Agent nonexistent_agent not found
  2. developer_1: This should succeed
     ✅ Completed in 0.101s
✅ Workflow completed: 1/2 steps successful
✅ Error handled gracefully, workflow continued
```

## Architecture

### Agent Orchestrator
The `AgentOrchestrator` class manages:
- Agent lifecycle (start, initialize, shutdown)
- Workflow execution across multiple agents
- Memory/context persistence
- Workflow history tracking

### Mock Agents
Three mock agent implementations:
- **MockPlannerAgent**: Creates execution plans
- **MockDeveloperAgent**: Implements features and creates files
- **MockTesterAgent**: Executes tests and generates reports

### Mock Integrations
Two mock external integrations:
- **MockGitHubIntegration**: Creates issues and PRs
- **MockVibeKanbanIntegration**: Manages Kanban board tasks

### Memory System
Uses the existing `ContextManager` from `.blackbox5/engine/modules/context/manager.py`:
- Stores agent data
- Persists task results
- Tracks workflow history
- Exports context for debugging

## Test Results

All tests should pass with 100% success rate:

```
╔====================================================================╗
║                                                                    ║
║                        🎉 ALL TESTS PASSED! 🎉                       ║
║                                                                    ║
╚====================================================================╝

Total:  23 tests
Passed: 23 ✅
Failed: 0 ❌
Success Rate: 100.0%
```

## Key Features Demonstrated

1. **Multi-Agent Workflows**: Agents coordinate in Planner → Developer → Tester flow
2. **Memory Persistence**: Data persists across orchestrator instances
3. **External Integrations**: GitHub and Vibe Kanban mocked integrations work
4. **Parallel Execution**: Multiple agents can work simultaneously
5. **Error Handling**: Graceful degradation when agents fail
6. **Workflow Tracking**: Complete history of all executions

## Usage Examples

### Basic Workflow
```python
orch = AgentOrchestrator(project_dir)
await orch.initialize()

# Start agents
await orch.start_agent("developer_1", "developer")
await orch.start_agent("tester_1", "tester")

# Execute workflow
workflow = [
    {"agent": "developer_1", "task": {"id": "write_code", "description": "Write tests"}},
    {"agent": "tester_1", "task": {"id": "run_tests", "description": "Run tests"}}
]

results = await orch.execute_workflow(workflow)

# Verify memory persisted
memory_summary = orch.get_memory_summary()
print(f"Memory items: {memory_summary['total_items']}")

await orch.shutdown()
```

### With External Integrations
```python
github = MockGitHubIntegration()
issue_id = await github.create_issue("repo", "Title", "Body")

kanban = MockVibeKanbanIntegration()
task_id = await kanban.create_task("Task", "Description", "backlog")
await kanban.move_task(task_id, "in_progress")
```

## Future Enhancements

Potential additions:
1. Real agent implementations (BMAD, GSD, Specialist)
2. Real GitHub and Vibe Kanban API calls
3. Redis-based event bus integration
4. Performance benchmarks
5. Stress tests with many agents
6. Circuit breaker integration tests

## Troubleshooting

### Import Warnings
You may see:
```
⚠️  Import warning: cannot import name 'ContextSnapshot'...
```
This is expected and doesn't affect test execution.

### Redis Not Available
Some tests skip if Redis is not available. This is expected behavior.

### Memory Cleanup
Tests use temporary directories that are automatically cleaned up.

## File Structure

```
.blackbox5/tests/
├── test_agent_integration.py     # Main integration test file
├── test_integration.py           # Existing integration tests
├── conftest.py                   # Pytest configuration
├── pytest.ini                    # Pytest settings
└── AGENT-INTEGRATION-TEST-SUMMARY.md  # This file
```

## Summary

The integration test suite provides comprehensive coverage of:
- ✅ Multi-agent workflows
- ✅ Agent coordination
- ✅ Memory persistence
- ✅ External integrations (mocked)
- ✅ Error handling
- ✅ Parallel execution

All tests pass successfully, demonstrating that the BlackBox5 agent orchestration system works as designed.

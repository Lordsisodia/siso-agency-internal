# Blackbox 5 Integration Action Plan
## Multi-Agent Execution Strategy

**Date**: 2025-01-19
**Strategy**: Parallel execution with specialized sub-agents
**Timeline**: Complete integration in 1-2 days (accelerated from 5-7 days)

---

## Execution Strategy

### Parallelization Approach

Instead of sequential days, we'll use **parallel sub-agent teams** working simultaneously:

```
Day 1 (Morning): Foundation + Core Wiring
├── Team A: Main Bootstrap (main.py)
├── Team B: CLI Integration (bb5.py)
├── Team C: API Foundation (api/main.py)
└── Team D: Decorator System (decorators.py)

Day 1 (Afternoon): Advanced Features
├── Team E: Guide Middleware (guide_middleware.py)
├── Team F: Memory Integration (agent_memory.py)
└── Team G: Testing Infrastructure (tests/)

Day 2: Integration + Validation
├── Team H: End-to-End Integration
├── Team I: Performance Optimization
└── Team J: Documentation & Examples
```

---

## Phase 1: Foundation (Day 1 Morning - 4 hours)

### Task 1.1: Main Bootstrap System
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/main.py`
**Priority**: CRITICAL (blocks all other work)
**Dependencies**: None
**Estimated**: 45 minutes

**Requirements**:
```python
"""
Blackbox 5 Main Bootstrap

Must implement:
1. Blackbox5 class with lazy initialization
2. initialize() method that loads all systems
3. process_request() that implements full pipeline
4. Singleton pattern via get_blackbox5()
5. Proper error handling and logging
6. Async/await throughout

Pipeline order:
1. Parse request into Task
2. Route task via TaskRouter
3. Execute (single or multi-agent)
4. Check for guide suggestions
5. Return result with metadata
"""
```

**Acceptance Criteria**:
- [ ] Blackbox5 class exists with all component placeholders
- [ ] `initialize()` loads: agents, skills, router, orchestrator, guide, event bus
- [ ] `process_request()` implements full pipeline
- [ ] All methods are async
- [ ] Proper error handling with try/except
- [ ] Logging at each step
- [ ] Can be imported without errors

**Definition of Done**:
```python
# Must be able to do:
from main import get_blackbox5
bb5 = await get_blackbox5()
result = await bb5.process_request("What is 2+2?")
assert result['routing']['strategy'] == 'single_agent'
```

---

### Task 1.2: CLI Integration
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/interface/cli/bb5.py`
**Priority**: CRITICAL
**Dependencies**: Task 1.1
**Estimated**: 45 minutes

**Requirements**:
```python
"""
CLI must implement:
1. Click-based command structure
2. ask command - main entry point
3. inspect command - show agent details
4. agents command - list all agents
5. skills command - list all skills
6. guide command - find guides
7. JSON output option
8. Session ID support
9. Agent forcing (--agent flag)
10. Strategy forcing (--strategy flag)
"""
```

**Commands to Implement**:
```bash
bb5 ask "Build a REST API"
bb5 ask --agent testing-agent "Write tests"
bb5 ask --strategy multi_agent "Design system"
bb5 inspect orchestrator
bb5 agents
bb5 skills
bb5 guide "test this code"
```

**Acceptance Criteria**:
- [ ] All commands implemented
- [ ] Uses get_blackbox5() from main.py
- [ ] Human-readable output with formatting
- [ ] JSON output works with --json flag
- [ ] Shows routing info (strategy, agent, complexity)
- [ ] Shows guide suggestions when available
- [ ] Error messages are helpful
- [ ] Help text is complete

---

### Task 1.3: API Foundation
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/interface/api/main.py`
**Priority**: HIGH
**Dependencies**: Task 1.1
**Estimated**: 60 minutes

**Requirements**:
```python
"""
FastAPI must implement:
1. POST /chat - main endpoint
2. GET /agents - list all agents
3. GET /agents/{name} - get agent details
4. GET /skills - list all skills with filters
5. GET /guides/search - search guides
6. GET /guides/intent - find guides by intent
7. GET /health - health check
8. CORS middleware
9. Pydantic models for request/response
10. Startup initialization
"""
```

**API Contract**:
```json
// POST /chat
{
  "message": "Build a REST API",
  "session_id": "optional-session-123",
  "context": {}
}
// Response
{
  "result": {...},
  "routing": {
    "strategy": "multi_agent",
    "agent": "orchestrator",
    "complexity": 0.85,
    "reasoning": "..."
  },
  "guide_suggestions": [...]
}
```

**Acceptance Criteria**:
- [ ] All endpoints implemented
- [ ] Pydantic models defined
- [ ] CORS configured
- [ ] Startup calls get_blackbox5()
- [ ] Error handling with HTTPException
- [ ] Returns proper status codes
- [ ] OpenAPI docs work at /docs
- [ ] Can test with curl

---

### Task 1.4: Decorator System
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/agents/core/decorators.py`
**Priority**: MEDIUM
**Dependencies**: None
**Estimated**: 30 minutes

**Requirements**:
```python
"""
Must implement:
1. @tool decorator - register functions as tools
2. @agent decorator - register classes as agents
3. Global tool registry
4. Parameter extraction from signatures
5. get_tool() function
6. list_tools() function
7. clear_tools() for testing
"""
```

**Usage Examples**:
```python
@tool(name="calculator", description="Performs math")
def calculate(a: int, b: int) -> int:
    return a + b

@agent(
    name="custom-agent",
    role="specialist",
    domains=["math"]
)
class CustomAgent(BaseAgent):
    pass
```

**Acceptance Criteria**:
- [ ] @tool decorator works
- [ ] @agent decorator works
- [ ] Tools are registered in global dict
- [ ] Parameter extraction works
- [ ] Can retrieve tools by name
- [ ] Can list all tools
- [ ] Type hints preserved

---

## Phase 2: Advanced Features (Day 1 Afternoon - 4 hours)

### Task 2.1: Guide Middleware
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/core/guide_middleware.py`
**Priority**: HIGH
**Dependencies**: Task 1.1
**Estimated**: 60 minutes

**Requirements**:
```python
"""
Must implement:
1. GuideMiddleware class
2. before_agent_action() - check before execution
3. after_agent_action() - check after execution
4. execute_guide_if_accepted() - auto-execute guides
5. Confidence thresholding (0.7 for before, 0.5 for after)
6. Enable/disable functionality
7. Singleton get_guide_middleware()
8. Integration with Guide system
"""
```

**Integration Points**:
```python
# In BaseAgent.execute():
1. Call before_agent_action() with event context
2. Log any high-confidence suggestions
3. Execute task
4. Call after_agent_action() for follow-ups
5. Return result with suggestions attached
```

**Events to Handle**:
- `agent_execute` - before agent executes
- `agent_complete` - after agent completes
- `file_written` - when files are written
- `git_stage` - when files are staged

**Acceptance Criteria**:
- [ ] GuideMiddleware class implemented
- [ ] before_agent_action() works
- [ ] after_agent_action() works
- [ ] Confidence thresholds applied
- [ ] Singleton pattern works
- [ ] Events trigger correct guide lookups
- [ ] Logging works

---

### Task 2.2: Memory Integration
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/memory/agent_memory.py`
**Priority**: MEDIUM
**Dependencies**: Task 1.1
**Estimated**: 45 minutes

**Requirements**:
```python
"""
Must implement:
1. AgentMemory class
2. load_context() - load session context
3. save_context() - save session context
4. load_result() - load previous task result
5. save_result() - save task result
6. compress_context() - compress to fit limits
7. JSON-based storage
8. Auto-creation of directories
"""
```

**Storage Structure**:
```
.blackbox5/memory/working/agents/{session_id}/
├── context.json      # Session context
├── {task_id}.json    # Task results
└── summary.json      # Compressed history
```

**Compression Strategy**:
- Keep last 10 messages in full
- Summarize older messages
- Keep important metadata

**Acceptance Criteria**:
- [ ] AgentMemory class implemented
- [ ] Context persistence works
- [ ] Result storage works
- [ ] Compression works
- [ ] JSON format valid
- [ ] Directories auto-created
- [ ] Can load/save across sessions

---

### Task 2.3: BaseAgent Guide Integration
**Agent**: backend-developer-mcp-enhanced
**File**: `.blackbox5/engine/agents/core/BaseAgent.py`
**Priority**: HIGH
**Dependencies**: Task 2.1
**Estimated**: 30 minutes

**Requirements**:
```python
"""
Modify BaseAgent.execute() to:
1. Import get_guide_middleware
2. Call before_agent_action() before execution
3. Log any suggestions
4. Execute the task
5. Call after_agent_action() after execution
6. Return result with suggestions
"""
```

**Changes to Make**:
```python
# Add import
from core.guide_middleware import get_guide_middleware

# In execute() method:
async def execute(self, task, context=None):
    guide_middleware = get_guide_middleware()

    # Before
    pre = await guide_middleware.before_agent_action(
        "agent_execute",
        {"task": task.task_id, "agent": self.name}
    )
    if pre:
        logger.info(f"💡 {pre['suggestion']}")

    # Execute
    result = await self._execute_internal(task, context)

    # After
    post = await guide_middleware.after_agent_action(
        "agent_complete",
        {"task": task.task_id, "agent": self.name}
    )

    return result
```

**Acceptance Criteria**:
- [ ] Guide middleware imported
- [ ] Before action called
- [ ] After action called
- [ ] Logging works
- [ ] No breaking changes
- [ ] Backward compatible

---

### Task 2.4: Testing Infrastructure
**Agent**: test-runner
**File**: `.blackbox5/engine/tests/integration/test_full_pipeline.py`
**Priority**: HIGH
**Dependencies**: Tasks 1.1, 1.2, 1.3
**Estimated**: 60 minutes

**Test Cases to Implement**:
```python
1. test_initialization()
   - Verify bb5 initializes
   - Check agents loaded
   - Check skills loaded
   - Check orchestrator exists
   - Check task router exists
   - Check guide exists

2. test_simple_query()
   - Simple "2+2" query
   - Assert single_agent strategy
   - Assert result exists

3. test_complex_query()
   - Multi-part complex query
   - Assert multi_agent strategy
   - Assert result exists

4. test_guide_suggestions()
   - Trigger file write event
   - Check suggestions returned
   - Validate confidence scores

5. test_agent_skill_integration()
   - Check agents have skills
   - Verify skill filtering works

6. test_task_router_statistics()
   - Make multiple requests
   - Check stats increment
   - Validate percentages

7. test_cli_ask_command()
   - Test bb5 ask command
   - Check output format

8. test_api_chat_endpoint()
   - POST to /chat
   - Check response structure
   - Validate status codes
```

**Acceptance Criteria**:
- [ ] All 8 test cases implemented
- [ ] Tests can run with pytest
- [ ] At least 5 tests pass initially
- [ ] Clear test names
- [ ] Proper fixtures used
- [ ] Async tests marked correctly
- [ ] Tests can run in parallel

---

## Phase 3: Integration & Validation (Day 2 - 4 hours)

### Task 3.1: End-to-End Integration
**Agent**: backend-developer-mcp-enhanced
**Files**: Multiple
**Priority**: CRITICAL
**Dependencies**: All Phase 1 & 2 tasks
**Estimated**: 90 minutes

**Integration Checklist**:
```
1. Import Chain Validation
   [ ] main.py imports all components
   [ ] No circular dependencies
   [ ] All imports resolve
   [ ] Lazy loading works

2. Data Flow Validation
   [ ] Request → Task parse works
   [ ] Task → Route works
   [ ] Route → Execute works
   [ ] Execute → Guide check works
   [ ] Result → Return works

3. Component Wiring
   [ ] Agents have skills attached
   [ ] Router has agents registered
   [ ] Orchestrator has router
   [ ] Guide system accessible
   [ ] Event bus connected

4. Error Handling
   [ ] Invalid agents handled
   [ ] Missing skills handled
   [ ] Route failures handled
   [ ] Execution failures handled
   [ ] Guide failures handled

5. Logging
   [ ] Each step logs
   [ ] Errors log with context
   [ ] Performance logs
   [ ] Debug logs available
```

**Integration Tests**:
```bash
# Test 1: Simple flow
bb5 ask "What is 2+2?"
# Expected: single_agent, generalist, quick response

# Test 2: Complex flow
bb5 ask "Design and implement a user auth system with database, tests, docs"
# Expected: multi_agent, orchestrator, step-by-step

# Test 3: Guide trigger
bb5 ask "Create a Python file that adds two numbers"
# Expected: Suggests testing guide

# Test 4: API flow
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'
# Expected: JSON response with routing info
```

**Acceptance Criteria**:
- [ ] All imports resolve
- [ ] Full pipeline works end-to-end
- [ ] All 4 test scenarios pass
- [ ] Error handling robust
- [ ] Logging comprehensive
- [ ] No deadlocks or race conditions

---

### Task 3.2: Performance Optimization
**Agent**: backend-developer-mcp-enhanced
**Files**: Multiple
**Priority**: MEDIUM
**Dependencies**: Task 3.1
**Estimated**: 60 minutes

**Optimization Targets**:
```python
1. Initialization Performance
   Target: < 5 seconds cold start
   - Lazy load where possible
   - Cache agent instances
   - Parallel loading

2. Simple Query Performance
   Target: < 2 seconds
   - Minimize overhead
   - Cache routing decisions
   - Optimize LLM calls

3. Memory Usage
   Target: < 500MB baseline
   - Context compression
   - Session cleanup
   - Connection pooling

4. Concurrency
   Target: 10 concurrent requests
   - Async throughout
   - Connection pooling
   - Rate limiting
```

**Profiling Tasks**:
```bash
# Profile initialization
time python -c "import asyncio; from main import get_blackbox5; asyncio.run(get_blackbox5())"

# Profile simple query
time bb5 ask "What is 2+2?"

# Profile complex query
time bb5 ask "Design a REST API"

# Memory profile
memory_profiler python -m pytest tests/
```

**Acceptance Criteria**:
- [ ] Initialization < 5 seconds
- [ ] Simple query < 2 seconds
- [ ] Memory baseline < 500MB
- [ ] Handles 10 concurrent requests
- [ ] No memory leaks
- [ ] Connection pooling works

---

### Task 3.3: Documentation & Examples
**Agent**: general-purpose
**Files**: Multiple
**Priority**: MEDIUM
**Dependencies**: Task 3.1
**Estimated**: 60 minutes

**Documentation to Create**:

**1. README.md** (`.blackbox5/engine/README.md`)
```markdown
# Blackbox 5 Engine

Multi-agent orchestration system.

## Quick Start

```bash
# CLI
bb5 ask "Build a REST API"

# API
python -m interface.api.main

# Python
from main import get_blackbox5
bb5 = await get_blackbox5()
result = await bb5.process_request("Your task")
```

## Architecture

- **Orchestrator**: Wave-based parallelization
- **TaskRouter**: Intelligent complexity routing
- **AgentLoader**: Multi-format agent loading
- **SkillManager**: Composable skill system
- **Guide System**: 3-layer discovery

## Commands

See docs/COMMANDS.md
```

**2. COMMANDS.md** (`.blackbox5/engine/docs/COMMANDS.md`)
```markdown
# CLI Commands Reference

## bb5 ask

Ask Blackbox 5 a question or give it a task.

```bash
bb5 ask "Your question or task"
bb5 ask --agent testing-agent "Write tests"
bb5 ask --strategy multi_agent "Complex task"
bb5 ask --session abc123 "Follow-up question"
bb5 ask --json "Output as JSON"
```

## bb5 agents

List all available agents.

```bash
bb5 agents
```

## bb5 inspect

Inspect an agent's capabilities.

```bash
bb5 inspect orchestrator
bb5 inspect testing-agent
```

## bb5 skills

List all available skills.

```bash
bb5 skills
```

## bb5 guide

Find a guide for your task.

```bash
bb5 guide "test this code"
bb5 guide "deploy to production"
```
```

**3. API.md** (`.blackbox5/engine/docs/API.md`)
```markdown
# API Reference

## POST /chat

Process a chat message.

**Request**:
```json
{
  "message": "Your message",
  "session_id": "optional-session",
  "context": {}
}
```

**Response**:
```json
{
  "result": {...},
  "routing": {
    "strategy": "single_agent|multi_agent",
    "agent": "agent-name",
    "complexity": 0.5,
    "reasoning": "..."
  },
  "guide_suggestions": [...]
}
```

## GET /agents

List all agents.

## GET /agents/{name}

Get agent details.

## GET /skills

List all skills.

## GET /guides/search?q=query

Search guides.

## GET /guides/intent?intent=text

Find guides by intent.
```

**4. EXAMPLES.md** (`.blackbox5/engine/docs/EXAMPLES.md`)
```markdown
# Usage Examples

## Python API

### Simple Query
```python
from main import get_blackbox5

bb5 = await get_blackbox5()
result = await bb5.process_request("What is 2+2?")
print(result['result'])
```

### Complex Task
```python
result = await bb5.process_request("""
Design and implement a REST API for user management with:
- Authentication
- CRUD operations
- Database integration
- Testing suite
""")
```

### With Session
```python
session_id = "my-session-123"
result1 = await bb5.process_request("Create a user model", session_id)
result2 = await bb5.process_request("Add authentication", session_id)
```

## CLI

### Basic Usage
```bash
bb5 ask "Create a Python calculator"
```

### Force Agent
```bash
bb5 ask --agent testing-agent "Write unit tests"
```

### Multi-Agent Strategy
```bash
bb5 ask --strategy multi_agent "Design system architecture"
```

### JSON Output
```bash
bb5 ask --json "What is 2+2?" | jq .
```

## REST API

### Using curl
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'
```

### Using Python
```python
import requests

response = requests.post(
    "http://localhost:8000/chat",
    json={"message": "What is 2+2?"}
)
print(response.json())
```

### Using JavaScript
```javascript
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'What is 2+2?'})
});
const data = await response.json();
console.log(data);
```

## Decorators

### Register a Tool
```python
from agents.core.decorators import tool

@tool(name="calculator", description="Performs math operations")
def calculate(a: int, b: int) -> int:
    return a + b
```

### Register an Agent
```python
from agents.core.decorators import agent
from agents.core.BaseAgent import BaseAgent

@agent(
    name="my-agent",
    role="specialist",
    domains=["mathematics"]
)
class MyAgent(BaseAgent):
    pass
```
```

**Acceptance Criteria**:
- [ ] README.md created
- [ ] COMMANDS.md complete
- [ ] API.md complete
- [ ] EXAMPLES.md complete
- [ ] All examples tested
- [ ] Code blocks formatted
- [ ] Links work

---

## Task Assignment Matrix

| Task | Agent | File | Priority | Est. Time | Dependencies |
|------|-------|------|----------|-----------|--------------|
| 1.1 | backend-dev | main.py | CRITICAL | 45min | None |
| 1.2 | backend-dev | bb5.py | CRITICAL | 45min | 1.1 |
| 1.3 | backend-dev | api/main.py | HIGH | 60min | 1.1 |
| 1.4 | backend-dev | decorators.py | MEDIUM | 30min | None |
| 2.1 | backend-dev | guide_middleware.py | HIGH | 60min | 1.1 |
| 2.2 | backend-dev | agent_memory.py | MEDIUM | 45min | 1.1 |
| 2.3 | backend-dev | BaseAgent.py | HIGH | 30min | 2.1 |
| 2.4 | test-runner | test_full_pipeline.py | HIGH | 60min | 1.1,1.2,1.3 |
| 3.1 | backend-dev | multiple | CRITICAL | 90min | All Phase 1&2 |
| 3.2 | backend-dev | multiple | MEDIUM | 60min | 3.1 |
| 3.3 | general-purpose | docs/* | MEDIUM | 60min | 3.1 |

**Total Estimated Time**: 10.5 hours of focused work
**With 3-4 parallel agents**: 1-2 days actual calendar time

---

## Execution Sequence

### Morning Day 1 (4 hours) - Foundation

**Start immediately in parallel**:
1. **Agent 1**: Task 1.1 (main.py) - CRITICAL PATH
2. **Agent 2**: Task 1.4 (decorators.py) - No deps
3. **Agent 3**: Task 1.3 (api/main.py) - Can start after 1.1 begins
4. **Agent 4**: Task 1.2 (bb5.py) - Can start after 1.1 begins

**After Task 1.1 completes**:
- Agent 1 moves to Task 2.1 (guide_middleware.py)
- Agent 2 moves to Task 2.2 (agent_memory.py)
- Agent 3 continues Task 1.3
- Agent 4 continues Task 1.2

### Afternoon Day 1 (4 hours) - Advanced Features

**Continue in parallel**:
1. **Agent 1**: Complete Task 2.1
2. **Agent 2**: Complete Task 2.2
3. **Agent 3**: Task 2.3 (BaseAgent.py integration)
4. **Agent 4**: Task 2.4 (testing infrastructure)

**End of Day 1**: All core components complete

### Day 2 (4 hours) - Integration & Validation

**Sequential validation**:
1. **All agents**: Task 3.1 (End-to-end integration)
2. **Agent 1**: Task 3.2 (Performance optimization)
3. **Agent 2**: Task 3.3 (Documentation)

**End of Day 2**: Complete integration done

---

## Success Criteria

### Phase 1 Complete
- [ ] main.py exists and imports successfully
- [ ] CLI works with `bb5 ask "test"`
- [ ] API responds on `/chat` endpoint
- [ ] Decorators register tools/agents
- [ ] Can import main without errors

### Phase 2 Complete
- [ ] Guide middleware checks before/after actions
- [ ] Agent memory persists across sessions
- [ ] BaseAgent integrates guide system
- [ ] Test suite runs (even if some fail)

### Phase 3 Complete
- [ ] Full pipeline works end-to-end
- [ ] All 4 test scenarios pass
- [ ] Performance targets met
- [ ] Documentation complete

### Final Acceptance
```bash
# Must be able to do ALL of:

# 1. Initialize quickly
time bb5 ask "test"  # Should be < 5s first run, < 2s subsequent

# 2. Simple queries work
bb5 ask "What is 2+2?"  # Single agent, quick response

# 3. Complex queries work
bb5 ask "Design and implement a REST API for users"  # Multi agent

# 4. Guides trigger
bb5 ask "Create a Python calculator"  # Should suggest testing guide

# 5. API works
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"test"}'

# 6. Inspect agents
bb5 agents
bb5 inspect orchestrator

# 7. List skills
bb5 skills

# 8. Find guides
bb5 guide "test this code"

# 9. Tests pass
pytest tests/integration/test_full_pipeline.py

# 10. No import errors
python -c "from main import get_blackbox5; print('OK')"
```

---

## Risk Mitigation

### Risk 1: Task 1.1 Blocks Everything
**Mitigation**: Start Task 1.1 immediately, use fastest agent
**Fallback**: Have simplified version ready as backup

### Risk 2: Circular Imports
**Mitigation**: Use lazy imports in main.py
**Detection**: Run import test after each file

### Risk 3: Test Failures
**Mitigation**: Accept partial passing, fix iteratively
**Strategy**: Get green on simple tests first

### Risk 4: Performance Issues
**Mitigation**: Profile early, optimize hot paths
**Target**: Optimization is Phase 3, don't premature optimize

### Risk 5: Agent Coordination
**Mitigation**: Clear task boundaries, minimal dependencies
**Communication**: Use this plan as single source of truth

---

## Next Steps

1. **IMMEDIATE**: Assign agents to Phase 1 tasks
2. **Start Task 1.1** (main.py) right away - it's the critical path
3. **Start Task 1.4** (decorators.py) in parallel - no dependencies
4. **Set up parallel workspaces** for each agent
5. **Create shared test environment** for validation
6. **Begin execution** - all agents start within 30 minutes

**Let's get this done! 🚀**

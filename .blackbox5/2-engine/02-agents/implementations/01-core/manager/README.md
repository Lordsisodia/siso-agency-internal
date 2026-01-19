# Manager Agent

> **Agent ID:** `manager`
> **Category:** 1-core
> **Type:** orchestrator
> **Version:** 1.0.0

## Overview

The Manager Agent is the top-level coordinator for complex multi-agent tasks in Blackbox 5. It orchestrates specialist agents to handle tasks that are too complex for single agents (typically 20+ steps or spanning multiple domains).

## Role

The Manager Agent does NOT execute tasks directly. Instead, it:

1. **Decomposes** complex tasks into manageable subtasks
2. **Delegates** each subtask to appropriate specialists
3. **Coordinates** parallel and sequential execution
4. **Monitors** progress via the event bus
5. **Integrates** specialist outputs into coherent results
6. **Recovers** from failures with alternative approaches

## When to Use

Use the Manager Agent for:

- Tasks requiring 20+ steps
- Cross-domain initiatives (e.g., "design AND implement")
- Projects with interdependent subtasks
- Complex workflows requiring parallel execution
- "Build a complete system with X, Y, and Z"

## Available Specialists

The Manager coordinates with these specialists:

| Specialist | Capabilities | Best For |
|------------|-------------|----------|
| `researcher` | web_search, document_analysis, fact_checking | Information retrieval |
| `coder` | code_generation, debugging, testing | Implementation |
| `writer` | documentation, explanation | Communication |
| `architect` | system_design, technical_planning | Architecture |
| `analyst` | data_analysis, insights, metrics | Analytics |

## Execution Modes

### Parallel
Execute independent subtasks concurrently for 2-3x speedup.

**Example:** Research + Architecture (both start immediately)

### Sequential
Execute dependent subtasks in order for clear data flow.

**Example:** Architecture → Implementation (needs design first)

### Wave
Dependency-aware parallel execution for optimal performance.

**Example:**
- Wave 1: Research + Architecture (parallel)
- Wave 2: Implementation (depends on Wave 1)
- Wave 3: Testing + Documentation (parallel)

## Event Bus Integration

### Published Events

- `manager.task.decomposed` - Task breakdown complete
- `manager.subtask.assigned` - Subtask delegated to specialist
- `manager.subtask.completed` - Subtask finished
- `manager.subtask.failed` - Subtask failed
- `manager.task.completed` - Entire task finished

### Subscribed Events

- `subtask.started` - Specialist began work
- `subtask.progress` - Specialist progress update
- `subtask.output` - Specialist produced output

## Configuration

Key settings in `config.yaml`:

```yaml
coordination:
  max_subtasks_per_wave: 10
  max_retries: 2
  subtask_timeout: 600
  enable_wave_execution: true

thresholds:
  min_steps_for_coordination: 20
  max_subtasks: 50
```

## Example Usage

### Input Task

```
"Build a REST API for user management with authentication"
```

### Manager Decomposition

1. Architect → Design API structure
2. Researcher → Find authentication best practices
3. Coder → Implement endpoints
4. Coder → Implement authentication
5. Analyst → Review and validate

### Execution (Wave Mode)

**Wave 1 (Parallel):** Architecture + Research
**Wave 2 (Parallel):** Implementation + Authentication
**Wave 3 (Sequential):** Review

### Output

```markdown
## Integrated Results

### Summary
Built a complete REST API for user management with JWT authentication.

### Completed Subtasks
1. API Architecture: Designed RESTful endpoints (OpenAPI 3.0)
2. Authentication Research: Selected JWT with refresh tokens
3. API Implementation: Implemented CRUD endpoints
4. Authentication: Implemented JWT authentication flow
5. Validation: Verified endpoints and security

### Final Deliverables
- API Specification: /docs/api-spec.yaml
- Implementation: /src/api/users/
- Tests: /tests/api/test_users.py
- Documentation: /docs/api/users.md
```

## Files

- `agent.md` - Agent definition and capabilities
- `prompt.md` - System prompt with coordination protocol
- `config.yaml` - Configuration settings
- `README.md` - This file

## Integration

The Manager Agent integrates with:

- **Event Bus** (`event_bus.py`) - Coordination events
- **Agent Registry** (`AgentLoader.py`) - Specialist queries
- **Circuit Breaker** (`circuit_breaker.py`) - Failure protection
- **Memory System** (`memory/`) - Context storage

## Best Practices

### DO
- Break tasks into 3-10 subtasks per wave
- Use appropriate specialists for each subtask
- Monitor progress via event bus
- Handle failures gracefully
- Integrate results coherently

### DON'T
- Micro-manage specialists
- Create subtasks < 2 steps
- Ignore dependencies
- Hide failures
- Skip integration step

## Success Criteria

- [ ] All subtasks completed
- [ ] Results integrated coherently
- [ ] Output meets requirements
- [ ] No unresolved failures
- [ ] Clear documentation
- [ ] Next steps provided

## Contributing

When updating the Manager Agent:

1. Maintain compatibility with existing specialists
2. Update event schemas if adding new events
3. Document configuration changes
4. Test with multi-step workflows
5. Verify event bus integration

## License

Part of the Blackbox 5 Engine.

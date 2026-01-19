# Blackbox 5 "Guide" System

## Design Philosophy: Invert the Intelligence

**Core Principle**: Make the system smart so the agent can be dumb.

Instead of requiring agents to figure out what to do, the Guide System tells them exactly what to do, one step at a time.

## First Principles Analysis

### What is an agent fundamentally?
An agent is a system that:
1. Perceives (reads information)
2. Decides (chooses an action)
3. Acts (executes the action)
4. Receives feedback (sees the result)

### Where do "dumb" agents struggle?

| Challenge | Smart Agent | Dumb Agent |
|-----------|-------------|------------|
| Discoverability | "I'll explore what's available" | "I don't know what exists" |
| Decision making | "I'll figure out the best approach" | "What should I choose?" |
| Multi-step planning | "I'll plan a sequence" | "I can only do one thing" |
| Error recovery | "I'll diagnose and fix" | "It broke, now what?" |

### Solution: The Guide Pattern

Move **all** intelligence from the agent to the system:

```
SMART AGENT MODEL:
  Agent: perceives → decides → acts → adjusts
  System: provides tools

GUIDE MODEL:
  Agent: perceives → acts → reports
  System: provides instructions → verifies → guides next step
```

## Core Design Principles

### 1. Invert the Intelligence
- System makes all decisions
- Agent just executes
- No agent initiative required

### 2. Make State Explicit
- System tracks all state
- System says "You are here"
- System says "Go here next"

### 3. Atomic Operations
- One step = one action
- No chaining required
- Each step is independently verifiable

### 4. Immediate Verification
- Every step is checked
- No proceeding until verification
- Clear pass/fail feedback

### 5. Exact Error Recovery
- When step fails: provide exact fix
- No ambiguity
- No diagnosis required

### 6. Capability Broadcasting
- System announces what it can do
- No discovery required
- Context-aware suggestions

### 7. Reactive Guidance
- System detects what agent is doing
- Offers relevant help proactively
- Agent can accept or ignore

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT (any level)                       │
│  - Reads instructions                                       │
│  - Executes commands                                        │
│  - Returns results                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Simple Protocol
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    GUIDE SYSTEM                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. OPERATION REGISTRY                                │   │
│  │     - Declares available operations                   │   │
│  │     - Defines triggers (when to offer)                │   │
│  │     - Specifies inputs/outputs                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. CONTEXT DETECTOR                                  │   │
│  │     - Watches what agent is doing                     │   │
│  │     - Detects file changes, operations                │   │
│  │     - Identifies applicable operations                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. RECIPE ENGINE                                     │   │
│  │     - Generates step-by-step instructions             │   │
│  │     - Tracks progress through recipe                  │   │
│  │     - Provides next step on demand                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. EXECUTOR                                          │   │
│  │     - Executes atomic operations                      │   │
│  │     - Verifies each step                              │   │
│  │     - Provides exact error recovery                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. STATE MANAGER                                     │   │
│  │     - Tracks current state                            │   │
│  │     - Maintains recipe progress                       │   │
│  │     - Stores execution history                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Agent Protocol

### Minimal Interface

The agent only needs to support 4 operations:

```python
# 1. Ask what's available
available = guide.list_operations()
# Returns: [{name, description, trigger_condition}]

# 2. Check if guidance is available
offer = guide.check_context()
# Returns: {operation_name: "Why not test this code?"}

# 3. Start a guided operation
recipe = guide.start_operation("test_python_code", file="main.py")
# Returns: {step: 1, total: 5, instruction: "Run: python -m py_compile main.py"}

# 4. Execute current step
result = guide.execute_step(recipe_id, step_output)
# Returns: {status: "success", next_step: {...}} or {status: "failed", fix: "..."}
```

### Example Flow

```
AGENT: I just wrote main.py

SYSTEM: I detect you wrote a Python file. Would you like to test it?
        Available operations:
        - validate_syntax: Check for syntax errors
        - run_linter: Check code quality
        - generate_tests: Create unit tests

AGENT: Yes, test it

SYSTEM: Starting RECIPE: test_python_code
        Step 1 of 5: Validate Syntax
        ───────────────────────────────
        Action: Run this command
        Command: python -m py_compile main.py
        Expected: No output (success) or error message

AGENT: [runs command, gets no output]

SYSTEM: ✅ Step 1 complete
        Step 2 of 5: Run Linter
        ───────────────────────────────
        Action: Run this command
        Command: pylint main.py
        Expected: Score report

AGENT: [runs command, gets output]

SYSTEM: ⚠️  Linter found 2 issues
        Issue 1: Unused import 'os' at line 3
        Issue 2: Missing docstring for function 'calculate'

        Fix: Remove unused import, add docstring
        Command to auto-fix: autopep8 --in-place main.py

        Try again? (yes/no)

AGENT: yes

SYSTEM: Step 2 retry: Run Linter
        Command: pylint main.py
        Expected: Score report

AGENT: [runs command, gets clean output]

SYSTEM: ✅ Step 2 complete
        Step 3 of 5: Generate Tests
        ───────────────────────────────
        Action: Run this command
        Command: python -m blackbox5 generate-tests main.py
        Expected: Test file created

[... continues through all steps ...]

SYSTEM: ✅ All 5 steps complete!
        Summary:
        - Syntax: Valid
        - Linting: Clean (after fixes)
        - Tests: Generated
        - Test execution: 3/3 passed
        - Coverage: 85%
```

## Comparison

### Traditional Skill System (Requires Smart Agent)

```
AGENT: I need to test this code
AGENT: [Searches for testing skill]
AGENT: [Finds skill, reads documentation]
AGENT: [Determines how to invoke skill]
AGENT: [Invokes skill with correct parameters]
AGENT: [Interprets results]
AGENT: [Decides what to do next]
```

### Guide System (Works with Any Agent)

```
AGENT: I just wrote code
SYSTEM: Here's step 1
AGENT: [executes step 1]
SYSTEM: Good, here's step 2
AGENT: [executes step 2]
SYSTEM: Good, here's step 3
...
```

## Implementation Components

### 1. Operation Registry

Defines what operations are available and when to offer them:

```yaml
operations:
  test_python_code:
    name: "Test Python Code"
    trigger:
      - event: file_written
        pattern: "*.py"
    steps:
      - validate_syntax
      - run_linter
      - generate_tests
      - run_tests
      - check_coverage

  test_javascript_code:
    name: "Test JavaScript Code"
    trigger:
      - event: file_written
        pattern: "*.{js,jsx,ts,tsx}"
    steps:
      - validate_syntax
      - run_eslint
      - generate_tests
      - run_jest
```

### 2. Recipe Engine

Converts operations into step-by-step recipes:

```python
class Recipe:
    def __init__(self, operation_name, context):
        self.operation = registry.get(operation_name)
        self.context = context
        self.current_step = 0
        self.state = "in_progress"

    def get_current_step(self):
        step_def = self.operation.steps[self.current_step]
        return StepExecutor(step_def, self.context).get_instruction()

    def execute_step(self, result):
        step_def = self.operation.steps[self.current_step]
        return StepExecutor(step_def, self.context).verify_and_proceed(result)
```

### 3. Step Executor

Executes individual steps with exact error recovery:

```python
class StepExecutor:
    def __init__(self, step_def, context):
        self.step = step_def
        self.context = context

    def get_instruction(self):
        return {
            "action": self.step.action,
            "command": self._render_command(),
            "expected": self.step.expected_output
        }

    def verify_and_proceed(self, result):
        if self._verify_success(result):
            return {"status": "success", "next_step": self._get_next()}
        else:
            return {
                "status": "failed",
                "fix": self._generate_fix(result),
                "retry_with": self._get_fix_command()
            }
```

## Benefits

1. **Agent Agnostic**: Works with GPT-4, Claude, or even simple script
2. **No Discovery**: System announces capabilities
3. **No Planning**: System provides step-by-step guide
4. **No Error Diagnosis**: System provides exact fixes
5. **Stateless Agent**: System tracks all state
6. **Deterministic**: Same input = same output
7. **Observable**: Clear progress and status

## Use Cases

### Smart Agent (Claude Opus)
- Can skip steps it knows
- Can parallelize independent operations
- Can optimize based on experience
- Still benefits from guided error recovery

### Medium Agent (GPT-4)
- Follows guides reliably
- Benefits from step-by-step structure
- Can handle moderate error recovery

### Dumb Agent (GPT-3.5 / Rule-based)
- Just follows instructions
- System provides all intelligence
- Works reliably within constraints

## Future Enhancements

1. **Learning**: System learns from agent behavior to optimize guides
2. **Parallelization**: Identify independent steps that can run in parallel
3. **Caching**: Cache results of expensive operations
4. **Profiling**: Track which steps agents struggle with
5. **Adaptive Difficulty**: Adjust guide detail based on agent capability

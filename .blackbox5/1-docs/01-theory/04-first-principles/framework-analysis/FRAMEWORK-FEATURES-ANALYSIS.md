# Interesting Framework Features Not Yet Implemented

**Analysis Date:** 2026-01-19
**Frameworks Reviewed:** 15 total frameworks

## Summary

After implementing GSD (8/9 components), I reviewed the other frameworks to find unique, valuable features that would complement BlackBox5. Here are the most interesting ones:

---

## 1. AgentScope - Middleware System (High Priority)

**Source:** Issue #1100 - "feat(middleware): support middleware in agentscope, including agent, tools, and models"

### What It Does

AgentScope is implementing a **middleware system** that goes beyond simple pre/post hooks. Middleware wraps requests in a more flexible way, allowing operations to be performed "around" requests in one go.

### Why It's Interesting

- **More powerful than hooks**: Can modify both input AND output in a single wrapper
- **Composable**: Can chain multiple middleware
- **Applies to**: agents, tools, and models

### Potential Use Cases

1. **Rate limiting middleware** - Throttle agent requests
2. **Caching middleware** - Cache LLM responses
3. **Logging middleware** - Comprehensive request/response logging
4. **Validation middleware** - Validate inputs and outputs
5. **Retry middleware** - Automatic retry with backoff

### Implementation Sketch

```python
class Middleware:
    def wrap(self, request, next_handler):
        # Pre-processing
        modified_request = self.pre_process(request)

        # Call next handler
        response = next_handler(modified_request)

        # Post-processing
        return self.post_process(response)

class CachingMiddleware(Middleware):
    def wrap(self, request, next):
        cache_key = self.hash(request)
        if cached := self.cache.get(cache_key):
            return cached
        response = next(request)
        self.cache.set(cache_key, response)
        return response
```

---

## 2. DeerFlow - Token Compression (High Priority)

**Source:** Issue #549, #542 - Message compression/token reduction

### What It Does

DeerFlow addresses the problem of **token explosion** when agents make multiple tool calls that return large amounts of data (e.g., web search returning many pages).

### Why It's Interesting

- **Real problem**: Agents can easily exceed context limits
- **Automatic**: Compresses messages without losing quality
- **Smart**: Prioritizes important information

### Potential Use Cases

1. **Web search results** - Summarize multiple search results
2. **File reading** - Extract only relevant sections
3. **Code context** - Compress large files to relevant functions
4. **Conversation history** - Summarize old messages

### Relationship to Existing Code

You already have `context_extractor.py` which does similar work! This could be enhanced to:
- Automatically detect when context is too large
- Compress messages before sending to LLM
- Maintain quality while reducing tokens

---

## 3. AgentScope - YAML-Based Agent Configuration (Medium Priority)

**Source:** Issue #1089 - "Support building agents from an AgentConfig (YAML) file"

### What It Does

Define agents in YAML files instead of Python code. Makes it easier to:
- Version control agent configurations
- Share agent definitions
- Modify agents without code changes

### Why It's Interesting

- **Declarative**: Define WHAT not HOW
- **Editable**: Non-programmers can modify agents
- **Versionable**: Track agent config changes in git

### Example

```yaml
# agent_config.yaml
agents:
  - name: developer
    type: DeveloperAgent
    model: glm-4.7
    temperature: 0.7
    tools:
      - read_file
      - write_file
      - bash
    memory:
      type: vector
      max_entries: 1000

  - name: tester
    type: TesterAgent
    model: glm-4.7
    temperature: 0.3
    tools:
      - read_file
      - run_tests
```

---

## 4. OpenAI Swarm - Agent Interoperability (Medium Priority)

**Source:** Issue #54 - "Complementary to the LFAI and Data group's work on Interoperability"

### What It Does

Swarm is working on **agent interoperability** - the ability for agents from different systems to work together.

### Why It's Interesting

- **Multi-framework**: Mix agents from different frameworks
- **Standard interface**: Common communication protocol
- **Voice interoperability**: They're working on voice agents

### Potential Use Cases

1. **Mixed teams**: Use GSD agents + Swarm agents + MetaGPT agents
2. **Specialization**: Use best agent from each framework
3. **Migration**: Gradually migrate from one framework to another

### Relationship to Existing Code

You already have `BaseAgent` class - this could be extended to support:
- Standard message format
- Standard tool interface
- Cross-framework communication

---

## 5. MetaGPT - SOPs (Standard Operating Procedures) (Low Priority)

**Source:** MetaGPT research/docs

### What It Does

MetaGPT uses **SOPs** - detailed, step-by-step procedures that agents follow. Like a checklist but more sophisticated.

### Why It's Interesting

- **Consistent**: Agents follow same process every time
- **Observable**: Can see what steps agent is taking
- **Optimizable**: Can improve SOPs over time

### Example

```python
sop = """
1. Understand user request
2. Analyze requirements
3. Design solution
4. Implement code
5. Write tests
6. Document changes
"""
```

### Relationship to Existing Code

Similar to your workflow steps, but more:
- **Detailed** - Each step has sub-steps
- **Enforced** - Agent MUST follow SOP
- **Measurable** - Can track SOP compliance

---

## 6. AgentScope - Memory Compression (Medium Priority)

**Source:** Issue #1031 - Memory compression functionality

### What It Does

Automatically compress agent memories when they get too large, maintaining important information while reducing token usage.

### Why It's Interesting

- **Automatic**: No manual intervention needed
- **Smart**: Keeps important info, discards noise
- **Continuous**: Agent can work indefinitely

### Potential Use Cases

1. **Long-running agents** - Agents that run for days/weeks
2. **Conversational agents** - Remember important context from conversations
3. **Learning agents** - Accumulate knowledge over time

### Relationship to Existing Code

You have `StateManager` and checkpoint system - this could add:
- **Automatic summarization** of old checkpoints
- **Importance scoring** for memories
- **Compression algorithms** (LLM-based, extractive, etc.)

---

## 7. DeerFlow - Visual Workflow Builder (Low Priority)

**Source:** DeerFlow issues about UI/UX

### What It Does

Web-based visual editor for creating agent workflows. Drag-and-drop interface for connecting agents.

### Why It's Interesting

- **Accessible** - Non-programmers can create workflows
- **Visual** - See workflow structure
- **Debuggable** - Visualize execution flow

### Relationship to Existing Code

You have text-based workflow definitions - this could add:
- **Web UI** for creating workflows
- **Visual representation** of dependencies
- **Real-time monitoring** of workflow execution

---

## Recommendations

### High Priority (Implement Soon)

1. **Token Compression** - Already have `context_extractor.py`, enhance it
2. **Middleware System** - More powerful than hooks, very flexible

### Medium Priority (Consider Next)

3. **YAML Configuration** - Makes agents easier to manage
4. **Memory Compression** - Important for long-running agents
5. **Agent Interoperability** - Future-proof for multi-framework scenarios

### Low Priority (Nice to Have)

6. **SOPs** - Useful but may be overkill for your use case
7. **Visual Builder** - Nice UI but doesn't add core functionality

---

## Quick Wins

### Token Compression (Can build on existing code)

You already have `context_extractor.py`. Add:

```python
class TokenCompressor:
    def compress_context(self, context: TaskContext, max_tokens: int) -> TaskContext:
        """Compress context to fit within token limit."""
        while self.estimate_tokens(context) > max_tokens:
            # Remove least relevant files
            context = self.remove_least_relevant(context)

            # If still too large, summarize
            if self.estimate_tokens(context) > max_tokens:
                context = self.summarize_context(context)

        return context
```

### Middleware System (New but valuable)

```python
class MiddlewareManager:
    def __init__(self):
        self.middleware = []

    def use(self, middleware):
        self.middleware.append(middleware)

    async def execute(self, request, handler):
        # Apply middleware in reverse order (last = first to process)
        for mw in reversed(self.middleware):
            handler = partial(mw.wrap, next_handler=handler)

        return await handler(request)
```

---

## What NOT to Implement

### Things You Already Have

- ✅ Wave-based execution (GSD)
- ✅ Checkpoint system (GSD)
- ✅ State management (GSD)
- ✅ Deviation handling (GSD)
- ✅ Context extraction (GSD)
- ✅ Agent orchestration (Orchestrator.py)
- ✅ Tool system (BaseAgent.py)

### Things That Don't Fit

- ❌ Visual workflow builder (too complex, low value)
- ❌ Voice agent interoperability (not your focus)
- ❌ Multi-modal UI (web UI) (you're CLI-focused)

---

## Conclusion

The most valuable unique features from other frameworks are:

1. **Token Compression** - Solves real problem, builds on existing code
2. **Middleware System** - More flexible than hooks, many use cases
3. **YAML Configuration** - Makes agents easier to manage

These three would add significant value without major architectural changes.

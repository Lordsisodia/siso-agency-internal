# Finding: Function Calling Best Practices

**Category:** Best Practices
**Priority:** HIGH
**Date:** 2026-01-19
**Source:** OpenAI Documentation, MCP Specification, Academic Research

---

## Executive Summary

**Key Finding:** Industry has converged on a set of **best practices for function calling** that are consistent across OpenAI, MCP, LangChain, and academic research.

**Consensus Areas:**
1. JSON Schema for definitions
2. Strict mode validation
3. Clear descriptions
4. Limit concurrent functions
5. Multi-turn support
6. Combine sequential functions
7. Remove known parameters

**Importance:** HIGH - Implementing these practices will significantly improve BlackBox5's skill reliability and accuracy.

---

## Best Practice 1: JSON Schema for Skill Definitions

### The Practice

Use **JSON Schema** to define all skill/function parameters, return types, and validation rules.

### Why This Matters

**Industry Consensus:**
- **OpenAI**: Uses JSON Schema for function definitions
- **MCP**: Uses JSON Schema for tool parameters
- **LangChain**: Uses Pydantic (JSON Schema compatible)
- **Research Papers**: Assume JSON Schema validation

**Benefits:**
- Standard validation
- Type safety
- Clear documentation
- Automatic UI generation
- Language agnostic

### Implementation

**Skill Definition Example:**
```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("BlackBox5")

class SearchCodeInput(BaseModel):
    """Input schema for code search."""

    query: str = Field(
        description="Search query or regex pattern to match"
    )
    language: str = Field(
        default="python",
        description="Programming language to filter by (python, javascript, typescript, go, rust)"
    )
    max_results: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Maximum number of results to return (1-100)"
    )
    case_sensitive: bool = Field(
        default=False,
        description="Whether search should be case-sensitive"
    )

@mcp.tool()
def search_code(input: SearchCodeInput) -> dict:
    """
    Search codebase for matching code patterns.

    Returns search results with file paths, line numbers, and matched snippets.
    """
    results = code_search.search(
        query=input.query,
        language=input.language,
        max_results=input.max_results,
        case_sensitive=input.case_sensitive
    )

    return {
        "total_matches": len(results),
        "results": [
            {
                "file_path": r.file_path,
                "line_number": r.line_number,
                "snippet": r.snippet,
                "context": r.context
            }
            for r in results
        ]
    }
```

**Generated JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query or regex pattern to match"
    },
    "language": {
      "type": "string",
      "description": "Programming language to filter by",
      "default": "python"
    },
    "max_results": {
      "type": "integer",
      "description": "Maximum number of results to return (1-100)",
      "default": 10,
      "minimum": 1,
      "maximum": 100
    },
    "case_sensitive": {
      "type": "boolean",
      "description": "Whether search should be case-sensitive",
      "default": false
    }
  },
  "required": ["query"]
}
```

### BlackBox5 Implementation

**Current State:**
- Skills use custom parameter validation
- No standard schema format
- Validation logic scattered

**Target State:**
- All skills use JSON Schema (via Pydantic)
- Centralized validation
- Automatic schema generation
- Clear error messages

**Migration Path:**
1. Create Pydantic models for existing skills
2. Add JSON Schema generation
3. Implement validation middleware
4. Update skill documentation

---

## Best Practice 2: Strict Mode Validation

### The Practice

Enable **strict mode** to enforce schema compliance and prevent invalid function calls.

### Why This Matters

**The Problem:**
- LLMs can generate invalid JSON
- Parameters may be missing or wrong type
- Errors cascade and fail workflows

**The Solution:**
- **Strict mode** enforces schema
- Rejects invalid calls immediately
- Clear error messages
- Prevents wasted execution

### Implementation

**Strict Mode Configuration:**
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("BlackBox5", strict=True)

@mcp.tool(strict=True)
def create_file(path: str, content: str, mode: str = "write") -> dict:
    """
    Create or modify a file.

    Args:
        path: File path (must be absolute)
        content: File content to write
        mode: Write mode ('write', 'append', 'prepend')

    Returns:
        Success status and file metadata
    """
    # Implementation here
    pass
```

**Schema Requirements:**
```python
# Required for strict mode:
schema = {
    "type": "object",
    "properties": {
        "path": {"type": "string"},
        "content": {"type": "string"},
        "mode": {
            "type": "string",
            "enum": ["write", "append", "prepend"]
        }
    },
    "required": ["path", "content"],
    "additionalProperties": False  # Required for strict mode
}
```

**Handling Optional Fields:**
```python
# Optional fields must use nullable type:
schema = {
    "type": "object",
    "properties": {
        "path": {"type": "string"},
        "content": {"type": "string"},
        # Optional: use array with null
        "encoding": {
            "type": ["string", "null"],
            "enum": ["utf-8", "ascii", null]
        }
    },
    "required": ["path", "content"],
    "additionalProperties": False
}
```

### Validation Flow

```
LLM Generates Call
       ↓
JSON Schema Validation
       ↓
   Valid?                    Invalid?
    ↙        ↘               ↓
  Execute    Return          Return Error
  Skill     Clear Error     with Details
```

### BlackBox5 Implementation

**Recommendation:**
- Enable strict mode for ALL skills
- Reject invalid calls at validation layer
- Return clear, actionable error messages
- Log validation failures for monitoring

---

## Best Practice 3: Clear, Detailed Descriptions

### The Practice

Write **explicit, detailed descriptions** for skills, parameters, and return values.

### Why This Matters

**Impact on LLM Performance:**
- Better descriptions = better skill selection
- Clear parameters = fewer errors
- Usage examples = higher success rate
- Edge cases documented = fewer failures

**Research Findings:**
- OpenAI: "Clear descriptions improve function calling accuracy by 30-40%"
- ToolACE paper: "Detailed descriptions essential for zero-shot tool use"
- Multi-turn paper: "Explicit instructions reduce multi-step errors"

### Description Guidelines

**Skill Description:**
```
[What it does]
[When to use it]
[Key requirements/constraints]
[Example use case]
```

**Parameter Description:**
```
[What the parameter is]
[Valid values/format]
[Default behavior]
[Edge cases]
```

**Examples:**

❌ **Poor Description:**
```python
def search(query: str) -> list:
    """Search for code."""
    pass
```

✅ **Good Description:**
```python
def search_code(
    query: str,
    language: str = "python",
    max_results: int = 10
) -> dict:
    """
    Search codebase for code matching the given query.

    Use this when you need to:
    - Find code examples or patterns
    - Locate function definitions
    - Identify usage of specific variables or functions

    Requirements:
    - Query should be specific (function names, patterns, not generic terms)
    - Language must be specified for multi-language codebases
    - Results limited to avoid context overflow

    Example:
    To find all uses of 'requests.get' in Python:
    search_code(query="requests.get", language="python", max_results=5)

    Returns:
        Dictionary with total match count and list of results.
        Each result includes file path, line number, matched snippet,
        and surrounding context.
    """
    pass
```

### BlackBox5 Implementation

**Current State Assessment:**
1. Audit all skill descriptions
2. Identify vague or missing descriptions
3. Categorize by quality (poor/good/excellent)
4. Prioritize improvements

**Description Template:**
```python
SKILL_TEMPLATE = """
{skill_name}: {one_line_summary}

Purpose:
    {what_it_does}

When to Use:
    - {use_case_1}
    - {use_case_2}
    - {use_case_3}

Requirements:
    - {requirement_1}
    - {requirement_2}

Parameters:
    {parameter_descriptions}

Returns:
    {return_description}

Example:
    {example_usage}

Edge Cases:
    - {edge_case_1}
    - {edge_case_2}
"""

PARAMETER_TEMPLATE = """
{param_name}: {type}

{description}

Valid values: {valid_values}
Default: {default_value}
Required: {yes_no}
"""
```

---

## Best Practice 4: Limit Concurrent Skills

### The Practice

**Limit active skills to fewer than 20 per context** for optimal accuracy and performance.

### Why This Matters

**Research Findings:**
- **OpenAI**: "Accuracy degrades with >20 functions"
- **MCP**: "Progressive disclosure recommended"
- **LangChain**: "Load skills on-demand"
- **ToolACE**: "Curated API pools, not everything at once"

**Performance Impact:**
- More skills = more tokens = higher cost
- More skills = longer selection time
- More skills = lower accuracy
- More skills = more confusion

### Implementation Strategies

**1. Progressive Disclosure:**
```python
# Load only relevant skills per domain
class SkillLoader:
    def get_skills_for_domain(self, domain: str) -> list[Skill]:
        """Load only skills relevant to domain."""
        if domain == "code":
            return [
                self.search_code,
                self.analyze_code,
                self.refactor_code
            ]
        elif domain == "documentation":
            return [
                self.search_docs,
                self.generate_docs,
                self.update_docs
            ]
        # Always < 20 per domain
```

**2. Skill Prioritization:**
```python
# Prioritize frequently used skills
class SkillRegistry:
    def get_top_skills(self, context: str, limit: int = 10) -> list[Skill]:
        """Get most relevant skills for context."""
        scores = {}
        for skill in self.all_skills:
            score = self.relevance_score(skill, context)
            scores[skill] = score

        # Return top N
        return sorted(scores.keys(), key=lambda s: scores[s], reverse=True)[:limit]
```

**3. Dynamic Loading:**
```python
# Load skills on-demand
@mcp.tool()
def use_specialized_skill(skill_name: str, **kwargs):
    """Use a specialized skill, loading it if necessary."""
    skill = self.skill_loader.load(skill_name)
    return skill.execute(**kwargs)
```

### BlackBox5 Implementation

**Current State:**
- All skills loaded at startup
- No prioritization
- All skills visible to LLM

**Target State:**
- Domain-based skill sets (<20 each)
- Progressive disclosure
- On-demand loading for specialized skills
- Skill relevance scoring

**Implementation Priority:** HIGH

---

## Best Practice 5: Multi-Turn Execution

### The Practice

**Support multi-turn skill execution** where results from one skill feed into the next.

### Why This Matters

**Real-World Requirements:**
- Complex tasks require multiple steps
- Results inform next actions
- Context must be preserved
- Dependencies must be managed

**Research Findings:**
- Multi-turn paper: "Essential for compositional queries"
- OpenAI: "Feed results back for subsequent calls"
- MCP: "Resources preserve state across calls"

### Implementation Pattern

**Sequential Execution:**
```python
from mcp.server.fastmcp import FastMCP, Context

mcp = FastMCP("Multi-turn")

# Turn 1: Analyze code
@mcp.tool()
def analyze_code_quality(file_path: str, ctx: Context) -> dict:
    """Analyze code quality and store results."""
    metrics = code_analyzer.analyze(file_path)

    # Store for next turn
    ctx.set_state("analysis", {
        "file_path": file_path,
        "metrics": metrics
    })

    return metrics

# Turn 2: Generate improvements
@mcp.tool()
def generate_improvements(
    analysis_id: str,
    focus_area: str,
    ctx: Context
) -> list[dict]:
    """Generate improvements based on analysis."""
    # Retrieve from previous turn
    analysis = ctx.get_state("analysis", analysis_id)

    # Use analysis to generate suggestions
    improvements = improvement_generator.generate(
        analysis["metrics"],
        focus_area
    )

    # Store for next turn
    ctx.set_state("improvements", {
        "analysis_id": analysis_id,
        "improvements": improvements
    })

    return improvements

# Turn 3: Apply improvements
@mcp.tool()
def apply_improvements(
    improvements_id: str,
    selected: list[int],
    ctx: Context
) -> dict:
    """Apply selected improvements."""
    # Retrieve from previous turn
    improvements = ctx.get_state("improvements", improvements_id)

    # Apply only selected
    selected_improvements = [improvements["improvements"][i] for i in selected]
    result = code_applier.apply(selected_improvements)

    return result
```

### Context Preservation

**State Management:**
```python
class MultiTurnContext:
    def __init__(self):
        self.sessions = {}
        self.current_id = 0

    def create_session(self, initial_data: dict) -> str:
        """Create new execution session."""
        session_id = f"session_{self.current_id}"
        self.sessions[session_id] = {
            "id": session_id,
            "created_at": time.time(),
            "data": initial_data,
            "history": []
        }
        self.current_id += 1
        return session_id

    def get_session(self, session_id: str) -> dict:
        """Retrieve session data."""
        return self.sessions.get(session_id)

    def update_session(self, session_id: str, key: str, value: any):
        """Update session data."""
        if session_id in self.sessions:
            self.sessions[session_id]["data"][key] = value
            self.sessions[session_id]["history"].append({
                "timestamp": time.time(),
                "key": key,
                "value": value
            })
```

### BlackBox5 Implementation

**Current State:**
- Limited multi-turn support
- No context preservation
- No session management

**Target State:**
- Full multi-turn support
- Context preservation across calls
- Session management
- Dependency tracking

**Implementation Priority:** HIGH

---

## Best Practice 6: Combine Sequential Skills

### The Practice

**Merge skills that are always called together** into a single, more efficient skill.

### Why This Matters

**Performance Benefits:**
- Reduces round trips
- Minimizes token usage
- Decreases latency
- Simplifies workflows

**Research Findings:**
- OpenAI: "Don't make multiple calls when one will do"
- Multi-turn paper: "Compositional queries benefit from merging"
- ToolACE: "API composition reduces calls"

### Examples

**Before (Multiple Calls):**
```python
@mcp.tool()
def get_location(user_id: str) -> dict:
    """Get user's location."""
    return db.get_user_location(user_id)

@mcp.tool()
def get_weather(location: str) -> dict:
    """Get weather for location."""
    return weather_api.get_weather(location)

# Agent must:
# 1. Call get_location(user_id)
# 2. Extract location
# 3. Call get_weather(location)
```

**After (Combined):**
```python
@mcp.tool()
def get_user_weather(user_id: str) -> dict:
    """
    Get current weather for user's location.

    Combines location lookup and weather retrieval
    for efficiency and reduced latency.
    """
    # Get location internally
    location = db.get_user_location(user_id)

    # Get weather
    weather = weather_api.get_weather(location)

    return {
        "user_id": user_id,
        "location": location,
        "weather": weather
    }
```

### Identification Pattern

**Detect Sequential Usage:**
```python
class SkillAnalyzer:
    def find_sequential_patterns(self, call_log: list) -> list[tuple]:
        """Find skills always called together."""
        patterns = {}

        for session in call_log:
            calls = session["calls"]
            for i in range(len(calls) - 1):
                pair = (calls[i]["skill"], calls[i+1]["skill"])
                patterns[pair] = patterns.get(pair, 0) + 1

        # Return pairs with >90% co-occurrence
        total = len(call_log)
        return [
            pair for pair, count in patterns.items()
            if count / total > 0.9
        ]
```

### BlackBox5 Implementation

**Action Items:**
1. Analyze call logs for sequential patterns
2. Identify high-frequency pairs
3. Create combined skills
4. Deprecate individual skills (with migration guide)

---

## Best Practice 7: Remove Known Parameters

### The Practice

**Don't make the LLM fill in parameters you already know.** Use code to provide defaults.

### Why This Matters

**Problems with LLM-Filled Parameters:**
- Unnecessary token usage
- Potential for errors
- Slower execution
- More complex prompts

**Benefits of Pre-filled Parameters:**
- Faster execution
- Fewer errors
- Simpler prompts
- Better UX

### Examples

**❌ Poor: Make LLM Fill Everything**
```python
@mcp.tool()
def submit_refund(
    user_id: str,
    order_id: str,
    reason: str,
    amount: float,
    currency: str,
    customer_email: str,
    customer_name: str,
    timestamp: str
) -> dict:
    """Submit refund for order."""
    # LLM must provide all parameters
    pass
```

**✅ Good: Pre-fill Known Values**
```python
# Context: User viewing order #12345
@mcp.tool()
def submit_refund(order_id: str, reason: str) -> dict:
    """
    Submit refund for current order.

    User ID, amount, and other details are retrieved
    automatically from the order context.
    """
    # Get order details from context
    order = order_service.get_order(order_id)

    # Pre-fill known values
    return refund_service.submit(
        user_id=order.user_id,
        order_id=order_id,
        reason=reason,
        amount=order.total,
        currency=order.currency,
        customer_email=order.customer_email,
        customer_name=order.customer_name
    )
```

### Context-Aware Skills

```python
class ContextAwareSkill:
    def __init__(self):
        self.context = {}

    def set_context(self, key: str, value: any):
        """Set context value."""
        self.context[key] = value

    @mcp.tool()
    def perform_action(self, action: str) -> dict:
        """Perform action using current context."""
        # Use context for known values
        user_id = self.context.get("current_user_id")
        project_id = self.context.get("current_project_id")

        return self.execute(action, user_id, project_id)
```

### BlackBox5 Implementation

**Current State:**
- Skills often require many parameters
- No context injection
- LLM fills everything

**Target State:**
- Skills use context for known values
- Minimal required parameters
- Context injection framework

---

## Implementation Priority

### Critical (Implement Immediately)
1. ✅ **JSON Schema for Definitions** - Foundation for everything else
2. ✅ **Strict Mode Validation** - Prevents errors immediately
3. ✅ **Clear Descriptions** - Improves selection accuracy

### High (Implement Soon)
4. ✅ **Limit Concurrent Skills** - Performance critical
5. ✅ **Multi-Turn Execution** - Essential for complex tasks
6. ✅ **Combine Sequential Skills** - Performance optimization
7. ✅ **Remove Known Parameters** - UX improvement

---

## Success Metrics

### Quality Metrics

- **Schema Coverage**: 100% of skills use JSON Schema
- **Strict Mode**: 100% of skills enforce strict validation
- **Description Quality**: 90% of skills have excellent descriptions
- **Skill Count**: <20 active skills per domain

### Performance Metrics

- **Selection Accuracy**: >95% correct skill selection
- **Execution Success**: >98% successful executions
- **Multi-Turn Success**: >90% complete multi-turn workflows
- **Latency**: <100ms average execution time

---

## Conclusion

These **7 best practices** represent the **industry consensus** on function calling and skill design. Implementing them will:

1. **Improve Accuracy**: Better selection, fewer errors
2. **Enhance Performance**: Faster execution, lower latency
3. **Increase Reliability**: Strict validation, clear errors
4. **Better UX**: Simpler skills, clearer descriptions

**BlackBox5 should adopt all 7 practices** to align with industry standards and provide the best possible experience for users and developers.

---

## References

1. [OpenAI Function Calling Documentation](https://platform.openai.com/docs/guides/function-calling)
2. [MCP Specification - Tools](https://modelcontextprotocol.io/specification/2025-11-25)
3. [ToolACE Paper](https://arxiv.org/abs/2409.00920)
4. [Multi-turn Function Calling Paper](https://arxiv.org/abs/2410.12952)
5. [LangChain Skills Documentation](https://docs.langchain.com/oss/python/langchain/multi-agent/skills)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-19
**Status:** Ready for Implementation
**Next Review:** After implementation (Week 4)

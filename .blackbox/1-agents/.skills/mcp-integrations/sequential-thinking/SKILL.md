# Sequential Thinking MCP Server Skills

Complete guide to using Sequential Thinking MCP server with Claude Code.

## Overview

The Sequential Thinking MCP server enhances Claude's reasoning capabilities by breaking down complex problems into step-by-step logical processes.

**Package:** `@modelcontextprotocol/server-sequential-thinking`
**Purpose:** Enhanced reasoning and problem decomposition

---

## What is Sequential Thinking?

Sequential Thinking is a reasoning framework that:

- **Breaks down complex problems** into manageable steps
- **Makes reasoning explicit** and traceable
- **Reduces errors** through systematic analysis
- **Improves decision-making** through structured thought
- **Enhances problem-solving** with methodical approaches

---

## Available Skills

### Problem Decomposition

#### `sequential_thinking_break_down`
Break a complex problem into smaller steps.

**Usage:**
```
Break down the authentication flow
Decompose the payment processing problem
```

**Parameters:**
- `problem`: Complex problem to solve
- `context`: Relevant context and constraints

**Returns:**
- Step-by-step breakdown
- Dependencies between steps
- Estimated complexity
- Potential risks

---

### Logical Reasoning

#### `sequential_thinking_reason`
Apply logical reasoning to reach conclusions.

**Usage:**
```
Reason through this bug
Analyze why the test is failing
Determine the root cause
```

**Parameters:**
- `premise`: Starting facts or observations
- `question`: What to reason about
- `constraints`: Known constraints

**Returns:**
- Logical steps
- Intermediate conclusions
- Final conclusion
- Confidence level

---

### Chain of Thought

#### `sequential_thinking_chain`
Create a chain of thought for a problem.

**Usage:**
```
Think through this feature request
Analyze the user flow step by step
```

**Parameters:**
- `input`: Initial problem or question
- `depth`: How deep to explore (default: thorough)

**Returns:**
- Step-by-step reasoning
- Alternatives considered
- Trade-offs analyzed
- Recommended approach

---

### Decision Making

#### `sequential_thinking_decide`
Make a decision by analyzing options.

**Usage:**
```
Decide between React and Vue
Choose the best approach for this feature
Select the right database schema
```

**Parameters:**
- `options`: Array of options to consider
- `criteria`: Evaluation criteria
- `weights`: Importance of each criteria (optional)

**Returns:**
- Ranked options
- Pros and cons of each
- Recommendation with reasoning
- Risk assessment

---

### Cause Analysis

#### `sequential_thinking_analyze_cause`
Analyze root causes of a problem.

**Usage:**
```
Find root cause of this bug
Analyze why performance is slow
Determine why tests are failing
```

**Parameters:**
- `problem`: Description of the problem
- `symptoms`: Observable symptoms
- `context`: System context

**Returns:**
- Possible causes
- Most likely root cause
- Investigation steps
- Verification method

---

### Solution Design

#### `sequential_thinking_design_solution`
Design a solution step by step.

**Usage:**
```
Design a solution for user authentication
Plan the refactoring approach
```

**Parameters:**
- `requirements`: What the solution must achieve
- `constraints`: Technical or business constraints
- `considerations`: Additional factors to consider

**Returns:**
- Solution architecture
- Implementation steps
- Risks and mitigations
- Testing strategy

---

### Algorithm Design

#### `sequential_thinking_design_algorithm`
Design or analyze an algorithm.

**Usage:**
```
Design a sorting algorithm
Analyze the complexity of this algorithm
Optimize the search function
```

**Parameters:**
- `problem`: Algorithmic problem to solve
- `requirements`: Performance or functional requirements
- `constraints`: Space or time constraints

**Returns:**
- Algorithm steps
- Time complexity
- Space complexity
- Optimization opportunities

---

### Code Review

#### `sequential_thinking_review_code`
Review code with systematic analysis.

**Usage:**
```
Review this function for bugs
Analyze this component for issues
```

**Parameters:**
- `code`: Code to review
- `focus`: Specific focus area (security, performance, bugs)

**Returns:**
- Issues found
- Severity levels
- Fix suggestions
- Best practice violations

---

### Debugging

#### `sequential_thinking_debug`
Debug issues systematically.

**Usage:**
```
Debug this error step by step
Find the bug in this function
```

**Parameters:**
- `error`: Error message or unexpected behavior
- `code`: Relevant code
- `context`: Runtime context

**Returns:**
- Possible causes
- Investigation steps
- Likely fix
- Prevention strategies

---

### Risk Assessment

#### `sequential_thinking_assess_risk`
Assess risks in a plan or approach.

**Usage:**
```
Assess risks in this deployment
Analyze security risks
```

**Parameters:**
- `plan`: Plan or approach to assess
- `context`: System or business context

**Returns:**
- Identified risks
- Likelihood and impact
- Mitigation strategies
- Acceptance criteria

---

## Common Workflows

### 1. Problem Solving
```
Identify the problem
Break it down
Analyze each component
Design solution
Implement and test
```

### 2. Code Debugging
```
Observe symptoms
Gather evidence
Form hypotheses
Test hypotheses
Find root cause
Fix and verify
```

### 3. Architecture Design
```
Understand requirements
Identify constraints
Explore options
Evaluate trade-offs
Design solution
Review and refine
```

### 4. Algorithm Development
```
Define problem
Consider approaches
Select algorithm
Analyze complexity
Optimize
Test thoroughly
```

---

## Integration with Lumelle

### Feature Development
```
Break down partner feature
Design component structure
Plan state management
Design API integration
```

### Bug Fixing
```
Analyze bug symptoms
Trace through code flow
Identify root cause
Design fix
Verify solution
```

### Code Review
```
Review pull request systematically
Check for bugs
Assess performance
Evaluate security
Suggest improvements
```

---

## Tips

1. **Be explicit** - State assumptions clearly
2. **Show work** - Make reasoning visible
3. **Consider alternatives** - Don't settle on first solution
4. **Validate** - Test your reasoning
5. **Iterate** - Refine your thinking

---

## Best Practices

✅ **DO:**
- Break complex problems into steps
- Make reasoning explicit
- Consider multiple approaches
- Validate assumptions
- Document thought process
- Learn from mistakes

❌ **DON'T:**
- Jump to conclusions
- Skip steps
- Ignore alternatives
- Overlook edge cases
- Forget to verify
- Make unwarranted assumptions

---

## Reasoning Patterns

### Deductive Reasoning
```
Start with general rules
Apply to specific case
Reach conclusion
```

### Inductive Reasoning
```
Observe specific cases
Identify patterns
Form general rule
```

### Abductive Reasoning
```
Observe outcome
Generate hypotheses
Select most likely explanation
```

### Design Thinking
```
Empathize with user
Define problem
Ideate solutions
Prototype
Test
Iterate
```

---

## Troubleshooting

**Reasoning seems off:**
- State assumptions clearly
- Verify each step
- Check for logical fallacies
- Consider alternative perspectives

**Stuck on problem:**
- Break it down further
- Try different approach
- Gather more information
- Take a step back

**Too many options:**
- Define evaluation criteria
- Rank by importance
- Eliminate clearly bad options
- Compare remaining options

---

## Example Usage

### Debugging with Sequential Thinking
```
User: Why is my auth not working?

Claude: [Uses sequential_thinking_analyze_cause]
Let me think through this systematically:

Step 1: Analyze symptoms
- Auth tokens not being accepted
- 401 errors on API calls
- Tokens appear valid

Step 2: Consider possible causes
- Token expired? No, tokens are fresh
- Wrong secret? Possible, verify keys
- Token format? Check structure
- API endpoint? Verify URL

Step 3: Test hypotheses
- Check token decoding: ✓ Valid
- Verify secret key: ✗ Mismatch found
- Test with correct key: ✓ Works

Conclusion: Secret key mismatch in environment config
Fix: Update SUPABASE_ANON_KEY in .env
```

### Algorithm Design
```
User: Design a function to find duplicates

Claude: [Uses sequential_thinking_design_algorithm]
Let me design this step by step:

Step 1: Understand requirements
- Input: Array of items
- Output: Array of duplicates
- Constraints: O(n) time preferred

Step 2: Consider approaches
- Nested loops: O(n²) time
- Sorting: O(n log n) time
- Hash set: O(n) time, O(n) space
- Bit manipulation: O(n) time, O(1) space

Step 3: Select best approach
- Use hash set for O(n) time
- Trade memory for speed
- Most straightforward

Step 4: Design algorithm
function findDuplicates(nums) {
  const seen = new Set()
  const duplicates = new Set()

  for (const num of nums) {
    if (seen.has(num)) {
      duplicates.add(num)
    } else {
      seen.add(num)
    }
  }

  return Array.from(duplicates)
}

Step 5: Analyze complexity
- Time: O(n) single pass
- Space: O(n) for sets
- Optimal for unsorted input
```

### Decision Making
```
User: Should we use TypeScript or JavaScript?

Claude: [Uses sequential_thinking_decide]
Let me evaluate this decision:

Criteria (weights: importance):
- Type safety: 9 (critical)
- Team experience: 7 (important)
- Development speed: 6 (nice to have)
- Ecosystem support: 8 (very important)

Options:
1. TypeScript
   - Type safety: ✓ Excellent
   - Team experience: ⚠️ Moderate (learning curve)
   - Development speed: ✗ Slower initially
   - Ecosystem: ✓ Excellent
   Score: 8.5/10

2. JavaScript
   - Type safety: ✗ Requires extra tools
   - Team experience: ✓ Excellent
   - Development speed: ✓ Faster initially
   - Ecosystem: ✓ Excellent
   Score: 6.5/10

Recommendation: TypeScript
Reasoning:
- Type safety is critical for large codebase
- Learning curve is temporary benefit
- Better long-term maintainability
- Strong industry trend

Risks:
- Team adaptation period
- Initial slower development
- Need for strict mode enforcement

Mitigation:
- Provide TypeScript training
- Use JSDoc migration path
- Start with non-strict mode
```

---

## Advanced Features

### Multi-Step Reasoning
```
Chain multiple reasoning steps
Build on previous conclusions
Refine thinking iteratively
```

### Probabilistic Reasoning
```
Assess likelihood of outcomes
Calculate probabilities
Make decisions under uncertainty
```

### Constraint Satisfaction
```
Identify all constraints
Find solutions that satisfy all
Optimize within constraints
```

---

## When to Use Sequential Thinking

**Use Sequential Thinking for:**
- Complex problem solving
- Architecture decisions
- Algorithm design
- Root cause analysis
- Code review
- Debugging complex issues
- Risk assessment
- Trade-off analysis

**Quick tasks may not need it:**
- Simple file operations
- Straightforward code changes
- Information lookup
- Basic questions

---

## Comparison: With vs Without Sequential Thinking

### Without Sequential Thinking
```
User: Fix the login bug
Claude: I'll update the auth function. [Makes changes]
Result: May miss edge cases, incomplete fix
```

### With Sequential Thinking
```
User: Fix the login bug
Claude: Let me analyze this systematically:
1. Identify symptoms
2. Trace through code flow
3. Find root cause
4. Design comprehensive fix
5. Verify all edge cases
Result: Thorough, reliable fix
```

---

**Need Help?** Just ask Claude: "Think through this problem step by step..."

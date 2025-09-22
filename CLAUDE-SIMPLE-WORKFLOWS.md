# Simple Linear Workflows - Clear, Predictable Process

## 🔄 Core Workflow: ANALYZE → PLAN → EXECUTE → VALIDATE

### Philosophy:
- **Linear**: One phase completes before the next begins
- **Clear**: Explicit success criteria for each phase
- **Fail-Safe**: Rollback capability at each step
- **Simple**: No complex orchestration or dependencies

---

## 🔍 PHASE 1: ANALYZE

### Purpose: Understand the problem completely before taking action

### Activities:
```
1. Parse user request and identify task type
2. Activate Context Intelligence (load relevant context)
3. Apply Tool Intelligence (identify required tools)
4. Assess complexity and scope
5. Gather relevant information
6. Identify constraints and requirements
```

### Tools Used:
- **Simple tasks**: Read, Grep, basic analysis
- **Complex tasks**: `mcp__zen-mcp__analyze` or `mcp__zen-mcp__thinkdeep`
- **Code navigation**: `mcp__serena__get_symbols_overview`
- **Database queries**: `mcp__siso-memory-vault__list_tables`

### Success Criteria:
- ✅ Problem clearly understood
- ✅ Scope and constraints identified  
- ✅ Required tools and information gathered
- ✅ Complexity level assessed
- ✅ Ready to create actionable plan

### Output:
- Clear problem statement
- Context summary
- Identified requirements
- Recommended approach

---

## 📋 PHASE 2: PLAN

### Purpose: Create actionable task breakdown before implementation

### Activities:
```
1. Activate Task Intelligence (TodoWrite integration)
2. Break down work into specific, actionable tasks
3. Identify dependencies and sequence
4. Estimate effort and complexity
5. Plan tool usage and file changes
6. Define validation criteria
```

### Tools Used:
- **Always**: TodoWrite for task decomposition
- **Complex planning**: `mcp__zen-mcp__planner`
- **Multiple approaches**: `mcp__zen-mcp__consensus`
- **Code planning**: `mcp__serena__find_symbol` for existing patterns

### Success Criteria:
- ✅ TodoWrite list created with specific tasks
- ✅ Each task is actionable and clear
- ✅ Dependencies identified and sequenced
- ✅ Tools selected for each task
- ✅ Validation plan defined

### Output:
- TodoWrite task list
- Implementation sequence
- Tool usage plan
- Success metrics defined

---

## 🛠️ PHASE 3: EXECUTE

### Purpose: Implement the plan systematically with smart tool routing

### Activities:
```
1. Mark first task as "in_progress"
2. Apply Tool Intelligence for optimal tool selection
3. Execute task using appropriate tools
4. Validate each step before proceeding
5. Update TodoWrite status in real-time
6. Handle errors with fallback strategies
```

### Tool Selection Logic:
```javascript
Database operations → mcp__siso-memory-vault__*
Code analysis → mcp__serena__* or mcp__zen-mcp__*
File operations → Read, Edit, MultiEdit
Complex changes → mcp__zen-mcp__codereview
Commands → Bash
```

### Execution Pattern:
```
FOR each task in TodoWrite list:
  1. Mark task as "in_progress"
  2. Apply smart tool selection
  3. Execute with appropriate tool(s)
  4. Verify result
  5. Mark task as "completed" or handle error
  6. Move to next task
```

### Error Handling:
```
Tool fails → Try fallback tool
Unexpected result → Rollback and retry
Scope creep → Update plan, get approval
Complexity exceeded → Break down further
```

### Success Criteria:
- ✅ All TodoWrite tasks completed successfully
- ✅ Changes implement requirements correctly
- ✅ No breaking changes introduced
- ✅ Code follows project patterns
- ✅ Ready for validation phase

---

## ✅ PHASE 4: VALIDATE

### Purpose: Ensure solution works correctly and meets requirements

### Activities:
```
1. Run comprehensive validation tests
2. Verify requirements are met
3. Check for breaking changes
4. Test edge cases and error conditions
5. Validate mobile/responsive behavior (if applicable)
6. Document solution and lessons learned
```

### Validation Tools:
```typescript
// TypeScript validation
npx tsc --noEmit

// Build validation  
npm run build

// Test validation
npm run test (if available)

// Linting validation
npm run lint (if available)

// Manual testing
// - Core functionality works
// - Mobile responsive (if UI changes)
// - No console errors
// - Meets original requirements
```

### Validation Checklist:
```
□ TypeScript compiles without errors
□ Build succeeds without warnings
□ Core functionality works as expected
□ Mobile/responsive behavior correct (if applicable)
□ No breaking changes to existing functionality
□ Requirements from Phase 1 are met
□ Code follows project patterns and conventions
□ Solution is documented appropriately
```

### Success Criteria:
- ✅ All validation tests pass
- ✅ Original requirements fully satisfied
- ✅ No regressions introduced
- ✅ Solution documented
- ✅ Ready for delivery

---

## 🔄 Workflow Variations

### Simple Task Workflow:
```
Quick fixes, small changes, single-file edits

ANALYZE (2 min):
- Read user request
- Identify target file(s)
- Understand change needed

PLAN (1 min):
- Simple TodoWrite (2-3 tasks max)
- Identify edit approach

EXECUTE (5-15 min):
- Make targeted changes
- Update TodoWrite status

VALIDATE (2 min):
- Test change works
- Verify no breaking changes
```

### Complex Feature Workflow:
```
Multi-component features, architecture changes

ANALYZE (10-30 min):
- Deep analysis with zen-mcp tools
- Comprehensive context gathering
- Multiple file/component assessment

PLAN (10-20 min):
- Detailed TodoWrite breakdown (5-15 tasks)
- Dependency mapping
- Tool strategy planning

EXECUTE (hours to days):
- Systematic task completion
- Regular validation checkpoints
- Continuous tool optimization

VALIDATE (15-45 min):
- Comprehensive testing
- Cross-device validation
- Documentation update
```

### Bug Fix Workflow:
```
Issue reproduction and resolution

ANALYZE (5-20 min):
- Reproduce issue
- Identify root cause
- Understand impact scope

PLAN (5 min):
- TodoWrite breakdown for fix
- Plan minimal change approach
- Define regression tests

EXECUTE (10-60 min):
- Implement targeted fix
- Add preventive measures

VALIDATE (10 min):
- Verify bug is fixed
- Test for regressions
- Document solution
```

## 🚀 Workflow Optimization

### Continuous Improvement:
```
After each workflow completion:
1. Measure actual vs estimated time
2. Identify bottlenecks and inefficiencies
3. Note which tools/approaches worked best
4. Update workflow templates based on learnings
5. Improve tool selection logic
```

### Pattern Recognition:
```
Track successful patterns:
- Which tool combinations work well
- What task breakdown strategies are effective
- How to better estimate complexity
- Common validation approaches
```

### Workflow Metrics:
```
Success Metrics:
- Time to completion
- First-time success rate
- User satisfaction
- Quality of output

Efficiency Metrics:
- Context window utilization
- Tool selection accuracy
- Task breakdown quality
- Validation thoroughness
```

---

*Simple Workflows - Predictable progress through systematic execution*
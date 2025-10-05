# 🔍 Component Analysis Template

## Overview
**Component Name**: [Component to analyze]
**File Path**: [Path to component file]
**Analysis Date**: [Current date]
**Analyzed By**: [AI Agent or Developer]

## Code Metrics

### Size Analysis
- **Total Lines**: [Number]
- **Code Lines** (excluding comments/whitespace): [Number]
- **JSX Lines**: [Number]
- **Logic Lines**: [Number]

### Complexity Analysis
- **Cyclomatic Complexity**: [Number]
- **Number of useState hooks**: [Number]
- **Number of useEffect hooks**: [Number]
- **Number of props**: [Number]
- **Nesting Depth**: [Max JSX nesting level]

### Dependencies
- **Direct Dependencies**: [List of imports]
- **Component Dependencies**: [Child components used]
- **Hook Dependencies**: [Custom hooks used]
- **External Dependencies**: [Third-party libraries]

## Refactoring Opportunities

### 🎯 Pattern Detection Score: [1-10]

#### Detected Patterns
- [ ] **Duplicate Code** (Severity: [Low/Medium/High])
  - Duplicate lines: [Number]
  - Similar JSX patterns: [Number]
  - Repeated logic blocks: [Number]

- [ ] **Mixed Concerns** (Severity: [Low/Medium/High])
  - Data fetching in component: [Yes/No]
  - Business logic in JSX: [Yes/No]  
  - Styling logic mixed: [Yes/No]

- [ ] **Configuration Hardcoding** (Severity: [Low/Medium/High])
  - Magic numbers/strings: [Number found]
  - Repeated constants: [Number]
  - Hardcoded arrays/objects: [Number]

- [ ] **State Management Issues** (Severity: [Low/Medium/High])
  - Related state variables: [Number of related useState]
  - Complex state updates: [Number of complex setState calls]
  - Missing state synchronization: [Yes/No]

- [ ] **Performance Issues** (Severity: [Low/Medium/High])
  - Unnecessary re-renders: [Potential count]
  - Expensive calculations: [Number in render]
  - Missing memoization: [Opportunities found]

## ROI Analysis

### Effort Estimation
- **Analysis Time**: [Hours estimated]
- **Implementation Time**: [Hours estimated] 
- **Testing Time**: [Hours estimated]
- **Total Effort**: [Total hours]

### Expected Benefits
- **Lines Reduced**: [Estimated number]
- **Performance Improvement**: [Percentage estimated]
- **Maintainability Score**: [1-10 improvement]
- **Reusability Factor**: [Number of places could be reused]

### ROI Calculation
```
Time Savings = (Lines Reduced × 0.1 minutes) + (Bugs Prevented × 30 minutes)
Performance Gain = [Bundle size reduction + Render optimization]
Maintenance Savings = (Duplicate Code Elimination × Bug Rate) × Hourly Cost

Total Value = Time Savings + Performance Gain + Maintenance Savings
Investment Cost = Total Effort × Hourly Rate
ROI = ((Total Value - Investment Cost) / Investment Cost) × 100
```

**Calculated ROI**: [Percentage]%
**Payback Period**: [Months]

## Risk Assessment

### Technical Risk: [Low/Medium/High]
- **Breaking Changes**: [Likelihood and impact]
- **Integration Complexity**: [Assessment]
- **Testing Complexity**: [Assessment]
- **Rollback Difficulty**: [Assessment]

### Business Risk: [Low/Medium/High]  
- **User Impact**: [Potential impact]
- **Timeline Impact**: [Effect on delivery]
- **Resource Requirements**: [Team capacity needed]

### Team Risk: [Low/Medium/High]
- **Knowledge Requirements**: [Skill level needed]
- **Team Familiarity**: [How familiar is team with patterns]
- **Documentation Needs**: [How much documentation required]

## Recommended Actions

### Priority: [Low/Medium/High/Critical]
### Recommended Pattern: [Pattern name from knowledge base]

### Implementation Plan
1. **Phase 1**: [Initial steps]
2. **Phase 2**: [Follow-up steps] 
3. **Phase 3**: [Final steps]

### Success Criteria
- [ ] Lines of code reduced by [Target percentage]%
- [ ] Performance improved by [Target percentage]%
- [ ] Test coverage maintained above [Target percentage]%
- [ ] No breaking changes to public API
- [ ] Team onboarding time reduced

### Monitoring Plan
- **Metrics to Track**: [List of metrics]
- **Success Thresholds**: [Define success criteria]
- **Rollback Triggers**: [When to rollback]

## Before/After Code Samples

### Before (Current State)
```typescript
// Current component structure
[Paste representative code sample showing current problems]
```

### After (Proposed State)
```typescript
// Refactored component structure
[Paste proposed refactored code sample]
```

## Testing Strategy

### Unit Tests Required
- [ ] [Test category 1]
- [ ] [Test category 2]
- [ ] [Test category 3]

### Integration Tests Required  
- [ ] [Integration test 1]
- [ ] [Integration test 2]

### Performance Tests Required
- [ ] [Performance test 1]
- [ ] [Performance test 2]

## Documentation Updates

### Files to Update
- [ ] [Documentation file 1]
- [ ] [Documentation file 2]
- [ ] [README updates]
- [ ] [API documentation]

### New Documentation Required
- [ ] [New doc 1]
- [ ] [New doc 2]

## Dependencies Impact

### Components Affected
- [List of components that import or use this component]

### Required Updates
- [List of other files that need updates]

### Breaking Changes
- [List any breaking changes and mitigation strategies]

---

## Analysis Summary

**Overall Refactoring Score**: [1-10]
**Recommended Priority**: [Low/Medium/High/Critical]
**Estimated ROI**: [Percentage]%
**Implementation Complexity**: [Low/Medium/High]
**Risk Level**: [Low/Medium/High]

**Go/No-Go Decision**: [GO/NO-GO]
**Rationale**: [Brief explanation of decision]

---
*Component Analysis Template v1.0 | Systematic Refactoring Assessment*
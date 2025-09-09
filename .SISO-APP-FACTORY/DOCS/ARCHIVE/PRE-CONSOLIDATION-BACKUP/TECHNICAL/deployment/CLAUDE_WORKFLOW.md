# Claude Code Workflow for SISO Internal

## 🎯 **Learned from Reddit: Production-Ready Development**

### Phase 1: Planning (ALWAYS START HERE)
```bash
# Instead of: "Build me a task management system"
# Do this:

1. "Plan a task management system with the following requirements..."
2. Review plan for completeness
3. Break into implementable phases
4. Document each phase as separate markdown files
```

### Phase 2: Implementation Strategy
```typescript
// BEFORE implementing, ask Claude:
"Based on our CLAUDE.md conventions and existing codebase patterns, 
how should I implement [specific feature] with:
- Proper TypeScript types
- Comprehensive tests  
- Input validation with Zod
- Accessibility compliance
- Error handling
- Security considerations"
```

### Phase 3: Quality Gates (Reddit's Missing Piece)
```bash
# After each feature, verify:
□ TypeScript compilation (no errors)
□ Tests written and passing
□ Security validation implemented
□ Accessibility tested
□ Error boundaries added
□ Performance impact assessed
```

## 🚨 **Reddit's "Maintenance Nightmare" Prevention**

### Don't Accept "Vibe Code"
```typescript
// ❌ Reddit Warning: "Biggest pile of vibe coded trash"
// ✅ Always request:

"Please provide production-ready code with:
1. Comprehensive TypeScript types (no 'any')
2. Input validation with Zod schemas
3. Error handling with proper boundaries
4. Unit tests for all critical functions
5. Integration tests for API endpoints
6. Accessibility attributes
7. Performance considerations
8. Security best practices"
```

### Systematic Code Review
```bash
# Use this checklist for every Claude-generated code:

SECURITY:
□ Input validation present
□ SQL injection prevention  
□ XSS protection
□ Authentication checks
□ Authorization verification

QUALITY:
□ TypeScript strict compliance
□ Test coverage >80%
□ Error handling comprehensive
□ Logging implemented
□ Documentation complete

PERFORMANCE:
□ Bundle size impact assessed
□ Database queries optimized
□ Caching strategy implemented
□ Memory leaks prevented

ACCESSIBILITY:
□ ARIA labels present
□ Keyboard navigation works
□ Screen reader compatible
□ Color contrast compliance
```

## 🎯 **Reddit Success Patterns**

### Large Codebase Strategy
```bash
# Reddit Success: "Invest in documentation"
# For SISO Internal:

1. Detailed CLAUDE.md in root ✅
2. Folder-specific CLAUDE.md files for complex areas
3. API documentation with examples  
4. Component usage guidelines
5. Testing patterns and examples
```

### Context Management
```bash
# Reddit Problem: "MCP uses 40% of context"
# SISO Solution:

1. Project-specific .mcp.json ✅
2. Disable unused MCPs per session
3. Use focused prompts
4. Reference specific doc sections
5. Break complex tasks into phases
```

### Production Readiness
```typescript
// Reddit Reality Check: "Needs production hardening"
// SISO Standards:

interface ProductionReadyFeature {
  implementation: 'complete'
  tests: 'comprehensive'
  security: 'validated' 
  accessibility: 'compliant'
  performance: 'optimized'
  documentation: 'complete'
  errorHandling: 'robust'
  monitoring: 'enabled'
}
```

## 🚀 **Improved Prompting Strategies**

### Instead of Basic Requests
```bash
# ❌ Reddit Anti-Pattern:
"Build me an invoice system"

# ✅ Production Request:
"Following our SISO Internal conventions in CLAUDE.md, create a secure invoice 
management component that:

ARCHITECTURE:
- Uses our established patterns from existing components
- Follows the compound component pattern like our UI library docs
- Integrates with our Prisma database schema

SECURITY:
- Validates all inputs with Zod schemas  
- Implements proper authorization checks
- Prevents SQL injection and XSS

QUALITY:
- Includes comprehensive TypeScript types
- Has unit tests for all functions
- Implements proper error boundaries
- Follows accessibility guidelines

PERFORMANCE:
- Optimizes for Core Web Vitals
- Uses React.memo where appropriate
- Implements proper loading states

Please provide the implementation in phases:
1. Database schema and types
2. API routes with validation
3. React components with tests
4. Integration and error handling"
```

### Phase-Based Development
```bash
# Reddit Success Pattern: "Break into phases"

Phase 1: Foundation
- Database schema
- TypeScript interfaces  
- Basic API structure

Phase 2: Core Logic
- Business logic implementation
- Validation schemas
- Error handling

Phase 3: UI Components
- React components
- Form handling
- State management

Phase 4: Testing & Quality
- Unit tests
- Integration tests
- Accessibility testing
- Security validation

Phase 5: Production Hardening
- Performance optimization
- Error monitoring  
- Logging implementation
- Documentation completion
```

## 📚 **Learning from Reddit's Experience**

### Expectation Setting
```bash
# Reddit Reality:
"Easy to prototype, hard to maintain and scale"

# SISO Approach:
1. Start with proper architecture
2. Build quality gates from day 1
3. Test everything immediately
4. Refactor continuously
5. Document as you go
```

### Success Indicators
```typescript
// Reddit Success Metrics:
interface SuccessfulClaudeCodeProject {
  testCoverage: number // >80%
  securityVulnerabilities: number // 0
  accessibilityCompliance: 'WCAG 2.1 AA'
  performanceScore: number // >90
  codeQualityGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  maintenanceEffort: 'low' | 'medium' | 'high'
}
```

This workflow prevents the "prototype trap" that Reddit users warned about and ensures SISO Internal remains maintainable and production-ready from day one.
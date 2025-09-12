# SISO Internal - Claude Code Instructions

## 🎭 **BMAD-METHOD™ REVOLUTIONARY DEVELOPMENT**

**Game-Changer for Complex Features:** SISO Internal now uses BMAD-METHOD™ for context-engineered development that eliminates information loss and accelerates complex features.

### **When to Use BMAD (Auto-Suggested)**
- **Cross-ecosystem features** (internal/partnership/client systems)
- **Architectural changes** (AdminLifeLock-scale refactoring)
- **Multi-component integration** (>5 files, complex coordination)
- **Major new features** (>1 week development time)

### **BMAD Revolutionary Workflow**
```bash
# Complex Feature Development
*agent analyst     # Market research & project brief
*agent pm         # Comprehensive PRD creation  
*agent architect  # Technical architecture design
*agent sm         # Context-rich development stories
*agent dev        # Story-driven implementation
*agent qa         # Quality gates throughout
```

### **BMAD Core Files**
- **Agents**: `.bmad-core/agents/` (10 specialist AI agents)
- **Workflows**: `.bmad-core/workflows/brownfield-fullstack.yaml`
- **Documentation**: `docs-bmad/user-guide.md`, `docs-bmad/enhanced-ide-development-workflow.md`
- **Stories**: Stories contain complete implementation context

### **Why BMAD is Revolutionary**
1. **Context Preservation** - No more "what was I building?" moments
2. **Structured Planning** - Comprehensive PRDs before coding
3. **Story-Driven Development** - All context embedded in story files
4. **Cross-Agent Coordination** - Specialist agents for each phase
5. **Quality Integration** - QA gates throughout development lifecycle

**Simple Tasks**: Keep using existing rapid iteration workflow  
**Complex Tasks**: BMAD eliminates context loss and coordination failures

---

## 🏗️ **Project Architecture**

**Tech Stack:**
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL (production) / SQLite (development)
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Components**: Radix UI primitives

## 🎯 **Development Conventions**

### Code Standards
- **TypeScript**: Strict mode enabled - NO `any` types
- **Testing**: Jest + React Testing Library - ALWAYS write tests
- **Security**: Input validation with Zod schemas - NEVER trust user input
- **Error Handling**: Proper error boundaries and try/catch blocks
- **Accessibility**: WCAG 2.1 AA compliance using Radix UI patterns

### File Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components  
├── hooks/         # Custom React hooks
├── services/      # API calls and business logic
├── types/         # TypeScript definitions
├── utils/         # Helper functions
└── tests/         # Test files
```

### Component Patterns
- Use compound components pattern (like Radix UI)
- Implement proper error boundaries
- Include loading and error states
- Follow accessibility guidelines from our UI docs

## 🔒 **Security Requirements**

### Input Validation
- ALWAYS validate with Zod schemas
- Sanitize user inputs
- Use parameterized queries (Prisma handles this)
- Implement CSRF protection

### Authentication
- JWT tokens with proper expiration
- Secure session management
- Role-based access control

## 📊 **Database Conventions**

### Prisma Patterns
- Use transactions for multi-step operations
- Implement soft deletes where appropriate
- Include audit fields (createdAt, updatedAt)
- Follow consistent naming conventions

## 🧪 **Testing Requirements**

### What to Test
- All API endpoints
- Critical user workflows
- Error handling scenarios
- Accessibility compliance

### Testing Patterns
```tsx
// Component tests
describe('TaskCard', () => {
  it('should render task information', () => {
    // Test implementation
  })
  
  it('should handle completion toggle', () => {
    // Test user interactions
  })
})
```

## 📚 **Documentation References**

### UI Library Documentation
- Framer Motion: `/ai-docs-cache/ui/framer-motion/README.md`
- Lucide React: `/ai-docs-cache/ui/lucide-react/README.md`
- Radix UI: `/ai-docs-cache/ui/radix-ui/README.md`
- React Hook Form: `/ai-docs-cache/ui/react-hook-form/README.md`

### Backend Documentation
- Prisma: `/ai-docs-cache/backend/prisma/README.md`
- Vercel: `/ai-docs-cache/backend/vercel/README.md`
- Groq API: `/ai-docs-cache/backend/groq/README.md`

## 🚀 **Development Workflow**

### Before Writing Code

**🎭 For Complex Features (BMAD-Worthy):**
1. **BMAD Planning Phase**: Use `*agent analyst` → `*agent pm` → `*agent architect` for comprehensive planning
2. **Story Creation**: Use `*agent sm` to create context-rich development stories
3. **Implementation**: Follow story-driven development with complete context embedded

**⚡ For Simple Features (Rapid Iteration):**
1. **Plan Mode**: Always use plan mode for complex features
2. **Phase Planning**: Break large tasks into manageable phases
3. **Context Review**: Check existing patterns in codebase
4. **Documentation**: Reference our cached UI/backend docs

### Code Implementation
1. **Types First**: Define TypeScript interfaces
2. **Tests First**: Write test cases before implementation
3. **Security First**: Implement validation and sanitization
4. **Accessibility First**: Use semantic HTML and ARIA labels

### Quality Gates
- [ ] TypeScript compilation with no errors
- [ ] All tests passing
- [ ] ESLint and Prettier compliance
- [ ] Accessibility validation
- [ ] Security review (input validation, auth checks)

## 🔄 **AI Collaboration Guidelines**

### Effective Prompting
- Be specific about requirements
- Reference existing patterns in codebase
- Ask for tests and error handling
- Request accessibility considerations
- Specify security requirements

### Context Management
- Use focused MCP configurations
- Reference specific documentation files
- Break complex requests into phases
- Review and iterate on plans

## 🎯 **Production Readiness**

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Error monitoring enabled
- [ ] Performance monitoring setup
- [ ] Backup strategies implemented

### Performance Requirements
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

## 🚨 **CRITICAL SAFETY PROTOCOLS**

### 🛡️ **NEVER BREAK THE APP - Mandatory Safeguards**

**BEFORE making ANY changes to routing, core components, or architecture:**

1. **🔍 ALWAYS analyze existing patterns first**
   - Read the current implementation thoroughly
   - Understand data flow and component relationships
   - Identify exactly which components handle UI/data

2. **📸 Create safety checkpoints**
   - Run `git status` and commit working state first
   - Document current URL paths and test them
   - Take screenshots of working UI if doing UI changes

3. **🧪 Use incremental approach**
   - Make ONE small change at a time
   - Test immediately after each change
   - NEVER modify multiple core files simultaneously

4. **⛔ FORBIDDEN ACTIONS without explicit approval**
   - Modifying AdminLifeLock.tsx routing logic
   - Changing tab-config.ts without testing all tabs
   - Creating components with mock data in production paths
   - Removing or replacing working UI components
   - Modifying App.tsx routing without full testing

5. **✅ Mandatory testing protocol**
   - Test ALL navigation tabs after routing changes
   - Verify UI looks identical to before (use screenshots)
   - Test in both development and production modes
   - Confirm no console errors or crashes

### 🔄 **Rollback Strategy - Always Ready**

**If ANY errors occur during implementation:**
1. `git restore <modified-files>` immediately
2. `rm` any new files created
3. Test that original functionality works
4. THEN analyze what went wrong

### 🎯 **Architecture Change Protocol**

**For major changes like tab unification:**
1. **Plan phase**: Document exact approach without coding
2. **Prototype phase**: Create isolated test components first  
3. **Integration phase**: Test with real data in development
4. **Validation phase**: Compare with original UI pixel-by-pixel
5. **Deployment phase**: Only after thorough testing

## 🚨 **Common Pitfalls to Avoid**

1. **No Tests**: Always request test coverage
2. **Security Gaps**: Never skip input validation
3. **Accessibility Issues**: Use semantic HTML and ARIA
4. **Type Safety**: Avoid `any` types
5. **Error Handling**: Implement proper error boundaries
6. **Performance**: Avoid unnecessary re-renders
7. **🆕 Breaking Working UI**: Never replace working components with mock versions
8. **🆕 Routing Chaos**: Never modify core routing without comprehensive testing
9. **🆕 Architecture Destruction**: Never change fundamental patterns without isolation testing

## 💡 **AI Assistant Guidelines**

When working with Claude Code:
- Always ask for production-ready code, not prototypes
- Request comprehensive error handling
- Ensure accessibility compliance
- Include proper TypeScript types
- Generate corresponding tests
- Follow existing project patterns
- Implement security best practices

## 📈 **Success Metrics**

- Zero TypeScript errors
- 90%+ test coverage
- WCAG 2.1 AA compliance
- Performance budgets met
- Security vulnerabilities: 0
- Code review approval rate > 95%
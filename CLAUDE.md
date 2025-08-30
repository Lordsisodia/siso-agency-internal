# SISO Internal - Claude Code Instructions

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

## 🚨 **Common Pitfalls to Avoid**

1. **No Tests**: Always request test coverage
2. **Security Gaps**: Never skip input validation
3. **Accessibility Issues**: Use semantic HTML and ARIA
4. **Type Safety**: Avoid `any` types
5. **Error Handling**: Implement proper error boundaries
6. **Performance**: Avoid unnecessary re-renders

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
# SISO Internal - Task Completion Guidelines

## When a Task is Completed

### Mandatory Quality Checks
1. **TypeScript Compilation**: `npm run build` - Must pass with zero errors
2. **Linting**: `npm run lint` - Must pass all ESLint rules
3. **Testing**: `npm run test` - All tests must pass (90%+ coverage expected)
4. **Security Review**: Ensure input validation and auth checks are in place
5. **Accessibility Validation**: Check WCAG 2.1 AA compliance

### Code Quality Standards
- **No `any` types** - TypeScript strict mode must be satisfied
- **Proper error handling** - Error boundaries and try/catch blocks implemented
- **Input validation** - All user inputs validated with Zod schemas
- **Performance check** - No unnecessary re-renders or memory leaks
- **Mobile responsiveness** - Test on different screen sizes

### Before Committing
```bash
npm run lint:fix              # Auto-fix any linting issues
npm run test                  # Ensure all tests pass
npm run build                 # Verify production build works
```

### Production Readiness Checklist
- [ ] Environment variables configured correctly
- [ ] Database migrations applied (if applicable)
- [ ] Error monitoring setup
- [ ] Performance metrics within budget:
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s  
  - Cumulative Layout Shift < 0.1
  - First Input Delay < 100ms

### Documentation Requirements
- **Component documentation** - Props and usage examples
- **API changes** - Update relevant service documentation
- **Database changes** - Document schema modifications
- **Breaking changes** - Note any breaking changes for team

### Security Verification
- **Authentication**: Proper auth guards implemented
- **Authorization**: Role-based access control working
- **Data sanitization**: All inputs properly sanitized
- **HTTPS**: Secure connections in production
- **Secrets**: No hardcoded secrets or keys

### Post-Completion Actions
1. **Code review**: Request peer review if significant changes
2. **Testing**: Manual testing of affected features
3. **Documentation**: Update any relevant documentation
4. **Deployment**: Follow proper deployment procedures via Vercel

## Common Pitfalls to Avoid
- Skipping test coverage for new features
- Missing input validation on forms
- Forgetting accessibility attributes
- Not handling loading/error states
- Leaving console.log statements in production code
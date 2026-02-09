# Black Box Automated UI Development Cycle
## Agent-Executable Specification

---

## 🎯 OVERVIEW

This document outlines a fully automated UI iteration cycle for Black Box development, designed to be executed by AI agents with minimal human intervention.

---

## 📋 PHASE 1: TASK IDENTIFICATION & PLANNING

### 1.1 Research Codebase
**Goal:** Find all related code and understand current implementation

**Actions:**
- Use semantic search (grep/find) to locate relevant files
- Identify component hierarchy and dependencies
- Map data flow and state management
- Document existing patterns and conventions
- Check for similar implementations that can be referenced

**Outputs:**
- File inventory (list of relevant files)
- Dependency graph
- Pattern documentation
- Potential conflict points

### 1.2 Evaluate Current State
**Goal:** Understand what exists and what needs to change

**Actions:**
- Run existing tests to establish baseline
- Check current UI state (screenshots, accessibility tree)
- Review code quality metrics
- Identify technical debt or refactoring opportunities
- Assess performance implications

**Outputs:**
- Baseline test results
- Current state screenshots
- Technical assessment
- Risk evaluation

### 1.3 Determine Implementation Approaches
**Goal:** Explore multiple viable solutions

**Actions:**
- Brainstorm 2-3 different implementation strategies
- Evaluate trade-offs for each approach:
  - Development time
  - Code complexity
  - Performance impact
  - Maintainability
  - Backward compatibility
- Select optimal approach with rationale

**Outputs:**
- Implementation options (2-3 approaches)
- Trade-off analysis matrix
- Recommended approach with justification

---

## 🛠️ PHASE 2: EXECUTION & TESTING

### 2.1 Write Code
**Goal:** Implement the chosen solution

**Actions:**
- Create new components or modify existing ones
- Follow established code patterns and conventions
- Write self-documenting code with clear naming
- Add inline comments for complex logic
- Ensure TypeScript type safety
- Maintain consistent code style

**Quality Checks:**
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ Follows project conventions
- ✅ Proper error handling
- ✅ Accessible markup (ARIA labels, semantic HTML)

**Outputs:**
- New/modified code files
- Updated tests if needed
- Code diff summary

### 2.2 Automated UI Testing
**Goal:** Verify functionality and visual correctness across devices

**Testing Tools:**
- Chrome DevTools MCP (for visual inspection)
- Playwright (for automated browser testing)
- Accessibility tree analysis

**Test Coverage:**

#### Desktop Testing (1920x1080, 1366x768):
- ✅ Visual regression (screenshots)
- ✅ Interactive elements work (clicks, inputs)
- ✅ Responsive layout behaves correctly
- ✅ No console errors or warnings
- ✅ Accessibility tree is complete
- ✅ Keyboard navigation works
- ✅ Text contrast ratios meet WCAG AA

#### Mobile Testing (375x667, 414x896):
- ✅ Touch targets are minimum 44x44px
- ✅ Layout adapts to small screens
- ✅ No horizontal scrolling
- ✅ Readable text sizes (min 16px)
- ✅ Proper viewport meta tag
- ✅ No hover-only interactions

#### Cross-Browser Testing:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if applicable)

**Test Results:**
- Screenshot comparison (before/after)
- Console error log
- Accessibility audit report
- Performance metrics (FCP, LCP, TTI)
- Touch/device capability report

### 2.3 Quality Gates
**Goal:** Ensure production readiness

**Criteria:**
- ✅ All tests passing
- ✅ Zero console errors
- ✅ No visual regressions
- ✅ Accessibility score > 90
- ✅ Performance within acceptable bounds
- ✅ Code review checklist passed

**If ANY gate fails → Loop back to Phase 2.1**

**Outputs:**
- Test results summary
- Quality gate status (PASS/FAIL)
- Failure details (if any)

---

## 🚀 PHASE 3: DEPLOYMENT LOOP

### 3.1 Development Deployment
**Goal:** Deploy to development environment for staging

**Actions:**
- Commit changes with descriptive message
- Push to `dev` branch on GitHub
- Trigger automated CI/CD pipeline
- Verify deployment success
- Update deployment tracking

**Outputs:**
- Git commit SHA
- Deployment URL (dev environment)
- CI/CD pipeline status
- Deployment log

### 3.2 Staging Verification
**Goal:** Verify in development environment

**Actions:**
- Navigate to dev URL
- Run smoke tests (critical user flows)
- Check browser console for errors
- Verify API integrations work
- Test authentication if applicable
- Record any environment-specific issues

**If staging fails → Loop back to Phase 2.1**

**Outputs:**
- Smoke test results
- Console error report
- Environment issue log
- Staging gate status (PASS/FAIL)

### 3.3 Production Deployment
**Goal:** Deploy to production for real-world validation

**Actions:**
- Merge dev branch to `main`
- Trigger Cloudflare deployment
- Monitor deployment logs
- Verify DNS propagation
- Check SSL certificates
- Confirm production URL is accessible

**Outputs:**
- Production URL
- Cloudflare deployment status
- DNS verification results
- Deployment timestamp

### 3.4 Production Verification
**Goal:** Ensure production is fully operational

**Critical Checks:**
- ✅ Production URL loads correctly
- ✅ All critical user flows work
- ✅ Browser console is clean (no errors)
- ✅ Third-party integrations functional
- ✅ Analytics firing correctly
- ✅ Performance metrics acceptable
- ✅ Error tracking (Sentry/etc.) shows no new issues

**Actions:**
- Load production URL in multiple browsers
- Test critical user journeys
- Monitor browser console
- Check API endpoints
- Verify analytics/events
- Review error tracking dashboard
- Test on real devices (if possible)

**If production fails → Rollback + Loop back to Phase 2.1**

**Outputs:**
- Production verification report
- Browser console log
- Error tracking summary
- Rollback status (if applicable)
- Production gate status (PASS/FAIL)

---

## 🔄 LOOP BEHAVIOR

### Success Path
```
Phase 1 → Phase 2 → Phase 3 → ✅ COMPLETE
```

### Failure Loops

#### Development Loop
```
Phase 2.1 (Code) → Phase 2.2 (Test) → ❌ FAIL → Phase 2.1
```

#### Staging Loop
```
Phase 3.1 (Dev Deploy) → Phase 3.2 (Staging Verify) → ❌ FAIL → Phase 2.1
```

#### Production Loop
```
Phase 3.3 (Prod Deploy) → Phase 3.4 (Prod Verify) → ❌ FAIL → ROLLBACK → Phase 2.1
```

### Loop Limits
- **Max development loops:** 3 (then escalate to human)
- **Max staging loops:** 2 (then escalate to human)
- **Max production loops:** 1 (then escalate to human + rollback)

---

## ⚠️ CRITICAL MISSING CRITERIA

### 1. **Data Migration & State Management**
- ❌ What happens to existing user data when schema changes?
- ❌ Database migration planning
- ❌ State compatibility checks
- ❌ Rollback data strategies

### 2. **Error Handling & Edge Cases**
- ❌ Network failure handling
- ❌ API timeout strategies
- ❌ Offline mode considerations
- ❌ Boundary condition testing

### 3. **Security Considerations**
- ❌ Authentication/authorization testing
- ❌ XSS/injection checks
- ❌ CSP policy validation
- ❌ Sensitive data handling
- ❌ API key security

### 4. **Performance Metrics**
- ❌ Specific performance budgets (e.g., FCP < 1.8s)
- ❌ Bundle size impact analysis
- ❌ Memory leak detection
- ❌ Lazy loading verification

### 5. **SEO & Analytics**
- ❌ Meta tag updates
- ❌ Open Graph tags
- ❌ Structured data validation
- ❌ Analytics events firing
- ❌ Tracking implementation verification

### 6. **Backward Compatibility**
- ❌ API versioning
- ❌ Feature flags for gradual rollout
- ❌ Deprecation warnings
- ❌ Migration path for existing users

### 7. **Documentation**
- ❌ Update README/API docs
- ❌ Document breaking changes
- ❌ Update changelog
- ❌ Component documentation (Storybook?)

### 8. **Monitoring & Alerting**
- ❌ Set up uptime monitoring
- ❌ Configure error alerts
- ❌ Performance monitoring dashboards
- ❌ Custom event tracking

### 9. **Regression Testing**
- ❌ Run full test suite, not just new tests
- ❌ Check for unintended side effects
- ❌ Verify existing features still work
- ❌ Cross-feature interaction testing

### 10. **Human Escalation Triggers**
- ❌ When to get human review (ambiguous requirements)
- ❌ Security vulnerability discovered
- ❌ Performance degradation beyond threshold
- ❌ Cannot resolve after max loops
- ❌ Dependencies have critical vulnerabilities

### 11. **Environment Configuration**
- ❌ Environment variable management
- ❌ Config file differences (dev/staging/prod)
- ❌ Secret management verification
- ❌ API endpoint configuration

### 12. **Accessibility Compliance**
- ❌ Screen reader testing (NVDA/JAWS)
- ❌ Keyboard-only navigation
- ❌ Focus management
- ❌ ARIA live regions
- ❌ Color contrast verification

### 13. **Internationalization (if applicable)**
- ❌ Text extraction for translation
- ❌ RTL language support
- ❌ Date/time formatting
- ❌ Currency formatting
- ❌ Character encoding

---

## 📊 SUCCESS CRITERIA SUMMARY

### Phase Gates
Each phase must pass explicit gates before proceeding:

**Phase 1 Gate:**
- ✅ Research complete
- ✅ Current state documented
- ✅ Implementation approach selected

**Phase 2 Gate:**
- ✅ Code written (no lint/type errors)
- ✅ All tests passing
- ✅ QA checks passed

**Phase 3 Gate:**
- ✅ Staging verified
- ✅ Production deployed
- ✅ Production verified

### Final Success Indicators
- ✅ Zero console errors in production
- ✅ All critical user flows working
- ✅ Performance metrics within budget
- ✅ Accessibility score > 90
- ✅ No new errors in tracking
- ✅ Monitoring shows normal operation

---

## 🤖 AGENT EXECUTION REQUIREMENTS

### Prerequisites
- Access to codebase (read/write)
- Git credentials
- Browser automation tools (Chrome MCP/Playwright)
- CI/CD pipeline access
- Monitoring tools access

### Required Capabilities
- Semantic code search
- File modification
- Test execution
- Screenshot capture
- Console log analysis
- Git operations
- Deployment verification
- Error tracking access

### Communication Protocol
- Report phase completion
- Flag blockers immediately
- Summarize test results
- Request human escalation when needed
- Provide rollback rationale if applicable

---

## 📝 NEXT STEPS

1. **Review this specification** - Are all criteria accounted for?
2. **Define project-specific thresholds** - Performance budgets, acceptance criteria
3. **Set up monitoring infrastructure** - Before running first cycle
4. **Create escalation protocols** - When and how to get human help
5. **Test the cycle** - Run a pilot with a simple task
6. **Iterate on the process** - Refine based on learnings

---

## 🎯 QUESTIONS FOR CLARIFICATION

1. What is the rollback strategy if production deployment fails?
2. Should there be a canary deployment phase?
3. How do we handle database schema changes?
4. What are the specific performance budgets?
5. Should there be A/B testing capabilities?
6. How do we handle feature flags?
7. What's the process for hotfixes (critical bugs)?
8. Should there be a code review step before deployment?
9. How do we handle dependencies that need updating?
10. What's the strategy for mobile app vs web app?

---

*This specification is a living document. Update as the cycle is tested and refined.*

# Project Health Check Command

Comprehensive health analysis for the SISO platform with automated reporting.

## Quick Health Check

Run immediate health assessment:

```bash
# Basic health indicators
npm run build 2>&1 | head -20
npm test -- --passWithNoTests --silent | head -10
npx tsc --noEmit 2>&1 | head -15
```

## Full Health Assessment

### **1. Code Quality Health**
```bash
# TypeScript compilation
echo "=== TypeScript Health ==="
npx tsc --noEmit --strict

# Linting status
echo "=== Linting Health ==="
npm run lint 2>&1 | tail -5

# Test coverage
echo "=== Testing Health ==="
npm test -- --coverage --silent --watchAll=false
```

### **2. Dependencies Health**
```bash
# Security audit
echo "=== Security Health ==="
npm audit --audit-level moderate

# Outdated packages
echo "=== Dependency Health ==="
npm outdated | head -10
```

### **3. Database Health**
```bash
# Database connectivity
echo "=== Database Health ==="
node test-database-connection.js

# Prisma schema validation
echo "=== Schema Health ==="
npx prisma validate
```

### **4. Build Health**
```bash
# Production build
echo "=== Build Health ==="
npm run build

# Bundle size analysis
echo "=== Bundle Health ==="
ls -lh dist/ 2>/dev/null || echo "No dist directory found"
```

## Health Metrics

### **Critical Health Indicators** 🚨
- [ ] **Zero TypeScript errors**
- [ ] **Build completes successfully**
- [ ] **Database connects properly**
- [ ] **No critical security vulnerabilities**
- [ ] **Core tests passing**

### **Important Health Indicators** ⚠️
- [ ] **Test coverage > 70%**
- [ ] **Linting passes with minimal warnings**
- [ ] **No high-severity npm audit issues**
- [ ] **Bundle size within acceptable limits**
- [ ] **All environment variables configured**

### **Performance Health Indicators** ⚡
- [ ] **Build time < 2 minutes**
- [ ] **Test suite runs < 30 seconds**
- [ ] **Development server starts < 10 seconds**
- [ ] **Hot reload works properly**
- [ ] **Memory usage stable**

## SISO-Specific Health Checks

### **Frontend Health**
```bash
# React/Vite specific
echo "=== Frontend Health ==="
npm run dev --silent & sleep 5 && kill $! 2>/dev/null
echo "Dev server startup: $(if [ $? -eq 0 ]; then echo 'PASS'; else echo 'FAIL'; fi)"

# Component health
find src/components -name "*.tsx" | wc -l | xargs echo "Components found:"
```

### **AI Integration Health**
```bash
# AI services health  
echo "=== AI Integration Health ==="
find ai-first -name "*.ts" -o -name "*.tsx" | wc -l | xargs echo "AI files found:"

# MCP server health
echo "=== MCP Health ==="
cat .mcp.json | jq '.servers | keys[]' 2>/dev/null || echo "MCP config format issue"
```

### **Database Integration Health**
```bash
# Prisma health
echo "=== Database Integration Health ==="
npx prisma db pull --preview-feature 2>/dev/null && echo "DB schema sync: PASS" || echo "DB schema sync: NEEDS ATTENTION"

# Migration status
npx prisma migrate status 2>/dev/null | tail -3
```

## Automated Health Report

Generate comprehensive health report:

```bash
#!/bin/bash
echo "# SISO Health Report - $(date)"
echo ""

# System health
echo "## System Health"
echo "- Node: $(node --version)"
echo "- npm: $(npm --version)"
echo "- Git: $(git --version | head -1)"
echo ""

# Code health
echo "## Code Health"
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
echo "- TypeScript Errors: $TS_ERRORS"

BUILD_STATUS=$(npm run build 2>&1 >/dev/null && echo "PASS" || echo "FAIL")
echo "- Build Status: $BUILD_STATUS"

TEST_STATUS=$(npm test -- --passWithNoTests --silent >/dev/null 2>&1 && echo "PASS" || echo "FAIL")  
echo "- Test Status: $TEST_STATUS"

# Security health
AUDIT_ISSUES=$(npm audit --audit-level high --json 2>/dev/null | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo "0")
echo "- High/Critical Security Issues: $AUDIT_ISSUES"
echo ""

# Performance health
echo "## Performance Health"
if [ -f "dist/index.html" ]; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    echo "- Bundle Size: $BUNDLE_SIZE"
fi

if [ -f "coverage/lcov-report/index.html" ]; then
    COVERAGE=$(grep -o "[0-9.]*%" coverage/lcov-report/index.html | head -1 || echo "Unknown")
    echo "- Test Coverage: $COVERAGE"
fi
echo ""

# Recommendations
echo "## Recommendations"
[ "$TS_ERRORS" -gt "0" ] && echo "- Fix TypeScript errors for better reliability"
[ "$BUILD_STATUS" = "FAIL" ] && echo "- Resolve build issues before deployment"  
[ "$AUDIT_ISSUES" -gt "0" ] && echo "- Address security vulnerabilities"
[ "$TEST_STATUS" = "FAIL" ] && echo "- Fix failing tests"
```

## Health Monitoring Integration

### **Development Workflow**
```bash
# Pre-commit health check
npm run lint && npm run typecheck && npm test -- --passWithNoTests

# Pre-push health check  
npm run build && npm audit --audit-level high
```

### **CI/CD Integration**
```bash
# Health check pipeline
name: Health Check
run: |
  npm ci
  npm run lint
  npm run typecheck  
  npm test -- --coverage
  npm run build
  npm audit --audit-level moderate
```

### **Continuous Monitoring**
- **Daily**: Automated health report
- **Weekly**: Dependency updates and security audit
- **Monthly**: Performance benchmarks
- **Release**: Full health assessment

## Troubleshooting Common Issues

### **Build Failures**
1. Clear caches: `rm -rf node_modules package-lock.json && npm install`
2. Check TypeScript: `npx tsc --noEmit`
3. Environment variables: `cp .env.example .env`

### **Test Failures**  
1. Update snapshots: `npm test -- --updateSnapshot`
2. Clear test cache: `npm test -- --clearCache`
3. Check database: `node test-database-connection.js`

### **Performance Issues**
1. Bundle analysis: `npm run build && npm run analyze`
2. Memory profiling: Monitor during development
3. Database optimization: Check slow queries
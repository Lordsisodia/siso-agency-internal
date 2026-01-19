# Serena MCP Server Skills

Complete guide to using Serena MCP server with Claude Code.

## Overview

**Serena** is an AI-powered development assistance tool that provides intelligent code analysis, review, and optimization capabilities.

**Type:** STDIO (local)
**Command:** `npx` with Serena package

---

## What is Serena?

Serena is an AI-powered code review and analysis tool that helps with:

- **Code Quality Analysis** - Identifies potential issues and bugs
- **Performance Optimization** - Suggests performance improvements
- **Security Scanning** - Detects security vulnerabilities
- **Best Practices** - Enforces coding standards
- **Refactoring Suggestions** - Recommends code improvements
- **Documentation Generation** - Auto-generates code documentation

---

## Available Skills

### Code Analysis

#### `serena_analyze_code`
Analyze code for quality, bugs, and improvements.

**Usage:**
```
Analyze the current file for issues
Review src/components/Header.tsx for bugs
```

**Parameters:**
- `file_path`: Path to file to analyze
- `focus`: Specific focus area (security, performance, bugs, etc.)

**Returns:**
- Identified issues
- Severity levels
- Suggestions for fixes
- Best practice violations

---

#### `serena_explain_code`
Get detailed explanation of code functionality.

**Usage:**
```
Explain how this function works
What does this component do?
```

**Returns:**
- Code breakdown
- Algorithm explanation
- Data flow analysis
- Dependency mapping

---

#### `serena_review_code`
Perform comprehensive code review.

**Usage:**
```
Review my pull request
Review changes in src/lib/auth.ts
```

**Parameters:**
- `file_path`: Path to review
- `diff`: Only review changed lines (for PRs)

**Returns:**
- Code quality assessment
- Security concerns
- Performance issues
- Style guide violations
- Improvement suggestions

---

### Code Optimization

#### `serena_optimize_performance`
Analyze and optimize code performance.

**Usage:**
```
Optimize this function for performance
Find performance bottlenecks in my code
```

**Returns:**
- Performance bottlenecks
- Optimization opportunities
- Caching suggestions
- Algorithm improvements

---

#### `serena_refactor_code`
Suggest refactoring improvements.

**Usage:**
```
Refactor this component to be more maintainable
Suggest better structure for this file
```

**Returns:**
- Structural improvements
- Design pattern suggestions
- Code organization tips
- Simplification opportunities

---

### Security Analysis

#### `serena_scan_security`
Scan code for security vulnerabilities.

**Usage:**
```
Scan for security issues
Check for XSS vulnerabilities
```

**Returns:**
- Security vulnerabilities
- Common attack vectors
- OWASP top 10 issues
- Remediation steps

---

#### `serena_check_secrets`
Detect exposed secrets and credentials.

**Usage:**
```
Check for exposed API keys
Scan for hardcoded secrets
```

**Returns:**
- Found secrets/credentials
- Location in code
- Severity level
- Recommendations

---

### Documentation

#### `serena_generate_docs`
Generate code documentation.

**Usage:**
```
Generate documentation for this function
Create JSDoc comments for this file
```

**Returns:**
- Function documentation
- Parameter descriptions
- Return value docs
- Usage examples

---

#### `serena_explain_error`
Explain error messages and suggest fixes.

**Usage:**
```
Explain this TypeScript error
What does this error mean and how do I fix it?
```

**Parameters:**
- `error`: Error message or code
- `context`: Surrounding code

**Returns:**
- Error explanation
- Root cause analysis
- Fix suggestions
- Prevention tips

---

### Code Generation

#### `serena_generate_tests`
Generate unit tests for code.

**Usage:**
```
Generate tests for this function
Create test cases for my component
```

**Returns:**
- Test file content
- Test cases
- Mock setup
- Assertions

---

#### `serena_suggest_improvements`
Get general improvement suggestions.

**Usage:**
```
How can I improve this code?
Suggest modern JavaScript alternatives
```

**Returns:**
- Modern language features
- Library alternatives
- Pattern improvements
- Best practice recommendations

---

## Common Workflows

### 1. Code Review Process
```
Review my changes
Check for security issues
Optimize performance
Generate documentation
```

### 2. Debugging Help
```
Explain this error
Why is my code slow?
Find the bug in this function
```

### 3. Code Quality
```
Check code quality
Suggest refactoring
Enforce best practices
Generate tests
```

### 4. Security Audit
```
Scan for vulnerabilities
Check for exposed secrets
Review authentication code
Analyze data handling
```

---

## Integration with Lumelle

### Component Review
```
Review React components for best practices
Optimize component performance
Check for security issues in auth code
```

### Database Code
```
Review Supabase queries
Optimize database access
Check for SQL injection risks
```

### API Code
```
Review API endpoints
Check error handling
Optimize response time
```

---

## Tips

1. **Be specific** - "Review the auth function" vs "Review everything"
2. **Provide context** - Include relevant code snippets
3. **Ask for explanations** - Understand why changes are suggested
4. **Iterate** - Apply suggestions and re-review
5. **Learn** - Use Serena's feedback to improve your coding

---

## Best Practices

✅ **DO:**
- Run Serena before committing
- Address high-severity issues
- Consider all suggestions
- Ask for clarification
- Use for learning

❌ **DON'T:**
- Ignore security warnings
- Blindly accept all changes
- Forget to test suggestions
- Skip code review
- Rely solely on automation

---

## Serena vs Other Tools

| Feature | Serena | Playwright | Chrome DevTools |
|---------|--------|------------|-----------------|
| Code Analysis | ✅ | ❌ | ❌ |
| Security Scanning | ✅ | ❌ | ❌ |
| Performance | ✅ | ✅ | ✅ |
| Testing | ❌ | ✅ | ❌ |
| Browser DevTools | ❌ | ❌ | ✅ |

**Tip:** Use Serena for code analysis, Playwright for testing, Chrome DevTools for browser debugging.

---

## Troubleshooting

**Serena not responding:**
- Check if MCP server is running
- Verify Serena package is installed
- Restart Claude instance

**Generic suggestions:**
- Provide more context
- Specify focus area
- Ask for specific issues

**Performance slow:**
- Analyze smaller code chunks
- Focus on specific files
- Use targeted analysis

---

## Example Usage

### Security Review
```
User: Scan my authentication code for security issues

Claude: [Uses serena_scan_security]
Found 2 potential security issues:
1. Hardcoded API key in auth.ts (line 45)
2. Missing input validation on login form

Recommendations:
- Move API key to environment variables
- Add Zod validation for user input
```

### Performance Optimization
```
User: Optimize this React component

Claude: [Uses serena_optimize_performance]
Performance issues found:
1. Unnecessary re-renders (useMemo needed)
2. Large bundle size (code splitting recommended)
3. Missing key prop (causes reconciliation issues)

Optimizations applied:
✅ Added useMemo for expensive calculations
✅ Implemented lazy loading for images
✅ Fixed key prop in list rendering
```

### Code Explanation
```
User: Explain how the Supabase query works

Claude: [Uses serena_explain_code]
This function performs the following:
1. Connects to Supabase using client
2. Executes a SELECT query with filter
3. Orders results by created_at DESC
4. Limits to 10 records
5. Returns typed results

Data flow: Component → Hook → Supabase → Data → Component
```

---

## Advanced Usage

### Custom Rules
Serena can be configured with custom rules for your project:

```
Enforce Lumelle coding standards
Check for specific patterns
Custom security rules
```

### Integration with CI/CD
```
Run Serena in GitHub Actions
Block merge on critical issues
Generate reports
```

### Team Collaboration
```
Share Serena reviews
Comment on suggestions
Track issue resolution
```

---

**Need Help?** Just ask Claude: "Use Serena to analyze..."

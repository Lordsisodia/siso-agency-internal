# Security Audit Command

Perform comprehensive security audit of the SISO codebase using OWASP guidelines.

## Quick Security Scan

Run immediate security checks:

```bash
# Check for common vulnerabilities
/agent testing-specialist
grep -r "eval\|dangerouslySetInnerHTML\|localStorage\.setItem.*token" src/
```

## Full Security Audit Process

### **1. Authentication & Authorization**
```bash
# Check authentication implementation
grep -r "useAuth\|jwt\|token\|login\|password" src/services/
grep -r "role\|permission\|access" src/

# Verify secure token storage
grep -r "localStorage\|sessionStorage\|cookie" src/
```

### **2. Input Validation**
```bash
# Find Zod schemas and validation
grep -r "z\.\|zod\|schema\|validate" src/
grep -r "useForm\|schema:" src/components/

# Check for unvalidated inputs
grep -r "innerHTML\|dangerouslySetInnerHTML" src/
```

### **3. API Security**
```bash
# Check API endpoint security
grep -r "api/\|fetch\|axios" src/services/
grep -r "CORS\|Origin\|Referer" server.js api/

# Database query security (Prisma)
grep -r "prisma\.\|raw\|sql" src/ prisma/
```

### **4. Data Protection**
```bash
# Check for sensitive data exposure
grep -r "password\|secret\|key\|token" src/ --exclude-dir=node_modules
grep -r "console\.log\|console\.error" src/

# Environment variable security
ls -la .env* && echo "Check .env files for secrets"
```

## Security Checklist

### **Critical Issues** 🚨
- [ ] **Authentication**: Proper JWT handling and expiration
- [ ] **SQL Injection**: Parameterized queries (Prisma handles this)
- [ ] **XSS Prevention**: Input sanitization and CSP headers
- [ ] **CSRF Protection**: CSRF tokens for state-changing operations
- [ ] **Secrets Management**: No hardcoded API keys or passwords

### **High Priority** ⚠️
- [ ] **Input Validation**: All user inputs validated with Zod
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **File Upload**: Proper file type and size validation
- [ ] **Rate Limiting**: API endpoint protection
- [ ] **HTTPS Enforcement**: All communications encrypted

### **Medium Priority** ℹ️
- [ ] **Content Security Policy**: CSP headers configured
- [ ] **Dependency Security**: No known vulnerable packages
- [ ] **Access Controls**: Proper role-based permissions
- [ ] **Logging**: Security events logged appropriately
- [ ] **Session Management**: Secure session handling

## Common SISO Vulnerabilities to Check

### **React/TypeScript Specific**
```bash
# Check for dangerous React patterns
grep -r "dangerouslySetInnerHTML" src/
grep -r "eval\|Function\|setTimeout.*string" src/

# Verify prop validation
grep -r "any\|unknown" src/ --include="*.ts" --include="*.tsx"
```

### **Database Security**
```bash
# Prisma security patterns
grep -r "\$queryRaw\|\$executeRaw" src/
grep -r "prisma\.\w*\.create.*data:" src/
```

### **API Security**
```bash
# Check authentication middleware
grep -r "middleware\|auth\|jwt\.verify" api/ server.js
grep -r "cors\|origin" server.js
```

### **Environment Security**
```bash
# Check for exposed secrets
grep -r "API_KEY\|SECRET\|PASSWORD" src/ --exclude=".env*"
find . -name ".env*" -exec ls -la {} \;
```

## Automated Security Tools

### **npm audit**
```bash
npm audit --audit-level moderate
npm audit fix
```

### **TypeScript Security**
```bash
npx tsc --noEmit --strict
```

### **ESLint Security Rules**
```bash
npm install --save-dev eslint-plugin-security
npx eslint --ext .ts,.tsx src/
```

## Security Report Template

Generate a security audit report with findings categorized by severity:

### **Critical Findings** (Immediate Action Required)
- Issue: [Description]
- Location: [File:Line]
- Risk: [Impact]
- Fix: [Remediation steps]

### **High Priority Findings** (Fix This Week)
- [Similar format]

### **Medium Priority Findings** (Address Next Sprint)
- [Similar format]

### **Security Recommendations**
- [General security improvements]

## Integration with Development

### **Pre-commit Security**
```bash
# Add to pre-commit hooks
npm audit --audit-level high
grep -r "TODO.*security\|FIXME.*security" src/
```

### **CI/CD Security**
```bash
# Security checks in pipeline
npm audit
npx tsc --noEmit
npm run lint
```
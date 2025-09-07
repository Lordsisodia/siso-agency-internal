# 🛡️ SECURITY - DevSecOps & Security-First Development

**Comprehensive security framework for building secure, compliant, and resilient applications.**

## 📁 **Directory Structure**

```
SECURITY/
├── README.md                     # This comprehensive guide
├── security-checklists/          # Development and deployment security checklists
│   ├── code-review-security/     # Security-focused code review checklists
│   ├── deployment-security/      # Secure deployment checklists
│   ├── infrastructure-security/  # Infrastructure security checklists
│   └── README.md                # Security checklist guide
├── vulnerability-scanning/       # Automated vulnerability scanning
│   ├── dependency-scanning/      # Dependency vulnerability scanning
│   ├── code-scanning/            # Static code analysis security scanning
│   ├── container-scanning/       # Container and image vulnerability scanning
│   └── README.md                # Vulnerability scanning guide
├── authentication-templates/     # Secure authentication implementations
│   ├── jwt-auth/                 # JWT authentication templates
│   ├── oauth-integration/        # OAuth provider integration
│   ├── multi-factor-auth/        # MFA implementation templates
│   └── README.md                # Authentication security guide
├── authorization-patterns/       # Access control and authorization
│   ├── rbac-templates/           # Role-based access control
│   ├── permission-systems/       # Permission and policy systems  
│   ├── api-security/             # API authorization patterns
│   └── README.md                # Authorization patterns guide
├── data-protection/              # Data security and privacy
│   ├── encryption-templates/     # Data encryption implementations
│   ├── pii-protection/           # Personal information protection
│   ├── gdpr-compliance/          # GDPR compliance templates
│   └── README.md                # Data protection guide
├── secure-coding/                # Secure coding practices and patterns
│   ├── input-validation/         # Input validation and sanitization
│   ├── sql-injection-prevention/ # SQL injection prevention
│   ├── xss-prevention/           # Cross-site scripting prevention
│   └── README.md                # Secure coding guide
├── compliance/                   # Compliance frameworks and auditing
│   ├── soc2-compliance/          # SOC 2 compliance templates
│   ├── pci-compliance/           # PCI DSS compliance (if applicable)
│   ├── audit-logging/            # Comprehensive audit logging
│   └── README.md                # Compliance framework guide
├── incident-response/            # Security incident response
│   ├── incident-playbooks/       # Security incident response playbooks
│   ├── breach-procedures/        # Data breach response procedures
│   ├── forensics-tools/          # Digital forensics and analysis
│   └── README.md                # Incident response guide
└── security-automation/          # Automated security tools and scripts
    ├── security-testing/         # Automated security testing
    ├── penetration-testing/      # Penetration testing automation
    ├── security-monitoring/      # Security event monitoring
    └── README.md                # Security automation guide
```

## 🎯 **Purpose & Benefits**

### **Security by Design**
- **Shift-Left Security**: Integrate security from the earliest development stages
- **Threat Modeling**: Systematic identification and mitigation of security threats
- **Defense in Depth**: Multiple layers of security controls and protections
- **Continuous Security**: Ongoing security validation and improvement

### **Compliance & Governance**
- **Regulatory Compliance**: GDPR, SOC 2, PCI DSS, and other frameworks
- **Audit Readiness**: Comprehensive audit trails and documentation
- **Risk Management**: Systematic risk assessment and mitigation
- **Security Policies**: Clear security policies and procedures

### **Automated Security**
- **Continuous Scanning**: Automated vulnerability detection and remediation
- **Security Testing**: Integrated security testing in CI/CD pipelines
- **Threat Detection**: Real-time security monitoring and alerting
- **Incident Response**: Automated incident detection and response

## 🚀 **Quick Start Guide**

### **1. Security Environment Setup**
```bash
# Install security tools
npm install --save-dev eslint-plugin-security
npm install --save-dev snyk
npm install helmet express-rate-limit

# Copy security configurations
cp SECURITY/secure-coding/eslint-security.json ./.eslintrc.security.json
cp SECURITY/vulnerability-scanning/snyk-config.json ./snyk-config.json
```

### **2. Authentication Implementation**
```bash
# Copy JWT authentication template
cp -r SECURITY/authentication-templates/jwt-auth/ ./src/auth/
cp SECURITY/authentication-templates/middleware/auth-middleware.js ./src/middleware/

# Setup environment variables
cp SECURITY/authentication-templates/.env.security.example ./.env.security
```

### **3. Security Scanning Setup**
```bash
# Setup automated vulnerability scanning
cp SECURITY/vulnerability-scanning/github-security-scan.yml ./.github/workflows/
cp SECURITY/vulnerability-scanning/dependency-check.js ./scripts/

# Run initial security audit
npm audit
npx snyk test
```

### **4. Secure Coding Standards**
```bash
# Apply secure coding templates
cp -r SECURITY/secure-coding/input-validation/ ./src/utils/validation/
cp -r SECURITY/secure-coding/sql-injection-prevention/ ./src/utils/database/
```

## 📋 **Security Categories**

### **🔍 Security Checklists**

#### **Pre-Deployment Security Checklist**
- [ ] All dependencies scanned for vulnerabilities
- [ ] Static code analysis completed with no high/critical issues
- [ ] Authentication and authorization properly implemented
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention measures in place
- [ ] XSS protection implemented
- [ ] HTTPS enforced for all communications
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Security headers properly configured
- [ ] Error handling doesn't expose sensitive information

#### **Code Review Security Checklist**
- [ ] No hardcoded secrets or credentials
- [ ] Proper input validation and sanitization
- [ ] Authorization checks on all protected endpoints
- [ ] Safe database queries (parameterized/prepared statements)
- [ ] Proper error handling without information disclosure
- [ ] Session management security
- [ ] File upload security (if applicable)
- [ ] Logging of security-relevant events

### **🔒 Authentication Templates**

#### **JWT Authentication Implementation**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// Secure JWT configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '15m', // Short-lived access tokens
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  algorithm: 'HS256'
};

// Secure password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false
});

// Secure token validation middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_CONFIG.secret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithms: [JWT_CONFIG.algorithm]
  }, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

#### **Multi-Factor Authentication**
```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate TOTP secret for user
const generateMFASecret = (userEmail) => {
  return speakeasy.generateSecret({
    name: `SISO App (${userEmail})`,
    issuer: 'SISO',
    length: 32
  });
};

// Verify TOTP token
const verifyMFAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps in either direction
  });
};

// MFA middleware
const requireMFA = async (req, res, next) => {
  const { mfaToken } = req.body;
  const user = req.user;

  if (!user.mfaEnabled) {
    return next(); // MFA not required for this user
  }

  if (!mfaToken) {
    return res.status(401).json({ error: 'MFA token required' });
  }

  const isValidToken = verifyMFAToken(user.mfaSecret, mfaToken);
  if (!isValidToken) {
    return res.status(401).json({ error: 'Invalid MFA token' });
  }

  next();
};
```

### **🛡️ Input Validation & Sanitization**

#### **Comprehensive Input Validation**
```javascript
const joi = require('joi');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Input validation schemas
const schemas = {
  userRegistration: joi.object({
    email: joi.string().email().required(),
    password: joi.string()
      .min(12)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required(),
    name: joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
    phone: joi.string().pattern(/^\+?[\d\s-()]+$/).optional()
  }),

  taskCreation: joi.object({
    title: joi.string().min(1).max(200).required(),
    description: joi.string().max(2000).optional(),
    priority: joi.string().valid('low', 'medium', 'high', 'urgent').required(),
    dueDate: joi.date().iso().min('now').optional()
  })
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // HTML sanitization
      value = purify.sanitize(value);
      // SQL injection character filtering
      value = value.replace(/[';\\x00-\\x1f]/g, '');
      return value.trim();
    }
    return value;
  };

  // Recursively sanitize all input
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      } else {
        obj[key] = sanitizeValue(obj[key]);
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

// Validation middleware factory
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    req.body = value;
    next();
  };
};
```

### **🔐 Database Security**

#### **SQL Injection Prevention**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Secure database queries using Prisma (parameterized)
const secureUserQueries = {
  // Safe user lookup
  findUserByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // Exclude sensitive fields
      }
    });
  },

  // Safe user creation with validation
  createUser: async (userData) => {
    const { email, hashedPassword, name } = userData;
    
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
  },

  // Safe search with proper parameterization
  searchTasks: async (userId, searchTerm, filters) => {
    const where = {
      userId,
      AND: []
    };

    if (searchTerm) {
      where.AND.push({
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      });
    }

    if (filters.priority) {
      where.AND.push({ priority: filters.priority });
    }

    if (filters.status) {
      where.AND.push({ status: filters.status });
    }

    return prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }
};
```

### **🔒 Security Headers & Configuration**

#### **Express Security Middleware**
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Adjust based on needs
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500 // slow down subsequent requests by 500ms per request
});

app.use(generalLimiter);
app.use(speedLimiter);

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many API requests'
});

app.use('/api/', apiLimiter);
```

### **📋 Compliance Templates**

#### **GDPR Compliance Implementation**
```javascript
// Data processing logging for GDPR compliance
const gdprLogger = {
  logDataProcessing: async (userId, processType, dataTypes, legalBasis, purpose) => {
    return prisma.dataProcessingLog.create({
      data: {
        userId,
        processType, // 'create', 'read', 'update', 'delete', 'export'
        dataTypes, // ['personal_info', 'behavioral_data', 'usage_data']
        legalBasis, // 'consent', 'contract', 'legal_obligation', etc.
        purpose, // 'service_provision', 'analytics', 'marketing', etc.
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  },

  // Right to erasure implementation
  deleteUserData: async (userId) => {
    const transaction = await prisma.$transaction(async (tx) => {
      // Anonymize or delete personal data
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-user-${userId}@privacy.local`,
          name: 'Deleted User',
          phone: null,
          profileData: null,
          deletedAt: new Date()
        }
      });

      // Delete associated data
      await tx.userSession.deleteMany({ where: { userId } });
      await tx.userPreference.deleteMany({ where: { userId } });
      
      // Keep aggregated/anonymized data for analytics
      await tx.analyticsData.updateMany({
        where: { userId },
        data: { userId: null, anonymized: true }
      });

      return { success: true };
    });

    return transaction;
  },

  // Data export for portability
  exportUserData: async (userId) => {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        preferences: true,
        sessions: {
          select: {
            createdAt: true,
            ipAddress: true,
            userAgent: true
          }
        }
      }
    });

    // Remove sensitive data from export
    const { password, ...exportData } = userData;
    
    return {
      exportDate: new Date().toISOString(),
      userData: exportData,
      dataTypes: [
        'account_information',
        'task_data',
        'preferences',
        'session_history'
      ]
    };
  }
};
```

### **🚨 Security Monitoring & Alerting**

#### **Security Event Detection**
```javascript
const securityMonitor = {
  // Failed login attempt tracking
  trackFailedLogin: async (email, ipAddress, userAgent) => {
    const recentAttempts = await redis.incr(`failed_login:${ipAddress}`);
    await redis.expire(`failed_login:${ipAddress}`, 3600); // 1 hour window

    if (recentAttempts >= 5) {
      // Alert on suspicious activity
      await this.sendSecurityAlert('SUSPICIOUS_LOGIN_ACTIVITY', {
        email,
        ipAddress,
        userAgent,
        attemptCount: recentAttempts
      });
    }

    return recentAttempts;
  },

  // Unusual activity detection
  detectUnusualActivity: async (userId, activity) => {
    const patterns = await this.getUserPatterns(userId);
    
    // Check for unusual login location
    if (activity.type === 'login' && !this.isKnownLocation(patterns.locations, activity.location)) {
      await this.sendSecurityAlert('UNUSUAL_LOGIN_LOCATION', {
        userId,
        newLocation: activity.location,
        knownLocations: patterns.locations
      });
    }

    // Check for unusual access patterns
    if (activity.type === 'api_access' && this.isUnusualAccessPattern(patterns.access, activity)) {
      await this.sendSecurityAlert('UNUSUAL_ACCESS_PATTERN', {
        userId,
        activity,
        normalPattern: patterns.access
      });
    }
  },

  // Security alert system
  sendSecurityAlert: async (alertType, data) => {
    const alert = {
      type: alertType,
      severity: this.getAlertSeverity(alertType),
      timestamp: new Date(),
      data,
      id: crypto.randomUUID()
    };

    // Log security event
    logger.warn('Security Alert', alert);

    // Send to monitoring system
    await this.sendToMonitoringSystem(alert);

    // Notify security team for high severity alerts
    if (alert.severity >= 8) {
      await this.notifySecurityTeam(alert);
    }

    return alert;
  }
};
```

## 🔗 **Integration with Factory**

### **Connects With**
- **AUTOMATION/**: Automated security scanning in CI/CD pipelines
- **MONITORING/**: Security event monitoring and alerting integration
- **TESTING/**: Security testing and penetration testing automation
- **ENVIRONMENTS/**: Secure environment configuration and secrets management

### **Supports**
- **Secure Development**: Security-first development practices
- **Compliance**: Regulatory compliance and audit readiness
- **Threat Detection**: Real-time security monitoring and response
- **Risk Management**: Systematic security risk assessment and mitigation

## 💡 **Pro Tips**

### **Security Implementation**
- Start with threat modeling to understand your attack surface
- Implement security controls in layers (defense in depth)
- Use established security libraries and frameworks
- Regular security training for development team

### **Security Testing**
- Automate security scanning in CI/CD pipelines
- Regular penetration testing and security audits
- Implement security regression testing
- Monitor security metrics and trends

### **Incident Response**
- Prepare incident response playbooks in advance
- Practice incident response procedures regularly
- Maintain up-to-date contact lists and escalation procedures
- Learn from security incidents and improve processes

---

*Security by Design | Zero Trust Architecture | Continuous Protection*
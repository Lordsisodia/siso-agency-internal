# 🚀 Quick Start - Get Up & Running

**Environment setup, development server configuration, and onboarding guides for SISO Internal development.**

## 📁 **Documentation Contents**

This folder contains everything needed to start developing with SISO Internal:

- **Environment Setup** - Complete development environment configuration
- **Local Development** - Development server setup and workflow
- **Database Setup** - PostgreSQL/SQLite configuration and seeding
- **Authentication Setup** - JWT and user management configuration
- **Troubleshooting Guide** - Common issues and solutions
- **Onboarding Checklist** - New developer onboarding workflow

## 🎯 **Quick Setup**

### **1. Prerequisites**
```bash
# Required tools
node -v    # v18.x or higher
npm -v     # v9.x or higher
git --version
```

### **2. Project Setup**
```bash
# Clone and install
git clone <repository-url>
cd siso-internal
npm install

# Environment configuration
cp .env.example .env.local
# Edit .env.local with your configurations
```

### **3. Database Setup**
```bash
# Initialize database
npm run db:setup
npm run db:migrate
npm run db:seed
```

### **4. Development Server**
```bash
# Start development servers
npm run dev        # Frontend (Vite)
npm run dev:server # Backend (Express)
```

## 🗄️ **Database Quick Start**

### **Development Database (SQLite)**
```bash
# Quick local setup
npm run db:reset    # Reset to clean state
npm run db:studio   # Open Prisma Studio
```

### **Production Database (PostgreSQL)**
```bash
# Production setup
DATABASE_URL="postgresql://user:pass@host:5432/db"
npm run db:deploy   # Deploy migrations
```

## 🔐 **Authentication Setup**

### **JWT Configuration**
```bash
# Generate JWT secret
openssl rand -base64 32

# Add to .env.local
JWT_SECRET="your-generated-secret"
JWT_EXPIRES_IN="7d"
```

### **User Roles**
- **Admin**: Full system access
- **Manager**: Team management access
- **User**: Standard user access
- **Guest**: Limited read-only access

## 🧪 **Testing Setup**

### **Test Environment**
```bash
# Test database setup
NODE_ENV=test npm run db:reset
npm run test:setup

# Run tests
npm test           # Unit tests
npm run test:e2e   # End-to-end tests
npm run test:watch # Watch mode
```

## 🚨 **Common Issues**

### **Port Conflicts**
```bash
# Check port usage
lsof -i :5173  # Frontend port
lsof -i :3001  # Backend port

# Kill process if needed
kill -9 <PID>
```

### **Database Connection**
```bash
# Reset database connection
npm run db:reset
rm -rf node_modules/.prisma
npm run db:generate
```

### **Environment Variables**
```bash
# Verify environment loading
npm run env:check
```

## ✅ **Onboarding Checklist**

### **Development Environment**
- [ ] Node.js v18+ installed
- [ ] Git configured with SSH keys
- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Database setup and seeded
- [ ] Development server running successfully

### **Code Standards**
- [ ] ESLint and Prettier configured in IDE
- [ ] TypeScript setup validated
- [ ] Pre-commit hooks installed
- [ ] Code standards documentation reviewed

### **AI Development Setup**
- [ ] Claude Code CLI installed
- [ ] MCP servers configured
- [ ] AI workflow patterns reviewed
- [ ] Team collaboration patterns understood

### **First Contribution**
- [ ] Created development branch
- [ ] Made small test change
- [ ] Ran test suite successfully
- [ ] Created pull request
- [ ] Code review completed

## 🔄 **Development Workflow**

### **Daily Development**
```bash
# Start development session
git pull origin main
npm run dev

# Create feature branch
git checkout -b feature/your-feature

# Development cycle
# 1. Write code
# 2. Run tests
# 3. Commit changes
# 4. Push to remote
# 5. Create pull request
```

### **Code Quality Checks**
```bash
# Pre-commit validation
npm run lint      # ESLint check
npm run type-check # TypeScript validation
npm test         # Test suite
npm run build    # Build validation
```

## 🔄 **Related Resources**

- **Code Standards**: [../code-standards/](../code-standards/)
- **Claude Workflows**: [../claude-workflow/](../claude-workflow/)
- **Technical Architecture**: [../../TECHNICAL/](../../TECHNICAL/)
- **Testing Guide**: [../../REPORTS/testing-results/](../../REPORTS/testing-results/)

---

*Fast Setup | Clear Instructions | Productive Development*
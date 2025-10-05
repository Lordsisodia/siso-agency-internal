# 🛠️ DEV-SCRIPTS

**Development utility scripts and testing tools for SISO Internal**

## 📁 **Organized Directory Structure**

### **📊 database/** - Database Testing & Verification
- `verify-database.ts` - Comprehensive database integration tests
- `test-database-simple.js` - Simple database connectivity tests
- `test-prisma-integration.js` - Prisma ORM testing
- `test-real-database.js` - Real database operations testing
- `check-database-data.js` - Database connection and data testing
- `prisma-console-test.js` - Prisma ORM testing and debugging

### **🧪 testing/** - UI & User Testing Scripts
- `test-ui-fix.js` - UI functionality testing
- `test-ui-persistence.js` - UI state persistence testing
- `debug-ui-persistence.js` - UI debugging utilities
- `test-user-creation.js` - User creation flow testing
- `test-xp-store-flow.js` - XP store functionality testing

### **🔧 utilities/** - Development Utilities
- `check-env.js` - Environment configuration validation
- `find-my-tasks.js` - Task finding and management utility
- `audit-all-tasks.js` - Audit all tasks in database
- `cleanup-fake-light-tasks.js` - Clean up test/fake tasks
- `comprehensive-cleanup.js` - Database cleanup operations
- `check-users.js` - User validation checks
- `check-light-work-tasks.js` - Light work tasks validation
- `capture-screenshot.js` - Screenshot capture utility
- `validate-react.js` - React setup validation

### **⚡ mcp/** - MCP Integration Scripts
- `check-mcp-health.ts` - MCP server health checks
- `demo-mcp-features.ts` - MCP feature demonstrations

## 🎯 **Purpose**

Organized collection of development utility scripts for:
- **Database Operations**: Testing, verification, and maintenance
- **UI Testing**: Component and user flow validation
- **System Utilities**: Environment checks and task management
- **MCP Integration**: Model Context Protocol testing and demos

## 🚀 **Usage Examples**

### **Database Testing**
```bash
# Comprehensive database verification
node .SISO-APP-FACTORY/dev-scripts/database/verify-database.ts

# Simple connectivity test
node .SISO-APP-FACTORY/dev-scripts/database/test-database-simple.js

# Prisma integration testing
node .SISO-APP-FACTORY/dev-scripts/database/test-prisma-integration.js
```

### **UI Testing**
```bash
# Test UI persistence functionality
node .SISO-APP-FACTORY/dev-scripts/testing/test-ui-persistence.js

# Debug UI state issues
node .SISO-APP-FACTORY/dev-scripts/testing/debug-ui-persistence.js

# Test XP store flow
node .SISO-APP-FACTORY/dev-scripts/testing/test-xp-store-flow.js
```

### **Development Utilities**
```bash
# Environment validation
node .SISO-APP-FACTORY/dev-scripts/utilities/check-env.js

# Task management
node .SISO-APP-FACTORY/dev-scripts/utilities/find-my-tasks.js

# Database cleanup
node .SISO-APP-FACTORY/dev-scripts/utilities/comprehensive-cleanup.js
```

### **MCP Integration**
```bash
# Check MCP server health
node .SISO-APP-FACTORY/dev-scripts/mcp/check-mcp-health.ts

# Demo MCP features
node .SISO-APP-FACTORY/dev-scripts/mcp/demo-mcp-features.ts
```

## 📋 **Best Practices**

### **Script Guidelines**
- **Organized by Purpose**: Scripts grouped by functionality
- **Clear Naming**: Descriptive names indicating purpose
- **Error Handling**: Proper error handling and clear output
- **Documentation**: Each script includes purpose and usage info

### **Security**
- **No Secrets**: Never commit sensitive data
- **Environment Variables**: Use .env for configuration
- **Input Validation**: Sanitize and validate all inputs
- **Safe Operations**: Confirm destructive operations

## 🔧 **Development Workflow**

1. **Environment Setup**: Use `utilities/check-env.js`
2. **Database Verification**: Run `database/verify-database.ts`
3. **Feature Testing**: Use appropriate `testing/` scripts
4. **System Maintenance**: Leverage `utilities/` cleanup scripts
5. **MCP Integration**: Test with `mcp/` health checks

## 📊 **Script Categories Summary**

- **📊 Database**: 6 scripts for database operations
- **🧪 Testing**: 5 scripts for UI and user testing
- **🔧 Utilities**: 9 scripts for system maintenance
- **⚡ MCP**: 2 scripts for MCP integration

**Total: 22 organized development utility scripts**

---
*Organized Development Utilities | SISO Internal Development Tools*
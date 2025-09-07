# 🔧 TOOLS - Development Utilities & Scripts

**Comprehensive collection of development scripts, automation tools, and utility programs for SISO Internal.**

## 📁 **Directory Structure**

```
TOOLS/
├── README.md                      # This comprehensive guide
├── dev-scripts/                   # Organized development utilities (38 scripts)
│   ├── database/                  # Database testing & operations (10 scripts)
│   ├── mcp/                      # MCP integration & health checks (2 scripts)  
│   ├── testing/                  # UI & user flow testing (13 scripts)
│   ├── utilities/                # System maintenance & validation (13 scripts)
│   └── README.md                 # Detailed dev-scripts documentation
├── get-feedback-tasks.js         # Feedback task analysis tool
├── test-screenshot.js            # Mobile screenshot testing utility
├── task-recovery-tool.html       # Browser-based task recovery interface
├── supabase-feedback-setup.sql   # Database feedback schema setup
└── webhook.html                  # Webhook testing and debugging interface
```

## 🎯 **Tool Categories**

### **📊 Database Tools (10 scripts)**
Located in `dev-scripts/database/`

- **`verify-database.ts`** - Comprehensive database integration testing
- **`test-database-simple.js`** - Basic connectivity and health checks
- **`test-prisma-integration.js`** - Prisma ORM functionality testing
- **`test-real-database.js`** - Real database operations validation
- **`check-database-data.js`** - Database connection and data verification
- **`prisma-console-test.js`** - Prisma debugging and console testing
- **`restore-database.js`** - Database restoration from backup files
- **`search_all_tables.js`** - Advanced database table searching and analysis
- **`search_raw_sql.js`** - Raw SQL query execution and debugging
- **`verify-restoration.js`** - Database restoration verification utility

### **🧪 Testing & QA Tools (13 scripts)**
Located in `dev-scripts/testing/`

- **`test-ui-fix.js`** - UI functionality and component testing
- **`test-ui-persistence.js`** - UI state persistence validation
- **`debug-ui-persistence.js`** - UI debugging utilities and diagnostics
- **`test-user-creation.js`** - User registration flow testing
- **`test-xp-store-flow.js`** - XP store and gamification testing
- **`test-bali-task-api.js`** - Bali task API endpoint testing
- **`test-eisenhower-matrix.js`** - Priority matrix functionality testing
- **`test-microphone-direct.js`** - Voice input and microphone testing
- **`test-real-tasks.js`** - Real-world task scenario testing
- **`test-rollover-system.js`** - Task rollover logic validation
- **`test-thought-dump.js`** - Thought dump feature testing
- **`test-vercel-apis.js`** - Vercel API integration testing
- **`test-data.json`** - Test data fixtures and samples

### **🔧 System Utilities (13 scripts)**
Located in `dev-scripts/utilities/`

- **`check-env.js`** - Environment configuration validation
- **`find-my-tasks.js`** - Task finding and management utility
- **`audit-all-tasks.js`** - Comprehensive task database audit
- **`cleanup-fake-light-tasks.js`** - Test data cleanup operations
- **`comprehensive-cleanup.js`** - Database maintenance and cleanup
- **`check-users.js`** - User data validation and verification
- **`check-light-work-tasks.js`** - Light work task validation
- **`capture-screenshot.js`** - Screenshot capture automation
- **`validate-react.js`** - React setup and configuration validation
- **`check_tasks.js`** - Task status checking and analysis
- **`debug-tasks-recovery.js`** - Task recovery debugging utility
- **`find_large_tasks.js`** - Large task identification and analysis
- **`verify-bali-task.js`** - Bali task validation and verification

### **⚡ MCP Integration (2 scripts)**
Located in `dev-scripts/mcp/`

- **`check-mcp-health.ts`** - MCP server health monitoring
- **`demo-mcp-features.ts`** - MCP feature demonstrations and testing

### **🛠️ Standalone Utilities (5 tools)**
Root level tools for specific purposes

- **`get-feedback-tasks.js`** - Extracts all tasks for feedback analysis
- **`test-screenshot.js`** - Mobile testing with Puppeteer automation
- **`task-recovery-tool.html`** - Browser-based task recovery interface
- **`supabase-feedback-setup.sql`** - Feedback system database schema
- **`webhook.html`** - Webhook testing and debugging interface

## 🚀 **Quick Usage Guide**

### **Database Operations**
```bash
# Comprehensive database verification
node TOOLS/dev-scripts/database/verify-database.ts

# Simple connectivity test
node TOOLS/dev-scripts/database/test-database-simple.js

# Check database data integrity
node TOOLS/dev-scripts/database/check-database-data.js
```

### **Testing & QA**
```bash
# Test UI persistence functionality
node TOOLS/dev-scripts/testing/test-ui-persistence.js

# Run user creation flow tests
node TOOLS/dev-scripts/testing/test-user-creation.js

# Test XP store gamification features
node TOOLS/dev-scripts/testing/test-xp-store-flow.js
```

### **System Maintenance**
```bash
# Validate environment configuration
node TOOLS/dev-scripts/utilities/check-env.js

# Find and analyze user tasks
node TOOLS/dev-scripts/utilities/find-my-tasks.js

# Clean up test data
node TOOLS/dev-scripts/utilities/comprehensive-cleanup.js
```

### **MCP Integration**
```bash
# Check MCP server health
node TOOLS/dev-scripts/mcp/check-mcp-health.ts

# Demo MCP features
node TOOLS/dev-scripts/mcp/demo-mcp-features.ts
```

### **Feedback Analysis**
```bash
# Extract all tasks for feedback analysis
node TOOLS/get-feedback-tasks.js
```

### **Mobile Testing**
```bash
# Run mobile screenshot testing
node TOOLS/test-screenshot.js
```

## 📋 **Development Workflows**

### **New Feature Development**
1. **Environment Check**: `utilities/check-env.js`
2. **Database Verification**: `database/verify-database.ts`
3. **UI Testing**: `testing/test-ui-*.js` scripts
4. **Data Validation**: `utilities/audit-all-tasks.js`

### **Bug Fixing & Debugging**
1. **Issue Reproduction**: `testing/debug-ui-persistence.js`
2. **Data Analysis**: `utilities/find-my-tasks.js`
3. **Database Check**: `database/check-database-data.js`
4. **System Validation**: `utilities/validate-react.js`

### **Production Deployment**
1. **Pre-deployment Checks**: `database/verify-database.ts`
2. **Data Cleanup**: `utilities/comprehensive-cleanup.js`
3. **Health Monitoring**: `mcp/check-mcp-health.ts`
4. **Final Validation**: Environment and system checks

### **Maintenance & Cleanup**
1. **Task Audit**: `utilities/audit-all-tasks.js`
2. **User Validation**: `utilities/check-users.js`
3. **Data Cleanup**: `utilities/cleanup-fake-light-tasks.js`
4. **System Health**: All verification scripts

## 🔐 **Security & Best Practices**

### **Data Protection**
- **No Hardcoded Secrets**: All tools use environment variables
- **Input Validation**: Proper sanitization in all scripts
- **Safe Operations**: Confirmation prompts for destructive actions
- **Error Handling**: Comprehensive error catching and logging

### **Script Guidelines**
- **Clear Documentation**: Each script includes purpose and usage
- **Consistent Naming**: Descriptive names indicating functionality
- **Modular Design**: Organized by purpose and functionality
- **Error Reporting**: Detailed error messages and stack traces

### **Development Standards**
- **TypeScript Support**: Modern scripts use TypeScript
- **ES6+ Features**: Modern JavaScript standards
- **Async/Await**: Proper async operation handling
- **Console Formatting**: Color-coded output for clarity

## 📊 **Tool Inventory Summary**

| Category | Scripts | Purpose | Key Features |
|----------|---------|---------|--------------|
| **Database** | 10 | Database operations | Prisma integration, health checks, SQL debugging |
| **Testing** | 13 | Quality assurance | UI testing, user flows, API validation |
| **Utilities** | 13 | System maintenance | Environment checks, cleanup, task analysis |
| **MCP** | 2 | AI integration | Health monitoring, demos |
| **Standalone** | 5 | Specialized tools | Feedback analysis, screenshots |

**Total: 43 development tools and utilities**

## 💡 **Adding New Tools**

### **Organization Guidelines**
- **Database scripts** → `dev-scripts/database/`
- **Testing utilities** → `dev-scripts/testing/`
- **System tools** → `dev-scripts/utilities/`
- **MCP tools** → `dev-scripts/mcp/`
- **Specialized tools** → Root level with clear naming

### **Naming Conventions**
- **Action-based**: `check-`, `test-`, `validate-`, `cleanup-`
- **Purpose-clear**: Descriptive names explaining functionality
- **Consistent format**: lowercase with hyphens
- **File extensions**: `.js` for Node.js, `.ts` for TypeScript, `.html` for web tools

## 🔄 **Related Documentation**

- **Development Setup**: [../DOCS/ESSENTIALS/quick-start/](../DOCS/ESSENTIALS/quick-start/)
- **Code Standards**: [../DOCS/ESSENTIALS/code-standards/](../DOCS/ESSENTIALS/code-standards/)
- **Database Guide**: [../DOCS/TECHNICAL/database/](../DOCS/TECHNICAL/database/)
- **Testing Strategy**: [../DOCS/REPORTS/testing-results/](../DOCS/REPORTS/testing-results/)
- **MCP Integration**: [../MCP/](../MCP/)

---

*Complete Development Toolkit | Organized Workflows | Maximum Productivity*
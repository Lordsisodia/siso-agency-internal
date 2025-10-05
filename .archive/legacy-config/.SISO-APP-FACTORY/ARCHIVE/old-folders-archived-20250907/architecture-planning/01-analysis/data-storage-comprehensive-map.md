# SISO Data Storage Comprehensive Map

*Complete analysis of all data storage locations, patterns, and dependencies in SISO-INTERNAL*

**Analysis Date**: 2025-09-07  
**Analysis Scope**: Complete codebase data storage discovery  
**Safety Level**: CRITICAL - All transformation work depends on this analysis  

---

## 🗄️ DATA STORAGE ARCHITECTURE OVERVIEW

### **Primary Storage Systems**
1. **localStorage** (Browser) - PRIMARY USER DATA STORAGE
2. **Supabase** (Cloud Database) - SECONDARY/SYNC STORAGE  
3. **File System** (Local Files) - DEVELOPMENT/BACKUP DATA
4. **sessionStorage** (Browser Session) - TEMPORARY DATA

### **Critical Finding**: DUAL STORAGE SYSTEM
⚠️ **SISO runs a COMPLEX dual storage system with local-first approach and cloud backup**

---

## 📋 LOCALSTORAGE USAGE ANALYSIS

### **Core Task Management Storage**
```typescript
// Primary task storage keys
'lifelock-personal-tasks'           // Main personal task storage
'lifelock-{dateKey}-{category}'     // Date-based task storage
'tasks-data'                        // Legacy task data
'admin-tasks'                       // Admin/business tasks
'workflow-completed-tasks'          // Workflow progress tracking
```

### **Business & Client Data**
```typescript
// Business onboarding and client data
'business-onboarding-data'          // Business profile information
'client-profile'                    // Client profile data
'user-project-data'                 // Project information
'plan-builder-data'                 // Plan building data
'generated-app-plans'               // Generated application plans
'latest-app-plan'                   // Most recent app plan
```

### **System Configuration & Settings**
```typescript
// App configuration
'tasks-new-system-enabled'          // Feature flag for new task system
'setupProgress'                     // Setup checklist progress
'preferredAdminPage'                // Last visited admin page
'projectContexts'                   // Project contexts for tasks
'clientSavedViews'                  // Saved client view configurations
```

### **AI & Integration Data**
```typescript
// AI service configuration
'anthropic_api_key'                 // Claude API key storage
'claudia_launch_request'            // Claudia integration requests
'claudia_execution_{agentId}'       // Agent execution state
'claudia_agent_create'              // Agent creation data
```

### **Analytics & Tracking**
```typescript
// User analytics and gamification
'siso-gamification-progress'        // XP, levels, achievements
'siso-flow-stats'                   // Flow state tracking
'siso-flow-sessions'                // Flow session history
'siso-backup-url'                   // Backup file URLs
'siso-backup-filename'              // Backup file names
```

### **Enhanced Features Data**
```typescript
// Advanced feature storage
'lifelock-{dateKey}-enhancedLightWorkTasks'  // Enhanced light work tasks
'{storageKey}-backup-{timestamp}'            // Multiple backup layers
'{dateKey}'                                  // Date-based task storage
```

---

## 🎯 SUPABASE INTEGRATION ANALYSIS

### **Database Tables (Identified from Code)**
```sql
-- Core User Management
users                    -- User profiles and authentication
user_roles              -- User role assignments

-- Task Management System
tasks                   -- Main tasks table
light_work_tasks        -- Light work/quick tasks
deep_work_tasks         -- Deep work/focus tasks
task_subtasks           -- Task subtasks/breakdown

-- Client & Business Management
client_onboarding       -- Client onboarding data
clients                 -- Client information
client_user_links       -- Client-user relationships
plans                   -- Business plans
plan_phases            -- Plan phases/sections
plan_subsections       -- Detailed plan sections

-- Analytics & Tracking
analytics_snapshots     -- Performance analytics
partner_analytics       -- Partnership tracking
leaderboard            -- User leaderboards
user_points           -- Point/XP tracking
login_streaks         -- Login streak tracking

-- Content & Communication
chat_conversations     -- Chat history
instagram_leads        -- Social media leads
outreach_campaigns     -- Marketing campaigns
whatsapp_messages      -- WhatsApp integration

-- Financial Management
transactions           -- Financial transactions  
payment_methods        -- Payment tracking
invoices              -- Invoice management
expenses              -- Expense tracking
categories            -- Expense categories
vendors               -- Vendor management

-- Project Management
projects              -- Project data
project_wireframes    -- Wireframes/mockups
user_flows           -- User flow diagrams
portfolio_items      -- Portfolio projects

-- Workflow & Automation
workflows             -- Automated workflows
workflow_instances    -- Workflow executions
workflow_steps        -- Individual workflow steps
```

### **Supabase Features Used**
- **Authentication**: Clerk integration with Supabase auth
- **Real-time subscriptions**: Live task updates
- **Edge Functions**: AI processing, email sending
- **Row Level Security (RLS)**: Data access control
- **Storage**: File and image storage
- **Remote Procedure Calls (RPC)**: Custom database functions

---

## 📁 FILE SYSTEM STORAGE

### **Development & Content Files**
```bash
# Content generation and knowledge base
data/youtube-content/           # YouTube scraped content
knowledge-base/insights/        # Processed insights
processed-insights/            # Analyzed content
reports/                      # Generated reports
```

### **Backup & Migration Files**
```bash
# User data backups (CRITICAL)
siso-tasks-backup-{date}.json  # Complete task backups
{localStorageKey}_backup_*     # Migration backups  
{localStorageKey}_final_backup_* # Pre-migration backups
```

### **Configuration Files**
```bash
tasks-{workflowId}.json       # Workflow task definitions
project-files/               # Generated project files
```

---

## ⚡ DATA FLOW PATTERNS

### **Task Data Flow**
```
User Input → localStorage (immediate) → Background Sync → Supabase
         ↓                                              ↓
   Browser Storage                                Cloud Storage
   (Primary Source)                              (Backup & Sync)
```

### **Migration System**
```typescript
// Active migration system found in code:
MigrationService {
  migrateLocalStorageToSupabase()   // Migrates localStorage → Supabase
  clearLocalStorageAfterMigration() // Cleans up after migration
  checkMigrationStatus()            // Status of migration process
  restoreFromBackup()              // Emergency restore capability
}
```

### **Backup Strategy**
```typescript
// Multi-layer backup system:
Layer 1: Main localStorage key
Layer 2: Multiple localStorage backup keys  
Layer 3: Date-based localStorage backups
Layer 4: sessionStorage fallback
Layer 5: File system JSON exports
Layer 6: Supabase cloud backup
```

---

## 🚨 CRITICAL RISKS IDENTIFIED

### **HIGH RISK: Data Loss Scenarios**
1. **localStorage Clear**: User loses ALL data if localStorage is cleared
2. **Migration Failure**: Risk during localStorage → Supabase migration
3. **Dual Storage Inconsistency**: localStorage and Supabase out of sync
4. **Date Key Dependencies**: Task storage tied to specific date formats

### **TRANSFORMATION RISKS**
1. **Complex Storage Patterns**: 50+ different localStorage keys
2. **Backup Dependencies**: Multiple backup systems that could break
3. **Migration System Active**: Ongoing localStorage → Supabase migration
4. **Date-Based Storage**: Complex date-key patterns for task storage

---

## 🔐 EXTERNAL DEPENDENCIES

### **Critical External Services**
```typescript
// CRITICAL: App cannot function without these
Supabase: {
  url: 'https://avdgyrepwrvsvwgxrccr.supabase.co',
  anon_key: '[CONFIGURED]',
  usage: 'Primary cloud database, auth, storage, functions'
}

Clerk: {
  usage: 'Authentication, user management', 
  integration: 'Supabase auth integration'
}
```

### **AI Service Dependencies**
```typescript
// AI functionality requires these
Anthropic: {
  api_key: 'stored in localStorage',
  usage: 'Claude API for AI features'
}

Groq: {
  usage: 'Alternative AI processing'
}
```

### **Development Dependencies** 
```typescript
// Development and build system
React: '^18.3.1',           // Core UI framework
Vite: '^5.4.1',            // Build system  
TypeScript: '^5.5.3',      // Type system
TailwindCSS: '^3.4.11',    // Styling
```

---

## 📊 DATA SAFETY ASSESSMENT

### **Current Backup Systems**
✅ **Multiple localStorage backups**: Strong redundancy  
✅ **Date-based backups**: Time-series safety  
✅ **sessionStorage fallback**: Session recovery  
✅ **File export capability**: External backups  
✅ **Supabase sync**: Cloud redundancy  

### **Data Recovery Capability**
✅ **Migration restore**: Can restore from migration backups  
✅ **Backup enumeration**: System can find all backup keys  
✅ **Emergency procedures**: Documented recovery workflows  

### **Identified Vulnerabilities**
⚠️ **localStorage dependency**: Primary data in volatile storage  
⚠️ **Date format sensitivity**: Complex date-key patterns  
⚠️ **Migration state**: App in transition between storage systems  
⚠️ **Dual system complexity**: Two sources of truth  

---

## 📋 DATA EXPORT/IMPORT REQUIREMENTS

### **Must Export Data Types**
```typescript
interface CompleteUserData {
  // Core task data
  personalTasks: Task[];
  adminTasks: Task[];
  completedWorkflowTasks: TaskId[];
  
  // Business data
  businessOnboarding: BusinessProfile;
  clientProfile: ClientProfile;
  projectData: ProjectData;
  planBuilderData: PlanData;
  
  // App state
  setupProgress: string[];
  preferences: AppPreferences;
  projectContexts: ProjectContext[];
  
  // Analytics
  gamificationProgress: GamificationState;
  flowStats: FlowStateData;
  flowSessions: FlowSession[];
  
  // AI configuration (excluding sensitive keys)
  aiSettings: AIConfiguration;
}
```

### **Critical Export Functions Needed**
```typescript
// Required before any transformation
exportCompleteUserData(): CompleteUserData
importCompleteUserData(data: CompleteUserData): boolean  
validateDataIntegrity(data: CompleteUserData): ValidationResult
createEmergencyBackup(): BackupInfo
restoreFromEmergencyBackup(backupId: string): boolean
```

---

## 🎯 TRANSFORMATION IMPLICATIONS

### **SAFE Transformation Requirements**
1. **Complete Data Export**: Export ALL localStorage data before changes
2. **Dual System Support**: Support both old and new during transition  
3. **Incremental Migration**: Feature-by-feature, not all-at-once
4. **Rollback Capability**: Ability to restore to any previous state
5. **Data Validation**: Ensure data integrity at every step

### **Architecture Decision Impact**
- **Plugin-First Architecture**: Must preserve all current data types
- **Local-First Storage**: Aligns with current localStorage patterns
- **IndexedDB Migration**: Need migration from localStorage → IndexedDB
- **Backup Strategy**: Must maintain or improve current backup redundancy

---

## ✅ NEXT STEPS FOR WEEK 1

1. **Create User Data Export System** (Day 3-4)
2. **Test Complete Data Export/Import** (Day 5)  
3. **Verify App Functionality** (Day 6)
4. **Create Emergency Procedures** (Day 7)

This analysis provides the foundation for safe architectural transformation while preserving all user data and functionality.
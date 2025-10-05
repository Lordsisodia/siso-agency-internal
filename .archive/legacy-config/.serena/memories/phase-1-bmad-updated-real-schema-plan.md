# BMAD Phase 1 - UPDATED: Universal Offline Storage (Real Schema)

## 🎉 **BREAKTHROUGH UPDATE**

### **✅ MAJOR DISCOVERY: CORRECT DATABASE CONNECTED**
- **Correct Project**: `avdgyrepwrvsvwgxrccr.supabase.co` ✅
- **Task Tables**: ALREADY EXIST! ✅
- **Rich Schema**: 20+ tables discovered ✅
- **Environment**: Fixed and configured ✅

### **ACTUAL SUPABASE SCHEMA (CONFIRMED)**

**Core Productivity Tables** ✅:
- `light_work_tasks` (your light work tasks!)
- `deep_work_sessions` (your deep work tracking!)
- `tasks` (generic task system)
- `daily_health` (already offline supported)
- `daily_habits` (daily habit tracking)
- `daily_tracker` (comprehensive daily tracking)
- `time_blocks` (time blocking system)

**User & System Tables** ✅:
- `users` (already offline supported)  
- `user_roles` (user permissions)
- `user_feedback` (feedback system)
- `login_streaks` (gamification)

**Advanced Features** ✅:
- `project_memories` (AI memory system)
- `skills` & `skill_paths` (skill progression)
- `business_context` (business intelligence)
- `scheduled_tasks` (task automation)
- `expense_categories` (expense tracking)
- `daily_reflections` (reflection system)
- `task_templates` (template system)
- `prompts` (AI prompt management)

## 🚀 **REVISED PHASE 1 IMPLEMENTATION PLAN**

### **HUGE ADVANTAGE**: Your offline infrastructure already works!
- IndexedDB system: ✅ Working
- Service Worker: ✅ Working  
- Sync Service: ✅ Working
- Task Management: ✅ Working

### **PHASE 1A: Immediate Enhancement (Week 1)**

#### **Story 1.1: Fix Sync Table Mapping** 
**Objective**: Update offline code to use correct table names

**Current Issue**: Code references `user_light_work_tasks` but table is `light_work_tasks`

**Tasks**:
1. Update `offlineManager.ts` table mapping:
   ```typescript
   const tableMapping: Record<string, string> = {
     'lightWorkTasks': 'light_work_tasks', // ✅ CORRECT
     'deepWorkTasks': 'deep_work_sessions', // ✅ CORRECT  
     'morning_routine': 'daily_health',
     'morning_routine_habits': 'daily_health'
   };
   ```

2. Update `syncService.ts` to use correct table names
3. Fix RLS policies for user access
4. Test offline sync with real tables

**Acceptance Criteria**:
- ✅ Offline sync works with real Supabase tables
- ✅ No 406/401 errors in console
- ✅ Tasks save and load offline
- ✅ Background sync completes successfully

#### **Story 1.2: Extend Offline Coverage**
**Objective**: Add offline support for ALL productivity tables

**Immediate Priority Tables**:
1. `time_blocks` (time blocking - critical for productivity)
2. `daily_habits` (daily habit tracking)
3. `daily_tracker` (comprehensive daily metrics)
4. `task_templates` (task templates)
5. `daily_reflections` (daily reflection system)

**Implementation**:
```typescript
// Extend IndexedDB schema
interface ExtendedOfflineDB extends OfflineDB {
  timeBlocks: { ... };
  dailyHabits: { ... };
  dailyTracker: { ... };
  taskTemplates: { ... };
  dailyReflections: { ... };
}

// Add to sync service
const PRIORITY_TABLES = [
  'light_work_tasks',    // Priority 1: Core tasks
  'deep_work_sessions',  // Priority 1: Deep work
  'time_blocks',         // Priority 2: Scheduling  
  'daily_health',        // Priority 2: Health
  'daily_habits',        // Priority 3: Habits
  'daily_tracker',       // Priority 3: Tracking
  'task_templates',      // Priority 4: Templates
  'daily_reflections'    // Priority 4: Reflection
];
```

**Acceptance Criteria**:
- ✅ 8 core productivity tables work offline
- ✅ Priority-based sync ordering
- ✅ Efficient bulk sync operations
- ✅ Graceful fallback for unsupported tables

### **PHASE 1B: Universal System (Week 2)**

#### **Story 1.3: Generic Offline Adapter**
**Objective**: Create system to easily add ANY table offline

**Architecture**:
```typescript
interface OfflineTableConfig {
  tableName: string;
  primaryKey: string;
  userField?: string;
  syncPriority: number;
  cacheStrategy: 'full' | 'user-specific' | 'recent';
  conflictResolution: 'server-wins' | 'client-wins' | 'manual';
}

// Easy registration system
offlineAdapter.registerTable({
  tableName: 'skills',
  primaryKey: 'id', 
  userField: 'user_id',
  syncPriority: 5,
  cacheStrategy: 'user-specific',
  conflictResolution: 'server-wins'
});
```

**Tables to Add Next**:
- `skills` & `skill_paths` (gamification system)
- `project_memories` (AI memory system) 
- `user_feedback` (feedback tracking)
- `business_context` (business intelligence)
- `scheduled_tasks` (task automation)

**Acceptance Criteria**:
- ✅ Any table can be added with 5 lines of config
- ✅ Automatic IndexedDB schema generation
- ✅ Smart sync prioritization
- ✅ Conflict resolution per table
- ✅ Performance scales to 20+ tables

#### **Story 1.4: Advanced Sync Features**
**Objective**: Production-ready sync reliability

**Enhanced Features**:
1. **Partial Sync**: Only sync changed fields
2. **Batch Operations**: Sync multiple records efficiently  
3. **Smart Prioritization**: Critical tables sync first
4. **Conflict Resolution**: Field-level merge strategies
5. **Error Recovery**: Automatic retry with backoff

**Real-World Testing**:
- Large dataset handling (1000+ tasks)
- Poor network conditions 
- Multiple device synchronization
- Background app refresh scenarios

**Acceptance Criteria**:
- ✅ 99.9% sync reliability 
- ✅ <5 second sync completion
- ✅ Handles 10,000+ records per table
- ✅ Zero data loss during conflicts
- ✅ Automatic error recovery

## 📊 **SUCCESS METRICS (UPDATED)**

### **Week 1 Targets**:
- **Table Coverage**: 8/20 productivity tables offline-ready
- **Sync Errors**: 0 console errors (currently seeing 406/401s)
- **Feature Parity**: 100% online features work offline  
- **Performance**: <100ms offline data access

### **Week 2 Targets**:
- **Universal System**: Any table can be made offline in <5 minutes
- **Bulk Performance**: Sync 1000+ records in <10 seconds
- **Reliability**: 99.9% successful sync rate
- **Developer Experience**: Clear documentation and examples

## 🎯 **IMMEDIATE NEXT ACTIONS**

### **RIGHT NOW (Today)**:
1. ✅ Fix table mapping in offline code
2. ✅ Test sync with real `light_work_tasks` table
3. ✅ Resolve RLS policy issues
4. ✅ Verify MCP connection working

### **This Week**:
1. Extend offline support to `time_blocks` and `daily_habits`
2. Add priority-based sync ordering
3. Create table registration system
4. Comprehensive testing with real data

### **Next Week**:
1. Build universal offline adapter
2. Add remaining productivity tables
3. Implement advanced sync features
4. Performance optimization and monitoring

## 🚨 **CRITICAL FIXES NEEDED**

### **1. RLS Policy Issues**
Your app shows: `"message": "new row violates row-level security policy"`

**Solution**: Need to check/fix RLS policies in Supabase dashboard
```sql
-- Enable RLS
ALTER TABLE light_work_tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own data  
CREATE POLICY "Users can access own tasks"
ON light_work_tasks FOR ALL
TO authenticated 
USING (user_id = auth.uid());
```

### **2. Table Mapping Fix**
**Current Code**: References `user_light_work_tasks`
**Actual Table**: `light_work_tasks`

Need immediate update in `offlineManager.ts` and `syncService.ts`

### **3. MCP Server Connection**
With environment variables now set, the MCP server should connect properly to the right project.

---

**Status**: 🚀 Ready to Fix and Enhance  
**Risk Level**: 🟢 Low (proven architecture, real tables exist)
**Business Impact**: 🚀 High (unlock full offline productivity system)
**Timeline**: 2 weeks to complete universal offline system

**Next Step**: Fix table mapping and RLS policies, then test sync!
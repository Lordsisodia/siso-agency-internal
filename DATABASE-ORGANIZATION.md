# 🗄️ Database Function Organization & Architecture

This document provides a comprehensive overview of all database functions in the SISO Internal project, their locations, and how they're organized.

## 📋 **Table of Contents**
1. [Current Active Database Functions](#current-active-database-functions)
2. [Template & Base Classes](#template--base-classes)
3. [Legacy & Archived Functions](#legacy--archived-functions)
4. [Database Schema Overview](#database-schema-overview)
5. [Usage Guidelines](#usage-guidelines)

---

## 🚀 **Current Active Database Functions**

### **Primary Supabase Hooks (Active & Working)**
These are the current working database operations that properly handle snake_case ↔ camelCase mapping:

#### **Deep Work Tasks**
- **File**: `src/shared/hooks/useDeepWorkTasksSupabase.ts`
- **Table**: `deep_work_tasks` + `deep_work_subtasks`
- **Status**: ✅ **FIXED** - All column mapping issues resolved
- **Key Features**:
  - Proper snake_case to camelCase mapping (`focus_blocks` ↔ `focusBlocks`)
  - Error handling for calendar operations
  - Inline editing support for titles and subtasks
  - Comprehensive CRUD operations

#### **Light Work Tasks**
- **File**: `src/shared/hooks/useLightWorkTasksSupabase.ts`
- **Table**: `light_work_tasks` + `light_work_subtasks`
- **Status**: ✅ **FIXED** - work_type column mapping corrected
- **Key Features**:
  - Uses `work_type` (not `task_type`)
  - Supports task rollover and analytics
  - XP calculation integration

#### **Other Workflow Hooks**
- **Morning Routine**: `src/shared/hooks/useMorningRoutineSupabase.ts`
- **Health & Wellness**: `src/shared/hooks/useHealthNonNegotiablesSupabase.ts`
- **Home Workout**: `src/shared/hooks/useHomeWorkoutSupabase.ts`
- **Nightly Checkout**: `src/shared/hooks/useNightlyCheckoutSupabase.ts`
- **Deep Focus Sessions**: `src/shared/hooks/useDeepFocusSupabase.ts`

### **Database Service Layer**
Organized under `src/services/database/`:

#### **Decomposed Task Services (New Architecture)**
- **BaseTaskService**: `src/services/database/BaseTaskService.ts`
  - Abstract base class for all task operations
  - Common CRUD patterns and error handling
  
- **DeepWorkTaskService**: `src/services/database/DeepWorkTaskService.ts`
  - Specialized for deep work task operations
  - Extends BaseTaskService with focus-specific features
  
- **LightWorkTaskService**: `src/services/database/LightWorkTaskService.ts`
  - Specialized for light work task operations
  - Includes AI analysis and XP calculation
  
- **TaskServiceRegistry**: `src/services/database/TaskServiceRegistry.ts`
  - Central registry for all task services
  - Dependency injection and service discovery

#### **Database Operations (New Architecture)**
Located in `src/services/tasks/database/`:
- **DeepWorkDatabaseOperations**: `src/services/tasks/database/DeepWorkDatabaseOperations.ts`
- **LightWorkDatabaseOperations**: `src/services/tasks/database/LightWorkDatabaseOperations.ts`
  - ✅ **FIXED** - Uses `work_type` instead of `task_type`

---

## 🏗️ **Template & Base Classes**

### **New Supabase Operations Template**
- **File**: `src/templates/SupabaseOperationsTemplate.ts`
- **Purpose**: Comprehensive template to prevent snake_case/camelCase issues
- **Features**:
  - `STANDARD_COLUMN_MAPPINGS` - All common database column mappings
  - `ColumnMapper` - Utility class for data transformation
  - `SafeSupabaseOperations` - Base class with error handling
  - `TaskOperations` - Specialized task management operations
  - `SubtaskOperations` - Specialized subtask management operations

### **Column Mapping Standards**
```typescript
export const STANDARD_COLUMN_MAPPINGS = {
  // Timestamps (ALL tables)
  createdAt: 'created_at',
  updatedAt: 'updated_at', 
  completedAt: 'completed_at',
  startedAt: 'started_at',
  
  // Critical mappings that caused errors
  focusBlocks: 'focus_blocks',      // Was causing task creation errors
  breakDuration: 'break_duration',   // Was causing task creation errors
  workType: 'work_type',            // Was causing light work errors
  dueDate: 'due_date',              // Was causing calendar errors
  
  // ... (see template for complete list)
}
```

### **Base Database Classes**
- **Database Manager**: `src/shared/services/database/DatabaseManager.ts`
- **Supabase Adapter**: `src/shared/services/database/SupabaseAdapter.ts`
- **Supabase Client**: `src/services/mcp/supabase-client.ts`

---

## 📚 **Legacy & Archived Functions**

### **Express API Layer (Being Phased Out)**
- `src/services/core/` - Legacy core services
- `src/services/tasks/` - Old task services (except database subfolder)
- `src/shared/services/task-database-service*.ts` - Multiple versions

### **Testing & Development Files**
- `src/shared/services/database/database-test.ts`
- `src/shared/utils/database-testing.utils.ts`
- `tests/database/database-verification.test.ts`
- `scripts/database/verify-database.ts`

### **Template Files**
- `src/templates/supabase-service-template.ts` - Older template
- `ai-first/services/task-database-service*.ts` - AI-generated variants

---

## 🗃️ **Database Schema Overview**

### **Primary Tables**

#### **Task Tables**
- **`deep_work_tasks`** - Main deep work tasks
  - Key columns: `id`, `user_id`, `title`, `focus_blocks`, `break_duration`, `due_date`
  - Relationships: One-to-many with `deep_work_subtasks`

- **`light_work_tasks`** - Light work tasks 
  - Key columns: `id`, `user_id`, `title`, `work_type`, `due_date`
  - Relationships: One-to-many with `light_work_subtasks`

#### **Subtask Tables**
- **`deep_work_subtasks`** - Deep work subtasks
- **`light_work_subtasks`** - Light work subtasks

#### **Workflow Tables**
- **`daily_routines`** - Morning routines
- **`daily_workouts`** - Workout tracking
- **`daily_health`** - Health metrics
- **`daily_habits`** - Habit tracking
- **`daily_reflections`** - Evening reflections

#### **System Tables**
- **`user_feedback`** - User feedback
- **`profiles`** - User profiles
- **`tasks`** - Generic task system (legacy)

### **Column Naming Convention**
- **Database**: `snake_case` (e.g., `created_at`, `focus_blocks`, `work_type`)
- **TypeScript**: `camelCase` (e.g., `createdAt`, `focusBlocks`, `workType`)
- **Mapping**: Handled by `ColumnMapper` in templates

---

## 📖 **Usage Guidelines**

### **For New Database Operations**

1. **Use the Template**: Start with `src/templates/SupabaseOperationsTemplate.ts`
2. **Column Mapping**: Use `STANDARD_COLUMN_MAPPINGS` for all operations
3. **Error Handling**: Include try-catch blocks and console logging
4. **Testing**: Test with actual database to verify column names

### **Migration from Legacy Systems**

1. **Replace Express API calls** with direct Supabase operations
2. **Use specialized services** (`DeepWorkTaskService`, `LightWorkTaskService`)
3. **Follow the decomposed architecture** pattern
4. **Test thoroughly** to ensure no breaking changes

### **Common Pitfalls to Avoid**

❌ **WRONG** - Using camelCase in database operations:
```typescript
.update({ focusBlocks: 4, dueDate: '2024-01-01' })
```

✅ **CORRECT** - Using snake_case for database:
```typescript
.update({ focus_blocks: 4, due_date: '2024-01-01' })
```

❌ **WRONG** - Not mapping response data:
```typescript
return data; // Contains snake_case keys
```

✅ **CORRECT** - Mapping response data:
```typescript
return ColumnMapper.toInterfaceFormat(data); // Contains camelCase keys
```

### **File Organization Rules**

1. **Active Hooks**: `src/shared/hooks/use*Supabase.ts`
2. **Service Layer**: `src/services/database/`
3. **Database Operations**: `src/services/tasks/database/`
4. **Templates**: `src/templates/`
5. **Legacy**: Keep in place but don't extend

---

## 🔍 **Quick Reference**

### **Key Files for Each Workflow**
- **Deep Work**: `useDeepWorkTasksSupabase.ts` + `DeepWorkDatabaseOperations.ts`
- **Light Work**: `useLightWorkTasksSupabase.ts` + `LightWorkDatabaseOperations.ts`
- **Morning**: `useMorningRoutineSupabase.ts`
- **Wellness**: `useHealthNonNegotiablesSupabase.ts` + `useHomeWorkoutSupabase.ts`
- **Checkout**: `useNightlyCheckoutSupabase.ts`

### **Database Table → Hook Mapping**
- `deep_work_tasks` → `useDeepWorkTasksSupabase.ts`
- `light_work_tasks` → `useLightWorkTasksSupabase.ts`
- `daily_routines` → `useMorningRoutineSupabase.ts`
- `daily_workouts` → `useHomeWorkoutSupabase.ts`
- `daily_health` → `useHealthNonNegotiablesSupabase.ts`
- `daily_reflections` → `useNightlyCheckoutSupabase.ts`

### **Critical Column Mappings**
- `focus_blocks` ↔ `focusBlocks`
- `break_duration` ↔ `breakDuration`
- `work_type` ↔ `workType` (NOT `task_type`)
- `due_date` ↔ `dueDate`
- `created_at` ↔ `createdAt`
- `updated_at` ↔ `updatedAt`
- `completed_at` ↔ `completedAt`

---

## ✅ **Status Summary**

- **✅ Deep Work**: Fully functional with proper column mapping
- **✅ Light Work**: Fixed work_type column issue
- **✅ Templates**: Comprehensive template created
- **✅ Documentation**: Complete organization overview
- **🔄 Migration**: Ongoing from Express API to direct Supabase
- **📝 Testing**: Verified with actual database operations

---

*Last Updated: September 14, 2025*
*Template Version: 1.0.0*
*All database operations tested and verified working*
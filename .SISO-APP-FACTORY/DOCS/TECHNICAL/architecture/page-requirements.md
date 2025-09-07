# 📄 Page-by-Page Database Requirements

## 🎯 **PURPOSE**

This document analyzes each page in SISO-INTERNAL and documents exactly what database operations it will need when integration happens.

## 🏥 **ADMIN PAGES (Priority 1)**

### **AdminLifeLock.tsx**
**Current**: Uses localStorage via `useLifeLockData` hook  
**Database Requirements**:

#### **Read Operations:**
- `DailyHealth.findUnique()` - Get health data for selected date
- `DailyHabits.findUnique()` - Get habits data for selected date  
- `DailyRoutines.findMany()` - Get morning/evening routines
- `PersonalTask.findMany()` - Get tasks for day/week view
- `VoiceProcessingHistory.findMany()` - Get voice command history

#### **Write Operations:**
- `DailyHealth.upsert()` - Update health metrics (water, sleep, mood)
- `DailyHabits.upsert()` - Update habit tracking
- `PersonalTask.create()` - Add new tasks from voice/manual input
- `PersonalTask.update()` - Toggle task completion, update properties
- `VoiceProcessingHistory.create()` - Log voice processing results

#### **API Endpoints Needed:**
```
GET    /api/daily-health/:userId/:date
PUT    /api/daily-health/:userId/:date
GET    /api/daily-habits/:userId/:date  
PUT    /api/daily-habits/:userId/:date
GET    /api/tasks/:userId/date/:date
POST   /api/tasks/:userId
PUT    /api/tasks/:taskId
POST   /api/voice-process/:userId
```

---

### **AdminTasks.tsx**
**Current**: Uses Supabase + `useTasks` hook  
**Database Requirements**:

#### **Read Operations:**
- `PersonalTask.findMany()` - Get tasks with filtering/sorting
- `PersonalSubtask.findMany()` - Get subtasks for tasks
- `EisenhowerAnalysis.findMany()` - Get AI task prioritization
- `User.findUnique()` - Get user info for admin checks

#### **Write Operations:**
- `PersonalTask.create()` - Create new tasks
- `PersonalTask.update()` - Edit task properties
- `PersonalTask.delete()` - Delete tasks
- `PersonalSubtask.create()` - Add subtasks
- `EisenhowerAnalysis.create()` - Save AI analysis

#### **Complex Queries:**
- Filter by: priority, workType, completed, date range, tags
- Sort by: priority, createdAt, updatedAt, estimatedDuration
- Search by: title, description, category
- Aggregate: completion rates, time tracking

#### **API Endpoints Needed:**
```
GET    /api/tasks/:userId?filter=...&sort=...&search=...
POST   /api/tasks/:userId
PUT    /api/tasks/:taskId
DELETE /api/tasks/:taskId
POST   /api/tasks/:taskId/subtasks
POST   /api/tasks/:taskId/analyze
```

---

### **AdminDashboard.tsx**
**Current**: Uses `useAdminCheck`, `useUser`, multiple stats hooks  
**Database Requirements**:

#### **Read Operations (Stats & Analytics):**
- `User.count()` - Total users
- `PersonalTask.count()` - Total tasks, completed tasks
- `DailyHealth.count()` - Health tracking adoption
- `AutomationTask.findMany()` - System automation status
- `VoiceProcessingHistory.aggregate()` - Voice usage analytics

#### **Admin-Specific Queries:**
- Recent user activity across all users
- System performance metrics
- Task completion trends
- User engagement statistics

#### **API Endpoints Needed:**
```
GET /api/admin/stats/overview
GET /api/admin/stats/users
GET /api/admin/stats/tasks
GET /api/admin/stats/health
GET /api/admin/recent-activity
```

---

## 🏠 **USER PAGES (Priority 2)**

### **Main Dashboard/Home**
**Database Requirements**:
- `User.findUnique()` - User profile and preferences
- `PersonalTask.findMany()` - Today's tasks, upcoming tasks
- `UserProgress.findUnique()` - Gamification data (XP, level, streak)
- `DailyStats.findMany()` - Recent performance trends
- `Achievement.findMany()` - Recent achievements

### **Profile.tsx**
**Database Requirements**:
- `User.findUnique()` - Profile information
- `UserProgress.findUnique()` - Progress and achievements
- `DailyStats.findMany()` - Historical performance data
- `User.update()` - Update profile settings

### **Tasks/Projects Pages**
**Database Requirements**:
- Similar to AdminTasks but filtered to current user
- `PersonalTask.findMany()` with user-specific filtering
- Time tracking and productivity analytics

---

## 📊 **ANALYTICS & REPORTING PAGES**

### **Timeline/Progress Pages**
**Database Requirements**:
- Historical data aggregation across all daily tracking models
- Trend analysis queries
- Performance comparisons over time

### **Health/Wellness Dashboard**
**Database Requirements**:
- `DailyHealth.findMany()` - Health trends over time
- `DailyWorkout.findMany()` - Fitness tracking
- Health analytics and insights

---

## 🔧 **CLIENT MANAGEMENT PAGES**

### **AdminClients.tsx**
**Current**: Mixed Supabase and mock data  
**Database Requirements**:
- Client data management (may need separate Client model)
- Project tracking and communication logs
- Client-specific task and project management

---

## 📱 **MOBILE-OPTIMIZED PAGES**

### **ClaudeCodeMobile.tsx, AdminLifeLockDay.tsx**
**Database Requirements**:
- Same as desktop versions but optimized for mobile queries
- Reduced data payloads for mobile performance
- Offline capability considerations

---

## 🛠️ **INTEGRATION PATTERNS**

### **Common Patterns Across Pages:**

#### **1. User Context:**
```javascript
// Every page needs user context
const { user, loading } = useAuth();
const userId = user?.id;
```

#### **2. Date-Based Queries:**
```javascript
// Many pages filter by date
const today = format(new Date(), 'yyyy-MM-dd');
const tasks = await getTasks(userId, today);
```

#### **3. Real-time Updates:**
```javascript
// Pages need to sync data changes
const { data, mutate } = useSWR(`/api/tasks/${userId}`, fetcher);
await mutate(); // Revalidate after changes
```

#### **4. Loading & Error States:**
```javascript
// Consistent loading/error handling
const { data, loading, error } = useQuery(query);
if (loading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
```

#### **5. Optimistic Updates:**
```javascript
// Update UI immediately, sync to DB in background
const optimisticUpdate = (newData) => {
  setData(newData); // Update UI
  syncToDatabase(newData); // Sync to DB
};
```

---

## 🚀 **INTEGRATION PRIORITY**

### **Phase 1 (Critical):**
1. **AdminLifeLock** - Daily tracking (highest user impact)
2. **AdminTasks** - Core task management (highest usage)
3. **AdminDashboard** - Admin overview and stats

### **Phase 2 (User Experience):**
4. **Main Dashboard** - User home page
5. **Profile** - User data management
6. **Task pages** - Personal productivity

### **Phase 3 (Enhanced Features):**
7. **Analytics pages** - Historical insights
8. **Client management** - Business functionality
9. **Mobile optimizations** - Mobile-specific features

---

**📝 Note**: Each page integration should include comprehensive testing to ensure UI works correctly with real database operations.
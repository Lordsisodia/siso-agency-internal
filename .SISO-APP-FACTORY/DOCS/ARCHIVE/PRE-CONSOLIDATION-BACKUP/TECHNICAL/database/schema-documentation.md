# 📚 Database Schema Documentation

## 🏗️ **PRISMA SCHEMA OVERVIEW**

This document details the complete database schema for SISO-INTERNAL, showing all models, relationships, and their intended use cases.

## 👤 **USER MANAGEMENT**

### **User Model**
```prisma
model User {
  id                 String   @id @default(cuid())
  supabaseId         String   @unique
  email              String   @unique
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relationships
  personalTasks      PersonalTask[]
  dailyHabits        DailyHabits[]
  dailyHealth        DailyHealth[]
  dailyReflections   DailyReflections[]
  dailyRoutines      DailyRoutine[]
  dailyWorkouts      DailyWorkout[]
  eisenhowerAnalysis EisenhowerAnalysis[]
  timeBlocks         TimeBlock[]
  gamification       UserProgress?
  automationTasks    AutomationTask[]
  voiceHistory       VoiceProcessingHistory[]
}
```

**Used By**: All pages that require user authentication and data

### **UserProgress Model** (Gamification)
```prisma
model UserProgress {
  id            String        @id @default(cuid())
  userId        String        @unique
  currentLevel  Int           @default(1)
  totalXP       Int           @default(0)
  dailyXP       Int           @default(0)
  currentStreak Int           @default(0)
  bestStreak    Int           @default(0)
  achievements  Achievement[]
  dailyStats    DailyStats[]
}
```

**Used By**: Gamification features, leaderboards, progress tracking

## 📝 **TASK MANAGEMENT**

### **PersonalTask Model**
```prisma
model PersonalTask {
  id                 String              @id @default(cuid())
  userId             String
  title              String
  description        String?
  workType           WorkType            // DEEP, LIGHT
  priority           Priority            // CRITICAL, URGENT, HIGH, MEDIUM, LOW
  completed          Boolean             @default(false)
  originalDate       String
  currentDate        String
  estimatedDuration  Int?
  rollovers          Int                 @default(0)
  tags               String[]
  category           String?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  completedAt        DateTime?
  
  // Relationships
  eisenhowerAnalysis EisenhowerAnalysis?
  subtasks           PersonalSubtask[]
  user               User                @relation(fields: [userId], references: [id])
}
```

**Used By**: AdminTasks, AdminLifeLock, main dashboard, task management features

### **PersonalSubtask Model**
```prisma
model PersonalSubtask {
  id        String       @id @default(cuid())
  taskId    String
  title     String
  completed Boolean      @default(false)
  workType  WorkType
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  task      PersonalTask @relation(fields: [taskId], references: [id])
}
```

**Used By**: Detailed task management, subtask tracking

### **EisenhowerAnalysis Model**
```prisma
model EisenhowerAnalysis {
  id               String             @id @default(cuid())
  userId           String
  taskId           String             @unique
  quadrant         EisenhowerQuadrant // DO_FIRST, SCHEDULE, DELEGATE, ELIMINATE
  urgentScore      Int
  importanceScore  Int
  reasoning        String
  recommendations  String[]
  originalPosition Int?
  analyzedAt       DateTime           @default(now())
}
```

**Used By**: AI task prioritization, productivity analytics

## 📊 **DAILY TRACKING SYSTEMS**

### **DailyHealth Model**
```prisma
model DailyHealth {
  id              String   @id @default(cuid())
  userId          String
  date            String
  healthChecklist Json     @default("[]")
  meals           Json     @default("{}")
  macros          Json     @default("{}")
  waterIntakeMl   Int      @default(0)
  milkIntakeMl    Int      @default(0)
  sleepHours      Float    @default(0)
  energyLevel     Int?     // 1-10 scale
  moodLevel       Int?     // 1-10 scale
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Used By**: AdminLifeLock, health tracking, wellness dashboard

### **DailyHabits Model**
```prisma
model DailyHabits {
  id                     String   @id @default(cuid())
  userId                 String
  date                   String
  screenTimeMinutes      Int      @default(0)
  bullshitContentMinutes Int      @default(0)
  noWeed                 Boolean  @default(false)
  noScrolling            Boolean  @default(false)
  deepWorkHours          Float    @default(0)
  lightWorkHours         Float    @default(0)
  habitsData             Json     @default("{}")
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

**Used By**: AdminLifeLock, habit tracking, productivity analytics

### **DailyWorkout Model**
```prisma
model DailyWorkout {
  id                   String   @id @default(cuid())
  userId               String
  date                 String
  exercises            Json     @default("[]")
  totalExercises       Int      @default(0)
  completedExercises   Int      @default(0)
  completionPercentage Float    @default(0)
  durationMinutes      Int?
  notes                String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

**Used By**: Fitness tracking, workout planning, health dashboard

### **DailyRoutines Model**
```prisma
model DailyRoutine {
  id                   String      @id @default(cuid())
  userId               String
  date                 String
  routineType          RoutineType // MORNING, EVENING
  items                Json        @default("[]")
  completedCount       Int         @default(0)
  totalCount           Int         @default(0)
  completionPercentage Float       @default(0)
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt
}
```

**Used By**: Morning/evening routine tracking, habit formation

### **DailyReflections Model**
```prisma
model DailyReflections {
  id            String   @id @default(cuid())
  userId        String
  date          String
  wentWell      String[]
  evenBetterIf  String[]
  analysis      String[]
  patterns      String[]
  changes       String[]
  overallRating Int?
  keyLearnings  String?
  tomorrowFocus String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Used By**: End-of-day reflection, personal growth tracking

## ⏰ **TIME & PRODUCTIVITY**

### **TimeBlock Model**
```prisma
model TimeBlock {
  id          String            @id @default(cuid())
  userId      String
  date        String
  startTime   String
  endTime     String
  title       String
  description String?
  category    TimeBlockCategory // DEEP_WORK, LIGHT_WORK, MEETING, BREAK, etc.
  completed   Boolean           @default(false)
  actualStart String?
  actualEnd   String?
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

**Used By**: Calendar integration, time blocking, productivity planning

### **AutomationTask Model**
```prisma
model AutomationTask {
  id              String             @id @default(cuid())
  userId          String
  name            String
  description     String?
  category        AutomationCategory // DEVELOPMENT, TESTING, DEPLOYMENT, etc.
  priority        Priority
  status          AutomationStatus   @default(PENDING)
  prompt          String
  allowedTools    Json               @default("[]")
  estimatedTokens Int                @default(0)
  actualTokens    Int?
  executionTimeMs Int?
  result          String?
  error           String?
  metadata        Json               @default("{}")
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  startedAt       DateTime?
  completedAt     DateTime?
}
```

**Used By**: AI automation, task automation, system management

### **VoiceProcessingHistory Model**
```prisma
model VoiceProcessingHistory {
  id               String   @id @default(cuid())
  userId           String
  originalText     String
  processedAt      DateTime @default(now())
  success          Boolean
  totalTasks       Int      @default(0)
  deepTasks        Int      @default(0)
  lightTasks       Int      @default(0)
  errorMessage     String?
  processingTimeMs Int?
}
```

**Used By**: Voice command history, AI processing analytics

## 🎯 **ENUMS AND TYPES**

```prisma
enum WorkType {
  DEEP   // Deep work requiring focus
  LIGHT  // Light work, less demanding
}

enum Priority {
  CRITICAL  // Must be done immediately
  URGENT    // Should be done today
  HIGH      // Important, schedule soon
  MEDIUM    // Normal priority
  LOW       // Nice to have
}

enum EisenhowerQuadrant {
  DO_FIRST  // Urgent + Important
  SCHEDULE  // Important, not urgent
  DELEGATE  // Urgent, not important
  ELIMINATE // Neither urgent nor important
}

enum AchievementCategory {
  STREAK      // Consistency achievements
  POINTS      // XP-based achievements
  COMPLETION  // Task completion achievements
  CONSISTENCY // Habit-based achievements
}

enum AutomationCategory {
  DEVELOPMENT  // Code and development tasks
  TESTING      // Testing and QA
  DEPLOYMENT   // Deployment and DevOps
  ANALYSIS     // Data analysis
  MAINTENANCE  // System maintenance
}

enum AutomationStatus {
  PENDING   // Waiting to run
  RUNNING   // Currently executing
  COMPLETED // Finished successfully
  FAILED    // Failed with error
  PAUSED    // Paused by user
}

enum RoutineType {
  MORNING  // Morning routine
  EVENING  // Evening routine
}

enum TimeBlockCategory {
  DEEP_WORK  // Focused work time
  LIGHT_WORK // Less intensive work
  MEETING    // Meetings and calls
  BREAK      // Rest periods
  PERSONAL   // Personal time
  HEALTH     // Health and fitness
  LEARNING   // Learning and education
  ADMIN      // Administrative tasks
}
```

## 🔗 **KEY RELATIONSHIPS**

### **One-to-Many:**
- User → PersonalTasks (one user has many tasks)
- User → DailyHealth (one user has many daily health records)
- PersonalTask → PersonalSubtasks (one task has many subtasks)

### **One-to-One:**
- User → UserProgress (one user has one progress record)
- PersonalTask → EisenhowerAnalysis (one task has one analysis)

### **Unique Constraints:**
- `User.supabaseId` - Links to Supabase authentication
- `User.email` - Unique user emails
- `UserProgress.userId` - One progress record per user
- `DailyHealth.userId_date` - One health record per user per day
- `DailyHabits.userId_date` - One habits record per user per day

## 📈 **INDEXES FOR PERFORMANCE**

```prisma
// Task queries
@@index([userId, currentDate])
@@index([userId, completed])
@@index([userId, workType])
@@index([userId, priority])

// Date-based queries
@@index([userId, date])
@@index([userId, processedAt])

// Gamification queries
@@index([progressId, unlocked])
@@index([progressId, date])
```

---

**🎯 This schema supports all current UI features and provides room for future enhancements.**
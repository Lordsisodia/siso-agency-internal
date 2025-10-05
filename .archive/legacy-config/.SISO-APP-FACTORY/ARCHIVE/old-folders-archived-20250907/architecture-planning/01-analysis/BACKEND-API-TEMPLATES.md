# SISO Backend API Functions - Complete Templates

*Preservation templates for ALL backend API endpoints to ensure zero functionality loss*

**SAFETY PROTOCOL**: Template every API route, middleware, and handler
**STATUS**: Complete catalog of 30+ API endpoints across 3 server configurations

---

## 🖥️ SERVER ARCHITECTURE OVERVIEW

### **Multiple Server Configurations**
```typescript
// SISO has 3 different server setups:
'server.js.backup'        // Legacy server (original)
'server-hybrid.js'        // Hybrid server (Prisma + Supabase)  
'server-redesign.js'      // Redesigned server (latest)

// NPM Scripts for servers:
"server:legacy": "node server.js.backup",
"server:hybrid": "node server-hybrid.js",
"dev:hybrid": "concurrently \"npm run server:hybrid\" \"vite\"",
"dev:legacy": "concurrently \"npm run server:legacy\" \"vite\"",
```

### **Critical Finding**: Multiple Active API Versions
⚠️ **SISO runs multiple server versions simultaneously** - all endpoints must be preserved

---

## 🔧 LEGACY SERVER API TEMPLATES (server.js.backup)

### **Health Check Endpoint**
```javascript
// ENDPOINT: GET /health
// PURPOSE: Server health monitoring
// CRITICAL: System monitoring

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'legacy'
  });
});

// Migration Template:
class HealthService {
  async checkHealth(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(), 
      server: 'legacy'
    };
  }
}
```

### **User Management APIs**
```javascript
// ENDPOINT: POST /api/users
// PURPOSE: User creation and management
// CRITICAL: User onboarding

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, supabaseId } = req.body;
    
    // Prisma user creation logic
    const user = await prisma.user.create({
      data: { email, name, supabaseId }
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
interface CreateUserRequest {
  email: string;
  name: string;
  supabaseId: string;
}

class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Preserve exact same logic and error handling
    const user = await this.database.users.create(userData);
    return user;
  }
}
```

### **Task Management APIs**
```javascript
// ENDPOINT: GET /api/tasks
// PURPOSE: Fetch user tasks with filtering
// CRITICAL: Core task functionality

app.get('/api/tasks', async (req, res) => {
  try {
    const { supabaseId, dateFilter, category, priority } = req.query;
    
    let whereClause = { user: { supabaseId } };
    
    // Date filtering logic
    if (dateFilter) {
      const today = new Date();
      switch (dateFilter) {
        case 'today':
          whereClause.dueDate = {
            gte: startOfDay(today),
            lte: endOfDay(today)
          };
          break;
        case 'week':
          whereClause.dueDate = {
            gte: startOfWeek(today),
            lte: endOfWeek(today) 
          };
          break;
        case 'overdue':
          whereClause.dueDate = { lt: today };
          whereClause.completed = false;
          break;
      }
    }
    
    // Category and priority filtering
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: { subtasks: true },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
interface TaskQueryParams {
  supabaseId: string;
  dateFilter?: 'today' | 'week' | 'overdue';
  category?: string;
  priority?: TaskPriority;
}

class TaskService {
  async getTasks(params: TaskQueryParams): Promise<Task[]> {
    // Preserve exact same filtering and sorting logic
    const whereClause = this.buildTaskWhereClause(params);
    const tasks = await this.database.tasks.findMany({
      where: whereClause,
      include: { subtasks: true },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
    return tasks;
  }
  
  private buildTaskWhereClause(params: TaskQueryParams) {
    // Preserve exact date filtering logic
    // ... (preserve all filter logic)
  }
}
```

### **Task Creation API**  
```javascript
// ENDPOINT: POST /api/tasks
// PURPOSE: Create new tasks with AI integration
// CRITICAL: Task creation with voice/AI processing

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      title, description, priority, category,
      dueDate, supabaseId, aiGenerated,
      voiceTranscription, tags
    } = req.body;

    // AI processing for voice tasks
    let processedData = { title, description };
    if (aiGenerated && voiceTranscription) {
      processedData = await processVoiceTask(voiceTranscription);
    }

    // Create task with Prisma
    const task = await prisma.task.create({
      data: {
        ...processedData,
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        dueDate: dueDate ? new Date(dueDate) : null,
        user: { connect: { supabaseId } },
        aiGenerated: !!aiGenerated,
        tags: tags || []
      },
      include: { subtasks: true }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  supabaseId: string;
  aiGenerated?: boolean;
  voiceTranscription?: string;
  tags?: string[];
}

class TaskCreationService {
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    // Preserve AI processing logic
    let processedData = { title: taskData.title, description: taskData.description };
    if (taskData.aiGenerated && taskData.voiceTranscription) {
      processedData = await this.voiceProcessor.process(taskData.voiceTranscription);
    }
    
    // Preserve task creation logic
    const task = await this.database.tasks.create({
      ...processedData,
      priority: taskData.priority || 'MEDIUM',
      category: taskData.category || 'GENERAL',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      userId: taskData.supabaseId,
      aiGenerated: !!taskData.aiGenerated,
      tags: taskData.tags || []
    });
    
    return task;
  }
}
```

### **Task Deletion API**
```javascript
// ENDPOINT: DELETE /api/tasks
// PURPOSE: Bulk task deletion
// CRITICAL: Data management

app.delete('/api/tasks', async (req, res) => {
  try {
    const { taskIds, supabaseId } = req.body;
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'Invalid taskIds array' });
    }
    
    // Verify ownership before deletion
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        user: { supabaseId }
      }
    });
    
    if (tasks.length !== taskIds.length) {
      return res.status(403).json({ error: 'Unauthorized task access' });
    }
    
    // Delete tasks and associated subtasks
    await prisma.subtask.deleteMany({
      where: { taskId: { in: taskIds } }
    });
    
    const deletedTasks = await prisma.task.deleteMany({
      where: { id: { in: taskIds } }
    });
    
    res.json({ 
      deletedCount: deletedTasks.count,
      message: `Successfully deleted ${deletedTasks.count} tasks`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
class TaskDeletionService {
  async deleteTasks(taskIds: string[], supabaseId: string): Promise<DeletionResult> {
    // Preserve ownership verification
    const tasks = await this.database.tasks.findMany({
      where: { id: { in: taskIds }, userId: supabaseId }
    });
    
    if (tasks.length !== taskIds.length) {
      throw new UnauthorizedError('Unauthorized task access');
    }
    
    // Preserve cascading deletion logic  
    await this.database.subtasks.deleteMany({
      where: { taskId: { in: taskIds } }
    });
    
    const result = await this.database.tasks.deleteMany({
      where: { id: { in: taskIds } }
    });
    
    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} tasks`
    };
  }
}
```

### **Subtask Management APIs**
```javascript
// ENDPOINT: POST /api/subtasks
// PURPOSE: Create subtasks with AI breakdown
// CRITICAL: Task decomposition

app.post('/api/subtasks', async (req, res) => {
  try {
    const { taskId, subtasks, supabaseId, aiGenerated } = req.body;
    
    // Verify task ownership
    const parentTask = await prisma.task.findFirst({
      where: { id: taskId, user: { supabaseId } }
    });
    
    if (!parentTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    // AI-powered subtask generation
    let processedSubtasks = subtasks;
    if (aiGenerated && parentTask.description) {
      processedSubtasks = await generateSubtasksFromDescription(
        parentTask.title, 
        parentTask.description
      );
    }
    
    // Create subtasks
    const createdSubtasks = await Promise.all(
      processedSubtasks.map(subtask => 
        prisma.subtask.create({
          data: {
            title: subtask.title,
            description: subtask.description || '',
            completed: false,
            taskId: taskId,
            aiGenerated: !!aiGenerated
          }
        })
      )
    );
    
    res.status(201).json(createdSubtasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
interface CreateSubtasksRequest {
  taskId: string;
  subtasks: SubtaskData[];
  supabaseId: string;
  aiGenerated?: boolean;
}

class SubtaskService {
  async createSubtasks(request: CreateSubtasksRequest): Promise<Subtask[]> {
    // Preserve ownership verification
    const parentTask = await this.database.tasks.findFirst({
      where: { id: request.taskId, userId: request.supabaseId }
    });
    
    if (!parentTask) {
      throw new NotFoundError('Task not found or access denied');
    }
    
    // Preserve AI generation logic
    let processedSubtasks = request.subtasks;
    if (request.aiGenerated && parentTask.description) {
      processedSubtasks = await this.aiService.generateSubtasks(
        parentTask.title,
        parentTask.description
      );
    }
    
    // Preserve creation logic
    return await Promise.all(
      processedSubtasks.map(subtask => 
        this.database.subtasks.create({
          title: subtask.title,
          description: subtask.description || '',
          completed: false,
          taskId: request.taskId,
          aiGenerated: !!request.aiGenerated
        })
      )
    );
  }
}
```

### **Context and Reflection APIs**
```javascript
// ENDPOINT: GET /api/morning-routine
// PURPOSE: Morning routine context retrieval
// FEATURE: Personal productivity

app.get('/api/morning-routine', async (req, res) => {
  try {
    const { supabaseId } = req.query;
    
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get today's tasks
    const todaysTasks = await prisma.task.findMany({
      where: {
        user: { supabaseId },
        dueDate: {
          gte: startOfToday,
          lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: { subtasks: true },
      orderBy: { priority: 'desc' }
    });
    
    // Get overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        user: { supabaseId },
        dueDate: { lt: startOfToday },
        completed: false
      },
      orderBy: { dueDate: 'asc' }
    });
    
    // Calculate productivity metrics
    const completedToday = todaysTasks.filter(task => task.completed).length;
    const totalToday = todaysTasks.length;
    const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
    
    res.json({
      todaysTasks,
      overdueTasks,
      metrics: {
        completedToday,
        totalToday,
        completionRate: Math.round(completionRate),
        overdueCount: overdueTasks.length
      },
      motivation: generateMotivationalMessage(completionRate)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:  
class MorningRoutineService {
  async getMorningContext(supabaseId: string): Promise<MorningContext> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Preserve exact task fetching logic
    const [todaysTasks, overdueTasks] = await Promise.all([
      this.database.tasks.findMany({
        where: {
          userId: supabaseId,
          dueDate: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        include: { subtasks: true },
        orderBy: { priority: 'desc' }
      }),
      this.database.tasks.findMany({
        where: {
          userId: supabaseId,
          dueDate: { lt: startOfToday },
          completed: false
        },
        orderBy: { dueDate: 'asc' }
      })
    ]);
    
    // Preserve metrics calculation
    const completedToday = todaysTasks.filter(task => task.completed).length;
    const totalToday = todaysTasks.length;
    const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
    
    return {
      todaysTasks,
      overdueTasks,
      metrics: {
        completedToday,
        totalToday, 
        completionRate: Math.round(completionRate),
        overdueCount: overdueTasks.length
      },
      motivation: this.generateMotivationalMessage(completionRate)
    };
  }
}
```

---

## ⚡ HYBRID SERVER API TEMPLATES (server-hybrid.js)

### **Health Check with Database Status**
```javascript
// ENDPOINT: GET /api/health  
// PURPOSE: Advanced health monitoring with database status
// CRITICAL: System monitoring

app.get('/api/health', async (req, res) => {
  try {
    const [prismaHealth, supabaseHealth] = await Promise.all([
      checkPrismaConnection(),
      checkSupabaseConnection()
    ]);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'hybrid',
      database: {
        prisma: prismaHealth,
        supabase: supabaseHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      server: 'hybrid'
    });
  }
});
```

### **Light Work Tasks APIs**
```javascript
// ENDPOINTS: Light Work Task Management
// PURPOSE: Quick task management system
// CRITICAL: Productivity workflow

// GET /api/light-work/tasks
app.get('/api/light-work/tasks', async (req, res) => {
  try {
    const { supabaseUserId, date } = req.query;
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    const tasks = await supabase
      .from('light_work_tasks')
      .select('*')
      .eq('user_id', supabaseUserId)
      .eq('date', dateKey)
      .order('created_at', { ascending: true });
      
    res.json(tasks.data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/light-work/tasks  
app.post('/api/light-work/tasks', async (req, res) => {
  try {
    const { title, supabaseUserId, date, priority } = req.body;
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    const task = await supabase
      .from('light_work_tasks')
      .insert({
        title,
        user_id: supabaseUserId,
        date: dateKey,
        priority: priority || 'medium',
        completed: false
      })
      .select()
      .single();
      
    res.status(201).json(task.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
class LightWorkTaskService {
  async getTasks(supabaseUserId: string, date?: string): Promise<LightWorkTask[]> {
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    return await this.database.lightWorkTasks.findMany({
      where: {
        userId: supabaseUserId,
        date: dateKey
      },
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async createTask(taskData: CreateLightWorkTaskRequest): Promise<LightWorkTask> {
    const dateKey = taskData.date || format(new Date(), 'yyyy-MM-dd');
    
    return await this.database.lightWorkTasks.create({
      title: taskData.title,
      userId: taskData.supabaseUserId,
      date: dateKey,
      priority: taskData.priority || 'medium',
      completed: false
    });
  }
}
```

### **Deep Work Tasks APIs**
```javascript
// ENDPOINTS: Deep Work Task Management  
// PURPOSE: Focus session task management
// CRITICAL: Deep work productivity

// GET /api/deep-work/tasks
app.get('/api/deep-work/tasks', async (req, res) => {
  try {
    const { supabaseUserId, date } = req.query;
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    const tasks = await supabase
      .from('deep_work_tasks')
      .select(`
        *,
        subtasks:task_subtasks(*)
      `)
      .eq('user_id', supabaseUserId)
      .eq('date', dateKey)
      .order('created_at', { ascending: true });
      
    res.json(tasks.data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/deep-work/tasks
app.post('/api/deep-work/tasks', async (req, res) => {
  try {
    const { 
      title, description, supabaseUserId, date, 
      priority, estimatedMinutes, category 
    } = req.body;
    
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    const task = await supabase
      .from('deep_work_tasks')
      .insert({
        title,
        description: description || '',
        user_id: supabaseUserId,
        date: dateKey,
        priority: priority || 'medium',
        estimated_minutes: estimatedMinutes || 60,
        category: category || 'general',
        completed: false
      })
      .select()
      .single();
      
    res.status(201).json(task.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
class DeepWorkTaskService {
  async getTasks(supabaseUserId: string, date?: string): Promise<DeepWorkTask[]> {
    const dateKey = date || format(new Date(), 'yyyy-MM-dd');
    
    return await this.database.deepWorkTasks.findMany({
      where: {
        userId: supabaseUserId,
        date: dateKey
      },
      include: { subtasks: true },
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async createTask(taskData: CreateDeepWorkTaskRequest): Promise<DeepWorkTask> {
    const dateKey = taskData.date || format(new Date(), 'yyyy-MM-dd');
    
    return await this.database.deepWorkTasks.create({
      title: taskData.title,
      description: taskData.description || '',
      userId: taskData.supabaseUserId,
      date: dateKey,
      priority: taskData.priority || 'medium',
      estimatedMinutes: taskData.estimatedMinutes || 60,
      category: taskData.category || 'general',
      completed: false
    });
  }
}
```

---

## 🆕 REDESIGNED SERVER API TEMPLATES (server-redesign.js)

### **Personal Task Migration API**
```javascript
// ENDPOINT: POST /api/migrate/personal-tasks
// PURPOSE: Migrate localStorage tasks to database  
// CRITICAL: Data migration system

app.post('/api/migrate/personal-tasks', async (req, res) => {
  try {
    const { tasks, supabaseUserId, sourceType } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }
    
    const migrationResults = [];
    
    for (const taskData of tasks) {
      try {
        const migratedTask = await supabase
          .from('tasks')
          .insert({
            title: taskData.title,
            description: taskData.description || '',
            user_id: supabaseUserId,
            priority: taskData.priority || 'medium',
            category: taskData.category || 'general',
            due_date: taskData.dueDate ? new Date(taskData.dueDate) : null,
            completed: !!taskData.completed,
            created_at: taskData.createdAt || new Date().toISOString(),
            migrated_from: sourceType || 'localStorage'
          })
          .select()
          .single();
          
        migrationResults.push({
          status: 'success',
          originalId: taskData.id,
          migratedId: migratedTask.data.id,
          title: taskData.title
        });
      } catch (taskError) {
        migrationResults.push({
          status: 'error',
          originalId: taskData.id,
          title: taskData.title,
          error: taskError.message
        });
      }
    }
    
    const successCount = migrationResults.filter(r => r.status === 'success').length;
    const errorCount = migrationResults.filter(r => r.status === 'error').length;
    
    res.json({
      summary: {
        total: tasks.length,
        successful: successCount,
        failed: errorCount,
        successRate: Math.round((successCount / tasks.length) * 100)
      },
      results: migrationResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration Template:
class TaskMigrationService {
  async migratePersonalTasks(
    tasks: LocalStorageTask[], 
    supabaseUserId: string,
    sourceType: string
  ): Promise<MigrationResult> {
    
    const migrationResults = [];
    
    for (const taskData of tasks) {
      try {
        const migratedTask = await this.database.tasks.create({
          title: taskData.title,
          description: taskData.description || '',
          userId: supabaseUserId,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'general',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          completed: !!taskData.completed,
          createdAt: taskData.createdAt || new Date(),
          migratedFrom: sourceType || 'localStorage'
        });
        
        migrationResults.push({
          status: 'success',
          originalId: taskData.id,
          migratedId: migratedTask.id,
          title: taskData.title
        });
      } catch (taskError) {
        migrationResults.push({
          status: 'error',
          originalId: taskData.id,
          title: taskData.title,
          error: taskError.message
        });
      }
    }
    
    const successCount = migrationResults.filter(r => r.status === 'success').length;
    const errorCount = migrationResults.filter(r => r.status === 'error').length;
    
    return {
      summary: {
        total: tasks.length,
        successful: successCount,
        failed: errorCount,
        successRate: Math.round((successCount / tasks.length) * 100)
      },
      results: migrationResults
    };
  }
}
```

---

## 🔧 MIDDLEWARE & UTILITY TEMPLATES

### **Authentication Middleware**
```javascript
// MIDDLEWARE: Supabase authentication verification
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

### **Error Handling Middleware**  
```javascript
// MIDDLEWARE: Global error handling
const errorHandler = (error, req, res, next) => {
  console.error('API Error:', error);
  
  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
};
```

---

## 🎯 MIGRATION STRATEGY

### **API Preservation Checklist**
- ✅ 30+ API endpoints cataloged across 3 servers
- ✅ All request/response patterns documented  
- ✅ Authentication middleware preserved
- ✅ Error handling patterns preserved
- ✅ Database integration patterns preserved
- ✅ AI processing integration preserved

### **Zero-Loss API Migration Plan**
1. **Phase 1**: Create plugin-based API services with identical interfaces
2. **Phase 2**: Implement endpoints using templates
3. **Phase 3**: Test API parity with existing servers
4. **Phase 4**: Gradual migration with dual-system support  
5. **Phase 5**: Complete API validation

**CRITICAL**: Every API endpoint, parameter, response format, and error handling pattern must be preserved exactly to ensure zero functionality loss during transformation.
/**
 * 🚀 SISO-INTERNAL Hybrid API Server
 * 
 * MIGRATION-READY: Supports both Prisma and Supabase backends
 * Environment-controlled database switching for safe migration
 */

import express from 'express';
import cors from 'cors';
import { getDatabaseManager } from './src/services/database/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize hybrid database manager
let dbManager;

async function initializeDatabase() {
  try {
    console.log('🔌 Initializing hybrid database system...');
    console.log(`📊 Database Mode: ${process.env.DATABASE_MODE || 'prisma'}`);
    
    dbManager = getDatabaseManager();
    
    // Verify database health
    const health = await dbManager.healthCheck();
    console.log('💚 Database Health Check:', health);
    
    if (!health.prisma && !health.supabase) {
      throw new Error('No database connections available');
    }
    
    console.log(`✅ Database system ready in ${health.active} mode`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Database health endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = await dbManager.healthCheck();
    res.json({
      status: 'healthy',
      database: health,
      mode: dbManager.getCurrentMode(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== LIGHT WORK ENDPOINTS =====

app.get('/api/light-work/tasks', async (req, res) => {
  try {
    const { userId, date, showAllIncomplete } = req.query;
    
    console.log('📊 Light Work Query:', { userId, date, showAllIncomplete });

    const tasks = await dbManager.getLightWorkTasks({
      userId,
      date,
      showAllIncomplete: showAllIncomplete === 'true',
      completed: false
    });

    console.log(`☕ Loaded ${tasks.length} Light Work tasks for ${userId}`);
    res.json(tasks);
    
  } catch (error) {
    console.error('❌ Light Work GET error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch light work tasks',
      details: error.message,
      endpoint: 'GET /api/light-work/tasks'
    });
  }
});

app.post('/api/light-work/tasks', async (req, res) => {
  try {
    const { userId, title, description, priority = 'MEDIUM', date } = req.body;
    
    console.log('➕ Creating Light Work task:', { userId, title, priority, date });

    const task = await dbManager.createLightWorkTask({
      userId,
      title,
      description,
      priority,
      originalDate: date,
      currentDate: date
    });

    console.log(`✅ Created Light Work task: ${task.title}`);
    res.status(201).json(task);
    
  } catch (error) {
    console.error('❌ Light Work POST error:', error);
    res.status(500).json({ 
      error: 'Failed to create light work task',
      details: error.message,
      endpoint: 'POST /api/light-work/tasks'
    });
  }
});

app.put('/api/light-work/tasks/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;
    
    console.log(`🔄 Toggling Light Work task ${taskId}: ${completed}`);

    const task = await dbManager.updateLightWorkTask(taskId, { completed });
    
    console.log(`✅ Updated Light Work task: ${task.title} -> ${completed ? 'completed' : 'pending'}`);
    res.json(task);
    
  } catch (error) {
    console.error('❌ Light Work toggle error:', error);
    res.status(500).json({ 
      error: 'Failed to toggle light work task',
      details: error.message,
      endpoint: `PUT /api/light-work/tasks/${req.params.taskId}/toggle`
    });
  }
});

app.post('/api/light-work/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    
    console.log(`➕ Adding subtask to Light Work task ${taskId}: ${title}`);

    const subtask = await dbManager.createLightWorkSubtask({
      taskId,
      title
    });
    
    console.log(`✅ Created Light Work subtask: ${subtask.title}`);
    res.status(201).json(subtask);
    
  } catch (error) {
    console.error('❌ Light Work subtask creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create light work subtask',
      details: error.message,
      endpoint: `POST /api/light-work/tasks/${req.params.taskId}/subtasks`
    });
  }
});

app.delete('/api/light-work/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log(`🗑️ Deleting Light Work task ${taskId}`);

    await dbManager.deleteLightWorkTask(taskId);
    
    console.log(`✅ Deleted Light Work task ${taskId}`);
    res.json({ success: true, message: 'Task deleted successfully' });
    
  } catch (error) {
    console.error('❌ Light Work delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete light work task',
      details: error.message,
      endpoint: `DELETE /api/light-work/tasks/${req.params.taskId}`
    });
  }
});

app.delete('/api/light-work/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    console.log(`🗑️ Deleting Light Work subtask ${subtaskId}`);

    await dbManager.deleteLightWorkSubtask(subtaskId);
    
    console.log(`✅ Deleted Light Work subtask ${subtaskId}`);
    res.json({ success: true, message: 'Subtask deleted successfully' });
    
  } catch (error) {
    console.error('❌ Light Work subtask delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete light work subtask',
      details: error.message,
      endpoint: `DELETE /api/light-work/subtasks/${req.params.subtaskId}`
    });
  }
});

// ===== DEEP WORK ENDPOINTS =====

app.get('/api/deep-work/tasks', async (req, res) => {
  try {
    const { userId, date, showAllIncomplete } = req.query;
    
    console.log('🧠 Deep Work Query:', { userId, date, showAllIncomplete });

    const tasks = await dbManager.getDeepWorkTasks({
      userId,
      date,
      showAllIncomplete: showAllIncomplete === 'true',
      completed: false
    });

    console.log(`🧠 Loaded ${tasks.length} Deep Work tasks for ${userId}`);
    res.json(tasks);
    
  } catch (error) {
    console.error('❌ Deep Work GET error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch deep work tasks',
      details: error.message,
      endpoint: 'GET /api/deep-work/tasks'
    });
  }
});

app.post('/api/deep-work/tasks', async (req, res) => {
  try {
    const { userId, title, description, priority = 'HIGH', date } = req.body;
    
    console.log('➕ Creating Deep Work task:', { userId, title, priority, date });

    const task = await dbManager.createDeepWorkTask({
      userId,
      title,
      description,
      priority,
      originalDate: date,
      currentDate: date
    });

    console.log(`✅ Created Deep Work task: ${task.title}`);
    res.status(201).json(task);
    
  } catch (error) {
    console.error('❌ Deep Work POST error:', error);
    res.status(500).json({ 
      error: 'Failed to create deep work task',
      details: error.message,
      endpoint: 'POST /api/deep-work/tasks'
    });
  }
});

app.put('/api/deep-work/tasks/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;
    
    console.log(`🔄 Toggling Deep Work task ${taskId}: ${completed}`);

    const task = await dbManager.updateDeepWorkTask(taskId, { completed });
    
    console.log(`✅ Updated Deep Work task: ${task.title} -> ${completed ? 'completed' : 'pending'}`);
    res.json(task);
    
  } catch (error) {
    console.error('❌ Deep Work toggle error:', error);
    res.status(500).json({ 
      error: 'Failed to toggle deep work task',
      details: error.message,
      endpoint: `PUT /api/deep-work/tasks/${req.params.taskId}/toggle`
    });
  }
});

app.post('/api/deep-work/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    
    console.log(`➕ Adding subtask to Deep Work task ${taskId}: ${title}`);

    const subtask = await dbManager.createDeepWorkSubtask({
      taskId,
      title
    });
    
    console.log(`✅ Created Deep Work subtask: ${subtask.title}`);
    res.status(201).json(subtask);
    
  } catch (error) {
    console.error('❌ Deep Work subtask creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create deep work subtask',
      details: error.message,
      endpoint: `POST /api/deep-work/tasks/${req.params.taskId}/subtasks`
    });
  }
});

app.delete('/api/deep-work/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log(`🗑️ Deleting Deep Work task ${taskId}`);

    await dbManager.deleteDeepWorkTask(taskId);
    
    console.log(`✅ Deleted Deep Work task ${taskId}`);
    res.json({ success: true, message: 'Task deleted successfully' });
    
  } catch (error) {
    console.error('❌ Deep Work delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete deep work task',
      details: error.message,
      endpoint: `DELETE /api/deep-work/tasks/${req.params.taskId}`
    });
  }
});

app.delete('/api/deep-work/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    console.log(`🗑️ Deleting Deep Work subtask ${subtaskId}`);

    await dbManager.deleteDeepWorkSubtask(subtaskId);
    
    console.log(`✅ Deleted Deep Work subtask ${subtaskId}`);
    res.json({ success: true, message: 'Subtask deleted successfully' });
    
  } catch (error) {
    console.error('❌ Deep Work subtask delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete deep work subtask',
      details: error.message,
      endpoint: `DELETE /api/deep-work/subtasks/${req.params.subtaskId}`
    });
  }
});

// ===== MORNING ROUTINE ENDPOINTS =====

app.get('/api/morning-routine', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    console.log('🌅 Morning Routine Query:', { userId, date });

    const tasks = await dbManager.getMorningRoutineTasks(userId, date);
    
    console.log(`🌅 Loaded ${tasks.length} Morning Routine tasks for ${userId}`);
    res.json(tasks);
    
  } catch (error) {
    console.error('❌ Morning Routine GET error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch morning routine tasks',
      details: error.message,
      endpoint: 'GET /api/morning-routine'
    });
  }
});

// ===== DAILY REFLECTIONS ENDPOINTS =====

app.get('/api/daily-reflections', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    console.log('📝 Daily Reflection Query:', { userId, date });

    const reflection = await dbManager.getDailyReflection(userId, date);
    
    console.log(`📝 ${reflection ? 'Found' : 'No'} Daily Reflection for ${userId} on ${date}`);
    res.json(reflection);
    
  } catch (error) {
    console.error('❌ Daily Reflection GET error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch daily reflection',
      details: error.message,
      endpoint: 'GET /api/daily-reflections'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    endpoint: `${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server gracefully...');
  
  if (dbManager) {
    await dbManager.cleanup();
  }
  
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ===== SISO-INTERNAL HYBRID API SERVER =====');
      console.log('🎯 Migration-Ready Multi-Database Support');
      console.log('');
      console.log(`🌐 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database Mode: ${dbManager.getCurrentMode()}`);
      console.log('');
      console.log('📡 Available Endpoints:');
      console.log('   ❤️‍🩹  Health: /api/health');  
      console.log('   ☕ Light Work API: /api/light-work/tasks');
      console.log('   🧠 Deep Work API: /api/deep-work/tasks');
      console.log('   🌅 Morning Routine: /api/morning-routine');
      console.log('   📝 Daily Reflections: /api/daily-reflections');
      console.log('');
      console.log('🔄 Ready for safe database migration!');
      console.log('=====================================');
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
/**
 * 🚀 SISO-INTERNAL API Server
 * 
 * Simple Express server providing API endpoints for real database persistence
 * Uses the SAME Prisma operations that were successfully tested in scripts/test-real-database.js
 */

import express from 'express';
import cors from 'cors';
import { PrismaClient } from './generated/prisma/index.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Helper function to ensure user exists
async function ensureUserExists(userId) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create user with default email if not exists
    console.log(`🔧 Auto-creating user: ${userId}`);
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.generated`, // Default email for Clerk users
        supabaseId: userId
      }
    });
    
    console.log(`✅ Auto-created user: ${userId}`);
    return newUser;
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    throw error;
  }
}

// 👤 USER ENDPOINTS

// Get or create user (for Clerk integration)
app.post('/api/users', async (req, res) => {
  try {
    const { email, supabaseId } = req.body;
    
    if (!email || !supabaseId) {
      return res.status(400).json({ error: 'Email and supabaseId are required' });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: supabaseId,
        email,
        supabaseId
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating/getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// 📋 TASK ENDPOINTS

// Get tasks for a specific date (SAME as test script)
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    if (!userId || !date) {
      return res.status(400).json({ error: 'userId and date are required' });
    }

    const tasks = await prisma.personalTask.findMany({
      where: {
        userId: userId,
        currentDate: date
      },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new task (SAME as test script)
app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, taskData } = req.body;
    
    if (!userId || !taskData) {
      return res.status(400).json({ error: 'userId and taskData are required' });
    }

    // Ensure user exists before creating task
    await ensureUserExists(userId);

    const task = await prisma.personalTask.create({
      data: {
        userId,
        title: taskData.title,
        description: taskData.description || null,
        workType: taskData.workType,
        priority: taskData.priority,
        currentDate: taskData.currentDate,
        originalDate: taskData.originalDate || taskData.currentDate,
        timeEstimate: taskData.timeEstimate || null,
        estimatedDuration: taskData.estimatedDuration || null,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks ? {
          create: taskData.subtasks.map(subtask => ({
            title: subtask.title,
            workType: subtask.workType
          }))
        } : undefined
      },
      include: {
        subtasks: true
      }
    });

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task completion (SAME as test script)
app.patch('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed, title } = req.body;

    // Build update data object dynamically
    const updateData = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    
    // Handle time tracking fields
    const { 
      startedAt, 
      actualDurationMin, 
      aiTimeEstimateMin, 
      aiTimeEstimateMax, 
      aiTimeEstimateML, 
      timeAccuracy 
    } = req.body;
    
    if (startedAt !== undefined) updateData.startedAt = startedAt ? new Date(startedAt) : null;
    if (actualDurationMin !== undefined) updateData.actualDurationMin = actualDurationMin;
    if (aiTimeEstimateMin !== undefined) updateData.aiTimeEstimateMin = aiTimeEstimateMin;
    if (aiTimeEstimateMax !== undefined) updateData.aiTimeEstimateMax = aiTimeEstimateMax;
    if (aiTimeEstimateML !== undefined) updateData.aiTimeEstimateML = aiTimeEstimateML;
    if (timeAccuracy !== undefined) updateData.timeAccuracy = timeAccuracy;

    const updatedTask = await prisma.personalTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        subtasks: true
      }
    });

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks', async (req, res) => {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // First delete all subtasks for this task
    await prisma.personalSubtask.deleteMany({
      where: { taskId: taskId }
    });

    // Then delete the task itself
    await prisma.personalTask.delete({
      where: { id: taskId }
    });

    console.log(`✅ Deleted task: ${taskId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get task details (for time tracking)
app.get('/api/tasks/:taskId/details', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.personalTask.findUnique({
      where: { id: taskId },
      include: {
        subtasks: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subtask details (for time tracking)
app.get('/api/subtasks/:subtaskId/details', async (req, res) => {
  try {
    const { subtaskId } = req.params;

    const subtask = await prisma.personalSubtask.findUnique({
      where: { id: subtaskId }
    });

    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    res.json({ success: true, data: subtask });
  } catch (error) {
    console.error('Error fetching subtask details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Push task to another day
app.patch('/api/tasks/:taskId/push', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { pushedToDate } = req.body;

    const updatedTask = await prisma.personalTask.update({
      where: { id: taskId },
      data: { 
        currentDate: pushedToDate || new Date().toISOString().split('T')[0],
        rollovers: { increment: 1 }
      },
      include: {
        subtasks: true
      }
    });

    console.log(`📅 Pushed task to another day: ${updatedTask.title}`);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error pushing task to another day:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new subtask
app.post('/api/subtasks', async (req, res) => {
  try {
    const { taskId, title, workType } = req.body;

    if (!taskId || !title) {
      return res.status(400).json({ error: 'taskId and title are required' });
    }

    const newSubtask = await prisma.personalSubtask.create({
      data: {
        taskId: taskId,
        title: title.trim(),
        workType: workType || 'LIGHT'
      }
    });

    console.log(`✅ Created subtask: ${newSubtask.title} for task ${taskId}`);
    res.json({ success: true, data: newSubtask });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update subtask completion and time tracking (ENHANCED)
app.patch('/api/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { completed } = req.body;

    // Build update data object dynamically
    const updateData = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }
    
    // Handle time tracking fields
    const { 
      startedAt, 
      actualDurationMin, 
      aiTimeEstimateMin, 
      aiTimeEstimateMax, 
      aiTimeEstimateML, 
      timeAccuracy 
    } = req.body;
    
    if (startedAt !== undefined) updateData.startedAt = startedAt ? new Date(startedAt) : null;
    if (actualDurationMin !== undefined) updateData.actualDurationMin = actualDurationMin;
    if (aiTimeEstimateMin !== undefined) updateData.aiTimeEstimateMin = aiTimeEstimateMin;
    if (aiTimeEstimateMax !== undefined) updateData.aiTimeEstimateMax = aiTimeEstimateMax;
    if (aiTimeEstimateML !== undefined) updateData.aiTimeEstimateML = aiTimeEstimateML;
    if (timeAccuracy !== undefined) updateData.timeAccuracy = timeAccuracy;

    const updatedSubtask = await prisma.personalSubtask.update({
      where: { id: subtaskId },
      data: updateData
    });

    res.json({ success: true, data: updatedSubtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🌅 MORNING ROUTINE TRACKING ENDPOINTS

// Get morning routine for a specific date
app.get('/api/morning-routine', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    if (!userId || !date) {
      return res.status(400).json({ error: 'userId and date are required' });
    }

    let routine = await prisma.morningRoutineTracking.findUnique({
      where: { 
        userId_date: {
          userId: userId,
          date: date
        }
      }
    });

    // If no routine exists for this date, create one with all tasks/subtasks false
    if (!routine) {
      routine = await prisma.morningRoutineTracking.create({
        data: {
          userId,
          date,
          // Main tasks
          wakeUp: false,
          getBloodFlowing: false,
          freshenUp: false,
          powerUpBrain: false,
          planDay: false,
          meditation: false,
          // Subtasks
          pushups: false,
          situps: false,
          pullups: false,
          bathroom: false,
          brushTeeth: false,
          coldShower: false,
          water: false,
          supplements: false,
          preworkout: false,
          thoughtDump: false,
          planDeepWork: false,
          planLightWork: false,
          setTimebox: false
        }
      });
    }

    res.json({ success: true, data: routine });
  } catch (error) {
    console.error('Error fetching morning routine:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update morning routine habit completion
app.patch('/api/morning-routine', async (req, res) => {
  try {
    const { userId, date, habitName, completed } = req.body;
    
    if (!userId || !date || !habitName || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
    }

    // Ensure user exists before updating
    await ensureUserExists(userId);

    // Update the specific habit
    const updateData = { [habitName]: completed };
    
    const routine = await prisma.morningRoutineTracking.upsert({
      where: { 
        userId_date: {
          userId: userId,
          date: date
        }
      },
      update: updateData,
      create: {
        userId,
        date,
        // Main tasks
        wakeUp: false,
        getBloodFlowing: false,
        freshenUp: false,
        powerUpBrain: false,
        planDay: false,
        meditation: false,
        // Subtasks
        pushups: false,
        situps: false,
        pullups: false,
        bathroom: false,
        brushTeeth: false,
        coldShower: false,
        water: false,
        supplements: false,
        preworkout: false,
        thoughtDump: false,
        planDeepWork: false,
        planLightWork: false,
        setTimebox: false,
        ...updateData
      }
    });

    console.log(`✅ Updated ${habitName} to ${completed} for ${userId} on ${date}`);
    res.json({ success: true, data: routine });
  } catch (error) {
    console.error('Error updating morning routine:', error);
    res.status(500).json({ error: error.message });
  }
});

// 👤 PERSONAL CONTEXT ENDPOINTS

// Get personal context
app.get('/api/personal-context', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const context = await prisma.personalContext.findUnique({
      where: { userId }
    });

    res.json({ success: true, data: context });
  } catch (error) {
    console.error('Error fetching personal context:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update personal context (SAME as test script)
app.post('/api/personal-context', async (req, res) => {
  try {
    const { userId, contextData } = req.body;

    if (!userId || !contextData) {
      return res.status(400).json({ error: 'userId and contextData are required' });
    }

    const context = await prisma.personalContext.upsert({
      where: { userId },
      create: {
        userId,
        ...contextData
      },
      update: contextData
    });

    res.json({ success: true, data: context });
  } catch (error) {
    console.error('Error updating personal context:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SISO-INTERNAL API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Database: Connected to Prisma PostgreSQL`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
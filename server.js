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
    const { completed } = req.body;

    const updatedTask = await prisma.personalTask.update({
      where: { id: taskId },
      data: { 
        completed: completed,
        completedAt: completed ? new Date() : null
      },
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

// Update subtask completion (SAME as test script)
app.patch('/api/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { completed } = req.body;

    const updatedSubtask = await prisma.personalSubtask.update({
      where: { id: subtaskId },
      data: { 
        completed: completed,
        completedAt: completed ? new Date() : null
      }
    });

    res.json({ success: true, data: updatedSubtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// 👤 PERSONAL CONTEXT ENDPOINTS

// Get personal context
app.get('/api/personal-context/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

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
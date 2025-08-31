/**
 * 🚀 SISO-INTERNAL API Server - Clean Architecture
 * 
 * Separated endpoints for Light Work and Deep Work
 * Designed for multi-user support (Tazz, Tours, etc.)
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

// ===== LIGHT WORK ENDPOINTS =====

// Get all light work tasks for a user
app.get('/api/light-work/tasks', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    const whereClause = {
      userId,
      completed: false
    };
    
    // Add date filter if provided
    if (date) {
      whereClause.currentDate = date;
    }
    
    console.log('📊 Light Work Query:', whereClause);

    const tasks = await prisma.lightWorkTask.findMany({
      where: whereClause,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`☕ Loaded ${tasks.length} Light Work tasks for ${userId}`);
    
    // Debug logging
    tasks.forEach((task, index) => {
      console.log(`  📋 Task ${index + 1}: "${task.title}" - ${task.subtasks.length} subtasks`);
      if (task.subtasks.length > 5) {
        console.log(`    📍 Has many subtasks - first one: "${task.subtasks[0]?.title}"`);
      }
    });
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('❌ Error fetching light work tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new light work task
app.post('/api/light-work/tasks', async (req, res) => {
  try {
    const { userId, taskData } = req.body;
    
    console.log('📝 Creating Light Work task:', taskData.title);

    const task = await prisma.lightWorkTask.create({
      data: {
        userId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'MEDIUM',
        originalDate: taskData.originalDate || new Date().toISOString().split('T')[0],
        currentDate: taskData.currentDate || new Date().toISOString().split('T')[0],
        estimatedDuration: taskData.estimatedDuration,
        category: taskData.category,
        tags: taskData.tags || [],
        subtasks: {
          create: (taskData.subtasks || []).map(subtask => ({
            title: subtask.title,
            text: subtask.title, // Fallback
            priority: subtask.priority || 'Med'
          }))
        }
      },
      include: {
        subtasks: true
      }
    });

    console.log(`✅ Created Light Work task: ${task.id}`);
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('❌ Error creating light work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DEEP WORK ENDPOINTS =====

// Get all deep work tasks for a user
app.get('/api/deep-work/tasks', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    const whereClause = {
      userId,
      completed: false
    };
    
    // Add date filter if provided
    if (date) {
      whereClause.currentDate = date;
    }
    
    console.log('📊 Deep Work Query:', whereClause);

    const tasks = await prisma.deepWorkTask.findMany({
      where: whereClause,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`🧠 Loaded ${tasks.length} Deep Work tasks for ${userId}`);
    
    // Debug logging
    tasks.forEach((task, index) => {
      console.log(`  📋 Task ${index + 1}: "${task.title}" - ${task.subtasks.length} subtasks`);
      if (task.subtasks.length > 5) {
        console.log(`    📍 Has many subtasks - first one: "${task.subtasks[0]?.title}"`);
      }
    });
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('❌ Error fetching deep work tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new deep work task
app.post('/api/deep-work/tasks', async (req, res) => {
  try {
    const { userId, taskData } = req.body;
    
    console.log('📝 Creating Deep Work task:', taskData.title);

    const task = await prisma.deepWorkTask.create({
      data: {
        userId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'HIGH',
        originalDate: taskData.originalDate || new Date().toISOString().split('T')[0],
        currentDate: taskData.currentDate || new Date().toISOString().split('T')[0],
        estimatedDuration: taskData.estimatedDuration || 120, // Default 2 hours
        focusBlocks: taskData.focusBlocks || 1,
        breakDuration: taskData.breakDuration || 15,
        interruptionMode: false, // Always start with no interruptions
        category: taskData.category,
        tags: taskData.tags || [],
        subtasks: {
          create: (taskData.subtasks || []).map(subtask => ({
            title: subtask.title,
            text: subtask.title, // Fallback
            priority: subtask.priority || 'High', // Deep work subtasks typically high priority
            requiresFocus: true,
            complexityLevel: subtask.complexityLevel || 3
          }))
        }
      },
      include: {
        subtasks: true
      }
    });

    console.log(`✅ Created Deep Work task: ${task.id}`);
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('❌ Error creating deep work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== TASK COMPLETION ENDPOINTS =====

// Toggle light work task completion
app.put('/api/light-work/tasks/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await prisma.lightWorkTask.findUnique({
      where: { id: taskId }
    });
    
    const updatedTask = await prisma.lightWorkTask.update({
      where: { id: taskId },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      },
      include: { subtasks: true }
    });

    console.log(`✅ Toggled Light Work task: ${taskId} -> ${updatedTask.completed ? 'completed' : 'incomplete'}`);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('❌ Error toggling light work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle deep work task completion
app.put('/api/deep-work/tasks/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await prisma.deepWorkTask.findUnique({
      where: { id: taskId }
    });
    
    const updatedTask = await prisma.deepWorkTask.update({
      where: { id: taskId },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      },
      include: { subtasks: true }
    });

    console.log(`✅ Toggled Deep Work task: ${taskId} -> ${updatedTask.completed ? 'completed' : 'incomplete'}`);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('❌ Error toggling deep work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SUBTASK ENDPOINTS =====

// Add subtask to light work task
app.post('/api/light-work/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, priority } = req.body;
    
    const subtask = await prisma.lightWorkSubtask.create({
      data: {
        taskId,
        title,
        text: title,
        priority: priority || 'Med'
      }
    });

    console.log(`✅ Added subtask to Light Work task: ${taskId}`);
    res.json({ success: true, data: subtask });
  } catch (error) {
    console.error('❌ Error adding light work subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add subtask to deep work task
app.post('/api/deep-work/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, priority, complexityLevel } = req.body;
    
    const subtask = await prisma.deepWorkSubtask.create({
      data: {
        taskId,
        title,
        text: title,
        priority: priority || 'High',
        requiresFocus: true,
        complexityLevel: complexityLevel || 3
      }
    });

    console.log(`✅ Added subtask to Deep Work task: ${taskId}`);
    res.json({ success: true, data: subtask });
  } catch (error) {
    console.error('❌ Error adding deep work subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Deep Work subtask (due date, completion, etc.)
app.put('/api/deep-work/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { completed, dueDate } = req.body;
    
    console.log(`📝 Updating Deep Work subtask: ${subtaskId}`, { completed, dueDate });
    
    const updateData = {};
    
    // Handle completion update
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }
    
    // Handle due date update
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate;
    }
    
    const updatedSubtask = await prisma.deepWorkSubtask.update({
      where: { id: subtaskId },
      data: updateData
    });
    
    console.log(`✅ Updated Deep Work subtask: ${subtaskId}`);
    res.json({ success: true, data: updatedSubtask });
  } catch (error) {
    console.error('❌ Error updating deep work subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DELETE ENDPOINTS =====

// Delete Light Work task
app.delete('/api/light-work/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log(`🗑️ Deleting Light Work task: ${taskId}`);
    
    // Delete the task (subtasks will be deleted via cascade)
    const deletedTask = await prisma.lightWorkTask.delete({
      where: { id: taskId },
      include: { subtasks: true }
    });
    
    console.log(`✅ Deleted Light Work task: ${deletedTask.title} (${deletedTask.subtasks.length} subtasks)`);
    res.json({ success: true, data: deletedTask });
  } catch (error) {
    console.error('❌ Error deleting light work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Deep Work task
app.delete('/api/deep-work/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log(`🗑️ Deleting Deep Work task: ${taskId}`);
    
    // Delete the task (subtasks will be deleted via cascade)
    const deletedTask = await prisma.deepWorkTask.delete({
      where: { id: taskId },
      include: { subtasks: true }
    });
    
    console.log(`✅ Deleted Deep Work task: ${deletedTask.title} (${deletedTask.subtasks.length} subtasks)`);
    res.json({ success: true, data: deletedTask });
  } catch (error) {
    console.error('❌ Error deleting deep work task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Light Work subtask
app.delete('/api/light-work/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    console.log(`🗑️ Deleting Light Work subtask: ${subtaskId}`);
    
    const deletedSubtask = await prisma.lightWorkSubtask.delete({
      where: { id: subtaskId }
    });
    
    console.log(`✅ Deleted Light Work subtask: ${deletedSubtask.title}`);
    res.json({ success: true, data: deletedSubtask });
  } catch (error) {
    console.error('❌ Error deleting light work subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Deep Work subtask
app.delete('/api/deep-work/subtasks/:subtaskId', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    
    console.log(`🗑️ Deleting Deep Work subtask: ${subtaskId}`);
    
    const deletedSubtask = await prisma.deepWorkSubtask.delete({
      where: { id: subtaskId }
    });
    
    console.log(`✅ Deleted Deep Work subtask: ${deletedSubtask.title}`);
    res.json({ success: true, data: deletedSubtask });
  } catch (error) {
    console.error('❌ Error deleting deep work subtask:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== MORNING ROUTINE ENDPOINT =====
// Get morning routine data for a user
app.get('/api/morning-routine', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    console.log(`🌅 Loading morning routine for user: ${userId}, date: ${date}`);
    
    // For now, return empty morning routine data
    // This can be expanded later with actual morning routine logic
    const morningRoutine = {
      tasks: [],
      completed: false,
      startTime: null,
      endTime: null
    };
    
    console.log(`✅ Morning routine loaded for ${userId}`);
    res.json({ success: true, data: morningRoutine });
  } catch (error) {
    console.error('❌ Error fetching morning routine:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== TIMEBLOCKS ENDPOINT =====
// Get timeblocks data for a user
app.get('/api/timeblocks', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    console.log(`⏰ Loading timeblocks for user: ${userId}, date: ${date}`);
    
    if (!userId || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and date are required' 
      });
    }
    
    // For now, return empty timeblocks array
    // TODO: Implement actual timeblock retrieval from database
    const timeBlocks = [];
    
    console.log(`✅ Timeblocks loaded for ${userId}: ${timeBlocks.length} blocks`);
    res.json({ success: true, data: timeBlocks });
  } catch (error) {
    console.error('❌ Error fetching timeblocks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new timeblock
app.post('/api/timeblocks', async (req, res) => {
  try {
    const timeBlockData = req.body;
    
    console.log(`📝 Creating timeblock:`, timeBlockData);
    
    // TODO: Implement actual timeblock creation
    const newTimeBlock = {
      id: `tb_${Date.now()}`,
      ...timeBlockData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Created timeblock: ${newTimeBlock.id}`);
    res.json({ success: true, data: newTimeBlock });
  } catch (error) {
    console.error('❌ Error creating timeblock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== MIGRATION ENDPOINT =====
// Temporary endpoint to migrate old PersonalTask data
app.post('/api/migrate/personal-tasks', async (req, res) => {
  try {
    console.log('🔄 Starting migration from PersonalTask to separated tables...');
    
    // This would handle migrating old data
    // For now, since we cleared everything, we'll skip this
    
    res.json({ success: true, message: 'Migration completed (no old data to migrate)' });
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SERVER STARTUP =====
app.listen(PORT, () => {
  console.log(`🚀 SISO-INTERNAL Server running on port ${PORT}`);
  console.log(`🎯 Features:`);
  console.log(`   ☕ Light Work API: /api/light-work/tasks`);
  console.log(`   🧠 Deep Work API: /api/deep-work/tasks`);
  console.log(`   👥 Multi-user support: Tazz, Tours, etc.`);
  console.log(`   🔄 Clean separation: No more workType confusion`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
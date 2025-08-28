/**
 * 🎯 Tasks Vercel Serverless Function
 * 
 * Works with Vite frontend on Vercel
 */

import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Helper function to ensure user exists
async function ensureUserExists(userId) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      return existingUser;
    }
    
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@clerk.generated`,
        supabaseId: userId
      }
    });
    
    return newUser;
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
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

        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        const { userId: createUserId, taskData } = req.body;
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }
        
        await ensureUserExists(createUserId);
        
        const newTask = await prisma.personalTask.create({
          data: {
            userId: createUserId,
            title: taskData.title,
            description: taskData.description || '',
            workType: taskData.workType || 'LIGHT',
            priority: taskData.priority || 'MEDIUM',
            completed: false,
            currentDate: taskData.currentDate,
            originalDate: taskData.originalDate || taskData.currentDate,
            estimatedDuration: taskData.estimatedDuration || 30,
            timeEstimate: taskData.timeEstimate || '30 min',
            rollovers: 0,
            tags: taskData.tags || [],
            category: taskData.category || 'general'
          },
          include: {
            subtasks: true
          }
        });

        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
      case 'PATCH':
        const { taskId, completed, title } = req.body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }

        const updateData = {};
        if (typeof completed === 'boolean') {
          updateData.completed = completed;
          updateData.completedAt = completed ? new Date() : null;
        }
        if (title) {
          updateData.title = title;
        }

        const updatedTask = await prisma.personalTask.update({
          where: { id: taskId },
          data: updateData,
          include: {
            subtasks: true
          }
        });

        return res.status(200).json({ success: true, data: updatedTask });

      case 'DELETE':
        const { taskId: deleteTaskId } = req.query;
        if (!deleteTaskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }

        await prisma.personalTask.delete({
          where: { id: deleteTaskId }
        });

        return res.status(200).json({ success: true, message: 'Task deleted' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
}
/**
 * 🎯 Tasks API - Simplified for Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Mock task data
    const mockTask = {
      id: 'task-1',
      userId: req.query.userId as string || req.body?.userId,
      title: 'Sample Task',
      description: 'This is a mock task for testing',
      workType: 'LIGHT',
      priority: 'MEDIUM',
      completed: false,
      currentDate: req.query.date as string || req.body?.taskData?.currentDate,
      originalDate: req.query.date as string || req.body?.taskData?.currentDate,
      estimatedDuration: 30,
      timeEstimate: '30 min',
      rollovers: 0,
      tags: [],
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: []
    };

    switch (req.method) {
      case 'GET':
        const { userId, date } = req.query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }

        return res.status(200).json({ 
          success: true, 
          data: [mockTask],
          message: 'Tasks API is working! (Using mock data for now)' 
        });

      case 'POST':
        const { userId: createUserId, taskData } = req.body;
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }
        
        const newMockTask = {
          ...mockTask,
          id: `task-${Date.now()}`,
          title: taskData.title || 'New Task',
          description: taskData.description || '',
          workType: taskData.workType || 'LIGHT',
          priority: taskData.priority || 'MEDIUM'
        };

        return res.status(201).json({ 
          success: true, 
          data: newMockTask,
          message: 'Task created successfully! (Mock data)' 
        });

      case 'PUT':
      case 'PATCH':
        const { taskId, completed, title } = req.body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }

        const updatedMockTask = { 
          ...mockTask, 
          id: taskId,
          completed: completed ?? mockTask.completed,
          title: title || mockTask.title,
          completedAt: completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };

        return res.status(200).json({ 
          success: true, 
          data: updatedMockTask,
          message: 'Task updated successfully! (Mock data)' 
        });

      case 'DELETE':
        const { taskId: deleteTaskId } = req.query;
        if (!deleteTaskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Task deleted successfully! (Mock data)' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error',
      debug: 'Function is running but caught an error'
    });
  }
}
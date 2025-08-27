/**
 * 🗄️ Tasks API Endpoint
 * 
 * HTTP API for task operations with real database persistence
 */

import { taskDatabaseService } from '@/ai-first/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/tasks?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        const tasks = await taskDatabaseService.getTasksForDate(userId, date);
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/tasks - Create new task
        const { userId: createUserId, taskData } = body;
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }
        
        const newTask = await taskDatabaseService.createTask(createUserId, taskData);
        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
        // PUT /api/tasks - Update task
        const { taskId, completed, title } = body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        if (completed !== undefined) {
          await taskDatabaseService.updateTaskCompletion(taskId, completed);
        }
        
        if (title !== undefined) {
          await taskDatabaseService.updateTaskTitle(taskId, title);
        }
        
        return res.status(200).json({ success: true });

      case 'DELETE':
        // DELETE /api/tasks?taskId=xxx
        const { taskId: deleteTaskId } = query;
        if (!deleteTaskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        await taskDatabaseService.deleteTask(deleteTaskId);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
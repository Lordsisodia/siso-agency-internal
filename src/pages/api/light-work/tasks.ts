/**
 * ☕ Light Work Tasks API Endpoint
 * 
 * HTTP API for Light Work task operations with real database persistence
 */

import { taskDatabaseService } from '@/shared/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/light-work/tasks?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get light work tasks for the specific date
        const tasks = await taskDatabaseService.getTasks(userId, date, 'LIGHT_WORK');
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/light-work/tasks - Create new light work task
        const { 
          userId: postUserId, 
          date: postDate, 
          title, 
          description, 
          priority = 'MEDIUM',
          estimatedMinutes = 30
        } = body;
        
        if (!postUserId || !postDate || !title) {
          return res.status(400).json({ error: 'userId, date, and title are required' });
        }

        // Create light work task
        const newTask = await taskDatabaseService.createTask({
          userId: postUserId,
          date: postDate,
          title,
          description: description || '',
          type: 'LIGHT_WORK',
          priority,
          estimatedMinutes,
          completed: false
        });
        
        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
        // Handle task updates (toggle completion, etc.)
        const pathParts = req.url?.split('/') || [];
        const taskId = pathParts[pathParts.indexOf('tasks') + 1];
        const action = pathParts[pathParts.indexOf('tasks') + 2];
        
        if (action === 'toggle' && taskId) {
          const updatedTask = await taskDatabaseService.toggleTaskCompletion(taskId);
          return res.status(200).json({ success: true, data: updatedTask });
        }
        
        return res.status(400).json({ error: 'Invalid PUT request' });

      case 'DELETE':
        // DELETE /api/light-work/tasks/:taskId
        const deletePathParts = req.url?.split('/') || [];
        const deleteTaskId = deletePathParts[deletePathParts.indexOf('tasks') + 1];
        
        if (deleteTaskId) {
          await taskDatabaseService.deleteTask(deleteTaskId);
          return res.status(200).json({ success: true, message: 'Task deleted' });
        }
        
        return res.status(400).json({ error: 'Task ID required for deletion' });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Light Work Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
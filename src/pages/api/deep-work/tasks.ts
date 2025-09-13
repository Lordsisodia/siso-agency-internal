/**
 * 🧠 Deep Work Tasks API Endpoint
 * 
 * HTTP API for Deep Work task operations with real database persistence
 */

import { taskDatabaseService } from '@/shared/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/deep-work/tasks?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        const tasks = await taskDatabaseService.getDeepWorkTasksForDate(userId, date);
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/deep-work/tasks - Create new Deep Work task
        const { userId: createUserId, taskData } = body;
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }
        
        // Add Deep Work specific fields
        const deepWorkTaskData = {
          ...taskData,
          workType: 'DEEP',
          focusBlocks: taskData.focusBlocks || 1,
          breakDuration: taskData.breakDuration || 15,
          interruptionMode: taskData.interruptionMode || false
        };
        
        const newTask = await taskDatabaseService.createTask(createUserId, deepWorkTaskData);
        return res.status(201).json({ success: true, data: newTask });

      case 'PUT':
        // PUT /api/deep-work/tasks/:id/toggle - Toggle task completion
        const { taskId } = body;
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' });
        }
        
        // Get current task state
        const task = await taskDatabaseService.getTaskById(taskId);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        
        const newCompletedState = !task.completed;
        await taskDatabaseService.updateTaskCompletion(taskId, newCompletedState);
        
        return res.status(200).json({ 
          success: true, 
          data: { ...task, completed: newCompletedState } 
        });

      case 'DELETE':
        // DELETE /api/deep-work/tasks/:id - Delete task
        const { id } = query;
        if (!id) {
          return res.status(400).json({ error: 'Task ID is required' });
        }
        
        await taskDatabaseService.deleteTask(id);
        return res.status(200).json({ success: true, data: { id } });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('❌ Deep Work Tasks API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
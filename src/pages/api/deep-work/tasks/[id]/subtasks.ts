/**
 * 🧠 Deep Work Subtasks API Endpoint
 * 
 * HTTP API for Deep Work subtask operations with real database persistence
 */

import { taskDatabaseService } from '@/ai-first/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;
  const { id: taskId } = query;

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  try {
    switch (method) {
      case 'POST':
        // POST /api/deep-work/tasks/:id/subtasks - Create new subtask
        const { title, priority = 'High', complexityLevel = 3 } = body;
        if (!title) {
          return res.status(400).json({ error: 'title is required' });
        }
        
        const newSubtask = await taskDatabaseService.addSubtask(taskId, {
          title,
          priority,
          complexityLevel,
          requiresFocus: true, // Deep work subtasks require focus by default
          workType: 'DEEP'
        });
        
        return res.status(201).json({ success: true, data: newSubtask });

      case 'PUT':
        // PUT /api/deep-work/tasks/:id/subtasks - Update subtask completion
        const { subtaskId, completed } = body;
        if (!subtaskId) {
          return res.status(400).json({ error: 'subtaskId is required' });
        }
        
        await taskDatabaseService.updateSubtaskCompletion(subtaskId, completed);
        return res.status(200).json({ success: true });

      case 'DELETE':
        // DELETE /api/deep-work/tasks/:id/subtasks?subtaskId=xxx - Delete subtask
        const { subtaskId: deleteSubtaskId } = query;
        if (!deleteSubtaskId) {
          return res.status(400).json({ error: 'subtaskId is required' });
        }
        
        await taskDatabaseService.deleteSubtask(deleteSubtaskId);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('❌ Deep Work Subtasks API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
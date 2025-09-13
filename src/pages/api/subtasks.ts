/**
 * 🗄️ Subtasks API Endpoint
 * 
 * HTTP API for subtask operations with real database persistence
 */

import { taskDatabaseService } from '@/shared/services/task-database-service-fixed';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'POST':
        // POST /api/subtasks - Create new subtask
        const { taskId, title, workType } = body;
        if (!taskId || !title) {
          return res.status(400).json({ error: 'taskId and title are required' });
        }
        
        const newSubtask = await taskDatabaseService.addSubtask(taskId, {
          title,
          workType: workType || 'LIGHT'
        });
        return res.status(201).json({ success: true, data: newSubtask });

      case 'PUT':
        // PUT /api/subtasks - Update subtask
        const { subtaskId, completed } = body;
        if (!subtaskId) {
          return res.status(400).json({ error: 'subtaskId is required' });
        }
        
        if (completed !== undefined) {
          await taskDatabaseService.updateSubtaskCompletion(subtaskId, completed);
        }
        
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Subtasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
/**
 * ☕ Daily Task Subtasks API Endpoint - Vercel Serverless Function
 * 
 * Handles subtask operations for daily tasks (light work)
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const { taskId } = query;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  try {
    // Import the database service
    const { taskDatabaseService } = await import('../../../ai-first/services/task-database-service-js.js');

    switch (method) {
      case 'POST':
        // POST /api/daily-tasks/[taskId]/subtasks - Add subtask to task
        const { title } = body;
        
        if (!title) {
          return res.status(400).json({ error: 'title is required' });
        }

        const subtask = await taskDatabaseService.addSubtask(taskId, {
          title,
          workType: 'LIGHT'
        });
        
        return res.status(201).json({ success: true, data: subtask });

      case 'PUT':
        // PUT /api/daily-tasks/[taskId]/subtasks - Update subtask completion
        const { subtaskId, completed } = body;
        
        if (!subtaskId || completed === undefined) {
          return res.status(400).json({ error: 'subtaskId and completed are required' });
        }

        await taskDatabaseService.updateSubtaskCompletion(subtaskId, completed, 'LIGHT');
        return res.status(200).json({ success: true, message: 'Subtask updated successfully' });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Task Subtasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
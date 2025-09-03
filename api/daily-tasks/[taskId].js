/**
 * ☕ Daily Tasks Individual Task API - Vercel Serverless Function
 * 
 * Handles operations on individual daily tasks (light work)
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
    const { taskDatabaseService } = await import('../../ai-first/services/task-database-service-js.js');

    switch (method) {
      case 'PUT':
        // PUT /api/daily-tasks/[taskId] - Update task title/priority or completion
        const { completed, title, priority } = body;
        
        if (completed !== undefined) {
          // Update completion status
          await taskDatabaseService.updateTaskCompletion(taskId, completed, 'LIGHT');
          return res.status(200).json({ success: true, message: 'Task completion updated' });
        } else if (title !== undefined || priority !== undefined) {
          // Update title or priority
          const updates = {};
          if (title !== undefined) updates.title = title;
          if (priority !== undefined) updates.priority = priority;
          
          await taskDatabaseService.updateTask(taskId, updates, 'LIGHT');
          return res.status(200).json({ success: true, message: 'Task updated' });
        } else {
          return res.status(400).json({ error: 'No valid update fields provided' });
        }

      case 'DELETE':
        // DELETE /api/daily-tasks/[taskId] - Delete task
        const deletedTask = await taskDatabaseService.deleteTask(taskId, 'LIGHT');
        
        console.log(`✅ Deleted Daily Task: ${taskId}`);
        return res.status(200).json({ success: true, data: deletedTask });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Task API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
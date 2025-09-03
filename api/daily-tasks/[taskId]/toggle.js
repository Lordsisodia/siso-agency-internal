/**
 * ☕ Daily Task Toggle API Endpoint - Vercel Serverless Function
 * 
 * Handles task completion toggling for light work tasks
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
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
      case 'PUT':
        // PUT /api/daily-tasks/[taskId]/toggle - Toggle task completion
        const { completed } = body;
        
        if (completed === undefined) {
          return res.status(400).json({ error: 'completed status is required' });
        }

        await taskDatabaseService.updateTaskCompletion(taskId, completed, 'LIGHT');
        
        console.log(`✅ Toggled Daily Task: ${taskId} -> ${completed ? 'completed' : 'incomplete'}`);
        return res.status(200).json({ success: true, message: 'Task completion updated' });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Task Toggle API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
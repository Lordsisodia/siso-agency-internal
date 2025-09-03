/**
 * ☕ Daily Subtasks API Endpoint - Vercel Serverless Function
 * 
 * Handles individual subtask operations for daily tasks
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  const { subtaskId } = query;

  if (!subtaskId) {
    return res.status(400).json({ error: 'subtaskId is required' });
  }

  try {
    // Import the database service
    const { taskDatabaseService } = await import('../../ai-first/services/task-database-service-js.js');

    switch (method) {
      case 'DELETE':
        // DELETE /api/daily-subtasks/[subtaskId] - Delete subtask
        const deletedSubtask = await taskDatabaseService.deleteSubtask(subtaskId, 'LIGHT');
        
        console.log(`✅ Deleted Daily Subtask: ${subtaskId}`);
        return res.status(200).json({ success: true, data: deletedSubtask });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Subtask API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
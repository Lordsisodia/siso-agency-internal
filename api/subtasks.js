/**
 * 🗄️ Subtasks API Endpoint - Vercel Serverless Function
 * 
 * CommonJS version to avoid ES module conflicts
 */

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    // Import the database service using require (CommonJS)
    const { taskDatabaseService } = require('../ai-first/services/task-database-service-fixed');

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
};
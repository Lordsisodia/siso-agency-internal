/**
 * 🧠 Deep Work Tasks API Endpoint - Vercel Serverless Function
 * 
 * HTTP API for Deep Work task operations with real database persistence
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

  try {
    // Import the database service
    const { taskDatabaseService } = await import('../../ai-first/services/task-database-service-js.js');

    switch (method) {
      case 'GET':
        // GET /api/deep-work/tasks?userId=xxx&date=2025-08-31
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get deep work tasks for the specific date
        const tasks = await taskDatabaseService.getTasksForDate(userId, date, 'DEEP');
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/deep-work/tasks - Create new deep work task
        const { 
          userId: postUserId, 
          date: postDate, 
          title, 
          description, 
          priority = 'HIGH',
          estimatedMinutes = 90
        } = body;
        
        if (!postUserId || !postDate || !title) {
          return res.status(400).json({ error: 'userId, date, and title are required' });
        }

        // Create deep work task
        const newTask = await taskDatabaseService.createTask({
          userId: postUserId,
          date: postDate,
          title,
          description: description || '',
          workType: 'DEEP',
          priority,
          estimatedMinutes,
          completed: false
        });
        
        return res.status(201).json({ success: true, data: newTask });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Deep Work Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
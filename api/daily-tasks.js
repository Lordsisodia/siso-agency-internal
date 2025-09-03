/**
 * ☕ Daily Tasks API Endpoint - Vercel Serverless Function
 * 
 * Handles light work tasks with consolidated endpoint structure
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
    const { taskDatabaseService } = await import('../ai-first/services/task-database-service-js.js');

    switch (method) {
      case 'GET':
        // GET /api/daily-tasks - Get all light work tasks for a user
        const { userId, date, showAllIncomplete } = query;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const whereClause = {
          userId,
          completed: false
        };
        
        // Add date filter if provided (but skip if showAllIncomplete is true)
        if (date && showAllIncomplete !== 'true') {
          whereClause.currentDate = date;
        }
        
        console.log('📊 Daily Tasks Query:', whereClause);

        const tasks = await taskDatabaseService.getTasksForDate(userId, date, 'LIGHT', showAllIncomplete === 'true');
        
        console.log(`☕ Loaded ${tasks.length} Daily Tasks for ${userId}`);
        return res.status(200).json({ success: true, data: tasks });

      case 'POST':
        // POST /api/daily-tasks - Create new light work task
        const { userId: createUserId, taskData } = body;
        
        if (!createUserId || !taskData) {
          return res.status(400).json({ error: 'userId and taskData are required' });
        }

        console.log('📝 Creating Daily Task:', taskData.title);

        const task = await taskDatabaseService.createTask(createUserId, taskData, 'LIGHT');
        
        console.log(`✅ Created Daily Task: ${task.id}`);
        return res.status(201).json({ success: true, data: task });

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('❌ Daily Tasks API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
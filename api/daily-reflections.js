/**
 * 📊 Daily Reflections API Endpoint - Vercel Serverless Function
 * 
 * Handles nightly checkout data persistence with proper daily reset logic
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        // GET /api/daily-reflections?userId=xxx&date=2025-08-31
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get daily reflections for the specific date
        const reflections = await taskDatabaseService.getDailyReflectionsForDate(userId, date);
        return res.status(200).json({ success: true, data: reflections });

      case 'POST':
        // POST /api/daily-reflections - Save/update daily reflections
        const { 
          userId: postUserId, 
          date: postDate, 
          wentWell, 
          evenBetterIf, 
          analysis, 
          patterns, 
          changes,
          overallRating,
          keyLearnings,
          tomorrowFocus
        } = body;
        
        if (!postUserId || !postDate) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        const savedReflections = await taskDatabaseService.saveDailyReflections(postUserId, {
          date: postDate,
          wentWell: wentWell || [],
          evenBetterIf: evenBetterIf || [],
          analysis: analysis || [],
          patterns: patterns || [],
          changes: changes || [],
          overallRating,
          keyLearnings,
          tomorrowFocus
        });
        
        return res.status(200).json({ success: true, data: savedReflections });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Daily Reflections API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
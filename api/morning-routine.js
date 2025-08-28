/**
 * 🌅 Morning Routine API Endpoint - Vercel Serverless Function
 * 
 * ES module version with proper Vercel function export
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    // Import the database service using ES modules
    const { taskDatabaseService } = await import('../ai-first/services/task-database-service-fixed.js');

    switch (method) {
      case 'GET':
        // GET /api/morning-routine?userId=xxx&date=2025-08-26
        const { userId, date } = query;
        if (!userId || !date) {
          return res.status(400).json({ error: 'userId and date are required' });
        }
        
        // Get morning routine data for the specific date
        const morningRoutine = await taskDatabaseService.getMorningRoutineForDate(userId, date);
        return res.status(200).json({ success: true, data: morningRoutine });

      case 'PATCH':
        // PATCH /api/morning-routine - Update morning routine habit completion
        const { userId: patchUserId, date: patchDate, habitName, completed } = body;
        if (!patchUserId || !patchDate || !habitName || typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'userId, date, habitName, and completed are required' });
        }
        
        const updatedRoutine = await taskDatabaseService.updateMorningRoutineHabit(
          patchUserId, 
          patchDate, 
          habitName, 
          completed
        );
        return res.status(200).json({ success: true, data: updatedRoutine });

      default:
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('❌ Morning Routine API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
};
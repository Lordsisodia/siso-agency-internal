/**
 * Morning Routine API - Stub Handler
 * Returns empty/default data to prevent console errors
 */

const DEFAULT_ROUTINE = {
  id: 'default',
  userId: '',
  date: new Date().toISOString().split('T')[0],
  items: [
    { name: 'Wake Up', completed: false },
    { name: 'Freshen Up', completed: false },
    { name: 'Get Blood Flowing', completed: false },
    { name: 'Power Up Brain', completed: false },
    { name: 'Plan Day', completed: false },
    { name: 'Meditation', completed: false }
  ],
  completedCount: 0,
  totalCount: 6,
  completionPercentage: 0
};

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        // Return default morning routine
        res.json({
          success: true,
          data: {
            ...DEFAULT_ROUTINE,
            userId: query.userId || '',
            date: query.date || DEFAULT_ROUTINE.date
          }
        });
        break;

      case 'PATCH':
        // Return success for habit update
        res.json({
          success: true,
          data: { updated: true }
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Morning Routine API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

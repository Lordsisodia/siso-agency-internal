/**
 * XP Preview API - Stub Handler
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        res.json({
          success: true,
          data: {
            baseXP: 0,
            contextualXP: 0,
            totalXP: 0,
            breakdown: []
          }
        });
        break;

      case 'POST':
      case 'PUT':
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
    console.error('XP Preview API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

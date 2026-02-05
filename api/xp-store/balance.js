/**
 * XP Store Balance API - Stub Handler
 */

export default async function handler(req, res) {
  try {
    res.json({
      success: true,
      data: {
        currentBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('XP Store Balance API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

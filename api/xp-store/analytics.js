/**
 * XP Store Analytics API - Stub Handler
 */

export default async function handler(req, res) {
  try {
    res.json({
      success: true,
      data: {
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: 0,
        transactionsByCategory: {},
        weeklyTrend: []
      }
    });
  } catch (error) {
    console.error('XP Store Analytics API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

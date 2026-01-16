/**
 * XP Analytics API Route
 *
 * Next.js API route for fetching XP analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { xpAnalyticsService } from '@/domains/lifelock/analytics/services/xpAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authentication
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const days = searchParams.get('days');

    // Fetch analytics data
    const analyticsData = await xpAnalyticsService.getAnalytics(
      userId,
      date ? new Date(date) : new Date()
    );

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in XP analytics API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

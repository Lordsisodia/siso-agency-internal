/**
 * Today's XP API Route
 *
 * Fetch today's XP data
 */

import { NextRequest, NextResponse } from 'next/server';
import { xpAnalyticsService } from '@/domains/lifelock/analytics/services/xpAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    const todayData = await xpAnalyticsService.getTodayData(
      userId,
      date ? new Date(date) : new Date()
    );

    return NextResponse.json({
      success: true,
      data: todayData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in today XP API:', error);
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

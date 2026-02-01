import { NextRequest, NextResponse } from 'next/server';
import { getMarketByTicker } from '@/lib/db/markets';
import { getSnapshotsByMarketAndInterval } from '@/lib/db/snapshots';

/**
 * GET /api/markets/[marketTicker]/snapshots
 *
 * Query params:
 *   start - Start of time interval (ISO 8601 timestamp, inclusive). Required.
 *   end   - End of time interval (ISO 8601 timestamp, inclusive). Required.
 *
 * Returns all market_price_snapshots rows for the given Kalshi market ticker
 * within the specified time interval, ordered by timestamp ascending.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketTicker: string }> }
) {
  try {
    const { marketTicker } = await params;
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!marketTicker) {
      return NextResponse.json(
        { error: 'Missing market ticker' },
        { status: 400 }
      );
    }

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Query params "start" and "end" (ISO timestamps) are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start or end timestamp' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start must be before or equal to end' },
        { status: 400 }
      );
    }

    const market = await getMarketByTicker(marketTicker);
    if (!market) {
      return NextResponse.json(
        { error: `Market not found: ${marketTicker}` },
        { status: 404 }
      );
    }

    const snapshots = await getSnapshotsByMarketAndInterval(
      market.id,
      start,
      end
    );

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Snapshots API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

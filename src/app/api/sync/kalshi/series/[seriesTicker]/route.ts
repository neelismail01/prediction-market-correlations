/**
 * Syncs open events and markets for a Kalshi series and records market snapshots.
 * Idempotent: creates exchange, series, event, and market only when missing.
 * Use POST to trigger sync.
 */
import { NextResponse } from 'next/server';
import { syncKalshiSeries } from '@/src/app/services/sync/kalshi/syncSeries';

export async function POST(
  _request: Request,
  context: { params: Promise<{ seriesTicker: string }> }
) {
  try {
    const { seriesTicker } = await context.params;
    if (!seriesTicker?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing seriesTicker' },
        { status: 400 }
      );
    }

    const ticker = seriesTicker.trim();
    const data = await syncKalshiSeries(ticker);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

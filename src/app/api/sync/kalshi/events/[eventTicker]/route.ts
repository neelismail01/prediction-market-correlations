/**
 * Syncs a single Kalshi event (no series) and its markets, records market snapshots.
 * Idempotent: creates exchange and event only when missing; event has no series_id.
 * Use POST to trigger sync.
 */
import { NextResponse } from 'next/server';
import { syncKalshiEvent } from '@/src/app/services/sync/kalshi/syncEvent';

export async function POST(
  _request: Request,
  context: { params: Promise<{ eventTicker: string }> }
) {
  try {
    const { eventTicker } = await context.params;
    if (!eventTicker?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing eventTicker' },
        { status: 400 }
      );
    }

    const ticker = eventTicker.trim();
    const data = await syncKalshiEvent(ticker);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

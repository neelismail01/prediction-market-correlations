/**
 * Syncs a single Kalshi event (no series) and its markets, records market snapshots.
 * Idempotent: creates exchange and event only when missing; event is stored with series_id null.
 */
import {
  kalshiEventToEventInsertPayload,
  kalshiMarketToSnapshotPayload,
} from '@/src/app/services/sync/kalshi/mappers';
import {
  KALSHI_EXCHANGE_NAME,
  KALSHI_EXCHANGE_SLUG,
  SNAPSHOT_BATCH_SIZE,
} from '@/src/app/services/sync/kalshi/config';
import { fetchEventByTicker } from '@/src/app/services/externalApi/kalshi/events';
import { getEventByTicker, createEvent } from '@/src/app/services/db/events';
import { getOrCreateExchangeBySlug } from '@/src/app/services/db/exchanges';
import {
  insertMarketSnapshots,
  type SupabaseMarketSnapshotInsert,
} from '@/src/app/services/db/marketSnapshots';
import { getOrCreateMarketsBulk } from '@/src/app/services/sync/kalshi/marketSync';
import type { SupabaseEventRow } from '@/src/app/types/supabase';
import type { KalshiEvent } from '@/src/app/types/kalshi';

export interface SyncEventResult {
  eventsCount: number;
  marketsCount: number;
  snapshotsCreated: number;
  marketsCreated: number;
}

async function getOrCreateEvent(
  exchangeId: number,
  kalshiEvent: KalshiEvent
): Promise<SupabaseEventRow> {
  const existing = await getEventByTicker(kalshiEvent.event_ticker);
  if (existing) return existing;
  return createEvent(kalshiEventToEventInsertPayload(exchangeId, null, kalshiEvent));
}

/**
 * Syncs a single Kalshi event (no series) and its markets, records market snapshots.
 * Returns counts. Idempotent. Event is stored with series_id null.
 */
export async function syncKalshiEvent(eventTicker: string): Promise<SyncEventResult> {
  const exchange = await getOrCreateExchangeBySlug(KALSHI_EXCHANGE_SLUG, KALSHI_EXCHANGE_NAME);
  const exchangeId = exchange.id;

  const kalshiEvent = await fetchEventByTicker(eventTicker, { withNestedMarkets: true });
  const dbEvent = await getOrCreateEvent(exchangeId, kalshiEvent);

  const markets = kalshiEvent.markets ?? [];
  let snapshotsCreated = 0;
  let marketsCreated = 0;
  const snapshotPayloads: SupabaseMarketSnapshotInsert[] = [];

  const flushSnapshotBatch = async (): Promise<void> => {
    if (snapshotPayloads.length === 0) return;
    await insertMarketSnapshots(snapshotPayloads);
    snapshotsCreated += snapshotPayloads.length;
    snapshotPayloads.length = 0;
  };

  const entries = markets.map((market) => ({ eventId: dbEvent.id, market }));
  const { dbMarketsByTicker, createdCount } = await getOrCreateMarketsBulk(entries);
  marketsCreated = createdCount;

  for (const market of markets) {
    const dbMarket = dbMarketsByTicker.get(market.ticker);
    if (!dbMarket) {
      throw new Error(`Market missing after bulk upsert: ${market.ticker}`);
    }
    snapshotPayloads.push(kalshiMarketToSnapshotPayload(dbMarket.id, market));
    if (snapshotPayloads.length >= SNAPSHOT_BATCH_SIZE) {
      await flushSnapshotBatch();
    }
  }

  await flushSnapshotBatch();

  return {
    eventsCount: 1,
    marketsCount: markets.length,
    snapshotsCreated,
    marketsCreated,
  };
}

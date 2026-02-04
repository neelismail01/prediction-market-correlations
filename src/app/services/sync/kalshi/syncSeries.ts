/**
 * Syncs open events and markets for a Kalshi series and records market snapshots.
 * Idempotent: creates exchange, series, event, and market only when missing.
 */
import {
  kalshiEventToEventInsertPayload,
  kalshiMarketToSnapshotPayload,
  kalshiSeriesToSeriesInsertPayload,
  minimalSeriesInsertPayload,
} from '@/src/app/services/sync/kalshi/mappers';
import { KALSHI_EXCHANGE_NAME, KALSHI_EXCHANGE_SLUG, SNAPSHOT_BATCH_SIZE } from '@/src/app/services/sync/kalshi/config';
import { fetchEvents } from '@/src/app/services/externalApi/kalshi/events';
import { fetchSeriesByTicker } from '@/src/app/services/externalApi/kalshi/series';
import { getEventByTicker, createEvent } from '@/src/app/services/db/events';
import { getSeriesByTicker, createSeries } from '@/src/app/services/db/series';
import { getOrCreateExchangeBySlug } from '@/src/app/services/db/exchanges';
import { insertMarketSnapshots, type SupabaseMarketSnapshotInsert } from '@/src/app/services/db/marketSnapshots';
import { getOrCreateMarketsBulk, type MarketSyncEntry } from '@/src/app/services/sync/kalshi/marketSync';
import type { SupabaseEventRow, SupabaseSeriesRow } from '@/src/app/types/supabase';
import type { KalshiEvent } from '@/src/app/types/kalshi';

export interface SyncSeriesResult {
  eventsCount: number;
  marketsCount: number;
  snapshotsCreated: number;
  marketsCreated: number;
}

async function fetchAllOpenEventsWithMarkets(seriesTicker: string): Promise<KalshiEvent[]> {
  const events: KalshiEvent[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetchEvents({
      seriesTicker,
      status: 'open',
      withNestedMarkets: true,
      limit: 200,
      cursor,
    });
    events.push(...res.events);
    cursor = res.cursor && res.cursor !== '' ? res.cursor : undefined;
  } while (cursor);
  return events;
}

async function getOrCreateSeries(
  exchangeId: number,
  seriesTicker: string
): Promise<SupabaseSeriesRow> {
  const existing = await getSeriesByTicker(seriesTicker, exchangeId);
  if (existing) return existing;
  let payload: ReturnType<typeof minimalSeriesInsertPayload>;
  try {
    const kalshiSeries = await fetchSeriesByTicker(seriesTicker, { includeVolume: true });
    payload = kalshiSeriesToSeriesInsertPayload(exchangeId, kalshiSeries);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Kalshi series fetch failed for ${seriesTicker}, using minimal payload:`,
      msg
    );
    payload = minimalSeriesInsertPayload(exchangeId, seriesTicker);
  }
  return createSeries(payload);
}

async function getOrCreateEvent(
  exchangeId: number,
  dbSeries: SupabaseSeriesRow,
  kalshiEvent: KalshiEvent
): Promise<SupabaseEventRow> {
  const existing = await getEventByTicker(kalshiEvent.event_ticker);
  if (existing) return existing;
  return createEvent(kalshiEventToEventInsertPayload(exchangeId, dbSeries.id, kalshiEvent));
}

/**
 * Syncs all open events and markets for the given Kalshi series and records market snapshots.
 * Returns counts and market tickers. Idempotent.
 */
export async function syncKalshiSeries(seriesTicker: string): Promise<SyncSeriesResult> {
  const exchange = await getOrCreateExchangeBySlug(KALSHI_EXCHANGE_SLUG, KALSHI_EXCHANGE_NAME);
  const exchangeId = exchange.id;
  const dbSeries = await getOrCreateSeries(exchangeId, seriesTicker);

  const allEvents = await fetchAllOpenEventsWithMarkets(seriesTicker);
  let snapshotsCreated = 0;
  let marketsCreated = 0;
  let marketsCount = 0;
  const snapshotPayloads: SupabaseMarketSnapshotInsert[] = [];

  const flushSnapshotBatch = async (): Promise<void> => {
    if (snapshotPayloads.length === 0) return;
    await insertMarketSnapshots(snapshotPayloads);
    snapshotsCreated += snapshotPayloads.length;
    snapshotPayloads.length = 0;
  };

  const allEntries: MarketSyncEntry[] = [];
  for (const kalshiEvent of allEvents) {
    const dbEvent = await getOrCreateEvent(exchangeId, dbSeries, kalshiEvent);
    const markets = kalshiEvent.markets ?? [];
    marketsCount += markets.length;
    for (const market of markets) {
      allEntries.push({ eventId: dbEvent.id, market });
    }
  }

  const { dbMarketsByTicker, createdCount } = await getOrCreateMarketsBulk(allEntries);
  marketsCreated = createdCount;

  for (const entry of allEntries) {
    const dbMarket = dbMarketsByTicker.get(entry.market.ticker);
    if (!dbMarket) {
      throw new Error(`Market missing after bulk upsert: ${entry.market.ticker}`);
    }
    snapshotPayloads.push(kalshiMarketToSnapshotPayload(dbMarket.id, entry.market));
    if (snapshotPayloads.length >= SNAPSHOT_BATCH_SIZE) {
      await flushSnapshotBatch();
    }
  }

  await flushSnapshotBatch();

  return {
    eventsCount: allEvents.length,
    marketsCount,
    snapshotsCreated,
    marketsCreated,
  };
}

import { buildMarketInsertPayload } from '@/src/app/services/sync/kalshi/mappers';
import { createMarkets, getMarketsByTickers } from '@/src/app/services/db/markets';
import type { KalshiMarket } from '@/src/app/types/kalshi';
import type { SupabaseMarketRow } from '@/src/app/types/supabase';

export type MarketSyncEntry = { eventId: number; market: KalshiMarket };

export async function getOrCreateMarketsBulk(
  entries: MarketSyncEntry[]
): Promise<{ dbMarketsByTicker: Map<string, SupabaseMarketRow>; createdCount: number }> {
  if (entries.length === 0) {
    return { dbMarketsByTicker: new Map(), createdCount: 0 };
  }

  const tickers = [...new Set(entries.map((e) => e.market.ticker).filter(Boolean))];
  const existingList = await getMarketsByTickers(tickers);
  const existingMap = new Map<string, SupabaseMarketRow>(
    existingList.map((m) => [m.ticker, m])
  );

  const missingByTicker = new Map<string, MarketSyncEntry>();
  for (const e of entries) {
    const ticker = e.market.ticker;
    if (!ticker) continue;
    if (existingMap.has(ticker)) continue;
    if (!missingByTicker.has(ticker)) {
      missingByTicker.set(ticker, e);
    }
  }

  const missingEntries = [...missingByTicker.values()];
  const payloads = missingEntries.map((e) => buildMarketInsertPayload(e.eventId, e.market));

  let createdCount = 0;
  if (payloads.length > 0) {
    const created = await createMarkets(payloads);
    createdCount = created.length;
    for (const m of created) {
      existingMap.set(m.ticker, m);
    }
  }

  return { dbMarketsByTicker: existingMap, createdCount };
}


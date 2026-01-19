import { supabase } from '../supabase/client';
import type { KalshiMarket } from '../kalshi/types';

export interface MarketRecord {
  id?: number;
  market_ticker: string;
  event_id: number;
  title: string | null;
  status: string;
}

/**
 * Upserts a market record (inserts if new, updates if exists)
 * Requires event_id (look it up first using event_ticker)
 * Returns the market ID
 */
export async function upsertMarket(
  market: KalshiMarket,
  eventId: number
): Promise<number> {
  const marketRecord: MarketRecord = {
    market_ticker: market.ticker,
    event_id: eventId,
    title: market.title || null,
    status: market.status,
  };

  const { data, error } = await supabase
    .from('markets')
    .upsert(
      {
        ...marketRecord,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'market_ticker',
      }
    )
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to upsert market: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error('Failed to get market ID after upsert');
  }

  return data.id;
}

/**
 * Upserts multiple markets in a batch
 * Requires eventIdMap (event_ticker -> event_id)
 * Returns a map of market_ticker -> market_id
 */
export async function upsertMarkets(
  markets: KalshiMarket[],
  eventIdMap: Map<string, number>
): Promise<Map<string, number>> {
  if (markets.length === 0) {
    return new Map();
  }

  const marketRecords: MarketRecord[] = markets
    .map((market) => {
      const eventId = eventIdMap.get(market.event_ticker);
      if (!eventId) {
        throw new Error(
          `Event ID not found for event_ticker: ${market.event_ticker}`
        );
      }
      return {
        market_ticker: market.ticker,
        event_id: eventId,
        title: market.title || null,
        status: market.status,
      };
    })
    .filter((record): record is MarketRecord => record !== null);

  const now = new Date().toISOString();
  const recordsWithTimestamps = marketRecords.map((record) => ({
    ...record,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('markets')
    .upsert(recordsWithTimestamps, {
      onConflict: 'market_ticker',
    })
    .select('id, market_ticker');

  if (error) {
    throw new Error(`Failed to upsert markets: ${error.message}`);
  }

  // Create a map of market_ticker -> market_id
  const marketIdMap = new Map<string, number>();
  if (data) {
    for (const record of data) {
      if (record.id && record.market_ticker) {
        marketIdMap.set(record.market_ticker, record.id);
      }
    }
  }

  return marketIdMap;
}

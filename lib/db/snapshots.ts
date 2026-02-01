import { supabase } from '../supabase/client';

export interface MarketSnapshotRecord {
  market_id: number;
  timestamp: string; // ISO timestamp string
  yes_bid: number | null;
  yes_ask: number | null;
  last_price_dollars: number | null;
  yes_sub_title: string | null;
  volume: number | null;
  volume_24h: number | null;
}

/**
 * Inserts a new market price snapshot
 * Requires market_id (look it up first using market_ticker)
 */
export async function insertMarketSnapshot(
  snapshot: MarketSnapshotRecord
): Promise<void> {
  const { error } = await supabase
    .from('market_price_snapshots')
    .insert({
      market_id: snapshot.market_id,
      timestamp: snapshot.timestamp,
      yes_bid: snapshot.yes_bid,
      yes_ask: snapshot.yes_ask,
      last_price_dollars: snapshot.last_price_dollars,
      yes_sub_title: snapshot.yes_sub_title,
      volume: snapshot.volume,
      volume_24h: snapshot.volume_24h,
    });

  if (error) {
    throw new Error(`Failed to insert market snapshot: ${error.message}`);
  }
}

/**
 * Inserts multiple market snapshots in a batch
 * Requires market_id in each snapshot record
 */
export async function insertMarketSnapshots(
  snapshots: MarketSnapshotRecord[]
): Promise<void> {
  if (snapshots.length === 0) {
    return;
  }

  const records = snapshots.map((snapshot) => ({
    market_id: snapshot.market_id,
    timestamp: snapshot.timestamp,
    yes_bid: snapshot.yes_bid,
    yes_ask: snapshot.yes_ask,
    last_price_dollars: snapshot.last_price_dollars,
    yes_sub_title: snapshot.yes_sub_title,
    volume: snapshot.volume,
    volume_24h: snapshot.volume_24h,
  }));

  const { error } = await supabase
    .from('market_price_snapshots')
    .insert(records);

  if (error) {
    throw new Error(`Failed to insert market snapshots: ${error.message}`);
  }
}

export interface MarketSnapshotRow extends MarketSnapshotRecord {
  id: number;
  created_at: string;
}

/**
 * Fetches all market_price_snapshots rows for a given market within a time interval.
 * @param marketId - The market id (from markets.id)
 * @param start - Start of interval (ISO timestamp, inclusive)
 * @param end - End of interval (ISO timestamp, inclusive)
 */
export async function getSnapshotsByMarketAndInterval(
  marketId: number,
  start: string,
  end: string
): Promise<MarketSnapshotRow[]> {
  const { data, error } = await supabase
    .from('market_price_snapshots')
    .select('id, market_id, timestamp, yes_bid, yes_ask, last_price_dollars, yes_sub_title, volume, volume_24h, created_at')
    .eq('market_id', marketId)
    .gte('timestamp', start)
    .lte('timestamp', end)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch snapshots: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    market_id: row.market_id,
    timestamp: row.timestamp,
    yes_bid: row.yes_bid,
    yes_ask: row.yes_ask,
    last_price_dollars: row.last_price_dollars,
    yes_sub_title: row.yes_sub_title,
    volume: row.volume,
    volume_24h: row.volume_24h,
    created_at: row.created_at,
  }));
}

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

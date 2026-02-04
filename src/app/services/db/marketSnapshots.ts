import { supabase } from '@/src/app/lib/supabase/client';
import type { SupabaseMarketSnapshotRow, TablesInsert } from '@/src/app/types/supabase';

export type SupabaseMarketSnapshotInsert = TablesInsert<'market_snapshots'>;

export async function getMarketSnapshotsForMarket(marketId: number): Promise<SupabaseMarketSnapshotRow[]> {
    const { data, error } = await supabase
        .from('market_snapshots')
        .select('*')
        .eq('market_id', marketId);

    if (error) {
        throw error;
    }

    return data;
}

export async function insertMarketSnapshot(
    payload: SupabaseMarketSnapshotInsert
): Promise<SupabaseMarketSnapshotRow> {
    const { data, error } = await supabase
        .from('market_snapshots')
        .insert(payload)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function insertMarketSnapshots(
    payloads: SupabaseMarketSnapshotInsert[]
): Promise<SupabaseMarketSnapshotRow[]> {
    if (payloads.length === 0) {
        return [];
    }
    const { data, error } = await supabase
        .from('market_snapshots')
        .insert(payloads)
        .select();

    if (error) {
        throw error;
    }

    return data;
}
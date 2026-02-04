import { supabase } from '@/src/app/lib/supabase/client';
import type { SupabaseMarketRow, TablesInsert } from '@/src/app/types/supabase';
import { MARKET_GET_BATCH_SIZE, MARKET_INSERT_BATCH_SIZE } from '@/src/app/services/sync/kalshi/config';
import { chunk } from '@/src/app/lib/utils/utils';

export type SupabaseMarketInsert = TablesInsert<'markets'>;

export async function getMarkets(): Promise<SupabaseMarketRow[]> {
  const { data, error } = await supabase
    .from('markets')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}

export async function getMarketsByTickers(tickers: string[]): Promise<SupabaseMarketRow[]> {
  if (tickers.length === 0) return [];
  const uniqueTickers = [...new Set(tickers.filter(Boolean))];
  if (uniqueTickers.length === 0) return [];

  const batches = chunk(uniqueTickers, MARKET_GET_BATCH_SIZE);
  const out: SupabaseMarketRow[] = [];

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .in('ticker', batch);

    if (error) throw error;
    out.push(...(data ?? []));
  }

  return out;
}

export async function getMarketById(id: number): Promise<SupabaseMarketRow | null> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createMarkets(payloads: SupabaseMarketInsert[]): Promise<SupabaseMarketRow[]> {
  if (payloads.length === 0) return [];

  const batches = chunk(payloads, MARKET_INSERT_BATCH_SIZE);
  const out: SupabaseMarketRow[] = [];

  for (const batch of batches) {
    const { data, error } = await supabase
      .from('markets')
      .insert(batch)
      .select();

    if (error) throw error;
    out.push(...(data ?? []));
  }

  return out;
}

export async function createMarket(payload: SupabaseMarketInsert): Promise<SupabaseMarketRow> {
  const { data, error } = await supabase
    .from('markets')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMarketByTicker(ticker: string): Promise<SupabaseMarketRow | null> {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('ticker', ticker)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}
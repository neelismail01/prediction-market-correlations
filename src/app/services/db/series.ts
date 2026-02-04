import { supabase } from '@/src/app/lib/supabase/client';
import type { SupabaseSeriesRow, TablesInsert } from '@/src/app/types/supabase';

export type SupabaseSeriesInsert = TablesInsert<'series'>;

export async function getSeries(): Promise<SupabaseSeriesRow[]> {
  const { data, error } = await supabase
    .from('series')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}

export async function getSeriesById(id: number): Promise<SupabaseSeriesRow | null> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getSeriesByTicker(
  ticker: string,
  exchangeId?: number
): Promise<SupabaseSeriesRow | null> {
  let query = supabase.from('series').select('*').eq('ticker', ticker);
  if (exchangeId !== undefined) {
    query = query.eq('exchange_id', exchangeId);
  }
  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function createSeries(payload: SupabaseSeriesInsert): Promise<SupabaseSeriesRow> {
  const { data, error } = await supabase
    .from('series')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

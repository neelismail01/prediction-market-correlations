import { supabase } from '@/src/app/lib/supabase/client';
import type { SupabaseExchangeRow, TablesInsert } from '@/src/app/types/supabase';

export type SupabaseExchangeInsert = TablesInsert<'exchanges'>;

export async function getExchanges(): Promise<SupabaseExchangeRow[]> {
    const { data, error } = await supabase
        .from('exchanges')
        .select('*');

    if (error) {
        throw error;
    }

    return data;
}


export async function getExchangeBySlug(slug: string): Promise<SupabaseExchangeRow | null> {
  const { data, error } = await supabase
    .from('exchanges')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/** Idempotent: returns existing exchange by slug or creates one. */
export async function getOrCreateExchangeBySlug(
  slug: string,
  name: string
): Promise<SupabaseExchangeRow> {
  const existing = await getExchangeBySlug(slug);
  if (existing) return existing;
  return createExchange({ slug, name });
}

export async function createExchange(payload: SupabaseExchangeInsert): Promise<SupabaseExchangeRow> {
  const { data, error } = await supabase
    .from('exchanges')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
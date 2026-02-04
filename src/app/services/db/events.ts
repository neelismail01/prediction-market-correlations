import { supabase } from '@/src/app/lib/supabase/client';
import type { SupabaseEventInsert, SupabaseEventRow, SupabaseEventUpdate } from '@/src/app/types/supabase';

export async function getEvents(): Promise<SupabaseEventRow[]> {
    const { data, error } = await supabase
        .from('events')
        .select('*');

    if (error) {
        throw error;
    }

    return data;
}

export async function getEventByTicker(ticker: string): Promise<SupabaseEventRow | null> {
  const { data, error } = await supabase
    .from('events')
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

export async function createEvent(event: SupabaseEventInsert): Promise<SupabaseEventRow> {
    const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function updateEvent(event: SupabaseEventUpdate): Promise<SupabaseEventRow> {
    const { data, error } = await supabase
        .from('events')
        .update(event)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}
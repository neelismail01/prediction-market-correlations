import { supabase } from '../supabase/client';
import type { KalshiEvent } from '../kalshi/types';

export interface EventRecord {
  id?: number;
  event_ticker: string;
  series_id: number;
  title: string | null;
  sub_title: string | null;
}

/**
 * Upserts an event record (inserts if new, updates if exists)
 * Requires series_id to be provided (look it up first using getSeriesId from lib/db/series)
 * Returns the event ID
 */
export async function upsertEvent(
  event: KalshiEvent,
  seriesId: number
): Promise<number> {
  const eventRecord: EventRecord = {
    event_ticker: event.event_ticker,
    series_id: seriesId,
    title: event.title || null,
    sub_title: event.sub_title || null,
  };

  const { data, error } = await supabase
    .from('events')
    .upsert(
      {
        ...eventRecord,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'event_ticker',
      }
    )
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to upsert event: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error('Failed to get event ID after upsert');
  }

  return data.id;
}

/**
 * Upserts multiple events in a batch
 * Requires series_id to be provided (look it up first using getSeriesId from lib/db/series)
 * All events in the batch must belong to the same series
 * Returns a map of event_ticker -> id
 */
export async function upsertEvents(
  events: KalshiEvent[],
  seriesId: number
): Promise<Map<string, number>> {
  if (events.length === 0) {
    return new Map();
  }

  // Map events to event records with series_id
  const eventRecords: EventRecord[] = events.map((event) => ({
    event_ticker: event.event_ticker,
    series_id: seriesId,
    title: event.title || null,
    sub_title: event.sub_title || null,
  }));

  const now = new Date().toISOString();
  const recordsWithTimestamps = eventRecords.map((record) => ({
    ...record,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('events')
    .upsert(recordsWithTimestamps, {
      onConflict: 'event_ticker',
    })
    .select('id, event_ticker');

  if (error) {
    throw new Error(`Failed to upsert events: ${error.message}`);
  }

  // Create a map of event_ticker -> id
  const eventIdMap = new Map<string, number>();
  if (data) {
    for (const record of data) {
      if (record.id && record.event_ticker) {
        eventIdMap.set(record.event_ticker, record.id);
      }
    }
  }

  return eventIdMap;
}

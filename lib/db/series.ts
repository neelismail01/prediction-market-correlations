import { supabase } from '../supabase/client';

/**
 * Looks up the series_id from the series table using series_ticker
 * Returns the series_id or throws an error if not found
 */
export async function getSeriesId(seriesTicker: string): Promise<number> {
  const { data, error } = await supabase
    .from('series')
    .select('id')
    .eq('series_ticker', seriesTicker)
    .single();

  if (error) {
    throw new Error(`Failed to lookup series_id for series_ticker ${seriesTicker}: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error(`Series not found for series_ticker: ${seriesTicker}`);
  }

  return data.id;
}


import type {
  KalshiGetSeriesOptions,
  KalshiGetSeriesResponse,
  KalshiSeries,
} from '@/src/app/types/kalshi';

const KALSHI_API_BASE = process.env.KALSHI_API_BASE_URL || '';

export async function fetchSeriesByTicker(
  seriesTicker: string,
  options: KalshiGetSeriesOptions = {}
): Promise<KalshiSeries> {
  const { includeVolume = false } = options;
  const url = new URL(`${KALSHI_API_BASE}/series/${encodeURIComponent(seriesTicker)}`);
  if (includeVolume) {
    url.searchParams.set('include_volume', 'true');
  }

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Kalshi get series failed (${res.status}): ${body || res.statusText}`
      );
    }

    const data = (await res.json()) as KalshiGetSeriesResponse;
    return data.series;
  } catch (err) {
    throw new Error(
      `Kalshi get series failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

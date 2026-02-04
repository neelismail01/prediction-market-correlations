import type { KalshiMarket, KalshiGetMarketResponse } from '@/src/app/types/kalshi';

const KALSHI_API_BASE = process.env.KALSHI_API_BASE_URL || '';

export async function fetchMarketByTicker(
  marketTicker: string
): Promise<KalshiMarket> {
  const url = new URL(
    `${KALSHI_API_BASE}/markets/${encodeURIComponent(marketTicker)}`
  );

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
        `Kalshi get market failed (${res.status}): ${body || res.statusText}`
      );
    }

    const data = (await res.json()) as KalshiGetMarketResponse;
    return data.market;
  } catch (err) {
    throw new Error(
      `Kalshi get market failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

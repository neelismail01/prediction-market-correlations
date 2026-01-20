import type {
  KalshiMarketResponse,
  KalshiEventsResponse,
  KalshiMarketsResponse,
} from './types';

// Kalshi API base URL - can be overridden with environment variable
const KALSHI_API_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

const FETCH_TIMEOUT = 10000; // 10 seconds

/**
 * Fetches active events for a given series ticker
 */
export async function fetchActiveEvents(
  seriesTicker: string
): Promise<KalshiEventsResponse> {
  const url = `${KALSHI_API_BASE_URL}/events?series_ticker=${encodeURIComponent(
    seriesTicker
  )}&status=open`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!response.ok) {
    if (response.status === 404) {
      // No events found for this series - return empty array
      return { events: [] };
    }
    throw new Error(
      `Kalshi API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetches all markets for a given event ticker
 */
export async function fetchMarketsForEvent(
  eventTicker: string
): Promise<KalshiMarketsResponse> {
  const url = `${KALSHI_API_BASE_URL}/markets?event_ticker=${encodeURIComponent(
    eventTicker
  )}&status=open`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!response.ok) {
    if (response.status === 404) {
      // No markets found for this event - return empty array
      return { markets: [] };
    }
    throw new Error(
      `Kalshi API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetches current pricing data for a specific market ticker
 */
export async function fetchMarketPricing(
  marketTicker: string
): Promise<KalshiMarketResponse> {
  const url = `${KALSHI_API_BASE_URL}/markets/${encodeURIComponent(
    marketTicker
  )}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(
      `Kalshi API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

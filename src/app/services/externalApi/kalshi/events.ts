import type {
  KalshiEvent,
  KalshiGetEventOptions,
  KalshiGetEventResponse,
  KalshiGetEventsOptions,
  KalshiGetEventsResponse,
} from '@/src/app/types/kalshi';

const KALSHI_API_BASE = process.env.KALSHI_API_BASE_URL || '';

export async function fetchEvents(
  options: KalshiGetEventsOptions = {}
): Promise<KalshiGetEventsResponse> {
  const url = new URL(`${KALSHI_API_BASE}/events`);

  if (options.limit != null) {
    url.searchParams.set('limit', String(Math.min(200, Math.max(1, options.limit))));
  }
  if (options.cursor != null && options.cursor !== '') {
    url.searchParams.set('cursor', options.cursor);
  }
  if (options.withNestedMarkets === true) {
    url.searchParams.set('with_nested_markets', 'true');
  }
  if (options.withMilestones === true) {
    url.searchParams.set('with_milestones', 'true');
  }
  if (options.status != null) {
    url.searchParams.set('status', options.status);
  }
  if (options.seriesTicker != null && options.seriesTicker !== '') {
    url.searchParams.set('series_ticker', options.seriesTicker);
  }
  if (options.minCloseTs != null) {
    url.searchParams.set('min_close_ts', String(options.minCloseTs));
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
        `Kalshi get events failed (${res.status}): ${body || res.statusText}`
      );
    }

    const data = (await res.json()) as KalshiGetEventsResponse;
    return data;
  } catch (err) {
    throw new Error(
      `Kalshi get events failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function fetchEventByTicker(
  eventTicker: string,
  options: KalshiGetEventOptions = {}
): Promise<KalshiEvent> {
  const { withNestedMarkets = false } = options;
  const url = new URL(`${KALSHI_API_BASE}/events/${encodeURIComponent(eventTicker)}`);
  if (withNestedMarkets) {
    url.searchParams.set('with_nested_markets', 'true');
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
        `Kalshi get event failed (${res.status}): ${body || res.statusText}`
      );
    }

    const data = (await res.json()) as KalshiGetEventResponse;
    return data.event;
  } catch (err) {
    throw new Error(
      `Kalshi get event failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

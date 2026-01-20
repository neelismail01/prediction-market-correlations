import { NextRequest, NextResponse } from 'next/server';
import {
  fetchActiveEvents,
  fetchMarketsForEvent,
  fetchMarketPricing,
} from '@/lib/kalshi/api';
import { upsertEvents } from '@/lib/db/events';
import { upsertMarkets } from '@/lib/db/markets';
import { insertMarketSnapshots } from '@/lib/db/snapshots';
import type { KalshiEvent, KalshiMarket } from '@/lib/kalshi/types';

interface SeriesSyncResponse {
  success: boolean;
  series_ticker: string;
  eventsFetched: number;
  eventsUpserted: number;
  marketsFetched: number;
  marketsUpserted: number;
  snapshotsCreated: number;
  errors: Array<{ type: string; message: string; context?: string }>;
}

/**
 * GET /api/kalshi/series/[seriesTicker]
 * Syncs all events, markets, and pricing data for a specific series
 *
 * Path parameter:
 * - seriesTicker: The series ticker to sync (e.g., "KXPREZ")
 *
 * Example: GET /api/kalshi/series/KXPREZ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { seriesTicker: string } }
) {
  const startTime = Date.now();
  const seriesTicker = params.seriesTicker;

  if (!seriesTicker || seriesTicker.trim() === '') {
    console.error('[SYNC] Missing series ticker parameter');
    return NextResponse.json<{ error: string; message: string }>(
      {
        error: 'Bad Request',
        message: 'Missing or empty series ticker parameter.',
      },
      { status: 400 }
    );
  }

  console.log(`[SYNC] [${seriesTicker}] Starting series sync...`);

  const errors: Array<{ type: string; message: string; context?: string }> =
    [];
  let eventsFetched = 0;
  let eventsUpserted = 0;
  let marketsFetched = 0;
  let marketsUpserted = 0;
  let snapshotsCreated = 0;

  try {
    // Step 1: Fetch active events for this series
    console.log(`[SYNC] [${seriesTicker}] Fetching active events...`);
    let events: KalshiEvent[] = [];
    try {
      const eventsResponse = await fetchActiveEvents(seriesTicker);
      events = eventsResponse.events || [];
      eventsFetched = events.length;
      console.log(`[SYNC] [${seriesTicker}] ✓ Fetched ${events.length} events`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SYNC] [${seriesTicker}] ✗ Failed to fetch events: ${errorMessage}`);
      return NextResponse.json<SeriesSyncResponse>(
        {
          success: false,
          series_ticker: seriesTicker,
          eventsFetched: 0,
          eventsUpserted: 0,
          marketsFetched: 0,
          marketsUpserted: 0,
          snapshotsCreated: 0,
          errors: [
            {
              type: 'fetch_events',
              message: `Failed to fetch events for series ${seriesTicker}: ${errorMessage}`,
              context: seriesTicker,
            },
          ],
        },
        { status: 500 }
      );
    }

    // Step 2: Upsert events to database and get event ID map
    let eventIdMap = new Map<string, number>();
    if (events.length > 0) {
      console.log(`[SYNC] [${seriesTicker}] Upserting ${events.length} events to database...`);
      try {
        eventIdMap = await upsertEvents(events);
        eventsUpserted = events.length;
        console.log(`[SYNC] [${seriesTicker}] ✓ Upserted ${events.length} events`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Failed to upsert events: ${errorMessage}`);
        errors.push({
          type: 'upsert_events',
          message: `Failed to upsert events for series ${seriesTicker}: ${errorMessage}`,
          context: seriesTicker,
        });
        // Continue processing markets even if event upsert failed
        // (will fail later when trying to upsert markets without event IDs)
      }
    }

    // Step 3: Fetch markets for each event
    console.log(`[SYNC] [${seriesTicker}] Fetching markets for ${events.length} events...`);
    const allMarkets: KalshiMarket[] = [];
    for (const event of events) {
      try {
        const marketsResponse = await fetchMarketsForEvent(
          event.event_ticker
        );
        const markets = marketsResponse.markets || [];
        allMarkets.push(...markets);
        marketsFetched += markets.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Failed to fetch markets for event ${event.event_ticker}: ${errorMessage}`);
        errors.push({
          type: 'fetch_markets',
          message: `Failed to fetch markets for event ${event.event_ticker}: ${errorMessage}`,
          context: `${seriesTicker}/${event.event_ticker}`,
        });
        // Continue with next event
      }
    }
    console.log(`[SYNC] [${seriesTicker}] ✓ Fetched ${allMarkets.length} total markets`);

    // Step 4: Upsert markets to database and get market ID map
    let marketIdMap = new Map<string, number>();
    if (allMarkets.length > 0) {
      console.log(`[SYNC] [${seriesTicker}] Upserting ${allMarkets.length} markets to database...`);
      try {
        marketIdMap = await upsertMarkets(allMarkets, eventIdMap);
        marketsUpserted = allMarkets.length;
        console.log(`[SYNC] [${seriesTicker}] ✓ Upserted ${allMarkets.length} markets`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Failed to upsert markets: ${errorMessage}`);
        errors.push({
          type: 'upsert_markets',
          message: `Failed to upsert markets for series ${seriesTicker}: ${errorMessage}`,
          context: seriesTicker,
        });
        // Continue processing pricing even if market upsert failed
        // (will fail later when trying to insert snapshots without market IDs)
      }
    }

    // Step 5: Fetch pricing data for each market and create snapshots
    console.log(`[SYNC] [${seriesTicker}] Fetching pricing data for ${allMarkets.length} markets...`);
    const snapshots: Array<{
      market_id: number;
      timestamp: string;
      yes_bid: number | null;
      yes_ask: number | null;
      last_price_dollars: number | null;
      yes_sub_title: string | null;
      volume: number | null;
      volume_24h: number | null;
    }> = [];

    for (const market of allMarkets) {
      const marketId = marketIdMap.get(market.ticker);
      if (!marketId) {
        errors.push({
          type: 'missing_market_id',
          message: `Market ID not found for market ${market.ticker}, skipping snapshot`,
          context: market.ticker,
        });
        continue;
      }

      try {
        const pricingResponse = await fetchMarketPricing(market.ticker);
        const marketData = pricingResponse.market;

        snapshots.push({
          market_id: marketId,
          timestamp: new Date().toISOString(),
          yes_bid: marketData.yes_bid_dollars ?? null,
          yes_ask: marketData.yes_ask_dollars ?? null,
          last_price_dollars: marketData.last_price_dollars ?? null,
          yes_sub_title: marketData.yes_sub_title ?? null,
          volume: marketData.volume ?? null,
          volume_24h: marketData.volume_24h ?? null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Failed to fetch pricing for market ${market.ticker}: ${errorMessage}`);
        errors.push({
          type: 'fetch_pricing',
          message: `Failed to fetch pricing for market ${market.ticker}: ${errorMessage}`,
          context: market.ticker,
        });
        // Continue with next market
      }
    }
    console.log(`[SYNC] [${seriesTicker}] ✓ Fetched pricing for ${snapshots.length} markets`);

    // Step 6: Insert snapshots in batches
    if (snapshots.length > 0) {
      console.log(`[SYNC] [${seriesTicker}] Inserting ${snapshots.length} price snapshots...`);
      try {
        // Insert in batches of 100 to avoid overwhelming the database
        const batchSize = 100;
        const batchCount = Math.ceil(snapshots.length / batchSize);
        for (let i = 0; i < snapshots.length; i += batchSize) {
          const batch = snapshots.slice(i, i + batchSize);
          await insertMarketSnapshots(batch);
          snapshotsCreated += batch.length;
          console.log(`[SYNC] [${seriesTicker}] Inserted batch ${Math.floor(i / batchSize) + 1}/${batchCount} (${batch.length} snapshots)`);
        }
        console.log(`[SYNC] [${seriesTicker}] ✓ Inserted ${snapshotsCreated} snapshots`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Failed to insert snapshots: ${errorMessage}`);
        errors.push({
          type: 'insert_snapshots',
          message: `Failed to insert snapshots for series ${seriesTicker}: ${errorMessage}`,
          context: seriesTicker,
        });
      }
    }

    const duration = Date.now() - startTime;
    const response: SeriesSyncResponse = {
      success: errors.length === 0,
      series_ticker: seriesTicker,
      eventsFetched,
      eventsUpserted,
      marketsFetched,
      marketsUpserted,
      snapshotsCreated,
      errors,
    };

    console.log(`[SYNC] [${seriesTicker}] ✓ Completed in ${duration}ms`);
    console.log(`[SYNC] [${seriesTicker}] Summary: ${eventsUpserted} events, ${marketsUpserted} markets, ${snapshotsCreated} snapshots`);
    if (errors.length > 0) {
      console.warn(`[SYNC] [${seriesTicker}] ⚠ Completed with ${errors.length} error(s)`);
    }

    return NextResponse.json<SeriesSyncResponse>(response, {
      status: errors.length === 0 ? 200 : 207, // 207 Multi-Status if partial success
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - startTime;
    console.error(`[SYNC] [${seriesTicker}] ✗ Unexpected error after ${duration}ms:`, error);

    return NextResponse.json<SeriesSyncResponse>(
      {
        success: false,
        series_ticker: seriesTicker,
        eventsFetched: 0,
        eventsUpserted: 0,
        marketsFetched: 0,
        marketsUpserted: 0,
        snapshotsCreated: 0,
        errors: [
          {
            type: 'unexpected_error',
            message: `Unexpected error: ${errorMessage}`,
            context: seriesTicker,
          },
        ],
      },
      { status: 500 }
    );
  }
}

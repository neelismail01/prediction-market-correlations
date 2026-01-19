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

interface SyncResponse {
  success: boolean;
  seriesProcessed: number;
  eventsFetched: number;
  eventsUpserted: number;
  marketsFetched: number;
  marketsUpserted: number;
  snapshotsCreated: number;
  errors: Array<{ type: string; message: string; context?: string }>;
}

/**
 * GET /api/kalshi/sync
 * Syncs active events, markets, and pricing data from Kalshi to Supabase
 *
 * Reads series tickers from KALSHI_SERIES_TICKERS environment variable
 * (comma-separated list, e.g., "KXPREZ,KXHIGHNY")
 *
 * Example: GET /api/kalshi/sync
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[SYNC] Starting Kalshi sync process...');

  const errors: Array<{ type: string; message: string; context?: string }> =
    [];
  let seriesProcessed = 0;
  let eventsFetched = 0;
  let eventsUpserted = 0;
  let marketsFetched = 0;
  let marketsUpserted = 0;
  let snapshotsCreated = 0;

  try {
    // Get series tickers from environment variable
    const seriesTickersEnv = process.env.KALSHI_SERIES_TICKERS;
    if (!seriesTickersEnv || seriesTickersEnv.trim() === '') {
      console.error('[SYNC] Configuration error: KALSHI_SERIES_TICKERS not set');
      return NextResponse.json<{ error: string; message: string }>(
        {
          error: 'Configuration Error',
          message:
            'KALSHI_SERIES_TICKERS environment variable is not set. Please configure it with comma-separated series tickers.',
        },
        { status: 500 }
      );
    }

    const seriesTickers = seriesTickersEnv.split(',').map((t) => t.trim());
    console.log(`[SYNC] Processing ${seriesTickers.length} series: ${seriesTickers.join(', ')}`);

    // Process each series
    for (const seriesTicker of seriesTickers) {
      if (!seriesTicker) continue;

      const seriesStartTime = Date.now();
      console.log(`[SYNC] [${seriesTicker}] Starting series processing...`);

      try {
        // Step 1: Fetch active events for this series
        console.log(`[SYNC] [${seriesTicker}] Fetching active events...`);
        let events: KalshiEvent[] = [];
        try {
          const eventsResponse = await fetchActiveEvents(seriesTicker);
          events = eventsResponse.events || [];
          eventsFetched += events.length;
          console.log(`[SYNC] [${seriesTicker}] ✓ Fetched ${events.length} events`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            type: 'fetch_events',
            message: `Failed to fetch events for series ${seriesTicker}: ${errorMessage}`,
            context: seriesTicker,
          });
          continue; // Skip to next series
        }

        // Step 2: Upsert events to database and get event ID map
        let eventIdMap = new Map<string, number>();
        if (events.length > 0) {
          console.log(`[SYNC] [${seriesTicker}] Upserting ${events.length} events to database...`);
          try {
            eventIdMap = await upsertEvents(events);
            eventsUpserted += events.length;
            console.log(`[SYNC] [${seriesTicker}] ✓ Upserted ${events.length} events`);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
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
            marketsUpserted += allMarkets.length;
            console.log(`[SYNC] [${seriesTicker}] ✓ Upserted ${allMarkets.length} markets`);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
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
            console.log(`[SYNC] [${seriesTicker}] ✓ Inserted ${snapshots.length} snapshots`);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            errors.push({
              type: 'insert_snapshots',
              message: `Failed to insert snapshots for series ${seriesTicker}: ${errorMessage}`,
              context: seriesTicker,
            });
          }
        }

        seriesProcessed++;
        const seriesDuration = Date.now() - seriesStartTime;
        console.log(`[SYNC] [${seriesTicker}] ✓ Completed in ${seriesDuration}ms`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[SYNC] [${seriesTicker}] ✗ Error: ${errorMessage}`);
        errors.push({
          type: 'series_processing',
          message: `Failed to process series ${seriesTicker}: ${errorMessage}`,
          context: seriesTicker,
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const response: SyncResponse = {
      success: errors.length === 0,
      seriesProcessed,
      eventsFetched,
      eventsUpserted,
      marketsFetched,
      marketsUpserted,
      snapshotsCreated,
      errors,
    };

    console.log(`[SYNC] ✓ Sync completed in ${totalDuration}ms`);
    console.log(`[SYNC] Summary: ${seriesProcessed} series, ${eventsUpserted} events, ${marketsUpserted} markets, ${snapshotsCreated} snapshots`);
    if (errors.length > 0) {
      console.warn(`[SYNC] ⚠ Completed with ${errors.length} error(s)`);
    }

    return NextResponse.json<SyncResponse>(response, {
      status: errors.length === 0 ? 200 : 207, // 207 Multi-Status if partial success
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const totalDuration = Date.now() - startTime;
    console.error(`[SYNC] ✗ Unexpected error after ${totalDuration}ms:`, error);

    return NextResponse.json<{ error: string; message: string }>(
      {
        error: 'Internal Server Error',
        message: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
